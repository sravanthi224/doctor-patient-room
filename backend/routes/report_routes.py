from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models
import datetime
from database import get_db
from services.report_service import generate_triage_report
from services.summary_service import summarize_conversation
from services.ai_service import analyze_feedback_for_improvement 
from services.medical_validator import verify_symptoms 
from services.audit_service import create_audit_entry 
from utils.security import get_current_user, oauth2_scheme

router = APIRouter(prefix="/report", tags=["Medical Report"])

@router.get("/protected-data")
def check_auth(token: str = Depends(oauth2_scheme)):
    return {"message": "You are authorized!"}

@router.get("/details/{report_id}")
def get_report_details(report_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # We now JOIN with the users table to get the professional UID
    data = db.query(
        models.Report, 
        models.User.name, 
        models.User.patient_uid, # Pull the professional UID
        models.User.age, 
        models.User.place
    ).join(models.User, models.Report.patient_id == models.User.id)\
     .filter(models.Report.id == report_id).first()

    if not data:
        raise HTTPException(status_code=404, detail="Report not found")

    report, name, patient_uid, age, place = data
    report_dict = report.__dict__.copy()
    
    # Update the dictionary to show the professional UID to the Doctor
    report_dict.update({
        "patient_name": name,
        "display_uid": patient_uid, # This shows PAT-2026-XXXX
        "patient_age": age,
        "patient_place": place
    })
    return report_dict

@router.get("/transcript/{session_id}")
def get_chat_transcript(session_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(models.Message).filter(models.Message.session_id == session_id).order_by(models.Message.id.asc()).all()

@router.post("/generate/{session_id}", status_code=status.HTTP_201_CREATED)
def create_report_by_session(session_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # BUG 4 FIX: Check for duplicate reports
    existing_report = db.query(models.Report).filter(models.Report.session_id == session_id).first()
    if existing_report:
        return {"message": "Report already exists", "report": existing_report}

    messages = db.query(models.Message).filter(models.Message.session_id == session_id).all()
    session = db.query(models.ChatSession).filter(models.ChatSession.id == session_id).first()
    
    if not messages or not session:
        raise HTTPException(status_code=404, detail="Session or messages not found")

    structured_data = generate_triage_report(messages)
    verified, suspicious = verify_symptoms(structured_data.get("symptoms_list", []))

    new_report = models.Report(
        session_id=session_id,
        patient_id=session.patient_id,
        ai_report=structured_data.get("clinical_report"),
        summary=summarize_conversation(messages), 
        severity=structured_data.get("risk_level", "low").lower(),
        uncertainty_flag=structured_data.get("uncertainty_flag") or bool(suspicious),
        status="pending"
    )
    db.add(new_report); db.commit(); db.refresh(new_report)
    return {"message": "Success", "report": new_report}

@router.put("/approve/{report_id}")
def approve_report(
    report_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can approve reports")

    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    doctor_feedback = data.get("feedback")
    # doctor_report represents the edited AI draft
    doctor_report_content = data.get("doctor_report") 

    if not doctor_feedback or len(doctor_feedback.strip()) < 5:
        raise HTTPException(
            status_code=400,
            detail="Doctor feedback is mandatory before approval to improve AI learning."
        )

    # Update Report state
    report.status = "approved"
    report.doctor_report = doctor_report_content
    report.reviewed_by_id = current_user.get("user_id")
    
    # Save clinical reasoning to doctor_notes
    report.doctor_notes = doctor_feedback 

    db.commit()
    return {"message": "Report approved and signed."}

@router.put("/reject/{report_id}")
def reject_report(report_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "doctor":
        raise HTTPException(status_code=403, detail="Doctor access required")

    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    doctor_id = current_user.get("user_id") # BUG 1
    
    create_audit_entry(db, report.id, doctor_id, report.ai_report, "rejected", action="reject")
    report.status = "rejected"; report.reviewed_by_id = doctor_id
    db.commit()
    return {"message": "Rejected"}

@router.get("/my-history")
def get_patient_history(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    u_id = current_user.get("user_id") 
    
    # We join the User table to fetch the professional patient_uid
    results = db.query(models.Report, models.User.patient_uid)\
        .join(models.User, models.Report.patient_id == models.User.id)\
        .filter(models.Report.patient_id == u_id)\
        .order_by(models.Report.created_at.desc())\
        .all()
    
    # Format the response so the frontend sees 'patient_uid' inside each report
    history = []
    for report, uid in results:
        r_data = report.__dict__.copy()
        r_data["display_uid"] = uid # This will be "PAT-2026-0006"
        history.append(r_data)
        
    return history
# --- 4. EHR INTEGRATION ---

@router.get("/my-history")
def get_patient_history(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    p_id = current_user.get("user_id") # BUG 1
    return db.query(models.Report).filter(models.Report.patient_id == p_id).order_by(models.Report.created_at.desc()).all()

@router.post("/sync-ehr/{report_id}")
def sync_to_external_ehr(report_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # 1. Verify report existence and approval status
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    
    if not report or report.status != "approved":
        raise HTTPException(status_code=400, detail="Valid approved report required for EHR sync.")

    # 2. Construct EHR Payload
    ehr_payload = {
        "external_sys_id": f"EHR-REF-{report.id}",
        "patient_id": report.patient_id,
        "clinical_data": {
            "triage_summary": report.summary,
            "ai_draft": report.ai_report,
            "final_clinician_note": report.doctor_report,
            "severity_index": report.severity
        },
        "metadata": {
            "synced_at": str(datetime.datetime.utcnow()),
            "doctor_id": report.reviewed_by_id
        }
    }
    
    # In a real system, you would perform an actual POST to a hospital API here
    return {"status": "success", "ehr_receipt": ehr_payload}

@router.post("/feedback/{report_id}")
def submit_report_feedback(
    report_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    user_id = current_user.get("user_id")
    user_role = current_user.get("role")
    feedback_text = data.get("feedback")

    if not feedback_text or len(feedback_text.strip()) < 5:
        raise HTTPException(status_code=400, detail="Meaningful feedback is required.")

    # Log to Feedback Table
    feedback_entry = models.Feedback(
        report_id=report.id,
        user_id=user_id,
        user_role=user_role,
        message=feedback_text
    )
    db.add(feedback_entry)

    # Logic for Doctor: Analyze delta between AI and Clinician
    if user_role == "doctor":
        improvement = analyze_feedback_for_improvement(
            original=report.summary,
            final=report.doctor_report,
            feedback=feedback_text
        )
        report.ai_improvement_notes = improvement

    # Logic for Patient: Log subjective accuracy
    if user_role == "patient":
        report.patient_feedback_notes = feedback_text

    db.commit()
    return {"message": "Feedback loop successfully closed."}

def analyze_feedback_for_improvement(original, final, feedback):
    """Detects what the AI missed based on Human edits."""
    if not final or original == final:
        return "AI performance was clinically accurate."
    
    return f"AI missed nuance corrected by doctor. Reasoning: {feedback}"


@router.get("/audit/{report_id}")
def get_audit_log(report_id: int, db: Session = Depends(get_db)):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return {
        "case_id": report.id,
        "ai_original": report.summary,         # The 'Before'
        "doctor_final": report.doctor_report,  # The 'After'
        "ai_learning": report.ai_improvement_notes,
        "patient_view": report.patient_feedback_notes
    }


# --- SECTION 6: PATIENT VIEW ---
@router.get("/view/{report_id}")
def get_final_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report or report.status != "approved":
        raise HTTPException(status_code=403, detail="Clinical report is still pending review.")
    
    return report