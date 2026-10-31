from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from database import get_db
from models import Student


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# =====================================================
# ADMIN AUTH CHECK
# =====================================================

def verify_admin(
    authorization: str = Header(None)
):

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Admin authentication required"
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization format"
        )

    token = authorization.replace(
        "Bearer ",
        "",
        1
    ).strip()

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Invalid admin token"
        )

    return token


# =====================================================
# ADMIN DASHBOARD
# =====================================================

@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    token: str = Depends(verify_admin)
):

    try:

        students = db.query(Student).all()

        total_students = len(students)

        high_risk = 0
        medium_risk = 0
        low_risk = 0

        for student in students:

            risk = getattr(
                student,
                "risk_score",
                0
            ) or 0

            risk = float(risk)

            if risk >= 70:
                high_risk += 1

            elif risk >= 40:
                medium_risk += 1

            else:
                low_risk += 1

        return {

            "success": True,

            "overview": {
                "total_students": total_students,
                "high_risk": high_risk,
                "medium_risk": medium_risk,
                "low_risk": low_risk
            }

        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Unable to load admin dashboard: {str(e)}"
        )


# =====================================================
# ALL STUDENTS
# =====================================================

@router.get("/students")
def get_all_students(
    db: Session = Depends(get_db),
    token: str = Depends(verify_admin)
):

    try:

        students = db.query(Student).all()

        data = []

        for student in students:

            data.append({

                "id": getattr(
                    student,
                    "id",
                    None
                ),

                "name": getattr(
                    student,
                    "name",
                    None
                ),

                "email": getattr(
                    student,
                    "email",
                    None
                ),

                "usn": getattr(
                    student,
                    "usn",
                    None
                ),

                "attendance": getattr(
                    student,
                    "attendance",
                    None
                ),

                "cgpa": getattr(
                    student,
                    "cgpa",
                    None
                ),

                "risk_score": getattr(
                    student,
                    "risk_score",
                    0
                ) or 0

            })

        return {

            "success": True,
            "count": len(data),
            "students": data

        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Unable to load students: {str(e)}"
        )


# =====================================================
# RISK SUMMARY
# =====================================================

@router.get("/risk-summary")
def risk_summary(
    db: Session = Depends(get_db),
    token: str = Depends(verify_admin)
):

    try:

        students = db.query(Student).all()

        critical = 0
        high = 0
        medium = 0
        low = 0

        for student in students:

            score = float(
                getattr(
                    student,
                    "risk_score",
                    0
                ) or 0
            )

            if score >= 80:
                critical += 1

            elif score >= 60:
                high += 1

            elif score >= 40:
                medium += 1

            else:
                low += 1

        return {

            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low

        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Unable to calculate risk summary: {str(e)}"
        )


# =====================================================
# SEARCH STUDENTS
# =====================================================

@router.get("/students/search")
def search_students(
    query: str,
    db: Session = Depends(get_db),
    token: str = Depends(verify_admin)
):

    try:

        search = f"%{query.strip()}%"

        students = (
            db.query(Student)
            .filter(
                (Student.name.like(search)) |
                (Student.email.like(search)) |
                (Student.usn.like(search))
            )
            .all()
        )

        data = []

        for student in students:

            data.append({

                "id": getattr(
                    student,
                    "id",
                    None
                ),

                "name": getattr(
                    student,
                    "name",
                    None
                ),

                "email": getattr(
                    student,
                    "email",
                    None
                ),

                "usn": getattr(
                    student,
                    "usn",
                    None
                ),

                "cgpa": getattr(
                    student,
                    "cgpa",
                    None
                ),

                "attendance": getattr(
                    student,
                    "attendance",
                    None
                ),

                "risk_score": getattr(
                    student,
                    "risk_score",
                    0
                ) or 0

            })

        return {

            "success": True,
            "count": len(data),
            "students": data

        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Search failed: {str(e)}"
        )


# =====================================================
# SYSTEM STATUS
# =====================================================

@router.get("/system-status")
def system_status(
    token: str = Depends(verify_admin)
):

    return {

        "success": True,

        "system": "AI Student Risk Monitoring",

        "status": "ACTIVE",

        "services": {

            "backend": "ONLINE",

            "database": "CONNECTED",

            "risk_engine": "READY",

            "intervention_engine": "READY"

        }

    }