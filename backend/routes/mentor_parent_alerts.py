from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Mentor, MentorStudent, Student, MentorActivity

router = APIRouter(
    prefix="/mentor/parent-alerts",
    tags=["Mentor Parent Alerts"]
)


def verify_mentor(db: Session, mentor_id: int):
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    return mentor


def verify_assignment(db: Session, mentor_id: int, student_id: int):
    assignment = (
        db.query(MentorStudent)
        .filter(
            MentorStudent.mentor_id == mentor_id,
            MentorStudent.student_id == student_id
        )
        .first()
    )
    if not assignment:
        raise HTTPException(
            status_code=403,
            detail="Student is not assigned to this mentor"
        )
    return assignment


@router.get("")
def get_parent_alert_data(
    mentor_id: int,
    db: Session = Depends(get_db)
):
    verify_mentor(db, mentor_id)

    assignments = (
        db.query(MentorStudent, Student)
        .join(Student, MentorStudent.student_id == Student.id)
        .filter(MentorStudent.mentor_id == mentor_id)
        .order_by(Student.name.asc())
        .all()
    )

    students = []
    student_ids = []

    for assignment, student in assignments:
        student_ids.append(student.id)
        students.append({
            "id": student.id,
            "usn": student.usn,
            "name": student.name,
            "email": student.email,
            "branch": student.branch,
            "semester": student.semester,
            "section": student.section,
            "cgpa": float(student.cgpa) if student.cgpa is not None else None,
            "attendance": float(student.attendance) if student.attendance is not None else None,
            "backlogs": student.backlogs,
            "parent_name": student.parent_name,
            "parent_mobile": student.parent_mobile,
        })

    alerts = []
    if student_ids:
        rows = (
            db.query(MentorActivity, Student)
            .join(Student, MentorActivity.student_id == Student.id)
            .filter(
                MentorActivity.mentor_id == mentor_id,
                MentorActivity.student_id.in_(student_ids),
                MentorActivity.activity_type == "Parent Alert"
            )
            .order_by(MentorActivity.activity_date.desc())
            .all()
        )

        for activity, student in rows:
            alerts.append({
                "id": activity.id,
                "mentor_id": activity.mentor_id,
                "student_id": activity.student_id,
                "student_name": student.name,
                "student_usn": student.usn,
                "activity_type": activity.activity_type,
                "activity_title": "Parent Alert",
                "description": activity.description or "",
                "activity_date": (
                    activity.activity_date.isoformat()
                    if activity.activity_date else None
                ),
            })

    return {
        "students": students,
        "alerts": alerts,
        "total_students": len(students),
        "total_alerts": len(alerts),
    }


@router.post("")
def create_parent_alert(
    mentor_id: int,
    student_id: int,
    alert_type: str,
    priority: str,
    message: str,
    follow_up_date: str | None = None,
    db: Session = Depends(get_db)
):
    verify_mentor(db, mentor_id)
    verify_assignment(db, mentor_id, student_id)

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    alert_type = alert_type.strip()
    priority = priority.strip()
    message = message.strip()

    if not alert_type:
        raise HTTPException(status_code=400, detail="Alert type is required")

    if priority not in {"Low", "Medium", "High"}:
        raise HTTPException(
            status_code=400,
            detail="Priority must be Low, Medium, or High"
        )

    if not message:
        raise HTTPException(status_code=400, detail="Alert message is required")

    description = "\n".join([
        f"Alert Type: {alert_type}",
        f"Priority: {priority}",
        f"Message: {message}",
        f"Follow-up Date: {follow_up_date or 'Not specified'}",
    ])

    activity = MentorActivity(
        mentor_id=mentor_id,
        student_id=student_id,
        activity_type="Parent Alert",
        description=description,
    )

    db.add(activity)
    db.commit()
    db.refresh(activity)

    return {
        "message": "Parent alert recorded successfully",
        "alert": {
            "id": activity.id,
            "mentor_id": activity.mentor_id,
            "student_id": activity.student_id,
            "student_name": student.name,
            "student_usn": student.usn,
            "activity_type": activity.activity_type,
            "activity_title": "Parent Alert",
            "description": activity.description,
            "activity_date": (
                activity.activity_date.isoformat()
                if activity.activity_date else None
            ),
        },
        "parent": {
            "name": student.parent_name,
            "mobile": student.parent_mobile,
        },
    }
