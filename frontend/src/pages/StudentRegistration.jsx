import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import "../styles/studentRegistration.css";


function StudentRegistration() {

    const navigate = useNavigate();


    // =====================================================
    // FORM DATA
    // =====================================================

    const [formData, setFormData] = useState({

        usn: "",
        name: "",
        email: "",
        password: "",

        branch: "CSE",
        semester: "",
        section: "",

        cgpa: "",
        attendance: "",
        backlogs: "0",
        study_hours: "",

        // =================================================
        // PARENT DETAILS
        // =================================================

        parent_name: "",
        parent_mobile: ""

    });


    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    // =====================================================
    // HANDLE INPUT
    // =====================================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

    };


    // =====================================================
    // REGISTER STUDENT
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");


        // =================================================
        // VALIDATION
        // =================================================

        if (!formData.usn.trim()) {

            setError("Please enter your USN.");
            return;

        }


        if (!formData.name.trim()) {

            setError("Please enter your name.");
            return;

        }


        if (!formData.email.trim()) {

            setError("Please enter your email.");
            return;

        }


        if (formData.password.length < 6) {

            setError("Password must contain at least 6 characters.");
            return;

        }


        if (!formData.semester) {

            setError("Please select your semester.");
            return;

        }


        if (!formData.section) {

            setError("Please select your section.");
            return;

        }


        if (
            formData.cgpa === "" ||
            Number(formData.cgpa) < 0 ||
            Number(formData.cgpa) > 10
        ) {

            setError("CGPA must be between 0 and 10.");
            return;

        }


        if (
            formData.attendance === "" ||
            Number(formData.attendance) < 0 ||
            Number(formData.attendance) > 100
        ) {

            setError("Attendance must be between 0 and 100.");
            return;

        }


        if (
            formData.backlogs === "" ||
            Number(formData.backlogs) < 0
        ) {

            setError("Backlogs cannot be negative.");
            return;

        }


        if (
            formData.study_hours === "" ||
            Number(formData.study_hours) < 0 ||
            Number(formData.study_hours) > 24
        ) {

            setError("Study hours must be between 0 and 24.");
            return;

        }


        // =================================================
        // PARENT NAME VALIDATION
        // =================================================

        if (!formData.parent_name.trim()) {

            setError("Please enter the parent name.");
            return;

        }


        // =================================================
        // PARENT MOBILE VALIDATION
        // =================================================

        let parentMobile = formData.parent_mobile
            .trim()
            .replace(/\s+/g, "");


        // Remove +91 if entered

        if (parentMobile.startsWith("+91")) {

            parentMobile = parentMobile.substring(3);

        }

        // Remove 91 if entered as 12 digit number

        else if (
            parentMobile.startsWith("91") &&
            parentMobile.length === 12
        ) {

            parentMobile = parentMobile.substring(2);

        }


        if (
            !/^[6-9]\d{9}$/.test(parentMobile)
        ) {

            setError(
                "Please enter a valid 10-digit Indian parent mobile number."
            );

            return;

        }


        setLoading(true);


        // =================================================
        // SEND DATA TO BACKEND
        // =================================================

        try {

            await api.post("/students", {

                usn: formData.usn.trim(),

                name: formData.name.trim(),

                email: formData.email.trim(),

                password: formData.password,

                branch: formData.branch,

                semester: Number(formData.semester),

                // Section
                section: formData.section,

                cgpa: Number(formData.cgpa),

                attendance: Number(formData.attendance),

                backlogs: Number(formData.backlogs),

                study_hours: Number(formData.study_hours),

                // =================================================
                // PARENT DETAILS
                // =================================================

                parent_name: formData.parent_name.trim(),

                parent_mobile: parentMobile

            });


            // =================================================
            // SUCCESS
            // =================================================

            setMessage(
                "Registration successful! Redirecting to student login..."
            );


            // =================================================
            // CLEAR FORM
            // =================================================

            setFormData({

                usn: "",
                name: "",
                email: "",
                password: "",

                branch: "CSE",
                semester: "",
                section: "",

                cgpa: "",
                attendance: "",
                backlogs: "0",
                study_hours: "",

                parent_name: "",
                parent_mobile: ""

            });


            // =================================================
            // REDIRECT
            // =================================================

            setTimeout(() => {

                navigate("/student-login", {
                    replace: true
                });

            }, 1500);


        } catch (err) {

            console.error(
                "Registration error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Registration failed. Please try again."
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="login-page">

            <div className="registration-card">


                {/* BRAND */}

                <div className="login-brand">

                    <div className="login-brand-icon">
                        🎓
                    </div>

                    <span>
                        Student Dropout
                    </span>

                </div>


                {/* HEADER */}

                <div className="login-heading">

                    <h1>
                        Create Student Account
                    </h1>

                    <p>
                        Enter your academic details to create your student account.
                    </p>

                </div>


                {/* SUCCESS */}

                {message && (

                    <div className="login-success">
                        {message}
                    </div>

                )}


                {/* ERROR */}

                {error && (

                    <div className="login-error">
                        {error}
                    </div>

                )}


                {/* FORM */}

                <form
                    className="registration-form"
                    onSubmit={handleSubmit}
                >


                    {/* =========================================
                        USN + NAME
                    ========================================= */}

                    <div className="registration-row">

                        <div className="form-group">

                            <label htmlFor="usn">
                                USN
                            </label>

                            <input
                                id="usn"
                                type="text"
                                name="usn"
                                value={formData.usn}
                                onChange={handleChange}
                                placeholder="1EP22CS002"
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label htmlFor="name">
                                Full Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                required
                            />

                        </div>

                    </div>


                    {/* =========================================
                        EMAIL + PASSWORD
                    ========================================= */}

                    <div className="registration-row">

                        <div className="form-group">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="student@gmail.com"
                                autoComplete="email"
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Minimum 6 characters"
                                autoComplete="new-password"
                                required
                            />

                        </div>

                    </div>


                    {/* =========================================
                        BRANCH + SEMESTER
                    ========================================= */}

                    <div className="registration-row">

                        <div className="form-group">

                            <label htmlFor="branch">
                                Branch
                            </label>

                            <select
                                id="branch"
                                name="branch"
                                value={formData.branch}
                                onChange={handleChange}
                                required
                            >

                                <option value="CSE">
                                    CSE
                                </option>

                                <option value="ISE">
                                    ISE
                                </option>

                                <option value="ECE">
                                    ECE
                                </option>

                                <option value="EEE">
                                    EEE
                                </option>

                                <option value="ME">
                                    Mechanical
                                </option>

                                <option value="CIVIL">
                                    Civil
                                </option>

                            </select>

                        </div>


                        <div className="form-group">

                            <label htmlFor="semester">
                                Semester
                            </label>

                            <input
                                id="semester"
                                type="number"
                                name="semester"
                                min="1"
                                max="8"
                                value={formData.semester}
                                onChange={handleChange}
                                placeholder="7"
                                required
                            />

                        </div>

                    </div>


                    {/* =========================================
                        SECTION + CGPA
                    ========================================= */}

                    <div className="registration-row">

                        <div className="form-group">

                            <label htmlFor="section">
                                Section
                            </label>

                            <select
                                id="section"
                                name="section"
                                value={formData.section}
                                onChange={handleChange}
                                required
                            >

                                <option value="">
                                    Select Section
                                </option>

                                <option value="A">
                                    Section A
                                </option>

                                <option value="B">
                                    Section B
                                </option>

                                <option value="C">
                                    Section C
                                </option>

                            </select>

                        </div>


                        <div className="form-group">

                            <label htmlFor="cgpa">
                                CGPA
                            </label>

                            <input
                                id="cgpa"
                                type="number"
                                name="cgpa"
                                step="0.01"
                                min="0"
                                max="10"
                                value={formData.cgpa}
                                onChange={handleChange}
                                placeholder="8.25"
                                required
                            />

                        </div>

                    </div>


                    {/* =========================================
                        ATTENDANCE + BACKLOGS
                    ========================================= */}

                    <div className="registration-row">

                        <div className="form-group">

                            <label htmlFor="attendance">
                                Attendance (%)
                            </label>

                            <input
                                id="attendance"
                                type="number"
                                name="attendance"
                                step="0.01"
                                min="0"
                                max="100"
                                value={formData.attendance}
                                onChange={handleChange}
                                placeholder="85"
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label htmlFor="backlogs">
                                Backlogs
                            </label>

                            <input
                                id="backlogs"
                                type="number"
                                name="backlogs"
                                min="0"
                                value={formData.backlogs}
                                onChange={handleChange}
                                required
                            />

                        </div>

                    </div>


                    {/* =========================================
                        STUDY HOURS
                    ========================================= */}

                    <div className="registration-row">

                        <div className="form-group">

                            <label htmlFor="study_hours">
                                Study Hours / Day
                            </label>

                            <input
                                id="study_hours"
                                type="number"
                                name="study_hours"
                                step="0.5"
                                min="0"
                                max="24"
                                value={formData.study_hours}
                                onChange={handleChange}
                                placeholder="4"
                                required
                            />

                        </div>

                        <div className="form-group">
                        </div>

                    </div>


                    {/* =========================================
                        PARENT DETAILS
                    ========================================= */}

                    <div
                        style={{
                            marginTop: "10px",
                            marginBottom: "10px"
                        }}
                    >

                        <h3>
                            👨‍👩‍👦 Parent / Guardian Details
                        </h3>

                    </div>


                    <div className="registration-row">

                        {/* PARENT NAME */}

                        <div className="form-group">

                            <label htmlFor="parent_name">
                                Parent / Guardian Name
                            </label>

                            <input
                                id="parent_name"
                                type="text"
                                name="parent_name"
                                value={formData.parent_name}
                                onChange={handleChange}
                                placeholder="Enter parent name"
                                required
                            />

                        </div>


                        {/* PARENT MOBILE */}

                        <div className="form-group">

                            <label htmlFor="parent_mobile">
                                Parent Mobile Number
                            </label>

                            <input
                                id="parent_mobile"
                                type="tel"
                                name="parent_mobile"
                                value={formData.parent_mobile}
                                onChange={handleChange}
                                placeholder="9876543210"
                                maxLength="13"
                                required
                            />

                        </div>

                    </div>


                    {/* =========================================
                        CREATE ACCOUNT
                    ========================================= */}

                    <button
                        className="login-button"
                        type="submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Creating Account..."
                            : "Create Student Account"
                        }

                    </button>


                </form>


                {/* LOGIN LINK */}

                <div className="registration-login-link">

                    <span>
                        Already have an account?
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/student-login")
                        }
                    >
                        Student Login
                    </button>

                </div>


                {/* FOOTER */}

                <div className="login-footer">
                    Student Dropout Prediction System
                </div>


            </div>

        </div>

    );

}


export default StudentRegistration;