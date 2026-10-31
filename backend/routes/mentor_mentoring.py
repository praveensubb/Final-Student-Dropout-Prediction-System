from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from models import (
    Mentor,
    Student,
    MentorStudent,
    MentorNote,
    MentorActivity,
    MentorFollowUp
)

router = APIRouter(
    prefix="/mentor",
    tags=["Mentoring"]
)


# =========================================================
# CHECK MENTOR
# =========================================================

def verify_mentor(db: Session, mentor_id: int):
    mentor = db.query(Mentor).filter(
        Mentor.id == mentor_id
    ).first()

    if not mentor:
        raise HTTPException(
            status_code=404,
            detail="Mentor not found"
        )

    return mentor


# =========================================================
# CHECK ASSIGNED STUDENT
# =========================================================

def verify_assigned_student(
    db: Session,
    mentor_id: int,
    student_id: int
):
    assignment = db.query(MentorStudent).filter(
        MentorStudent.mentor_id == mentor_id,
        MentorStudent.student_id == student_id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=403,
            detail="This student is not assigned to this mentor"
        )

    student = db.query(Student).filter(
        Student.id == student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    return student


# =========================================================
# GET ASSIGNED STUDENTS FOR MENTORING
# =========================================================

@router.get("/mentoring/students")
def get_mentoring_students(
    mentor_id: int,
    db: Session = Depends(get_db)
):
    mentor = verify_mentor(db, mentor_id)

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

        cgpa = (
            float(student.cgpa)
            if student.cgpa is not None
            else None
        )

        attendance = (
            float(student.attendance)
            if student.attendance is not None
            else None
        )

        backlogs = student.backlogs or 0

        # Risk calculation
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


# =========================================================
# ADD MENTOR NOTE
# =========================================================

@router.post("/mentoring/notes")
def add_mentor_note(
    mentor_id: int,
    student_id: int,
    note: str,
    db: Session = Depends(get_db)
):

    verify_mentor(db, mentor_id)

    verify_assigned_student(
        db,
        mentor_id,
        student_id
    )

    if not note.strip():
        raise HTTPException(
            status_code=400,
            detail="Note cannot be empty"
        )

    new_note = MentorNote(
        mentor_id=mentor_id,
        student_id=student_id,
        note=note.strip()
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return {
        "message": "Mentor note added successfully",
        "note": {
            "id": new_note.id,
            "mentor_id": new_note.mentor_id,
            "student_id": new_note.student_id,
            "note": new_note.note,
            "created_at": new_note.created_at
        }
    }


# =========================================================
# GET MENTOR NOTES
# =========================================================

@router.get("/mentoring/notes/{student_id}")
def get_mentor_notes(
    student_id: int,
    mentor_id: int,
    db: Session = Depends(get_db)
):

    verify_mentor(db, mentor_id)

    verify_assigned_student(
        db,
        mentor_id,
        student_id
    )

    notes = db.query(MentorNote).filter(
        MentorNote.mentor_id == mentor_id,
        MentorNote.student_id == student_id
    ).order_by(
        MentorNote.created_at.desc()
    ).all()

    return [
        {
            "id": note.id,
            "student_id": note.student_id,
            "note": note.note,
            "created_at": note.created_at
        }
        for note in notes
    ]


# =========================================================
# ADD MENTOR ACTIVITY
# =========================================================

@router.post("/mentoring/activities")
def add_mentor_activity(
    mentor_id: int,
    student_id: int,
    activity_type: str,
    description: str,
    db: Session = Depends(get_db)
):

    verify_mentor(db, mentor_id)

    verify_assigned_student(
        db,
        mentor_id,
        student_id
    )

    if not activity_type.strip():
        raise HTTPException(
            status_code=400,
            detail="Activity type is required"
        )

    if not description.strip():
        raise HTTPException(
            status_code=400,
            detail="Activity description is required"
        )

    activity = MentorActivity(
        mentor_id=mentor_id,
        student_id=student_id,
        activity_type=activity_type.strip(),
        description=description.strip()
    )

    db.add(activity)
    db.commit()
    db.refresh(activity)

    return {
        "message": "Mentoring activity recorded successfully",
        "activity": {
            "id": activity.id,
            "student_id": activity.student_id,
            "activity_type": activity.activity_type,
            "description": activity.description,
            "activity_date": activity.activity_date
        }
    }


# =========================================================
# GET MENTOR ACTIVITIES
# =========================================================

@router.get("/mentoring/activities/{student_id}")
def get_mentor_activities(
    student_id: int,
    mentor_id: int,
    db: Session = Depends(get_db)
):

    verify_mentor(db, mentor_id)

    verify_assigned_student(
        db,
        mentor_id,
        student_id
    )

    activities = db.query(
        MentorActivity
    ).filter(
        MentorActivity.mentor_id == mentor_id,
        MentorActivity.student_id == student_id
    ).order_by(
        MentorActivity.activity_date.desc()
    ).all()

    return [
        {
            "id": activity.id,
            "student_id": activity.student_id,
            "activity_type": activity.activity_type,
            "description": activity.description,
            "activity_date": activity.activity_date
        }
        for activity in activities
    ]


# =========================================================
# CREATE FOLLOW-UP
# =========================================================

@router.post("/mentoring/followups")
def create_followup(
    mentor_id: int,
    student_id: int,
    follow_up_date: str,
    purpose: str = "",
    db: Session = Depends(get_db)
):

    verify_mentor(db, mentor_id)

    verify_assigned_student(
        db,
        mentor_id,
        student_id
    )

    try:
        parsed_date = datetime.fromisoformat(
            follow_up_date
        )

    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid date format. "
                "Use YYYY-MM-DDTHH:MM:SS"
            )
        )

    followup = MentorFollowUp(
        mentor_id=mentor_id,
        student_id=student_id,
        follow_up_date=parsed_date,
        purpose=purpose.strip() if purpose else "",
        status="Pending"
    )

    db.add(followup)
    db.commit()
    db.refresh(followup)

    return {
        "message": "Follow-up scheduled successfully",
        "followup": {
            "id": followup.id,
            "student_id": followup.student_id,
            "follow_up_date": followup.follow_up_date,
            "purpose": followup.purpose,
            "status": followup.status
        }
    }


# =========================================================
# GET FOLLOW-UPS
# =========================================================

@router.get("/mentoring/followups/{student_id}")
def get_followups(
    student_id: int,
    mentor_id: int,
    db: Session = Depends(get_db)
):

    verify_mentor(db, mentor_id)

    verify_assigned_student(
        db,
        mentor_id,
        student_id
    )

    followups = db.query(
        MentorFollowUp
    ).filter(
        MentorFollowUp.mentor_id == mentor_id,
        MentorFollowUp.student_id == student_id
    ).order_by(
        MentorFollowUp.follow_up_date.asc()
    ).all()

    return [
        {
            "id": followup.id,
            "student_id": followup.student_id,
            "follow_up_date": followup.follow_up_date,
            "purpose": followup.purpose,
            "status": followup.status
        }
        for followup in followups
    ]


# =========================================================
# UPDATE FOLLOW-UP STATUS
# =========================================================

@router.put("/mentoring/followups/{followup_id}")
def update_followup_status(
    followup_id: int,
    mentor_id: int,
    status: str,
    db: Session = Depends(get_db)
):

    verify_mentor(db, mentor_id)

    followup = db.query(
        MentorFollowUp
    ).filter(
        MentorFollowUp.id == followup_id,
        MentorFollowUp.mentor_id == mentor_id
    ).first()

    if not followup:
        raise HTTPException(
            status_code=404,
            detail="Follow-up not found"
        )

    allowed_statuses = [
        "Pending",
        "Completed",
        "Cancelled"
    ]

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid status. "
                "Use Pending, Completed or Cancelled."
            )
        )

    followup.status = status

    db.commit()
    db.refresh(followup)

    return {
        "message": "Follow-up status updated successfully",
        "followup": {
            "id": followup.id,
            "student_id": followup.student_id,
            "follow_up_date": followup.follow_up_date,
            "purpose": followup.purpose,
            "status": followup.status
        }
    }