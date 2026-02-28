from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from utils.security import get_current_user

router = APIRouter(prefix="/patient", tags=["Patient"])

@router.get("/history")
def get_my_history(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    patient_id = current_user.get("user_id") # BUG 1 FIX
    
    reports = db.query(models.Report)\
        .filter(models.Report.patient_id == patient_id)\
        .order_by(models.Report.created_at.desc())\
        .all()
        
    return reports if reports else {"message": "No medical history found.", "history": []}