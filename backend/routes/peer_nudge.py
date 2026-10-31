from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Student

router = APIRouter()


@router.get("/peer-nudge/{student_id}")
def get_peer_nudge(
    student_id: int,
    db: Session = Depends(get_db)
):
    # =========================================================
    # 1. FIND LOGGED-IN STUDENT
    # =========================================================

    student = db.query(Student).filter(
        Student.id == student_id
    ).first()

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    # =========================================================
    # 2. FIND OTHER STUDENTS
    # SAME BRANCH + SAME SEMESTER
    # EXCLUDE CURRENT STUDENT
    # =========================================================

    peers = db.query(Student).filter(
        Student.branch == student.branch,
        Student.semester == student.semester,
        Student.id != student.id
    ).all()

    # =========================================================
    # 3. CURRENT STUDENT VALUES
    # =========================================================

    student_cgpa = float(student.cgpa or 0)
    student_attendance = float(student.attendance or 0)
    student_study_hours = float(student.study_hours or 0)
    student_backlogs = int(student.backlogs or 0)

    # =========================================================
    # 4. NO PEER DATA
    # =========================================================

    if not peers:
        return {
            "student_id": student.id,
            "peer_count": 0,
            "message": "Not enough peer data available yet.",

            "comparison": {
                "cgpa": {
                    "student": round(student_cgpa, 2),
                    "highest_peer": None
                },

                "attendance": {
                    "student": round(student_attendance, 2),
                    "peer_average": None
                },

                "study_hours": {
                    "student": round(student_study_hours, 2),
                    "peer_average": None
                },

                "backlogs": {
                    "student": student_backlogs,
                    "peer_average": None
                }
            },

            "nudges": [
                "Not enough peer data available yet."
            ]
        }

    # =========================================================
    # 5. HIGHEST PEER CGPA
    #
    # IMPORTANT:
    # Current student is already excluded from peers.
    # So this is genuinely another student's highest CGPA.
    # =========================================================

    highest_peer_cgpa = max(
        float(peer.cgpa or 0)
        for peer in peers
    )

    # =========================================================
    # 6. PEER AVERAGES
    # =========================================================

    avg_attendance = (
        sum(float(peer.attendance or 0) for peer in peers)
        / len(peers)
    )

    avg_study_hours = (
        sum(float(peer.study_hours or 0) for peer in peers)
        / len(peers)
    )

    avg_backlogs = (
        sum(float(peer.backlogs or 0) for peer in peers)
        / len(peers)
    )

    # =========================================================
    # 7. GENERATE NUDGES
    # =========================================================

    nudges = []

    # ---------------------------------------------------------
    # CGPA
    # ---------------------------------------------------------

    if student_cgpa < highest_peer_cgpa:
        nudges.append(
            f"Your CGPA is {student_cgpa:.2f}, "
            f"while the highest anonymous peer CGPA is "
            f"{highest_peer_cgpa:.2f}."
        )

    # ---------------------------------------------------------
    # ATTENDANCE
    # ---------------------------------------------------------

    if student_attendance < avg_attendance:
        nudges.append(
            f"Your attendance is {student_attendance:.1f}%, "
            f"while the anonymous peer average is "
            f"{avg_attendance:.1f}%."
        )

    # ---------------------------------------------------------
    # STUDY HOURS
    # ---------------------------------------------------------

    if student_study_hours < avg_study_hours:
        nudges.append(
            f"You study about {student_study_hours:.1f} "
            f"hours/day, compared with an anonymous peer "
            f"average of {avg_study_hours:.1f} hours/day."
        )

    # ---------------------------------------------------------
    # BACKLOGS
    # ---------------------------------------------------------

    if student_backlogs > avg_backlogs:
        nudges.append(
            f"You have {student_backlogs} backlogs, "
            f"while the anonymous peer average is "
            f"{avg_backlogs:.1f}."
        )

    # =========================================================
    # 8. POSITIVE MESSAGE
    # =========================================================

    if not nudges:
        nudges.append(
            "You are performing at or above the anonymous "
            "peer level in the measured areas. Keep it up!"
        )

    # =========================================================
    # 9. FINAL API RESPONSE
    # =========================================================

    return {
        "student_id": student.id,

        "peer_count": len(peers),

        "comparison": {

            # =================================================
            # CGPA
            # =================================================

            "cgpa": {
                "student": round(
                    student_cgpa,
                    2
                ),

                "highest_peer": round(
                    highest_peer_cgpa,
                    2
                )
            },

            # =================================================
            # ATTENDANCE
            # =================================================

            "attendance": {
                "student": round(
                    student_attendance,
                    2
                ),

                "peer_average": round(
                    avg_attendance,
                    2
                )
            },

            # =================================================
            # STUDY HOURS
            # =================================================

            "study_hours": {
                "student": round(
                    student_study_hours,
                    2
                ),

                "peer_average": round(
                    avg_study_hours,
                    2
                )
            },

            # =================================================
            # BACKLOGS
            # =================================================

            "backlogs": {
                "student": student_backlogs,

                "peer_average": round(
                    avg_backlogs,
                    2
                )
            }
        },

        # =====================================================
        # NUDGES
        # =====================================================

        "nudges": nudges
    }