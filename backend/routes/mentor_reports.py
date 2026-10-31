from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Mentor, MentorStudent, Student, MentorActivity, MentorFollowUp, MentorIntervention

router = APIRouter(prefix="/mentor", tags=["Mentor Reports"])

def verify_mentor(db: Session, mentor_id: int):
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    return mentor

@router.get("/reports")
def get_mentor_report(mentor_id: int, db: Session = Depends(get_db)):
    mentor = verify_mentor(db, mentor_id)
    assignments = db.query(MentorStudent).filter(MentorStudent.mentor_id == mentor_id).all()
    students, total_cgpa, cgpa_count, total_attendance, attendance_count = [], 0.0, 0, 0.0, 0
    high_risk = medium_risk = low_risk = 0

    for assignment in assignments:
        student = db.query(Student).filter(Student.id == assignment.student_id).first()
        if not student:
            continue
        cgpa = float(student.cgpa) if student.cgpa is not None else None
        attendance = float(student.attendance) if student.attendance is not None else None
        backlogs = student.backlogs or 0
        if (cgpa is not None and cgpa < 5.5) or (attendance is not None and attendance < 65) or backlogs >= 3:
            risk = "High Risk"; high_risk += 1
        elif (cgpa is not None and cgpa < 6.5) or (attendance is not None and attendance < 75) or backlogs >= 1:
            risk = "Medium Risk"; medium_risk += 1
        else:
            risk = "Low Risk"; low_risk += 1
        if cgpa is not None: total_cgpa += cgpa; cgpa_count += 1
        if attendance is not None: total_attendance += attendance; attendance_count += 1
        students.append({"id": student.id, "usn": student.usn, "name": student.name, "email": student.email,
                         "branch": student.branch, "semester": student.semester, "section": student.section,
                         "cgpa": cgpa, "attendance": attendance, "backlogs": backlogs, "risk_status": risk})

    activities = db.query(MentorActivity).filter(MentorActivity.mentor_id == mentor_id).order_by(MentorActivity.activity_date.desc()).all()
    followups = db.query(MentorFollowUp).filter(MentorFollowUp.mentor_id == mentor_id).order_by(MentorFollowUp.follow_up_date.asc()).all()
    interventions = db.query(MentorIntervention).filter(MentorIntervention.mentor_id == mentor_id).order_by(MentorIntervention.created_at.desc()).all()
    lookup = {s["id"]: s for s in students}

    recent_activities = [{"id": a.id, "student_id": a.student_id, "student_name": lookup.get(a.student_id, {}).get("name", "Unknown"),
                          "student_usn": lookup.get(a.student_id, {}).get("usn", "-"), "activity_type": a.activity_type,
                          "description": a.description, "activity_date": a.activity_date} for a in activities[:10]]
    pending = [f for f in followups if f.status == "Pending"]
    upcoming = [{"id": f.id, "student_id": f.student_id, "student_name": lookup.get(f.student_id, {}).get("name", "Unknown"),
                 "student_usn": lookup.get(f.student_id, {}).get("usn", "-"), "follow_up_date": f.follow_up_date,
                 "purpose": f.purpose, "status": f.status} for f in pending[:10]]
    recent_interventions = [{"id": i.id, "student_id": i.student_id, "student_name": lookup.get(i.student_id, {}).get("name", "Unknown"),
                             "student_usn": lookup.get(i.student_id, {}).get("usn", "-"), "intervention_type": i.intervention_type,
                             "priority": i.priority, "description": i.description, "target_date": i.target_date,
                             "status": i.status, "outcome": i.outcome, "created_at": i.created_at} for i in interventions[:10]]

    return {
        "mentor": {"id": mentor.id, "name": mentor.mentor_name, "email": mentor.email, "department": mentor.department},
        "summary": {
            "total_students": len(students), "high_risk": high_risk, "medium_risk": medium_risk, "low_risk": low_risk,
            "average_cgpa": round(total_cgpa / cgpa_count, 2) if cgpa_count else None,
            "average_attendance": round(total_attendance / attendance_count, 2) if attendance_count else None,
            "total_activities": len(activities), "total_followups": len(followups), "pending_followups": len(pending),
            "completed_followups": sum(1 for f in followups if f.status == "Completed"), "total_interventions": len(interventions),
            "planned_interventions": sum(1 for i in interventions if i.status == "Planned"),
            "in_progress_interventions": sum(1 for i in interventions if i.status == "In Progress"),
            "completed_interventions": sum(1 for i in interventions if i.status == "Completed")
        },
        "students": students, "recent_activities": recent_activities,
        "upcoming_followups": upcoming, "recent_interventions": recent_interventions
    }
