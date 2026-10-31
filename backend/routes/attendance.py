from datetime import date



from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session



from database import get_db

from models import (

    ClassAttendance,

    Faculty,

    FacultyStudent,

    Student,

    Timetable,

    FacultyActivity

)





# =========================================================

# ROUTER

# =========================================================



router = APIRouter(

    prefix="/attendance",

    tags=["Attendance"]

)

# =========================================================
# FACULTY SECTION MAPPING
# =========================================================
#
# Faculty 1 -> Section A
# Faculty 2 -> Section B
# Faculty 3 -> Section C
#
# Other faculty accounts keep the existing
# FacultyStudent assignment-based behavior.
# =========================================================

FACULTY_SECTION_MAP = {
    1: "A",
    2: "B",
    3: "C",
}


def get_assigned_section(faculty_id: int):
    return FACULTY_SECTION_MAP.get(faculty_id)


def faculty_can_access_student(
    faculty_id: int,
    student,
    db: Session
) -> bool:
    """
    Faculty 1/2/3 are restricted to their mapped section.
    Other faculty accounts use FacultyStudent assignments.
    """

    assigned_section = get_assigned_section(faculty_id)

    if assigned_section is not None:
        return (
            str(student.section or "").strip().upper()
            == assigned_section
        )

    assignment = (
        db.query(FacultyStudent)
        .filter(
            FacultyStudent.faculty_id == faculty_id,
            FacultyStudent.student_id == student.id
        )
        .first()
    )

    return assignment is not None






# =========================================================

# GET ASSIGNED STUDENTS FOR ATTENDANCE

# =========================================================

#

# Only students assigned by Admin to this Faculty

# will be returned.

#

# URL:

# GET /attendance/faculty/{faculty_id}/students

#

# =========================================================



@router.get("/faculty/{faculty_id}/students")

def get_students_for_attendance(

    faculty_id: int,

    db: Session = Depends(get_db)

):



    # -----------------------------------------------------

    # Check Faculty

    # -----------------------------------------------------



    faculty = (

        db.query(Faculty)

        .filter(Faculty.id == faculty_id)

        .first()

    )



    if not faculty:

        raise HTTPException(

            status_code=404,

            detail="Faculty not found"

        )



    # -----------------------------------------------------

    # Get ONLY students assigned by Admin

    # -----------------------------------------------------



    assigned_section = get_assigned_section(faculty_id)

    if assigned_section is not None:
        students = (
            db.query(Student)
            .filter(
                Student.section.isnot(None),
                Student.section == assigned_section
            )
            .order_by(Student.name.asc())
            .all()
        )
    else:
        assignments = (
            db.query(FacultyStudent, Student)
            .join(
                Student,
                FacultyStudent.student_id == Student.id
            )
            .filter(
                FacultyStudent.faculty_id == faculty_id
            )
            .order_by(Student.name.asc())
            .all()
        )

        students = [
            student
            for assignment, student in assignments
        ]

    return [
        {
            "id": student.id,
            "usn": student.usn,
            "name": student.name,
            "email": student.email,
            "section": student.section,
            "branch": student.branch,
            "semester": student.semester
        }
        for student in students
    ]





# =========================================================

# GET FACULTY TIMETABLE

# =========================================================

#

# Used by Faculty to select the class/subject for

# attendance.

#

# URL:

# GET /attendance/faculty/{faculty_id}/timetable

#

# =========================================================



@router.get("/faculty/{faculty_id}/timetable")

def get_faculty_timetable(

    faculty_id: int,

    db: Session = Depends(get_db)

):



    # -----------------------------------------------------

    # Check Faculty

    # -----------------------------------------------------



    faculty = (

        db.query(Faculty)

        .filter(Faculty.id == faculty_id)

        .first()

    )



    if not faculty:

        raise HTTPException(

            status_code=404,

            detail="Faculty not found"

        )



    # -----------------------------------------------------

    # Get Faculty Timetable

    # -----------------------------------------------------



    timetable = (

        db.query(Timetable)

        .filter(

            Timetable.faculty_id == faculty_id

        )

        .order_by(

            Timetable.day_of_week,

            Timetable.start_time

        )

        .all()

    )



    return [

        {

            "id": item.id,

            "faculty_id": item.faculty_id,

            "day_of_week": item.day_of_week,

            "start_time": str(item.start_time),

            "end_time": str(item.end_time),

            "class_name": item.class_name,

            "subject": item.subject,

            "class_type": item.class_type,

            "room_no": item.room_no

        }

        for item in timetable

    ]





# =========================================================

# SAVE / UPDATE ATTENDANCE

# =========================================================

#

# Faculty sends:

#

# faculty_id

# timetable_id

# attendance list

#

# Example:

#

# [

#     {

#         "student_id": 1,

#         "status": "Present"

#     },

#     {

#         "student_id": 2,

#         "status": "Absent"

#     }

# ]

#

# URL:

# POST /attendance/mark

#

# =========================================================



@router.post("/mark")

def mark_attendance(

    faculty_id: int,

    timetable_id: int,

    attendance: list[dict],

    db: Session = Depends(get_db)

):



    # -----------------------------------------------------

    # Check Faculty

    # -----------------------------------------------------



    faculty = (

        db.query(Faculty)

        .filter(Faculty.id == faculty_id)

        .first()

    )



    if not faculty:

        raise HTTPException(

            status_code=404,

            detail="Faculty not found"

        )



    # -----------------------------------------------------

    # Check Timetable

    # -----------------------------------------------------



    timetable = (

        db.query(Timetable)

        .filter(

            Timetable.id == timetable_id,

            Timetable.faculty_id == faculty_id

        )

        .first()

    )



    if not timetable:

        raise HTTPException(

            status_code=404,

            detail="Timetable not found for this faculty"

        )



    # -----------------------------------------------------

    # Make sure attendance list is not empty

    # -----------------------------------------------------



    if not attendance:

        raise HTTPException(

            status_code=400,

            detail="Attendance list cannot be empty"

        )



    today = date.today()



    present_count = 0

    absent_count = 0



    # -----------------------------------------------------

    # Process every student

    # -----------------------------------------------------



    for item in attendance:



        student_id = item.get("student_id")

        status = item.get("status")



        # -------------------------------------------------

        # Validate student ID

        # -------------------------------------------------



        if student_id is None:

            raise HTTPException(

                status_code=400,

                detail="student_id is required"

            )



        # -------------------------------------------------

        # Validate status

        # -------------------------------------------------



        if status not in ["Present", "Absent"]:

            raise HTTPException(

                status_code=400,

                detail=(

                    f"Invalid attendance status for "

                    f"student {student_id}. "

                    f"Use Present or Absent."

                )

            )



        # -------------------------------------------------

        # Make sure student exists

        # -------------------------------------------------



        student = (

            db.query(Student)

            .filter(Student.id == student_id)

            .first()

        )



        if not student:

            raise HTTPException(

                status_code=404,

                detail=f"Student {student_id} not found"

            )



        # -------------------------------------------------

        # IMPORTANT:

        # Student must be assigned to this faculty

        # -------------------------------------------------



        if not faculty_can_access_student(
            faculty_id=faculty_id,
            student=student,
            db=db
        ):
            raise HTTPException(
                status_code=403,
                detail=(
                    f"Student {student_id} is not assigned "
                    f"to this faculty or is outside the faculty's section"
                )
            )



        # -------------------------------------------------

        # Check whether attendance already exists today

        # -------------------------------------------------



        existing = (

            db.query(ClassAttendance)

            .filter(

                ClassAttendance.student_id == student_id,

                ClassAttendance.timetable_id == timetable_id,

                ClassAttendance.attendance_date == today

            )

            .first()

        )



        # -------------------------------------------------

        # Update existing attendance

        # -------------------------------------------------



        if existing:



            existing.status = status

            existing.faculty_id = faculty_id



        # -------------------------------------------------

        # Create new attendance

        # -------------------------------------------------



        else:



            new_attendance = ClassAttendance(

                faculty_id=faculty_id,

                student_id=student_id,

                timetable_id=timetable_id,

                attendance_date=today,

                status=status

            )



            db.add(new_attendance)



        # -------------------------------------------------

        # Count attendance

        # -------------------------------------------------



        if status == "Present":

            present_count += 1



        elif status == "Absent":

            absent_count += 1



    # -----------------------------------------------------

    # Calculate totals

    # -----------------------------------------------------



    total_students = present_count + absent_count



    if total_students > 0:



        attendance_percentage = (

            present_count / total_students

        ) * 100



    else:



        attendance_percentage = 0



    # -----------------------------------------------------

    # Save attendance records first

    # -----------------------------------------------------



    db.commit()



    # -----------------------------------------------------

    # Record Faculty Activity

    # -----------------------------------------------------



    activity = FacultyActivity(

        faculty_id=faculty_id,

        activity_type="Attendance",

        activity_title="Attendance Marked",

        description=(

            f"{timetable.subject}: "

            f"{present_count} Present, "

            f"{absent_count} Absent, "

            f"Attendance {attendance_percentage:.2f}%"

        ),

        timetable_id=timetable_id

    )



    db.add(activity)



    db.commit()



    # -----------------------------------------------------

    # Return result

    # -----------------------------------------------------



    return {

        "message": "Attendance saved successfully",



        "faculty_id": faculty_id,



        "timetable_id": timetable_id,



        "subject": timetable.subject,



        "class_name": timetable.class_name,



        "date": str(today),



        "total_students": total_students,



        "present": present_count,



        "absent": absent_count,



        "attendance_percentage": round(

            attendance_percentage,

            2

        )

    }





# =========================================================

# GET TODAY'S ATTENDANCE

# =========================================================

#

# Faculty can use this to reload attendance already

# marked today.

#

# URL:

# GET /attendance/faculty/{faculty_id}/today

#

# Query:

# timetable_id

#

# =========================================================



@router.get("/faculty/{faculty_id}/today")

def get_today_attendance(

    faculty_id: int,

    timetable_id: int,

    db: Session = Depends(get_db)

):



    # -----------------------------------------------------

    # Check Faculty

    # -----------------------------------------------------



    faculty = (

        db.query(Faculty)

        .filter(Faculty.id == faculty_id)

        .first()

    )



    if not faculty:

        raise HTTPException(

            status_code=404,

            detail="Faculty not found"

        )



    # -----------------------------------------------------
    # Check Timetable belongs to this Faculty
    # -----------------------------------------------------

    timetable = (
        db.query(Timetable)
        .filter(
            Timetable.id == timetable_id,
            Timetable.faculty_id == faculty_id
        )
        .first()
    )

    if not timetable:
        raise HTTPException(
            status_code=404,
            detail="Timetable not found for this faculty"
        )

    today = date.today()

    # -----------------------------------------------------
    # Get attendance records

    # -----------------------------------------------------



    records = (

        db.query(

            ClassAttendance,

            Student

        )

        .join(

            Student,

            ClassAttendance.student_id == Student.id

        )

        .filter(

            ClassAttendance.faculty_id == faculty_id,

            ClassAttendance.timetable_id == timetable_id,

            ClassAttendance.attendance_date == today

        )

        .order_by(Student.name.asc())

        .all()

    )



    present_count = 0

    absent_count = 0



    students = []



    for attendance_record, student in records:



        if attendance_record.status == "Present":

            present_count += 1



        elif attendance_record.status == "Absent":

            absent_count += 1



        students.append({

            "student_id": student.id,

            "usn": student.usn,

            "name": student.name,

            "email": student.email,

            "section": student.section,

            "branch": student.branch,

            "semester": student.semester,

            "status": attendance_record.status

        })



    # -----------------------------------------------------

    # Calculate percentage

    # -----------------------------------------------------



    total_students = present_count + absent_count



    if total_students > 0:



        attendance_percentage = (

            present_count / total_students

        ) * 100



    else:



        attendance_percentage = 0



    # -----------------------------------------------------

    # Return attendance

    # -----------------------------------------------------



    return {

        "faculty_id": faculty_id,



        "timetable_id": timetable_id,



        "date": str(today),



        "total_students": total_students,



        "present": present_count,



        "absent": absent_count,



        "attendance_percentage": round(

            attendance_percentage,

            2

        ),



        "students": students

    }





# =========================================================

# GET ATTENDANCE SUMMARY

# =========================================================

#

# Useful for Faculty Dashboard.

#

# URL:

# GET /attendance/faculty/{faculty_id}/summary

#

# =========================================================



@router.get("/faculty/{faculty_id}/summary")

def get_attendance_summary(

    faculty_id: int,

    db: Session = Depends(get_db)

):



    # -----------------------------------------------------

    # Check Faculty

    # -----------------------------------------------------



    faculty = (

        db.query(Faculty)

        .filter(Faculty.id == faculty_id)

        .first()

    )



    if not faculty:

        raise HTTPException(

            status_code=404,

            detail="Faculty not found"

        )



    # -----------------------------------------------------

    # Get today's records

    # -----------------------------------------------------



    today = date.today()



    records = (

        db.query(ClassAttendance)

        .filter(

            ClassAttendance.faculty_id == faculty_id,

            ClassAttendance.attendance_date == today

        )

        .all()

    )



    present_count = 0

    absent_count = 0



    for record in records:



        if record.status == "Present":

            present_count += 1



        elif record.status == "Absent":

            absent_count += 1



    total_students = present_count + absent_count



    if total_students > 0:



        attendance_percentage = (

            present_count / total_students

        ) * 100



    else:



        attendance_percentage = 0



    return {

        "faculty_id": faculty_id,

        "date": str(today),

        "total_students": total_students,

        "present": present_count,

        "absent": absent_count,

        "attendance_percentage": round(

            attendance_percentage,

            2

        )

    }