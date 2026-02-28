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

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    id: int
    user_id: int
    email: str | None = None
    patient_uid: str | None = None
    name: str | None = None
    age: int | None = None
    place: str | None = None
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