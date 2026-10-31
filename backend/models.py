from sqlalchemy import (

    Column,

    Integer,

    String,

    Text,

    DECIMAL,

    TIMESTAMP,

    ForeignKey,

    Boolean,

    Time,

    Date

)



from sqlalchemy.sql import func

from database import Base





# =========================================================

# STUDENT

# =========================================================



class Student(Base):

    __tablename__ = "students"



    id = Column(

        Integer,

        primary_key=True,

        index=True

    )



    usn = Column(

        String(20),

        unique=True,

        nullable=False

    )



    name = Column(

        String(100),

        nullable=False

    )



    email = Column(

        String(100),

        unique=True,

        nullable=False

    )



    password = Column(

        String(255),

        nullable=False

    )



    username = Column(

        String(50),

        unique=True

    )



    role = Column(

        String(20),

        default="student"

    )



    branch = Column(

        String(50)

    )



    semester = Column(

        Integer

    )



    # Student section: A / B / C

    section = Column(

        String(10),

        nullable=True

    )



    cgpa = Column(

        DECIMAL(3, 2)

    )



    attendance = Column(

        DECIMAL(5, 2)

    )



    backlogs = Column(

        Integer,

        default=0

    )



    study_hours = Column(

        DECIMAL(4, 2)

    )



    # =====================================================

    # PARENT DETAILS

    # =====================================================



    parent_name = Column(

        String(100),

        nullable=True

    )



    parent_mobile = Column(

        String(15),

        nullable=True

    )



    created_at = Column(

        TIMESTAMP,

        server_default=func.now()

    )





# =========================================================

# ADMIN

# =========================================================



class Admin(Base):

    __tablename__ = "admins"



    id = Column(

        Integer,

        primary_key=True,

        index=True

    )



    username = Column(

        String(50),

        unique=True,

        nullable=False

    )



    password = Column(

        String(255),

        nullable=False

    )



    name = Column(

        String(100),

        nullable=False

    )



    email = Column(

        String(100)

    )



    created_at = Column(

        TIMESTAMP,

        server_default=func.now()

    )





# =========================================================

# MICRO GOAL

# =========================================================



class Goal(Base):

    __tablename__ = "goals"



    id = Column(

        Integer,

        primary_key=True,

        index=True

    )



    student_id = Column(

        Integer,

        ForeignKey("students.id"),

        nullable=False,

        index=True

    )



    title = Column(

        String(150),

        nullable=False

    )



    description = Column(

        String(500),

        nullable=True

    )



    target = Column(

        String(200),

        nullable=True

    )



    target_value = Column(

        DECIMAL(6, 2),

        nullable=True

    )



    target_unit = Column(

        String(50),

        nullable=True

    )



    duration_days = Column(

        Integer,

        default=7

    )



    priority = Column(

        String(20),

        default="Medium"

    )



    progress = Column(

        Integer,

        default=0

    )



    completed = Column(

        Boolean,

        default=False

    )



    created_at = Column(

        TIMESTAMP,

        server_default=func.now()

    )





# =========================================================

# DAILY GOAL PROGRESS

# =========================================================



class GoalProgress(Base):

    __tablename__ = "goal_progress"



    id = Column(

        Integer,

        primary_key=True,

        index=True

    )



    goal_id = Column(

        Integer,

        ForeignKey("goals.id"),

        nullable=False,

        index=True

    )



    student_id = Column(

        Integer,

        ForeignKey("students.id"),

        nullable=False,

        index=True

    )



    progress_date = Column(

        TIMESTAMP,

        server_default=func.now()

    )



    value = Column(

        DECIMAL(6, 2),

        nullable=False

    )



    achieved = Column(

        Boolean,

        default=False

    )



    notes = Column(

        String(500),

        nullable=True

    )





# =========================================================

# FACULTY

# =========================================================



class Faculty(Base):

    __tablename__ = "faculty"



    id = Column(

        Integer,

        primary_key=True,

        index=True

    )



    faculty_name = Column(

        String(100),

        nullable=False

    )



    email = Column(

        String(150),

        unique=True,

        nullable=False

    )



    password = Column(

        String(255),

        nullable=False

    )



    department = Column(

        String(100)

    )



    created_at = Column(

        TIMESTAMP,

        server_default=func.now()

    )





# =========================================================

# FACULTY - STUDENT ASSIGNMENT

# =========================================================



class FacultyStudent(Base):

    __tablename__ = "faculty_students"



    id = Column(

        Integer,

        primary_key=True,

        index=True

    )



    faculty_id = Column(

        Integer,

        ForeignKey("faculty.id"),

        nullable=False,

        index=True

    )



    student_id = Column(

        Integer,

        ForeignKey("students.id"),

        nullable=False,

        index=True

    )



    assigned_at = Column(

        TIMESTAMP,

        server_default=func.now()

    )





# =========================================================

# FACULTY - PROJECT STUDENT ASSIGNMENT

# =========================================================



class FacultyProjectStudent(Base):

    __tablename__ = "faculty_project_students"



    id = Column(

        Integer,

        primary_key=True,

        index=True

    )



    faculty_id = Column(

        Integer,

        ForeignKey("faculty.id"),

        nullable=False,

        index=True

    )



    student_id = Column(

        Integer,

        ForeignKey("students.id"),

        nullable=False,

        index=True

    )



    assigned_at = Column(

        TIMESTAMP,

        server_default=func.now()

    )





# =========================================================

# FACULTY TIMETABLE

# =========================================================



class Timetable(Base):

    __tablename__ = "timetable"



    id = Column(

        Integer,

        primary_key=True,

        index=True

    )



    faculty_id = Column(

        Integer,

        ForeignKey("faculty.id"),

        nullable=False,

        index=True

    )



    day_of_week = Column(

        String(20),

        nullable=False

    )



    start_time = Column(

        Time,

        nullable=False

    )



    end_time = Column(

        Time,

        nullable=False

    )



    class_name = Column(

        String(50),

        nullable=False

    )



    subject = Column(

        String(100),

        nullable=False

    )



    class_type = Column(

        String(20),

        default="Theory"

    )



    room_no = Column(

        String(50),

        nullable=True

    )





# =========================================================

# FACULTY ACTIVITY

# =========================================================



class FacultyActivity(Base):

    __tablename__ = "faculty_activities"



    id = Column(

        Integer,

        primary_key=True,

        index=True

    )



    faculty_id = Column(

        Integer,

        ForeignKey(

            "faculty.id",

            ondelete="CASCADE"

        ),

        nullable=False,

        index=True

    )



    activity_type = Column(

        String(50),

        nullable=False

    )



    activity_title = Column(

        String(255),

        nullable=False

    )



    description = Column(

        Text,

        nullable=True

    )



    student_id = Column(

        Integer,

        ForeignKey(

            "students.id",

            ondelete="SET NULL"

        ),

        nullable=True,

        index=True

    )



    timetable_id = Column(

        Integer,

        ForeignKey(

            "timetable.id",

            ondelete="SET NULL"

        ),

        nullable=True,

        index=True

    )



    created_at = Column(

        TIMESTAMP,

        server_default=func.now()

    )





# =========================================================

# CLASS ATTENDANCE

# =========================================================



class ClassAttendance(Base):

    __tablename__ = "class_attendance"



    id = Column(

        Integer,

        primary_key=True,

        index=True

    )



    faculty_id = Column(

        Integer,

        ForeignKey(

            "faculty.id",

            ondelete="CASCADE"

        ),

        nullable=False,

        index=True

    )



    student_id = Column(

        Integer,

        ForeignKey(

            "students.id",

            ondelete="CASCADE"

        ),

        nullable=False,

        index=True

    )



    timetable_id = Column(

        Integer,

        ForeignKey(

            "timetable.id",

            ondelete="SET NULL"

        ),

        nullable=True,

        index=True

    )



    attendance_date = Column(

        Date,

        nullable=False

    )



    status = Column(

        String(20),

        nullable=False

    )



    marked_at = Column(

        TIMESTAMP,

        server_default=func.now()

    )

    # =========================================================

# INTERVENTIONS

# =========================================================



class Intervention(Base):

    __tablename__ = "interventions"



    id = Column(

        Integer,

        primary_key=True,

        index=True

    )



    faculty_id = Column(

        Integer,

        ForeignKey("faculty.id", ondelete="CASCADE"),

        nullable=False,

        index=True

    )



    student_id = Column(

        Integer,

        ForeignKey("students.id", ondelete="CASCADE"),

        nullable=False,

        index=True

    )



    intervention_type = Column(

        String(50),

        nullable=False

    )



    priority = Column(

        String(20),

        default="Medium",

        nullable=False

    )



    status = Column(

        String(20),

        default="Active",

        nullable=False

    )



    risk_factor = Column(

        String(100),

        nullable=True

    )



    intervention_action = Column(

        Text,

        nullable=True

    )



    follow_up_date = Column(

        Date,

        nullable=True

    )



    description = Column(

        Text,

        nullable=True

    )



    created_at = Column(

        TIMESTAMP,

        server_default=func.now()

    )

    # =========================================================

# MENTOR

# =========================================================



class Mentor(Base):

    __tablename__ = "mentors"



    id = Column(

        Integer,

        primary_key=True,

        index=True

    )



    mentor_name = Column(

        String(100),

        nullable=False

    )



    email = Column(

        String(150),

        unique=True,

        nullable=False

    )



    password = Column(

        String(255),

        nullable=False

    )



    department = Column(

        String(100),

        nullable=True

    )



    created_at = Column(

        TIMESTAMP,

        server_default=func.now()

    )





# =========================================================

# MENTOR - STUDENT ASSIGNMENT

# =========================================================



class MentorStudent(Base):

    __tablename__ = "mentor_students"



    id = Column(

        Integer,

        primary_key=True,

        index=True

    )



    mentor_id = Column(

        Integer,

        ForeignKey(

            "mentors.id",

            ondelete="CASCADE"

        ),

        nullable=False,

        index=True

    )



    student_id = Column(

        Integer,

        ForeignKey(

            "students.id",

            ondelete="CASCADE"

        ),

        nullable=False,

        index=True

    )



    assigned_at = Column(

        TIMESTAMP,

        server_default=func.now()

    )

    # =========================================================

# MENTOR NOTES

# =========================================================



class MentorNote(Base):

    __tablename__ = "mentor_notes"



    id = Column(

        Integer,

        primary_key=True,

        index=True

    )



    mentor_id = Column(

        Integer,

        ForeignKey("mentors.id", ondelete="CASCADE"),

        nullable=False,

        index=True

    )



    student_id = Column(

        Integer,

        ForeignKey("students.id", ondelete="CASCADE"),

        nullable=False,

        index=True

    )



    note = Column(

        String(1000),

        nullable=False

    )



    created_at = Column(

        TIMESTAMP,

        server_default=func.now()

    )





# =========================================================

# MENTOR ACTIVITIES

# =========================================================



class MentorActivity(Base):

    __tablename__ = "mentor_activities"



    id = Column(

        Integer,

        primary_key=True,

        index=True

    )



    mentor_id = Column(

        Integer,

        ForeignKey("mentors.id", ondelete="CASCADE"),

        nullable=False,

        index=True

    )



    student_id = Column(

        Integer,

        ForeignKey("students.id", ondelete="CASCADE"),

        nullable=False,

        index=True

    )



    activity_type = Column(

        String(100),

        nullable=False

    )



    description = Column(

        String(1000),

        nullable=False

    )



    activity_date = Column(

        TIMESTAMP,

        server_default=func.now()

    )





# =========================================================

# MENTOR FOLLOW-UPS

# =========================================================



class MentorFollowUp(Base):

    __tablename__ = "mentor_followups"



    id = Column(

        Integer,

        primary_key=True,

        index=True

    )



    mentor_id = Column(

        Integer,

        ForeignKey("mentors.id", ondelete="CASCADE"),

        nullable=False,

        index=True

    )



    student_id = Column(

        Integer,

        ForeignKey("students.id", ondelete="CASCADE"),

        nullable=False,

        index=True

    )



    follow_up_date = Column(

        TIMESTAMP,

        nullable=False

    )



    purpose = Column(

        String(500),

        nullable=True

    )



    status = Column(

        String(30),

        default="Pending"

    )



    created_at = Column(

        TIMESTAMP,

        server_default=func.now()

    )

    # =========================================================

# MENTOR INTERVENTIONS

# =========================================================



class MentorIntervention(Base):

    __tablename__ = "mentor_interventions"



    id = Column(

        Integer,

        primary_key=True,

        index=True

    )



    mentor_id = Column(

        Integer,

        ForeignKey("mentors.id", ondelete="CASCADE"),

        nullable=False,

        index=True

    )



    student_id = Column(

        Integer,

        ForeignKey("students.id", ondelete="CASCADE"),

        nullable=False,

        index=True

    )



    intervention_type = Column(

        String(100),

        nullable=False

    )



    priority = Column(

        String(30),

        default="Medium"

    )



    description = Column(

        String(1000),

        nullable=False

    )



    target_date = Column(

        Date,

        nullable=True

    )



    status = Column(

        String(30),

        default="Planned"

    )



    outcome = Column(

        String(1000),

        nullable=True

    )



    created_at = Column(

        TIMESTAMP,

        server_default=func.now()

    )



    updated_at = Column(

        TIMESTAMP,

        server_default=func.now(),

        onupdate=func.now()

    )


# =========================================================
# MENTOR NOTIFICATIONS
# =========================================================

class MentorNotification(Base):
    __tablename__ = "mentor_notifications"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    mentor_id = Column(
        Integer,
        ForeignKey("mentors.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    student_id = Column(
        Integer,
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )

    notification_type = Column(
        String(100),
        nullable=False
    )

    title = Column(
        String(255),
        nullable=False
    )

    message = Column(
        String(1000),
        nullable=False
    )

    priority = Column(
        String(30),
        default="Medium"
    )

    is_read = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )
