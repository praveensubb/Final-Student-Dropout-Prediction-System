import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FacultyLogin.css";

import CampusLogo from "../components/CampusLogo";

const FacultyLogin = () => {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);


    /* =====================================================
       FACULTY LOGIN
       ===================================================== */

    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/faculty/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password,
                    }),
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Invalid email or password"
                );

            }


            /* =================================================
               SAVE FACULTY LOGIN INFORMATION
               ================================================= */

            localStorage.setItem(
                "facultyToken",
                data.access_token
            );

            localStorage.setItem(
                "facultyId",
                data.faculty.id
            );

            localStorage.setItem(
                "facultyName",
                data.faculty.name
            );

            localStorage.setItem(
                "facultyEmail",
                data.faculty.email
            );

            localStorage.setItem(
                "facultyDepartment",
                data.faculty.department || ""
            );


            /* =================================================
               GO TO FACULTY DASHBOARD
               ================================================= */

            navigate("/faculty-dashboard");

        }

        catch (error) {

            console.error(
                "Faculty login error:",
                error
            );

            setError(
                error.message ||
                "Unable to connect to server"
            );

        }

        finally {

            setLoading(false);

        }

    };


    return (

        <div className="faculty-login-page">

            {/* =================================================
               BACKGROUND DECORATION
               ================================================= */}

            <div className="faculty-bg-circle faculty-circle-one"></div>

            <div className="faculty-bg-circle faculty-circle-two"></div>


            {/* =================================================
               TOP HEADER
               ================================================= */}

            <header className="faculty-top-header">

                <CampusLogo />

                <div className="faculty-future-text">

                    <span>BRIGHTER FUTURES</span>

                    <div className="future-line"></div>

                </div>

            </header>


            {/* =================================================
               MAIN LOGIN WRAPPER
               ================================================= */}

            <div className="faculty-login-wrapper">


                {/* =================================================
                   LEFT BRANDING PANEL
                   ================================================= */}

                <div className="faculty-brand-panel">


                    {/* Logo inside panel */}

                    <div className="faculty-panel-logo">

                        <CampusLogo compact />

                    </div>


                    <span className="faculty-badge">

                        <span className="faculty-badge-icon">
                            👤
                        </span>

                        FACULTY PORTAL

                    </span>


                    <h1>

                        Empowering Faculty.

                        <br />

                        <span>
                            Supporting Students.
                        </span>

                    </h1>


                    <p>

                        Manage assigned students, monitor attendance,
                        provide counselling and track interventions
                        through one intelligent platform.

                    </p>


                    {/* =================================================
                       FEATURES
                       ================================================= */}

                    <div className="faculty-features">


                        <div className="faculty-feature">

                            <span className="feature-icon green">
                                👥
                            </span>

                            <div>

                                <strong>
                                    Assigned Students
                                </strong>

                                <small>
                                    Manage your assigned students
                                </small>

                            </div>

                        </div>


                        <div className="faculty-feature">

                            <span className="feature-icon blue">
                                📅
                            </span>

                            <div>

                                <strong>
                                    Attendance & Timetable
                                </strong>

                                <small>
                                    Track academic engagement
                                </small>

                            </div>

                        </div>


                        <div className="faculty-feature">

                            <span className="feature-icon purple">
                                📊
                            </span>

                            <div>

                                <strong>
                                    Counselling & Intervention
                                </strong>

                                <small>
                                    Support students at risk
                                </small>

                            </div>

                        </div>


                    </div>


                    <div className="faculty-brand-footer">

                        AI-Based Student Dropout Prediction &
                        Counseling System

                    </div>

                </div>


                {/* =================================================
                   LOGIN CARD
                   ================================================= */}

                <div className="faculty-login-card">


                    {/* Login Logo */}

                    <div className="faculty-card-logo">

                        <CampusLogo compact />

                    </div>


                    <div className="faculty-login-header">

                        <div className="faculty-welcome">

                            WELCOME BACK

                        </div>


                        <h2>

                            Faculty Login

                        </h2>


                        <p>

                            Sign in to access your faculty dashboard

                        </p>

                    </div>


                    {/* =================================================
                       LOGIN FORM
                       ================================================= */}

                    <form onSubmit={handleLogin}>


                        {/* EMAIL */}

                        <div className="faculty-input-group">

                            <label>
                                Email Address
                            </label>


                            <div className="faculty-input-wrapper">

                                <span className="faculty-input-icon">
                                    ✉
                                </span>


                                <input
                                    type="email"
                                    placeholder="faculty@example.com"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    required
                                />

                            </div>

                        </div>


                        {/* PASSWORD */}

                        <div className="faculty-input-group">

                            <label>
                                Password
                            </label>


                            <div className="faculty-input-wrapper">

                                <span className="faculty-input-icon">
                                    🔒
                                </span>


                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />


                                <button
                                    type="button"
                                    className="password-toggle"
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


                        {/* ERROR */}

                        {error && (

                            <div className="faculty-login-error">

                                <span>
                                    ⚠
                                </span>

                                {error}

                            </div>

                        )}


                        {/* LOGIN */}

                        <button
                            type="submit"
                            className="faculty-login-submit"
                            disabled={loading}
                        >

                            {loading ? (

                                <>

                                    <span className="login-spinner"></span>

                                    Signing in...

                                </>

                            ) : (

                                <>

                                    <span>
                                        Sign In
                                    </span>

                                    <span className="login-arrow">
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
                        className="faculty-back-button"
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

                    <div className="faculty-secure">

                        <span>
                            🔒
                        </span>

                        Secure Faculty Access

                    </div>

                </div>

            </div>


            {/* =================================================
               BOTTOM TAGLINE
               ================================================= */}

            <div className="faculty-page-tagline">

                One Campus. One Connected Platform.

            </div>

        </div>

    );
};

export default FacultyLogin;