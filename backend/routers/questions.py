from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

from database import get_db
from models.schemas import QuestionCreate, QuestionResponse
from models.models import QuestionModel
from routers.auth import get_current_user_id

load_dotenv()

router = APIRouter()

# Configure Google Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.0-flash')
    # Set generation config for faster responses
    model.generation_config = {
        "temperature": 0.7,
        "top_p": 0.8,
        "top_k": 40,
        "max_output_tokens": 2048,
    }
else:
    model = None

async def add_questions_to_db(topic: str, difficulty: str, questions: List[dict]):
    """Add generated questions to database"""
    try:
        db = await get_db()
        
        for question_data in questions:
            question_doc = {
                "topic": topic.strip(),
                "difficulty": difficulty.strip(),
                "question": question_data["question"],
                "answer": question_data["correctAnswer"],
                "options": question_data["options"]
            }
            
            # Check if question already exists
            existing = await db.questions.find_one({
                "question": question_data["question"],
                "topic": topic.strip()
            })
            
            if not existing:
                await db.questions.insert_one(question_doc)
        
        return True
    except Exception as e:
        print(f"Error adding questions to database: {e}")
        return False

@router.get("/questions")
async def fetch_questions_from_gemini(
    topic: str = Query(..., description="Topic for questions"),
    difficulty: str = Query(..., description="Difficulty level (easy/medium/hard)"),
    count: int = Query(..., ge=1, le=50, description="Number of questions to generate"),
    user_id: str = Depends(get_current_user_id)
):
    """Generate questions using Google Gemini AI"""
    print(f"🤖 [QUESTIONS] User {user_id} requesting {count} {difficulty} questions for topic: {topic}")
    
    try:
        if not model:
            print("❌ [QUESTIONS] Gemini API key not configured")
            raise HTTPException(
                status_code=500, 
                detail="Gemini API key is not configured properly"
            )
        
        print(f"🤖 [QUESTIONS] Generating questions via Gemini AI for user {user_id}")
        
        # Create prompt for Gemini
        prompt = f"""Generate {count} multiple-choice questions on {topic} with {difficulty} difficulty. 
        Provide the questions in JSON format with the following structure:
        [
            {{
                "question": "Your question here?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": "Correct option"
            }}
        ]
        
        Make sure:
        1. Questions are relevant to the topic
        2. Difficulty matches the requested level
        3. All options are plausible
        4. Only one correct answer per question
        5. Return valid JSON format"""
        
        # Generate questions using Gemini
        response = model.generate_content(prompt)
        
        # Parse the response
        try:
            # Clean the response text
            response_text = response.text.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            questions = json.loads(response_text)
            
            if not isinstance(questions, list):
                raise ValueError("Response is not a list")
            
            print(f"🤖 [QUESTIONS] Generated {len(questions)} questions from Gemini AI")
            
            # Store questions in database
            await add_questions_to_db(topic, difficulty, questions)
            
            # Format questions for frontend
            formatted_questions = []
            for q in questions:
                formatted_questions.append({
                    "question": q["question"],
                    "options": q["options"],
                    "answer": q["correctAnswer"]
                })
            
            print(f"✅ [QUESTIONS] Successfully generated and stored {len(formatted_questions)} questions for user {user_id}")
            return formatted_questions
            
        except json.JSONDecodeError as e:
            print(f"Error parsing Gemini response: {e}")
            print(f"Raw response: {response.text}")
            raise HTTPException(
                status_code=500,
                detail="Failed to parse questions from Gemini API"
            )
        except Exception as e:
            print(f"Error processing Gemini response: {e}")
            raise HTTPException(
                status_code=500,
                detail="Failed to process questions from Gemini API"
            )
            
    except Exception as e:
        print(f"Error generating questions: {e}")
        if "API key" in str(e):
            raise HTTPException(
                status_code=500,
                detail="Gemini API key is not configured properly"
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate questions from Gemini API"
            )

@router.post("/questions")
async def add_questions(
    topic: str,
    difficulty: str,
    questions: List[dict],
    user_id: str = Depends(get_current_user_id)
):
    """Add questions to database manually"""
    try:
        success = await add_questions_to_db(topic, difficulty, questions)
        
        if success:
            return {
                "status": 201,
                "message": "Questions added successfully"
            }
        else:
            return {
                "status": 400,
                "error": "Error adding questions"
            }
    except Exception as e:
        return {
            "status": 500,
            "error": f"Error adding questions: {str(e)}"
        }

@router.get("/questions/{topic}")
async def get_questions_by_topic(
    topic: str,
    difficulty: Optional[str] = None,
    limit: int = Query(10, ge=1, le=50),
    user_id: str = Depends(get_current_user_id)
):
    """Get questions by topic from database"""
    try:
        db = await get_db()
        
        # Build query
        query = {"topic": {"$regex": topic, "$options": "i"}}
        if difficulty:
            query["difficulty"] = difficulty
        
        # Get questions
        questions = await db.questions.find(query).limit(limit).to_list(None)
        
        # Format response
        formatted_questions = []
        for q in questions:
            formatted_questions.append({
                "question": q["question"],
                "options": q["options"],
                "answer": q["answer"]
            })
        
        return formatted_questions
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/questions/explanations")
async def generate_explanations(
    questions_data: dict,
    user_id: str = Depends(get_current_user_id)
):
    """Generate explanations for questions using Google Gemini AI"""
    print(f"🔍 Explanations endpoint called - User: {user_id}")
    
    try:
        questions = questions_data.get("questions", [])
        topic = questions_data.get("topic", "General")
        difficulty = questions_data.get("difficulty", "medium")
        
        if not questions or len(questions) == 0:
            raise HTTPException(
                status_code=400,
                detail="No questions provided for explanation generation"
            )
        
        print(f"✅ Generating explanations for {len(questions)} questions on {topic}")
        
        # Check if Gemini is available
        if not model:
            print("❌ Gemini API key not configured")
            print(f"🔍 GEMINI_API_KEY present: {bool(GEMINI_API_KEY)}")
            print(f"🔍 GEMINI_API_KEY value: {GEMINI_API_KEY[:10] if GEMINI_API_KEY else 'None'}...")
            
            # Provide fallback explanations
            print("🔄 Providing fallback explanations...")
            fallback_explanations = []
            for i, q in enumerate(questions):
                fallback_explanations.append({
                    "questionIndex": i,
                    "explanation": f"This is the correct answer for question {i+1}. The AI explanation service is currently unavailable. Please refer to your study materials for detailed explanations."
                })
            
            return {
                "success": True,
                "explanations": fallback_explanations,
                "note": "AI explanations unavailable - using fallback explanations"
            }
        
        # Create prompt for explanations
        questions_text = ""
        for i, q in enumerate(questions):
            questions_text += f"""
Question {i+1}: {q['question']}
Options: {', '.join(q['options'])}
Correct Answer: {q['answer']}
"""
        
        prompt = f"""For the following {topic} questions at {difficulty} difficulty level, provide clear and educational explanations for why each correct answer is right. 

{questions_text}

Please provide explanations in JSON format:
[
    {{
        "questionIndex": 0,
        "explanation": "Clear explanation of why this answer is correct, including relevant concepts and reasoning"
    }},
    ...
]

Make the explanations:
- Educational and informative
- Easy to understand for the {difficulty} level
- Include relevant background knowledge
- Explain why other options might be wrong if helpful
- Keep each explanation 2-3 sentences maximum
"""
        
        # Generate explanations using Gemini with timeout handling
        try:
            print(f"🔍 Sending request to Gemini API...")
            response = model.generate_content(prompt)
            
            if not response or not response.text:
                raise HTTPException(status_code=500, detail="No response from Gemini API")
            
            print(f"✅ Received response from Gemini API")
            
        except Exception as e:
            print(f"❌ Gemini API error: {e}")
            if "API key" in str(e) or "authentication" in str(e).lower():
                raise HTTPException(
                    status_code=500,
                    detail="Gemini API key is invalid or not configured. Please check your GEMINI_API_KEY environment variable."
                )
            else:
                # Provide fallback explanations instead of failing
                print("🔄 Gemini API failed, providing fallback explanations...")
                fallback_explanations = []
                for i, q in enumerate(questions):
                    fallback_explanations.append({
                        "questionIndex": i,
                        "explanation": f"This is the correct answer for question {i+1}. The AI explanation service is temporarily unavailable. Please refer to your study materials for detailed explanations."
                    })
                
                return {
                    "success": True,
                    "explanations": fallback_explanations,
                    "note": "AI explanations unavailable - using fallback explanations"
                }
        
        # Parse JSON response
        try:
            # Clean the response text
            response_text = response.text.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            explanations_data = json.loads(response_text)
            
            if not isinstance(explanations_data, list):
                raise ValueError("Response is not a list")
            
            # Validate explanations structure
            formatted_explanations = []
            for i, exp in enumerate(explanations_data):
                if not isinstance(exp, dict) or "explanation" not in exp:
                    print(f"Invalid explanation format at index {i}")
                    continue
                
                formatted_explanations.append({
                    "questionIndex": exp.get("questionIndex", i),
                    "explanation": exp["explanation"]
                })
            
            print(f"✅ Successfully generated {len(formatted_explanations)} explanations")
            return {
                "success": True,
                "explanations": formatted_explanations
            }
            
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            print(f"Response text: {response.text}")
            
            # Provide fallback explanations instead of failing
            print("🔄 JSON parsing failed, providing fallback explanations...")
            fallback_explanations = []
            for i, q in enumerate(questions):
                fallback_explanations.append({
                    "questionIndex": i,
                    "explanation": f"This is the correct answer for question {i+1}. The AI explanation service returned an invalid response. Please refer to your study materials for detailed explanations."
                })
            
            return {
                "success": True,
                "explanations": fallback_explanations,
                "note": "AI explanations unavailable - using fallback explanations"
            }
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"❌ Error generating explanations: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate explanations: {str(e)}"
        ) 