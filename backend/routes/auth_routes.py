from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
import schemas
from database import get_db
from utils.security import hash_password, verify_password, create_token,get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# Temporary verification code for doctors
DOCTOR_SECRET_CODE = "MED2026"

# --- PATIENT SIGNUP ---
import datetime

@router.post("/signup/patient")
def signup_patient(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # ... existing check for duplicate email ...

    # 1. Get the highest numeric ID in the table to avoid collisions
    max_id = db.query(func.max(models.User.id)).scalar() or 0
    new_count = max_id + 1
    
    year = datetime.datetime.now().year
    # Format: PAT-2026-0007 (since max_id was 6)
    formatted_uid = f"PAT-{year}-{str(new_count).zfill(4)}"

    # 2. Create the User with the guaranteed unique UID
    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role="patient",
        patient_uid=formatted_uid
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "Account created", "patient_uid": formatted_uid}


# --- DOCTOR SIGNUP ---
@router.post("/signup/doctor")
def signup_doctor(user: schemas.UserCreate, secret_code: str, db: Session = Depends(get_db)):
    if secret_code != DOCTOR_SECRET_CODE:
        raise HTTPException(status_code=403, detail="Invalid doctor verification code")

    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role="doctor"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "Doctor account created successfully"}

# --- LOGIN ---
@router.post("/login", response_model=schemas.TokenResponse)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # 2. Verify Password
    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # 3. Create JWT Token
    token = create_token({
        "user_id": db_user.id,
        "role": db_user.role,
        "email": db_user.email
    })

    # 4. Smart Redirection Logic
    destination = "chat_interface"
    if db_user.role == "doctor":
        destination = "doctor_dashboard"

    # Inside auth_routes.py -> login function
    # Ensure patient_uid is included in the dictionary sent back to the app
    return {
    "access_token": token,
    "token_type": "bearer",
    "role": db_user.role,
    "user_id": db_user.id,
    "id": db_user.id,
    "email": user.email,
    "patient_uid": db_user.patient_uid,
    "name": db_user.name,
    "age": db_user.age,
    "place": db_user.place,
    "redirect": destination
}

# Add this to your existing auth_routes.py
@router.put("/update-profile")
def update_profile(data: schemas.ProfileUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    u_id = current_user.get("user_id")
    # 1. Find the user in the database
    db_user = db.query(models.User).filter(models.User.id == u_id).first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Update the fields
    db_user.age = data.age
    db_user.place = data.place
    # Optional: db_user.name = data.name (if you want name to be editable)

    # 3. COMMIT the changes to MySQL
    db.commit()
    db.refresh(db_user)

    return {
        "status": "success",
        "user": {
            "id": db_user.id,
            "patient_uid": db_user.patient_uid,
            "name": db_user.name,
            "age": db_user.age,
            "place": db_user.place
        }
    }