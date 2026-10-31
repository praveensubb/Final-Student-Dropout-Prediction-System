import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MentorLogin.css";

const API_URL = "http://127.0.0.1:8000";

function MentorLogin() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        if (!password.trim()) {
            setError("Please enter your password.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/auth/mentor-login?email=${encodeURIComponent(
                    email.trim()
                )}&password=${encodeURIComponent(password)}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Invalid mentor email or password."
                );
            }

            // Store real backend authentication information
            localStorage.setItem(
                "mentorToken",
                data.access_token
            );

            localStorage.setItem(
                "mentorEmail",
                data.email
            );

            localStorage.setItem(
                "mentorId",
                String(data.mentor_id)
            );

            localStorage.setItem(
                "mentorName",
                data.name
            );

            localStorage.setItem(
                "mentorDepartment",
                data.department || ""
            );

            // Go to Mentor Dashboard
            navigate("/mentor-dashboard");

        } catch (err) {
            setError(
                err.message ||
                "Unable to connect to the server."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate("/");
    };

    return (
        <div className="mentor-login-page">

            <div className="mentor-bg-circle circle-one"></div>
            <div className="mentor-bg-circle circle-two"></div>

            <div className="mentor-login-container">

                {/* LEFT SIDE */}
                <div className="mentor-login-left">

                    <div className="mentor-logo-circle">
                        👨‍💼
                    </div>

                    <h1>
                        Mentor
                        <span>Login</span>
                    </h1>

                    <p>
                        Monitor assigned students, track academic
                        progress, provide counselling and manage
                        student interventions.
                    </p>

                    <div className="mentor-feature-list">

                        <div className="mentor-feature">
                            <span>✓</span>
                            <p>Monitor assigned students</p>
                        </div>

                        <div className="mentor-feature">
                            <span>✓</span>
                            <p>Track academic progress</p>
                        </div>

                        <div className="mentor-feature">
                            <span>✓</span>
                            <p>Identify at-risk students</p>
                        </div>

                        <div className="mentor-feature">
                            <span>✓</span>
                            <p>
                                Track counselling and interventions
                            </p>
                        </div>

                    </div>
                </div>

                {/* LOGIN CARD */}
                <div className="mentor-login-card">

                    <button
                        type="button"
                        className="mentor-back-button"
                        onClick={handleBack}
                    >
                        ← Back
                    </button>

                    <div className="mentor-card-header">

                        <div className="mentor-icon">
                            👨‍💼
                        </div>

                        <h2>
                            Welcome Back
                        </h2>

                        <p>
                            Sign in to your Mentor account
                        </p>

                    </div>

                    <form onSubmit={handleLogin}>

                        {/* EMAIL */}
                        <div className="mentor-input-group">

                            <label htmlFor="mentor-email">
                                Email Address
                            </label>

                            <input
                                id="mentor-email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                disabled={loading}
                            />

                        </div>

                        {/* PASSWORD */}
                        <div className="mentor-input-group">

                            <label htmlFor="mentor-password">
                                Password
                            </label>

                            <input
                                id="mentor-password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                disabled={loading}
                            />

                        </div>

                        {/* ERROR */}
                        {error && (
                            <div className="mentor-error">
                                {error}
                            </div>
                        )}

                        {/* LOGIN BUTTON */}
                        <button
                            type="submit"
                            className="mentor-login-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Signing in..."
                                : "Login as Mentor"}

                            {!loading && (
                                <span>→</span>
                            )}
                        </button>

                    </form>

                    <div className="mentor-login-footer">
                        CampusSphere
                        <span>•</span>
                        Mentor Portal
                    </div>

                </div>

            </div>

        </div>
    );
}

export default MentorLogin;