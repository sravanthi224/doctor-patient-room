from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True) # The internal DB ID
    patient_uid = Column(String(50), unique=True, index=True) # The Official UID (PAT-2026-XXXX)
    name = Column(String(100))
    email = Column(String(100), unique=True)
    password = Column(String(255))
    role = Column(String(20))
    age = Column(Integer, nullable=True)
    place = Column(String(100), nullable=True)

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    messages = relationship("Message", back_populates="session")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"))
    sender = Column(String(20)) # 'patient' or 'ai'
    content = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    session = relationship("ChatSession", back_populates="messages")

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=True)
    patient_id = Column(Integer, ForeignKey("users.id"))
    
    # Clinical Content
    ai_report = Column(Text)        # Original AI Raw Output
    summary = Column(Text)          # Original AI Summary
    doctor_report = Column(Text, nullable=True) # The final edited version by Doctor
    doctor_notes = Column(Text, nullable=True)  # Additional clinical reasoning/notes
    
    # Metadata
    severity = Column(String(50))   # HIGH, MEDIUM, LOW
    status = Column(String(50), default="pending") # pending, approved, rejected
    uncertainty_flag = Column(Boolean, default=False)
    uncertainty_notes = Column(Text, nullable=True)
    
    # Feedback & Audit Loop
    ai_improvement_notes = Column(Text, nullable=True)   # Generated delta analysis
    patient_feedback_notes = Column(Text, nullable=True) # Patient perspective feedback
    
    reviewed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"))
    doctor_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(50)) # 'edit', 'approve'
    original_value = Column(Text, nullable=True)
    updated_value = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Feedback(Base):
    """Stores mandatory textual feedback from both Patients and Doctors."""
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    user_role = Column(String(20)) # 'doctor' or 'patient'
    message = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)