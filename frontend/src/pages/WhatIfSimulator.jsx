import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/prediction.css";

function WhatIfSimulator() {

    const navigate = useNavigate();

    // =========================================================
    // Load latest prediction safely
    // =========================================================

    const savedPrediction = JSON.parse(
        localStorage.getItem("lastPrediction") || "null"
    );

    const originalForm = savedPrediction?.form || null;
    const originalResult = savedPrediction?.result || null;


    // =========================================================
    // ALL HOOKS MUST BE CALLED BEFORE ANY RETURN
    // =========================================================

    const [form, setForm] = useState(
        originalForm
            ? { ...originalForm }
            : {}
    );

    const [loading, setLoading] = useState(false);

    const [result, setResult] = useState(null);

    const [error, setError] = useState("");


    // =========================================================
    // Load saved prediction
    // =========================================================

    useEffect(() => {

        if (originalForm) {

            setForm({
                ...originalForm
            });

        }

    }, []);


    // =========================================================
    // If there is no previous prediction
    // =========================================================

    if (!savedPrediction) {

        return (

            <div className="prediction-page">

                <div className="prediction-container">

                    <div className="prediction-header">

                        <button
                            className="back-button"
                            onClick={() =>
                                navigate("/prediction")
                            }
                        >
                            ← AI Prediction
                        </button>

                        <h1>
                            What-If Simulator
                        </h1>

                        <p>
                            Change student factors and see how
                            the predicted dropout risk could change.
                        </p>

                    </div>


                    <div className="prediction-error">

                        <h3>
                            No Previous Prediction
                        </h3>

                        <p>
                            Please complete an AI Dropout Prediction
                            first. The What-If Simulator uses that
                            prediction as the student's current baseline.
                        </p>

                        <button
                            className="predict-button"
                            onClick={() =>
                                navigate("/prediction")
                            }
                        >
                            Go to AI Prediction
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    // =========================================================
    // Helper function
    // =========================================================

    const value = (name, defaultValue = 0) => {

        if (
            form[name] === undefined ||
            form[name] === null ||
            form[name] === ""
        ) {
            return defaultValue;
        }

        return form[name];
    };


    // =========================================================
    // Handle form changes
    // =========================================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));

    };


    // =========================================================
    // Reset scenario
    // =========================================================

    const resetScenario = () => {

        setForm({
            ...originalForm
        });

        setResult(null);

        setError("");
    };


    // =========================================================
    // Run What-If prediction
    // =========================================================

    const simulateRisk = async () => {

        setLoading(true);

        setResult(null);

        setError("");


        try {

            const requestBody = {

                // =================================================
                // Project-specific factors
                // =================================================

                cgpa: Number(
                    value("cgpa", 6.5)
                ),

                attendance: Number(
                    value("attendance", 75)
                ),

                backlogs: Number(
                    value("backlogs", 0)
                ),

                study_hours: Number(
                    value("studyHours", 4)
                ),

                financial_difficulty: Number(
                    value("financialDifficulty", 0)
                ),

                assignment_completion: Number(
                    value("assignmentCompletion", 80)
                ),


                // =================================================
                // Personal information
                // =================================================

                marital_status: Number(
                    value("maritalStatus", 1)
                ),

                application_mode: Number(
                    value("applicationMode", 17)
                ),

                application_order: Number(
                    value("applicationOrder", 1)
                ),

                course: Number(
                    value("course", 171)
                ),

                daytime_evening_attendance: Number(
                    value("daytimeAttendance", 1)
                ),

                previous_qualification: Number(
                    value("previousQualification", 1)
                ),

                previous_qualification_grade: Number(
                    value(
                        "previousQualificationGrade",
                        122
                    )
                ),

                nationality: Number(
                    value("nationality", 1)
                ),

                mothers_qualification: Number(
                    value("motherQualification", 1)
                ),

                fathers_qualification: Number(
                    value("fatherQualification", 1)
                ),

                mothers_occupation: Number(
                    value("motherOccupation", 5)
                ),

                fathers_occupation: Number(
                    value("fatherOccupation", 9)
                ),

                admission_grade: Number(
                    value("admissionGrade", 125)
                ),

                displaced: Number(
                    value("displaced", 0)
                ),

                educational_special_needs: Number(
                    value("specialNeeds", 0)
                ),

                debtor: Number(
                    value("debtor", 0)
                ),

                tuition_fees_up_to_date: Number(
                    value("tuitionPaid", 1)
                ),

                gender: Number(
                    value("gender", 1)
                ),

                scholarship_holder: Number(
                    value("scholarship", 0)
                ),

                age_at_enrollment: Number(
                    value("age", 20)
                ),

                international: Number(
                    value("international", 0)
                ),


                // =================================================
                // First semester
                // =================================================

                curricular_units_1st_sem_credited: Number(
                    value("sem1Credited", 0)
                ),

                curricular_units_1st_sem_enrolled: Number(
                    value("sem1Enrolled", 6)
                ),

                curricular_units_1st_sem_evaluations: Number(
                    value("sem1Evaluations", 6)
                ),

                curricular_units_1st_sem_approved: Number(
                    value("sem1Approved", 5)
                ),

                curricular_units_1st_sem_grade: Number(
                    value("sem1Grade", 12)
                ),

                curricular_units_1st_sem_without_evaluations: Number(
                    value("sem1WithoutEvaluations", 0)
                ),


                // =================================================
                // Second semester
                // =================================================

                curricular_units_2nd_sem_credited: Number(
                    value("sem2Credited", 0)
                ),

                curricular_units_2nd_sem_enrolled: Number(
                    value("sem2Enrolled", 6)
                ),

                curricular_units_2nd_sem_evaluations: Number(
                    value("sem2Evaluations", 6)
                ),

                curricular_units_2nd_sem_approved: Number(
                    value("sem2Approved", 5)
                ),

                curricular_units_2nd_sem_grade: Number(
                    value("sem2Grade", 12)
                ),

                curricular_units_2nd_sem_without_evaluations: Number(
                    value("sem2WithoutEvaluations", 0)
                ),


                // =================================================
                // Economic data
                // =================================================

                unemployment_rate: Number(
                    value("unemploymentRate", 10.8)
                ),

                inflation_rate: Number(
                    value("inflationRate", 1.4)
                ),

                gdp: Number(
                    value("gdp", 1.74)
                )
            };


            console.log(
                "What-If Request:",
                requestBody
            );


            const response = await fetch(
                "http://127.0.0.1:8000/prediction/predict",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(
                        requestBody
                    )
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

        } catch (err) {

            console.error(
                "What-If simulation error:",
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


    // =========================================================
    // Current risk
    // =========================================================

    const currentRisk = Number(
        originalResult.risk_percentage || 0
    );


    // =========================================================
    // Simulated risk
    // =========================================================

    const simulatedRisk = result
        ? Number(result.risk_percentage || 0)
        : null;


    // =========================================================
    // Difference
    // =========================================================

    const riskDifference = result
        ? simulatedRisk - currentRisk
        : null;


    // =========================================================
    // Risk class
    // =========================================================

    const getRiskClass = (level) => {

        if (level === "HIGH") {
            return "risk-high";
        }

        if (level === "MEDIUM") {
            return "risk-medium";
        }

        return "risk-low";

    };


    // =========================================================
    // Render
    // =========================================================

    return (

        <div className="prediction-page">

            <div className="prediction-container">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="prediction-header">

                    <button
                        className="back-button"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        ← Dashboard
                    </button>

                    <h1>
                        What-If Simulator
                    </h1>

                    <p>
                        Change academic and financial factors
                        to see how the predicted dropout risk
                        could change.
                    </p>

                </div>


                {/* =================================================
                    CURRENT RISK
                ================================================= */}

                <section className="prediction-section">

                    <h2>
                        📊 Current Student Risk
                    </h2>

                    <div className="risk-details">

                        <div>

                            <strong>
                                Current Risk
                            </strong>

                            <span>
                                {currentRisk.toFixed(2)}%
                            </span>

                        </div>


                        <div>

                            <strong>
                                Risk Level
                            </strong>

                            <span>
                                {originalResult.risk_level}
                            </span>

                        </div>


                        <div>

                            <strong>
                                ML Probability
                            </strong>

                            <span>
                                {Number(
                                    originalResult.ml_probability || 0
                                ).toFixed(2)}%
                            </span>

                        </div>


                        <div>

                            <strong>
                                Context Risk
                            </strong>

                            <span>
                                {Number(
                                    originalResult.context_risk || 0
                                ).toFixed(2)}%
                            </span>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    WHAT-IF FORM
                ================================================= */}

                <section className="prediction-section">

                    <h2>
                        🔄 What-If Scenario
                    </h2>

                    <p>
                        These values start from the student's
                        actual prediction. Change them to simulate
                        a different situation.
                    </p>


                    <div className="form-grid">


                        {/* CGPA */}

                        <div>

                            <label>
                                CGPA
                            </label>

                            <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.01"
                                name="cgpa"
                                value={value("cgpa", 6.5)}
                                onChange={handleChange}
                            />

                        </div>


                        {/* Attendance */}

                        <div>

                            <label>
                                Attendance (%)
                            </label>

                            <input
                                type="number"
                                min="0"
                                max="100"
                                name="attendance"
                                value={value("attendance", 75)}
                                onChange={handleChange}
                            />

                        </div>


                        {/* Backlogs */}

                        <div>

                            <label>
                                Backlogs
                            </label>

                            <input
                                type="number"
                                min="0"
                                name="backlogs"
                                value={value("backlogs", 0)}
                                onChange={handleChange}
                            />

                        </div>


                        {/* Study Hours */}

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
                                value={value("studyHours", 4)}
                                onChange={handleChange}
                            />

                        </div>


                        {/* Assignment Completion */}

                        <div>

                            <label>
                                Assignment Completion (%)
                            </label>

                            <input
                                type="number"
                                min="0"
                                max="100"
                                name="assignmentCompletion"
                                value={value(
                                    "assignmentCompletion",
                                    80
                                )}
                                onChange={handleChange}
                            />

                        </div>


                        {/* Financial Difficulty */}

                        <div>

                            <label>
                                Financial Difficulty
                            </label>

                            <select
                                name="financialDifficulty"
                                value={value(
                                    "financialDifficulty",
                                    0
                                )}
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

                    </div>

                </section>


                {/* =================================================
                    BUTTONS
                ================================================= */}

                <div
                    style={{
                        display: "flex",
                        gap: "15px",
                        marginBottom: "30px",
                        flexWrap: "wrap"
                    }}
                >

                    <button
                        className="predict-button"
                        onClick={simulateRisk}
                        disabled={loading}
                    >

                        {loading
                            ? "Running AI Simulation..."
                            : "Simulate New Risk"}

                    </button>


                    <button
                        className="back-button"
                        onClick={resetScenario}
                        type="button"
                    >
                        Reset to Current Values
                    </button>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="prediction-error">

                        <h3>
                            Simulation Error
                        </h3>

                        <p>
                            {error}
                        </p>

                    </div>

                )}


                {/* =================================================
                    SIMULATED RESULT
                ================================================= */}

                {result && (

                    <div
                        className={`prediction-result ${
                            getRiskClass(
                                result.risk_level
                            )
                        }`}
                    >

                        <h2>
                            Simulated AI Risk
                        </h2>


                        <div className="risk-percentage">

                            {simulatedRisk.toFixed(2)}%

                        </div>


                        <h3>
                            {result.risk_level} RISK
                        </h3>


                        <p className="risk-message">

                            This is a model-based estimate
                            using the changed scenario values.
                            It is not a guarantee of future outcomes.

                        </p>


                        {/* =================================================
                            COMPARISON
                        ================================================= */}

                        <div className="risk-details">


                            <div>

                                <strong>
                                    Current Risk
                                </strong>

                                <span>
                                    {currentRisk.toFixed(2)}%
                                </span>

                            </div>


                            <div>

                                <strong>
                                    Simulated Risk
                                </strong>

                                <span>
                                    {simulatedRisk.toFixed(2)}%
                                </span>

                            </div>


                            <div>

                                <strong>
                                    Risk Change
                                </strong>

                                <span>

                                    {riskDifference > 0
                                        ? "+"
                                        : ""}

                                    {riskDifference.toFixed(2)}

                                    {" percentage points"}

                                </span>

                            </div>


                            <div>

                                <strong>
                                    ML Probability
                                </strong>

                                <span>
                                    {Number(
                                        result.ml_probability || 0
                                    ).toFixed(2)}%
                                </span>

                            </div>


                            <div>

                                <strong>
                                    Context Risk
                                </strong>

                                <span>
                                    {Number(
                                        result.context_risk || 0
                                    ).toFixed(2)}%
                                </span>

                            </div>

                        </div>


                        {/* =================================================
                            INTERPRETATION
                        ================================================= */}

                        <div className="recommendation">

                            {riskDifference < 0 && (

                                <>
                                    <strong>
                                        ↓ Predicted risk decreased
                                    </strong>

                                    <br />

                                    The simulated scenario has a
                                    lower predicted dropout risk
                                    than the student's current risk.
                                </>

                            )}


                            {riskDifference > 0 && (

                                <>
                                    <strong>
                                        ↑ Predicted risk increased
                                    </strong>

                                    <br />

                                    The simulated scenario has a
                                    higher predicted dropout risk
                                    than the student's current risk.
                                </>

                            )}


                            {riskDifference === 0 && (

                                <>
                                    <strong>
                                        No predicted change
                                    </strong>

                                    <br />

                                    The model produced the same
                                    risk estimate for both scenarios.
                                </>

                            )}

                        </div>


                        {/* =================================================
                            RISK FACTORS
                        ================================================= */}

                        {result.risk_factors &&
                            result.risk_factors.length > 0 && (

                                <div className="risk-factors">

                                    <h3>
                                        Simulated Risk Factors
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


                        {/* =================================================
                            SHAP EXPLANATION
                        ================================================= */}

                        {result.shap_explanation &&
                            result.shap_explanation.length > 0 && (

                                <div className="risk-factors">

                                    <h3>
                                        AI Explanation
                                    </h3>

                                    <p>
                                        These are the strongest
                                        features influencing the
                                        simulated machine-learning
                                        prediction.
                                    </p>

                                    {result.shap_explanation
                                        .slice(0, 5)
                                        .map(
                                            (item, index) => (

                                                <div
                                                    key={index}
                                                    style={{
                                                        padding:
                                                            "10px 0",
                                                        borderBottom:
                                                            "1px solid #ddd"
                                                    }}
                                                >

                                                    <strong>
                                                        {item.direction ===
                                                        "increases_dropout_risk"
                                                            ? "↑ "
                                                            : "↓ "}

                                                        {item.feature}
                                                    </strong>

                                                    <br />

                                                    <small>
                                                        Impact:{" "}
                                                        {Number(
                                                            item.impact
                                                        ).toFixed(3)}
                                                    </small>

                                                </div>

                                            )
                                        )}

                                </div>

                            )}

                    </div>

                )}

            </div>

        </div>
    );
}

export default WhatIfSimulator;