from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import (
    Mentor,
    MentorStudent,
    Student,
    MentorNote,
    MentorActivity,
    MentorFollowUp,
    MentorIntervention,
)

router = APIRouter(
    prefix="/admin/mentor-activities",
    tags=["Admin Mentor Activity Details"],
)


@router.get("/mentor/{mentor_id}")
def get_mentor_activity_details(
    mentor_id: int,
    db: Session = Depends(get_db),
):
    # =========================================================
    # GET MENTOR
    # =========================================================

    mentor = (
        db.query(Mentor)
        .filter(Mentor.id == mentor_id)
        .first()
    )

    if not mentor:
        raise HTTPException(
            status_code=404,
            detail="Mentor not found"
        )

    # =========================================================
    # ASSIGNED STUDENTS
    # =========================================================

    assignment_rows = (
        db.query(MentorStudent, Student)
        .join(
            Student,
            MentorStudent.student_id == Student.id
        )
        .filter(
            MentorStudent.mentor_id == mentor_id
        )
        .order_by(Student.name.asc())
        .all()
    )

    students = []

    for assignment, student in assignment_rows:
        students.append({
            "id": student.id,
            "usn": student.usn,
            "name": student.name,
            "email": student.email,
            "branch": student.branch,
            "semester": student.semester,
            "section": student.section,
            "cgpa": (
                float(student.cgpa)
                if student.cgpa is not None
                else None
            ),
            "attendance": (
                float(student.attendance)
                if student.attendance is not None
                else None
            ),
            "backlogs": student.backlogs,
            "risk_status": getattr(
                student,
                "risk_status",
                None
            ),
            "parent_name": getattr(
                student,
                "parent_name",
                None
            ),
            "parent_mobile": getattr(
                student,
                "parent_mobile",
                None
            ),
        })

    # =========================================================
    # MENTOR NOTES
    # =========================================================

    note_rows = (
        db.query(MentorNote, Student)
        .join(
            Student,
            MentorNote.student_id == Student.id
        )
        .filter(
            MentorNote.mentor_id == mentor_id
        )
        .order_by(
            MentorNote.created_at.desc()
        )
        .all()
    )

    notes = []

    for note, student in note_rows:
        notes.append({
            "id": note.id,
            "mentor_id": note.mentor_id,
            "student_id": note.student_id,
            "student_name": student.name,
            "student_usn": student.usn,
            "note": note.note,
            "created_at": (
                note.created_at.isoformat()
                if note.created_at
                else None
            ),
        })

    # =========================================================
    # MENTOR ACTIVITIES
    # =========================================================

    activity_rows = (
        db.query(MentorActivity, Student)
        .join(
            Student,
            MentorActivity.student_id == Student.id
        )
        .filter(
            MentorActivity.mentor_id == mentor_id
        )
        .order_by(
            MentorActivity.activity_date.desc()
        )
        .all()
    )

    activities = []

    for activity, student in activity_rows:
        activities.append({
            "id": activity.id,
            "mentor_id": activity.mentor_id,
            "student_id": activity.student_id,
            "student_name": student.name,
            "student_usn": student.usn,
            "activity_type": activity.activity_type,
            "description": activity.description or "",
            "activity_date": (
                activity.activity_date.isoformat()
                if activity.activity_date
                else None
            ),
        })

    # =========================================================
    # PARENT ALERTS
    # Parent alerts are stored as MentorActivity
    # with activity_type = "Parent Alert"
    # =========================================================

    parent_alerts = [
        activity
        for activity in activities
        if str(
            activity.get("activity_type", "")
        ).strip().lower() == "parent alert"
    ]

    # =========================================================
    # FOLLOW-UPS
    # =========================================================

    followup_rows = (
        db.query(MentorFollowUp, Student)
        .join(
            Student,
            MentorFollowUp.student_id == Student.id
        )
        .filter(
            MentorFollowUp.mentor_id == mentor_id
        )
        .order_by(
            MentorFollowUp.follow_up_date.asc()
        )
        .all()
    )

    followups = []

    for followup, student in followup_rows:
        followups.append({
            "id": followup.id,
            "mentor_id": followup.mentor_id,
            "student_id": followup.student_id,
            "student_name": student.name,
            "student_usn": student.usn,
            "follow_up_date": (
                followup.follow_up_date.isoformat()
                if followup.follow_up_date
                else None
            ),
            "purpose": followup.purpose or "",
            "status": followup.status or "Pending",
            "created_at": (
                followup.created_at.isoformat()
                if followup.created_at
                else None
            ),
        })

    # =========================================================
    # INTERVENTIONS
    # =========================================================

    intervention_rows = (
        db.query(MentorIntervention, Student)
        .join(
            Student,
            MentorIntervention.student_id == Student.id
        )
        .filter(
            MentorIntervention.mentor_id == mentor_id
        )
        .order_by(
            MentorIntervention.created_at.desc()
        )
        .all()
    )

    interventions = []

    for intervention, student in intervention_rows:
        interventions.append({
            "id": intervention.id,
            "mentor_id": intervention.mentor_id,
            "student_id": intervention.student_id,
            "student_name": student.name,
            "student_usn": student.usn,
            "intervention_type": (
                intervention.intervention_type
            ),
            "priority": (
                intervention.priority or "Medium"
            ),
            "description": (
                intervention.description or ""
            ),
            "target_date": (
                intervention.target_date.isoformat()
                if intervention.target_date
                else None
            ),
            "status": (
                intervention.status or "Planned"
            ),
            "outcome": (
                intervention.outcome or ""
            ),
            "created_at": (
                intervention.created_at.isoformat()
                if intervention.created_at
                else None
            ),
            "updated_at": (
                intervention.updated_at.isoformat()
                if intervention.updated_at
                else None
            ),
        })

    # =========================================================
    # RESPONSE
    # =========================================================

    return {
        "mentor": {
            "id": mentor.id,
            "name": mentor.mentor_name,
            "email": mentor.email,
            "department": mentor.department,
        },

        "students": students,

        "notes": notes,

        "activities": activities,

        "parent_alerts": parent_alerts,

        "followups": followups,

        "interventions": interventions,

        "summary": {
            "students": len(students),
            "notes": len(notes),
            "activities": len(activities),
            "parent_alerts": len(parent_alerts),
            "followups": len(followups),
            "interventions": len(interventions),
        },
    }