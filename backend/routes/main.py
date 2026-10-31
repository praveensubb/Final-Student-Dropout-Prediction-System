from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models

from routes.student import router as student_router
from routes.auth import router as auth_router
from routes.prediction import router as prediction_router
from routes.peer_nudge import router as peer_nudge_router
from routes.goals import router as goals_router
from routes.admin import router as admin_router


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
        "http://127.0.0.1:3001"
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
# REGISTER ROUTES
# =========================================================

app.include_router(student_router)
app.include_router(auth_router)
app.include_router(prediction_router)
app.include_router(peer_nudge_router)
app.include_router(goals_router)
app.include_router(admin_router)


# =========================================================
# HOME
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