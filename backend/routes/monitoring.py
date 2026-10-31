from fastapi import APIRouter, HTTPException
from sqlalchemy import text

from database import SessionLocal


router = APIRouter(
    prefix="/monitoring",
    tags=["Student Monitoring"]
)


# =========================================================
# STUDENT MONITORING
# =========================================================

@router.get("/students")
def get_student_monitoring():

    db = SessionLocal()

    try:

        # =================================================
        # 1. STUDENTS + FACULTY ASSIGNMENT
        # =================================================

        student_query = text("""
            SELECT
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

                fs.faculty_id,
                f.faculty_name,
                f.email AS faculty_email

            FROM students st

            LEFT JOIN faculty_students fs
                ON fs.student_id = st.id

            LEFT JOIN faculty f
                ON f.id = fs.faculty_id

            WHERE st.role = 'student'
               OR st.role IS NULL

            ORDER BY st.name ASC
        """)

        student_rows = (
            db.execute(student_query)
            .mappings()
            .all()
        )


        if not student_rows:
            return []


        # =================================================
        # 2. LATEST ATTENDANCE
        # =================================================

        attendance_query = text("""
            SELECT
                ca.student_id,
                ca.status,
                ca.attendance_date,
                ca.marked_at

            FROM class_attendance ca

            INNER JOIN (
                SELECT
                    student_id,
                    MAX(marked_at) AS latest_marked_at

                FROM class_attendance

                GROUP BY student_id

            ) latest
                ON latest.student_id = ca.student_id
               AND latest.latest_marked_at = ca.marked_at
        """)

        attendance_rows = (
            db.execute(attendance_query)
            .mappings()
            .all()
        )


        attendance_map = {
            int(row["student_id"]): row
            for row in attendance_rows
        }


        # =================================================
        # 3. ATTENDANCE PERCENTAGE
        #
        # Faculty enters Present / Absent.
        # We calculate the percentage from class_attendance.
        # =================================================

        attendance_percentage_query = text("""
            SELECT
                student_id,

                COUNT(*) AS total_classes,

                SUM(
                    CASE
                        WHEN LOWER(status) = 'present'
                        THEN 1
                        ELSE 0
                    END
                ) AS present_classes

            FROM class_attendance

            GROUP BY student_id
        """)

        attendance_percentage_rows = (
            db.execute(
                attendance_percentage_query
            )
            .mappings()
            .all()
        )


        attendance_percentage_map = {}

        for row in attendance_percentage_rows:

            total_classes = int(
                row["total_classes"] or 0
            )

            present_classes = int(
                row["present_classes"] or 0
            )

            if total_classes > 0:

                percentage = round(
                    (
                        present_classes /
                        total_classes
                    ) * 100,
                    2
                )

            else:
                percentage = None

            attendance_percentage_map[
                int(row["student_id"])
            ] = percentage


        # =================================================
        # 4. INTERVENTIONS
        # =================================================

        intervention_query = text("""
            SELECT
                i.id,
                i.student_id,
                i.intervention_type,
                i.priority,
                i.status,
                i.risk_factor,
                i.intervention_action,
                i.follow_up_date,
                i.description,
                i.created_at

            FROM interventions i

            INNER JOIN (
                SELECT
                    student_id,
                    MAX(created_at) AS latest_created_at

                FROM interventions

                GROUP BY student_id

            ) latest

                ON latest.student_id = i.student_id
               AND latest.latest_created_at = i.created_at

            ORDER BY i.created_at DESC
        """)

        intervention_rows = (
            db.execute(intervention_query)
            .mappings()
            .all()
        )


        intervention_map = {
            int(row["student_id"]): row
            for row in intervention_rows
        }


        # =================================================
        # 5. FACULTY ACTIVITIES
        #
        # Existing activities are used for:
        # - Counselling
        # - Parent Alert
        # - Other monitoring events
        # =================================================

        activity_query = text("""
            SELECT
                fa.id,
                fa.faculty_id,
                fa.activity_type,
                fa.activity_title,
                fa.description,
                fa.student_id,
                fa.created_at

            FROM faculty_activities fa

            WHERE fa.student_id IS NOT NULL

            ORDER BY fa.created_at DESC
        """)

        activity_rows = (
            db.execute(activity_query)
            .mappings()
            .all()
        )


        counselling_map = {}
        parent_alert_map = {}
        latest_activity_map = {}


        for row in activity_rows:

            student_id = int(
                row["student_id"]
            )

            activity_type = str(
                row["activity_type"] or ""
            ).strip().lower()


            # ---------------------------------------------
            # Latest activity
            # ---------------------------------------------

            if student_id not in latest_activity_map:

                latest_activity_map[
                    student_id
                ] = row


            # ---------------------------------------------
            # Counselling
            # ---------------------------------------------

            if "counselling" in activity_type:

                if student_id not in counselling_map:

                    counselling_map[
                        student_id
                    ] = row


            # ---------------------------------------------
            # Parent Alert
            # ---------------------------------------------

            if (
                "parent alert" in activity_type
                or "parent_alert" in activity_type
                or "parentalert" in activity_type
            ):

                if student_id not in parent_alert_map:

                    parent_alert_map[
                        student_id
                    ] = row


        # =================================================
        # 6. BUILD FINAL MONITORING RESPONSE
        # =================================================

        result = []


        for student in student_rows:

            student_id = int(
                student["id"]
            )


            # ---------------------------------------------
            # Attendance
            # ---------------------------------------------

            attendance_record = (
                attendance_map.get(student_id)
            )

            attendance_percentage = (
                attendance_percentage_map.get(
                    student_id
                )
            )


            if attendance_percentage is None:

                # Use registered student attendance
                # only when no class attendance exists.

                if student["attendance"] is not None:

                    attendance_percentage = float(
                        student["attendance"]
                    )


            attendance_status = (
                attendance_record["status"]
                if attendance_record
                else "No Record"
            )


            attendance_date = (
                attendance_record["attendance_date"]
                if attendance_record
                else None
            )


            # ---------------------------------------------
            # Intervention
            # ---------------------------------------------

            intervention = (
                intervention_map.get(student_id)
            )


            if intervention:

                intervention_status = (
                    intervention["status"]
                    or "Active"
                )

                intervention_note = (
                    intervention["intervention_action"]
                    or intervention["description"]
                    or "Intervention created."
                )

                follow_up_date = (
                    intervention["follow_up_date"]
                )

            else:

                intervention_status = "Not Started"

                intervention_note = (
                    "No intervention record available."
                )

                follow_up_date = None


            # ---------------------------------------------
            # Counselling
            # ---------------------------------------------

            counselling = (
                counselling_map.get(student_id)
            )


            if counselling:

                counselling_status = "Completed"

                counselling_note = (
                    counselling["description"]
                    or counselling["activity_title"]
                    or "Counselling activity recorded."
                )

            else:

                counselling_status = "Not Started"

                counselling_note = (
                    "No counselling record available."
                )


            # ---------------------------------------------
            # Parent Alert
            # ---------------------------------------------

            parent_alert = (
                parent_alert_map.get(student_id)
            )


            if parent_alert:

                parent_alert_status = "Sent"

                parent_alert_note = (
                    parent_alert["description"]
                    or parent_alert["activity_title"]
                    or "Parent alert recorded."
                )

            else:

                parent_alert_status = "Not Sent"

                parent_alert_note = (
                    "No parent alert record available."
                )


            # ---------------------------------------------
            # Last Activity
            # ---------------------------------------------

            latest_activity = (
                latest_activity_map.get(student_id)
            )


            last_activity = (
                latest_activity["created_at"]
                if latest_activity
                else None
            )


            # ---------------------------------------------
            # Basic risk calculation
            #
            # This is NOT replacing your ML prediction.
            # It is only used as a fallback when the
            # monitoring API has no stored prediction data.
            # ---------------------------------------------

            risk_level = "LOW"
            risk_percentage = 0
            risk_factors = []


            cgpa = (
                float(student["cgpa"])
                if student["cgpa"] is not None
                else None
            )

            backlogs = (
                int(student["backlogs"])
                if student["backlogs"] is not None
                else 0
            )

            study_hours = (
                float(student["study_hours"])
                if student["study_hours"] is not None
                else None
            )


            if (
                attendance_percentage is not None
                and attendance_percentage < 60
            ):

                risk_factors.append(
                    "Low Attendance"
                )

                risk_percentage += 30


            elif (
                attendance_percentage is not None
                and attendance_percentage < 75
            ):

                risk_factors.append(
                    "Attendance Needs Improvement"
                )

                risk_percentage += 15


            if cgpa is not None and cgpa < 5:

                risk_factors.append(
                    "Low CGPA"
                )

                risk_percentage += 30


            elif cgpa is not None and cgpa < 6:

                risk_factors.append(
                    "Low Academic Performance"
                )

                risk_percentage += 15


            if backlogs >= 3:

                risk_factors.append(
                    "Multiple Backlogs"
                )

                risk_percentage += 25


            elif backlogs > 0:

                risk_factors.append(
                    "Backlogs"
                )

                risk_percentage += 10


            if (
                study_hours is not None
                and study_hours < 2
            ):

                risk_factors.append(
                    "Low Study Hours"
                )

                risk_percentage += 10


            risk_percentage = min(
                risk_percentage,
                100
            )


            if risk_percentage >= 70:

                risk_level = "HIGH"

            elif risk_percentage >= 40:

                risk_level = "MEDIUM"

            else:

                risk_level = "LOW"


            # ---------------------------------------------
            # Overall status
            # ---------------------------------------------

            if (
                risk_level == "HIGH"
                or intervention_status
                in ["Active", "In Progress"]
            ):

                overall_status = (
                    "Attention Required"
                )

            elif (
                counselling_status == "Completed"
                or parent_alert_status == "Sent"
            ):

                overall_status = "In Progress"

            else:

                overall_status = "Stable"


            # ---------------------------------------------
            # Final object
            # ---------------------------------------------

            result.append({

                "id": student_id,

                "usn": student["usn"],

                "name": student["name"],

                "email": student["email"],

                "branch": student["branch"],

                "semester": student["semester"],

                "section": student["section"],

                "cgpa": (
                    float(student["cgpa"])
                    if student["cgpa"] is not None
                    else None
                ),

                "attendance": attendance_percentage,

                "attendance_status": attendance_status,

                "attendance_date": (
                    attendance_date.isoformat()
                    if hasattr(
                        attendance_date,
                        "isoformat"
                    )
                    else attendance_date
                ),

                "backlogs": student["backlogs"],

                "study_hours": (
                    float(student["study_hours"])
                    if student["study_hours"]
                    is not None
                    else None
                ),

                "parent_name": student["parent_name"],

                "parent_mobile": student["parent_mobile"],

                "faculty_id": student["faculty_id"],

                "faculty_name": (
                    student["faculty_name"]
                    or "Not Assigned"
                ),

                "faculty_email": student["faculty_email"],

                "risk_level": risk_level,

                "risk_percentage": risk_percentage,

                "risk_factors": risk_factors,

                "counselling_status": (
                    counselling_status
                ),

                "counselling_note": (
                    counselling_note
                ),

                "intervention_status": (
                    intervention_status
                ),

                "intervention_note": (
                    intervention_note
                ),

                "intervention_type": (
                    intervention["intervention_type"]
                    if intervention
                    else None
                ),

                "intervention_priority": (
                    intervention["priority"]
                    if intervention
                    else None
                ),

                "parent_alert_status": (
                    parent_alert_status
                ),

                "parent_alert_note": (
                    parent_alert_note
                ),

                "follow_up_date": (
                    follow_up_date.isoformat()
                    if hasattr(
                        follow_up_date,
                        "isoformat"
                    )
                    else follow_up_date
                ),

                "last_activity": (
                    last_activity.isoformat()
                    if hasattr(
                        last_activity,
                        "isoformat"
                    )
                    else last_activity
                ),

                "overall_status": (
                    overall_status
                )
            })


        return result


    except Exception as e:

        print(
            "STUDENT MONITORING ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to load student "
                "monitoring data."
            )
        )

    finally:

        db.close()