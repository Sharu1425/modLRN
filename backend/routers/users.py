from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from bson import ObjectId

from database import get_db
from models.schemas import UserCreate, UserResponse, UserSettings, SettingsResponse
from models.models import UserModel
from routers.auth import get_current_user_id, create_access_token

router = APIRouter()

@router.post("/users/register")
async def register_user(user_data: UserCreate):
    """Register a new user"""
    try:
        db = await get_db()
        
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Hash password
        hashed_password = UserModel.hash_password(user_data.password)
        
        # Create user document
        user_doc = {
            "username": user_data.username,
            "email": user_data.email,
            "password": hashed_password,
            "is_admin": False,
            "google_id": user_data.google_id,
            "name": user_data.name,
            "profile_picture": user_data.profile_picture,
            "face_descriptor": None
        }
        
        result = await db.users.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        
        # Create access token
        access_token = create_access_token(
            data={"sub": str(result.inserted_id), "email": user_data.email}
        )
        
        return {
            "success": True,
            "message": "User registered successfully",
            "access_token": access_token,
            "user": {
                "id": str(result.inserted_id),
                "email": user_data.email,
                "username": user_data.username,
                "name": user_data.name,
                "profile_picture": user_data.profile_picture
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/users/login")
async def login_user(user_data: dict):
    """Login with email and password"""
    try:
        db = await get_db()
        
        # Find user by email
        user = await db.users.find_one({"email": user_data["email"]})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Verify password
        if not UserModel.verify_password(user_data["password"], user["password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Create access token
        access_token = create_access_token(
            data={"sub": str(user["_id"]), "email": user["email"]}
        )
        
        return {
            "success": True,
            "message": "Login successful",
            "access_token": access_token,
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "username": user.get("username"),
                "name": user.get("name"),
                "profile_picture": user.get("profile_picture"),
                "is_admin": user.get("is_admin", False)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/{user_id}")
async def get_user(user_id: str, current_user_id: str = Depends(get_current_user_id)):
    """Get user profile"""
    try:
        # Ensure user can only access their own profile
        if user_id != current_user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        db = await get_db()
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "success": True,
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "username": user.get("username"),
                "name": user.get("name"),
                "profile_picture": user.get("profile_picture"),
                "is_admin": user.get("is_admin", False),
                "has_face_descriptor": bool(user.get("face_descriptor"))
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    user_data: dict,
    current_user_id: str = Depends(get_current_user_id)
):
    """Update user profile"""
    try:
        # Ensure user can only update their own profile
        if user_id != current_user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        db = await get_db()
        
        # Validate user exists
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Prepare update data (only allow certain fields to be updated)
        update_data = {}
        allowed_fields = ["username", "name", "profile_picture"]
        
        for field in allowed_fields:
            if field in user_data:
                update_data[field] = user_data[field]
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No valid fields to update")
        
        # Update user
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="No changes made")
        
        return {
            "success": True,
            "message": "User updated successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user_id: str = Depends(get_current_user_id)):
    """Delete user account"""
    try:
        # Ensure user can only delete their own account
        if user_id != current_user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        db = await get_db()
        
        # Validate user exists
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Delete user and all associated data
        await db.users.delete_one({"_id": ObjectId(user_id)})
        await db.results.delete_many({"user_id": ObjectId(user_id)})
        
        return {
            "success": True,
            "message": "User account deleted successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/{user_id}/stats")
async def get_user_stats(user_id: str, current_user_id: str = Depends(get_current_user_id)):
    """Get user statistics"""
    try:
        # Ensure user can only access their own stats
        if user_id != current_user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        db = await get_db()
        
        # Get user's results
        results = await db.results.find({"user_id": ObjectId(user_id)}).to_list(None)
        
        # Calculate stats
        total_assessments = len(results)
        total_questions = sum(r["total_questions"] for r in results)
        total_score = sum(r["score"] for r in results)
        average_score = total_score / total_assessments if total_assessments > 0 else 0
        
        # Get unique topics
        topics = list(set(r["topic"] for r in results))
        
        # Get difficulty distribution
        difficulty_stats = {}
        for result in results:
            diff = result["difficulty"]
            if diff not in difficulty_stats:
                difficulty_stats[diff] = {"count": 0, "total_score": 0}
            difficulty_stats[diff]["count"] += 1
            difficulty_stats[diff]["total_score"] += result["score"]
        
        # Calculate average scores by difficulty
        for diff in difficulty_stats:
            count = difficulty_stats[diff]["count"]
            total = difficulty_stats[diff]["total_score"]
            difficulty_stats[diff]["average_score"] = total / count if count > 0 else 0
        
        return {
            "success": True,
            "stats": {
                "total_assessments": total_assessments,
                "total_questions": total_questions,
                "average_score": round(average_score, 2),
                "topics_covered": len(topics),
                "topics": topics,
                "difficulty_stats": difficulty_stats
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users")
async def get_all_users(current_user_id: str = Depends(get_current_user_id)):
    """Get all users (for face recognition)"""
    try:
        db = await get_db()
        
        # Get all users with face descriptors
        users = await db.users.find(
            {"face_descriptor": {"$exists": True, "$ne": None}},
            {"_id": 1, "name": 1, "email": 1, "face_descriptor": 1}
        ).to_list(None)
        
        # Format response
        formatted_users = []
        for user in users:
            formatted_users.append({
                "id": str(user["_id"]),
                "name": user.get("name"),
                "email": user.get("email"),
                "face_descriptor": user.get("face_descriptor")
            })
        
        return {
            "success": True,
            "users": formatted_users
        }
        
    except Exception as e:
        print(f"Error fetching users: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch users: {str(e)}"
        )

@router.post("/users/{user_id}/change-password")
async def change_password(
    user_id: str,
    password_data: dict,
    current_user_id: str = Depends(get_current_user_id)
):
    """Change user password"""
    try:
        # Ensure user can only change their own password
        if user_id != current_user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        db = await get_db()
        
        # Validate user exists
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Validate password data
        if "current_password" not in password_data or "new_password" not in password_data:
            raise HTTPException(status_code=400, detail="Missing password fields")
        
        # Verify current password
        if not UserModel.verify_password(password_data["current_password"], user["password"]):
            raise HTTPException(status_code=401, detail="Current password is incorrect")
        
        # Hash new password
        new_hashed_password = UserModel.hash_password(password_data["new_password"])
        
        # Update password
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"password": new_hashed_password}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Failed to update password")
        
        return {
            "success": True,
            "message": "Password changed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/settings")
async def save_user_settings(
    settings: UserSettings,
    current_user_id: str = Depends(get_current_user_id)
):
    """Save user settings"""
    try:
        # Ensure user can only save their own settings
        if settings.userId != current_user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        db = await get_db()
        
        # Validate user exists
        user = await db.users.find_one({"_id": ObjectId(current_user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Save settings to database
        result = await db.users.update_one(
            {"_id": ObjectId(current_user_id)},
            {"$set": {"settings": settings.dict()}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Failed to save settings")
        
        return {
            "success": True,
            "message": "Settings saved successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/settings/{user_id}")
async def get_user_settings(
    user_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """Get user settings"""
    try:
        # Ensure user can only access their own settings
        if user_id != current_user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        db = await get_db()
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        settings = user.get("settings", {})
        
        return {
            "success": True,
            "settings": settings
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 