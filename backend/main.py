from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models

# Import Routers
from routes import auth_routes, chat_routes, doctor_routes, report_routes, patient_routes

# Initialize Database Tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Doctor Patient Room API",
    description="AI-Assisted Clinical Triage System",
    version="1.4.2"
)

# CORS MIDDLEWARE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REGISTER ROUTES
app.include_router(auth_routes.router)
app.include_router(chat_routes.router)
app.include_router(doctor_routes.router)
app.include_router(report_routes.router) # Reports, Queue, Audit, Sync
app.include_router(patient_routes.router)

@app.get("/")
def root():
    return {"status": "online", "project": "Doctor Patient Room", "version": "1.4.2"}




