import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function MentorAssignment() {
    const navigate = useNavigate();

    const [mentors, setMentors] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedMentor, setSelectedMentor] = useState("");
    const [search, setSearch] = useState("");
    const [mentorFilter, setMentorFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [mentorsResponse, studentsResponse] =
                await Promise.all([
                    fetch(`${API_URL}/mentor-admin/mentors`),
                    fetch(`${API_URL}/mentor-admin/students`),
                ]);

            const mentorsData = await mentorsResponse.json();
            const studentsData = await studentsResponse.json();

            if (!mentorsResponse.ok) {
                throw new Error(
                    mentorsData.detail || "Unable to load mentors."
                );
            }

            if (!studentsResponse.ok) {
                throw new Error(
                    studentsData.detail || "Unable to load students."
                );
            }

            setMentors(
                Array.isArray(mentorsData) ? mentorsData : []
            );

            setStudents(
                Array.isArray(studentsData) ? studentsData : []
            );
        } catch (err) {
            console.error("Mentor assignment load error:", err);
            setError(
                err.message || "Unable to connect to the backend."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const assignStudent = async (studentId) => {
        if (!selectedMentor) {
            setError("Please select a mentor first.");
            setMessage("");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const response = await fetch(
                `${API_URL}/mentor-admin/assign?mentor_id=${selectedMentor}&student_id=${studentId}`,
                {
                    method: "POST",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.detail || "Mentor assignment failed."
                );
            }

            setMessage(
                result.message ||
                "Student assigned to mentor successfully."
            );

            await loadData();
        } catch (err) {
            console.error("Mentor assignment error:", err);
            setError(
                err.message || "Unable to assign student."
            );
        } finally {
            setSaving(false);
        }
    };

    const removeAssignment = async (studentId) => {
        const confirmed = window.confirm(
            "Are you sure you want to remove this student's mentor assignment?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const response = await fetch(
                `${API_URL}/mentor-admin/assignment/${studentId}`,
                {
                    method: "DELETE",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.detail ||
                    "Unable to remove mentor assignment."
                );
            }

            setMessage(
                result.message ||
                "Mentor assignment removed successfully."
            );

            await loadData();
        } catch (err) {
            console.error("Remove mentor assignment error:", err);
            setError(
                err.message ||
                "Unable to remove mentor assignment."
            );
        } finally {
            setSaving(false);
        }
    };

    const filteredStudents = useMemo(() => {
        const value = search.trim().toLowerCase();

        return students.filter((student) => {
            const matchesSearch =
                !value ||
                [
                    student.name,
                    student.usn,
                    student.email,
                    student.branch,
                    student.section,
                    student.mentor_name,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase()
                    .includes(value);

            const matchesMentor =
                mentorFilter === "all"
                    ? true
                    : mentorFilter === "unassigned"
                    ? !student.mentor_id
                    : String(student.mentor_id) ===
                      String(mentorFilter);

            return matchesSearch && matchesMentor;
        });
    }, [students, search, mentorFilter]);

    const assignedCount = students.filter(
        (student) => student.mentor_id
    ).length;

    const unassignedCount =
        students.length - assignedCount;

    const mentorCounts = mentors.map((mentor) => ({
        ...mentor,
        count: students.filter(
            (student) =>
                String(student.mentor_id) ===
                String(mentor.id)
        ).length,
    }));

    if (loading) {
        return (
            <div style={pageStyle}>
                <div style={loadingCard}>
                    <div style={{ fontSize: 46 }}>👨‍🏫</div>
                    <h2>Loading Mentor Assignment...</h2>
                    <p style={{ color: "#64748b" }}>
                        Fetching mentors and students.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            <div style={container}>
                <header style={header}>
                    <div>
                        <div style={eyebrow}>
                            ADMIN CONTROL CENTER
                        </div>

                        <h1 style={title}>
                            Student → Mentor Assignment
                        </h1>

                        <p style={subtitle}>
                            Assign, reassign and remove students
                            from mentor accounts.
                        </p>
                    </div>

                    <div style={headerActions}>
                        <button
                            style={secondaryButton}
                            onClick={() => navigate("/admin")}
                        >
                            ← Dashboard
                        </button>

                        <button
                            style={primaryButton}
                            onClick={loadData}
                        >
                            ↻ Refresh
                        </button>
                    </div>
                </header>

                {error && (
                    <div style={errorBox}>
                        ⚠️ {error}
                    </div>
                )}

                {message && (
                    <div style={successBox}>
                        ✓ {message}
                    </div>
                )}

                <div style={statsGrid}>
                    <Stat
                        icon="👨‍🏫"
                        label="Mentors"
                        value={mentors.length}
                    />

                    <Stat
                        icon="👨‍🎓"
                        label="Total Students"
                        value={students.length}
                    />

                    <Stat
                        icon="✅"
                        label="Assigned"
                        value={assignedCount}
                    />

                    <Stat
                        icon="⚠️"
                        label="Unassigned"
                        value={unassignedCount}
                    />
                </div>

                <section style={section}>
                    <div style={sectionHeader}>
                        <div>
                            <h2 style={sectionTitle}>
                                Mentor Overview
                            </h2>
                            <p style={sectionSubtitle}>
                                Current student distribution by mentor.
                            </p>
                        </div>
                    </div>

                    <div style={mentorGrid}>
                        {mentorCounts.map((mentor) => (
                            <div
                                key={mentor.id}
                                style={
                                    selectedMentor ===
                                    String(mentor.id)
                                        ? {
                                              ...mentorCard,
                                              ...selectedMentorCard,
                                          }
                                        : mentorCard
                                }
                                onClick={() =>
                                    setSelectedMentor(
                                        String(mentor.id)
                                    )
                                }
                            >
                                <div style={mentorIcon}>
                                    👨‍🏫
                                </div>

                                <div style={{ flex: 1 }}>
                                    <strong style={mentorName}>
                                        {mentor.name}
                                    </strong>

                                    <div style={smallText}>
                                        {mentor.email}
                                    </div>

                                    <div style={smallText}>
                                        {mentor.department ||
                                            "Department not specified"}
                                    </div>
                                </div>

                                <div style={studentCount}>
                                    {mentor.count}
                                    <span style={studentCountSpan}>
                                        Students
                                    </span>
                                </div>
                            </div>
                        ))}

                        {mentors.length === 0 && (
                            <div style={empty}>
                                No mentors found.
                            </div>
                        )}
                    </div>
                </section>

                <section style={section}>
                    <div style={sectionHeader}>
                        <div>
                            <h2 style={sectionTitle}>
                                Student Assignment
                            </h2>

                            <p style={sectionSubtitle}>
                                Select a mentor, then assign or
                                reassign students.
                            </p>
                        </div>
                    </div>

                    <div style={controlBar}>
                        <select
                            value={selectedMentor}
                            onChange={(e) => {
                                setSelectedMentor(e.target.value);
                                setError("");
                            }}
                            style={selectStyle}
                        >
                            <option value="">
                                Select Mentor
                            </option>

                            {mentors.map((mentor) => (
                                <option
                                    key={mentor.id}
                                    value={mentor.id}
                                >
                                    {mentor.name} —{" "}
                                    {mentor.department ||
                                        "N/A"}
                                </option>
                            ))}
                        </select>

                        <select
                            value={mentorFilter}
                            onChange={(e) =>
                                setMentorFilter(
                                    e.target.value
                                )
                            }
                            style={selectStyle}
                        >
                            <option value="all">
                                All Students
                            </option>

                            <option value="unassigned">
                                Unassigned Students
                            </option>

                            {mentors.map((mentor) => (
                                <option
                                    key={mentor.id}
                                    value={mentor.id}
                                >
                                    {mentor.name}'s Students
                                </option>
                            ))}
                        </select>

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search student, USN, email, mentor..."
                            style={searchInput}
                        />
                    </div>

                    <div style={tableWrap}>
                        <table style={table}>
                            <thead>
                                <tr>
                                    <th style={th}>Student</th>
                                    <th style={th}>USN</th>
                                    <th style={th}>Branch</th>
                                    <th style={th}>Sem</th>
                                    <th style={th}>Section</th>
                                    <th style={th}>CGPA</th>
                                    <th style={th}>Attendance</th>
                                    <th style={th}>Current Mentor</th>
                                    <th style={th}>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredStudents.map(
                                    (student) => (
                                        <tr key={student.id}>
                                            <td style={td}>
                                                <strong>
                                                    {student.name}
                                                </strong>

                                                <div style={sub}>
                                                    {student.email}
                                                </div>
                                            </td>

                                            <td style={td}>
                                                {student.usn}
                                            </td>

                                            <td style={td}>
                                                {student.branch ||
                                                    "-"}
                                            </td>

                                            <td style={td}>
                                                {student.semester ||
                                                    "-"}
                                            </td>

                                            <td style={td}>
                                                <span
                                                    style={tag}
                                                >
                                                    {student.section ||
                                                        "-"}
                                                </span>
                                            </td>

                                            <td style={td}>
                                                {student.cgpa ??
                                                    "-"}
                                            </td>

                                            <td style={td}>
                                                {student.attendance !=
                                                null
                                                    ? `${student.attendance}%`
                                                    : "-"}
                                            </td>

                                            <td style={td}>
                                                {student.mentor_name ? (
                                                    <span
                                                        style={
                                                            assignedBadge
                                                        }
                                                    >
                                                        {student.mentor_name}
                                                    </span>
                                                ) : (
                                                    <span
                                                        style={
                                                            unassignedBadge
                                                        }
                                                    >
                                                        Not Assigned
                                                    </span>
                                                )}
                                            </td>

                                            <td style={td}>
                                                <div
                                                    style={
                                                        actionButtons
                                                    }
                                                >
                                                    <button
                                                        style={
                                                            assignButton
                                                        }
                                                        disabled={
                                                            !selectedMentor ||
                                                            saving
                                                        }
                                                        onClick={() =>
                                                            assignStudent(
                                                                student.id
                                                            )
                                                        }
                                                    >
                                                        {student.mentor_id
                                                            ? "Reassign"
                                                            : "Assign"}
                                                    </button>

                                                    {student.mentor_id && (
                                                        <button
                                                            style={
                                                                removeButton
                                                            }
                                                            disabled={
                                                                saving
                                                            }
                                                            onClick={() =>
                                                                removeAssignment(
                                                                    student.id
                                                                )
                                                            }
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>

                        {filteredStudents.length === 0 && (
                            <div style={empty}>
                                No students match the selected
                                filters.
                            </div>
                        )}
                    </div>
                </section>

                <div style={infoBox}>
                    <strong>How mentor assignment works</strong>

                    <p>
                        Select a mentor from the dropdown and
                        click <strong>Assign</strong> for the
                        required student. If the student already
                        has a mentor, the same action performs a
                        reassignment.
                    </p>

                    <p>
                        Removing an assignment makes the student
                        available as <strong>Not Assigned</strong>.
                    </p>

                    <p style={{ marginBottom: 0 }}>
                        Mentor access is based on the
                        <strong> MentorStudent </strong>
                        assignment.
                    </p>
                </div>
            </div>
        </div>
    );
}

function Stat({ icon, label, value }) {
    return (
        <div style={statCard}>
            <div style={statIcon}>{icon}</div>

            <div>
                <div style={statValue}>{value}</div>
                <div style={statLabel}>{label}</div>
            </div>
        </div>
    );
}

const pageStyle = {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: 28,
    fontFamily: "Inter, Arial, sans-serif",
    color: "#334155",
};

const container = {
    maxWidth: 1450,
    margin: "0 auto",
};

const header = {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: "24px 26px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    boxShadow: "0 8px 25px rgba(15,23,42,0.05)",
    marginBottom: 20,
};

const eyebrow = {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.5,
    color: "#2563eb",
};

const title = {
    margin: "5px 0 4px",
    color: "#0f172a",
    fontSize: 30,
};

const subtitle = {
    margin: 0,
    color: "#64748b",
};

const headerActions = {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
};

const primaryButton = {
    border: 0,
    borderRadius: 10,
    padding: "10px 16px",
    background: "#2563eb",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
};

const secondaryButton = {
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    padding: "10px 16px",
    background: "white",
    color: "#334155",
    fontWeight: 700,
    cursor: "pointer",
};

const errorBox = {
    padding: 14,
    marginBottom: 16,
    borderRadius: 12,
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
};

const successBox = {
    padding: 14,
    marginBottom: 16,
    borderRadius: 12,
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
};

const statsGrid = {
    display: "grid",
    gridTemplateColumns:
        "repeat(auto-fit,minmax(190px,1fr))",
    gap: 14,
    marginBottom: 20,
};

const statCard = {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 18,
    display: "flex",
    alignItems: "center",
    gap: 14,
    boxShadow: "0 5px 18px rgba(15,23,42,0.04)",
};

const statIcon = {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "#eff6ff",
    display: "grid",
    placeItems: "center",
    fontSize: 23,
};

const statValue = {
    fontSize: 25,
    fontWeight: 800,
    color: "#0f172a",
};

const statLabel = {
    fontSize: 13,
    color: "#64748b",
};

const section = {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 5px 18px rgba(15,23,42,0.04)",
    marginBottom: 20,
};

const sectionHeader = {
    padding: "18px 20px",
    borderBottom: "1px solid #e2e8f0",
};

const sectionTitle = {
    margin: 0,
    color: "#0f172a",
    fontSize: 20,
};

const sectionSubtitle = {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: 13,
};

const mentorGrid = {
    display: "grid",
    gridTemplateColumns:
        "repeat(auto-fit,minmax(300px,1fr))",
    gap: 14,
    padding: 20,
};

const mentorCard = {
    display: "flex",
    alignItems: "center",
    gap: 14,
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 15,
    cursor: "pointer",
    background: "#fff",
};

const selectedMentorCard = {
    borderColor: "#2563eb",
    boxShadow: "0 0 0 2px rgba(37,99,235,0.12)",
};

const mentorIcon = {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "#eff6ff",
    display: "grid",
    placeItems: "center",
    fontSize: 23,
};

const mentorName = {
    color: "#0f172a",
};

const smallText = {
    color: "#64748b",
    fontSize: 12,
    marginTop: 3,
};

const studentCount = {
    fontWeight: 800,
    color: "#1d4ed8",
    fontSize: 20,
    textAlign: "center",
};

const studentCountSpan = {
    display: "block",
    fontSize: 10,
    color: "#64748b",
};

const controlBar = {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    padding: 18,
    borderBottom: "1px solid #e2e8f0",
};

const selectStyle = {
    minWidth: 220,
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    padding: "10px 12px",
    background: "white",
    color: "#334155",
};

const searchInput = {
    minWidth: 280,
    flex: 1,
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    padding: "10px 13px",
    outline: "none",
};

const tableWrap = {
    overflowX: "auto",
};

const table = {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 1100,
};

const th = {
    textAlign: "left",
    padding: "13px 15px",
    fontSize: 12,
    color: "#64748b",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
};

const td = {
    padding: "14px 15px",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "top",
    fontSize: 13,
};

const sub = {
    marginTop: 4,
    fontSize: 11,
    color: "#94a3b8",
};

const tag = {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: 999,
    background: "#eef2ff",
    color: "#4338ca",
    fontSize: 11,
    fontWeight: 800,
};

const assignedBadge = {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: 999,
    background: "#dcfce7",
    color: "#166534",
    fontSize: 11,
    fontWeight: 800,
};

const unassignedBadge = {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: 999,
    background: "#fef3c7",
    color: "#92400e",
    fontSize: 11,
    fontWeight: 800,
};

const actionButtons = {
    display: "flex",
    gap: 7,
    flexWrap: "wrap",
};

const assignButton = {
    border: 0,
    borderRadius: 8,
    padding: "7px 11px",
    background: "#2563eb",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
};

const removeButton = {
    border: 0,
    borderRadius: 8,
    padding: "7px 11px",
    background: "#ef4444",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
};

const infoBox = {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 14,
    padding: 18,
    color: "#1e40af",
    marginBottom: 20,
};

const empty = {
    padding: 28,
    textAlign: "center",
    color: "#94a3b8",
};

const loadingCard = {
    maxWidth: 500,
    margin: "120px auto",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: 35,
    textAlign: "center",
    boxShadow: "0 8px 25px rgba(15,23,42,0.06)",
};

export default MentorAssignment;
