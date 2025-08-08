from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from database import get_db
from models.schemas import ResultCreate, ResultResponse, DetailedResult, TestHistoryItem, QuestionReview, DetailedResultResponse
from models.models import ResultModel
from routers.auth import get_current_user_id

router = APIRouter()

@router.get("/test")
async def test_endpoint():
    """Test endpoint to verify the backend is working"""
    print("🔍 [TEST_ENDPOINT] Test endpoint called")
    return {
        "success": True,
        "message": "Backend is working!",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/test-db")
async def test_database_connection():
    """Test database connection and data"""
    try:
        print("🔍 [TEST_DB] Testing database connection...")
        db = await get_db()
        
        # Test basic connection
        await db.command("ping")
        print("✅ [TEST_DB] Database connection successful")
        
        # Count total results
        total_results = await db.results.count_documents({})
        print(f"📊 [TEST_DB] Total results in database: {total_results}")
        
        # Get sample results
        sample_results = await db.results.find().limit(3).to_list(None)
        print(f"📋 [TEST_DB] Sample results: {len(sample_results)}")
        
        return {
            "success": True,
            "message": "Database connection successful",
            "total_results": total_results,
            "sample_results_count": len(sample_results),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        print(f"❌ [TEST_DB] Database test failed: {e}")
        return {
            "success": False,
            "message": f"Database test failed: {str(e)}",
            "timestamp": datetime.utcnow().isoformat()
        }

@router.post("/results")
async def create_result(result_data: ResultCreate, user_id: str = Depends(get_current_user_id)):
    """Create a new assessment result"""
    try:
        print(f"📝 User {user_id} submitting assessment result for topic: {result_data.topic}")
        
        # Get database with timeout
        try:
            db = await get_db()
        except Exception as e:
            print(f"❌ Database connection failed")
            raise HTTPException(
                status_code=503,
                detail="Database connection failed. Please try again."
            )
        
        # Validate required fields
        if not result_data.user_id or result_data.score is None or not result_data.questions:
            print(f"❌ Missing required fields for user {user_id}")
            raise HTTPException(
                status_code=400,
                detail="Missing required fields for result creation"
            )
        
        # Validate user_id format
        try:
            user_object_id = ObjectId(result_data.user_id)
        except Exception as e:
            print(f"❌ Invalid user ID format for user {user_id}")
            raise HTTPException(
                status_code=400,
                detail="Invalid user ID format"
            )
        
        # Calculate additional metrics
        correct_answers = result_data.score
        incorrect_answers = result_data.total_questions - result_data.score
        percentage = (correct_answers / result_data.total_questions) * 100 if result_data.total_questions > 0 else 0
        
        print(f"📊 User {user_id} scored {correct_answers}/{result_data.total_questions} ({percentage:.1f}%) on {result_data.difficulty} {result_data.topic}")
        
        # Create result document with enhanced data
        result_doc = {
            "user_id": user_object_id,  # Use validated ObjectId
            "score": result_data.score,
            "total_questions": result_data.total_questions,
            "questions": result_data.questions,
            "user_answers": result_data.user_answers,
            "topic": result_data.topic,
            "difficulty": result_data.difficulty,
            "time_taken": result_data.time_taken,
            "explanations": result_data.explanations,
            "correct_answers": correct_answers,
            "incorrect_answers": incorrect_answers,
            "percentage": percentage,
            "date": datetime.utcnow()
        }
        
        # Insert into database with timeout handling
        try:
            result = await db.results.insert_one(result_doc)
            result_doc["_id"] = result.inserted_id
            print(f"✅ Assessment result saved successfully for user {user_id}")
        except Exception as e:
            print(f"❌ Database insertion failed for user {user_id}")
            raise HTTPException(
                status_code=500,
                detail="Failed to save result to database. Please try again."
            )
        
        return {
            "success": True,
            "message": "Result saved successfully",
            "result": {
                "id": str(result.inserted_id),
                "score": result_data.score,
                "total_questions": result_data.total_questions,
                "topic": result_data.topic,
                "difficulty": result_data.difficulty,
                "percentage": percentage,
                "time_taken": result_data.time_taken,
                "date": result_doc["date"].isoformat()
            }
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"❌ Unexpected error for user {user_id}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.get("/results/user/{user_id}")
async def get_user_results(user_id: str, current_user_id: str = Depends(get_current_user_id)):
    """Get all results for a specific user with enhanced data"""
    try:
        print(f"📋 User {current_user_id} requesting results")
        
        # Ensure user can only access their own results
        if user_id != current_user_id:
            print(f"❌ Access denied: user {current_user_id} trying to access results for {user_id}")
            raise HTTPException(status_code=403, detail="Access denied")
        
        db = await get_db()
        
        # Get results sorted by date (newest first)
        query = {"user_id": ObjectId(user_id)}
        results = await db.results.find(query).sort("date", -1).to_list(None)
        print(f"📋 Found {len(results)} assessment results for user {user_id}")
        
        # Format results for response with enhanced data
        formatted_results = []
        for result in results:
            percentage = result.get("percentage", (result["score"] / result["total_questions"]) * 100)
            formatted_result = {
                "id": str(result["_id"]),
                "score": result["score"],
                "total_questions": result["total_questions"],
                "topic": result["topic"],
                "difficulty": result["difficulty"],
                "percentage": percentage,
                "time_taken": result.get("time_taken"),
                "date": result["date"].isoformat()
            }
            formatted_results.append(formatted_result)
        
        print(f"✅ Returning {len(formatted_results)} results to user {user_id}")
        
        return {
            "success": True,
            "results": formatted_results
        }
        
    except Exception as e:
        print(f"❌ Error fetching results for user {user_id}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch results: {str(e)}"
        )

@router.get("/results/{result_id}")
async def get_result(result_id: str, current_user_id: str = Depends(get_current_user_id)):
    """Get a specific result by ID with detailed information"""
    try:
        print(f"📋 [RESULT] User {current_user_id} requesting specific result {result_id}")
        
        db = await get_db()
        
        # Get result
        result = await db.results.find_one({"_id": ObjectId(result_id)})
        
        if not result:
            print(f"❌ [RESULT] Result {result_id} not found")
            raise HTTPException(status_code=404, detail="Result not found")
        
        # Ensure user can only access their own results
        if str(result["user_id"]) != current_user_id:
            print(f"❌ [RESULT] Access denied: user {current_user_id} trying to access result {result_id} owned by {result['user_id']}")
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Calculate percentage if not stored
        percentage = result.get("percentage", (result["score"] / result["total_questions"]) * 100)
        
        print(f"✅ [RESULT] Returning detailed result {result_id} to user {current_user_id}")
        
        return {
            "success": True,
            "result": {
                "id": str(result["_id"]),
                "user_id": str(result["user_id"]),
                "score": result["score"],
                "total_questions": result["total_questions"],
                "questions": result["questions"],
                "user_answers": result["user_answers"],
                "topic": result["topic"],
                "difficulty": result["difficulty"],
                "percentage": percentage,
                "time_taken": result.get("time_taken"),
                "explanations": result.get("explanations"),
                "correct_answers": result.get("correct_answers", result["score"]),
                "incorrect_answers": result.get("incorrect_answers", result["total_questions"] - result["score"]),
                "date": result["date"].isoformat()
            }
        }
        
    except Exception as e:
        print(f"❌ [RESULT] Error fetching result {result_id} for user {current_user_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch result: {str(e)}"
        )

@router.get("/results/{result_id}/detailed")
async def get_detailed_result(result_id: str, current_user_id: str = Depends(get_current_user_id)):
    """Get detailed result with question reviews and explanations"""
    try:
        print(f"📋 [RESULT] User {current_user_id} requesting detailed result {result_id}")
        
        db = await get_db()
        
        # Get result
        result = await db.results.find_one({"_id": ObjectId(result_id)})
        
        if not result:
            print(f"❌ [RESULT] Detailed result {result_id} not found")
            raise HTTPException(status_code=404, detail="Result not found")
        
        # Ensure user can only access their own results
        if str(result["user_id"]) != current_user_id:
            print(f"❌ [RESULT] Access denied: user {current_user_id} trying to access detailed result {result_id}")
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Calculate metrics
        percentage = result.get("percentage", (result["score"] / result["total_questions"]) * 100)
        correct_answers = result.get("correct_answers", result["score"])
        incorrect_answers = result.get("incorrect_answers", result["total_questions"] - result["score"])
        
        # Create detailed result
        detailed_result = DetailedResult(
            id=str(result["_id"]),
            user_id=str(result["user_id"]),
            score=result["score"],
            total_questions=result["total_questions"],
            questions=result["questions"],
            user_answers=result["user_answers"],
            topic=result["topic"],
            difficulty=result["difficulty"],
            time_taken=result.get("time_taken"),
            explanations=result.get("explanations"),
            date=result["date"],
            percentage=percentage,
            correct_answers=correct_answers,
            incorrect_answers=incorrect_answers
        )
        
        # Create question reviews
        question_reviews = []
        for i, question in enumerate(result["questions"]):
            user_answer = result["user_answers"][i] if i < len(result["user_answers"]) else ""
            correct_answer = question.get("answer", "")
            is_correct = user_answer == correct_answer
            
            # Get explanation if available
            explanation = None
            if result.get("explanations") and i < len(result["explanations"]):
                explanation = result["explanations"][i].get("explanation", "")
            
            question_review = QuestionReview(
                question_index=i,
                question=question.get("question", ""),
                options=question.get("options", []),
                correct_answer=correct_answer,
                user_answer=user_answer,
                is_correct=is_correct,
                explanation=explanation
            )
            question_reviews.append(question_review)
        
        print(f"✅ [RESULT] Returning detailed result {result_id} with {len(question_reviews)} question reviews to user {current_user_id}")
        
        return DetailedResultResponse(
            success=True,
            result=detailed_result,
            question_reviews=question_reviews
        )
        
    except Exception as e:
        print(f"❌ [RESULT] Error fetching detailed result {result_id} for user {current_user_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch detailed result: {str(e)}"
        )

@router.get("/results/analytics/{user_id}")
async def get_user_analytics(user_id: str, current_user_id: str = Depends(get_current_user_id)):
    """Get analytics for a user"""
    try:
        print(f"📊 User {current_user_id} requesting analytics")
        
        # Ensure user can only access their own analytics
        if user_id != current_user_id:
            print(f"❌ Access denied: user {current_user_id} trying to access analytics for {user_id}")
            raise HTTPException(status_code=403, detail="Access denied")
        
        db = await get_db()
        
        # Get all results for user
        query = {"user_id": ObjectId(user_id)}
        results = await db.results.find(query).to_list(None)
        print(f"📊 Found {len(results)} assessment results for user {user_id}")
        
        if not results:
            print(f"📊 No results found for user {user_id}, returning empty analytics")
            return {
                "success": True,
                "analytics": {
                    "total_assessments": 0,
                    "average_score": 0,
                    "total_questions": 0,
                    "topics": [],
                    "recent_performance": []
                }
            }
        
        # Calculate analytics
        total_assessments = len(results)
        total_score = sum(r["score"] for r in results)
        average_score = total_score / total_assessments if total_assessments > 0 else 0
        total_questions = sum(r["total_questions"] for r in results)
        
        print(f"📊 User {user_id} analytics - {total_assessments} assessments, avg score: {average_score:.1f}, total questions: {total_questions}")
        
        # Get unique topics
        topics = list(set(r["topic"] for r in results))
        
        # Get recent performance (last 5 assessments)
        recent_results = sorted(results, key=lambda x: x["date"], reverse=True)[:5]
        recent_performance = [
            {
                "score": r["score"],
                "total_questions": r["total_questions"],
                "topic": r["topic"],
                "difficulty": r["difficulty"],
                "date": r["date"].isoformat()
            }
            for r in recent_results
        ]
        
        # Get topic statistics
        topic_stats = {}
        for result in results:
            topic = result["topic"]
            if topic not in topic_stats:
                topic_stats[topic] = {"count": 0, "total_score": 0, "total_questions": 0}
            topic_stats[topic]["count"] += 1
            topic_stats[topic]["total_score"] += result["score"]
            topic_stats[topic]["total_questions"] += result["total_questions"]
        
        # Calculate average scores for topics
        for topic in topic_stats:
            stats = topic_stats[topic]
            stats["average_score"] = stats["total_score"] / stats["count"] if stats["count"] > 0 else 0
        
        print(f"📊 Calculated analytics for {len(topics)} topics for user {user_id}")
        
        analytics_data = {
            "total_assessments": total_assessments,
            "average_score": round(average_score, 2),
            "total_questions": total_questions,
            "topics": topics,
            "recent_results": recent_performance,
            "topic_stats": topic_stats
        }
        
        print(f"✅ Returning analytics to user {user_id}")
        
        return {
            "success": True,
            "analytics": analytics_data
        }
        
    except Exception as e:
        print(f"❌ Error fetching analytics for user {user_id}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch analytics: {str(e)}"
        )

@router.get("/results/topic/{topic}")
async def get_results_by_topic(
    topic: str,
    difficulty: Optional[str] = None,
    current_user_id: str = Depends(get_current_user_id)
):
    """Get results filtered by topic and optional difficulty"""
    try:
        print(f"📋 [RESULTS] User {current_user_id} requesting results for topic: {topic}" + (f" (difficulty: {difficulty})" if difficulty else ""))
        
        db = await get_db()
        
        # Build query
        query = {
            "user_id": ObjectId(current_user_id),
            "topic": {"$regex": topic, "$options": "i"}
        }
        
        if difficulty:
            query["difficulty"] = difficulty
        
        # Get results
        results = await db.results.find(query).sort("date", -1).to_list(None)
        print(f"📋 [RESULTS] Found {len(results)} results for topic '{topic}' for user {current_user_id}")
        
        # Format results
        formatted_results = []
        for result in results:
            formatted_results.append({
                "id": str(result["_id"]),
                "score": result["score"],
                "total_questions": result["total_questions"],
                "topic": result["topic"],
                "difficulty": result["difficulty"],
                "date": result["date"].isoformat()
            })
        
        print(f"✅ [RESULTS] Returning {len(formatted_results)} topic results to user {current_user_id}")
        
        return {
            "success": True,
            "results": formatted_results
        }
        
    except Exception as e:
        print(f"❌ [RESULTS] Error fetching topic results for user {current_user_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch results: {str(e)}"
        ) 