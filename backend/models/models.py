from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
import bcrypt

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, validation_info=None):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")

# User Model
class UserModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    username: Optional[str] = None
    email: EmailStr
    password: Optional[str] = None
    is_admin: bool = False
    google_id: Optional[str] = None
    name: Optional[str] = None
    profile_picture: Optional[str] = None
    face_descriptor: Optional[List[float]] = None

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str},
        json_schema_extra={
            "example": {
                "username": "john_doe",
                "email": "john@example.com",
                "password": "hashed_password",
                "is_admin": False,
                "google_id": "google_oauth_id",
                "name": "John Doe",
                "profile_picture": "https://example.com/picture.jpg",
                "face_descriptor": [0.1, 0.2, 0.3]
            }
        }
    )

    @classmethod
    def hash_password(cls, password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    @classmethod
    def verify_password(cls, password: str, hashed: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

# Question Model
class QuestionModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    topic: str
    difficulty: str
    question: str
    answer: str
    options: List[str]

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str},
        json_schema_extra={
            "example": {
                "topic": "JavaScript",
                "difficulty": "medium",
                "question": "What is the output of console.log(typeof null)?",
                "answer": "object",
                "options": ["null", "object", "undefined", "number"]
            }
        }
    )

# Result Model
class ResultModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    score: int
    total_questions: int
    questions: List[Dict[str, Any]]
    user_answers: List[str]
    date: datetime = Field(default_factory=datetime.utcnow)
    topic: str
    difficulty: str
    time_taken: Optional[int] = None  # Time taken in seconds
    explanations: Optional[List[Dict[str, Any]]] = None  # AI explanations for questions
    correct_answers: Optional[int] = None
    incorrect_answers: Optional[int] = None
    percentage: Optional[float] = None

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str},
        json_schema_extra={
            "example": {
                "user_id": "507f1f77bcf86cd799439011",
                "score": 8,
                "total_questions": 10,
                "questions": [
                    {
                        "question": "What is JavaScript?",
                        "options": ["Programming language", "Markup language", "Style sheet", "Database"],
                        "answer": "Programming language"
                    }
                ],
                "user_answers": ["Programming language"],
                "topic": "JavaScript",
                "difficulty": "easy",
                "time_taken": 540,
                "explanations": [
                    {
                        "questionIndex": 0,
                        "explanation": "JavaScript is a programming language used for web development."
                    }
                ],
                "correct_answers": 8,
                "incorrect_answers": 2,
                "percentage": 80.0
            }
        }
    ) 