from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Student
from schemas import StudentCreate, StudentResponse

router = APIRouter()


# =========================================================
# GET ALL STUDENTS
# =========================================================

@router.get("/students", response_model=list[StudentResponse])
def get_students(db: Session = Depends(get_db)):

    return db.query(Student).all()


# =========================================================
# GET ONE STUDENT
# =========================================================

@router.get(
    "/students/{student_id}",
    response_model=StudentResponse
)
def get_student(
    student_id: int,
    db: Session = Depends(get_db)
):

    student = db.query(Student).filter(
        Student.id == student_id
    ).first()

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    return student


# =========================================================
# CREATE STUDENT
# =========================================================

@router.post(
    "/students",
    response_model=StudentResponse
)
def create_student(
    student: StudentCreate,
    db: Session = Depends(get_db)
):

    # =====================================================
    # CHECK DUPLICATE USN
    # =====================================================

    existing_usn = db.query(Student).filter(
        Student.usn == student.usn
    ).first()

    if existing_usn:
        raise HTTPException(
            status_code=400,
            detail="USN already exists"
        )

    # =====================================================
    # CHECK DUPLICATE EMAIL
    # =====================================================

    existing_email = db.query(Student).filter(
        Student.email == student.email
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    # =====================================================
    # VALIDATE PARENT MOBILE
    # =====================================================

    parent_mobile = student.parent_mobile.strip()

    # Remove spaces
    parent_mobile = parent_mobile.replace(" ", "")

    # Optional support for +91
    if parent_mobile.startswith("+91"):
        parent_mobile = parent_mobile[3:]

    # Optional support for 91XXXXXXXXXX
    elif parent_mobile.startswith("91") and len(parent_mobile) == 12:
        parent_mobile = parent_mobile[2:]

    # Check Indian 10-digit mobile number
    if not parent_mobile.isdigit() or len(parent_mobile) != 10:

        raise HTTPException(
            status_code=400,
            detail="Parent mobile number must be a valid 10-digit Indian mobile number"
        )

    # =====================================================
    # CHECK PARENT NAME
    # =====================================================

    parent_name = student.parent_name.strip()

    if not parent_name:

        raise HTTPException(
            status_code=400,
            detail="Parent name is required"
        )

    # =====================================================
    # CREATE NEW STUDENT
    # =====================================================

    new_student = Student(

        usn=student.usn,
        name=student.name,
        email=student.email,
        password=student.password,

        branch=student.branch,
        semester=student.semester,

        # Student Section
        section=student.section,

        cgpa=student.cgpa,
        attendance=student.attendance,
        backlogs=student.backlogs,
        study_hours=student.study_hours,

        # =================================================
        # PARENT DETAILS
        # =================================================

        parent_name=parent_name,
        parent_mobile=parent_mobile
    )

    # =====================================================
    # SAVE TO DATABASE
    # =====================================================

    db.add(new_student)

    db.commit()

    db.refresh(new_student)

    return new_student