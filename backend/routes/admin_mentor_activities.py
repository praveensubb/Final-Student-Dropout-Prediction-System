from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import (
    Mentor,
    Student,
    MentorNote,
    MentorActivity,
    MentorFollowUp,
    MentorIntervention
)

router = APIRouter(
    prefix="/admin/mentor-activities",
    tags=["Admin Mentor Activities"]
)


@router.get("")
def get_admin_mentor_activities(
    db: Session = Depends(get_db)
):
    """
    Admin Mentor Activity Monitoring

    Includes:
    - Mentor Notes
    - Mentoring Activities
    - Follow-ups
    - Interventions

    Does NOT include faculty attendance.
    """

    # =========================================================
    # MENTOR NOTES
    # =========================================================

    note_rows = (
        db.query(
            MentorNote,
            Mentor,
            Student
        )
        .outerjoin(
            Mentor,
            MentorNote.mentor_id == Mentor.id
        )
        .outerjoin(
            Student,
            MentorNote.student_id == Student.id
        )
        .order_by(
            MentorNote.created_at.desc()
        )
        .all()
    )

    notes = []

    for note, mentor, student in note_rows:

        notes.append({
            "id": note.id,
            "mentor_id": note.mentor_id,
            "mentor_name": (
                mentor.mentor_name
                if mentor
                else "Unknown Mentor"
            ),
            "mentor_email": (
                mentor.email
                if mentor
                else ""
            ),
            "student_id": note.student_id,
            "student_name": (
                student.name
                if student
                else "Unknown Student"
            ),
            "student_usn": (
                student.usn
                if student
                else ""
            ),
            "note": note.note,
            "created_at": (
                note.created_at.isoformat()
                if note.created_at
                else None
            )
        })


    # =========================================================
    # MENTORING ACTIVITIES
    # =========================================================

    activity_rows = (
        db.query(
            MentorActivity,
            Mentor,
            Student
        )
        .outerjoin(
            Mentor,
            MentorActivity.mentor_id == Mentor.id
        )
        .outerjoin(
            Student,
            MentorActivity.student_id == Student.id
        )
        .order_by(
            MentorActivity.activity_date.desc()
        )
        .all()
    )

    activities = []

    for activity, mentor, student in activity_rows:

        activities.append({
            "id": activity.id,
            "mentor_id": activity.mentor_id,
            "mentor_name": (
                mentor.mentor_name
                if mentor
                else "Unknown Mentor"
            ),
            "mentor_email": (
                mentor.email
                if mentor
                else ""
            ),
            "student_id": activity.student_id,
            "student_name": (
                student.name
                if student
                else "Unknown Student"
            ),
            "student_usn": (
                student.usn
                if student
                else ""
            ),
            "activity_type": activity.activity_type,
            "description": activity.description,
            "activity_date": (
                activity.activity_date.isoformat()
                if activity.activity_date
                else None
            )
        })


    # =========================================================
    # FOLLOW-UPS
    # =========================================================

    followup_rows = (
        db.query(
            MentorFollowUp,
            Mentor,
            Student
        )
        .outerjoin(
            Mentor,
            MentorFollowUp.mentor_id == Mentor.id
        )
        .outerjoin(
            Student,
            MentorFollowUp.student_id == Student.id
        )
        .order_by(
            MentorFollowUp.follow_up_date.asc()
        )
        .all()
    )

    followups = []

    for followup, mentor, student in followup_rows:

        followups.append({
            "id": followup.id,
            "mentor_id": followup.mentor_id,
            "mentor_name": (
                mentor.mentor_name
                if mentor
                else "Unknown Mentor"
            ),
            "mentor_email": (
                mentor.email
                if mentor
                else ""
            ),
            "student_id": followup.student_id,
            "student_name": (
                student.name
                if student
                else "Unknown Student"
            ),
            "student_usn": (
                student.usn
                if student
                else ""
            ),
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
            )
        })


    # =========================================================
    # INTERVENTIONS
    # =========================================================

    intervention_rows = (
        db.query(
            MentorIntervention,
            Mentor,
            Student
        )
        .outerjoin(
            Mentor,
            MentorIntervention.mentor_id == Mentor.id
        )
        .outerjoin(
            Student,
            MentorIntervention.student_id == Student.id
        )
        .order_by(
            MentorIntervention.created_at.desc()
        )
        .all()
    )

    interventions = []

    for intervention, mentor, student in intervention_rows:

        interventions.append({
            "id": intervention.id,
            "mentor_id": intervention.mentor_id,
            "mentor_name": (
                mentor.mentor_name
                if mentor
                else "Unknown Mentor"
            ),
            "mentor_email": (
                mentor.email
                if mentor
                else ""
            ),
            "student_id": intervention.student_id,
            "student_name": (
                student.name
                if student
                else "Unknown Student"
            ),
            "student_usn": (
                student.usn
                if student
                else ""
            ),
            "intervention_type": intervention.intervention_type,
            "priority": intervention.priority,
            "description": intervention.description,
            "target_date": (
                intervention.target_date.isoformat()
                if intervention.target_date
                else None
            ),
            "status": intervention.status,
            "outcome": intervention.outcome or "",
            "created_at": (
                intervention.created_at.isoformat()
                if intervention.created_at
                else None
            ),
            "updated_at": (
                intervention.updated_at.isoformat()
                if intervention.updated_at
                else None
            )
        })


    # =========================================================
    # UNIQUE MENTORS
    # =========================================================

    mentor_ids = set()

    for item in notes:
        mentor_ids.add(item["mentor_id"])

    for item in activities:
        mentor_ids.add(item["mentor_id"])

    for item in followups:
        mentor_ids.add(item["mentor_id"])

    for item in interventions:
        mentor_ids.add(item["mentor_id"])

    mentor_ids.discard(None)


    # =========================================================
    # FINAL RESPONSE
    # =========================================================

    return {
        "total_notes": len(notes),

        "total_activities": len(activities),

        "total_followups": len(followups),

        "total_interventions": len(interventions),

        "total_mentor_activities": (
            len(notes)
            + len(activities)
            + len(followups)
            + len(interventions)
        ),

        "mentor_count": len(mentor_ids),

        "notes": notes,

        "activities": activities,

        "followups": followups,

        "interventions": interventions
    }