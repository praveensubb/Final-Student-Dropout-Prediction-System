from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import date

from database import SessionLocal
from models import Intervention, Student, FacultyStudent


router = APIRouter(
    prefix="/interventions",
    tags=["Interventions"]
)


# =========================================================
# REQUEST MODEL
# =========================================================

class InterventionCreate(BaseModel):
    faculty_id: int
    student_id: int

    intervention_type: str

    priority: str = "Medium"

    status: str = "Active"

    risk_factor: Optional[str] = None

    intervention_action: Optional[str] = None

    follow_up_date: Optional[date] = None

    description: Optional[str] = None


# =========================================================
# CREATE INTERVENTION
# =========================================================

@router.post("/")
def create_intervention(data: InterventionCreate):

    db = SessionLocal()

    try:

        # Check faculty
        faculty_assignment = (
            db.query(FacultyStudent)
            .filter(
                FacultyStudent.faculty_id == data.faculty_id
            )
            .first()
        )

        if not faculty_assignment:
            raise HTTPException(
                status_code=404,
                detail="Faculty not found."
            )

        # Check student
        student = (
            db.query(Student)
            .filter(
                Student.id == data.student_id
            )
            .first()
        )

        if not student:
            raise HTTPException(
                status_code=404,
                detail="Student not found."
            )

        # Make sure this student is assigned
        # to this faculty
        assignment = (
            db.query(FacultyStudent)
            .filter(
                FacultyStudent.faculty_id == data.faculty_id,
                FacultyStudent.student_id == data.student_id
            )
            .first()
        )

        if not assignment:
            raise HTTPException(
                status_code=403,
                detail=(
                    "This student is not assigned "
                    "to this faculty."
                )
            )

        # Validate priority
        if data.priority not in [
            "Low",
            "Medium",
            "High"
        ]:
            raise HTTPException(
                status_code=400,
                detail="Invalid priority."
            )

        # Validate status
        if data.status not in [
            "Active",
            "Completed"
        ]:
            raise HTTPException(
                status_code=400,
                detail="Invalid status."
            )

        # Create intervention
        intervention = Intervention(
            faculty_id=data.faculty_id,
            student_id=data.student_id,
            intervention_type=data.intervention_type,
            priority=data.priority,
            status=data.status,
            risk_factor=data.risk_factor,
            intervention_action=data.intervention_action,
            follow_up_date=data.follow_up_date,
            description=data.description
        )

        db.add(intervention)

        db.commit()

        db.refresh(intervention)

        return {
            "message": "Intervention created successfully",
            "id": intervention.id,
            "faculty_id": intervention.faculty_id,
            "student_id": intervention.student_id,
            "intervention_type":
                intervention.intervention_type,
            "priority":
                intervention.priority,
            "status":
                intervention.status,
            "risk_factor":
                intervention.risk_factor,
            "intervention_action":
                intervention.intervention_action,
            "follow_up_date":
                intervention.follow_up_date,
            "description":
                intervention.description,
            "created_at":
                intervention.created_at
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()

        print(
            "CREATE INTERVENTION ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        db.close()


# =========================================================
# GET ALL INTERVENTIONS FOR FACULTY
# =========================================================

@router.get("/faculty/{faculty_id}")
def get_faculty_interventions(
    faculty_id: int
):

    db = SessionLocal()

    try:

        rows = (
            db.query(
                Intervention,
                Student
            )
            .join(
                Student,
                Intervention.student_id == Student.id
            )
            .filter(
                Intervention.faculty_id == faculty_id
            )
            .order_by(
                Intervention.created_at.desc()
            )
            .all()
        )

        result = []

        for intervention, student in rows:

            result.append({
                "id": intervention.id,

                "faculty_id":
                    intervention.faculty_id,

                "student_id":
                    intervention.student_id,

                "student_name":
                    student.name,

                "usn":
                    student.usn,

                "intervention_type":
                    intervention.intervention_type,

                "priority":
                    intervention.priority,

                "status":
                    intervention.status,

                "risk_factor":
                    intervention.risk_factor,

                "intervention_action":
                    intervention.intervention_action,

                "follow_up_date":
                    (
                        intervention.follow_up_date.isoformat()
                        if intervention.follow_up_date
                        else None
                    ),

                "description":
                    intervention.description,

                "created_at":
                    (
                        intervention.created_at.isoformat()
                        if intervention.created_at
                        else None
                    )
            })

        return result

    except Exception as e:

        print(
            "GET INTERVENTIONS ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        db.close()


# =========================================================
# UPDATE INTERVENTION STATUS
# =========================================================

@router.put("/{intervention_id}/status")
def update_intervention_status(
    intervention_id: int,
    status: str
):

    db = SessionLocal()

    try:

        intervention = (
            db.query(Intervention)
            .filter(
                Intervention.id ==
                intervention_id
            )
            .first()
        )

        if not intervention:

            raise HTTPException(
                status_code=404,
                detail="Intervention not found."
            )

        if status not in [
            "Active",
            "Completed"
        ]:

            raise HTTPException(
                status_code=400,
                detail="Invalid status."
            )

        intervention.status = status

        db.commit()

        db.refresh(intervention)

        return {
            "message":
                "Intervention status updated",

            "id":
                intervention.id,

            "status":
                intervention.status
        }

    except HTTPException:
        raise

    except Exception as e:

        db.rollback()

        print(
            "STATUS UPDATE ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        db.close()