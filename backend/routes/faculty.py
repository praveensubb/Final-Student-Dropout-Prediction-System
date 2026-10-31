from fastapi import APIRouter, HTTPException, Depends

from pydantic import BaseModel

from sqlalchemy.orm import Session



from database import SessionLocal



from models import (

    Faculty,

    FacultyStudent,

    FacultyProjectStudent,

    Student,

    Timetable

)



from routes.auth import create_access_token



from services.mentor_notification_service import (

    calculate_student_risk,

    create_risk_change_notification

)





# =========================================================

# FACULTY ROUTER

# =========================================================



router = APIRouter(

    prefix="/faculty",

    tags=["Faculty"]

)

# =========================================================
# FACULTY SECTION MAPPING
#
# Faculty 1 -> Section A
# Faculty 2 -> Section B
# Faculty 3 -> Section C
#
# Faculty 4 and other faculty accounts keep their existing
# assignment-based behavior.
# =========================================================

FACULTY_SECTION_MAP = {
    1: "A",
    2: "B",
    3: "C",
}


def get_assigned_section(faculty_id: int):
    """Return the fixed section for Faculty 1/2/3."""
    return FACULTY_SECTION_MAP.get(faculty_id)


def faculty_can_access_student(
    faculty_id: int,
    student,
    db: Session
) -> bool:
    """
    Faculty 1/2/3 are section-based.
    Other faculty accounts use the existing assignment tables.
    """

    assigned_section = get_assigned_section(faculty_id)

    if assigned_section is not None:
        return (
            str(student.section or "").strip().upper()
            == assigned_section
        )

    normal_assignment = db.query(FacultyStudent).filter(
        FacultyStudent.faculty_id == faculty_id,
        FacultyStudent.student_id == student.id
    ).first()

    project_assignment = db.query(
        FacultyProjectStudent
    ).filter(
        FacultyProjectStudent.faculty_id == faculty_id,
        FacultyProjectStudent.student_id == student.id
    ).first()

    return bool(normal_assignment or project_assignment)






# =========================================================

# DATABASE SESSION

# =========================================================



def get_db():

    db = SessionLocal()



    try:

        yield db

    finally:

        db.close()





# =========================================================

# FACULTY LOGIN REQUEST

# =========================================================



class FacultyLogin(BaseModel):

    email: str

    password: str





# =========================================================

# STUDENT ACADEMIC UPDATE REQUEST

# =========================================================



class StudentAcademicUpdate(BaseModel):

    attendance: float | None = None

    cgpa: float | None = None

    backlogs: int | None = None





# =========================================================

# FACULTY LOGIN

# =========================================================



@router.post("/login")

def faculty_login(

    login_data: FacultyLogin,

    db: Session = Depends(get_db)

):



    faculty = db.query(Faculty).filter(

        Faculty.email == login_data.email

    ).first()



    if not faculty:

        raise HTTPException(

            status_code=401,

            detail="Invalid faculty email or password"

        )



    if faculty.password != login_data.password:

        raise HTTPException(

            status_code=401,

            detail="Invalid faculty email or password"

        )



    token = create_access_token({

        "sub": str(faculty.id),

        "role": "faculty",

        "email": faculty.email

    })



    return {

        "message": "Faculty login successful",

        "access_token": token,

        "token_type": "bearer",



        "faculty": {

            "id": faculty.id,

            "name": faculty.faculty_name,

            "email": faculty.email,

            "department": faculty.department

        }

    }





# =========================================================

# GET STUDENTS ASSIGNED TO FACULTY

# =========================================================



@router.get("/{faculty_id}/students")
def get_faculty_students(
    faculty_id: int,
    db: Session = Depends(get_db)
):
    """
    Faculty 1 -> only Section A
    Faculty 2 -> only Section B
    Faculty 3 -> only Section C

    Other faculty accounts use FacultyStudent assignments.
    """

    faculty = db.query(Faculty).filter(
        Faculty.id == faculty_id
    ).first()

    if not faculty:
        raise HTTPException(
            status_code=404,
            detail="Faculty not found"
        )

    assigned_section = get_assigned_section(faculty_id)

    if assigned_section is not None:
        students = (
            db.query(Student)
            .filter(
                Student.section.isnot(None),
                Student.section == assigned_section
            )
            .order_by(Student.id)
            .all()
        )
    else:
        assignments = (
            db.query(FacultyStudent)
            .filter(
                FacultyStudent.faculty_id == faculty_id
            )
            .all()
        )

        students = []

        for assignment in assignments:
            student = db.query(Student).filter(
                Student.id == assignment.student_id
            ).first()

            if student:
                students.append(student)

    result = []

    for student in students:
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
            "study_hours": (
                float(student.study_hours)
                if student.study_hours is not None
                else None
            ),
            "risk_status": (
                student.risk_status
                if hasattr(student, "risk_status")
                else None
            )
        })

    return result






# =========================================================

# GET PROJECT STUDENTS FOR FACULTY 4

# =========================================================



@router.get("/{faculty_id}/project-students")

def get_project_students(

    faculty_id: int,

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



    assignments = db.query(FacultyProjectStudent).filter(

        FacultyProjectStudent.faculty_id == faculty_id

    ).all()



    students = []



    for assignment in assignments:



        student = db.query(Student).filter(

            Student.id == assignment.student_id

        ).first()



        if student:



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



                "study_hours": (

                    float(student.study_hours)

                    if student.study_hours is not None

                    else None

                ),



                "risk_status": (

                    student.risk_status

                    if hasattr(student, "risk_status")

                    else None

                )

            })



    return students





# =========================================================

# GET ONE STUDENT DETAILS FOR FACULTY

# =========================================================



@router.get("/{faculty_id}/student/{student_id}")

def get_faculty_student_detail(

    faculty_id: int,

    student_id: int,

    db: Session = Depends(get_db)

):



    # -----------------------------------------------------

    # Check faculty

    # -----------------------------------------------------



    faculty = db.query(Faculty).filter(

        Faculty.id == faculty_id

    ).first()



    if not faculty:

        raise HTTPException(

            status_code=404,

            detail="Faculty not found"

        )



    # -----------------------------------------------------

    # Check student

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

    # Check normal faculty assignment

    # -----------------------------------------------------



    # -----------------------------------------------------
    # Faculty 1 -> Section A
    # Faculty 2 -> Section B
    # Faculty 3 -> Section C
    # Other faculty accounts -> assignment tables
    # -----------------------------------------------------

    if not faculty_can_access_student(
        faculty_id,
        student,
        db
    ):
        assigned_section = get_assigned_section(faculty_id)

        if assigned_section is not None:
            detail_message = (
                f"This student belongs to Section "
                f"{str(student.section or '').strip().upper()}. "
                f"Faculty {faculty_id} can access only "
                f"Section {assigned_section}."
            )
        else:
            detail_message = (
                "This student is not assigned to this faculty"
            )

        raise HTTPException(
            status_code=403,
            detail=detail_message
        )

    return {

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



        "study_hours": (

            float(student.study_hours)

            if student.study_hours is not None

            else None

        ),



        "risk_status": (

            student.risk_status

            if hasattr(student, "risk_status")

            else None

        )

    }





# =========================================================

# UPDATE STUDENT ACADEMIC DETAILS

# =========================================================

#

# Faculty can update:

#   - Attendance

#   - CGPA

#   - Backlogs

#

# The system automatically:

#   1. Gets old risk

#   2. Updates academic data

#   3. Calculates new risk

#   4. Detects risk change

#   5. Creates mentor notification

#   6. Updates student.risk_status

#

# =========================================================



@router.put("/{faculty_id}/student/{student_id}/academic")

def update_student_academic_details(

    faculty_id: int,

    student_id: int,

    update_data: StudentAcademicUpdate,

    db: Session = Depends(get_db)

):



    # -----------------------------------------------------

    # Check faculty

    # -----------------------------------------------------



    faculty = db.query(Faculty).filter(

        Faculty.id == faculty_id

    ).first()



    if not faculty:

        raise HTTPException(

            status_code=404,

            detail="Faculty not found"

        )



    # -----------------------------------------------------

    # Check student

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

    # Check faculty assignment

    # -----------------------------------------------------



    # -----------------------------------------------------
    # Faculty 1 -> Section A
    # Faculty 2 -> Section B
    # Faculty 3 -> Section C
    # Other faculty accounts -> assignment tables
    # -----------------------------------------------------

    if not faculty_can_access_student(
        faculty_id,
        student,
        db
    ):
        assigned_section = get_assigned_section(faculty_id)

        if assigned_section is not None:
            detail_message = (
                f"This student belongs to Section "
                f"{str(student.section or '').strip().upper()}. "
                f"Faculty {faculty_id} can update only "
                f"Section {assigned_section}."
            )
        else:
            detail_message = (
                "This student is not assigned to this faculty"
            )

        raise HTTPException(
            status_code=403,
            detail=detail_message
        )

    # -----------------------------------------------------
    # At least one value must be provided
    # -----------------------------------------------------

    if (

        update_data.attendance is None

        and update_data.cgpa is None

        and update_data.backlogs is None

    ):

        raise HTTPException(

            status_code=400,

            detail="At least one academic field must be provided"

        )



    # -----------------------------------------------------

    # Validate attendance

    # -----------------------------------------------------



    if update_data.attendance is not None:



        if (

            update_data.attendance < 0

            or update_data.attendance > 100

        ):

            raise HTTPException(

                status_code=400,

                detail="Attendance must be between 0 and 100"

            )



    # -----------------------------------------------------

    # Validate CGPA

    # -----------------------------------------------------



    if update_data.cgpa is not None:



        if (

            update_data.cgpa < 0

            or update_data.cgpa > 10

        ):

            raise HTTPException(

                status_code=400,

                detail="CGPA must be between 0 and 10"

            )



    # -----------------------------------------------------

    # Validate backlogs

    # -----------------------------------------------------



    if update_data.backlogs is not None:



        if update_data.backlogs < 0:

            raise HTTPException(

                status_code=400,

                detail="Backlogs cannot be negative"

            )



    # -----------------------------------------------------

    # GET OLD RISK

    # -----------------------------------------------------



    old_risk = calculate_student_risk(student)



    # -----------------------------------------------------

    # UPDATE ATTENDANCE

    # -----------------------------------------------------



    if update_data.attendance is not None:

        student.attendance = update_data.attendance



    # -----------------------------------------------------

    # UPDATE CGPA

    # -----------------------------------------------------



    if update_data.cgpa is not None:

        student.cgpa = update_data.cgpa



    # -----------------------------------------------------

    # UPDATE BACKLOGS

    # -----------------------------------------------------



    if update_data.backlogs is not None:

        student.backlogs = update_data.backlogs



    # -----------------------------------------------------

    # CALCULATE NEW RISK

    # -----------------------------------------------------



    new_risk = calculate_student_risk(student)



    # -----------------------------------------------------

    # CHECK RISK CHANGE

    # -----------------------------------------------------



    risk_changed = old_risk != new_risk



    notification_count = 0



    # -----------------------------------------------------

    # CREATE MENTOR NOTIFICATION

    # -----------------------------------------------------



    if risk_changed:



        notification_count = create_risk_change_notification(

            db=db,

            student=student,

            old_risk=old_risk,

            new_risk=new_risk

        )



    # -----------------------------------------------------

    # SAVE CURRENT RISK

    # -----------------------------------------------------



    student.risk_status = new_risk



    # -----------------------------------------------------

    # SAVE DATABASE

    # -----------------------------------------------------



    db.commit()



    db.refresh(student)



    # -----------------------------------------------------

    # RESPONSE

    # -----------------------------------------------------



    return {

        "message": "Student academic details updated successfully",



        "student": {

            "id": student.id,

            "usn": student.usn,

            "name": student.name,



            "attendance": (

                float(student.attendance)

                if student.attendance is not None

                else None

            ),



            "cgpa": (

                float(student.cgpa)

                if student.cgpa is not None

                else None

            ),



            "backlogs": student.backlogs,



            "risk_status": student.risk_status

        },



        "risk": {

            "old_risk": old_risk,

            "new_risk": new_risk,

            "risk_changed": risk_changed

        },



        "notification": {

            "notifications_created": notification_count

        }

    }





# =========================================================

# GET FACULTY TIMETABLE

# =========================================================



@router.get("/{faculty_id}/timetable")

def get_faculty_timetable(

    faculty_id: int,

    db: Session = Depends(get_db)

):



    # -----------------------------------------------------

    # Check faculty

    # -----------------------------------------------------



    faculty = db.query(Faculty).filter(

        Faculty.id == faculty_id

    ).first()



    if not faculty:

        raise HTTPException(

            status_code=404,

            detail="Faculty not found"

        )



    # -----------------------------------------------------

    # Get timetable

    # -----------------------------------------------------



    timetable = db.query(Timetable).filter(

        Timetable.faculty_id == faculty_id

    ).order_by(

        Timetable.start_time

    ).all()



    result = []



    for item in timetable:



        result.append({

            "id": item.id,

            "day_of_week": item.day_of_week,

            "start_time": str(item.start_time),

            "end_time": str(item.end_time),

            "class_name": item.class_name,

            "subject": item.subject,

            "class_type": item.class_type,

            "room_no": item.room_no

        })



    return result