from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from database import get_db

from models import (
    Mentor,
    Student,
    MentorStudent,
    MentorIntervention
)


router = APIRouter(
    prefix="/mentor",
    tags=["Mentor Interventions"]
)


# =========================================================
# VERIFY MENTOR
# =========================================================

def verify_mentor(
    db: Session,
    mentor_id: int
):
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
# VERIFY ASSIGNED STUDENT
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
# GET STUDENT INTERVENTIONS
# =========================================================

@router.get("/interventions/{student_id}")
def get_student_interventions(
    student_id: int,
    mentor_id: int,
    db: Session = Depends(get_db)
):

    verify_mentor(
        db,
        mentor_id
    )

    verify_assigned_student(
        db,
        mentor_id,
        student_id
    )

    interventions = db.query(
        MentorIntervention
    ).filter(
        MentorIntervention.mentor_id == mentor_id,
        MentorIntervention.student_id == student_id
    ).order_by(
        MentorIntervention.created_at.desc()
    ).all()

    return [
        {
            "id": intervention.id,
            "student_id": intervention.student_id,
            "intervention_type":
                intervention.intervention_type,
            "priority":
                intervention.priority,
            "description":
                intervention.description,
            "target_date":
                intervention.target_date,
            "status":
                intervention.status,
            "outcome":
                intervention.outcome,
            "created_at":
                intervention.created_at,
            "updated_at":
                intervention.updated_at
        }
        for intervention in interventions
    ]


# =========================================================
# CREATE INTERVENTION
# =========================================================

@router.post("/interventions")
def create_intervention(
    mentor_id: int,
    student_id: int,
    intervention_type: str,
    priority: str,
    description: str,
    target_date: str = None,
    db: Session = Depends(get_db)
):

    verify_mentor(
        db,
        mentor_id
    )

    verify_assigned_student(
        db,
        mentor_id,
        student_id
    )

    if not intervention_type.strip():
        raise HTTPException(
            status_code=400,
            detail="Intervention type is required"
        )

    if not description.strip():
        raise HTTPException(
            status_code=400,
            detail="Intervention description is required"
        )

    allowed_priorities = [
        "Low",
        "Medium",
        "High"
    ]

    if priority not in allowed_priorities:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid priority. "
                "Use Low, Medium or High."
            )
        )

    parsed_target_date = None

    if target_date:

        try:
            parsed_target_date = date.fromisoformat(
                target_date
            )

        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid target date. "
                    "Use YYYY-MM-DD."
                )
            )

    intervention = MentorIntervention(
        mentor_id=mentor_id,
        student_id=student_id,
        intervention_type=intervention_type.strip(),
        priority=priority,
        description=description.strip(),
        target_date=parsed_target_date,
        status="Planned"
    )

    db.add(intervention)

    db.commit()

    db.refresh(intervention)

    return {
        "message":
            "Intervention created successfully",

        "intervention": {
            "id":
                intervention.id,

            "student_id":
                intervention.student_id,

            "intervention_type":
                intervention.intervention_type,

            "priority":
                intervention.priority,

            "description":
                intervention.description,

            "target_date":
                intervention.target_date,

            "status":
                intervention.status,

            "outcome":
                intervention.outcome,

            "created_at":
                intervention.created_at
        }
    }


# =========================================================
# UPDATE INTERVENTION
# =========================================================

@router.put("/interventions/{intervention_id}")
def update_intervention(
    intervention_id: int,
    mentor_id: int,
    status: str,
    outcome: str = "",
    db: Session = Depends(get_db)
):

    verify_mentor(
        db,
        mentor_id
    )

    intervention = db.query(
        MentorIntervention
    ).filter(
        MentorIntervention.id == intervention_id,
        MentorIntervention.mentor_id == mentor_id
    ).first()

    if not intervention:
        raise HTTPException(
            status_code=404,
            detail="Intervention not found"
        )

    allowed_statuses = [
        "Planned",
        "In Progress",
        "Completed",
        "Cancelled"
    ]

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid status. "
                "Use Planned, In Progress, "
                "Completed or Cancelled."
            )
        )

    intervention.status = status

    if outcome:
        intervention.outcome = outcome.strip()

    db.commit()

    db.refresh(intervention)

    return {
        "message":
            "Intervention updated successfully",

        "intervention": {
            "id":
                intervention.id,

            "student_id":
                intervention.student_id,

            "intervention_type":
                intervention.intervention_type,

            "priority":
                intervention.priority,

            "description":
                intervention.description,

            "target_date":
                intervention.target_date,

            "status":
                intervention.status,

            "outcome":
                intervention.outcome,

            "created_at":
                intervention.created_at,

            "updated_at":
                intervention.updated_at
        }
    }