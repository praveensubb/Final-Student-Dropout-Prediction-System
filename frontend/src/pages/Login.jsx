import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/adminLogin.css";

import CampusLogo from "../components/CampusLogo";

function Login() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);


    /* =====================================================
       ADMIN LOGIN
       ===================================================== */

    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await api.post(
                "/auth/admin-login",
                null,
                {
                    params: {
                        username,
                        password
                    }
                }
            );


            /* =================================================
               SAVE ADMIN LOGIN INFORMATION
               ================================================= */

            localStorage.setItem(
                "adminToken",
                response.data.access_token
            );

            localStorage.setItem(
                "adminId",
                response.data.admin_id
            );

            localStorage.setItem(
                "adminName",
                response.data.name
            );


            /* =================================================
               GO TO ADMIN DASHBOARD
               ================================================= */

            navigate("/admin");

        }

        catch (err) {

            console.error(
                "Admin login error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Invalid username or password"
            );

        }

        finally {

            setLoading(false);

        }

    };


    return (

        <div className="admin-login-page">


            {/* =================================================
               BACKGROUND DECORATION
               ================================================= */}

            <div className="admin-bg-circle admin-circle-one"></div>

            <div className="admin-bg-circle admin-circle-two"></div>

            <div className="admin-bg-grid"></div>


            {/* =================================================
               TOP HEADER
               ================================================= */}

            <header className="admin-top-header">

                <CampusLogo />

                <div className="admin-future-text">

                    <span>
                        SMART CAMPUS
                    </span>

                    <strong>
                        BRIGHTER FUTURES
                    </strong>

                    <div className="admin-future-line"></div>

                </div>

            </header>


            {/* =================================================
               MAIN LOGIN CONTAINER
               ================================================= */}

            <div className="admin-login-wrapper">


                {/* =================================================
                   LEFT ADMIN BRANDING
                   ================================================= */}

                <div className="admin-brand-panel">


                    <div className="admin-panel-logo">

                        <CampusLogo compact />

                    </div>


                    <div className="admin-badge">

                        <span>
                            🛡️
                        </span>

                        ADMIN COMMAND CENTER

                    </div>


                    <h1>

                        Manage.

                        <br />

                        <span>
                            Monitor. Protect.
                        </span>

                    </h1>


                    <p>

                        Centralized administration for student
                        management, faculty assignments, risk
                        monitoring and early intervention.

                    </p>


                    {/* =================================================
                       ADMIN FEATURES
                       ================================================= */}

                    <div className="admin-features">


                        <div className="admin-feature">

                            <div className="admin-feature-icon blue">
                                👥
                            </div>

                            <div>

                                <strong>
                                    Student Management
                                </strong>

                                <small>
                                    Manage registered students
                                </small>

                            </div>

                        </div>


                        <div className="admin-feature">

                            <div className="admin-feature-icon purple">
                                🧠
                            </div>

                            <div>

                                <strong>
                                    AI Risk Monitoring
                                </strong>

                                <small>
                                    Monitor dropout risk levels
                                </small>

                            </div>

                        </div>


                        <div className="admin-feature">

                            <div className="admin-feature-icon green">
                                📊
                            </div>

                            <div>

                                <strong>
                                    System Overview
                                </strong>

                                <small>
                                    Track activities and interventions
                                </small>

                            </div>

                        </div>

                    </div>


                    <div className="admin-brand-footer">

                        AI-Based Student Dropout Prediction &
                        Counseling System

                    </div>

                </div>


                {/* =================================================
                   LOGIN CARD
                   ================================================= */}

                <div className="admin-login-card">


                    {/* ADMIN ICON */}

                    <div className="admin-login-icon">

                        🛡️

                    </div>


                    <div className="admin-login-header">

                        <div className="admin-login-label">

                            ADMIN CONTROL CENTER

                        </div>


                        <h2>

                            Welcome Back

                        </h2>


                        <p className="admin-login-subtitle">

                            Sign in to manage student risk and
                            interventions.

                        </p>

                    </div>


                    {/* =================================================
                       ERROR
                       ================================================= */}

                    {error && (

                        <div className="admin-login-error">

                            <span>
                                ⚠
                            </span>

                            <span>
                                {error}
                            </span>

                        </div>

                    )}


                    {/* =================================================
                       FORM
                       ================================================= */}

                    <form onSubmit={handleLogin}>


                        {/* USERNAME */}

                        <div className="admin-form-group">

                            <label>
                                Admin Username
                            </label>


                            <div className="admin-input-wrapper">

                                <span className="admin-input-icon">
                                    👤
                                </span>


                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    placeholder="Enter admin username"
                                    required
                                />

                            </div>

                        </div>


                        {/* PASSWORD */}

                        <div className="admin-form-group">

                            <label>
                                Password
                            </label>


                            <div className="admin-input-wrapper">

                                <span className="admin-input-icon">
                                    🔒
                                </span>


                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Enter password"
                                    required
                                />


                                <button
                                    type="button"
                                    className="admin-password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >

                                    {showPassword
                                        ? "🙈"
                                        : "👁"}

                                </button>

                            </div>

                        </div>


                        {/* =================================================
                           LOGIN BUTTON
                           ================================================= */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="admin-login-button"
                        >

                            {loading ? (

                                <>

                                    <span className="admin-spinner"></span>

                                    Authenticating...

                                </>

                            ) : (

                                <>

                                    <span>
                                        Enter Command Center
                                    </span>

                                    <span className="admin-button-arrow">
                                        →
                                    </span>

                                </>

                            )}

                        </button>

                    </form>


                    {/* =================================================
                       BACK HOME
                       ================================================= */}

                    <button
                        className="admin-back-button"
                        onClick={() => navigate("/")}
                    >

                        <span>
                            ←
                        </span>

                        Back to Home

                    </button>


                    {/* =================================================
                       SECURITY
                       ================================================= */}

                    <div className="admin-login-footer">

                        <span>
                            🔒
                        </span>

                        Secure Administrator Access

                    </div>

                </div>

            </div>


            {/* =================================================
               BOTTOM
               ================================================= */}

            <div className="admin-page-tagline">

                One Campus. One Connected Platform.

            </div>

        </div>
    );
}

export default Login;