from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models

# =========================================================
# ROUTES
# =========================================================

from routes.student import router as student_router
from routes.auth import router as auth_router
from routes.prediction import router as prediction_router
from routes.peer_nudge import router as peer_nudge_router
from routes.goals import router as goals_router
from routes.admin import router as admin_router
from routes.faculty import router as faculty_router
from routes.faculty_admin import router as faculty_admin_router
from routes.activity import router as activity_router
from routes.attendance import router as attendance_router
from routes.interventions import router as intervention_router
from routes.academic import router as academic_router
from routes.monitoring import router as monitoring_router
from routes.mentor_admin import router as mentor_admin_router
from routes.mentor import router as mentor_router
from routes.mentor_mentoring import router as mentor_mentoring_router
from routes.mentor_intervention import router as mentor_intervention_router
from routes.mentor_reports import router as mentor_reports_router
from routes.mentor_notifications import router as mentor_notifications_router
from routes.admin_faculty_activities import router as admin_faculty_activities_router
from routes.admin_mentor_activities import (
    router as admin_mentor_activities_router
)
from routes.mentor_parent_alerts import router as mentor_parent_alerts_router
from routes.admin_mentor_activity_details import (
    router as admin_mentor_activity_details_router
)



# =========================================================
# CREATE FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="Student Dropout Prediction API",
    description="Backend API for Student Dropout Prediction System",
    version="1.0.0"
)


# =========================================================
# CORS CONFIGURATION
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://localhost:8765",
        "http://127.0.0.1:8765"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# CREATE DATABASE TABLES
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# REGISTER API ROUTES
# =========================================================

# Student routes
app.include_router(student_router)

# Authentication routes
app.include_router(auth_router)

# Prediction routes
app.include_router(prediction_router)

# Peer nudge routes
app.include_router(peer_nudge_router)

# Goal routes
app.include_router(goals_router)

# Admin routes
app.include_router(admin_router)

# Faculty routes
app.include_router(faculty_router)

# Faculty assignment routes
app.include_router(faculty_admin_router)

# Faculty activity monitoring routes
app.include_router(activity_router)
app.include_router(attendance_router)
app.include_router(intervention_router)
app.include_router(academic_router)
app.include_router(monitoring_router)
app.include_router(mentor_admin_router)
app.include_router(mentor_router)
app.include_router(mentor_mentoring_router)
app.include_router(
    mentor_intervention_router
)
app.include_router(mentor_reports_router)
app.include_router(mentor_notifications_router)
app.include_router(admin_faculty_activities_router)

app.include_router(admin_mentor_activities_router)
app.include_router(mentor_parent_alerts_router)
app.include_router(admin_mentor_activity_details_router)
# =========================================================
# HOME ROUTE
# =========================================================

@app.get("/")
def home():
    return {
        "message": "Student Dropout Prediction API is Running!"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():
    return {
        "status": "success",
        "database": "connected",
        "backend": "running"
    }