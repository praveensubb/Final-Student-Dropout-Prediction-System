from pydantic import BaseModel


# =========================================================
# STUDENT REGISTRATION
# =========================================================

class StudentCreate(BaseModel):

    usn: str
    name: str
    email: str
    password: str
    branch: str
    semester: int

    # Student Section
    section: str

    cgpa: float
    attendance: float
    backlogs: int
    study_hours: float

    # =====================================================
    # PARENT DETAILS
    # =====================================================

    parent_name: str
    parent_mobile: str


# =========================================================
# STUDENT RESPONSE
# =========================================================

class StudentResponse(BaseModel):

    id: int
    usn: str
    name: str
    email: str
    branch: str
    semester: int

    # Student Section
    section: str

    cgpa: float
    attendance: float
    backlogs: int
    study_hours: float

    # Parent Details
    parent_name: str | None = None
    parent_mobile: str | None = None

    class Config:
        from_attributes = True


# =========================================================
# AI PREDICTION REQUEST
# =========================================================

class PredictionRequest(BaseModel):

    # -----------------------------------------------------
    # Project-specific student factors
    # -----------------------------------------------------

    cgpa: float
    attendance: float
    backlogs: int
    study_hours: float
    financial_difficulty: int
    assignment_completion: float

    # -----------------------------------------------------
    # Personal information
    # -----------------------------------------------------

    marital_status: int
    age_at_enrollment: int
    gender: int
    nationality: int
    international: int
    displaced: int
    educational_special_needs: int

    # -----------------------------------------------------
    # Admission information
    # -----------------------------------------------------

    application_mode: int
    application_order: int
    course: int

    previous_qualification: int
    previous_qualification_grade: float
    admission_grade: float

    daytime_evening_attendance: int

    # -----------------------------------------------------
    # Family background
    # -----------------------------------------------------

    mothers_qualification: int
    fathers_qualification: int
    mothers_occupation: int
    fathers_occupation: int

    # -----------------------------------------------------
    # Financial / institutional factors
    # -----------------------------------------------------

    debtor: int
    tuition_fees_up_to_date: int
    scholarship_holder: int

    # -----------------------------------------------------
    # First semester performance
    # -----------------------------------------------------

    curricular_units_1st_sem_credited: int
    curricular_units_1st_sem_enrolled: int
    curricular_units_1st_sem_evaluations: int
    curricular_units_1st_sem_approved: int
    curricular_units_1st_sem_grade: float
    curricular_units_1st_sem_without_evaluations: int

    # -----------------------------------------------------
    # Second semester performance
    # -----------------------------------------------------

    curricular_units_2nd_sem_credited: int
    curricular_units_2nd_sem_enrolled: int
    curricular_units_2nd_sem_evaluations: int
    curricular_units_2nd_sem_approved: int
    curricular_units_2nd_sem_grade: float
    curricular_units_2nd_sem_without_evaluations: int

    # -----------------------------------------------------
    # Economic indicators
    # -----------------------------------------------------

    unemployment_rate: float
    inflation_rate: float
    gdp: float


# =========================================================
# AI PREDICTION RESPONSE
# =========================================================

class PredictionResponse(BaseModel):

    prediction: int

    risk_percentage: float

    risk_level: str

    # Original ML model probability
    ml_probability: float

    # Student-specific contextual risk
    context_risk: float

    # Main factors contributing to risk
    risk_factors: list[str]


# =========================================================
# MICRO GOAL - CREATE
# =========================================================

class GoalCreate(BaseModel):

    student_id: int

    title: str

    description: str | None = None

    target: str | None = None

    target_value: float | None = None

    target_unit: str | None = None

    duration_days: int = 7

    priority: str = "Medium"


# =========================================================
# MICRO GOAL - RESPONSE
# =========================================================

class GoalResponse(BaseModel):

    id: int

    student_id: int

    title: str

    description: str | None = None

    target: str | None = None

    target_value: float | None = None

    target_unit: str | None = None

    duration_days: int

    priority: str

    progress: int

    completed: bool

    class Config:
        from_attributes = True


# =========================================================
# GOAL DAILY PROGRESS - CREATE
# =========================================================

class GoalProgressCreate(BaseModel):

    student_id: int

    value: float

    notes: str | None = None


# =========================================================
# GOAL DAILY PROGRESS - RESPONSE
# =========================================================

class GoalProgressResponse(BaseModel):

    id: int

    goal_id: int

    student_id: int

    progress_date: object

    value: float

    achieved: bool

    notes: str | None = None

    class Config:
        from_attributes = True