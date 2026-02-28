from sqlalchemy.orm import Session
import models
import datetime

def create_audit_entry(db: Session, report_id: int, doctor_id: int, original_value: str, updated_value: str, action: str = "edit_and_approve"):
    """
    Creates a permanent record of changes made to a medical report.
    """
    # Ensure values are strings to prevent database serialization errors
    audit_entry = models.AuditLog(
        report_id=report_id,
        doctor_id=doctor_id,
        action=action, 
        original_value=str(original_value) if original_value else "",
        updated_value=str(updated_value) if updated_value else "",
        timestamp=datetime.datetime.utcnow()
    )
    try:
        db.add(audit_entry)
        db.commit()
        db.refresh(audit_entry)
        return audit_entry
    except Exception as e:
        db.rollback()
        print(f"Audit Log Error: {e}")
        raise e