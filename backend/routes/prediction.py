from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from schemas import PredictionRequest, PredictionResponse
from ml.predict import predict_dropout, calculate_context_risk
from database import get_db
from models import Student


router = APIRouter(
    prefix="/prediction",
    tags=["AI Prediction"]
)


# =========================================================
# EXISTING SINGLE STUDENT ML PREDICTION
# =========================================================

@router.post(
    "/predict",
    response_model=PredictionResponse
)
def predict_student_dropout(
    data: PredictionRequest
):

    try:

        student_data = data.model_dump()

        result = predict_dropout(
            student_data
        )

        return result

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


# =========================================================
# ADMIN DASHBOARD SUMMARY
# =========================================================

@router.get("/admin-summary")
def get_admin_summary(
    db: Session = Depends(get_db)
):

    try:

        # -------------------------------------------------
        # Get all registered students
        # -------------------------------------------------

        students = (
            db.query(Student)
            .order_by(Student.id.desc())
            .all()
        )

        total_students = len(students)

        high_risk = 0
        medium_risk = 0
        low_risk = 0

        priority_students = []

        factor_counts = {}

        all_student_results = []


        # -------------------------------------------------
        # Calculate risk for every registered student
        # -------------------------------------------------

        for student in students:

            student_data = {

                "cgpa": float(student.cgpa)
                if student.cgpa is not None
                else 0,

                "attendance": float(student.attendance)
                if student.attendance is not None
                else 100,

                "backlogs": int(student.backlogs)
                if student.backlogs is not None
                else 0,

                "study_hours": float(student.study_hours)
                if student.study_hours is not None
                else 0,

                # These are not currently stored in
                # the registration table.
                # The prediction function has defaults.
                "financial_difficulty": 0,

                "assignment_completion": 100
            }


            # ---------------------------------------------
            # Existing project-specific risk calculation
            # ---------------------------------------------

            risk_score, factors = calculate_context_risk(
                student_data
            )

            risk_score = round(
                float(risk_score),
                2
            )


            # ---------------------------------------------
            # Risk level
            # ---------------------------------------------

            if risk_score >= 70:

                risk_level = "HIGH"

                high_risk += 1

            elif risk_score >= 40:

                risk_level = "MEDIUM"

                medium_risk += 1

            else:

                risk_level = "LOW"

                low_risk += 1


            # ---------------------------------------------
            # Count risk factors
            # ---------------------------------------------

            for factor in factors:

                factor_counts[factor] = (
                    factor_counts.get(factor, 0) + 1
                )


            # ---------------------------------------------
            # Student result
            # ---------------------------------------------

            student_result = {

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

                "backlogs": (
                    int(student.backlogs)
                    if student.backlogs is not None
                    else 0
                ),

                "study_hours": (
                    float(student.study_hours)
                    if student.study_hours is not None
                    else None
                ),

                "risk_percentage": risk_score,

                "risk_level": risk_level,

                "risk_factors": factors
            }


            all_student_results.append(
                student_result
            )


        # -------------------------------------------------
        # Priority queue
        # -------------------------------------------------

        priority_students = sorted(
            all_student_results,
            key=lambda student:
                student["risk_percentage"],
            reverse=True
        )[:10]


        # -------------------------------------------------
        # Risk factor summary
        # -------------------------------------------------

        factor_summary = []

        if total_students > 0:

            for factor, count in sorted(
                factor_counts.items(),
                key=lambda item: item[1],
                reverse=True
            ):

                percentage = round(
                    (count / total_students) * 100,
                    1
                )

                factor_summary.append({

                    "factor": factor,

                    "count": count,

                    "percentage": percentage
                })


        # -------------------------------------------------
        # Return dashboard data
        # -------------------------------------------------

        return {

            "total_students": total_students,

            "high_risk": high_risk,

            "medium_risk": medium_risk,

            "low_risk": low_risk,

            "priority_students": priority_students,

            "factor_summary": factor_summary,

            "students": all_student_results
        }


    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=(
                "Failed to generate Admin risk summary: "
                f"{str(e)}"
            )
        )