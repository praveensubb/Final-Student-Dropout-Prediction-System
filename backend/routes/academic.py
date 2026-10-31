from fastapi import APIRouter, HTTPException
from sqlalchemy import text

from database import SessionLocal


router = APIRouter(
    prefix="/academic",
    tags=["Academic Structure"]
)


# ============================================================
# GET FACULTY ACADEMIC ASSIGNMENT
# ============================================================

@router.get("/faculty/{faculty_id}")
def get_faculty_academic_assignment(faculty_id: int):

    db = SessionLocal()

    try:

        query = text("""
            SELECT
                f.id AS faculty_id,
                f.faculty_name,
                f.email AS faculty_email,
                f.department,

                s.id AS section_id,
                s.section_name,
                s.department AS section_department,
                s.semester,

                sub.id AS subject_id,
                sub.subject_code,
                sub.subject_name

            FROM faculty f

            JOIN faculty_section_subjects fss
                ON fss.faculty_id = f.id

            JOIN sections s
                ON s.id = fss.section_id

            JOIN subjects sub
                ON sub.id = fss.subject_id

            WHERE f.id = :faculty_id

            ORDER BY s.section_name, sub.id
        """)

        rows = db.execute(
            query,
            {"faculty_id": faculty_id}
        ).mappings().all()

        if not rows:

            raise HTTPException(
                status_code=404,
                detail="No academic assignment found for this faculty."
            )

        return {
            "faculty_id": rows[0]["faculty_id"],
            "faculty_name": rows[0]["faculty_name"],
            "faculty_email": rows[0]["faculty_email"],
            "department": rows[0]["department"],

            "assignments": [

                {
                    "section_id": row["section_id"],
                    "section_name": row["section_name"],
                    "section_department": row["section_department"],
                    "semester": row["semester"],

                    "subject_id": row["subject_id"],
                    "subject_code": row["subject_code"],
                    "subject_name": row["subject_name"]
                }

                for row in rows
            ]
        }

    except HTTPException:

        raise

    except Exception as e:

        print(
            "FACULTY ACADEMIC ASSIGNMENT ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to load faculty academic assignment."
        )

    finally:

        db.close()


# ============================================================
# GET STUDENTS FOR FACULTY'S SECTION
# ============================================================

@router.get("/faculty/{faculty_id}/students")
def get_faculty_academic_students(faculty_id: int):

    db = SessionLocal()

    try:

        query = text("""
            SELECT
                f.id AS faculty_id,
                f.faculty_name,

                s.id AS section_id,
                s.section_name,

                sub.id AS subject_id,
                sub.subject_code,
                sub.subject_name,

                st.id,
                st.usn,
                st.name,
                st.email,
                st.branch,
                st.semester,
                st.section,
                st.cgpa,
                st.attendance,
                st.backlogs,
                st.study_hours,
                st.parent_name,
                st.parent_mobile,
                st.created_at

            FROM faculty f

            JOIN faculty_section_subjects fss
                ON fss.faculty_id = f.id

            JOIN sections s
                ON s.id = fss.section_id

            JOIN subjects sub
                ON sub.id = fss.subject_id

            JOIN students st
                ON UPPER(TRIM(st.section))
                = UPPER(TRIM(s.section_name))

            WHERE f.id = :faculty_id

            ORDER BY st.name
        """)

        rows = db.execute(
            query,
            {"faculty_id": faculty_id}
        ).mappings().all()

        if not rows:

            assignment = db.execute(
                text("""
                    SELECT COUNT(*) AS total

                    FROM faculty_section_subjects

                    WHERE faculty_id = :faculty_id
                """),
                {"faculty_id": faculty_id}
            ).scalar()

            if not assignment:

                raise HTTPException(
                    status_code=404,
                    detail="No academic assignment found for this faculty."
                )

            return []

        return [

            {
                "id": row["id"],
                "usn": row["usn"],
                "name": row["name"],
                "email": row["email"],

                "branch": row["branch"],
                "semester": row["semester"],
                "section": row["section"],

                "cgpa": (
                    float(row["cgpa"])
                    if row["cgpa"] is not None
                    else None
                ),

                "attendance": (
                    float(row["attendance"])
                    if row["attendance"] is not None
                    else None
                ),

                "backlogs": row["backlogs"],

                "study_hours": (
                    float(row["study_hours"])
                    if row["study_hours"] is not None
                    else None
                ),

                "parent_name": row["parent_name"],
                "parent_mobile": row["parent_mobile"],

                "faculty_id": row["faculty_id"],
                "faculty_name": row["faculty_name"],

                "section_id": row["section_id"],
                "section_name": row["section_name"],

                "subject_id": row["subject_id"],
                "subject_code": row["subject_code"],
                "subject_name": row["subject_name"],

                "created_at": (
                    row["created_at"].isoformat()
                    if row["created_at"] is not None
                    else None
                )
            }

            for row in rows
        ]

    except HTTPException:

        raise

    except Exception as e:

        print(
            "FACULTY ACADEMIC STUDENTS ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to load students for this faculty."
        )

    finally:

        db.close()


# ============================================================
# ADMIN - VIEW COMPLETE ACADEMIC STRUCTURE
# ============================================================

@router.get("/structure")
def get_academic_structure():

    db = SessionLocal()

    try:

        query = text("""
            SELECT

                fss.id AS assignment_id,

                f.id AS faculty_id,
                f.faculty_name,
                f.email AS faculty_email,
                f.department,

                s.id AS section_id,
                s.section_name,
                s.semester,

                sub.id AS subject_id,
                sub.subject_code,
                sub.subject_name,

                fss.assigned_at

            FROM faculty_section_subjects fss

            JOIN faculty f
                ON f.id = fss.faculty_id

            JOIN sections s
                ON s.id = fss.section_id

            JOIN subjects sub
                ON sub.id = fss.subject_id

            ORDER BY
                s.section_name,
                fss.faculty_id
        """)

        rows = db.execute(
            query
        ).mappings().all()

        return [

            {
                "assignment_id": row["assignment_id"],

                "faculty_id": row["faculty_id"],
                "faculty_name": row["faculty_name"],
                "faculty_email": row["faculty_email"],
                "department": row["department"],

                "section_id": row["section_id"],
                "section_name": row["section_name"],
                "semester": row["semester"],

                "subject_id": row["subject_id"],
                "subject_code": row["subject_code"],
                "subject_name": row["subject_name"],

                "assigned_at": (
                    row["assigned_at"].isoformat()
                    if row["assigned_at"] is not None
                    else None
                )
            }

            for row in rows
        ]

    except Exception as e:

        print(
            "ACADEMIC STRUCTURE ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to load academic structure."
        )

    finally:

        db.close()