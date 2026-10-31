import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RoleSelection.css";

function RoleSelection() {
    const navigate = useNavigate();
    const [showIntro, setShowIntro] = useState(true);

    // =====================================================
    // ENTER CAMPUS
    // =====================================================

    const enterCampus = () => {
        setShowIntro(false);
    };

    // =====================================================
    // STUDENT LOGIN
    // =====================================================

    const handleStudentLogin = (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log("Student Login clicked");

        navigate("/student-login");
    };

    // =====================================================
    // STUDENT REGISTER
    // =====================================================

    const handleRegister = (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log("Register clicked");

        navigate("/register");
    };

    // =====================================================
    // FACULTY LOGIN
    // =====================================================

    const handleFacultyLogin = (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log("Faculty Login clicked");

        navigate("/faculty-login");
    };

    // =====================================================
    // MENTOR LOGIN
    // =====================================================

    const handleMentorLogin = (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log("Mentor Login clicked");

        navigate("/mentor-login");
    };

    // =====================================================
    // ADMIN LOGIN
    // =====================================================

    const handleAdminLogin = (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log("Admin Login clicked");

        navigate("/admin-login");
    };

    return (
        <div className="role-page">

            {/* =====================================================
                CINEMATIC INTRO
            ===================================================== */}

            {showIntro && (
                <div
                    className="cinematic-intro"
                    onClick={enterCampus}
                    onKeyDown={(e) => {
                        if (
                            e.key === "Enter" ||
                            e.key === " "
                        ) {
                            e.preventDefault();
                            enterCampus();
                        }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Enter CampusSphere"
                >

                    <div className="cinematic-black"></div>

                    <div className="cinematic-spotlight"></div>

                    <div className="intro-particle particle-1"></div>
                    <div className="intro-particle particle-2"></div>
                    <div className="intro-particle particle-3"></div>
                    <div className="intro-particle particle-4"></div>
                    <div className="intro-particle particle-5"></div>

                    <div className="intro-text">

                        <img
                            src="/campus-logo.png"
                            alt="CampusSphere Logo"
                            className="cinematic-logo"
                        />

                        <span className="welcome-text">
                            WELCOME TO
                        </span>

                        <div className="intro-line"></div>

                        <h1>
                            Campus<span>Sphere</span>
                        </h1>

                        <p>
                            One Campus. One Connected Platform.
                        </p>

                        <div className="tap-to-enter">
                            <span className="tap-icon">
                                ↓
                            </span>

                            <span>
                                TAP TO ENTER
                            </span>
                        </div>

                    </div>

                    <div className="intro-bottom-line"></div>

                </div>
            )}

            {/* =====================================================
                ROLE SELECTION
            ===================================================== */}

            {!showIntro && (
                <div className="campus-frame">

                    {/* BACKGROUND IMAGE */}

                    <img
                        src="/campus-role-selection-4roles.png"
                        alt="CampusSphere Role Selection"
                        className="role-background"
                    />

                    {/* =================================================
                        CLICKABLE BUTTON LAYER
                    ================================================= */}

                    <div className="click-layer">

                        {/* STUDENT LOGIN */}

                        <button
                            type="button"
                            className="role-click student-login-click"
                            onClick={handleStudentLogin}
                            aria-label="Student Login"
                        >
                            <span></span>
                        </button>


                        {/* STUDENT REGISTER */}

                        <button
                            type="button"
                            className="role-click register-click"
                            onClick={handleRegister}
                            aria-label="Student Register"
                        >
                            <span></span>
                        </button>


                        {/* FACULTY LOGIN */}

                        <button
                            type="button"
                            className="role-click faculty-login-click"
                            onClick={handleFacultyLogin}
                            aria-label="Faculty Login"
                        >
                            <span></span>
                        </button>


                        {/* MENTOR LOGIN */}

                        <button
                            type="button"
                            className="role-click mentor-login-click"
                            onClick={handleMentorLogin}
                            aria-label="Mentor Login"
                        >
                            <span></span>
                        </button>


                        {/* ADMIN LOGIN */}

                        <button
                            type="button"
                            className="role-click admin-login-click"
                            onClick={handleAdminLogin}
                            aria-label="Admin Login"
                        >
                            <span></span>
                        </button>

                    </div>

                </div>
            )}

        </div>
    );
}

export default RoleSelection;