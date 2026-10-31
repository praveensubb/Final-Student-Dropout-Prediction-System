from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Mentor, MentorStudent, Student


router = APIRouter(
    prefix="/mentor",
    tags=["Mentor"]
)


# =========================================================
# GET MENTOR PROFILE
# =========================================================

@router.get("/profile")
def get_mentor_profile(
    mentor_id: int,
    db: Session = Depends(get_db)
):
    mentor = db.query(Mentor).filter(
        Mentor.id == mentor_id
    ).first()

    if not mentor:
        raise HTTPException(
            status_code=404,
            detail="Mentor not found"
        )

    return {
        "id": mentor.id,
        "name": mentor.mentor_name,
        "email": mentor.email,
        "department": mentor.department
    }


# =========================================================
# GET ASSIGNED STUDENTS
# =========================================================

@router.get("/students")
def get_mentor_students(
    mentor_id: int,
    db: Session = Depends(get_db)
):
    mentor = db.query(Mentor).filter(
        Mentor.id == mentor_id
    ).first()

    if not mentor:
        raise HTTPException(
            status_code=404,
            detail="Mentor not found"
        )

    assignments = db.query(MentorStudent).filter(
        MentorStudent.mentor_id == mentor_id
    ).all()

    result = []

    for assignment in assignments:

        student = db.query(Student).filter(
            Student.id == assignment.student_id
        ).first()

        if not student:
            continue

        cgpa = float(student.cgpa) if student.cgpa is not None else None
        attendance = (
            float(student.attendance)
            if student.attendance is not None
            else None
        )
        backlogs = student.backlogs or 0

        # =====================================================
        # RISK CALCULATION
        # =====================================================

        if (
            (cgpa is not None and cgpa < 5.5)
            or
            (attendance is not None and attendance < 65)
            or
            backlogs >= 3
        ):
            risk_status = "High Risk"

        elif (
            (cgpa is not None and cgpa < 6.5)
            or
            (attendance is not None and attendance < 75)
            or
            backlogs >= 1
        ):
            risk_status = "Medium Risk"

        else:
            risk_status = "Low Risk"

        result.append({
            "id": student.id,
            "usn": student.usn,
            "name": student.name,
            "email": student.email,
            "branch": student.branch,
            "semester": student.semester,
            "section": student.section,
            "cgpa": cgpa,
            "attendance": attendance,
            "backlogs": backlogs,
            "risk_status": risk_status
        })

    return {
        "mentor": {
            "id": mentor.id,
            "name": mentor.mentor_name,
            "email": mentor.email,
            "department": mentor.department
        },
        "total_students": len(result),
        "students": result
    }