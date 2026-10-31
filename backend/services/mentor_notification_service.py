from datetime import datetime, date, timedelta

from typing import Optional


from sqlalchemy.orm import Session


from models import (

    MentorStudent,

    Student,

    MentorFollowUp,

    MentorIntervention,

    MentorNotification

)


# ============================================================

# CALCULATE STUDENT RISK

# ============================================================


def calculate_student_risk(student):

    """

    Calculate the current risk category of a student

    using CGPA, attendance and backlogs.

    """


    cgpa = (

        float(student.cgpa)

        if student.cgpa is not None

        else None

    )


    attendance = (

        float(student.attendance)

        if student.attendance is not None

        else None

    )


    backlogs = student.backlogs or 0


    # --------------------------------------------------------

    # HIGH RISK

    # --------------------------------------------------------


    if (

        (cgpa is not None and cgpa < 5.5)

        or

        (attendance is not None and attendance < 65)

        or

        backlogs >= 3

    ):

        return "High Risk"


    # --------------------------------------------------------

    # MEDIUM RISK

    # --------------------------------------------------------


    if (

        (cgpa is not None and cgpa < 6.5)

        or

        (attendance is not None and attendance < 75)

        or

        backlogs >= 1

    ):

        return "Medium Risk"


    # --------------------------------------------------------

    # LOW RISK

    # --------------------------------------------------------


    return "Low Risk"


# ============================================================


# ============================================================
# CREATE RISK-CHANGE NOTIFICATION
# ============================================================

def create_risk_change_notification(
    db: Session,
    student,
    old_risk: str,
    new_risk: str
):
    """
    Create a notification for every mentor assigned to the student
    when the student's risk status changes.
    """

    if old_risk == new_risk:
        return 0

    assignments = (
        db.query(MentorStudent)
        .filter(
            MentorStudent.student_id == student.id
        )
        .all()
    )

    if not assignments:
        return 0

    if new_risk == "High Risk":
        priority = "High"
        notification_type = "Risk Increased"

    elif new_risk == "Medium Risk":
        priority = "Medium"
        notification_type = "Risk Increased"

    else:
        priority = "Low"
        notification_type = "Risk Improved"

    created_count = 0

    for assignment in assignments:

        existing = (
            db.query(MentorNotification)
            .filter(
                MentorNotification.mentor_id == assignment.mentor_id,
                MentorNotification.student_id == student.id,
                MentorNotification.notification_type == notification_type,
                MentorNotification.title == "Student Risk Status Changed"
            )
            .all()
        )

        duplicate = False

        for notification in existing:
            if notification.message == (
                f"{student.name}'s risk status changed "
                f"from {old_risk} to {new_risk}."
            ):
                duplicate = True
                break

        if duplicate:
            continue

        notification = MentorNotification(
            mentor_id=assignment.mentor_id,
            student_id=student.id,
            notification_type=notification_type,
            title="Student Risk Status Changed",
            message=(
                f"{student.name}'s risk status changed "
                f"from {old_risk} to {new_risk}."
            ),
            priority=priority,
            is_read=False
        )

        db.add(notification)
        created_count += 1

    return created_count


# ============================================================
# PROCESS STUDENT RISK CHANGE
# ============================================================

def process_student_risk_change(
    db: Session,
    student,
    old_risk: str
):
    """
    Recalculate risk after CGPA, attendance or backlog changes,
    create notifications if the risk changed, and synchronize
    the student's stored risk_status.
    """

    new_risk = calculate_student_risk(student)

    created_count = create_risk_change_notification(
        db=db,
        student=student,
        old_risk=old_risk,
        new_risk=new_risk
    )

    student.risk_status = new_risk

    return new_risk, created_count


# CREATE NOTIFICATION IF IT DOES NOT ALREADY EXIST TODAY

# ============================================================


def create_notification_if_not_exists(

    db: Session,

    mentor_id: int,

    student_id: Optional[int],

    notification_type: str,

    title: str,

    message: str,

    priority: str,

    notification_date: Optional[date] = None

):

    """

    Create a notification only once for the same mentor,

    student, notification type, title and calendar date.


    This prevents duplicate notifications when the mentor

    refreshes the dashboard multiple times on the same day.

    """


    if notification_date is None:

        notification_date = date.today()


    # --------------------------------------------------------

    # Find existing notifications

    # --------------------------------------------------------


    existing_notifications = (

        db.query(MentorNotification)

        .filter(

            MentorNotification.mentor_id == mentor_id,

            MentorNotification.student_id == student_id,

            MentorNotification.notification_type

                == notification_type,

            MentorNotification.title == title

        )

        .all()

    )


    # --------------------------------------------------------

    # Check whether notification was already created today

    # --------------------------------------------------------


    for existing in existing_notifications:


        if not existing.created_at:

            continue


        if isinstance(

            existing.created_at,

            datetime

        ):

            created_date = existing.created_at.date()


        else:

            created_date = existing.created_at


        if created_date == notification_date:

            return existing, False


    # --------------------------------------------------------

    # Create new notification

    # --------------------------------------------------------


    notification = MentorNotification(

        mentor_id=mentor_id,

        student_id=student_id,

        notification_type=notification_type,

        title=title,

        message=message,

        priority=priority,

        is_read=False

    )


    db.add(notification)


    return notification, True


# ============================================================

# GENERATE AUTOMATIC MENTOR NOTIFICATIONS

# ============================================================


def generate_mentor_notifications(

    db: Session,

    mentor_id: int

):

    """

    Automatically generate mentor notifications.


    Notification types:


    1. High Risk Student

    2. Medium Risk Student

    3. Upcoming Follow-up

    4. Upcoming Intervention


    Follow-ups and interventions are checked for the next

    3 days.

    """


    # ========================================================

    # GET STUDENTS ASSIGNED TO THIS MENTOR

    # ========================================================


    assignments = (

        db.query(MentorStudent)

        .filter(

            MentorStudent.mentor_id == mentor_id

        )

        .all()

    )


    # ========================================================

    # DATE RANGE

    # ========================================================


    today = date.today()


    upcoming_date = (

        today + timedelta(days=3)

    )


    created_count = 0


    # ========================================================

    # PROCESS EACH ASSIGNED STUDENT

    # ========================================================


    for assignment in assignments:


        student = (

            db.query(Student)

            .filter(

                Student.id == assignment.student_id

            )

            .first()

        )


        if not student:

            continue


        # ====================================================

        # CALCULATE CURRENT RISK

        # ====================================================


        risk = calculate_student_risk(student)


        # ====================================================

        # HIGH RISK NOTIFICATION

        # ====================================================


        if risk == "High Risk":


            notification, created = (

                create_notification_if_not_exists(

                    db=db,

                    mentor_id=mentor_id,

                    student_id=student.id,

                    notification_type="High Risk",

                    title="High Risk Student",

                    message=(

                        f"{student.name} requires immediate "

                        f"mentoring attention. Please review "

                        f"the student's academic and attendance "

                        f"performance."

                    ),

                    priority="High",

                    notification_date=today

                )

            )


            if created:

                created_count += 1


        # ====================================================

        # MEDIUM RISK NOTIFICATION

        # ====================================================


        elif risk == "Medium Risk":


            notification, created = (

                create_notification_if_not_exists(

                    db=db,

                    mentor_id=mentor_id,

                    student_id=student.id,

                    notification_type="Medium Risk",

                    title="Medium Risk Student",

                    message=(

                        f"{student.name} is currently in the "

                        f"medium-risk category. Consider "

                        f"scheduling a mentoring session."

                    ),

                    priority="Medium",

                    notification_date=today

                )

            )


            if created:

                created_count += 1


        # ====================================================

        # FOLLOW-UP NOTIFICATIONS

        # ====================================================


        followups = (

            db.query(MentorFollowUp)

            .filter(

                MentorFollowUp.mentor_id == mentor_id,

                MentorFollowUp.student_id == student.id,

                MentorFollowUp.status == "Pending"

            )

            .all()

        )


        for followup in followups:


            if not followup.follow_up_date:

                continue


            # ------------------------------------------------

            # Convert datetime to date

            # ------------------------------------------------


            followup_date = (

                followup.follow_up_date

            )


            if isinstance(

                followup_date,

                datetime

            ):

                followup_date_only = (

                    followup_date.date()

                )

            else:

                followup_date_only = followup_date


            # ------------------------------------------------

            # Check next 3 days

            # ------------------------------------------------


            if (

                today

                <= followup_date_only

                <= upcoming_date

            ):


                # Include follow-up ID so multiple follow-ups

                # for the same student remain separate.


                title = (

                    f"Upcoming Follow-up "

                    f"#{followup.id}"

                )


                notification, created = (

                    create_notification_if_not_exists(

                        db=db,

                        mentor_id=mentor_id,

                        student_id=student.id,

                        notification_type="Follow-up",

                        title=title,

                        message=(

                            f"Follow-up with "

                            f"{student.name} is scheduled "

                            f"for "

                            f"{followup_date_only.strftime('%d %b %Y')}."

                        ),

                        priority="Medium",

                        notification_date=today

                    )

                )


                if created:

                    created_count += 1


        # ====================================================

        # INTERVENTION NOTIFICATIONS

        # ====================================================


        interventions = (

            db.query(MentorIntervention)

            .filter(

                MentorIntervention.mentor_id == mentor_id,

                MentorIntervention.student_id == student.id,

                MentorIntervention.status.in_(

                    [

                        "Planned",

                        "In Progress"

                    ]

                )

            )

            .all()

        )


        for intervention in interventions:


            if not intervention.target_date:

                continue


            target_date = (

                intervention.target_date

            )


            # ------------------------------------------------

            # Convert datetime to date if necessary

            # ------------------------------------------------


            if isinstance(

                target_date,

                datetime

            ):

                target_date_only = (

                    target_date.date()

                )

            else:

                target_date_only = target_date


            # ------------------------------------------------

            # Check next 3 days

            # ------------------------------------------------


            if (

                today

                <= target_date_only

                <= upcoming_date

            ):


                # Include intervention ID so multiple

                # interventions remain separate.


                title = (

                    f"Intervention Target Date "

                    f"#{intervention.id}"

                )


                notification, created = (

                    create_notification_if_not_exists(

                        db=db,

                        mentor_id=mentor_id,

                        student_id=student.id,

                        notification_type="Intervention",

                        title=title,

                        message=(

                            f"The "

                            f"{intervention.intervention_type} "

                            f"intervention for "

                            f"{student.name} has a target "

                            f"date of "

                            f"{target_date_only.strftime('%d %b %Y')}."

                        ),

                        priority="High",

                        notification_date=today

                    )

                )


                if created:

                    created_count += 1


    # ========================================================

    # SAVE ALL NEW NOTIFICATIONS

    # ========================================================


    db.commit()


    return created_count
