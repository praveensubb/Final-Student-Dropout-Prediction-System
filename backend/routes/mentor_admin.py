from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Mentor, Student, MentorStudent


router = APIRouter(
    prefix="/mentor-admin",
    tags=["Mentor Assignment"]
)


# =========================================================
# GET ALL MENTORS
# =========================================================

@router.get("/mentors")
def get_mentors(
    db: Session = Depends(get_db)
):

    mentors = db.query(Mentor).order_by(
        Mentor.id
    ).all()

    return [
        {
            "id": mentor.id,
            "name": mentor.mentor_name,
            "email": mentor.email,
            "department": mentor.department
        }
        for mentor in mentors
    ]


# =========================================================
# GET ALL STUDENTS WITH MENTOR ASSIGNMENT
# =========================================================

@router.get("/students")
def get_students(
    db: Session = Depends(get_db)
):

    students = db.query(Student).order_by(
        Student.id
    ).all()

    result = []

    for student in students:

        assignment = db.query(MentorStudent).filter(
            MentorStudent.student_id == student.id
        ).first()

        mentor_id = None
        mentor_name = None

        if assignment:

            mentor = db.query(Mentor).filter(
                Mentor.id == assignment.mentor_id
            ).first()

            if mentor:

                mentor_id = mentor.id
                mentor_name = mentor.mentor_name

        result.append({

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

            "mentor_id": mentor_id,
            "mentor_name": mentor_name
        })

    return result


# =========================================================
# ASSIGN STUDENT TO MENTOR
# =========================================================

@router.post("/assign")
def assign_student_to_mentor(
    mentor_id: int,
    student_id: int,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # CHECK MENTOR
    # -----------------------------------------------------

    mentor = db.query(Mentor).filter(
        Mentor.id == mentor_id
    ).first()

    if not mentor:

        raise HTTPException(
            status_code=404,
            detail="Mentor not found"
        )


    # -----------------------------------------------------
    # CHECK STUDENT
    # -----------------------------------------------------

    student = db.query(Student).filter(
        Student.id == student_id
    ).first()

    if not student:

        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )


    # -----------------------------------------------------
    # CHECK EXISTING ASSIGNMENT
    # -----------------------------------------------------

    existing = db.query(MentorStudent).filter(
        MentorStudent.student_id == student_id
    ).first()


    # -----------------------------------------------------
    # UPDATE EXISTING ASSIGNMENT
    # -----------------------------------------------------

    if existing:

        existing.mentor_id = mentor_id

        db.commit()
        db.refresh(existing)

        return {
            "message": "Student mentor assignment updated",
            "student_id": student_id,
            "mentor_id": mentor_id
        }


    # -----------------------------------------------------
    # CREATE NEW ASSIGNMENT
    # -----------------------------------------------------

    assignment = MentorStudent(
        mentor_id=mentor_id,
        student_id=student_id
    )

    db.add(assignment)

    db.commit()
    db.refresh(assignment)

    return {
        "message": "Student assigned to mentor successfully",
        "student_id": student_id,
        "mentor_id": mentor_id
    }


# =========================================================
# REMOVE STUDENT FROM MENTOR
# =========================================================

@router.delete("/assignment/{student_id}")
def remove_mentor_assignment(
    student_id: int,
    db: Session = Depends(get_db)
):

    assignment = db.query(MentorStudent).filter(
        MentorStudent.student_id == student_id
    ).first()

    if not assignment:

        raise HTTPException(
            status_code=404,
            detail="Student is not assigned to any mentor"
        )

    db.delete(assignment)

    db.commit()

    return {
        "message": "Student mentor assignment removed"
    }