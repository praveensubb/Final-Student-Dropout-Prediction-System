import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

const TABS = [
    { key: "all", label: "All Activities", icon: "📋" },
    { key: "notes", label: "Mentor Notes", icon: "📝" },
    { key: "activities", label: "Mentoring Activities", icon: "🤝" },
    { key: "followups", label: "Follow-ups", icon: "📅" },
    { key: "interventions", label: "Interventions", icon: "🎯" },
    { key: "parentAlerts", label: "Parent Alerts", icon: "🔔" },
];

const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const statusStyle = (status) => {
    if (status === "Completed") {
        return { background: "#dcfce7", color: "#166534" };
    }
    if (status === "In Progress") {
        return { background: "#dbeafe", color: "#1d4ed8" };
    }
    if (status === "Cancelled") {
        return { background: "#f1f5f9", color: "#475569" };
    }
    return { background: "#fef3c7", color: "#92400e" };
};

const priorityStyle = (priority) => {
    if (priority === "High") {
        return { background: "#fee2e2", color: "#b91c1c" };
    }
    if (priority === "Low") {
        return { background: "#dcfce7", color: "#166534" };
    }
    return { background: "#fef3c7", color: "#92400e" };
};

function AdminMentorActivities() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        total_notes: 0,
        total_activities: 0,
        total_followups: 0,
        total_interventions: 0,
        total_mentor_activities: 0,
        mentor_count: 0,
        notes: [],
        activities: [],
        followups: [],
        interventions: [],
        parentAlerts: [],
    });
    const [activeTab, setActiveTab] = useState("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadActivities = async (showRefresh = false) => {
        try {
            if (showRefresh) setRefreshing(true);
            else setLoading(true);
            setError("");

            const response = await fetch(`${API_URL}/admin/mentor-activities`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.detail || "Unable to load mentor activities.");
            }

            setData({
                total_notes: result.total_notes || 0,
                total_activities: result.total_activities || 0,
                total_followups: result.total_followups || 0,
                total_interventions: result.total_interventions || 0,
                total_mentor_activities: result.total_mentor_activities || 0,
                mentor_count: result.mentor_count || 0,
                notes: Array.isArray(result.notes) ? result.notes : [],
                activities: Array.isArray(result.activities) ? result.activities : [],
                followups: Array.isArray(result.followups) ? result.followups : [],
                interventions: Array.isArray(result.interventions) ? result.interventions : [],
                parentAlerts: (Array.isArray(result.activities) ? result.activities : []).filter(
                    (item) => String(item.activity_type || "").toLowerCase() === "parent alert"
                ),
            });
        } catch (err) {
            console.error("Admin mentor activity error:", err);
            setError(err.message || "Unable to load mentor activities.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadActivities();
    }, []);

    const matchesSearch = (item) => {
        const value = search.trim().toLowerCase();
        if (!value) return true;

        return [
            item.mentor_name,
            item.mentor_email,
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

    const filtered = useMemo(() => {
        return {
            notes: data.notes.filter(matchesSearch),
            activities: data.activities.filter(matchesSearch),
            followups: data.followups.filter(matchesSearch),
            interventions: data.interventions.filter(matchesSearch),
            parentAlerts: data.parentAlerts.filter(matchesSearch),
        };
    }, [data, search]);

    const renderStudent = (item) => (
        <div>
            <strong style={{ color: "#0f172a" }}>{item.student_name || "Unknown Student"}</strong>
            {item.student_usn && (
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                    {item.student_usn}
                </div>
            )}
        </div>
    );

    const renderMentor = (item) => (
        <div>
            <strong style={{ color: "#0f172a" }}>
                {item.mentor_name || "Unknown Mentor"}
            </strong>

            {item.mentor_email && (
                <div style={sub}>{item.mentor_email}</div>
            )}

            {item.mentor_id && (
                <button
                    type="button"
                    style={viewDetailsButton}
                    onClick={() =>
                        navigate(
                            `/admin/mentor-activities/mentor/${item.mentor_id}`
                        )
                    }
                >
                    View Details
                </button>
            )}
        </div>
    );

    const renderNotes = () => (
        <div style={tableWrap}>
            <table style={table}>
                <thead>
                    <tr>
                        <th style={th}>Mentor</th>
                        <th style={th}>Student</th>
                        <th style={th}>Note</th>
                        <th style={th}>Created</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.notes.map((item) => (
                        <tr key={`note-${item.id}`}>
                            <td style={td}>{renderMentor(item)}</td>
                            <td style={td}>{renderStudent(item)}</td>
                            <td style={td}>{item.note || "-"}</td>
                            <td style={td}>{formatDate(item.created_at)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filtered.notes.length === 0 && <Empty text="No mentor notes found." />}
        </div>
    );

    const renderActivities = () => (
        <div style={tableWrap}>
            <table style={table}>
                <thead>
                    <tr>
                        <th style={th}>Mentor</th>
                        <th style={th}>Student</th>
                        <th style={th}>Activity Type</th>
                        <th style={th}>Description</th>
                        <th style={th}>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.activities.map((item) => (
                        <tr key={`activity-${item.id}`}>
                            <td style={td}>{renderMentor(item)}</td>
                            <td style={td}>{renderStudent(item)}</td>
                            <td style={td}><span style={tag}>{item.activity_type || "Activity"}</span></td>
                            <td style={td}>{item.description || "-"}</td>
                            <td style={td}>{formatDate(item.activity_date)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filtered.activities.length === 0 && <Empty text="No mentoring activities found." />}
        </div>
    );

    const renderParentAlerts = () => (
        <div style={tableWrap}>
            <table style={table}>
                <thead>
                    <tr>
                        <th style={th}>Mentor</th>
                        <th style={th}>Student</th>
                        <th style={th}>Alert Type</th>
                        <th style={th}>Priority</th>
                        <th style={th}>Message</th>
                        <th style={th}>Follow-up Date</th>
                        <th style={th}>Created</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.parentAlerts.map((item) => {
                        const description = item.description || "";
                        const getField = (field) => {
                            const line = description.split("\n").find((part) =>
                                part.startsWith(`${field}:`)
                            );
                            return line ? line.substring(field.length + 1).trim() : "-";
                        };

                        return (
                            <tr key={`parent-alert-${item.id}`}>
                                <td style={td}>
                                    {item.mentor_name}
                                    <div style={sub}>{item.mentor_email}</div>
                                </td>
                                <td style={td}>{renderStudent(item)}</td>
                                <td style={td}>
                                    <span style={tag}>
                                        {getField("Alert Type")}
                                    </span>
                                </td>
                                <td style={td}>
                                    <span
                                        style={{
                                            ...badge,
                                            ...priorityStyle(getField("Priority")),
                                        }}
                                    >
                                        {getField("Priority")}
                                    </span>
                                </td>
                                <td style={td}>
                                    {getField("Message")}
                                </td>
                                <td style={td}>
                                    {getField("Follow-up Date")}
                                </td>
                                <td style={td}>
                                    {formatDate(item.activity_date)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {filtered.parentAlerts.length === 0 && (
                <Empty text="No parent alerts found." />
            )}
        </div>
    );

    const renderFollowups = () => (
        <div style={tableWrap}>
            <table style={table}>
                <thead>
                    <tr>
                        <th style={th}>Mentor</th>
                        <th style={th}>Student</th>
                        <th style={th}>Follow-up Date</th>
                        <th style={th}>Purpose</th>
                        <th style={th}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.followups.map((item) => (
                        <tr key={`followup-${item.id}`}>
                            <td style={td}>{renderMentor(item)}</td>
                            <td style={td}>{renderStudent(item)}</td>
                            <td style={td}>{formatDate(item.follow_up_date)}</td>
                            <td style={td}>{item.purpose || "-"}</td>
                            <td style={td}><span style={{ ...badge, ...statusStyle(item.status) }}>{item.status || "Pending"}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filtered.followups.length === 0 && <Empty text="No follow-ups found." />}
        </div>
    );

    const renderInterventions = () => (
        <div style={tableWrap}>
            <table style={table}>
                <thead>
                    <tr>
                        <th style={th}>Mentor</th>
                        <th style={th}>Student</th>
                        <th style={th}>Intervention</th>
                        <th style={th}>Priority</th>
                        <th style={th}>Status</th>
                        <th style={th}>Target Date</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.interventions.map((item) => (
                        <tr key={`intervention-${item.id}`}>
                            <td style={td}>{renderMentor(item)}</td>
                            <td style={td}>{renderStudent(item)}</td>
                            <td style={td}><strong>{item.intervention_type || "Intervention"}</strong><div style={sub}>{item.description || "-"}</div></td>
                            <td style={td}><span style={{ ...badge, ...priorityStyle(item.priority) }}>{item.priority || "Medium"}</span></td>
                            <td style={td}><span style={{ ...badge, ...statusStyle(item.status) }}>{item.status || "Planned"}</span></td>
                            <td style={td}>{item.target_date ? formatDate(item.target_date) : "-"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filtered.interventions.length === 0 && <Empty text="No interventions found." />}
        </div>
    );

    const renderSection = (title, count, content) => (
        <section style={sectionCard}>
            <div style={sectionHeader}>
                <div>
                    <h2 style={{ margin: 0, color: "#0f172a", fontSize: 20 }}>{title}</h2>
                    <p style={{ margin: "5px 0 0", color: "#64748b", fontSize: 13 }}>
                        Mentor-side activity monitoring
                    </p>
                </div>
                <span style={countBadge}>{count}</span>
            </div>
            {content}
        </section>
    );

    if (loading) {
        return (
            <div style={page}>
                <div style={loadingCard}>
                    <div style={{ fontSize: 44 }}>👨‍🏫</div>
                    <h2>Loading Mentor Activity Monitoring</h2>
                    <p style={{ color: "#64748b" }}>Fetching notes, activities, follow-ups and interventions...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={page}>
            <header style={header}>
                <div>
                    <div style={eyebrow}>ADMIN CONTROL CENTER</div>
                    <h1 style={{ margin: "5px 0 4px", color: "#0f172a" }}>Mentor Activity Monitoring</h1>
                    <p style={{ margin: 0, color: "#64748b" }}>
                        Monitor mentor notes, mentoring activities, follow-ups and interventions.
                    </p>
                </div>
                <div style={headerActions}>
                    <button style={secondaryButton} onClick={() => navigate("/admin")}>← Dashboard</button>
                    <button style={primaryButton} onClick={() => loadActivities(true)} disabled={refreshing}>
                        {refreshing ? "Refreshing..." : "↻ Refresh"}
                    </button>
                    <button
                        style={dangerButton}
                        onClick={() => {
                            localStorage.removeItem("adminToken");
                            localStorage.removeItem("adminEmail");
                            localStorage.removeItem("adminName");
                            navigate("/admin-login");
                        }}
                    >
                        Logout
                    </button>
                </div>
            </header>

            {error && (
                <div style={errorBox}>
                    ⚠️ {error}
                </div>
            )}

            <div style={statsGrid}>
                <Stat icon="👨‍🏫" label="Mentors" value={data.mentor_count} />
                <Stat icon="📝" label="Mentor Notes" value={data.total_notes} />
                <Stat icon="🤝" label="Mentoring Activities" value={data.total_activities} />
                <Stat icon="📅" label="Follow-ups" value={data.total_followups} />
                <Stat icon="🎯" label="Interventions" value={data.total_interventions} />
                <Stat icon="🔔" label="Parent Alerts" value={data.parentAlerts.length} />
            </div>

            <div style={toolbar}>
                <div style={tabList}>
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={activeTab === tab.key ? activeTabButton : tabButton}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search mentor, student, USN, activity..."
                    style={searchInput}
                />
            </div>

            {activeTab === "all" && (
                <>
                    {renderSection("Mentor Notes", filtered.notes.length, renderNotes())}
                    {renderSection("Mentoring Activities", filtered.activities.length, renderActivities())}
                    {renderSection("Follow-ups", filtered.followups.length, renderFollowups())}
                    {renderSection("Interventions", filtered.interventions.length, renderInterventions())}
                    {renderSection("Parent Alerts", filtered.parentAlerts.length, renderParentAlerts())}
                </>
            )}
            {activeTab === "notes" && renderSection("Mentor Notes", filtered.notes.length, renderNotes())}
            {activeTab === "activities" && renderSection("Mentoring Activities", filtered.activities.length, renderActivities())}
            {activeTab === "followups" && renderSection("Follow-ups", filtered.followups.length, renderFollowups())}
            {activeTab === "interventions" && renderSection("Interventions", filtered.interventions.length, renderInterventions())}
            {activeTab === "parentAlerts" && renderSection("Parent Alerts", filtered.parentAlerts.length, renderParentAlerts())}

            <div style={footerNote}>
                <strong>Scope:</strong> This page monitors mentor-side work only. Faculty attendance activity is monitored separately.
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

function Empty({ text }) {
    return <div style={empty}>{text}</div>;
}

const page = {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "28px",
    fontFamily: "Inter, Arial, sans-serif",
    color: "#334155",
};
const header = {
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
const eyebrow = { fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: "#2563eb" };
const headerActions = { display: "flex", gap: 10, flexWrap: "wrap" };
const primaryButton = { border: 0, borderRadius: 10, padding: "10px 16px", background: "#2563eb", color: "white", fontWeight: 700, cursor: "pointer" };
const secondaryButton = { border: "1px solid #cbd5e1", borderRadius: 10, padding: "10px 16px", background: "white", color: "#334155", fontWeight: 700, cursor: "pointer" };
const dangerButton = { border: 0, borderRadius: 10, padding: "10px 16px", background: "#ef4444", color: "white", fontWeight: 700, cursor: "pointer" };
const errorBox = { maxWidth: 1450, margin: "0 auto 18px", padding: 14, borderRadius: 12, background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" };
const statsGrid = { maxWidth: 1450, margin: "0 auto 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14 };
const statCard = { background: "white", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 5px 18px rgba(15,23,42,0.04)" };
const statIcon = { width: 48, height: 48, borderRadius: 12, background: "#eff6ff", display: "grid", placeItems: "center", fontSize: 23 };
const statValue = { fontSize: 25, fontWeight: 800, color: "#0f172a" };
const statLabel = { fontSize: 13, color: "#64748b", marginTop: 2 };
const toolbar = { maxWidth: 1450, margin: "0 auto 20px", background: "white", border: "1px solid #e2e8f0", borderRadius: 16, padding: 14, display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" };
const tabList = { display: "flex", gap: 8, flexWrap: "wrap" };
const tabButton = { border: "1px solid #e2e8f0", borderRadius: 10, padding: "9px 13px", background: "white", color: "#475569", fontWeight: 700, cursor: "pointer" };
const activeTabButton = { ...tabButton, background: "#2563eb", borderColor: "#2563eb", color: "white" };
const searchInput = { minWidth: 280, flex: 1, maxWidth: 390, border: "1px solid #cbd5e1", borderRadius: 10, padding: "10px 13px", outline: "none" };
const sectionCard = { maxWidth: 1450, margin: "0 auto 20px", background: "white", border: "1px solid #e2e8f0", borderRadius: 18, overflow: "hidden", boxShadow: "0 5px 18px rgba(15,23,42,0.04)" };
const sectionHeader = { padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0" };
const countBadge = { minWidth: 34, height: 34, padding: "0 10px", borderRadius: 18, background: "#eff6ff", color: "#1d4ed8", display: "grid", placeItems: "center", fontWeight: 800 };
const tableWrap = { overflowX: "auto" };
const table = { width: "100%", borderCollapse: "collapse", minWidth: 850 };
const th = { textAlign: "left", padding: "13px 15px", fontSize: 12, color: "#64748b", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" };
const td = { padding: "14px 15px", borderBottom: "1px solid #f1f5f9", verticalAlign: "top", fontSize: 13, color: "#334155" };
const sub = { marginTop: 4, fontSize: 11, color: "#94a3b8" };
const tag = { display: "inline-block", padding: "5px 9px", borderRadius: 999, background: "#eef2ff", color: "#4338ca", fontSize: 11, fontWeight: 800 };
const badge = { display: "inline-block", padding: "5px 9px", borderRadius: 999, fontSize: 11, fontWeight: 800 };
const empty = { padding: 28, textAlign: "center", color: "#94a3b8" };
const loadingCard = { maxWidth: 500, margin: "120px auto", background: "white", border: "1px solid #e2e8f0", borderRadius: 18, padding: 35, textAlign: "center", boxShadow: "0 8px 25px rgba(15,23,42,0.06)" };
const viewDetailsButton = {
    marginTop: 7,
    border: "1px solid #bfdbfe",
    borderRadius: 7,
    padding: "5px 9px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
};

const footerNote = { maxWidth: 1450, margin: "4px auto 30px", padding: 14, borderRadius: 12, background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af", fontSize: 13 };

export default AdminMentorActivities;
