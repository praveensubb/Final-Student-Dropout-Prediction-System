from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from auth import create_access_token
from models import Student, Admin, Mentor

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =========================================================
# STUDENT LOGIN
# =========================================================

@router.post("/student-login")
def student_login(
    email: str,
    password: str,
    db: Session = Depends(get_db)
):

    student = db.query(Student).filter(
        Student.email == email
    ).first()

    if student is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email"
        )

    if student.password != password:
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    token = create_access_token({
        "sub": str(student.id),
        "role": "student"
    })

    return {
        "message": "Student Login Successful",
        "access_token": token,
        "token_type": "bearer",
        "name": student.name,
        "student_id": student.id
    }


# =========================================================
# ADMIN LOGIN
# =========================================================

@router.post("/admin-login")
def admin_login(
    username: str,
    password: str,
    db: Session = Depends(get_db)
):

    admin = db.query(Admin).filter(
        Admin.username == username
    ).first()

    if admin is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid username"
        )

    if admin.password != password:
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    token = create_access_token({
        "sub": str(admin.id),
        "role": "admin"
    })

    return {
        "message": "Admin Login Successful",
        "access_token": token,
        "token_type": "bearer",
        "name": admin.name,
        "admin_id": admin.id
    }


# =========================================================
# MENTOR LOGIN
# =========================================================

@router.post("/mentor-login")
def mentor_login(
    email: str,
    password: str,
    db: Session = Depends(get_db)
):

    mentor = db.query(Mentor).filter(
        Mentor.email == email
    ).first()

    if mentor is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email"
        )

    if mentor.password != password:
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    token = create_access_token({
        "sub": str(mentor.id),
        "role": "mentor"
    })

    return {
        "message": "Mentor Login Successful",
        "access_token": token,
        "token_type": "bearer",
        "name": mentor.mentor_name,
        "mentor_id": mentor.id,
        "email": mentor.email,
        "department": mentor.department
    }