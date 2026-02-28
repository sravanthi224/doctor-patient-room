from fastapi import HTTPException, Depends, status
from utils.security import get_current_user

def verify_doctor(current_user: dict = Depends(get_current_user)):
    """
    Dependency to restrict route access to users with the 'doctor' role.
    """
    if current_user.get("role") != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access restricted to clinical staff only."
        )
    return current_user

def verify_patient(current_user: dict = Depends(get_current_user)):
    """
    Dependency to ensure the user has a 'patient' role.
    """
    if current_user.get("role") != "patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access restricted to patients."
        )
    return current_user