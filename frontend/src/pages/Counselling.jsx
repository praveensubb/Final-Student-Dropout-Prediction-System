import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function Counselling() {
    const navigate = useNavigate();

    // =========================================================
    // LOGIN / FACULTY INFORMATION
    // =========================================================

    const storedFacultyId = localStorage.getItem("facultyId");
    const storedFacultyName =
        localStorage.getItem("facultyName") || "Faculty";

    const [facultyId, setFacultyId] = useState(
        storedFacultyId ? Number(storedFacultyId) : null
    );

    const [facultyName, setFacultyName] =
        useState(storedFacultyName);

    // =========================================================
    // DATA STATES
    // =========================================================

    const [students, setStudents] = useState([]);
    const [activities, setActivities] = useState([]);

    const [loadingStudents, setLoadingStudents] =
        useState(false);

    const [loadingActivities, setLoadingActivities] =
        useState(false);

    const [saving, setSaving] = useState(false);

    // =========================================================
    // FORM STATES
    // =========================================================

    const [selectedStudent, setSelectedStudent] =
        useState("");

    const [counsellingType, setCounsellingType] =
        useState("Academic");

    const [topic, setTopic] = useState("");

    const [notes, setNotes] = useState("");

    const [outcome, setOutcome] =
        useState("Needs Follow-up");

    const [followUpDate, setFollowUpDate] =
        useState("");

    // =========================================================
    // UI STATES
    // =========================================================

    const [successMessage, setSuccessMessage] =
        useState("");

    const [errorMessage, setErrorMessage] =
        useState("");

    const [searchTerm, setSearchTerm] =
        useState("");

    // =========================================================
    // LOAD FACULTY ID
    // =========================================================

    useEffect(() => {
        const id = localStorage.getItem("facultyId");

        if (id) {
            setFacultyId(Number(id));
        }

        const name =
            localStorage.getItem("facultyName");

        if (name) {
            setFacultyName(name);
        }
    }, []);

    // =========================================================
    // LOAD ASSIGNED STUDENTS
    // =========================================================

    const loadStudents = async () => {
        if (!facultyId) {
            return;
        }

        try {
            setLoadingStudents(true);
            setErrorMessage("");

            const response = await fetch(
                `${API_URL}/faculty/${facultyId}/students`
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to load assigned students"
                );
            }

            const data = await response.json();

            setStudents(Array.isArray(data) ? data : []);

        } catch (error) {
            console.error(error);

            setErrorMessage(
                error.message ||
                "Failed to load students"
            );

        } finally {
            setLoadingStudents(false);
        }
    };

    // =========================================================
    // LOAD COUNSELLING ACTIVITIES
    // =========================================================

    const loadActivities = async () => {
        if (!facultyId) {
            return;
        }

        try {
            setLoadingActivities(true);

            const response = await fetch(
                `${API_URL}/activities/faculty/${facultyId}`
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to load faculty activities"
                );
            }

            const data = await response.json();

            const counsellingActivities =
                Array.isArray(data)
                    ? data.filter(
                        (item) =>
                            String(
                                item.activity_type || ""
                            ).toLowerCase() ===
                            "counselling"
                    )
                    : [];

            setActivities(counsellingActivities);

        } catch (error) {
            console.error(error);

            setErrorMessage(
                error.message ||
                "Failed to load counselling records"
            );

        } finally {
            setLoadingActivities(false);
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        if (facultyId) {
            loadStudents();
            loadActivities();
        }
    }, [facultyId]);

    // =========================================================
    // SELECTED STUDENT OBJECT
    // =========================================================

    const selectedStudentData = useMemo(() => {
        return students.find(
            (student) =>
                String(student.id) ===
                String(selectedStudent)
        );
    }, [students, selectedStudent]);

    // =========================================================
    // FILTER STUDENTS
    // =========================================================

    const filteredStudents = useMemo(() => {
        const search =
            searchTerm.trim().toLowerCase();

        if (!search) {
            return students;
        }

        return students.filter((student) => {
            return (
                String(student.name || "")
                    .toLowerCase()
                    .includes(search) ||
                String(student.usn || "")
                    .toLowerCase()
                    .includes(search) ||
                String(student.email || "")
                    .toLowerCase()
                    .includes(search) ||
                String(student.section || "")
                    .toLowerCase()
                    .includes(search)
            );
        });
    }, [students, searchTerm]);

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (value) => {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // =========================================================
    // RESET FORM
    // =========================================================

    const resetForm = () => {
        setSelectedStudent("");
        setCounsellingType("Academic");
        setTopic("");
        setNotes("");
        setOutcome("Needs Follow-up");
        setFollowUpDate("");
    };

    // =========================================================
    // SAVE COUNSELLING
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSuccessMessage("");
        setErrorMessage("");

        if (!facultyId) {
            setErrorMessage(
                "Faculty login information was not found. Please login again."
            );
            return;
        }

        if (!selectedStudent) {
            setErrorMessage(
                "Please select a student."
            );
            return;
        }

        if (!topic.trim()) {
            setErrorMessage(
                "Please enter the counselling topic."
            );
            return;
        }

        if (!notes.trim()) {
            setErrorMessage(
                "Please enter counselling notes."
            );
            return;
        }

        try {
            setSaving(true);

            /*
             * Your existing backend endpoint:
             *
             * POST /activities/
             *
             * Required:
             * faculty_id
             * activity_type
             * activity_title
             *
             * Optional:
             * description
             * student_id
             * timetable_id
             */

            const description = [
                `Counselling Type: ${counsellingType}`,
                `Topic: ${topic.trim()}`,
                `Notes: ${notes.trim()}`,
                `Outcome: ${outcome}`,
                followUpDate
                    ? `Follow-up Date: ${followUpDate}`
                    : "Follow-up Date: Not scheduled",
            ].join("\n");

            const params = new URLSearchParams();

            params.append(
                "faculty_id",
                String(facultyId)
            );

            params.append(
                "activity_type",
                "Counselling"
            );

            params.append(
                "activity_title",
                `${counsellingType} Counselling`
            );

            params.append(
                "description",
                description
            );

            params.append(
                "student_id",
                String(selectedStudent)
            );

            const response = await fetch(
                `${API_URL}/activities/?${params.toString()}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    "Failed to save counselling"
                );
            }

            setSuccessMessage(
                "Counselling record saved successfully."
            );

            resetForm();

            await loadActivities();

        } catch (error) {
            console.error(error);

            setErrorMessage(
                error.message ||
                "Unable to save counselling record."
            );

        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // DELETE / NO DELETE
    // =========================================================
    // We intentionally do not provide delete here because
    // the current backend activity.py does not contain a
    // DELETE /activities endpoint.

    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {
        localStorage.removeItem("facultyToken");
        localStorage.removeItem("facultyId");
        localStorage.removeItem("facultyName");
        localStorage.removeItem("facultyEmail");
        localStorage.removeItem("facultyDepartment");

        navigate("/faculty-login");
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="counselling-page">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="counselling-sidebar">

                <div className="sidebar-brand">

                    <div className="brand-icon">
                        💬
                    </div>

                    <div>
                        <strong>AI Student</strong>
                        <span>Faculty Support</span>
                    </div>

                </div>

                <div className="sidebar-label">
                    FACULTY MENU
                </div>

                <button
                    className="sidebar-button"
                    onClick={() =>
                        navigate("/faculty-dashboard")
                    }
                >
                    🏠
                    <span>Dashboard</span>
                </button>

                <button
                    className="sidebar-button"
                    onClick={() =>
                        navigate("/faculty-dashboard")
                    }
                >
                    👨‍🎓
                    <span>My Students</span>
                </button>

                <button
                    className="sidebar-button"
                    onClick={() =>
                        navigate("/faculty-dashboard")
                    }
                >
                    📅
                    <span>Timetable</span>
                </button>

                <button
                    className="sidebar-button active"
                >
                    💬
                    <span>Counselling</span>
                </button>

                <button
                    className="sidebar-button"
                    onClick={() =>
                        navigate("/interventions")
                    }
                >
                    🎯
                    <span>Interventions</span>
                </button>

                <div className="sidebar-bottom">

                    <div className="faculty-user">

                        <div className="faculty-avatar">
                            {facultyName
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div>
                            <strong>
                                {facultyName}
                            </strong>

                            <span>
                                Faculty
                            </span>
                        </div>

                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        🚪 Logout
                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="counselling-main">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="page-header">

                    <div>
                        <div className="eyebrow">
                            STUDENT SUPPORT
                        </div>

                        <h1>
                            Counselling Center
                        </h1>

                        <p>
                            Record and track counselling
                            sessions for your assigned students.
                        </p>
                    </div>

                    <button
                        className="refresh-button"
                        onClick={() => {
                            loadStudents();
                            loadActivities();
                        }}
                    >
                        🔄 Refresh
                    </button>

                </header>


                {/* =================================================
                    MESSAGES
                ================================================= */}

                {successMessage && (
                    <div className="success-message">
                        <span>✅</span>

                        <div>
                            <strong>Success</strong>
                            <p>{successMessage}</p>
                        </div>

                        <button
                            onClick={() =>
                                setSuccessMessage("")
                            }
                        >
                            ×
                        </button>
                    </div>
                )}


                {errorMessage && (
                    <div className="error-message">
                        <span>⚠️</span>

                        <div>
                            <strong>Error</strong>
                            <p>{errorMessage}</p>
                        </div>

                        <button
                            onClick={() =>
                                setErrorMessage("")
                            }
                        >
                            ×
                        </button>
                    </div>
                )}


                {/* =================================================
                    SUMMARY
                ================================================= */}

                <section className="summary-grid">

                    <div className="summary-card">

                        <div className="summary-icon blue">
                            👨‍🎓
                        </div>

                        <div>
                            <span>
                                ASSIGNED STUDENTS
                            </span>

                            <strong>
                                {students.length}
                            </strong>
                        </div>

                    </div>


                    <div className="summary-card">

                        <div className="summary-icon purple">
                            💬
                        </div>

                        <div>
                            <span>
                                COUNSELLING SESSIONS
                            </span>

                            <strong>
                                {activities.length}
                            </strong>
                        </div>

                    </div>


                    <div className="summary-card">

                        <div className="summary-icon orange">
                            🔄
                        </div>

                        <div>
                            <span>
                                FOLLOW-UP REQUIRED
                            </span>

                            <strong>
                                {
                                    activities.filter(
                                        (item) =>
                                            String(
                                                item.description ||
                                                ""
                                            ).includes(
                                                "Needs Follow-up"
                                            )
                                    ).length
                                }
                            </strong>
                        </div>

                    </div>


                    <div className="summary-card">

                        <div className="summary-icon green">
                            👨‍🏫
                        </div>

                        <div>
                            <span>
                                FACULTY
                            </span>

                            <strong>
                                {facultyName}
                            </strong>
                        </div>

                    </div>

                </section>


                {/* =================================================
                    COUNSELLING FORM
                ================================================= */}

                <section className="content-grid">

                    <div className="form-card">

                        <div className="card-header">

                            <div>
                                <span>
                                    NEW SESSION
                                </span>

                                <h2>
                                    Record Counselling
                                </h2>
                            </div>

                            <div className="header-icon">
                                💬
                            </div>

                        </div>


                        <form onSubmit={handleSubmit}>

                            {/* Student */}

                            <div className="form-group">

                                <label>
                                    Select Student
                                    <span>*</span>
                                </label>

                                <select
                                    value={selectedStudent}
                                    onChange={(e) =>
                                        setSelectedStudent(
                                            e.target.value
                                        )
                                    }
                                    disabled={
                                        loadingStudents ||
                                        saving
                                    }
                                >
                                    <option value="">
                                        {loadingStudents
                                            ? "Loading students..."
                                            : "Select an assigned student"}
                                    </option>

                                    {filteredStudents.map(
                                        (student) => (
                                            <option
                                                key={student.id}
                                                value={student.id}
                                            >
                                                {student.usn} -{" "}
                                                {student.name}
                                            </option>
                                        )
                                    )}

                                </select>

                                <small>
                                    Only students assigned to
                                    you by the administrator
                                    are shown.
                                </small>

                            </div>


                            {/* Selected Student Info */}

                            {selectedStudentData && (
                                <div className="selected-student">

                                    <div className="selected-avatar">
                                        {String(
                                            selectedStudentData.name ||
                                            "S"
                                        )
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <div>

                                        <strong>
                                            {
                                                selectedStudentData.name
                                            }
                                        </strong>

                                        <span>
                                            {
                                                selectedStudentData.usn
                                            }
                                        </span>

                                        <small>
                                            Section{" "}
                                            {selectedStudentData.section ||
                                                "—"}{" "}
                                            • Semester{" "}
                                            {selectedStudentData.semester ||
                                                "—"}
                                        </small>

                                    </div>

                                </div>
                            )}


                            {/* Search Student */}

                            <div className="form-group">

                                <label>
                                    Search Assigned Students
                                </label>

                                <input
                                    type="text"
                                    placeholder="Search by name, USN or section..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            {/* Counselling Type */}

                            <div className="form-group">

                                <label>
                                    Counselling Type
                                    <span>*</span>
                                </label>

                                <select
                                    value={counsellingType}
                                    onChange={(e) =>
                                        setCounsellingType(
                                            e.target.value
                                        )
                                    }
                                    disabled={saving}
                                >
                                    <option value="Academic">
                                        Academic
                                    </option>

                                    <option value="Attendance">
                                        Attendance
                                    </option>

                                    <option value="Behaviour">
                                        Behaviour
                                    </option>

                                    <option value="Career">
                                        Career
                                    </option>

                                    <option value="Personal">
                                        Personal
                                    </option>

                                    <option value="Financial">
                                        Financial
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>

                                </select>

                            </div>


                            {/* Topic */}

                            <div className="form-group">

                                <label>
                                    Counselling Topic
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    placeholder="Example: Low attendance and academic performance"
                                    value={topic}
                                    onChange={(e) =>
                                        setTopic(
                                            e.target.value
                                        )
                                    }
                                    disabled={saving}
                                />

                            </div>


                            {/* Notes */}

                            <div className="form-group">

                                <label>
                                    Counselling Notes
                                    <span>*</span>
                                </label>

                                <textarea
                                    rows="5"
                                    placeholder="Enter the important points discussed during the counselling session..."
                                    value={notes}
                                    onChange={(e) =>
                                        setNotes(
                                            e.target.value
                                        )
                                    }
                                    disabled={saving}
                                />

                            </div>


                            {/* Outcome */}

                            <div className="form-group">

                                <label>
                                    Outcome
                                </label>

                                <select
                                    value={outcome}
                                    onChange={(e) =>
                                        setOutcome(
                                            e.target.value
                                        )
                                    }
                                    disabled={saving}
                                >
                                    <option value="Resolved">
                                        Resolved
                                    </option>

                                    <option value="Improving">
                                        Improving
                                    </option>

                                    <option value="Needs Follow-up">
                                        Needs Follow-up
                                    </option>

                                    <option value="Escalated">
                                        Escalated
                                    </option>

                                </select>

                            </div>


                            {/* Follow-up */}

                            <div className="form-group">

                                <label>
                                    Follow-up Date
                                </label>

                                <input
                                    type="date"
                                    value={followUpDate}
                                    onChange={(e) =>
                                        setFollowUpDate(
                                            e.target.value
                                        )
                                    }
                                    disabled={saving}
                                />

                            </div>


                            {/* Buttons */}

                            <div className="form-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={resetForm}
                                    disabled={saving}
                                >
                                    Clear
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : "💾 Save Counselling"}
                                </button>

                            </div>

                        </form>

                    </div>


                    {/* =================================================
                        STUDENT INFORMATION
                    ================================================= */}

                    <div className="student-info-card">

                        <div className="card-header">

                            <div>
                                <span>
                                    STUDENT INFORMATION
                                </span>

                                <h2>
                                    Selected Student
                                </h2>
                            </div>

                            <div className="header-icon">
                                👨‍🎓
                            </div>

                        </div>


                        {selectedStudentData ? (

                            <div className="student-details">

                                <div className="big-student-avatar">
                                    {String(
                                        selectedStudentData.name ||
                                        "S"
                                    )
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <h3>
                                    {
                                        selectedStudentData.name
                                    }
                                </h3>

                                <p className="student-usn">
                                    {
                                        selectedStudentData.usn
                                    }
                                </p>


                                <div className="details-grid">

                                    <div>
                                        <span>
                                            Email
                                        </span>

                                        <strong>
                                            {
                                                selectedStudentData.email ||
                                                "—"
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Section
                                        </span>

                                        <strong>
                                            {
                                                selectedStudentData.section ||
                                                "—"
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Semester
                                        </span>

                                        <strong>
                                            {
                                                selectedStudentData.semester ||
                                                "—"
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Branch
                                        </span>

                                        <strong>
                                            {
                                                selectedStudentData.branch ||
                                                "—"
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            CGPA
                                        </span>

                                        <strong>
                                            {
                                                selectedStudentData.cgpa ??
                                                "—"
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Attendance
                                        </span>

                                        <strong>
                                            {
                                                selectedStudentData.attendance !=
                                                null
                                                    ? `${selectedStudentData.attendance}%`
                                                    : "—"
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Backlogs
                                        </span>

                                        <strong>
                                            {
                                                selectedStudentData.backlogs ??
                                                "—"
                                            }
                                        </strong>
                                    </div>

                                </div>


                                <button
                                    className="view-student-button"
                                    onClick={() =>
                                        navigate(
                                            `/faculty/student/${selectedStudentData.id}`
                                        )
                                    }
                                >
                                    View Full Student Details →
                                </button>

                            </div>

                        ) : (

                            <div className="no-student-selected">

                                <div>
                                    👨‍🎓
                                </div>

                                <h3>
                                    No Student Selected
                                </h3>

                                <p>
                                    Select an assigned student
                                    from the counselling form
                                    to view their details.
                                </p>

                            </div>

                        )}

                    </div>

                </section>


                {/* =================================================
                    COUNSELLING HISTORY
                ================================================= */}

                <section className="history-card">

                    <div className="card-header">

                        <div>
                            <span>
                                COUNSELLING HISTORY
                            </span>

                            <h2>
                                Previous Sessions
                            </h2>
                        </div>

                        <span className="record-count">
                            {activities.length} Records
                        </span>

                    </div>


                    {loadingActivities ? (

                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>
                                Loading counselling history...
                            </p>
                        </div>

                    ) : activities.length === 0 ? (

                        <div className="empty-history">

                            <div>
                                📭
                            </div>

                            <h3>
                                No Counselling Records
                            </h3>

                            <p>
                                Counselling sessions recorded
                                by you will appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="history-table-wrapper">

                            <table className="history-table">

                                <thead>

                                    <tr>
                                        <th>
                                            Student
                                        </th>

                                        <th>
                                            Counselling
                                        </th>

                                        <th>
                                            Description
                                        </th>

                                        <th>
                                            Date
                                        </th>
                                    </tr>

                                </thead>


                                <tbody>

                                    {activities.map(
                                        (activity) => {

                                            const student =
                                                students.find(
                                                    (item) =>
                                                        Number(
                                                            item.id
                                                        ) ===
                                                        Number(
                                                            activity.student_id
                                                        )
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        activity.id
                                                    }
                                                >

                                                    <td>

                                                        <div className="history-student">

                                                            <div className="mini-avatar">
                                                                {String(
                                                                    activity.student_name ||
                                                                    student?.name ||
                                                                    "S"
                                                                )
                                                                    .charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div>

                                                                <strong>
                                                                    {
                                                                        activity.student_name ||
                                                                        student?.name ||
                                                                        "Student"
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        activity.student_usn ||
                                                                        student?.usn ||
                                                                        "—"
                                                                    }
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <div className="history-type">

                                                            <strong>
                                                                {
                                                                    activity.activity_title ||
                                                                    "Counselling"
                                                                }
                                                            </strong>

                                                            <span>
                                                                Counselling
                                                            </span>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <div className="history-description">

                                                            {
                                                                activity.description ||
                                                                "No description"
                                                            }

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <span className="history-date">
                                                            {
                                                                formatDate(
                                                                    activity.created_at
                                                                )
                                                            }
                                                        </span>

                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>


                {/* =================================================
                    INFORMATION NOTE
                ================================================= */}

                <div className="info-note">

                    <span>
                        ℹ️
                    </span>

                    <p>
                        Counselling records are automatically
                        stored as faculty activities. The
                        administrator can view these records
                        from the Faculty Activities monitoring
                        page.
                    </p>

                </div>

            </main>


            {/* =================================================
                PAGE CSS
            ================================================= */}

            <style>{`

                * {
                    box-sizing: border-box;
                }

                .counselling-page {
                    min-height: 100vh;
                    background: #f5f7fb;
                    color: #1f2937;
                    display: flex;
                    font-family: Arial, Helvetica, sans-serif;
                }


                /* ================= SIDEBAR ================= */

                .counselling-sidebar {
                    width: 250px;
                    min-height: 100vh;
                    background: #111827;
                    color: white;
                    padding: 22px 15px;
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    left: 0;
                    top: 0;
                    bottom: 0;
                }

                .sidebar-brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px;
                    margin-bottom: 28px;
                }

                .brand-icon {
                    width: 42px;
                    height: 42px;
                    border-radius: 12px;
                    background: #4f46e5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                }

                .sidebar-brand strong {
                    display: block;
                    font-size: 15px;
                }

                .sidebar-brand span {
                    display: block;
                    color: #9ca3af;
                    font-size: 11px;
                    margin-top: 3px;
                }

                .sidebar-label {
                    color: #6b7280;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    padding: 0 12px;
                    margin-bottom: 8px;
                }

                .sidebar-button {
                    width: 100%;
                    border: none;
                    background: transparent;
                    color: #d1d5db;
                    padding: 12px;
                    border-radius: 9px;
                    margin-bottom: 5px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    text-align: left;
                    cursor: pointer;
                    font-size: 14px;
                }

                .sidebar-button:hover {
                    background: #1f2937;
                    color: white;
                }

                .sidebar-button.active {
                    background: #4f46e5;
                    color: white;
                }

                .sidebar-bottom {
                    margin-top: auto;
                    border-top: 1px solid #374151;
                    padding-top: 18px;
                }

                .faculty-user {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 14px;
                    padding: 0 5px;
                }

                .faculty-avatar {
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    background: #4f46e5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                }

                .faculty-user strong {
                    display: block;
                    font-size: 13px;
                }

                .faculty-user span {
                    display: block;
                    color: #9ca3af;
                    font-size: 11px;
                    margin-top: 3px;
                }

                .logout-button {
                    width: 100%;
                    border: none;
                    background: #1f2937;
                    color: #d1d5db;
                    border-radius: 8px;
                    padding: 10px;
                    cursor: pointer;
                }

                .logout-button:hover {
                    background: #374151;
                    color: white;
                }


                /* ================= MAIN ================= */

                .counselling-main {
                    margin-left: 250px;
                    width: calc(100% - 250px);
                    padding: 30px;
                }

                .page-header {
                    background: white;
                    padding: 24px 26px;
                    border-radius: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                    margin-bottom: 22px;
                }

                .eyebrow {
                    color: #4f46e5;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    margin-bottom: 7px;
                }

                .page-header h1 {
                    margin: 0;
                    font-size: 27px;
                }

                .page-header p {
                    margin: 7px 0 0;
                    color: #6b7280;
                    font-size: 14px;
                }

                .refresh-button {
                    border: none;
                    background: #2563eb;
                    color: white;
                    padding: 11px 17px;
                    border-radius: 9px;
                    cursor: pointer;
                    font-weight: 600;
                }

                .refresh-button:hover {
                    background: #1d4ed8;
                }


                /* ================= MESSAGES ================= */

                .success-message,
                .error-message {
                    padding: 14px 17px;
                    border-radius: 11px;
                    margin-bottom: 18px;
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                }

                .success-message {
                    background: #ecfdf5;
                    border: 1px solid #a7f3d0;
                    color: #065f46;
                }

                .error-message {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #991b1b;
                }

                .success-message div,
                .error-message div {
                    flex: 1;
                }

                .success-message p,
                .error-message p {
                    margin: 4px 0 0;
                    font-size: 13px;
                }

                .success-message button,
                .error-message button {
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    font-size: 18px;
                }


                /* ================= SUMMARY ================= */

                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 22px;
                }

                .summary-card {
                    background: white;
                    padding: 19px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    gap: 13px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
                }

                .summary-icon {
                    width: 46px;
                    height: 46px;
                    border-radius: 11px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 21px;
                }

                .summary-icon.blue {
                    background: #eff6ff;
                }

                .summary-icon.purple {
                    background: #f5f3ff;
                }

                .summary-icon.orange {
                    background: #fff7ed;
                }

                .summary-icon.green {
                    background: #ecfdf5;
                }

                .summary-card span {
                    display: block;
                    color: #6b7280;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.4px;
                }

                .summary-card strong {
                    display: block;
                    margin-top: 5px;
                    font-size: 21px;
                }


                /* ================= CONTENT GRID ================= */

                .content-grid {
                    display: grid;
                    grid-template-columns: minmax(0, 1.4fr) minmax(300px, 0.8fr);
                    gap: 20px;
                    margin-bottom: 22px;
                }

                .form-card,
                .student-info-card,
                .history-card {
                    background: white;
                    border-radius: 16px;
                    padding: 23px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 22px;
                }

                .card-header span:first-child {
                    color: #6b7280;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.8px;
                }

                .card-header h2 {
                    margin: 5px 0 0;
                    font-size: 20px;
                }

                .header-icon {
                    width: 43px;
                    height: 43px;
                    border-radius: 11px;
                    background: #eef2ff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                }


                /* ================= FORM ================= */

                .form-group {
                    margin-bottom: 17px;
                }

                .form-group label {
                    display: block;
                    font-size: 13px;
                    font-weight: 600;
                    margin-bottom: 7px;
                    color: #374151;
                }

                .form-group label span {
                    color: #dc2626;
                    margin-left: 3px;
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    border: 1px solid #d1d5db;
                    border-radius: 9px;
                    padding: 11px 12px;
                    font-size: 14px;
                    outline: none;
                    background: white;
                    font-family: inherit;
                }

                .form-group textarea {
                    resize: vertical;
                    line-height: 1.5;
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .form-group input:disabled,
                .form-group select:disabled,
                .form-group textarea:disabled {
                    background: #f3f4f6;
                    cursor: not-allowed;
                }

                .form-group small {
                    display: block;
                    color: #6b7280;
                    margin-top: 6px;
                    font-size: 11px;
                }

                .selected-student {
                    background: #f5f7ff;
                    border: 1px solid #e0e7ff;
                    border-radius: 11px;
                    padding: 13px;
                    display: flex;
                    align-items: center;
                    gap: 11px;
                    margin-bottom: 17px;
                }

                .selected-avatar {
                    width: 42px;
                    height: 42px;
                    min-width: 42px;
                    border-radius: 50%;
                    background: #4f46e5;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                }

                .selected-student strong {
                    display: block;
                    font-size: 14px;
                }

                .selected-student span {
                    display: block;
                    color: #4f46e5;
                    font-size: 12px;
                    margin-top: 2px;
                }

                .selected-student small {
                    display: block;
                    color: #6b7280;
                    margin-top: 3px;
                    font-size: 11px;
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 22px;
                    padding-top: 18px;
                    border-top: 1px solid #eef0f3;
                }

                .primary-button,
                .secondary-button {
                    border: none;
                    border-radius: 9px;
                    padding: 11px 18px;
                    cursor: pointer;
                    font-weight: 600;
                }

                .primary-button {
                    background: #4f46e5;
                    color: white;
                }

                .primary-button:hover {
                    background: #4338ca;
                }

                .primary-button:disabled,
                .secondary-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .secondary-button {
                    background: #f3f4f6;
                    color: #374151;
                }


                /* ================= STUDENT INFO ================= */

                .student-details {
                    text-align: center;
                }

                .big-student-avatar {
                    width: 75px;
                    height: 75px;
                    border-radius: 50%;
                    background: #eef2ff;
                    color: #4f46e5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    font-weight: 700;
                    margin: 5px auto 12px;
                }

                .student-details h3 {
                    margin: 0;
                    font-size: 19px;
                }

                .student-usn {
                    color: #4f46e5;
                    margin: 5px 0 20px;
                    font-size: 13px;
                    font-weight: 600;
                }

                .details-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    text-align: left;
                }

                .details-grid div {
                    background: #f8fafc;
                    border-radius: 9px;
                    padding: 10px;
                }

                .details-grid span {
                    display: block;
                    color: #6b7280;
                    font-size: 10px;
                    margin-bottom: 4px;
                }

                .details-grid strong {
                    display: block;
                    font-size: 12px;
                    word-break: break-word;
                }

                .view-student-button {
                    width: 100%;
                    margin-top: 17px;
                    border: 1px solid #c7d2fe;
                    background: #eef2ff;
                    color: #3730a3;
                    border-radius: 9px;
                    padding: 10px;
                    cursor: pointer;
                    font-weight: 600;
                }

                .no-student-selected {
                    text-align: center;
                    padding: 45px 15px;
                    color: #6b7280;
                }

                .no-student-selected > div {
                    font-size: 45px;
                    margin-bottom: 10px;
                }

                .no-student-selected h3 {
                    color: #374151;
                    margin: 0 0 7px;
                }

                .no-student-selected p {
                    font-size: 13px;
                    line-height: 1.5;
                    margin: 0;
                }


                /* ================= HISTORY ================= */

                .history-card {
                    margin-bottom: 20px;
                }

                .record-count {
                    background: #eef2ff;
                    color: #3730a3;
                    padding: 7px 11px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 600;
                }

                .history-table-wrapper {
                    overflow-x: auto;
                }

                .history-table {
                    width: 100%;
                    border-collapse: collapse;
                    min-width: 850px;
                }

                .history-table th {
                    text-align: left;
                    background: #f8fafc;
                    color: #64748b;
                    font-size: 11px;
                    text-transform: uppercase;
                    padding: 13px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .history-table td {
                    padding: 14px 13px;
                    border-bottom: 1px solid #eef0f3;
                    vertical-align: middle;
                    font-size: 13px;
                }

                .history-student {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                }

                .mini-avatar {
                    width: 34px;
                    height: 34px;
                    min-width: 34px;
                    border-radius: 50%;
                    background: #eef2ff;
                    color: #4f46e5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                }

                .history-student strong {
                    display: block;
                }

                .history-student span {
                    display: block;
                    color: #6b7280;
                    font-size: 11px;
                    margin-top: 3px;
                }

                .history-type strong {
                    display: block;
                }

                .history-type span {
                    display: inline-block;
                    margin-top: 4px;
                    color: #6d28d9;
                    background: #f5f3ff;
                    border-radius: 5px;
                    padding: 3px 6px;
                    font-size: 10px;
                }

                .history-description {
                    max-width: 390px;
                    white-space: pre-line;
                    color: #4b5563;
                    line-height: 1.45;
                }

                .history-date {
                    color: #6b7280;
                    white-space: nowrap;
                    font-size: 12px;
                }

                .empty-history,
                .loading-state {
                    text-align: center;
                    padding: 55px 20px;
                }

                .empty-history > div {
                    font-size: 40px;
                }

                .empty-history h3 {
                    margin: 10px 0 6px;
                }

                .empty-history p {
                    margin: 0;
                    color: #6b7280;
                    font-size: 13px;
                }

                .spinner {
                    width: 34px;
                    height: 34px;
                    border: 4px solid #e5e7eb;
                    border-top-color: #4f46e5;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin: 0 auto 12px;
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }


                /* ================= NOTE ================= */

                .info-note {
                    background: #eff6ff;
                    border: 1px solid #bfdbfe;
                    color: #1e40af;
                    border-radius: 11px;
                    padding: 13px 16px;
                    display: flex;
                    gap: 10px;
                    align-items: flex-start;
                    font-size: 12px;
                    line-height: 1.5;
                }

                .info-note p {
                    margin: 0;
                }


                /* ================= RESPONSIVE ================= */

                @media (max-width: 1100px) {

                    .summary-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .content-grid {
                        grid-template-columns: 1fr;
                    }
                }


                @media (max-width: 800px) {

                    .counselling-sidebar {
                        width: 210px;
                    }

                    .counselling-main {
                        margin-left: 210px;
                        width: calc(100% - 210px);
                        padding: 20px;
                    }

                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                }


                @media (max-width: 600px) {

                    .counselling-page {
                        display: block;
                    }

                    .counselling-sidebar {
                        position: relative;
                        width: 100%;
                        min-height: auto;
                    }

                    .counselling-main {
                        margin-left: 0;
                        width: 100%;
                        padding: 15px;
                    }

                    .summary-grid {
                        grid-template-columns: 1fr;
                    }

                    .details-grid {
                        grid-template-columns: 1fr;
                    }

                    .form-actions {
                        flex-direction: column;
                    }

                    .primary-button,
                    .secondary-button {
                        width: 100%;
                    }
                }

            `}</style>

        </div>
    );
}

export default Counselling;