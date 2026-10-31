import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function MentorStudentMonitoring() {
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [mentor, setMentor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const mentorId = localStorage.getItem("mentorId");

    const loadStudents = async () => {
        try {
            setLoading(true);
            setError("");

            if (!mentorId) {
                throw new Error(
                    "Mentor ID not found. Please login again."
                );
            }

            console.log("Loading students for mentor:", mentorId);

            const response = await fetch(
                `${API_URL}/mentor/students?mentor_id=${mentorId}`
            );

            const data = await response.json();

            console.log("Mentor student API response:", data);

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    "Unable to load assigned students."
                );
            }

            setMentor(data.mentor || null);
            setStudents(
                Array.isArray(data.students)
                    ? data.students
                    : []
            );

        } catch (err) {
            console.error(
                "MENTOR STUDENT MONITORING ERROR:",
                err
            );

            setError(
                err.message ||
                "Unable to load assigned students."
            );

            setStudents([]);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("mentorToken");
        localStorage.removeItem("mentorId");
        localStorage.removeItem("mentorName");
        localStorage.removeItem("mentorEmail");
        localStorage.removeItem("mentorDepartment");

        navigate("/mentor-login");
    };

    const getRiskStyle = (risk) => {
        if (risk === "High Risk") {
            return {
                background: "#fee2e2",
                color: "#b91c1c"
            };
        }

        if (risk === "Medium Risk") {
            return {
                background: "#fef3c7",
                color: "#92400e"
            };
        }

        return {
            background: "#dcfce7",
            color: "#166534"
        };
    };

    const highRisk = students.filter(
        student => student.risk_status === "High Risk"
    ).length;

    const mediumRisk = students.filter(
        student => student.risk_status === "Medium Risk"
    ).length;

    const lowRisk = students.filter(
        student => student.risk_status === "Low Risk"
    ).length;

    if (loading) {
        return (
            <div style={pageStyle}>
                <div style={loadingStyle}>
                    Loading assigned students...
                </div>
            </div>
        );
    }

    return (
        <div style={pageStyle}>

            <div style={containerStyle}>

                {/* HEADER */}
                <div style={headerStyle}>

                    <div>
                        <div style={labelStyle}>
                            MENTOR PORTAL
                        </div>

                        <h1 style={titleStyle}>
                            Student Monitoring
                        </h1>

                        <p style={subtitleStyle}>
                            Monitor students assigned to you
                        </p>
                    </div>

                    <div style={headerRightStyle}>

                        <div style={{ textAlign: "right" }}>
                            <div style={mentorNameStyle}>
                                {mentor?.name || "Mentor"}
                            </div>

                            <div style={mentorDepartmentStyle}>
                                {mentor?.department || "-"}
                            </div>
                        </div>

                        <button
                            onClick={() =>
                                navigate("/mentor-dashboard")
                            }
                            style={dashboardButton}
                        >
                            Dashboard
                        </button>

                        <button
                            onClick={handleLogout}
                            style={logoutButton}
                        >
                            Logout
                        </button>

                    </div>
                </div>


                {/* ERROR */}
                {error && (
                    <div style={errorStyle}>
                        {error}
                    </div>
                )}


                {/* SUMMARY */}
                <div style={summaryGrid}>

                    <SummaryCard
                        title="Total Students"
                        value={students.length}
                        icon="👨‍🎓"
                    />

                    <SummaryCard
                        title="High Risk"
                        value={highRisk}
                        icon="🔴"
                    />

                    <SummaryCard
                        title="Medium Risk"
                        value={mediumRisk}
                        icon="🟠"
                    />

                    <SummaryCard
                        title="Low Risk"
                        value={lowRisk}
                        icon="🟢"
                    />

                </div>


                {/* STUDENT TABLE */}
                <div style={cardStyle}>

                    <div style={tableHeaderStyle}>

                        <div>
                            <h2 style={sectionTitle}>
                                Assigned Students
                            </h2>

                            <p style={sectionSubtitle}>
                                {students.length} students assigned
                                to {mentor?.name || "this mentor"}
                            </p>
                        </div>

                        <button
                            onClick={loadStudents}
                            style={refreshButton}
                        >
                            ↻ Refresh
                        </button>

                    </div>


                    {students.length === 0 ? (

                        <div style={emptyStyle}>
                            <div style={{ fontSize: "50px" }}>
                                👨‍🎓
                            </div>

                            <h3>
                                No Students Assigned
                            </h3>

                            <p>
                                No students are currently assigned
                                to this mentor.
                            </p>
                        </div>

                    ) : (

                        <div style={{ overflowX: "auto" }}>

                            <table style={tableStyle}>

                                <thead>
                                    <tr style={theadRow}>

                                        <th style={thStyle}>
                                            ID
                                        </th>

                                        <th style={thStyle}>
                                            USN
                                        </th>

                                        <th style={thStyle}>
                                            Student
                                        </th>

                                        <th style={thStyle}>
                                            Branch
                                        </th>

                                        <th style={thStyle}>
                                            Semester
                                        </th>

                                        <th style={thStyle}>
                                            Section
                                        </th>

                                        <th style={thStyle}>
                                            CGPA
                                        </th>

                                        <th style={thStyle}>
                                            Attendance
                                        </th>

                                        <th style={thStyle}>
                                            Backlogs
                                        </th>

                                        <th style={thStyle}>
                                            Risk Status
                                        </th>

                                    </tr>
                                </thead>


                                <tbody>

                                    {students.map((student) => (

                                        <tr
                                            key={student.id}
                                            style={rowStyle}
                                        >

                                            <td style={tdStyle}>
                                                {student.id}
                                            </td>

                                            <td
                                                style={{
                                                    ...tdStyle,
                                                    fontWeight: "700"
                                                }}
                                            >
                                                {student.usn}
                                            </td>

                                            <td style={tdStyle}>

                                                <div
                                                    style={{
                                                        fontWeight: "700",
                                                        color: "#0f172a"
                                                    }}
                                                >
                                                    {student.name}
                                                </div>

                                                <div
                                                    style={{
                                                        fontSize: "12px",
                                                        color: "#64748b",
                                                        marginTop: "4px"
                                                    }}
                                                >
                                                    {student.email}
                                                </div>

                                            </td>

                                            <td style={tdStyle}>
                                                {student.branch || "-"}
                                            </td>

                                            <td style={tdStyle}>
                                                {student.semester || "-"}
                                            </td>

                                            <td style={tdStyle}>
                                                {student.section || "-"}
                                            </td>

                                            <td style={tdStyle}>

                                                <span
                                                    style={{
                                                        fontWeight: "700",
                                                        color:
                                                            student.cgpa !== null &&
                                                            student.cgpa < 6.5
                                                                ? "#dc2626"
                                                                : "#166534"
                                                    }}
                                                >
                                                    {student.cgpa !== null
                                                        ? Number(
                                                            student.cgpa
                                                        ).toFixed(2)
                                                        : "-"}
                                                </span>

                                            </td>

                                            <td style={tdStyle}>

                                                <span
                                                    style={{
                                                        fontWeight: "700",
                                                        color:
                                                            student.attendance !== null &&
                                                            student.attendance < 75
                                                                ? "#dc2626"
                                                                : "#166534"
                                                    }}
                                                >
                                                    {student.attendance !== null
                                                        ? `${Number(
                                                            student.attendance
                                                        ).toFixed(2)}%`
                                                        : "-"}
                                                </span>

                                            </td>

                                            <td style={tdStyle}>

                                                <span
                                                    style={{
                                                        fontWeight: "700",
                                                        color:
                                                            Number(
                                                                student.backlogs
                                                            ) > 0
                                                                ? "#dc2626"
                                                                : "#166534"
                                                    }}
                                                >
                                                    {student.backlogs ?? 0}
                                                </span>

                                            </td>

                                            <td style={tdStyle}>

                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        padding: "7px 13px",
                                                        borderRadius: "20px",
                                                        fontSize: "12px",
                                                        fontWeight: "700",
                                                        ...getRiskStyle(
                                                            student.risk_status
                                                        )
                                                    }}
                                                >
                                                    {student.risk_status}
                                                </span>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>


                {/* RESPONSIBILITY */}
                <div style={responsibilityStyle}>

                    <strong>
                        Mentor Responsibility:
                    </strong>

                    <span style={{ marginLeft: "6px" }}>
                        Monitor assigned students, identify academic
                        risk indicators, provide mentoring and
                        counselling support, and track student progress.
                        Attendance and timetable management remain
                        under Faculty responsibilities.
                    </span>

                </div>

            </div>
        </div>
    );
}


function SummaryCard({
    title,
    value,
    icon
}) {
    return (
        <div style={summaryCardStyle}>

            <div style={summaryIcon}>
                {icon}
            </div>

            <div style={summaryTitle}>
                {title}
            </div>

            <div style={summaryValue}>
                {value}
            </div>

        </div>
    );
}


/* =====================================================
   STYLES
===================================================== */

const pageStyle = {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "30px",
    fontFamily: "Arial, sans-serif"
};

const containerStyle = {
    maxWidth: "1450px",
    margin: "0 auto"
};

const headerStyle = {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "24px 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
    marginBottom: "25px"
};

const labelStyle = {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "700",
    marginBottom: "5px"
};

const titleStyle = {
    margin: 0,
    fontSize: "30px",
    color: "#0f172a"
};

const subtitleStyle = {
    margin: "8px 0 0",
    color: "#64748b"
};

const headerRightStyle = {
    display: "flex",
    alignItems: "center",
    gap: "15px"
};

const mentorNameStyle = {
    fontWeight: "700",
    color: "#0f172a"
};

const mentorDepartmentStyle = {
    fontSize: "13px",
    color: "#64748b"
};

const dashboardButton = {
    padding: "10px 16px",
    border: "none",
    borderRadius: "10px",
    background: "#e2e8f0",
    color: "#0f172a",
    cursor: "pointer",
    fontWeight: "600"
};

const logoutButton = {
    padding: "10px 16px",
    border: "none",
    borderRadius: "10px",
    background: "#ef4444",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "600"
};

const loadingStyle = {
    background: "#ffffff",
    padding: "30px 40px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    fontSize: "18px",
    fontWeight: "600"
};

const errorStyle = {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "15px 18px",
    borderRadius: "12px",
    marginBottom: "20px",
    fontWeight: "600"
};

const summaryGrid = {
    display: "grid",
    gridTemplateColumns:
        "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "25px"
};

const summaryCardStyle = {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.05)"
};

const summaryIcon = {
    fontSize: "30px",
    marginBottom: "12px"
};

const summaryTitle = {
    color: "#64748b",
    fontSize: "14px",
    marginBottom: "5px"
};

const summaryValue = {
    fontSize: "30px",
    fontWeight: "800",
    color: "#0f172a"
};

const cardStyle = {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "25px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.06)"
};

const tableHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
};

const sectionTitle = {
    margin: 0,
    color: "#0f172a",
    fontSize: "22px"
};

const sectionSubtitle = {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "14px"
};

const refreshButton = {
    padding: "10px 18px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "600"
};

const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1150px"
};

const theadRow = {
    background: "#f8fafc"
};

const thStyle = {
    padding: "15px 12px",
    textAlign: "left",
    fontSize: "13px",
    color: "#475569",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap"
};

const tdStyle = {
    padding: "15px 12px",
    fontSize: "14px",
    color: "#334155",
    whiteSpace: "nowrap"
};

const rowStyle = {
    borderBottom: "1px solid #e2e8f0"
};

const emptyStyle = {
    padding: "50px",
    textAlign: "center",
    color: "#64748b"
};

const responsibilityStyle = {
    marginTop: "20px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "14px",
    padding: "18px 20px",
    color: "#1e40af"
};

export default MentorStudentMonitoring;