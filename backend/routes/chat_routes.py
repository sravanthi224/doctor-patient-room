from fastapi import APIRouter, Depends, HTTPException,status
from sqlalchemy.orm import Session
import models, schemas
from database import get_db
from services.ai_service import chat_with_ai 
from utils.security import get_current_user

router = APIRouter(prefix="/chat", tags=["AI Chat"])

@router.get("/protected-data")
def get_data(user_data: dict = Depends(get_current_user)):
    return {"message": "You are authorized!", "user": user_data}

@router.post("/start")
def start_chat_session(db: Session = Depends(get_db), user_data: dict = Depends(get_current_user)):
    user_id = user_data.get("user_id")
    # Creates a new session specifically linked to the logged-in patient
    new_session = models.ChatSession(patient_id=user_id)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return {"session_id": new_session.id}

@router.post("/send", response_model=schemas.ChatResponse) 
def send_message(
    data: schemas.ChatRequest, 
    db: Session = Depends(get_db), 
    user_data: dict = Depends(get_current_user)
):
    user_id = user_data.get("user_id")

    # 1. SECURE Session management
    # We MUST verify that the session exists AND belongs to this user
    session = db.query(models.ChatSession).filter(
        models.ChatSession.id == data.session_id,
        models.ChatSession.patient_id == user_id
    ).first()

    if not session:
        # If the session doesn't exist or doesn't belong to the user, block access
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Unauthorized session access or session does not exist"
        )

    # 2. Get Clinical History (Past Reports) 
    # Context-aware AI: Fetching last 3 reports for medical background
    past_reports = db.query(models.Report)\
        .filter(models.Report.patient_id == user_id)\
        .order_by(models.Report.created_at.desc())\
        .limit(3)\
        .all()

    # 3. Get current Chat Conversation History
    chat_history = db.query(models.Message).filter(models.Message.session_id == session.id).all()

    # 4. Save the new Patient Message to DB
    new_message = models.Message(session_id=session.id, sender="patient", content=data.message)
    db.add(new_message)
    db.commit()

    # 5. Call AI Service 
    ai_reply = chat_with_ai(
        user_message=data.message,
        chat_history=chat_history,
        patient_reports=past_reports
    )

    # 6. Save AI Message to DB
    ai_message = models.Message(session_id=session.id, sender="ai", content=ai_reply)
    db.add(ai_message)
    db.commit()

    return {"ai_response": ai_reply}