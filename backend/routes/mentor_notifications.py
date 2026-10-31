from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import (
    Mentor,
    MentorNotification,
    Student
)

from services.mentor_notification_service import (
    generate_mentor_notifications
)


router = APIRouter(
    prefix="/mentor/notifications",
    tags=["Mentor Notifications"]
)


# =========================================================
# VERIFY MENTOR
# =========================================================

def verify_mentor(db: Session, mentor_id: int):
    mentor = db.query(Mentor).filter(
        Mentor.id == mentor_id
    ).first()

    if not mentor:
        raise HTTPException(
            status_code=404,
            detail="Mentor not found"
        )

    return mentor


# =========================================================
# GET ALL NOTIFICATIONS
# =========================================================

@router.get("")
def get_notifications(
    mentor_id: int,
    db: Session = Depends(get_db)
):
    verify_mentor(db, mentor_id)

    # Automatically generate new notifications
    generate_mentor_notifications(
        db=db,
        mentor_id=mentor_id
    )

    notifications = (
        db.query(MentorNotification)
        .filter(
            MentorNotification.mentor_id == mentor_id
        )
        .order_by(
            MentorNotification.created_at.desc()
        )
        .all()
    )

    result = []

    for notification in notifications:

        student_name = None
        student_usn = None

        if notification.student_id is not None:

            student = db.query(Student).filter(
                Student.id == notification.student_id
            ).first()

            if student:
                student_name = student.name
                student_usn = student.usn

        result.append({
            "id": notification.id,
            "student_id": notification.student_id,
            "student_name": student_name,
            "student_usn": student_usn,
            "notification_type": notification.notification_type,
            "title": notification.title,
            "message": notification.message,
            "priority": notification.priority,
            "is_read": bool(notification.is_read),
            "created_at": notification.created_at
        })

    unread_count = sum(
        1
        for notification in result
        if not notification["is_read"]
    )

    return {
        "total": len(result),
        "unread": unread_count,
        "notifications": result
    }


# =========================================================
# GET UNREAD NOTIFICATIONS
# =========================================================

@router.get("/unread")
def get_unread_notifications(
    mentor_id: int,
    db: Session = Depends(get_db)
):
    verify_mentor(db, mentor_id)

    # Automatically generate new notifications
    generate_mentor_notifications(
        db=db,
        mentor_id=mentor_id
    )

    notifications = (
        db.query(MentorNotification)
        .filter(
            MentorNotification.mentor_id == mentor_id,
            MentorNotification.is_read == False
        )
        .order_by(
            MentorNotification.created_at.desc()
        )
        .all()
    )

    result = []

    for notification in notifications:

        student_name = None
        student_usn = None

        if notification.student_id is not None:

            student = db.query(Student).filter(
                Student.id == notification.student_id
            ).first()

            if student:
                student_name = student.name
                student_usn = student.usn

        result.append({
            "id": notification.id,
            "student_id": notification.student_id,
            "student_name": student_name,
            "student_usn": student_usn,
            "notification_type": notification.notification_type,
            "title": notification.title,
            "message": notification.message,
            "priority": notification.priority,
            "is_read": bool(notification.is_read),
            "created_at": notification.created_at
        })

    return {
        "total": len(result),
        "notifications": result
    }


# =========================================================
# MARK ONE NOTIFICATION AS READ
# =========================================================

@router.put("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    mentor_id: int,
    db: Session = Depends(get_db)
):
    verify_mentor(db, mentor_id)

    notification = (
        db.query(MentorNotification)
        .filter(
            MentorNotification.id == notification_id,
            MentorNotification.mentor_id == mentor_id
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return {
        "message": "Notification marked as read",
        "notification_id": notification.id
    }


# =========================================================
# MARK ALL NOTIFICATIONS AS READ
# =========================================================

@router.put("/read-all")
def mark_all_notifications_read(
    mentor_id: int,
    db: Session = Depends(get_db)
):
    verify_mentor(db, mentor_id)

    notifications = (
        db.query(MentorNotification)
        .filter(
            MentorNotification.mentor_id == mentor_id,
            MentorNotification.is_read == False
        )
        .all()
    )

    for notification in notifications:
        notification.is_read = True

    db.commit()

    return {
        "message": "All notifications marked as read",
        "updated": len(notifications)
    }