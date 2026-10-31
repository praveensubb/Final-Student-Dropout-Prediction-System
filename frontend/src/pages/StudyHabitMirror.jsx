import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import RefreshIcon from "@mui/icons-material/Refresh";

import "../styles/studyHabitMirror.css";


function StudyHabitMirror() {

    const navigate = useNavigate();


    // =====================================================
    // Form
    // =====================================================

    const [form, setForm] = useState({
        cgpa: "",
        attendance: "",
        backlogs: "",
        studyHours: "",
        assignmentCompletion: ""
    });


    // =====================================================
    // Result
    // =====================================================

    const [result, setResult] = useState(null);


    // =====================================================
    // Loading / Error
    // =====================================================

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [studentName, setStudentName] = useState("");


    // =====================================================
    // Load real student data
    // =====================================================

    const loadStudentData = async () => {

        setLoading(true);
        setError("");

        try {

            const studentId =
                localStorage.getItem("studentId");


            if (!studentId) {

                throw new Error(
                    "Student ID not found. Please login again."
                );
            }


            const response = await fetch(
                `http://127.0.0.1:8000/students/${studentId}`
            );


            if (!response.ok) {

                let message =
                    "Unable to load student information.";

                try {

                    const errorData =
                        await response.json();

                    message =
                        errorData.detail || message;

                } catch {
                    // Ignore invalid error response
                }

                throw new Error(message);
            }


            const student =
                await response.json();


            // -------------------------------------------------
            // Use REAL database values
            // -------------------------------------------------

            setStudentName(
                student.name || "Student"
            );


            setForm((previous) => ({

                ...previous,

                cgpa:
                    student.cgpa ?? "",

                attendance:
                    student.attendance ?? "",

                backlogs:
                    student.backlogs ?? "",

                studyHours:
                    student.study_hours ?? ""

            }));


        } catch (err) {

            console.error(
                "Study Habit data error:",
                err
            );

            setError(
                err.message ||
                "Unable to load student data."
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // Load on page opening
    // =====================================================

    useEffect(() => {

        loadStudentData();

    }, []);


    // =====================================================
    // Handle assignment input
    // =====================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setForm((previous) => ({

            ...previous,

            [name]: value

        }));

    };


    // =====================================================
    // Analyze
    // =====================================================

    const analyzeHabits = (e) => {

        e.preventDefault();


        const cgpa =
            Number(form.cgpa);

        const attendance =
            Number(form.attendance);

        const backlogs =
            Number(form.backlogs);

        const studyHours =
            Number(form.studyHours);

        const assignmentCompletion =
            Number(form.assignmentCompletion);


        // -------------------------------------------------
        // Validation
        // -------------------------------------------------

        if (
            form.cgpa === "" ||
            form.attendance === "" ||
            form.backlogs === "" ||
            form.studyHours === "" ||
            form.assignmentCompletion === ""
        ) {

            alert(
                "Please enter the assignment completion percentage."
            );

            return;
        }


        if (
            cgpa < 0 ||
            cgpa > 10
        ) {

            alert(
                "Invalid CGPA. It must be between 0 and 10."
            );

            return;
        }


        if (
            attendance < 0 ||
            attendance > 100
        ) {

            alert(
                "Invalid attendance percentage."
            );

            return;
        }


        if (backlogs < 0) {

            alert(
                "Backlogs cannot be negative."
            );

            return;
        }


        if (
            studyHours < 0 ||
            studyHours > 24
        ) {

            alert(
                "Study hours must be between 0 and 24."
            );

            return;
        }


        if (
            assignmentCompletion < 0 ||
            assignmentCompletion > 100
        ) {

            alert(
                "Assignment completion must be between 0 and 100."
            );

            return;
        }


        // =================================================
        // Habit score
        // =================================================

        let score = 0;

        const strengths = [];

        const improvements = [];


        // -------------------------------------------------
        // CGPA
        // -------------------------------------------------

        if (cgpa >= 8) {

            score += 25;

            strengths.push(
                "Strong academic performance"
            );

        } else if (cgpa >= 6.5) {

            score += 18;

            strengths.push(
                "Moderate academic performance"
            );

        } else {

            score += 8;

            improvements.push(
                "Work on improving your CGPA"
            );
        }


        // -------------------------------------------------
        // Attendance
        // -------------------------------------------------

        if (attendance >= 85) {

            score += 25;

            strengths.push(
                "Excellent attendance"
            );

        } else if (attendance >= 75) {

            score += 18;

            improvements.push(
                "Try to improve attendance above 85%"
            );

        } else {

            score += 8;

            improvements.push(
                "Attendance needs significant improvement"
            );
        }


        // -------------------------------------------------
        // Study hours
        // -------------------------------------------------

        if (studyHours >= 5) {

            score += 25;

            strengths.push(
                "Good daily study commitment"
            );

        } else if (studyHours >= 3) {

            score += 18;

            improvements.push(
                "Increase daily study time gradually"
            );

        } else {

            score += 8;

            improvements.push(
                "Your daily study hours are low"
            );
        }


        // -------------------------------------------------
        // Assignment completion
        // -------------------------------------------------

        if (assignmentCompletion >= 85) {

            score += 25;

            strengths.push(
                "Assignments are completed consistently"
            );

        } else if (assignmentCompletion >= 70) {

            score += 18;

            improvements.push(
                "Complete assignments more consistently"
            );

        } else {

            score += 8;

            improvements.push(
                "Improve assignment completion"
            );
        }


        // -------------------------------------------------
        // Backlogs
        // -------------------------------------------------

        if (backlogs === 0) {

            strengths.push(
                "No academic backlogs"
            );

        } else if (backlogs <= 2) {

            improvements.push(
                "Work on clearing your academic backlogs"
            );

        } else {

            improvements.push(
                "Multiple academic backlogs require immediate attention"
            );
        }


        // =================================================
        // Status
        // =================================================

        let status;


        if (score >= 85) {

            status = "EXCELLENT";

        } else if (score >= 70) {

            status = "GOOD";

        } else if (score >= 50) {

            status = "FAIR";

        } else {

            status = "NEEDS IMPROVEMENT";

        }


        // =================================================
        // Recommendation
        // =================================================

        let recommendation;


        if (status === "EXCELLENT") {

            recommendation =
                "Your current study pattern is strong. Maintain consistency and continue monitoring your academic progress.";

        } else if (status === "GOOD") {

            recommendation =
                "Your study habits are generally good. Focus on the identified weak areas to improve consistency.";

        } else if (status === "FAIR") {

            recommendation =
                "Your study habits need improvement. Prioritize attendance, study consistency and assignment completion.";

        } else {

            recommendation =
                "Your current study pattern requires attention. Start with small daily improvements rather than making unrealistic changes.";

        }


        // =================================================
        // Save result
        // =================================================

        setResult({

            cgpa,
            attendance,
            backlogs,
            studyHours,
            assignmentCompletion,

            score,
            status,

            strengths,
            improvements,

            recommendation

        });

    };


    // =====================================================
    // Reset analysis only
    // =====================================================

    const resetAnalysis = () => {

        setResult(null);

        setForm((previous) => ({

            ...previous,

            assignmentCompletion: ""

        }));

    };


    // =====================================================
    // Loading screen
    // =====================================================

    if (loading) {

        return (

            <div className="study-habit-page">

                <Sidebar />

                <main className="study-habit-main">

                    <div className="study-loading">

                        <h2>
                            Loading your study information...
                        </h2>

                        <p>
                            Getting your latest academic data
                            from the student database.
                        </p>

                    </div>

                </main>

            </div>

        );

    }


    // =====================================================
    // Error screen
    // =====================================================

    if (error) {

        return (

            <div className="study-habit-page">

                <Sidebar />

                <main className="study-habit-main">

                    <button
                        className="study-back-button"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        ← Dashboard
                    </button>


                    <div className="study-error">

                        <WarningAmberIcon />

                        <h2>
                            Unable to Load Student Data
                        </h2>

                        <p>
                            {error}
                        </p>


                        <button
                            onClick={loadStudentData}
                        >
                            <RefreshIcon />
                            Try Again
                        </button>

                    </div>

                </main>

            </div>

        );

    }


    // =====================================================
    // Main UI
    // =====================================================

    return (

        <div className="study-habit-page">

            <Sidebar />


            <main className="study-habit-main">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="study-habit-header">

                    <button
                        className="study-back-button"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        ← Dashboard
                    </button>


                    <h1>
                        Study Habit Mirror
                    </h1>


                    <p>
                        Welcome, {studentName}. Review your current
                        academic and study pattern.
                    </p>

                </div>


                {/* =================================================
                    DATABASE STATUS
                ================================================= */}

                <div className="data-source-card">

                    <div className="data-source-icon">
                        ✓
                    </div>

                    <div>

                        <strong>
                            Student data loaded from database
                        </strong>

                        <p>
                            CGPA, attendance, backlogs and study
                            hours are taken from your registered
                            student profile.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    CURRENT DATA
                ================================================= */}

                <section className="study-input-card">

                    <div className="input-card-header">

                        <h2>
                            Your Current Study Information
                        </h2>

                        <p>
                            The values below are automatically loaded
                            from your student profile.
                        </p>

                    </div>


                    <div className="study-input-form">


                        {/* CGPA */}

                        <div className="input-group">

                            <label>
                                CGPA
                            </label>

                            <input
                                type="number"
                                value={form.cgpa}
                                readOnly
                            />

                            <small>
                                From your student profile
                            </small>

                        </div>


                        {/* Attendance */}

                        <div className="input-group">

                            <label>
                                Attendance (%)
                            </label>

                            <input
                                type="number"
                                value={form.attendance}
                                readOnly
                            />

                            <small>
                                From your student profile
                            </small>

                        </div>


                        {/* Backlogs */}

                        <div className="input-group">

                            <label>
                                Academic Backlogs
                            </label>

                            <input
                                type="number"
                                value={form.backlogs}
                                readOnly
                            />

                            <small>
                                From your student profile
                            </small>

                        </div>


                        {/* Study Hours */}

                        <div className="input-group">

                            <label>
                                Study Hours / Day
                            </label>

                            <input
                                type="number"
                                value={form.studyHours}
                                readOnly
                            />

                            <small>
                                From your student profile
                            </small>

                        </div>


                        {/* Assignment */}

                        <div className="input-group">

                            <label>
                                Assignment Completion (%)
                            </label>

                            <input
                                type="number"
                                name="assignmentCompletion"
                                value={
                                    form.assignmentCompletion
                                }
                                onChange={handleChange}
                                placeholder="Enter current percentage"
                                min="0"
                                max="100"
                            />

                            <small>
                                This field is not currently stored
                                in your student profile.
                            </small>

                        </div>


                        {/* Buttons */}

                        <div className="study-form-buttons">

                            <button
                                type="button"
                                className="analyze-button"
                                onClick={analyzeHabits}
                            >
                                Analyze My Study Habits
                            </button>


                            <button
                                type="button"
                                className="refresh-data-button"
                                onClick={loadStudentData}
                            >
                                <RefreshIcon />
                                Refresh Data
                            </button>


                            {result && (

                                <button
                                    type="button"
                                    className="reset-button"
                                    onClick={resetAnalysis}
                                >
                                    Reset Analysis
                                </button>

                            )}

                        </div>

                    </div>

                </section>


                {/* =================================================
                    RESULT
                ================================================= */}

                {result && (

                    <>

                        {/* SCORE */}

                        <section className="habit-score-card">

                            <div>

                                <span className="section-label">
                                    OVERALL STUDY HABIT SCORE
                                </span>

                                <h2>
                                    {result.status}
                                </h2>

                                <p>
                                    {result.recommendation}
                                </p>

                            </div>


                            <div className="habit-score">

                                <strong>
                                    {result.score}
                                </strong>

                                <span>
                                    / 100
                                </span>

                            </div>

                        </section>


                        {/* METRICS */}

                        <section className="habit-metrics">


                            {/* Study Hours */}

                            <div className="habit-metric-card">

                                <div className="metric-icon">
                                    <AccessTimeIcon />
                                </div>

                                <h3>
                                    Study Hours
                                </h3>

                                <strong>
                                    {result.studyHours} hrs/day
                                </strong>

                                <div className="progress-track">

                                    <div
                                        className="progress-fill"
                                        style={{
                                            width:
                                                `${Math.min(
                                                    (result.studyHours / 8) * 100,
                                                    100
                                                )}%`
                                        }}
                                    />

                                </div>

                                <p>
                                    Recommended target: 5–8 hours/day
                                </p>

                            </div>


                            {/* Attendance */}

                            <div className="habit-metric-card">

                                <div className="metric-icon">
                                    <SchoolIcon />
                                </div>

                                <h3>
                                    Attendance
                                </h3>

                                <strong>
                                    {result.attendance}%
                                </strong>

                                <div className="progress-track">

                                    <div
                                        className="progress-fill"
                                        style={{
                                            width:
                                                `${result.attendance}%`
                                        }}
                                    />

                                </div>

                                <p>
                                    Target: 85%+
                                </p>

                            </div>


                            {/* Assignment */}

                            <div className="habit-metric-card">

                                <div className="metric-icon">
                                    <AssignmentTurnedInIcon />
                                </div>

                                <h3>
                                    Assignment Completion
                                </h3>

                                <strong>
                                    {result.assignmentCompletion}%
                                </strong>

                                <div className="progress-track">

                                    <div
                                        className="progress-fill"
                                        style={{
                                            width:
                                                `${result.assignmentCompletion}%`
                                        }}
                                    />

                                </div>

                                <p>
                                    Target: 85%+
                                </p>

                            </div>


                            {/* Backlogs */}

                            <div className="habit-metric-card">

                                <div className="metric-icon">
                                    <WarningAmberIcon />
                                </div>

                                <h3>
                                    Academic Backlogs
                                </h3>

                                <strong>
                                    {result.backlogs}
                                </strong>

                                <div className="backlog-status">

                                    {result.backlogs === 0
                                        ? "No active backlogs"
                                        : "Needs attention"
                                    }

                                </div>

                            </div>

                        </section>


                        {/* ANALYSIS */}

                        <section className="habit-analysis-grid">


                            {/* Strengths */}

                            <div className="analysis-card">

                                <div className="analysis-title">

                                    <TrendingUpIcon />

                                    <h2>
                                        Your Strengths
                                    </h2>

                                </div>


                                {result.strengths.length > 0 ? (

                                    <ul>

                                        {result.strengths.map(
                                            (item, index) => (

                                                <li key={index}>
                                                    ✓ {item}
                                                </li>

                                            )
                                        )}

                                    </ul>

                                ) : (

                                    <p>
                                        No strong areas detected yet.
                                    </p>

                                )}

                            </div>


                            {/* Improvements */}

                            <div className="analysis-card">

                                <div className="analysis-title">

                                    <WarningAmberIcon />

                                    <h2>
                                        Areas to Improve
                                    </h2>

                                </div>


                                {result.improvements.length > 0 ? (

                                    <ul>

                                        {result.improvements.map(
                                            (item, index) => (

                                                <li key={index}>
                                                    ⚠ {item}
                                                </li>

                                            )
                                        )}

                                    </ul>

                                ) : (

                                    <p>
                                        Your current habits are
                                        performing well.
                                    </p>

                                )}

                            </div>

                        </section>


                        {/* RECOMMENDATION */}

                        <section className="habit-recommendation">

                            <h2>
                                💡 Recommended Study Pattern
                            </h2>


                            <div className="recommendation-grid">

                                <div>

                                    <strong>
                                        1
                                    </strong>

                                    <p>
                                        Study consistently every day
                                        instead of relying on
                                        last-minute preparation.
                                    </p>

                                </div>


                                <div>

                                    <strong>
                                        2
                                    </strong>

                                    <p>
                                        Keep attendance above 85%
                                        whenever possible.
                                    </p>

                                </div>


                                <div>

                                    <strong>
                                        3
                                    </strong>

                                    <p>
                                        Complete assignments before
                                        their deadlines.
                                    </p>

                                </div>


                                <div>

                                    <strong>
                                        4
                                    </strong>

                                    <p>
                                        Review your progress every
                                        week and adjust your study
                                        plan.
                                    </p>

                                </div>

                            </div>

                        </section>

                    </>

                )}

            </main>

        </div>

    );
}


export default StudyHabitMirror;