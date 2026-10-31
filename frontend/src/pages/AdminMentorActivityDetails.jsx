import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

const formatDate = (value) => {
    if (!value) return "-";

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

const formatDateOnly = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

function AdminMentorActivityDetails() {
    const navigate = useNavigate();
    const { mentorId } = useParams();

    const [data, setData] = useState({
        mentor: null,
        students: [],
        notes: [],
        activities: [],
        parent_alerts: [],
        followups: [],
        interventions: [],
        summary: {
            students: 0,
            notes: 0,
            activities: 0,
            parent_alerts: 0,
            followups: 0,
            interventions: 0,
        },
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("students");

    const loadDetails = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await fetch(
                `${API_URL}/admin/mentor-activities/mentor/${mentorId}`
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.detail || "Unable to load mentor details."
                );
            }

            setData({
                mentor: result.mentor || null,
                students: Array.isArray(result.students)
                    ? result.students
                    : [],
                notes: Array.isArray(result.notes)
                    ? result.notes
                    : [],
                activities: Array.isArray(result.activities)
                    ? result.activities
                    : [],
                parent_alerts: Array.isArray(result.parent_alerts)
                    ? result.parent_alerts
                    : [],
                followups: Array.isArray(result.followups)
                    ? result.followups
                    : [],
                interventions: Array.isArray(result.interventions)
                    ? result.interventions
                    : [],
                summary: result.summary || {},
            });
        } catch (err) {
            console.error("Admin mentor details error:", err);
            setError(
                err.message || "Unable to load mentor activity details."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (mentorId) {
            loadDetails();
        }
    }, [mentorId]);

    const matchesSearch = (item) => {
        const value = search.trim().toLowerCase();

        if (!value) {
            return true;
        }

        return [
            item.name,
            item.usn,
            item.email,
            item.student_name,
            item.student_usn,
            item.note,
            item.activity_type,
            item.description,
            item.purpose,
            item.status,
            item.intervention_type,
            item.priority,
            item.outcome,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(value);
    };

    const filteredStudents = useMemo(
        () => data.students.filter(matchesSearch),
        [data.students, search]
    );

    const filteredNotes = useMemo(
        () => data.notes.filter(matchesSearch),
        [data.notes, search]
    );

    const filteredActivities = useMemo(
        () => data.activities.filter(matchesSearch),
        [data.activities, search]
    );

    const filteredParentAlerts = useMemo(
        () => data.parent_alerts.filter(matchesSearch),
        [data.parent_alerts, search]
    );

    const filteredFollowups = useMemo(
        () => data.followups.filter(matchesSearch),
        [data.followups, search]
    );

    const filteredInterventions = useMemo(
        () => data.interventions.filter(matchesSearch),
        [data.interventions, search]
    );

    const logout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminEmail");
        localStorage.removeItem("adminName");
        navigate("/admin-login");
    };

    if (loading) {
        return (
            <div style={pageStyle}>
                <div style={loadingCard}>
                    <div style={{ fontSize: 48 }}>👨‍🏫</div>
                    <h2>Loading Mentor Details...</h2>
                    <p>Fetching complete mentoring history.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            <header style={headerStyle}>
                <div>
                    <div style={eyebrowStyle}>
                        ADMIN CONTROL CENTER
                    </div>

                    <h1 style={titleStyle}>
                        Mentor Activity Details
                    </h1>

                    <p style={subtitleStyle}>
                        Complete mentoring history and student monitoring.
                    </p>
                </div>

                <div style={headerActionsStyle}>
                    <button
                        style={secondaryButton}
                        onClick={() =>
                            navigate("/admin/mentor-activities")
                        }
                    >
                        ← Mentor Activities
                    </button>

                    <button
                        style={primaryButton}
                        onClick={() => loadDetails(true)}
                        disabled={refreshing}
                    >
                        {refreshing ? "Refreshing..." : "↻ Refresh"}
                    </button>

                    <button
                        style={dangerButton}
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>
            </header>

            {error && (
                <div style={errorStyle}>
                    ⚠️ {error}
                </div>
            )}

            {data.mentor && (
                <section style={mentorCard}>
                    <div style={mentorAvatar}>👨‍🏫</div>

                    <div style={{ flex: 1 }}>
                        <h2 style={{ margin: 0 }}>
                            {data.mentor.name}
                        </h2>

                        <p style={mutedText}>
                            {data.mentor.email}
                        </p>

                        <div style={mentorMeta}>
                            <span>
                                Department:{" "}
                                <strong>
                                    {data.mentor.department || "-"}
                                </strong>
                            </span>

                            <span>
                                Mentor ID:{" "}
                                <strong>
                                    {data.mentor.id}
                                </strong>
                            </span>
                        </div>
                    </div>
                </section>
            )}

            <section style={statsGrid}>
                <Stat
                    icon="👨‍🎓"
                    label="Students"
                    value={data.summary.students || 0}
                />

                <Stat
                    icon="📝"
                    label="Mentor Notes"
                    value={data.summary.notes || 0}
                />

                <Stat
                    icon="🤝"
                    label="Activities"
                    value={data.summary.activities || 0}
                />

                <Stat
                    icon="🔔"
                    label="Parent Alerts"
                    value={data.summary.parent_alerts || 0}
                />

                <Stat
                    icon="📅"
                    label="Follow-ups"
                    value={data.summary.followups || 0}
                />

                <Stat
                    icon="🎯"
                    label="Interventions"
                    value={data.summary.interventions || 0}
                />
            </section>

            <div style={toolbar}>
                <div style={tabList}>
                    {[
                        ["students", "👨‍🎓 Students"],
                        ["notes", "📝 Notes"],
                        ["activities", "🤝 Activities"],
                        ["parentAlerts", "🔔 Parent Alerts"],
                        ["followups", "📅 Follow-ups"],
                        ["interventions", "🎯 Interventions"],
                    ].map(([key, label]) => (
                        <button
                            key={key}
                            style={
                                activeTab === key
                                    ? activeTabButton
                                    : tabButton
                            }
                            onClick={() => setActiveTab(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <input
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    placeholder="Search student, USN, activity..."
                    style={searchInput}
                />
            </div>

            {activeTab === "students" && (
                <Section title="Assigned Students">
                    <div style={tableWrap}>
                        <table style={table}>
                            <thead>
                                <tr>
                                    <th style={th}>Student</th>
                                    <th style={th}>USN</th>
                                    <th style={th}>Department</th>
                                    <th style={th}>Semester</th>
                                    <th style={th}>CGPA</th>
                                    <th style={th}>Attendance</th>
                                    <th style={th}>Backlogs</th>
                                    <th style={th}>Risk</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredStudents.map((student) => (
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
                                            {student.branch || "-"}
                                        </td>

                                        <td style={td}>
                                            {student.semester || "-"}
                                        </td>

                                        <td style={td}>
                                            {student.cgpa ?? "-"}
                                        </td>

                                        <td style={td}>
                                            {student.attendance != null
                                                ? `${student.attendance}%`
                                                : "-"}
                                        </td>

                                        <td style={td}>
                                            {student.backlogs ?? 0}
                                        </td>

                                        <td style={td}>
                                            <span style={riskBadge(student.risk_status)}>
                                                {student.risk_status || "Not Available"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredStudents.length === 0 && (
                            <Empty text="No students found." />
                        )}
                    </div>
                </Section>
            )}

            {activeTab === "notes" && (
                <Section
                    title="Mentor Notes"
                    count={filteredNotes.length}
                >
                    <div style={tableWrap}>
                        <table style={table}>
                            <thead>
                                <tr>
                                    <th style={th}>Student</th>
                                    <th style={th}>Note</th>
                                    <th style={th}>Created</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredNotes.map((item) => (
                                    <tr key={item.id}>
                                        <td style={td}>
                                            {item.student_name}
                                            <div style={sub}>
                                                {item.student_usn}
                                            </div>
                                        </td>

                                        <td style={td}>
                                            {item.note || "-"}
                                        </td>

                                        <td style={td}>
                                            {formatDate(item.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredNotes.length === 0 && (
                            <Empty text="No mentor notes found." />
                        )}
                    </div>
                </Section>
            )}

            {activeTab === "activities" && (
                <Section
                    title="Mentoring Activities"
                    count={filteredActivities.length}
                >
                    <div style={tableWrap}>
                        <table style={table}>
                            <thead>
                                <tr>
                                    <th style={th}>Student</th>
                                    <th style={th}>Activity Type</th>
                                    <th style={th}>Description</th>
                                    <th style={th}>Date</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredActivities.map((item) => (
                                    <tr key={item.id}>
                                        <td style={td}>
                                            {item.student_name}
                                            <div style={sub}>
                                                {item.student_usn}
                                            </div>
                                        </td>

                                        <td style={td}>
                                            <span style={tag}>
                                                {item.activity_type || "Activity"}
                                            </span>
                                        </td>

                                        <td style={td}>
                                            {item.description || "-"}
                                        </td>

                                        <td style={td}>
                                            {formatDate(item.activity_date)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredActivities.length === 0 && (
                            <Empty text="No mentoring activities found." />
                        )}
                    </div>
                </Section>
            )}

            {activeTab === "parentAlerts" && (
                <Section
                    title="Parent Alerts"
                    count={filteredParentAlerts.length}
                >
                    <div style={tableWrap}>
                        <table style={table}>
                            <thead>
                                <tr>
                                    <th style={th}>Student</th>
                                    <th style={th}>Alert Type</th>
                                    <th style={th}>Priority</th>
                                    <th style={th}>Message</th>
                                    <th style={th}>Follow-up Date</th>
                                    <th style={th}>Created</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredParentAlerts.map((item) => {
                                    const description =
                                        item.description || "";

                                    const getField = (field) => {
                                        const line = description
                                            .split("\n")
                                            .find((part) =>
                                                part.startsWith(
                                                    `${field}:`
                                                )
                                            );

                                        return line
                                            ? line
                                                  .substring(
                                                      field.length + 1
                                                  )
                                                  .trim()
                                            : "-";
                                    };

                                    return (
                                        <tr key={item.id}>
                                            <td style={td}>
                                                {item.student_name}
                                                <div style={sub}>
                                                    {item.student_usn}
                                                </div>
                                            </td>

                                            <td style={td}>
                                                <span style={tag}>
                                                    {getField(
                                                        "Alert Type"
                                                    )}
                                                </span>
                                            </td>

                                            <td style={td}>
                                                <span
                                                    style={{
                                                        ...badge,
                                                        ...priorityStyle(
                                                            getField(
                                                                "Priority"
                                                            )
                                                        ),
                                                    }}
                                                >
                                                    {getField(
                                                        "Priority"
                                                    )}
                                                </span>
                                            </td>

                                            <td style={td}>
                                                {getField("Message")}
                                            </td>

                                            <td style={td}>
                                                {getField(
                                                    "Follow-up Date"
                                                )}
                                            </td>

                                            <td style={td}>
                                                {formatDate(
                                                    item.activity_date
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {filteredParentAlerts.length === 0 && (
                            <Empty text="No parent alerts found." />
                        )}
                    </div>
                </Section>
            )}

            {activeTab === "followups" && (
                <Section
                    title="Follow-ups"
                    count={filteredFollowups.length}
                >
                    <div style={tableWrap}>
                        <table style={table}>
                            <thead>
                                <tr>
                                    <th style={th}>Student</th>
                                    <th style={th}>Follow-up Date</th>
                                    <th style={th}>Purpose</th>
                                    <th style={th}>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredFollowups.map((item) => (
                                    <tr key={item.id}>
                                        <td style={td}>
                                            {item.student_name}
                                            <div style={sub}>
                                                {item.student_usn}
                                            </div>
                                        </td>

                                        <td style={td}>
                                            {formatDate(
                                                item.follow_up_date
                                            )}
                                        </td>

                                        <td style={td}>
                                            {item.purpose || "-"}
                                        </td>

                                        <td style={td}>
                                            <span
                                                style={{
                                                    ...badge,
                                                    ...statusStyle(
                                                        item.status
                                                    ),
                                                }}
                                            >
                                                {item.status || "Pending"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredFollowups.length === 0 && (
                            <Empty text="No follow-ups found." />
                        )}
                    </div>
                </Section>
            )}

            {activeTab === "interventions" && (
                <Section
                    title="Interventions"
                    count={filteredInterventions.length}
                >
                    <div style={tableWrap}>
                        <table style={table}>
                            <thead>
                                <tr>
                                    <th style={th}>Student</th>
                                    <th style={th}>Intervention</th>
                                    <th style={th}>Priority</th>
                                    <th style={th}>Status</th>
                                    <th style={th}>Target Date</th>
                                    <th style={th}>Outcome</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredInterventions.map((item) => (
                                    <tr key={item.id}>
                                        <td style={td}>
                                            {item.student_name}
                                            <div style={sub}>
                                                {item.student_usn}
                                            </div>
                                        </td>

                                        <td style={td}>
                                            <strong>
                                                {item.intervention_type ||
                                                    "Intervention"}
                                            </strong>

                                            <div style={sub}>
                                                {item.description || "-"}
                                            </div>
                                        </td>

                                        <td style={td}>
                                            <span
                                                style={{
                                                    ...badge,
                                                    ...priorityStyle(
                                                        item.priority
                                                    ),
                                                }}
                                            >
                                                {item.priority || "Medium"}
                                            </span>
                                        </td>

                                        <td style={td}>
                                            <span
                                                style={{
                                                    ...badge,
                                                    ...statusStyle(
                                                        item.status
                                                    ),
                                                }}
                                            >
                                                {item.status || "Planned"}
                                            </span>
                                        </td>

                                        <td style={td}>
                                            {formatDateOnly(
                                                item.target_date
                                            )}
                                        </td>

                                        <td style={td}>
                                            {item.outcome || "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredInterventions.length === 0 && (
                            <Empty text="No interventions found." />
                        )}
                    </div>
                </Section>
            )}
        </div>
    );
}

function Section({ title, count, children }) {
    return (
        <section style={sectionCard}>
            <div style={sectionHeader}>
                <h2 style={{ margin: 0, color: "#0f172a" }}>
                    {title}
                </h2>

                {count !== undefined && (
                    <span style={countBadge}>
                        {count}
                    </span>
                )}
            </div>

            {children}
        </section>
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

function Empty({ text }) {
    return <div style={empty}>{text}</div>;
}

const riskBadge = (risk) => {
    if (risk === "High Risk") {
        return {
            ...badge,
            background: "#fee2e2",
            color: "#b91c1c",
        };
    }

    if (risk === "Medium Risk") {
        return {
            ...badge,
            background: "#fef3c7",
            color: "#92400e",
        };
    }

    if (risk === "Low Risk") {
        return {
            ...badge,
            background: "#dcfce7",
            color: "#166534",
        };
    }

    return {
        ...badge,
        background: "#f1f5f9",
        color: "#475569",
    };
};

const statusStyle = (status) => {
    if (status === "Completed") {
        return {
            background: "#dcfce7",
            color: "#166534",
        };
    }

    if (status === "In Progress") {
        return {
            background: "#dbeafe",
            color: "#1d4ed8",
        };
    }

    if (status === "Cancelled") {
        return {
            background: "#f1f5f9",
            color: "#475569",
        };
    }

    return {
        background: "#fef3c7",
        color: "#92400e",
    };
};

const priorityStyle = (priority) => {
    if (priority === "High") {
        return {
            background: "#fee2e2",
            color: "#b91c1c",
        };
    }

    if (priority === "Low") {
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

const pageStyle = {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: 28,
    fontFamily: "Inter, Arial, sans-serif",
    color: "#334155",
};

const headerStyle = {
    maxWidth: 1450,
    margin: "0 auto 22px",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: "24px 26px",
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "center",
    boxShadow: "0 8px 25px rgba(15,23,42,0.05)",
};

const eyebrowStyle = {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.5,
    color: "#2563eb",
};

const titleStyle = {
    margin: "5px 0 4px",
    color: "#0f172a",
};

const subtitleStyle = {
    margin: 0,
    color: "#64748b",
};

const headerActionsStyle = {
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

const dangerButton = {
    border: 0,
    borderRadius: 10,
    padding: "10px 16px",
    background: "#ef4444",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
};

const errorStyle = {
    maxWidth: 1450,
    margin: "0 auto 18px",
    padding: 14,
    borderRadius: 12,
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
};

const mentorCard = {
    maxWidth: 1450,
    margin: "0 auto 20px",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: 22,
    display: "flex",
    gap: 18,
    alignItems: "center",
    boxShadow: "0 5px 18px rgba(15,23,42,0.04)",
};

const mentorAvatar = {
    width: 64,
    height: 64,
    borderRadius: 16,
    background: "#eff6ff",
    display: "grid",
    placeItems: "center",
    fontSize: 30,
};

const mutedText = {
    margin: "5px 0",
    color: "#64748b",
};

const mentorMeta = {
    display: "flex",
    gap: 22,
    flexWrap: "wrap",
    marginTop: 10,
    fontSize: 13,
    color: "#64748b",
};

const statsGrid = {
    maxWidth: 1450,
    margin: "0 auto 20px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: 14,
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
    marginTop: 2,
};

const toolbar = {
    maxWidth: 1450,
    margin: "0 auto 20px",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 14,
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    flexWrap: "wrap",
};

const tabList = {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
};

const tabButton = {
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "9px 13px",
    background: "white",
    color: "#475569",
    fontWeight: 700,
    cursor: "pointer",
};

const activeTabButton = {
    ...tabButton,
    background: "#2563eb",
    borderColor: "#2563eb",
    color: "white",
};

const searchInput = {
    minWidth: 280,
    flex: 1,
    maxWidth: 390,
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    padding: "10px 13px",
    outline: "none",
};

const sectionCard = {
    maxWidth: 1450,
    margin: "0 auto 20px",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 5px 18px rgba(15,23,42,0.04)",
};

const sectionHeader = {
    padding: "18px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e2e8f0",
};

const countBadge = {
    minWidth: 34,
    height: 34,
    padding: "0 10px",
    borderRadius: 18,
    background: "#eff6ff",
    color: "#1d4ed8",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
};

const tableWrap = {
    overflowX: "auto",
};

const table = {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 900,
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
    color: "#334155",
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

const badge = {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
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

export default AdminMentorActivityDetails;
