from pydantic import BaseModel, EmailStr
from typing import Optional, List,Union 

# ---------- AUTH SCHEMAS ----------

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Request schema for the update
class ProfileUpdate(BaseModel):
    name: str
    age: int
    place: str

# Inside schemas.py
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    id: int
    email: str
    name: str
    age: Optional[int] = None
    place: Optional[str] = None
    patient_uid: Optional[str] = None
    redirect: str

# ---------- CHAT SCHEMAS ----------

class ChatRequest(BaseModel):
    message: str
    session_id: int

class ChatResponse(BaseModel):
    ai_response: str

# ---------- REPORT & FEEDBACK SCHEMAS ----------

class ReportEdit(BaseModel):
    report_id: int
    doctor_report: str

class FeedbackCreate(BaseModel):
    user_id: int
    message: str
