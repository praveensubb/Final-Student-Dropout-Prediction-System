import React, { useState } from "react";



import { useNavigate } from "react-router-dom";







import api from "../services/api";



import "../styles/login.css";







import CampusLogo from "../components/CampusLogo";







function StudentLogin() {







    const navigate = useNavigate();







    const [email, setEmail] = useState("");



    const [password, setPassword] = useState("");



    const [error, setError] = useState("");



    const [loading, setLoading] = useState(false);



    const [showPassword, setShowPassword] = useState(false);











    // =====================================================



    // STUDENT LOGIN



    // =====================================================







    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await api.post(
                "/auth/student-login",
                null,
                {
                    params: {
                        email: email.trim(),
                        password: password,
                    },
                }
            );

            console.log("LOGIN RESPONSE:", response.data);

            const token =
                response.data?.access_token ||
                response.data?.token ||
                response.data?.studentToken;

            const studentId =
                response.data?.student_id ??
                response.data?.id ??
                response.data?.studentId;

            const studentName =
                response.data?.name ||
                response.data?.student_name ||
                response.data?.studentName ||
                email.trim();

            if (!token) {
                console.error(
                    "No student authentication token received:",
                    response.data
                );

                setError(
                    "Login succeeded, but authentication token was not received."
                );
                return;
            }

            // Save authentication information BEFORE navigating.
            localStorage.setItem("studentToken", String(token));

            if (studentId !== undefined && studentId !== null) {
                localStorage.setItem("studentId", String(studentId));
            } else {
                localStorage.removeItem("studentId");
            }

            localStorage.setItem("studentName", String(studentName));

            console.log(
                "Student token saved:",
                localStorage.getItem("studentToken")
            );
            console.log("Student ID:", localStorage.getItem("studentId"));
            console.log("Going to student dashboard...");

            // Navigate only after the token has been stored.
            window.location.replace("/dashboard");
        } catch (err) {
            console.error("STUDENT LOGIN ERROR:", err);

            const backendMessage =
                err.response?.data?.detail ||
                err.response?.data?.message ||
                err.response?.data?.error;

            setError(
                backendMessage ||
                "Login failed. Please check your email and password."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAccount = () => {







        navigate("/register");







    };











    // =====================================================



    // ADMIN LOGIN



    // =====================================================







    const handleAdminLogin = () => {







        navigate("/admin-login");







    };











    // =====================================================



    // HOME



    // =====================================================







    const handleHome = () => {







        navigate("/");







    };











    return (







        <div className="student-login-page">











            {/* =================================================



                DECORATIVE BACKGROUND



            ================================================= */}







            <div className="student-bg-circle student-bg-one"></div>







            <div className="student-bg-circle student-bg-two"></div>







            <div className="student-bg-grid"></div>











            {/* =================================================



                TOP BRAND BAR



            ================================================= */}







            <header className="student-top-bar">







                <button



                    className="student-logo-button"



                    onClick={handleHome}



                    type="button"



                >







                    <CampusLogo compact />







                </button>











                <div className="student-top-right">







                    <span>



                        SMART CAMPUS



                    </span>







                    <span>



                        •



                    </span>







                    <span>



                        BRIGHTER FUTURES



                    </span>







                </div>







            </header>











            {/* =================================================



                MAIN CONTENT



            ================================================= */}







            <main className="student-login-container">











                {/* =================================================



                    LEFT STUDENT PANEL



                ================================================= */}







                <section className="student-welcome-panel">











                    {/* Campus Logo */}







                    <div className="student-panel-logo">







                        <CampusLogo />







                    </div>











                    {/* Badge */}







                    <div className="student-portal-badge">







                        <span className="student-badge-dot"></span>







                        STUDENT PORTAL







                    </div>











                    {/* Main heading */}







                    <h1>







                        Your Journey.







                        <br />







                        <span>



                            Your Future.



                        </span>







                    </h1>











                    <p className="student-welcome-text">







                        Stay connected with your academic journey,



                        monitor your progress and get the right



                        support when you need it.







                    </p>











                    {/* =================================================



                        STUDENT ILLUSTRATION



                    ================================================= */}







                    <div className="student-illustration">











                        <div className="illustration-glow"></div>











                        <div className="student-avatar">







                            <div className="avatar-hair"></div>







                            <div className="avatar-face">







                                <span className="avatar-eye left"></span>







                                <span className="avatar-eye right"></span>







                                <span className="avatar-mouth"></span>







                            </div>







                            <div className="avatar-body">







                                <div className="avatar-shirt"></div>







                            </div>







                            <div className="avatar-book">







                                📚







                            </div>







                        </div>











                        {/* Floating elements */}







                        <div className="floating-card floating-card-one">







                            <span>



                                📊



                            </span>







                            <div>







                                <strong>



                                    Progress



                                </strong>







                                <small>



                                    Track your growth



                                </small>







                            </div>







                        </div>











                        <div className="floating-card floating-card-two">







                            <span>



                                🎯



                            </span>







                            <div>







                                <strong>



                                    Goals



                                </strong>







                                <small>



                                    Stay focused



                                </small>







                            </div>







                        </div>











                        <div className="floating-card floating-card-three">







                            <span>



                                💡



                            </span>







                        </div>







                    </div>











                    {/* =================================================



                        FEATURES



                    ================================================= */}







                    <div className="student-feature-row">











                        <div className="student-feature">







                            <div className="student-feature-icon blue">



                                📈



                            </div>







                            <div>







                                <strong>



                                    Academic Progress



                                </strong>







                                <small>



                                    Monitor performance



                                </small>







                            </div>







                        </div>











                        <div className="student-feature">







                            <div className="student-feature-icon green">



                                💬



                            </div>







                            <div>







                                <strong>



                                    Counselling



                                </strong>







                                <small>



                                    Get personalized support



                                </small>







                            </div>







                        </div>











                    </div>







                </section>











                {/* =================================================



                    LOGIN SECTION



                ================================================= */}







                <section className="student-login-section">











                    <div className="student-login-card">











                        {/* Small logo */}







                        <div className="student-card-logo">







                            <CampusLogo compact />







                        </div>











                        {/* Heading */}







                        <div className="student-login-heading">







                            <div className="student-welcome-label">







                                WELCOME BACK







                            </div>











                            <h2>



                                Student Login



                            </h2>











                            <p>







                                Sign in to continue your academic journey.







                            </p>







                        </div>











                        {/* =================================================



                            ERROR



                        ================================================= */}







                        {error && (







                            <div className="student-login-error">







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







                        <form



                            className="student-login-form"



                            onSubmit={handleLogin}



                        >











                            {/* EMAIL */}







                            <div className="student-form-group">







                                <label htmlFor="email">



                                    Email Address



                                </label>











                                <div className="student-input-wrapper">







                                    <span className="student-input-icon">



                                        ✉



                                    </span>











                                    <input



                                        id="email"



                                        type="email"



                                        value={email}



                                        onChange={(e) =>



                                            setEmail(e.target.value)



                                        }



                                        placeholder="student\@gmail.com"



                                        autoComplete="email"



                                        required



                                    />







                                </div>







                            </div>











                            {/* PASSWORD */}







                            <div className="student-form-group">







                                <div className="student-password-label">







                                    <label htmlFor="password">



                                        Password



                                    </label>







                                </div>











                                <div className="student-input-wrapper">







                                    <span className="student-input-icon">



                                        🔒



                                    </span>











                                    <input



                                        id="password"



                                        type={



                                            showPassword



                                                ? "text"



                                                : "password"



                                        }



                                        value={password}



                                        onChange={(e) =>



                                            setPassword(e.target.value)



                                        }



                                        placeholder="Enter your password"



                                        autoComplete="current-password"



                                        required



                                    />











                                    <button



                                        type="button"



                                        className="student-password-toggle"



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











                            {/* LOGIN */}







                            <button



                                className="student-login-button"



                                type="submit"



                                disabled={loading}



                            >







                                {loading ? (







                                    <>







                                        <span className="student-spinner"></span>







                                        Logging in...







                                    </>







                                ) : (







                                    <>







                                        <span>



                                            Login to Student Portal



                                        </span>







                                        <span className="student-login-arrow">



                                            →



                                        </span>







                                    </>







                                )}







                            </button>







                        </form>











                        {/* =================================================



                            CREATE ACCOUNT



                        ================================================= */}







                        <div className="student-register-section">







                            <span>



                                Don't have an account?



                            </span>











                            <button



                                type="button"



                                onClick={handleCreateAccount}



                            >



                                Create Account



                            </button>







                        </div>











                        {/* =================================================



                            BACK HOME



                        ================================================= */}







                        <button



                            type="button"



                            className="student-home-button"



                            onClick={handleHome}



                        >







                            <span>



                                ←



                            </span>







                            Back to Home







                        </button>











                        {/* =================================================



                            SECURITY



                        ================================================= */}







                        <div className="student-security">







                            <span>



                                🔒



                            </span>







                            Secure Student Access







                        </div>











                    </div>







                </section>







            </main>











            {/* =================================================



                BOTTOM FOOTER



            ================================================= */}







            <footer className="student-login-footer">







                <span>



                    AI-Powered Student Success



                </span>







                <span className="footer-dot">



                    •



                </span>







                <span>



                    One Campus. One Connected Platform.



                </span>







            </footer>











            {/* Keep Admin Login accessible */}







            <button



                type="button"



                className="student-admin-access"



                onClick={handleAdminLogin}



            >



                Admin Login



            </button>







        </div>



    );



}







export default StudentLogin;