import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function MentorParentAlerts() {
    const navigate = useNavigate();
    const mentorId = localStorage.getItem("mentorId");
    const mentorName = localStorage.getItem("mentorName") || "Mentor";

    const [students, setStudents] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState("");
    const [alertType, setAlertType] = useState("Attendance");
    const [priority, setPriority] = useState("Medium");
    const [message, setMessage] = useState("");
    const [followUpDate, setFollowUpDate] = useState("");
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadData = async () => {
        if (!mentorId) {
            setError("Mentor session not found. Please login again.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/mentor/parent-alerts?mentor_id=${mentorId}`
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.detail || "Unable to load parent alert data."
                );
            }

            setStudents(Array.isArray(data.students) ? data.students : []);
            setAlerts(Array.isArray(data.alerts) ? data.alerts : []);
        } catch (err) {
            console.error("MENTOR PARENT ALERT LOAD ERROR:", err);
            setError(err.message || "Unable to load parent alert data.");
            setStudents([]);
            setAlerts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mentorId]);

    const selectedStudentData = useMemo(
        () =>
            students.find(
                (student) => String(student.id) === String(selectedStudent)
            ),
        [students, selectedStudent]
    );

    const filteredAlerts = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return alerts;

        return alerts.filter((alert) =>
            [
                alert.student_name,
                alert.student_usn,
                alert.description,
                alert.activity_type,
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(query)
                )
        );
    }, [alerts, search]);

    const getField = (description, field) => {
        if (!description) return "";

        const line = description
            .split("\n")
            .find((item) => item.startsWith(`${field}:`));

        return line ? line.substring(field.length + 1).trim() : "";
    };

    const getPriorityStyle = (value) => {
        if (value === "High") {
            return {
                background: "#fee2e2",
                color: "#b91c1c",
            };
        }

        if (value === "Low") {
            return {
                background: "#dcfce7",
                color: "#166534",
            };
        }

        return {
            background: "#fef3c7",
            color: "#92400e",
        };
    };

    const normalizeIndianMobile = (value) => {
        let mobile = String(value || "")
            .trim()
            .replace(/\s+/g, "")
            .replace(/-/g, "");

        if (mobile.startsWith("+91")) {
            mobile = mobile.substring(3);
        } else if (mobile.startsWith("91") && mobile.length === 12) {
            mobile = mobile.substring(2);
        }

        if (!/^[6-9]\d{9}$/.test(mobile)) {
            return null;
        }

        return mobile;
    };

    const openWhatsApp = (student) => {
        const mobile = normalizeIndianMobile(student?.parent_mobile);

        if (!mobile) {
            throw new Error(
                "Valid parent mobile number is not available for this student."
            );
        }

        const parentName = student.parent_name || "Parent/Guardian";

        const whatsappMessage = [
            "🔔 Student Parent Alert",
            "",
            `Dear ${parentName},`,
            "",
            `Your ward ${student.name} (${student.usn}) has received an alert from the Student Dropout Prediction System.`,
            "",
            `Alert Type: ${alertType}`,
            `Priority: ${priority}`,
            `Message: ${message.trim()}`,
            `Follow-up Date: ${followUpDate || "Not specified"}`,
            "",
            "Please contact the mentor for more information.",
        ].join("\n");

        const whatsappUrl =
            `https://wa.me/91${mobile}?text=` +
            encodeURIComponent(whatsappMessage);

        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!mentorId) {
            setError("Mentor session not found. Please login again.");
            return;
        }

        if (!selectedStudentData) {
            setError("Please select an assigned student.");
            return;
        }

        if (!message.trim()) {
            setError("Please enter an alert message.");
            return;
        }

        if (!selectedStudentData.parent_mobile) {
            setError(
                "Parent mobile number is not registered for this student."
            );
            return;
        }

        try {
            setSaving(true);

            const params = new URLSearchParams();
            params.set("mentor_id", mentorId);
            params.set("student_id", selectedStudentData.id);
            params.set("alert_type", alertType);
            params.set("priority", priority);
            params.set("message", message.trim());

            if (followUpDate) {
                params.set("follow_up_date", followUpDate);
            }

            const response = await fetch(
                `${API_URL}/mentor/parent-alerts?${params.toString()}`,
                {
                    method: "POST",
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.detail || "Failed to save parent alert."
                );
            }

            setSuccess(
                `Parent alert saved for ${selectedStudentData.name}. Opening WhatsApp...`
            );

            openWhatsApp(selectedStudentData);

            setSelectedStudent("");
            setAlertType("Attendance");
            setPriority("Medium");
            setMessage("");
            setFollowUpDate("");

            await loadData();
        } catch (err) {
            console.error("MENTOR PARENT ALERT SAVE ERROR:", err);
            setError(err.message || "Failed to save parent alert.");
        } finally {
            setSaving(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("mentorToken");
        localStorage.removeItem("mentorId");
        localStorage.removeItem("mentorName");
        localStorage.removeItem("mentorEmail");
        localStorage.removeItem("mentorDepartment");
        navigate("/mentor-login");
    };

    if (loading) {
        return (
            <div style={pageStyle}>
                <div style={loadingCardStyle}>
                    <div style={{ fontSize: 42 }}>🔔</div>
                    <h2>Loading Parent Alerts</h2>
                    <p>Loading students assigned to {mentorName}...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>
                <header style={headerStyle}>
                    <div>
                        <div style={eyebrowStyle}>MENTOR PORTAL</div>
                        <h1 style={titleStyle}>🔔 Parent Alerts</h1>
                        <p style={subtitleStyle}>
                            Contact parents only for students assigned to you.
                        </p>
                    </div>

                    <div style={headerActionsStyle}>
                        <button
                            onClick={() => navigate("/mentor-dashboard")}
                            style={secondaryButtonStyle}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => navigate("/mentor/mentoring")}
                            style={secondaryButtonStyle}
                        >
                            Mentoring
                        </button>
                        <button
                            onClick={loadData}
                            style={refreshButtonStyle}
                        >
                            ↻ Refresh
                        </button>
                        <button onClick={logout} style={logoutButtonStyle}>
                            Logout
                        </button>
                    </div>
                </header>

                {error && <div style={errorStyle}>⚠ {error}</div>}
                {success && <div style={successStyle}>✓ {success}</div>}

                <div style={summaryGridStyle}>
                    <SummaryCard
                        icon="👨‍🎓"
                        title="Assigned Students"
                        value={students.length}
                    />
                    <SummaryCard
                        icon="🔔"
                        title="Parent Alerts"
                        value={alerts.length}
                    />
                    <SummaryCard
                        icon="🔴"
                        title="High Priority"
                        value={alerts.filter(
                            (alert) =>
                                getField(alert.description, "Priority") ===
                                "High"
                        ).length}
                    />
                </div>

                <section style={cardStyle}>
                    <div style={sectionHeaderStyle}>
                        <div>
                            <h2 style={sectionTitleStyle}>Create Parent Alert</h2>
                            <p style={sectionSubtitleStyle}>
                                Record the alert and open WhatsApp with a prepared message.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={formGridStyle}>
                            <div style={fieldStyle}>
                                <label style={labelStyle}>Assigned Student</label>
                                <select
                                    value={selectedStudent}
                                    onChange={(event) =>
                                        setSelectedStudent(event.target.value)
                                    }
                                    style={inputStyle}
                                >
                                    <option value="">
                                        -- Select Student --
                                    </option>
                                    {students.map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {student.name} - {student.usn}
                                        </option>
                                    ))}
                                </select>
                                {selectedStudentData && (
                                    <div style={helperStyle}>
                                        Parent: {selectedStudentData.parent_name || "Not available"}
                                        {" • "}
                                        Mobile: {selectedStudentData.parent_mobile || "Not available"}
                                    </div>
                                )}
                            </div>

                            <div style={fieldStyle}>
                                <label style={labelStyle}>Alert Type</label>
                                <select
                                    value={alertType}
                                    onChange={(event) => setAlertType(event.target.value)}
                                    style={inputStyle}
                                >
                                    <option value="Attendance">Attendance</option>
                                    <option value="Academic">Academic</option>
                                    <option value="Behavior">Behavior</option>
                                    <option value="Financial">Financial</option>
                                    <option value="Risk">Dropout Risk</option>
                                    <option value="General">General</option>
                                </select>
                            </div>

                            <div style={fieldStyle}>
                                <label style={labelStyle}>Priority</label>
                                <select
                                    value={priority}
                                    onChange={(event) => setPriority(event.target.value)}
                                    style={inputStyle}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                            <div style={fieldStyle}>
                                <label style={labelStyle}>Follow-up Date</label>
                                <input
                                    type="date"
                                    value={followUpDate}
                                    onChange={(event) => setFollowUpDate(event.target.value)}
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                                <label style={labelStyle}>Alert Message</label>
                                <textarea
                                    value={message}
                                    onChange={(event) => setMessage(event.target.value)}
                                    placeholder="Enter the message or reason for contacting the parent..."
                                    style={textareaStyle}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving || students.length === 0}
                            style={submitButtonStyle}
                        >
                            {saving ? "Saving..." : "🔔 Save & Open WhatsApp"}
                        </button>

                        <p style={helperStyle}>
                            WhatsApp opens with the message prepared. The mentor must press Send.
                        </p>
                    </form>
                </section>

                <section style={cardStyle}>
                    <div style={sectionHeaderStyle}>
                        <div>
                            <h2 style={sectionTitleStyle}>Parent Alert History</h2>
                            <p style={sectionSubtitleStyle}>
                                Previous parent alerts recorded by you.
                            </p>
                        </div>
                        <span style={countBadgeStyle}>{filteredAlerts.length}</span>
                    </div>

                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search student, USN or alert..."
                        style={inputStyle}
                    />

                    {filteredAlerts.length === 0 ? (
                        <div style={emptyStyle}>
                            No parent alerts recorded yet.
                        </div>
                    ) : (
                        <div style={{ marginTop: 18 }}>
                            {filteredAlerts.map((alert) => {
                                const alertPriority =
                                    getField(alert.description, "Priority") || "Medium";
                                const alertTypeValue =
                                    getField(alert.description, "Alert Type") || "General";

                                return (
                                    <div key={alert.id} style={alertItemStyle}>
                                        <div style={alertTopStyle}>
                                            <div>
                                                <div style={studentNameStyle}>
                                                    👨‍🎓 {alert.student_name} • {alert.student_usn}
                                                </div>
                                                <div style={alertTypeStyle}>
                                                    {alertTypeValue}
                                                </div>
                                            </div>
                                            <span
                                                style={{
                                                    ...priorityBadgeStyle,
                                                    ...getPriorityStyle(alertPriority),
                                                }}
                                            >
                                                {alertPriority}
                                            </span>
                                        </div>

                                        <div style={descriptionStyle}>
                                            {getField(alert.description, "Message") ||
                                                alert.description}
                                        </div>

                                        <div style={dateStyle}>
                                            Follow-up: {getField(alert.description, "Follow-up Date") || "Not specified"}
                                            {" • "}
                                            {alert.activity_date
                                                ? new Date(alert.activity_date).toLocaleString("en-IN")
                                                : "Unknown date"}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

function SummaryCard({ icon, title, value }) {
    return (
        <div style={summaryCardStyle}>
            <div style={summaryIconStyle}>{icon}</div>
            <div>
                <div style={summaryTitleStyle}>{title}</div>
                <div style={summaryValueStyle}>{value}</div>
            </div>
        </div>
    );
}

const pageStyle = {
    minHeight: "100vh",
    background: "#f4f7fb",
    padding: "28px",
    fontFamily: "Arial, sans-serif",
    color: "#1e293b",
};

const containerStyle = {
    maxWidth: "1250px",
    margin: "0 auto",
};

const headerStyle = {
    background: "white",
    borderRadius: "18px",
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "center",
    boxShadow: "0 5px 20px rgba(15, 23, 42, 0.06)",
    marginBottom: "20px",
};

const eyebrowStyle = {
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "1.5px",
    marginBottom: "6px",
};

const titleStyle = {
    margin: 0,
    fontSize: "30px",
};

const subtitleStyle = {
    margin: "8px 0 0",
    color: "#64748b",
};

const headerActionsStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    justifyContent: "flex-end",
};

const secondaryButtonStyle = {
    border: "1px solid #cbd5e1",
    background: "white",
    color: "#334155",
    padding: "10px 14px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: 600,
};

const refreshButtonStyle = {
    ...secondaryButtonStyle,
    background: "#eff6ff",
    color: "#1d4ed8",
    borderColor: "#bfdbfe",
};

const logoutButtonStyle = {
    ...secondaryButtonStyle,
    background: "#fee2e2",
    color: "#b91c1c",
    borderColor: "#fecaca",
};

const cardStyle = {
    background: "white",
    borderRadius: "18px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 5px 20px rgba(15, 23, 42, 0.06)",
};

const sectionHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px",
};

const sectionTitleStyle = {
    margin: 0,
    fontSize: "21px",
};

const sectionSubtitleStyle = {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "14px",
};

const summaryGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "15px",
    marginBottom: "20px",
};

const summaryCardStyle = {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    gap: "14px",
    alignItems: "center",
    boxShadow: "0 5px 20px rgba(15, 23, 42, 0.05)",
};

const summaryIconStyle = {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
};

const summaryTitleStyle = {
    color: "#64748b",
    fontSize: "13px",
};

const summaryValueStyle = {
    fontSize: "27px",
    fontWeight: 800,
    marginTop: "3px",
};

const formGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
};

const fieldStyle = {
    display: "flex",
    flexDirection: "column",
};

const labelStyle = {
    fontSize: "14px",
    fontWeight: 700,
    marginBottom: "7px",
};

const inputStyle = {
    width: "100%",
    padding: "12px 13px",
    border: "1px solid #cbd5e1",
    borderRadius: "9px",
    fontSize: "14px",
    outline: "none",
    background: "white",
};

const textareaStyle = {
    ...inputStyle,
    minHeight: "125px",
    resize: "vertical",
    fontFamily: "inherit",
};

const submitButtonStyle = {
    marginTop: "20px",
    border: "none",
    borderRadius: "10px",
    padding: "13px 20px",
    background: "#2563eb",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
};

const helperStyle = {
    color: "#64748b",
    fontSize: "13px",
    marginTop: "7px",
};

const alertItemStyle = {
    border: "1px solid #e2e8f0",
    borderRadius: "13px",
    padding: "17px",
    marginTop: "14px",
};

const alertTopStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
};

const studentNameStyle = {
    fontWeight: 800,
};

const alertTypeStyle = {
    marginTop: "5px",
    color: "#64748b",
    fontSize: "13px",
};

const priorityBadgeStyle = {
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 800,
    whiteSpace: "nowrap",
};

const descriptionStyle = {
    marginTop: "13px",
    color: "#475569",
    lineHeight: 1.6,
};

const dateStyle = {
    marginTop: "10px",
    color: "#94a3b8",
    fontSize: "12px",
};

const countBadgeStyle = {
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "7px 12px",
    borderRadius: "20px",
    fontWeight: 800,
};

const errorStyle = {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "13px 16px",
    borderRadius: "10px",
    marginBottom: "18px",
};

const successStyle = {
    background: "#dcfce7",
    color: "#166534",
    padding: "13px 16px",
    borderRadius: "10px",
    marginBottom: "18px",
};

const emptyStyle = {
    textAlign: "center",
    padding: "35px",
    color: "#64748b",
};

const loadingCardStyle = {
    maxWidth: "500px",
    margin: "100px auto",
    background: "white",
    borderRadius: "18px",
    padding: "40px",
    textAlign: "center",
    boxShadow: "0 5px 20px rgba(15, 23, 42, 0.08)",
};

export default MentorParentAlerts;
