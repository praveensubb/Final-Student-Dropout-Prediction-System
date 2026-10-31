from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import FacultyActivity, Faculty, Student, Timetable


# =========================================================
# ADMIN FACULTY ACTIVITIES ROUTER
# =========================================================

router = APIRouter(
    prefix="/admin/faculty-activities",
    tags=["Admin Faculty Activities"]
)


# =========================================================
# GET FACULTY ATTENDANCE ACTIVITIES
# =========================================================

@router.get("")
def get_faculty_attendance_activities(
    db: Session = Depends(get_db)
):
    """
    Admin Faculty Activity Monitoring.

    IMPORTANT:
    This endpoint returns ONLY attendance-related
    activities performed by faculty.

    Counselling, intervention, parent-alert and other
    activity types are excluded at the backend level.
    """

    # -----------------------------------------------------
    # Get only Attendance activities
    # -----------------------------------------------------

    rows = (
        db.query(
            FacultyActivity,
            Faculty,
            Student,
            Timetable
        )
        .outerjoin(
            Faculty,
            FacultyActivity.faculty_id == Faculty.id
        )
        .outerjoin(
            Student,
            FacultyActivity.student_id == Student.id
        )
        .outerjoin(
            Timetable,
            FacultyActivity.timetable_id == Timetable.id
        )
        .filter(
            FacultyActivity.activity_type == "Attendance"
        )
        .order_by(
            FacultyActivity.created_at.desc()
        )
        .all()
    )

    # -----------------------------------------------------
    # Prepare activity response
    # -----------------------------------------------------

    activities = []

    for activity, faculty, student, timetable in rows:

        activities.append({
            # Activity information
            "id": activity.id,

            # Faculty information
            "faculty_id": activity.faculty_id,
            "faculty_name": (
                faculty.faculty_name
                if faculty
                else "Unknown Faculty"
            ),
            "faculty_email": (
                faculty.email
                if faculty
                else ""
            ),

            # Activity information
            "activity_type": activity.activity_type,
            "activity_title": activity.activity_title,
            "description": (
                activity.description
                if activity.description
                else ""
            ),

            # Student information
            "student_id": activity.student_id,
            "student_name": (
                student.name
                if student
                else "Class / General"
            ),
            "student_usn": (
                student.usn
                if student
                else ""
            ),

            # Timetable information
            "timetable_id": activity.timetable_id,
            "subject": (
                timetable.subject
                if timetable
                else ""
            ),
            "class_name": (
                timetable.class_name
                if timetable
                else ""
            ),
            "class_type": (
                timetable.class_type
                if timetable
                else ""
            ),
            "room_no": (
                timetable.room_no
                if timetable
                else ""
            ),

            # Date and time
            "created_at": (
                activity.created_at.isoformat()
                if activity.created_at
                else None
            ),
        })

    # -----------------------------------------------------
    # Count unique faculty members
    # -----------------------------------------------------

    faculty_count = (
        db.query(
            FacultyActivity.faculty_id
        )
        .filter(
            FacultyActivity.activity_type == "Attendance"
        )
        .distinct()
        .count()
    )

    # -----------------------------------------------------
    # Return response
    # -----------------------------------------------------

    return {
        "total_activities": len(activities),

        "attendance_activities": len(
            activities
        ),

        "faculty_count": faculty_count,

        "activities": activities,
    }