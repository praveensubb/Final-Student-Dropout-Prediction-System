import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FacultyAssignment.css";

const API_URL = "http://127.0.0.1:8000";

const FacultyAssignment = () => {
    const navigate = useNavigate();

    // =====================================================
    // DATA
    // =====================================================

    const [faculty, setFaculty] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [students, setStudents] = useState([]);

    // =====================================================
    // SELECTED FACULTY / MENTOR
    // =====================================================

    const [selectedFaculty, setSelectedFaculty] = useState("");
    const [selectedMentor, setSelectedMentor] = useState("");

    // =====================================================
    // STATUS
    // =====================================================

    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // =====================================================
    // LOAD FACULTY + MENTORS + STUDENTS
    // =====================================================

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                facultyResponse,
                facultyStudentsResponse,
                mentorsResponse,
                mentorStudentsResponse
            ] = await Promise.all([
                fetch(`${API_URL}/faculty-admin/faculty`),
                fetch(`${API_URL}/faculty-admin/students`),
                fetch(`${API_URL}/mentor-admin/mentors`),
                fetch(`${API_URL}/mentor-admin/students`)
            ]);

            if (!facultyResponse.ok) {
                throw new Error("Unable to load faculty data.");
            }

            if (!facultyStudentsResponse.ok) {
                throw new Error("Unable to load student data.");
            }

            if (!mentorsResponse.ok) {
                throw new Error("Unable to load mentor data.");
            }

            if (!mentorStudentsResponse.ok) {
                throw new Error(
                    "Unable to load mentor student data."
                );
            }

            const facultyData =
                await facultyResponse.json();

            const facultyStudentsData =
                await facultyStudentsResponse.json();

            const mentorsData =
                await mentorsResponse.json();

            const mentorStudentsData =
                await mentorStudentsResponse.json();

            // -------------------------------------------------
            // Create mentor lookup
            // -------------------------------------------------

            const mentorMap = {};

            mentorStudentsData.forEach((student) => {
                mentorMap[student.id] = {
                    mentor_id: student.mentor_id,
                    mentor_name: student.mentor_name
                };
            });

            // -------------------------------------------------
            // Combine faculty + mentor information
            // -------------------------------------------------

            const combinedStudents =
                facultyStudentsData.map((student) => ({
                    ...student,

                    mentor_id:
                        mentorMap[student.id]?.mentor_id ||
                        null,

                    mentor_name:
                        mentorMap[student.id]?.mentor_name ||
                        null
                }));

            setFaculty(facultyData);
            setMentors(mentorsData);
            setStudents(combinedStudents);

        } catch (err) {
            console.error(
                "Load assignment data error:",
                err
            );

            setError(
                err.message ||
                "Unable to connect to the backend."
            );

        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // LOAD DATA WHEN PAGE OPENS
    // =====================================================

    useEffect(() => {
        loadData();
    }, []);

    // =====================================================
    // ASSIGN STUDENT TO FACULTY
    // =====================================================

    const assignStudent = async (studentId) => {
        if (!selectedFaculty) {
            setError("Please select a faculty first.");
            setMessage("");
            return;
        }

        try {
            setAssigning(true);
            setMessage("");
            setError("");

            const response = await fetch(
                `${API_URL}/faculty-admin/assign?faculty_id=${selectedFaculty}&student_id=${studentId}`,
                {
                    method: "POST"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    "Faculty assignment failed."
                );
            }

            setMessage(
                data.message ||
                "Student assigned to faculty successfully."
            );

            await loadData();

        } catch (err) {
            console.error(
                "Faculty assignment error:",
                err
            );

            setError(
                err.message ||
                "Unable to assign student to faculty."
            );

        } finally {
            setAssigning(false);
        }
    };

    // =====================================================
    // REMOVE STUDENT FROM FACULTY
    // =====================================================

    const removeAssignment = async (studentId) => {
        const confirmRemove = window.confirm(
            "Are you sure you want to remove this student's faculty assignment?"
        );

        if (!confirmRemove) {
            return;
        }

        try {
            setMessage("");
            setError("");

            const response = await fetch(
                `${API_URL}/faculty-admin/assignment/${studentId}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    "Unable to remove faculty assignment."
                );
            }

            setMessage(
                data.message ||
                "Faculty assignment removed successfully."
            );

            await loadData();

        } catch (err) {
            console.error(
                "Remove faculty assignment error:",
                err
            );

            setError(
                err.message ||
                "Unable to remove faculty assignment."
            );
        }
    };

    // =====================================================
    // ASSIGN STUDENT TO MENTOR
    // =====================================================

    const assignMentor = async (studentId) => {
        if (!selectedMentor) {
            setError("Please select a mentor first.");
            setMessage("");
            return;
        }

        try {
            setAssigning(true);
            setMessage("");
            setError("");

            const response = await fetch(
                `${API_URL}/mentor-admin/assign?mentor_id=${selectedMentor}&student_id=${studentId}`,
                {
                    method: "POST"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    "Mentor assignment failed."
                );
            }

            setMessage(
                data.message ||
                "Student assigned to mentor successfully."
            );

            await loadData();

        } catch (err) {
            console.error(
                "Mentor assignment error:",
                err
            );

            setError(
                err.message ||
                "Unable to assign student to mentor."
            );

        } finally {
            setAssigning(false);
        }
    };

    // =====================================================
    // REMOVE STUDENT FROM MENTOR
    // =====================================================

    const removeMentorAssignment = async (studentId) => {
        const confirmRemove = window.confirm(
            "Are you sure you want to remove this student's mentor assignment?"
        );

        if (!confirmRemove) {
            return;
        }

        try {
            setMessage("");
            setError("");

            const response = await fetch(
                `${API_URL}/mentor-admin/assignment/${studentId}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    "Unable to remove mentor assignment."
                );
            }

            setMessage(
                data.message ||
                "Mentor assignment removed successfully."
            );

            await loadData();

        } catch (err) {
            console.error(
                "Remove mentor assignment error:",
                err
            );

            setError(
                err.message ||
                "Unable to remove mentor assignment."
            );
        }
    };

    // =====================================================
    // SELECTED FACULTY NAME
    // =====================================================

    const selectedFacultyName =
        faculty.find(
            (f) =>
                String(f.id) ===
                String(selectedFaculty)
        )?.name || "";

    // =====================================================
    // SELECTED MENTOR NAME
    // =====================================================

    const selectedMentorName =
        mentors.find(
            (m) =>
                String(m.id) ===
                String(selectedMentor)
        )?.name || "";

    // =====================================================
    // STUDENT COUNTS
    // =====================================================

    const totalStudents = students.length;

    const assignedFacultyStudents =
        students.filter(
            (student) => student.faculty_id
        ).length;

    const unassignedFacultyStudents =
        totalStudents -
        assignedFacultyStudents;

    const assignedMentorStudents =
        students.filter(
            (student) => student.mentor_id
        ).length;

    const unassignedMentorStudents =
        totalStudents -
        assignedMentorStudents;

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="faculty-assignment-page">
                <div className="assignment-loading">
                    <h2>
                        Loading assignments...
                    </h2>

                    <p>
                        Loading faculty, mentors and
                        students. Please wait.
                    </p>
                </div>
            </div>
        );
    }

    // =====================================================
    // PAGE
    // =====================================================

    return (
        <div className="faculty-assignment-page">

            <div className="assignment-container">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="assignment-header">

                    <div>
                        <h1>
                            Student Assignment
                        </h1>

                        <p>
                            Assign registered students to
                            Faculty and Mentors.
                        </p>
                    </div>

                    <button
                        className="back-button"
                        onClick={() =>
                            navigate("/admin")
                        }
                    >
                        ← Back to Admin
                    </button>

                </div>

                {/* =================================================
                    SUMMARY CARDS
                ================================================= */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(4, 1fr)",
                        gap: "20px",
                        marginBottom: "25px"
                    }}
                >

                    {/* TOTAL */}

                    <div
                        style={{
                            background: "white",
                            padding: "22px",
                            borderRadius: "12px",
                            boxShadow:
                                "0 3px 12px rgba(0,0,0,0.06)"
                        }}
                    >
                        <div
                            style={{
                                color: "#64748b",
                                fontSize: "14px",
                                fontWeight: "600"
                            }}
                        >
                            Total Students
                        </div>

                        <div
                            style={{
                                fontSize: "30px",
                                fontWeight: "700",
                                marginTop: "8px"
                            }}
                        >
                            {totalStudents}
                        </div>
                    </div>

                    {/* FACULTY ASSIGNED */}

                    <div
                        style={{
                            background: "white",
                            padding: "22px",
                            borderRadius: "12px",
                            boxShadow:
                                "0 3px 12px rgba(0,0,0,0.06)"
                        }}
                    >
                        <div
                            style={{
                                color: "#64748b",
                                fontSize: "14px",
                                fontWeight: "600"
                            }}
                        >
                            Faculty Assigned
                        </div>

                        <div
                            style={{
                                fontSize: "30px",
                                fontWeight: "700",
                                marginTop: "8px",
                                color: "#16a34a"
                            }}
                        >
                            {assignedFacultyStudents}
                        </div>
                    </div>

                    {/* MENTOR ASSIGNED */}

                    <div
                        style={{
                            background: "white",
                            padding: "22px",
                            borderRadius: "12px",
                            boxShadow:
                                "0 3px 12px rgba(0,0,0,0.06)"
                        }}
                    >
                        <div
                            style={{
                                color: "#64748b",
                                fontSize: "14px",
                                fontWeight: "600"
                            }}
                        >
                            Mentor Assigned
                        </div>

                        <div
                            style={{
                                fontSize: "30px",
                                fontWeight: "700",
                                marginTop: "8px",
                                color: "#7c3aed"
                            }}
                        >
                            {assignedMentorStudents}
                        </div>
                    </div>

                    {/* UNASSIGNED */}

                    <div
                        style={{
                            background: "white",
                            padding: "22px",
                            borderRadius: "12px",
                            boxShadow:
                                "0 3px 12px rgba(0,0,0,0.06)"
                        }}
                    >
                        <div
                            style={{
                                color: "#64748b",
                                fontSize: "14px",
                                fontWeight: "600"
                            }}
                        >
                            Mentor Unassigned
                        </div>

                        <div
                            style={{
                                fontSize: "30px",
                                fontWeight: "700",
                                marginTop: "8px",
                                color: "#dc2626"
                            }}
                        >
                            {unassignedMentorStudents}
                        </div>
                    </div>

                </div>

                {/* =================================================
                    SELECTORS
                ================================================= */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "1fr 1fr",
                        gap: "20px",
                        marginBottom: "20px"
                    }}
                >

                    {/* FACULTY SELECTOR */}

                    <div className="faculty-selector-card">

                        <label>
                            Select Faculty
                        </label>

                        <select
                            value={selectedFaculty}
                            onChange={(e) => {
                                setSelectedFaculty(
                                    e.target.value
                                );
                                setMessage("");
                                setError("");
                            }}
                        >

                            <option value="">
                                -- Select Faculty --
                            </option>

                            {faculty.map((f) => (
                                <option
                                    key={f.id}
                                    value={f.id}
                                >
                                    {f.name} - {f.email}
                                </option>
                            ))}

                        </select>

                        {selectedFaculty && (
                            <div className="selected-faculty">
                                Selected Faculty:{" "}
                                <strong>
                                    {selectedFacultyName}
                                </strong>
                            </div>
                        )}

                    </div>

                    {/* MENTOR SELECTOR */}

                    <div className="faculty-selector-card">

                        <label>
                            Select Mentor
                        </label>

                        <select
                            value={selectedMentor}
                            onChange={(e) => {
                                setSelectedMentor(
                                    e.target.value
                                );
                                setMessage("");
                                setError("");
                            }}
                        >

                            <option value="">
                                -- Select Mentor --
                            </option>

                            {mentors.map((mentor) => (
                                <option
                                    key={mentor.id}
                                    value={mentor.id}
                                >
                                    {mentor.name}
                                    {" - "}
                                    {mentor.department ||
                                        "Mentor"}
                                </option>
                            ))}

                        </select>

                        {selectedMentor && (
                            <div className="selected-faculty">
                                Selected Mentor:{" "}
                                <strong>
                                    {selectedMentorName}
                                </strong>
                            </div>
                        )}

                    </div>

                </div>

                {/* =================================================
                    MESSAGES
                ================================================= */}

                {message && (
                    <div className="success-message">
                        ✓ {message}
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        ⚠ {error}
                    </div>
                )}

                {/* =================================================
                    STUDENTS
                ================================================= */}

                <div className="students-card">

                    <div className="students-card-header">

                        <div>
                            <h2>
                                Registered Students
                            </h2>

                            <p>
                                Total Students:{" "}
                                {students.length}
                            </p>
                        </div>

                    </div>

                    <div className="table-wrapper">

                        <table>

                            <thead>

                                <tr>
                                    <th>ID</th>
                                    <th>USN</th>
                                    <th>Name</th>
                                    <th>Branch</th>
                                    <th>Semester</th>
                                    <th>Section</th>
                                    <th>CGPA</th>
                                    <th>Attendance</th>
                                    <th>Assigned Faculty</th>
                                    <th>Assigned Mentor</th>
                                    <th>Action</th>
                                </tr>

                            </thead>

                            <tbody>

                                {students.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="11"
                                            style={{
                                                textAlign:
                                                    "center",
                                                padding: "30px"
                                            }}
                                        >
                                            No registered
                                            students found.
                                        </td>
                                    </tr>

                                ) : (

                                    students.map((student) => (

                                        <tr
                                            key={student.id}
                                        >

                                            {/* ID */}

                                            <td>
                                                {student.id}
                                            </td>

                                            {/* USN */}

                                            <td>
                                                {student.usn}
                                            </td>

                                            {/* NAME */}

                                            <td className="student-name">
                                                {student.name}
                                            </td>

                                            {/* BRANCH */}

                                            <td>
                                                {student.branch ||
                                                    "-"}
                                            </td>

                                            {/* SEMESTER */}

                                            <td>
                                                {student.semester ||
                                                    "-"}
                                            </td>

                                            {/* SECTION */}

                                            <td>

                                                {student.section ? (

                                                    <span
                                                        style={{
                                                            display:
                                                                "inline-block",
                                                            padding:
                                                                "5px 10px",
                                                            borderRadius:
                                                                "6px",
                                                            background:
                                                                "#dbeafe",
                                                            color:
                                                                "#1d4ed8",
                                                            fontWeight:
                                                                "600"
                                                        }}
                                                    >
                                                        Section{" "}
                                                        {student.section}
                                                    </span>

                                                ) : (

                                                    <span>
                                                        Not Provided
                                                    </span>

                                                )}

                                            </td>

                                            {/* CGPA */}

                                            <td>
                                                {student.cgpa ??
                                                    "-"}
                                            </td>

                                            {/* ATTENDANCE */}

                                            <td>

                                                {student.attendance !==
                                                    null &&
                                                student.attendance !==
                                                    undefined
                                                    ? `${student.attendance}%`
                                                    : "-"}

                                            </td>

                                            {/* FACULTY */}

                                            <td>

                                                {student.faculty_name ? (

                                                    <span className="assigned-badge">
                                                        {
                                                            student.faculty_name
                                                        }
                                                    </span>

                                                ) : (

                                                    <span className="not-assigned">
                                                        Not Assigned
                                                    </span>

                                                )}

                                            </td>

                                            {/* MENTOR */}

                                            <td>

                                                {student.mentor_name ? (

                                                    <span
                                                        className="assigned-badge"
                                                        style={{
                                                            background:
                                                                "#ede9fe",
                                                            color:
                                                                "#6d28d9"
                                                        }}
                                                    >
                                                        {
                                                            student.mentor_name
                                                        }
                                                    </span>

                                                ) : (

                                                    <span className="not-assigned">
                                                        Not Assigned
                                                    </span>

                                                )}

                                            </td>

                                            {/* ACTIONS */}

                                            <td>

                                                <div
                                                    className="action-buttons"
                                                >

                                                    {/* FACULTY */}

                                                    <button
                                                        className="assign-button"
                                                        disabled={
                                                            !selectedFaculty ||
                                                            assigning
                                                        }
                                                        onClick={() =>
                                                            assignStudent(
                                                                student.id
                                                            )
                                                        }
                                                    >
                                                        {student.faculty_id
                                                            ? "Reassign Faculty"
                                                            : "Assign Faculty"}
                                                    </button>

                                                    {student.faculty_id && (
                                                        <button
                                                            className="remove-button"
                                                            onClick={() =>
                                                                removeAssignment(
                                                                    student.id
                                                                )
                                                            }
                                                        >
                                                            Remove Faculty
                                                        </button>
                                                    )}

                                                    {/* MENTOR */}

                                                    <button
                                                        className="assign-button"
                                                        style={{
                                                            background:
                                                                "#7c3aed"
                                                        }}
                                                        disabled={
                                                            !selectedMentor ||
                                                            assigning
                                                        }
                                                        onClick={() =>
                                                            assignMentor(
                                                                student.id
                                                            )
                                                        }
                                                    >
                                                        {student.mentor_id
                                                            ? "Reassign Mentor"
                                                            : "Assign Mentor"}
                                                    </button>

                                                    {student.mentor_id && (
                                                        <button
                                                            className="remove-button"
                                                            onClick={() =>
                                                                removeMentorAssignment(
                                                                    student.id
                                                                )
                                                            }
                                                        >
                                                            Remove Mentor
                                                        </button>
                                                    )}

                                                </div>

                                            </td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

                {/* =================================================
                    INSTRUCTION
                ================================================= */}

                <div
                    style={{
                        marginTop: "20px",
                        padding: "18px",
                        background: "#eff6ff",
                        borderRadius: "10px",
                        color: "#1e40af"
                    }}
                >

                    <strong>
                        How assignment works:
                    </strong>

                    <p
                        style={{
                            marginBottom: 0,
                            marginTop: "8px",
                            lineHeight: 1.7
                        }}
                    >
                        Select a Faculty and/or Mentor
                        from the dropdowns, then click
                        the corresponding assignment
                        button for the required student.
                        A student can have both a Faculty
                        and a Mentor.
                    </p>

                    <p
                        style={{
                            marginBottom: 0,
                            marginTop: "8px",
                            lineHeight: 1.7
                        }}
                    >
                        <strong>
                            Faculty:
                        </strong>{" "}
                        Attendance and Timetable.
                        {" "}
                        <strong>
                            Mentor:
                        </strong>{" "}
                        Student monitoring, academic
                        progress, risk status, counselling,
                        interventions and follow-up.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default FacultyAssignment;