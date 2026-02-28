from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import case
from pydantic import BaseModel
import models
from database import get_db
from utils.security import get_current_user

router = APIRouter(prefix="/doctor", tags=["Doctor Operations"])

class ApprovalRequest(BaseModel):
    doctor_notes: str

@router.get("/queue")
def get_triage_queue(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    """Returns all pending reports. Ordered by severity: high -> medium -> low."""
    if user.get("role") != "doctor":
        raise HTTPException(status_code=403, detail="Access denied. Doctor role required.")
    
    # Normalized to lowercase for consistency (Bug 5)
    severity_order = case(
        (models.Report.severity == "high", 1),
        (models.Report.severity == "medium", 2),
        (models.Report.severity == "low", 3),
        else_=4
    )

    return db.query(models.Report).filter(models.Report.status == "pending")\
             .order_by(severity_order, models.Report.created_at.asc())\
             .all()

@router.get("/session/{session_id}/transcript")
def get_full_transcript(session_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    if user.get("role") != "doctor":
        raise HTTPException(status_code=403, detail="Unauthorized.")
    return db.query(models.Message).filter(models.Message.session_id == session_id).all()

@router.put("/approve/{report_id}")
def approve_report(
    report_id: int, 
    data: ApprovalRequest, 
    db: Session = Depends(get_db), 
    user: dict = Depends(get_current_user)
):
    if user.get("role") != "doctor":
        raise HTTPException(status_code=403, detail="Unauthorized.")

    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Update status and log the reviewer
    report.doctor_report = data.doctor_notes
    report.status = "APPROVED"
    report.reviewed_by_id = user.get("user_id") 
    
    db.commit()
    return {"status": "success", "message": f"Report {report_id} approved."}

@router.get("/patients-list")
def get_patients_for_doctor(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    """Retrieves unique patients who have at least one clinical report."""
    if user.get("role") != "doctor":
        raise HTTPException(status_code=403, detail="Unauthorized.")
    
    patients = db.query(models.User.id, models.User.name, models.User.age, models.User.place)\
        .join(models.Report, models.Report.patient_id == models.User.id)\
        .group_by(models.User.id).all()
    
    return [{"id": p.id, "name": p.name, "age": p.age, "place": p.place} for p in patients]

@router.get("/patient-history/{patient_id}")
def get_patient_history_for_doctor(
    patient_id: int, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    """Allows a doctor to view history for a specific patient."""
    if current_user.get("role") != "doctor":
        raise HTTPException(status_code=403, detail="Unauthorized access.")

    return db.query(models.Report)\
        .filter(models.Report.patient_id == patient_id)\
        .order_by(models.Report.created_at.desc())\
        .all()

@router.get("/stats")
def get_doctor_stats(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """
    Returns clinical activity stats for the logged-in doctor.
    """
    if current_user.get("role") != "doctor":
        raise HTTPException(status_code=403, detail="Doctor access required")
    
    doctor_id = current_user.get("user_id")

    # Count reports where this doctor is the reviewer
    total_reviewed = db.query(models.Report).filter(
        models.Report.reviewed_by_id == doctor_id,
        models.Report.status.in_(["approved", "rejected"])
    ).count()

    # Optional: Breakdown stats
    approved_count = db.query(models.Report).filter(
        models.Report.reviewed_by_id == doctor_id,
        models.Report.status == "approved"
    ).count()

    return {
        "total_reviewed": total_reviewed,
        "approved": approved_count,
        "rejected": total_reviewed - approved_count
    }