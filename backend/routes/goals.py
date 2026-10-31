from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Goal, GoalProgress, Student
from schemas import (
    GoalCreate,
    GoalResponse,
    GoalProgressCreate,
    GoalProgressResponse
)


router = APIRouter(
    prefix="/goals",
    tags=["Micro Goal Engine"]
)


# =========================================================
# CREATE GOAL
# =========================================================

@router.post(
    "",
    response_model=GoalResponse
)
def create_goal(
    goal: GoalCreate,
    db: Session = Depends(get_db)
):

    student = db.query(Student).filter(
        Student.id == goal.student_id
    ).first()

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    new_goal = Goal(
        student_id=goal.student_id,
        title=goal.title,
        description=goal.description,
        target=goal.target,
        target_value=goal.target_value,
        target_unit=goal.target_unit,
        duration_days=goal.duration_days,
        priority=goal.priority,
        progress=0,
        completed=False
    )

    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)

    return new_goal


# =========================================================
# GET STUDENT GOALS
# =========================================================

@router.get(
    "/student/{student_id}",
    response_model=list[GoalResponse]
)
def get_student_goals(
    student_id: int,
    db: Session = Depends(get_db)
):

    student = db.query(Student).filter(
        Student.id == student_id
    ).first()

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    goals = db.query(Goal).filter(
        Goal.student_id == student_id
    ).order_by(
        Goal.id.desc()
    ).all()

    return goals


# =========================================================
# GET ONE GOAL
# =========================================================

@router.get(
    "/{goal_id}",
    response_model=GoalResponse
)
def get_goal(
    goal_id: int,
    db: Session = Depends(get_db)
):

    goal = db.query(Goal).filter(
        Goal.id == goal_id
    ).first()

    if goal is None:
        raise HTTPException(
            status_code=404,
            detail="Goal not found"
        )

    return goal


# =========================================================
# RECORD DAILY PROGRESS
# =========================================================

@router.post(
    "/{goal_id}/progress",
    response_model=GoalProgressResponse
)
def record_goal_progress(
    goal_id: int,
    progress_data: GoalProgressCreate,
    db: Session = Depends(get_db)
):

    goal = db.query(Goal).filter(
        Goal.id == goal_id
    ).first()

    if goal is None:
        raise HTTPException(
            status_code=404,
            detail="Goal not found"
        )


    # -----------------------------------------------------
    # Make sure the progress belongs to the same student
    # -----------------------------------------------------

    if progress_data.student_id != goal.student_id:

        raise HTTPException(
            status_code=403,
            detail="This goal does not belong to this student"
        )


    # -----------------------------------------------------
    # Check student exists
    # -----------------------------------------------------

    student = db.query(Student).filter(
        Student.id == progress_data.student_id
    ).first()

    if student is None:

        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )


    # -----------------------------------------------------
    # Validate value
    # -----------------------------------------------------

    if progress_data.value < 0:

        raise HTTPException(
            status_code=400,
            detail="Progress value cannot be negative"
        )


    # -----------------------------------------------------
    # Determine whether today's target was achieved
    # -----------------------------------------------------

    achieved = False

    if goal.target_value is not None:

        achieved = (
            float(progress_data.value)
            >= float(goal.target_value)
        )


    # -----------------------------------------------------
    # Create progress record
    # -----------------------------------------------------

    progress = GoalProgress(
        goal_id=goal.id,
        student_id=progress_data.student_id,
        value=progress_data.value,
        achieved=achieved,
        notes=progress_data.notes
    )

    db.add(progress)

    db.commit()
    db.refresh(progress)


    # -----------------------------------------------------
    # Recalculate overall goal progress
    #
    # Progress is based on successful daily targets.
    # -----------------------------------------------------

    total_days = goal.duration_days or 7

    achieved_days = db.query(
        GoalProgress
    ).filter(
        GoalProgress.goal_id == goal.id,
        GoalProgress.achieved == True
    ).count()


    calculated_progress = round(
        min(
            (achieved_days / total_days) * 100,
            100
        )
    )


    goal.progress = calculated_progress


    # -----------------------------------------------------
    # Complete only when required days are achieved
    # -----------------------------------------------------

    if achieved_days >= total_days:

        goal.progress = 100
        goal.completed = True

    else:

        goal.completed = False


    db.commit()

    return progress


# =========================================================
# GET GOAL PROGRESS HISTORY
# =========================================================

@router.get(
    "/{goal_id}/progress",
    response_model=list[GoalProgressResponse]
)
def get_goal_progress(
    goal_id: int,
    db: Session = Depends(get_db)
):

    goal = db.query(Goal).filter(
        Goal.id == goal_id
    ).first()

    if goal is None:

        raise HTTPException(
            status_code=404,
            detail="Goal not found"
        )


    progress = db.query(
        GoalProgress
    ).filter(
        GoalProgress.goal_id == goal_id
    ).order_by(
        GoalProgress.id.asc()
    ).all()


    return progress