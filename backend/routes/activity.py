from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models import FacultyActivity, Faculty, Student, Timetable


router = APIRouter(
    prefix="/activities",
    tags=["Faculty Activities"]
)


# =========================================================
# CREATE FACULTY ACTIVITY
# =========================================================

@router.post("/")
def create_activity(
    faculty_id: int,
    activity_type: str,
    activity_title: str,
    description: Optional[str] = None,
    student_id: Optional[int] = None,
    timetable_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    # Check faculty
    faculty = (
        db.query(Faculty)
        .filter(Faculty.id == faculty_id)
        .first()
    )

    if not faculty:
        raise HTTPException(
            status_code=404,
            detail="Faculty not found"
        )

    # Check student if supplied
    if student_id is not None:
        student = (
            db.query(Student)
            .filter(Student.id == student_id)
            .first()
        )

        if not student:
            raise HTTPException(
                status_code=404,
                detail="Student not found"
            )

    # Check timetable if supplied
    if timetable_id is not None:
        timetable = (
            db.query(Timetable)
            .filter(Timetable.id == timetable_id)
            .first()
        )

        if not timetable:
            raise HTTPException(
                status_code=404,
                detail="Timetable not found"
            )

    activity = FacultyActivity(
        faculty_id=faculty_id,
        activity_type=activity_type,
        activity_title=activity_title,
        description=description,
        student_id=student_id,
        timetable_id=timetable_id
    )

    db.add(activity)
    db.commit()
    db.refresh(activity)

    return {
        "message": "Faculty activity recorded successfully",
        "activity": {
            "id": activity.id,
            "faculty_id": activity.faculty_id,
            "activity_type": activity.activity_type,
            "activity_title": activity.activity_title,
            "description": activity.description,
            "student_id": activity.student_id,
            "timetable_id": activity.timetable_id,
            "created_at": activity.created_at
        }
    }


# =========================================================
# GET ACTIVITIES FOR ONE FACULTY
# =========================================================

@router.get("/faculty/{faculty_id}")
def get_faculty_activities(
    faculty_id: int,
    db: Session = Depends(get_db)
):
    activities = (
        db.query(FacultyActivity)
        .filter(FacultyActivity.faculty_id == faculty_id)
        .order_by(FacultyActivity.created_at.desc())
        .all()
    )

    return [
        {
            "id": activity.id,
            "faculty_id": activity.faculty_id,
            "activity_type": activity.activity_type,
            "activity_title": activity.activity_title,
            "description": activity.description,
            "student_id": activity.student_id,
            "timetable_id": activity.timetable_id,
            "created_at": activity.created_at
        }
        for activity in activities
    ]


# =========================================================
# GET ALL FACULTY ACTIVITIES
# ADMIN USE
# =========================================================

@router.get("/all")
def get_all_activities(
    db: Session = Depends(get_db)
):
    results = (
        db.query(
            FacultyActivity,
            Faculty,
            Student
        )
        .join(
            Faculty,
            FacultyActivity.faculty_id == Faculty.id
        )
        .outerjoin(
            Student,
            FacultyActivity.student_id == Student.id
        )
        .order_by(
            FacultyActivity.created_at.desc()
        )
        .all()
    )

    activities = []

    for activity, faculty, student in results:

        activities.append({
            "id": activity.id,

            "faculty_id": faculty.id,
            "faculty_name": faculty.faculty_name,
            "faculty_email": faculty.email,

            "activity_type": activity.activity_type,
            "activity_title": activity.activity_title,
            "description": activity.description,

            "student_id": student.id if student else None,
            "student_name": student.name if student else None,
            "student_usn": student.usn if student else None,

            "timetable_id": activity.timetable_id,

            "created_at": activity.created_at
        })

    return activities