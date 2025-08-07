from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional, Dict, Any, Annotated
from datetime import datetime
from bson import ObjectId

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

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: Optional[str] = None
    name: Optional[str] = None
    profile_picture: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    google_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    is_admin: bool = False
    google_id: Optional[str] = None
    face_descriptor: Optional[List[float]] = None

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str}
    )

class FaceLoginRequest(BaseModel):
    face_descriptor: List[float]

# Question schemas
class QuestionBase(BaseModel):
    topic: str
    difficulty: str
    question: str
    answer: str
    options: List[str]

class QuestionCreate(QuestionBase):
    pass

class QuestionResponse(QuestionBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str}
    )

# Result schemas
class ResultBase(BaseModel):
    user_id: str  # Changed from PyObjectId to str for easier frontend integration
    score: int
    total_questions: int
    questions: List[Dict[str, Any]]
    user_answers: List[str]
    topic: str
    difficulty: str
    time_taken: Optional[int] = None  # Time taken in seconds
    explanations: Optional[List[Dict[str, Any]]] = None  # AI explanations for questions

class ResultCreate(ResultBase):
    pass

class ResultResponse(ResultBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    date: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str}
    )

# Detailed result schemas for comprehensive test history
class DetailedResult(BaseModel):
    id: str
    user_id: str
    score: int
    total_questions: int
    questions: List[Dict[str, Any]]
    user_answers: List[str]
    topic: str
    difficulty: str
    time_taken: Optional[int] = None
    explanations: Optional[List[Dict[str, Any]]] = None
    date: datetime
    percentage: float
    correct_answers: int
    incorrect_answers: int

class TestHistoryItem(BaseModel):
    id: str
    score: int
    total_questions: int
    topic: str
    difficulty: str
    date: str
    percentage: float
    time_taken: Optional[int] = None

class QuestionReview(BaseModel):
    question_index: int
    question: str
    options: List[str]
    correct_answer: str
    user_answer: str
    is_correct: bool
    explanation: Optional[str] = None

class DetailedResultResponse(BaseModel):
    success: bool
    result: DetailedResult
    question_reviews: List[QuestionReview]

# Assessment schemas
class AssessmentConfig(BaseModel):
    topic: str = Field(..., min_length=1)
    qnCount: int = Field(..., ge=1, le=50, alias="qn_count")
    difficulty: str = Field(..., pattern="^(easy|medium|hard|Easy|Medium|Hard|Very Easy|Very Hard)$")

    model_config = ConfigDict(populate_by_name=True)
    
    def __init__(self, **data):
        super().__init__(**data)
        # Convert difficulty to lowercase for consistency
        if hasattr(self, 'difficulty'):
            self.difficulty = self.difficulty.lower()

# Google OAuth schemas
class GoogleAuthRequest(BaseModel):
    code: str
    redirect_uri: str

# Session schemas
class SessionData(BaseModel):
    user_id: str
    email: str
    name: Optional[str] = None
    profile_picture: Optional[str] = None

# Settings schemas
class UserSettings(BaseModel):
    userId: str
    theme: Dict[str, str]
    notifications: Dict[str, bool]
    privacy: Dict[str, bool]

class SettingsResponse(BaseModel):
    success: bool
    message: str 