import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import SchoolIcon from "@mui/icons-material/School";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import FlagIcon from "@mui/icons-material/Flag";
import AddTaskIcon from "@mui/icons-material/AddTask";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import "../styles/microGoalEngine.css";

const API_URL = "http://127.0.0.1:8000";

function MicroGoalEngine() {
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [goals, setGoals] = useState([]);

    const [assignmentCompletion, setAssignmentCompletion] =
        useState("");

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState("");

    const [progressValues, setProgressValues] = useState({});
    const [progressNotes, setProgressNotes] = useState({});

    const [selectedGoal, setSelectedGoal] = useState(null);
    const [savingGoal, setSavingGoal] = useState(null);

    // =====================================================
    // LOAD STUDENT
    // =====================================================

    const loadStudent = async () => {
        setLoading(true);
        setError("");

        try {
            const studentId = localStorage.getItem("studentId");

            if (!studentId) {
                throw new Error(
                    "Student session not found. Please login again."
                );
            }

            const response = await fetch(
                `${API_URL}/students/${studentId}`
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));

                throw new Error(
                    data.detail ||
                    "Unable to load student information."
                );
            }

            const data = await response.json();

            setStudent(data);

            await loadGoals(studentId);
        } catch (err) {
            console.error(err);

            setError(
                err.message ||
                "Unable to load student information."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // LOAD GOALS
    // =====================================================

    const loadGoals = async (studentId) => {
        try {
            const response = await fetch(
                `${API_URL}/goals/student/${studentId}`
            );

            if (!response.ok) {
                throw new Error("Unable to load saved goals.");
            }

            const data = await response.json();

            setGoals(data);
        } catch (err) {
            console.error("Load goals:", err);
        }
    };

    useEffect(() => {
        loadStudent();
    }, []);

    // =====================================================
    // GENERATE GOALS
    // =====================================================

    const generateGoals = async (e) => {
        e.preventDefault();

        if (!student) {
            alert("Student information is not available.");
            return;
        }

        if (
            assignmentCompletion === "" ||
            Number(assignmentCompletion) < 0 ||
            Number(assignmentCompletion) > 100
        ) {
            alert(
                "Enter assignment completion between 0 and 100."
            );
            return;
        }

        const studentId = Number(student.id);
        const cgpa = Number(student.cgpa || 0);
        const attendance = Number(student.attendance || 0);
        const backlogs = Number(student.backlogs || 0);
        const studyHours = Number(student.study_hours || 0);
        const assignments = Number(assignmentCompletion);

        const newGoals = [];

        // =================================================
        // STUDY GOAL
        // =================================================

        if (studyHours < 3) {
            newGoals.push({
                title: "Build Study Consistency",
                description:
                    "Your current study time is low. Build a consistent daily study routine.",
                target: "Study at least 3 hours/day",
                target_value: 3,
                target_unit: "hours/day",
                duration_days: 7,
                priority: "High"
            });
        } else if (studyHours < 5) {
            const target = Math.min(
                Math.ceil(studyHours + 1),
                6
            );

            newGoals.push({
                title: "Increase Study Time",
                description:
                    "Gradually increase your daily study time without creating an unrealistic schedule.",
                target: `Study at least ${target} hours/day`,
                target_value: target,
                target_unit: "hours/day",
                duration_days: 7,
                priority: "Medium"
            });
        } else {
            newGoals.push({
                title: "Maintain Study Consistency",
                description:
                    "Your study hours are strong. Focus on maintaining consistency.",
                target: "Maintain 5+ hours/day",
                target_value: 5,
                target_unit: "hours/day",
                duration_days: 7,
                priority: "Low"
            });
        }

        // =================================================
        // ATTENDANCE
        // =================================================

        if (attendance < 75) {
            newGoals.push({
                title: "Improve Attendance",
                description:
                    "Your attendance is below the recommended level. Avoid unnecessary absences.",
                target: "Attend every scheduled class",
                target_value: 1,
                target_unit: "attendance day",
                duration_days: 5,
                priority: "High"
            });
        } else if (attendance < 85) {
            newGoals.push({
                title: "Reach 85% Attendance",
                description:
                    "Improve attendance gradually by attending classes consistently.",
                target: "Attend every scheduled class",
                target_value: 1,
                target_unit: "attendance day",
                duration_days: 7,
                priority: "Medium"
            });
        } else {
            newGoals.push({
                title: "Maintain Attendance",
                description:
                    "Your attendance is healthy. Maintain the same consistency.",
                target: "Maintain healthy attendance",
                target_value: 1,
                target_unit: "attendance day",
                duration_days: 7,
                priority: "Low"
            });
        }

        // =================================================
        // BACKLOG
        // =================================================

        if (backlogs >= 3) {
            newGoals.push({
                title: "Priority Backlog Reduction",
                description:
                    "You have multiple academic backlogs. Focus on one backlog subject at a time.",
                target: "Study one backlog subject every day",
                target_value: 1,
                target_unit: "subject/day",
                duration_days: 7,
                priority: "High"
            });
        } else if (backlogs > 0) {
            newGoals.push({
                title: "Clear Academic Backlogs",
                description:
                    "Dedicate focused study time to clearing your remaining backlog subjects.",
                target:
                    "Complete revision for one backlog subject",
                target_value: 1,
                target_unit: "subject/day",
                duration_days: 7,
                priority: "Medium"
            });
        } else {
            newGoals.push({
                title: "Maintain Zero Backlogs",
                description:
                    "You currently have no backlogs. Keep up with your coursework.",
                target: "Maintain 0 backlogs",
                target_value: 1,
                target_unit: "daily study session",
                duration_days: 7,
                priority: "Low"
            });
        }

        // =================================================
        // ASSIGNMENTS
        // =================================================

        if (assignments < 60) {
            newGoals.push({
                title: "Complete Pending Assignments",
                description:
                    "Your assignment completion is low. Prioritize overdue and upcoming submissions.",
                target: "Complete 2 pending assignments",
                target_value: 2,
                target_unit: "assignments",
                duration_days: 3,
                priority: "High"
            });
        } else if (assignments < 85) {
            newGoals.push({
                title: "Improve Assignment Consistency",
                description:
                    "Work toward submitting assignments before their deadlines.",
                target: "Complete at least 1 assignment",
                target_value: 1,
                target_unit: "assignment/day",
                duration_days: 7,
                priority: "Medium"
            });
        } else {
            newGoals.push({
                title: "Maintain Assignment Performance",
                description:
                    "Your assignment completion is strong. Continue submitting work on time.",
                target: "Maintain assignment consistency",
                target_value: 1,
                target_unit: "assignment/day",
                duration_days: 7,
                priority: "Low"
            });
        }

        // =================================================
        // CGPA
        // =================================================

        if (cgpa < 6) {
            newGoals.push({
                title: "Strengthen Academic Performance",
                description:
                    "Your CGPA indicates that additional focused academic preparation is needed.",
                target: "45 minutes focused revision daily",
                target_value: 45,
                target_unit: "minutes/day",
                duration_days: 7,
                priority: "High"
            });
        } else if (cgpa < 7.5) {
            newGoals.push({
                title: "Improve Academic Performance",
                description:
                    "Strengthen difficult topics through regular revision and practice.",
                target: "30 minutes extra revision daily",
                target_value: 30,
                target_unit: "minutes/day",
                duration_days: 7,
                priority: "Medium"
            });
        } else {
            newGoals.push({
                title: "Maintain Academic Performance",
                description:
                    "Your CGPA is currently strong. Maintain regular revision.",
                target: "30 minutes revision daily",
                target_value: 30,
                target_unit: "minutes/day",
                duration_days: 7,
                priority: "Low"
            });
        }

        // =================================================
        // SAVE
        // =================================================

        setGenerating(true);
        setError("");

        try {
            const savedGoals = [];

            for (const goal of newGoals) {
                const response = await fetch(
                    `${API_URL}/goals`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            student_id: studentId,
                            title: goal.title,
                            description: goal.description,
                            target: goal.target,
                            target_value: goal.target_value,
                            target_unit: goal.target_unit,
                            duration_days: goal.duration_days,
                            priority: goal.priority
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail ||
                        "Unable to save goal."
                    );
                }

                savedGoals.push(data);
            }

            setGoals(savedGoals);
            setProgressValues({});
            setProgressNotes({});

            window.scrollTo({
                top: 500,
                behavior: "smooth"
            });
        } catch (err) {
            console.error(err);

            setError(
                err.message ||
                "Unable to create goals."
            );
        } finally {
            setGenerating(false);
        }
    };

    // =====================================================
    // PROGRESS
    // =====================================================

    const saveProgress = async (goal) => {
        const studentId = Number(student?.id);

        const value = Number(
            progressValues[goal.id]
        );

        if (!studentId) {
            alert("Student session expired. Please login again.");
            return;
        }

        if (
            progressValues[goal.id] === undefined ||
            progressValues[goal.id] === ""
        ) {
            alert("Enter today's achievement first.");
            return;
        }

        if (
            Number.isNaN(value) ||
            value < 0
        ) {
            alert("Enter a valid achievement value.");
            return;
        }

        setSavingGoal(goal.id);

        try {
            const response = await fetch(
                `${API_URL}/goals/${goal.id}/progress`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        student_id: studentId,
                        value: value,
                        notes:
                            progressNotes[goal.id] ||
                            ""
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    "Unable to save progress."
                );
            }

            setSelectedGoal(null);

            await loadGoals(studentId);

            setProgressValues((previous) => {
                const copy = { ...previous };
                delete copy[goal.id];
                return copy;
            });

            setProgressNotes((previous) => {
                const copy = { ...previous };
                delete copy[goal.id];
                return copy;
            });

        } catch (err) {
            console.error(err);

            alert(
                err.message ||
                "Unable to save progress."
            );
        } finally {
            setSavingGoal(null);
        }
    };

    // =====================================================
    // RESET
    // =====================================================

    const resetGoals = () => {
        setGoals([]);
        setAssignmentCompletion("");
        setProgressValues({});
        setProgressNotes({});
    };

    // =====================================================
    // STATISTICS
    // =====================================================

    const overallProgress = useMemo(() => {
        if (!goals.length) return 0;

        return Math.round(
            goals.reduce(
                (total, goal) =>
                    total +
                    Number(goal.progress || 0),
                0
            ) / goals.length
        );
    }, [goals]);

    const completedGoals = goals.filter(
        (goal) => goal.completed
    ).length;

    const highPriorityGoals = goals.filter(
        (goal) =>
            goal.priority?.toLowerCase() === "high"
    ).length;

    // =====================================================
    // GOAL ICON
    // =====================================================

    const getGoalIcon = (title = "") => {
        const value = title.toLowerCase();

        if (
            value.includes("attendance")
        ) {
            return <EventAvailableIcon />;
        }

        if (
            value.includes("assignment")
        ) {
            return <AssignmentTurnedInIcon />;
        }

        if (
            value.includes("study")
        ) {
            return <AccessTimeIcon />;
        }

        if (
            value.includes("backlog")
        ) {
            return <WarningAmberIcon />;
        }

        return <SchoolIcon />;
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="micro-goal-page">
                <Sidebar />

                <main className="micro-goal-main">
                    <div className="goal-loading">
                        <RefreshIcon className="loading-icon" />

                        <h2>
                            Preparing your academic plan
                        </h2>

                        <p>
                            Loading your latest student data...
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    // =====================================================
    // ERROR
    // =====================================================

    if (error && !student) {
        return (
            <div className="micro-goal-page">
                <Sidebar />

                <main className="micro-goal-main">
                    <div className="goal-error-card">
                        <WarningAmberIcon />

                        <h2>
                            Unable to load your profile
                        </h2>

                        <p>{error}</p>

                        <button
                            onClick={() =>
                                navigate("/dashboard")
                            }
                        >
                            <ArrowBackIcon />
                            Back to Dashboard
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // =====================================================
    // MAIN UI
    // =====================================================

    return (
        <div className="micro-goal-page">

            <Sidebar />

            <main className="micro-goal-main">

                {/* HEADER */}

                <header className="goal-page-header">

                    <div>
                        <button
                            className="back-dashboard-button"
                            onClick={() =>
                                navigate("/dashboard")
                            }
                        >
                            <ArrowBackIcon />
                            Dashboard
                        </button>

                        <div className="engine-title">
                            <span>
                                <TrackChangesIcon />
                                MICRO GOAL ENGINE
                            </span>

                            <h1>
                                Your Academic
                                <strong>
                                    Improvement Plan
                                </strong>
                            </h1>

                            <p>
                                Small daily actions.
                                Measurable progress.
                                Better academic outcomes.
                            </p>
                        </div>
                    </div>

                    <button
                        className="refresh-button"
                        onClick={loadStudent}
                    >
                        <RefreshIcon />
                        Refresh
                    </button>

                </header>

                {/* STUDENT HERO */}

                <section className="student-hero">

                    <div className="student-avatar">
                        {(student?.name || "S")
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                    <div className="student-hero-text">
                        <span>YOUR PERSONAL COACHING PLAN</span>

                        <h2>
                            Hello, {student?.name || "Student"} 👋
                        </h2>

                        <p>
                            Your goals are generated from
                            your current academic behaviour.
                            Focus on consistency rather than
                            trying to change everything at once.
                        </p>
                    </div>

                    <div className="hero-badge">
                        <TrendingUpIcon />
                        <div>
                            <strong>
                                {overallProgress}%
                            </strong>
                            <span>
                                Overall Progress
                            </span>
                        </div>
                    </div>

                </section>

                {/* STUDENT SNAPSHOT */}

                <section className="snapshot-grid">

                    <div className="snapshot-card">
                        <div className="snapshot-icon blue">
                            <SchoolIcon />
                        </div>

                        <div>
                            <span>CGPA</span>
                            <strong>
                                {Number(student?.cgpa || 0).toFixed(2)}
                            </strong>
                        </div>
                    </div>

                    <div className="snapshot-card">
                        <div className="snapshot-icon green">
                            <EventAvailableIcon />
                        </div>

                        <div>
                            <span>ATTENDANCE</span>
                            <strong>
                                {Number(
                                    student?.attendance || 0
                                ).toFixed(1)}
                                %
                            </strong>
                        </div>
                    </div>

                    <div className="snapshot-card">
                        <div className="snapshot-icon orange">
                            <AccessTimeIcon />
                        </div>

                        <div>
                            <span>STUDY / DAY</span>
                            <strong>
                                {Number(
                                    student?.study_hours || 0
                                ).toFixed(1)}
                                h
                            </strong>
                        </div>
                    </div>

                    <div className="snapshot-card">
                        <div className="snapshot-icon red">
                            <WarningAmberIcon />
                        </div>

                        <div>
                            <span>BACKLOGS</span>
                            <strong>
                                {student?.backlogs || 0}
                            </strong>
                        </div>
                    </div>

                </section>

                {/* AI COACH */}

                <section className="coach-panel">

                    <div className="coach-symbol">
                        <TrackChangesIcon />
                    </div>

                    <div className="coach-content">
                        <span>AI ACADEMIC COACH</span>

                        <h2>
                            {overallProgress >= 80
                                ? "Excellent consistency. Keep pushing."
                                : overallProgress >= 40
                                    ? "You're progressing. Stay consistent."
                                    : goals.length
                                        ? "Start with one goal today."
                                        : "Let's build your improvement plan."
                            }
                        </h2>

                        <p>
                            {goals.length
                                ? `You currently have ${goals.length} active goals. Complete today's small actions to improve your overall academic performance.`
                                : "Enter your assignment completion below and generate a personalized weekly action plan."
                            }
                        </p>
                    </div>

                </section>

                {/* GENERATOR */}

                <section className="generator-section">

                    <div className="section-heading">
                        <div className="section-heading-icon">
                            <AddTaskIcon />
                        </div>

                        <div>
                            <span>STEP 01</span>
                            <h2>
                                Build Your Weekly Plan
                            </h2>
                            <p>
                                Tell us your current assignment
                                completion and we'll generate
                                targeted goals.
                            </p>
                        </div>
                    </div>

                    <form
                        className="generator-form"
                        onSubmit={generateGoals}
                    >

                        <div className="assignment-input">

                            <label>
                                Assignment Completion
                            </label>

                            <div className="input-with-unit">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={assignmentCompletion}
                                    onChange={(e) =>
                                        setAssignmentCompletion(
                                            e.target.value
                                        )
                                    }
                                    placeholder="75"
                                    required
                                />

                                <span>%</span>
                            </div>

                            <small>
                                Current percentage of assignments
                                completed.
                            </small>

                        </div>

                        <button
                            type="submit"
                            className="generate-button"
                            disabled={generating}
                        >
                            <TrackChangesIcon />

                            {generating
                                ? "Generating Plan..."
                                : "Generate My Goals"
                            }
                        </button>

                    </form>

                    {error && (
                        <div className="inline-error">
                            <WarningAmberIcon />
                            {error}
                        </div>
                    )}

                </section>

                {/* PROGRESS OVERVIEW */}

                <section className="progress-overview">

                    <div className="progress-main-card">

                        <div className="progress-circle">
                            <div>
                                <strong>
                                    {overallProgress}%
                                </strong>

                                <span>
                                    Complete
                                </span>
                            </div>
                        </div>

                        <div className="progress-info">
                            <span>WEEKLY PERFORMANCE</span>

                            <h2>
                                Your Goal Progress
                            </h2>

                            <p>
                                {completedGoals} of{" "}
                                {goals.length} goals completed.
                            </p>

                            <div className="overall-progress-bar">
                                <div
                                    style={{
                                        width:
                                            `${overallProgress}%`
                                    }}
                                />
                            </div>
                        </div>

                    </div>

                    <div className="progress-mini-grid">

                        <div>
                            <strong>
                                {goals.length}
                            </strong>
                            <span>Total Goals</span>
                        </div>

                        <div>
                            <strong>
                                {completedGoals}
                            </strong>
                            <span>Completed</span>
                        </div>

                        <div>
                            <strong>
                                {highPriorityGoals}
                            </strong>
                            <span>High Priority</span>
                        </div>

                    </div>

                </section>

                {/* GOALS */}

                <section className="goals-section">

                    <div className="goals-heading">

                        <div>
                            <span>STEP 02</span>

                            <h2>
                                Your Action Plan
                            </h2>

                            <p>
                                Complete the small actions
                                consistently to improve.
                            </p>
                        </div>

                        {goals.length > 0 && (
                            <button
                                className="reset-button"
                                onClick={resetGoals}
                            >
                                Reset Plan
                            </button>
                        )}

                    </div>

                    {goals.length === 0 ? (

                        <div className="empty-goals">

                            <div className="empty-icon">
                                <FlagIcon />
                            </div>

                            <h2>
                                No goals generated yet
                            </h2>

                            <p>
                                Enter your assignment completion
                                above and create your first
                                personalized academic plan.
                            </p>

                        </div>

                    ) : (

                        <div className="goals-grid">

                            {goals.map((goal, index) => {

                                const progress =
                                    Number(
                                        goal.progress || 0
                                    );

                                const priority =
                                    (
                                        goal.priority ||
                                        "Medium"
                                    ).toLowerCase();

                                return (
                                    <article
                                        className={`goal-card ${goal.completed
                                            ? "goal-card-completed"
                                            : ""
                                            }`}
                                        key={goal.id}
                                    >

                                        <div className="goal-card-top">

                                            <div className="goal-number">
                                                {String(
                                                    index + 1
                                                ).padStart(2, "0")}
                                            </div>

                                            <div
                                                className={`goal-icon ${priority}`}
                                            >
                                                {getGoalIcon(
                                                    goal.title
                                                )}
                                            </div>

                                            <span
                                                className={`priority-badge ${priority}`}
                                            >
                                                {goal.priority ||
                                                    "Medium"}
                                            </span>

                                        </div>

                                        <h3>
                                            {goal.title}
                                        </h3>

                                        <p className="goal-description">
                                            {goal.description}
                                        </p>

                                        <div className="goal-target-box">

                                            <span>
                                                DAILY TARGET
                                            </span>

                                            <strong>
                                                {goal.target}
                                            </strong>

                                        </div>

                                        <div className="goal-meta">

                                            <div>
                                                <AccessTimeIcon />
                                                {goal.duration_days ||
                                                    7}{" "}
                                                days
                                            </div>

                                            <div>
                                                <TrendingUpIcon />
                                                {progress}% complete
                                            </div>

                                        </div>

                                        <div className="goal-progress">

                                            <div className="goal-progress-header">
                                                <span>
                                                    Progress
                                                </span>

                                                <strong>
                                                    {progress}%
                                                </strong>
                                            </div>

                                            <div className="goal-progress-track">
                                                <div
                                                    style={{
                                                        width:
                                                            `${progress}%`
                                                    }}
                                                />
                                            </div>

                                        </div>

                                        {goal.completed ? (

                                            <div className="completed-banner">
                                                <CheckCircleIcon />

                                                <div>
                                                    <strong>
                                                        Goal Completed
                                                    </strong>

                                                    <span>
                                                        Great work. Keep
                                                        the habit going.
                                                    </span>
                                                </div>
                                            </div>

                                        ) : (

                                            <button
                                                className="record-progress-button"
                                                onClick={() =>
                                                    setSelectedGoal(
                                                        goal
                                                    )
                                                }
                                            >
                                                <AddTaskIcon />
                                                Record Today's Progress
                                            </button>

                                        )}

                                    </article>
                                );
                            })}

                        </div>
                    )}

                </section>

                {/* ALL COMPLETE */}

                {goals.length > 0 &&
                    completedGoals === goals.length && (
                        <section className="completion-banner">

                            <div>
                                <CheckCircleIcon />
                            </div>

                            <div>
                                <span>
                                    WEEKLY CYCLE COMPLETE
                                </span>

                                <h2>
                                    You completed every goal!
                                </h2>

                                <p>
                                    Refresh your academic data
                                    and generate your next
                                    improvement cycle.
                                </p>
                            </div>

                        </section>
                    )}

            </main>

            {/* PROGRESS MODAL */}

            {selectedGoal && (
                <div
                    className="goal-modal-overlay"
                    onClick={(e) => {
                        if (
                            e.target.className ===
                            "goal-modal-overlay"
                        ) {
                            setSelectedGoal(null);
                        }
                    }}
                >

                    <div className="goal-modal">

                        <button
                            className="modal-close"
                            onClick={() =>
                                setSelectedGoal(null)
                            }
                        >
                            <CloseIcon />
                        </button>

                        <div className="modal-icon">
                            {getGoalIcon(
                                selectedGoal.title
                            )}
                        </div>

                        <span className="modal-label">
                            DAILY PROGRESS
                        </span>

                        <h2>
                            {selectedGoal.title}
                        </h2>

                        <p>
                            Target:{" "}
                            <strong>
                                {selectedGoal.target}
                            </strong>
                        </p>

                        <label>
                            Today's Achievement
                        </label>

                        <div className="modal-input">
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={
                                    progressValues[
                                        selectedGoal.id
                                    ] || ""
                                }
                                onChange={(e) =>
                                    setProgressValues(
                                        (previous) => ({
                                            ...previous,
                                            [selectedGoal.id]:
                                                e.target.value
                                        })
                                    )
                                }
                                placeholder={
                                    selectedGoal.target_value ||
                                    "Enter value"
                                }
                            />

                            <span>
                                {selectedGoal.target_unit ||
                                    "value"}
                            </span>
                        </div>

                        <label>
                            Notes
                        </label>

                        <textarea
                            value={
                                progressNotes[
                                    selectedGoal.id
                                ] || ""
                            }
                            onChange={(e) =>
                                setProgressNotes(
                                    (previous) => ({
                                        ...previous,
                                        [selectedGoal.id]:
                                            e.target.value
                                    })
                                )
                            }
                            placeholder="What did you complete today?"
                            rows="4"
                        />

                        <button
                            className="modal-save-button"
                            disabled={
                                savingGoal ===
                                selectedGoal.id
                            }
                            onClick={() =>
                                saveProgress(
                                    selectedGoal
                                )
                            }
                        >
                            <CheckCircleIcon />

                            {savingGoal ===
                                selectedGoal.id
                                ? "Saving..."
                                : "Save Today's Progress"
                            }
                        </button>

                    </div>

                </div>
            )}

        </div>
    );
}

export default MicroGoalEngine;