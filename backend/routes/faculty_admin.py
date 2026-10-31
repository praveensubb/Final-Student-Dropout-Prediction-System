from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Faculty, Student, FacultyStudent

router = APIRouter(
    prefix="/faculty-admin",
    tags=["Faculty Assignment"]
)


# =========================================================
# DATABASE
# =========================================================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================================================
# GET ALL FACULTY
# =========================================================

@router.get("/faculty")
def get_faculty(db: Session = Depends(get_db)):

    faculty = db.query(Faculty).order_by(Faculty.id).all()

    return [
        {
            "id": f.id,
            "name": f.faculty_name,
            "email": f.email,
            "department": f.department
        }
        for f in faculty
    ]


# =========================================================
# GET ALL STUDENTS
# =========================================================

@router.get("/students")
def get_students(db: Session = Depends(get_db)):

    students = db.query(Student).order_by(Student.id).all()

    result = []

    for student in students:

        assignment = db.query(FacultyStudent).filter(
            FacultyStudent.student_id == student.id
        ).first()

        faculty_name = None
        faculty_id = None

        if assignment:
            faculty = db.query(Faculty).filter(
                Faculty.id == assignment.faculty_id
            ).first()

            if faculty:
                faculty_id = faculty.id
                faculty_name = faculty.faculty_name

        result.append({
            "id": student.id,
            "usn": student.usn,
            "name": student.name,
            "email": student.email,
            "branch": student.branch,
            "semester": student.semester,
            "cgpa": float(student.cgpa) if student.cgpa is not None else None,
            "attendance": float(student.attendance)
            if student.attendance is not None else None,
            "faculty_id": faculty_id,
            "faculty_name": faculty_name
        })

    return result


# =========================================================
# ASSIGN STUDENT TO FACULTY
# =========================================================

@router.post("/assign")
def assign_student(
    faculty_id: int,
    student_id: int,
    db: Session = Depends(get_db)
):

    faculty = db.query(Faculty).filter(
        Faculty.id == faculty_id
    ).first()

    if not faculty:
        raise HTTPException(
            status_code=404,
            detail="Faculty not found"
        )

    student = db.query(Student).filter(
        Student.id == student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    # Check whether student is already assigned
    existing = db.query(FacultyStudent).filter(
        FacultyStudent.student_id == student_id
    ).first()

    if existing:

        # Change existing faculty assignment
        existing.faculty_id = faculty_id

        db.commit()
        db.refresh(existing)

        return {
            "message": "Student faculty assignment updated",
            "student_id": student_id,
            "faculty_id": faculty_id
        }

    # Create new assignment
    assignment = FacultyStudent(
        faculty_id=faculty_id,
        student_id=student_id
    )

    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return {
        "message": "Student assigned successfully",
        "student_id": student_id,
        "faculty_id": faculty_id
    }


# =========================================================
# REMOVE STUDENT FROM FACULTY
# =========================================================

@router.delete("/assignment/{student_id}")
def remove_assignment(
    student_id: int,
    db: Session = Depends(get_db)
):

    assignment = db.query(FacultyStudent).filter(
        FacultyStudent.student_id == student_id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Student is not assigned to any faculty"
        )

    db.delete(assignment)
    db.commit()

    return {
        "message": "Student assignment removed"
    }