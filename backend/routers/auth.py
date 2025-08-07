from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import RedirectResponse
import httpx
import os
from typing import Optional
import numpy as np
from jose import JWTError, jwt
from datetime import datetime, timedelta

from database import get_db
from models.schemas import UserCreate, UserLogin, UserResponse, FaceLoginRequest
from models.models import UserModel
from utils.auth_utils import create_access_token, verify_token, euclidean_distance

router = APIRouter()
security = HTTPBearer()

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Google OAuth settings
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = "http://localhost:5001/auth/google/callback"

# In-memory session storage (in production, use Redis or database)
sessions = {}

async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[str]:
    """Get current user ID from JWT token"""
    try:
        print(f"🔍 Verifying token: {credentials.credentials[:20]}...")
        payload = verify_token(credentials.credentials)
        user_id = payload.get("sub")
        if user_id is None:
            print("❌ No user_id in token payload")
            raise HTTPException(status_code=401, detail="Invalid token")
        print(f"✅ Token verified for user: {user_id}")
        return str(user_id)  # Ensure it's a string
    except JWTError as e:
        print(f"❌ JWT verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        print(f"❌ Unexpected error in token verification: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/register")
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

@router.post("/login")
async def login_user(user_data: UserLogin):
    """Login with email and password"""
    try:
        db = await get_db()
        
        # Find user by email
        user = await db.users.find_one({"email": user_data.email})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Verify password
        if not UserModel.verify_password(user_data.password, user["password"]):
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
                "profile_picture": user.get("profile_picture")
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/face")
async def face_login(face_data: FaceLoginRequest):
    """Login using face recognition"""
    try:
        print(f"🔍 Face login request received")
        print(f"🔍 Face descriptor type: {type(face_data.face_descriptor)}")
        print(f"🔍 Face descriptor length: {len(face_data.face_descriptor)}")
        print(f"🔍 First few values: {face_data.face_descriptor[:5]}")
        
        # Validate face descriptor
        if not face_data.face_descriptor or len(face_data.face_descriptor) != 128:
            print("❌ Invalid face descriptor length")
            raise HTTPException(status_code=400, detail="Invalid face descriptor format")
        
        db = await get_db()
        
        # Get all users with valid face descriptors (not null)
        users_with_faces = await db.users.find({
            "face_descriptor": {"$exists": True, "$ne": None}
        }).to_list(None)
        print(f"🔍 Found {len(users_with_faces)} users with face descriptors")
        
        if not users_with_faces:
            print("❌ No registered faces found")
            raise HTTPException(
                status_code=401, 
                detail="No registered faces found. Please register your face first in your profile settings."
            )
        
        # Find best match
        best_match = None
        best_distance = float('inf')
        threshold = 0.8  # Increased threshold for better face recognition accuracy
        
        for user in users_with_faces:
            if user.get("face_descriptor") and user["face_descriptor"] is not None:
                print(f"🔍 Comparing with user: {user.get('email', 'Unknown')}")
                print(f"🔍 User face descriptor type: {type(user['face_descriptor'])}")
                print(f"🔍 User face descriptor length: {len(user['face_descriptor'])}")
                
                distance = euclidean_distance(face_data.face_descriptor, user["face_descriptor"])
                print(f"🔍 Distance: {distance}")
                
                if distance < best_distance:
                    best_distance = distance
                    best_match = user
            else:
                print(f"🔍 Skipping user {user.get('email', 'Unknown')} - no valid face descriptor")
        
        print(f"🔍 Best match: {best_match.get('email', 'None') if best_match else 'None'}")
        print(f"🔍 Best distance: {best_distance}")
        
        if not best_match or best_distance >= threshold:
            print("❌ Face recognition failed - no match found or distance too high")
            raise HTTPException(status_code=401, detail="Face recognition failed")
        
        # Create access token
        access_token = create_access_token(
            data={"sub": str(best_match["_id"]), "email": best_match["email"]}
        )
        
        print(f"✅ Face login successful for user: {best_match['email']}")
        return {
            "success": True,
            "message": "Face login successful",
            "access_token": access_token,
            "user": {
                "id": str(best_match["_id"]),
                "email": best_match["email"],
                "username": best_match.get("username"),
                "name": best_match.get("name"),
                "profile_picture": best_match.get("profile_picture")
            }
        }
    except Exception as e:
        print(f"❌ Face login error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/face-status")
async def get_face_status(user_id: str = Depends(get_current_user_id)):
    """Check if user has registered face"""
    try:
        print(f"🔍 Checking face status for user: {user_id}")
        
        db = await get_db()
        from bson import ObjectId
        
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        has_face = user.get("face_descriptor") is not None and len(user.get("face_descriptor", [])) == 128
        
        print(f"🔍 User has registered face: {has_face}")
        
        return {
            "success": True,
            "has_face": has_face
        }
    except Exception as e:
        print(f"❌ Face status check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/register-face")
async def register_face(face_data: FaceLoginRequest, user_id: str = Depends(get_current_user_id)):
    """Register face descriptor for user"""
    try:
        print(f"🔍 Register face request received for user: {user_id}")
        print(f"🔍 Face descriptor type: {type(face_data.face_descriptor)}")
        print(f"🔍 Face descriptor length: {len(face_data.face_descriptor)}")
        print(f"🔍 First few values: {face_data.face_descriptor[:5]}")
        
        # Validate face descriptor
        if not face_data.face_descriptor or len(face_data.face_descriptor) != 128:
            print("❌ Invalid face descriptor length")
            raise HTTPException(status_code=400, detail="Invalid face descriptor format")
        
        db = await get_db()
        
        # Update user with face descriptor
        from bson import ObjectId
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"face_descriptor": face_data.face_descriptor}}
        )
        
        print(f"🔍 Update result: {result.modified_count} documents modified")
        
        if result.modified_count == 0:
            print("❌ User not found")
            raise HTTPException(status_code=404, detail="User not found")
        
        print("✅ Face registered successfully")
        return {
            "success": True,
            "message": "Face registered successfully"
        }
    except Exception as e:
        print(f"❌ Register face error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/google")
async def google_oauth():
    """Initiate Google OAuth flow"""
    print(f"🔍 Google OAuth initiated")
    print(f"🔍 GOOGLE_CLIENT_ID: {GOOGLE_CLIENT_ID}")
    print(f"🔍 GOOGLE_CLIENT_SECRET: {GOOGLE_CLIENT_SECRET[:10] if GOOGLE_CLIENT_SECRET else 'None'}...")
    
    if not GOOGLE_CLIENT_ID or GOOGLE_CLIENT_ID == "your-google-client-id":
        print("❌ Google OAuth not configured - missing GOOGLE_CLIENT_ID")
        raise HTTPException(
            status_code=500, 
            detail="Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment variables."
        )
    
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    final_url = f"{auth_url}?{query_string}"
    print(f"🔍 Redirecting to Google OAuth: {final_url}")
    return RedirectResponse(url=final_url)

@router.get("/google/callback")
async def google_oauth_callback(code: str):
    """Handle Google OAuth callback"""
    print(f"🔍 Google OAuth callback received with code: {code[:20]}...")
    try:
        if not GOOGLE_CLIENT_SECRET or GOOGLE_CLIENT_SECRET == "your-google-client-secret":
            print("❌ Google OAuth not configured - missing GOOGLE_CLIENT_SECRET")
            raise HTTPException(
                status_code=500, 
                detail="Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment variables."
            )
        
        print(f"🔍 Exchanging code for tokens...")
        # Exchange code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": GOOGLE_REDIRECT_URI
        }
        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(token_url, data=token_data)
            print(f"🔍 Token response status: {token_response.status_code}")
            if not token_response.is_success:
                print(f"❌ Token exchange failed: {token_response.text}")
            token_response.raise_for_status()
            tokens = token_response.json()
        
        print(f"🔍 Getting user info...")
        # Get user info
        user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {"Authorization": f"Bearer {tokens['access_token']}"}
        
        async with httpx.AsyncClient() as client:
            user_response = await client.get(user_info_url, headers=headers)
            print(f"🔍 User info response status: {user_response.status_code}")
            if not user_response.is_success:
                print(f"❌ User info request failed: {user_response.text}")
            user_response.raise_for_status()
            user_info = user_response.json()
        
        print(f"🔍 User info received: {user_info.get('email', 'No email')}")
        
        # Create or update user
        db = await get_db()
        user = await db.users.find_one({"email": user_info["email"]})
        
        if not user:
            print(f"🔍 Creating new user: {user_info['email']}")
            # Create new user
            user_doc = {
                "email": user_info["email"],
                "name": user_info.get("name"),
                "profile_picture": user_info.get("picture"),
                "google_id": user_info["id"],
                "is_admin": False
            }
            result = await db.users.insert_one(user_doc)
            user_id = result.inserted_id
        else:
            print(f"🔍 Updating existing user: {user_info['email']}")
            # Update existing user
            await db.users.update_one(
                {"_id": user["_id"]},
                {
                    "$set": {
                        "name": user_info.get("name"),
                        "profile_picture": user_info.get("picture"),
                        "google_id": user_info["id"]
                    }
                }
            )
            user_id = user["_id"]
        
        # Create access token
        access_token = create_access_token(
            data={"sub": str(user_id), "email": user_info["email"]}
        )
        
        print(f"🔍 Redirecting to frontend with token")
        # Redirect to frontend with token
        frontend_url = f"http://localhost:5173/login?token={access_token}"
        return RedirectResponse(url=frontend_url)
        
    except Exception as e:
        print(f"❌ Google OAuth error: {e}")
        # Redirect to login page with error
        error_url = f"http://localhost:5173/login?error=Google+login+failed"
        return RedirectResponse(url=error_url)

@router.post("/logout")
async def logout():
    """Logout user"""
    return {
        "success": True,
        "message": "Logged out successfully"
    }

@router.get("/status")
async def auth_status(user_id: Optional[str] = Depends(get_current_user_id)):
    """Check authentication status"""
    print(f"🔍 Auth status check for user_id: {user_id}")
    
    if not user_id:
        print("❌ No user_id provided")
        return {
            "isAuthenticated": False,
            "user": None
        }
    
    try:
        db = await get_db()
        from bson import ObjectId
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            print(f"❌ User not found in database: {user_id}")
            return {
                "isAuthenticated": False,
                "user": None
            }
        
        print(f"✅ User authenticated: {user.get('email', 'Unknown')}")
        return {
            "isAuthenticated": True,
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "name": user.get("name"),
                "profile_picture": user.get("profile_picture")
            }
        }
    except Exception as e:
        print(f"❌ Error in auth status: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 