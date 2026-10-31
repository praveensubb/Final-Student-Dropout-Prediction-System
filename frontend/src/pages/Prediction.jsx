import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/prediction.css";

function Prediction() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const [form, setForm] = useState({

        // =================================================
        // Project-specific student factors
        // =================================================

        cgpa: 6.5,
        attendance: 75,
        backlogs: 0,
        studyHours: 4,
        financialDifficulty: 0,
        assignmentCompletion: 80,

        // =================================================
        // Academic information
        // =================================================

        previousQualificationGrade: 122,
        admissionGrade: 125,
        age: 20,

        // =================================================
        // First semester
        // =================================================

        sem1Enrolled: 6,
        sem1Evaluations: 6,
        sem1Approved: 5,
        sem1Grade: 12,

        // =================================================
        // Second semester
        // =================================================

        sem2Enrolled: 6,
        sem2Evaluations: 6,
        sem2Approved: 5,
        sem2Grade: 12,

        // =================================================
        // Financial
        // =================================================

        debtor: 0,
        tuitionPaid: 1,
        scholarship: 0,

        // =================================================
        // Personal
        // =================================================

        displaced: 0,
        specialNeeds: 0,
        international: 0,
        gender: 1,
        maritalStatus: 1,

        // =================================================
        // Admission
        // =================================================

        applicationMode: 17,
        applicationOrder: 1,
        course: 171,
        previousQualification: 1,
        nationality: 1,

        // =================================================
        // Family background
        // =================================================

        motherQualification: 1,
        fatherQualification: 1,
        motherOccupation: 5,
        fatherOccupation: 9,

        // =================================================
        // Economic environment
        // =================================================

        unemploymentRate: 10.8,
        inflationRate: 1.4,
        gdp: 1.74
    });


    // =====================================================
    // Handle input changes
    // =====================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previousForm) => ({
            ...previousForm,
            [name]: value
        }));
    };


    // =====================================================
    // Prediction
    // =====================================================

    const predictDropout = async () => {

        setLoading(true);
        setResult(null);
        setError("");

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/prediction/predict",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        // =================================
                        // Project-specific factors
                        // =================================

                        cgpa: Number(form.cgpa),

                        attendance: Number(
                            form.attendance
                        ),

                        backlogs: Number(
                            form.backlogs
                        ),

                        study_hours: Number(
                            form.studyHours
                        ),

                        financial_difficulty: Number(
                            form.financialDifficulty
                        ),

                        assignment_completion: Number(
                            form.assignmentCompletion
                        ),


                        // =================================
                        // Personal information
                        // =================================

                        marital_status: Number(
                            form.maritalStatus
                        ),

                        age_at_enrollment: Number(
                            form.age
                        ),

                        gender: Number(
                            form.gender
                        ),

                        nationality: Number(
                            form.nationality
                        ),

                        international: Number(
                            form.international
                        ),

                        displaced: Number(
                            form.displaced
                        ),

                        educational_special_needs: Number(
                            form.specialNeeds
                        ),


                        // =================================
                        // Admission information
                        // =================================

                        application_mode: Number(
                            form.applicationMode
                        ),

                        application_order: Number(
                            form.applicationOrder
                        ),

                        course: Number(
                            form.course
                        ),

                        previous_qualification: Number(
                            form.previousQualification
                        ),

                        previous_qualification_grade: Number(
                            form.previousQualificationGrade
                        ),

                        admission_grade: Number(
                            form.admissionGrade
                        ),

                        daytime_evening_attendance: 1,


                        // =================================
                        // Family background
                        // =================================

                        mothers_qualification: Number(
                            form.motherQualification
                        ),

                        fathers_qualification: Number(
                            form.fatherQualification
                        ),

                        mothers_occupation: Number(
                            form.motherOccupation
                        ),

                        fathers_occupation: Number(
                            form.fatherOccupation
                        ),


                        // =================================
                        // Financial / institutional
                        // =================================

                        debtor: Number(
                            form.debtor
                        ),

                        tuition_fees_up_to_date: Number(
                            form.tuitionPaid
                        ),

                        scholarship_holder: Number(
                            form.scholarship
                        ),


                        // =================================
                        // First semester
                        // =================================

                        curricular_units_1st_sem_credited: 0,

                        curricular_units_1st_sem_enrolled:
                            Number(form.sem1Enrolled),

                        curricular_units_1st_sem_evaluations:
                            Number(form.sem1Evaluations),

                        curricular_units_1st_sem_approved:
                            Number(form.sem1Approved),

                        curricular_units_1st_sem_grade:
                            Number(form.sem1Grade),

                        curricular_units_1st_sem_without_evaluations: 0,


                        // =================================
                        // Second semester
                        // =================================

                        curricular_units_2nd_sem_credited: 0,

                        curricular_units_2nd_sem_enrolled:
                            Number(form.sem2Enrolled),

                        curricular_units_2nd_sem_evaluations:
                            Number(form.sem2Evaluations),

                        curricular_units_2nd_sem_approved:
                            Number(form.sem2Approved),

                        curricular_units_2nd_sem_grade:
                            Number(form.sem2Grade),

                        curricular_units_2nd_sem_without_evaluations: 0,


                        // =================================
                        // Economic environment
                        // =================================

                        unemployment_rate: Number(
                            form.unemploymentRate
                        ),

                        inflation_rate: Number(
                            form.inflationRate
                        ),

                        gdp: Number(
                            form.gdp
                        )
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Prediction failed"
                );
            }


            setResult(data);

            // Save the latest real prediction for the What-If Simulator.
            localStorage.setItem(
                "lastPrediction",
                JSON.stringify({
                    form: form,
                    result: data
                })
            );

        } catch (err) {

            console.error(
                "Prediction error:",
                err
            );

            setError(
                err.message ||
                "Unable to connect to prediction server."
            );

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // Risk class
    // =====================================================

    const getRiskClass = () => {

        if (!result) {
            return "";
        }

        if (result.risk_level === "HIGH") {
            return "risk-high";
        }

        if (result.risk_level === "MEDIUM") {
            return "risk-medium";
        }

        return "risk-low";
    };


    // =====================================================
    // Risk message
    // =====================================================

    const getRiskMessage = () => {

        if (!result) {
            return "";
        }

        if (result.risk_level === "HIGH") {

            return (
                "The system has identified a high dropout risk. " +
                "Immediate academic, financial and counseling " +
                "intervention is recommended."
            );
        }

        if (result.risk_level === "MEDIUM") {

            return (
                "The system has identified a moderate dropout risk. " +
                "Early intervention can help reduce the student's risk."
            );
        }

        return (
            "The system currently identifies a low dropout risk. " +
            "Continue maintaining academic performance and engagement."
        );
    };


    // =====================================================
    // SHAP direction text
    // =====================================================

    const getShapDirection = (direction) => {

        if (
            direction ===
            "increases_dropout_risk"
        ) {
            return "Increases dropout risk";
        }

        return "Reduces dropout risk";
    };


    // =====================================================
    // SHAP icon
    // =====================================================

    const getShapIcon = (direction) => {

        if (
            direction ===
            "increases_dropout_risk"
        ) {
            return "↑";
        }

        return "↓";
    };


    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="prediction-page">

            <div className="prediction-container">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="prediction-header">

                    <button
                        className="back-button"
                        onClick={() => navigate("/dashboard")}
                    >
                        ← Dashboard
                    </button>

                    <h1>
                        AI Dropout Risk Prediction
                    </h1>

                    <p>
                        Enter academic, attendance, financial
                        and personal information to estimate
                        the student's dropout risk.
                    </p>

                </div>


                {/* =================================================
                    ACADEMIC INFORMATION
                ================================================= */}

                <section className="prediction-section">

                    <h2>
                        🎓 Academic Information
                    </h2>

                    <div className="form-grid">

                        <div>
                            <label>
                                CGPA
                            </label>

                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="10"
                                name="cgpa"
                                value={form.cgpa}
                                onChange={handleChange}
                            />
                        </div>


                        <div>
                            <label>
                                Attendance (%)
                            </label>

                            <input
                                type="number"
                                min="0"
                                max="100"
                                name="attendance"
                                value={form.attendance}
                                onChange={handleChange}
                            />
                        </div>


                        <div>
                            <label>
                                Backlogs
                            </label>

                            <input
                                type="number"
                                min="0"
                                name="backlogs"
                                value={form.backlogs}
                                onChange={handleChange}
                            />
                        </div>


                        <div>
                            <label>
                                Study Hours / Day
                            </label>

                            <input
                                type="number"
                                min="0"
                                max="24"
                                step="0.5"
                                name="studyHours"
                                value={form.studyHours}
                                onChange={handleChange}
                            />
                        </div>


                        <div>
                            <label>
                                Previous Qualification Grade
                            </label>

                            <input
                                type="number"
                                name="previousQualificationGrade"
                                value={
                                    form.previousQualificationGrade
                                }
                                onChange={handleChange}
                            />
                        </div>


                        <div>
                            <label>
                                Admission Grade
                            </label>

                            <input
                                type="number"
                                name="admissionGrade"
                                value={form.admissionGrade}
                                onChange={handleChange}
                            />
                        </div>


                        <div>
                            <label>
                                Age at Enrollment
                            </label>

                            <input
                                type="number"
                                min="15"
                                max="100"
                                name="age"
                                value={form.age}
                                onChange={handleChange}
                            />
                        </div>


                        <div>
                            <label>
                                Assignment Completion (%)
                            </label>

                            <input
                                type="number"
                                min="0"
                                max="100"
                                name="assignmentCompletion"
                                value={
                                    form.assignmentCompletion
                                }
                                onChange={handleChange}
                            />
                        </div>

                    </div>

                </section>


                {/* =================================================
                    SEMESTER PERFORMANCE
                ================================================= */}

                <section className="prediction-section">

                    <h2>
                        📚 Semester Performance
                    </h2>

                    <h3>
                        First Semester
                    </h3>

                    <div className="form-grid">

                        <div>
                            <label>
                                Enrolled Units
                            </label>

                            <input
                                type="number"
                                min="0"
                                name="sem1Enrolled"
                                value={form.sem1Enrolled}
                                onChange={handleChange}
                            />
                        </div>


                        <div>
                            <label>
                                Evaluated Units
                            </label>

                            <input
                                type="number"
                                min="0"
                                name="sem1Evaluations"
                                value={form.sem1Evaluations}
                                onChange={handleChange}
                            />
                        </div>


                        <div>
                            <label>
                                Approved Units
                            </label>

                            <input
                                type="number"
                                min="0"
                                name="sem1Approved"
                                value={form.sem1Approved}
                                onChange={handleChange}
                            />
                        </div>


                        <div>
                            <label>
                                Average Grade
                            </label>

                            <input
                                type="number"
                                step="0.1"
                                name="sem1Grade"
                                value={form.sem1Grade}
                                onChange={handleChange}
                            />
                        </div>

                    </div>


                    <h3>
                        Second Semester
                    </h3>

                    <div className="form-grid">

                        <div>
                            <label>
                                Enrolled Units
                            </label>

                            <input
                                type="number"
                                min="0"
                                name="sem2Enrolled"
                                value={form.sem2Enrolled}
                                onChange={handleChange}
                            />
                        </div>


                        <div>
                            <label>
                                Evaluated Units
                            </label>

                            <input
                                type="number"
                                min="0"
                                name="sem2Evaluations"
                                value={form.sem2Evaluations}
                                onChange={handleChange}
                            />
                        </div>


                        <div>
                            <label>
                                Approved Units
                            </label>

                            <input
                                type="number"
                                min="0"
                                name="sem2Approved"
                                value={form.sem2Approved}
                                onChange={handleChange}
                            />
                        </div>


                        <div>
                            <label>
                                Average Grade
                            </label>

                            <input
                                type="number"
                                step="0.1"
                                name="sem2Grade"
                                value={form.sem2Grade}
                                onChange={handleChange}
                            />
                        </div>

                    </div>

                </section>


                {/* =================================================
                    FINANCIAL FACTORS
                ================================================= */}

                <section className="prediction-section">

                    <h2>
                        💰 Financial Factors
                    </h2>

                    <div className="form-grid">

                        <div>
                            <label>
                                Financial Difficulty
                            </label>

                            <select
                                name="financialDifficulty"
                                value={
                                    form.financialDifficulty
                                }
                                onChange={handleChange}
                            >
                                <option value="0">
                                    No difficulty
                                </option>

                                <option value="1">
                                    Moderate difficulty
                                </option>

                                <option value="2">
                                    High difficulty
                                </option>
                            </select>
                        </div>


                        <div>
                            <label>
                                Outstanding Fees
                            </label>

                            <select
                                name="debtor"
                                value={form.debtor}
                                onChange={handleChange}
                            >
                                <option value="0">
                                    No
                                </option>

                                <option value="1">
                                    Yes
                                </option>
                            </select>
                        </div>


                        <div>
                            <label>
                                Tuition Fees Up To Date
                            </label>

                            <select
                                name="tuitionPaid"
                                value={form.tuitionPaid}
                                onChange={handleChange}
                            >
                                <option value="1">
                                    Yes
                                </option>

                                <option value="0">
                                    No
                                </option>
                            </select>
                        </div>


                        <div>
                            <label>
                                Scholarship
                            </label>

                            <select
                                name="scholarship"
                                value={form.scholarship}
                                onChange={handleChange}
                            >
                                <option value="0">
                                    No
                                </option>

                                <option value="1">
                                    Yes
                                </option>
                            </select>
                        </div>

                    </div>

                </section>


                {/* =================================================
                    PERSONAL INFORMATION
                ================================================= */}

                <section className="prediction-section">

                    <h2>
                        👤 Personal Information
                    </h2>

                    <div className="form-grid">

                        <div>
                            <label>
                                Displaced Student
                            </label>

                            <select
                                name="displaced"
                                value={form.displaced}
                                onChange={handleChange}
                            >
                                <option value="0">
                                    No
                                </option>

                                <option value="1">
                                    Yes
                                </option>
                            </select>
                        </div>


                        <div>
                            <label>
                                Educational Special Needs
                            </label>

                            <select
                                name="specialNeeds"
                                value={form.specialNeeds}
                                onChange={handleChange}
                            >
                                <option value="0">
                                    No
                                </option>

                                <option value="1">
                                    Yes
                                </option>
                            </select>
                        </div>


                        <div>
                            <label>
                                International Student
                            </label>

                            <select
                                name="international"
                                value={form.international}
                                onChange={handleChange}
                            >
                                <option value="0">
                                    No
                                </option>

                                <option value="1">
                                    Yes
                                </option>
                            </select>
                        </div>

                    </div>

                </section>


                {/* =================================================
                    PREDICT BUTTON
                ================================================= */}

                <button
                    className="predict-button"
                    onClick={predictDropout}
                    disabled={loading}
                >
                    {loading
                        ? "Analyzing Student Data..."
                        : "Predict Dropout Risk"}
                </button>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="prediction-error">

                        <strong>
                            Prediction Error
                        </strong>

                        <p>
                            {error}
                        </p>

                    </div>

                )}


                {/* =================================================
                    RESULT
                ================================================= */}

                {result && (

                    <div
                        className={`prediction-result ${getRiskClass()}`}
                    >

                        <h2>
                            AI Prediction Result
                        </h2>


                        <div className="risk-percentage">
                            {Number(
                                result.risk_percentage
                            ).toFixed(2)}%
                        </div>


                        <h3>
                            {result.risk_level} RISK
                        </h3>


                        <p className="risk-message">
                            {getRiskMessage()}
                        </p>


                        {/* =========================================
                            MODEL DETAILS
                        ========================================= */}

                        <div className="risk-details">

                            <div>

                                <strong>
                                    ML Probability
                                </strong>

                                <span>
                                    {Number(
                                        result.ml_probability
                                    ).toFixed(2)}%
                                </span>

                            </div>


                            <div>

                                <strong>
                                    Student Context Risk
                                </strong>

                                <span>
                                    {Number(
                                        result.context_risk
                                    ).toFixed(2)}%
                                </span>

                            </div>

                        </div>


                        {/* =========================================
                            RISK FACTORS
                        ========================================= */}

                        {result.risk_factors &&
                            result.risk_factors.length > 0 && (

                            <div className="risk-factors">

                                <h3>
                                    Key Risk Factors
                                </h3>

                                <ul>

                                    {result.risk_factors.map(
                                        (factor, index) => (

                                            <li key={index}>
                                                {factor}
                                            </li>

                                        )
                                    )}

                                </ul>

                            </div>

                        )}


                        {/* =========================================
                            EXPLAINABLE AI - SHAP
                        ========================================= */}

                        {result.shap_explanation &&
                            result.shap_explanation.length > 0 && (

                            <div className="shap-section">

                                <div className="shap-header">

                                    <span className="shap-label">
                                        Explainable AI
                                    </span>

                                    <h3>
                                        Why did the AI make this prediction?
                                    </h3>

                                    <p>
                                        SHAP analysis identifies the
                                        features that influenced the
                                        machine-learning prediction.
                                    </p>

                                </div>


                                <div className="shap-list">

                                    {result.shap_explanation.map(
                                        (item, index) => (

                                            <div
                                                className={`shap-card ${
                                                    item.direction ===
                                                    "increases_dropout_risk"
                                                        ? "shap-risk"
                                                        : "shap-protective"
                                                }`}
                                                key={index}
                                            >

                                                <div className="shap-icon">

                                                    {getShapIcon(
                                                        item.direction
                                                    )}

                                                </div>


                                                <div className="shap-content">

                                                    <h4>
                                                        {item.feature}
                                                    </h4>

                                                    <p>
                                                        {getShapDirection(
                                                            item.direction
                                                        )}
                                                    </p>

                                                </div>


                                                <div className="shap-impact">

                                                    <span>
                                                        Impact
                                                    </span>

                                                    <strong>
                                                        {Number(
                                                            item.impact
                                                        ).toFixed(3)}
                                                    </strong>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>


                                <div className="shap-note">

                                    <strong>
                                        How to interpret this:
                                    </strong>

                                    <br />

                                    A higher SHAP impact means the
                                    feature had a stronger influence
                                    on the machine-learning model's
                                    prediction.

                                    <br />

                                    Features marked with ↑ increase
                                    predicted dropout risk, while ↓
                                    indicates a protective influence.

                                </div>

                            </div>

                        )}


                        {/* =========================================
                            RECOMMENDATION
                        ========================================= */}

                        <div className="recommendation">

                            {result.risk_level === "HIGH" && (

                                <>
                                    ⚠️{" "}
                                    <strong>
                                        Immediate attention recommended.
                                    </strong>

                                    <br />

                                    Consider academic counseling,
                                    financial-aid support and an
                                    attendance improvement plan.
                                </>

                            )}


                            {result.risk_level === "MEDIUM" && (

                                <>
                                    📌{" "}
                                    <strong>
                                        Early intervention recommended.
                                    </strong>

                                    <br />

                                    Focus on attendance, academic
                                    consistency, assignments and
                                    pending coursework.
                                </>

                            )}


                            {result.risk_level === "LOW" && (

                                <>
                                    ✅{" "}
                                    <strong>
                                        Current risk is relatively low.
                                    </strong>

                                    <br />

                                    Continue maintaining attendance,
                                    academic performance and study
                                    consistency.
                                </>

                            )}

                        </div>

                    </div>

                )}

            </div>

        </div>
    );
}

export default Prediction;