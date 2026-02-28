from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models

# Import Routers
from routes import auth_routes, chat_routes, doctor_routes, report_routes, patient_routes

# Create Tables in PostgreSQL (if they do not exist)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Doctor Patient Room API",
    description="AI-Assisted Clinical Triage System",
    version="1.5.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth_routes.router, tags=["Authentication"])
app.include_router(chat_routes.router, tags=["AI Chat"])
app.include_router(doctor_routes.router, tags=["Doctor"])
app.include_router(report_routes.router, tags=["Reports"])
app.include_router(patient_routes.router, tags=["Patient"])

@app.get("/")
def root():
    return {
        "status": "online",
        "project": "Doctor Patient Room",
        "version": "1.5.0",
        "database": "PostgreSQL Connected"
    }
