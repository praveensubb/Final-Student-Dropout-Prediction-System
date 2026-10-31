import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/riskCluster.css";
const API_URL = "http://127.0.0.1:8000";

function RiskCluster() {
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    const loadRiskData = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/prediction/admin-summary`
            );

            if (!response.ok) {
                throw new Error("Unable to load risk intelligence.");
            }

            const result = await response.json();

            setData(result);
        } catch (err) {
            console.error("Risk Cluster Error:", err);

            setError(
                err.message || "Failed to load risk intelligence."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRiskData();
    }, []);

    if (loading) {
        return (
            <div className="risk-page-loading">
                <div className="risk-loading-card">
                    <div className="risk-loader"></div>

                    <h2>
                        Loading Risk Intelligence
                    </h2>

                    <p>
                        Analyzing student risk data...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="risk-page-loading">
                <div className="risk-error-card">

                    <div className="risk-error-icon">
                        !
                    </div>

                    <h2>
                        Risk Intelligence Error
                    </h2>

                    <p>
                        {error}
                    </p>

                    <div className="risk-error-actions">

                        <button
                            onClick={loadRiskData}
                            className="risk-primary-button"
                        >
                            Try Again
                        </button>

                        <button
                            onClick={() => navigate("/admin")}
                            className="risk-secondary-button"
                        >
                            Back to Dashboard
                        </button>

                    </div>

                </div>
            </div>
        );
    }

    const totalStudents =
        data?.total_students || 0;

    const highRisk =
        data?.high_risk || 0;

    const mediumRisk =
        data?.medium_risk || 0;

    const lowRisk =
        data?.low_risk || 0;

    const priorityStudents =
        data?.priority_students || [];

    const factorSummary =
        data?.factor_summary || [];

    return (
        <div className="risk-cluster-page">

            {/* HEADER */}

            <header className="risk-header">

                <div className="risk-header-left">

                    <button
                        className="risk-back-button"
                        onClick={() => navigate("/admin")}
                    >
                        ←
                    </button>

                    <div>
                        <span className="risk-eyebrow">
                            AI STUDENT INTELLIGENCE
                        </span>

                        <h1>
                            Risk Intelligence
                        </h1>

                        <p>
                            Student dropout risk analysis
                            and early-warning insights.
                        </p>
                    </div>

                </div>

                <button
                    className="risk-refresh-button"
                    onClick={loadRiskData}
                >
                    ↻ Refresh
                </button>

            </header>


            {/* SUMMARY CARDS */}

            <section className="risk-summary-grid">

                <div className="risk-summary-card total">

                    <span>
                        TOTAL STUDENTS
                    </span>

                    <strong>
                        {totalStudents}
                    </strong>

                    <small>
                        Registered students
                    </small>

                </div>


                <div className="risk-summary-card high">

                    <span>
                        HIGH RISK
                    </span>

                    <strong>
                        {highRisk}
                    </strong>

                    <small>
                        Require priority attention
                    </small>

                </div>


                <div className="risk-summary-card medium">

                    <span>
                        MEDIUM RISK
                    </span>

                    <strong>
                        {mediumRisk}
                    </strong>

                    <small>
                        Require monitoring
                    </small>

                </div>


                <div className="risk-summary-card low">

                    <span>
                        LOW RISK
                    </span>

                    <strong>
                        {lowRisk}
                    </strong>

                    <small>
                        Currently stable
                    </small>

                </div>

            </section>


            {/* RISK DISTRIBUTION */}

            <section className="risk-content-grid">

                <div className="risk-card">

                    <div className="risk-card-header">

                        <div>

                            <span>
                                RISK DISTRIBUTION
                            </span>

                            <h2>
                                Student Risk Overview
                            </h2>

                        </div>

                    </div>


                    <div className="risk-bars">

                        <div className="risk-bar-item">

                            <div className="risk-bar-label">
                                <span>High Risk</span>
                                <strong>
                                    {highRisk}
                                </strong>
                            </div>

                            <div className="risk-bar">
                                <div
                                    className="risk-bar-fill high"
                                    style={{
                                        width:
                                            totalStudents > 0
                                                ? `${Math.min(
                                                    (highRisk /
                                                        totalStudents) *
                                                        100,
                                                    100
                                                )}%`
                                                : "0%"
                                    }}
                                ></div>
                            </div>

                        </div>


                        <div className="risk-bar-item">

                            <div className="risk-bar-label">
                                <span>Medium Risk</span>
                                <strong>
                                    {mediumRisk}
                                </strong>
                            </div>

                            <div className="risk-bar">
                                <div
                                    className="risk-bar-fill medium"
                                    style={{
                                        width:
                                            totalStudents > 0
                                                ? `${Math.min(
                                                    (mediumRisk /
                                                        totalStudents) *
                                                        100,
                                                    100
                                                )}%`
                                                : "0%"
                                    }}
                                ></div>
                            </div>

                        </div>


                        <div className="risk-bar-item">

                            <div className="risk-bar-label">
                                <span>Low Risk</span>
                                <strong>
                                    {lowRisk}
                                </strong>
                            </div>

                            <div className="risk-bar">
                                <div
                                    className="risk-bar-fill low"
                                    style={{
                                        width:
                                            totalStudents > 0
                                                ? `${Math.min(
                                                    (lowRisk /
                                                        totalStudents) *
                                                        100,
                                                    100
                                                )}%`
                                                : "0%"
                                    }}
                                ></div>
                            </div>

                        </div>

                    </div>

                </div>


                {/* PRIORITY STUDENTS */}

                <div className="risk-card">

                    <div className="risk-card-header">

                        <div>

                            <span>
                                PRIORITY QUEUE
                            </span>

                            <h2>
                                Needs Attention
                            </h2>

                        </div>

                    </div>


                    <div className="risk-student-list">

                        {priorityStudents.length === 0 ? (

                            <div className="risk-empty">
                                No priority students found.
                            </div>

                        ) : (

                            priorityStudents
                                .map((student, index) => (

                                    <div
                                        className="risk-student-row"
                                        key={
                                            student.id ||
                                            index
                                        }
                                    >

                                        <div className="risk-rank">
                                            {String(
                                                index + 1
                                            ).padStart(
                                                2,
                                                "0"
                                            )}
                                        </div>


                                        <div className="risk-avatar">
                                            {student.name
                                                ?.charAt(0)
                                                .toUpperCase()}
                                        </div>


                                        <div className="risk-student-info">

                                            <strong>
                                                {student.name}
                                            </strong>

                                            <span>
                                                {student.usn}
                                            </span>

                                        </div>


                                        <div className="risk-score">

                                            <strong>
                                                {
                                                    student.risk_percentage
                                                }%
                                            </strong>

                                            <span
                                                className={
                                                    student.risk_level ===
                                                    "HIGH"
                                                        ? "high-text"
                                                        : "medium-text"
                                                }
                                            >
                                                {
                                                    student.risk_level
                                                }
                                            </span>

                                        </div>

                                    </div>

                                ))

                        )}

                    </div>

                </div>

            </section>


            {/* RISK FACTORS */}

            <section className="risk-card">

                <div className="risk-card-header">

                    <div>

                        <span>
                            EXPLAINABLE AI
                        </span>

                        <h2>
                            What is driving student risk?
                        </h2>

                    </div>

                    <div className="xai-label">
                        SHAP + CONTEXT
                    </div>

                </div>


                <div className="factor-grid">

                    {factorSummary.length === 0 ? (

                        <div className="risk-empty">
                            No risk factors detected.
                        </div>

                    ) : (

                        factorSummary
                            .map((factor, index) => (

                                <div
                                    className="factor-card"
                                    key={
                                        factor.factor ||
                                        index
                                    }
                                >

                                    <div className="factor-icon">
                                        {index + 1}
                                    </div>

                                    <div className="factor-content">

                                        <strong>
                                            {factor.factor}
                                        </strong>

                                        <span>
                                            Detected in{" "}
                                            {factor.count}{" "}
                                            students
                                        </span>

                                        <div className="factor-progress">

                                            <div
                                                style={{
                                                    width: `${Math.min(
                                                        factor.percentage ||
                                                            0,
                                                        100
                                                    )}%`
                                                }}
                                            ></div>

                                        </div>

                                    </div>

                                    <b>
                                        {
                                            factor.percentage
                                        }%
                                    </b>

                                </div>

                            ))

                    )}

                </div>

            </section>


            {/* FOOTER */}

            <footer className="risk-footer">

                <span>
                    CampusSphere
                </span>

                <span>•</span>

                AI Student Dropout Prediction
                & Counseling System

            </footer>

        </div>
    );
}

export default RiskCluster;