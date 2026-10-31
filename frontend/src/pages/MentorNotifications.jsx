import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

export default function MentorNotifications() {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const mentorId = localStorage.getItem("mentorId");
    const mentorName = localStorage.getItem("mentorName") || "Mentor";
    const mentorDepartment =
        localStorage.getItem("mentorDepartment") || "CSE";

    const loadNotifications = async () => {
        if (!mentorId) {
            setError("Mentor session not found. Please login again.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/mentor/notifications?mentor_id=${mentorId}`
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(
                    data.detail || "Failed to load notifications"
                );
            }

            const data = await response.json();
            setNotifications(data.notifications || []);
        } catch (err) {
            setError(err.message || "Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const markAsRead = async (notificationId) => {
        if (!mentorId) return;

        try {
            setActionLoading(true);

            const response = await fetch(
                `${API_URL}/mentor/notifications/${notificationId}/read?mentor_id=${mentorId}`,
                {
                    method: "PUT",
                }
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(
                    data.detail || "Failed to mark notification as read"
                );
            }

            setNotifications((previous) =>
                previous.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, is_read: true }
                        : notification
                )
            );
        } catch (err) {
            setError(err.message || "Failed to update notification");
        } finally {
            setActionLoading(false);
        }
    };

    const markAllAsRead = async () => {
        if (!mentorId) return;

        const hasUnread = notifications.some(
            (notification) => !notification.is_read
        );

        if (!hasUnread) return;

        try {
            setActionLoading(true);

            const response = await fetch(
                `${API_URL}/mentor/notifications/read-all?mentor_id=${mentorId}`,
                {
                    method: "PUT",
                }
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(
                    data.detail || "Failed to mark all notifications as read"
                );
            }

            setNotifications((previous) =>
                previous.map((notification) => ({
                    ...notification,
                    is_read: true,
                }))
            );
        } catch (err) {
            setError(err.message || "Failed to update notifications");
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (value) => {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getPriorityStyle = (priority) => {
        const value = String(priority || "").toLowerCase();

        if (value === "high") {
            return {
                background: "#fee2e2",
                color: "#b91c1c",
                border: "1px solid #fecaca",
            };
        }

        if (value === "medium") {
            return {
                background: "#fef3c7",
                color: "#b45309",
                border: "1px solid #fde68a",
            };
        }

        return {
            background: "#dcfce7",
            color: "#15803d",
            border: "1px solid #bbf7d0",
        };
    };

    const getTypeIcon = (type) => {
        const value = String(type || "").toLowerCase();

        if (value.includes("high")) return "🚨";
        if (value.includes("medium")) return "⚠️";
        if (value.includes("follow")) return "📅";
        if (value.includes("intervention")) return "🎯";
        if (value.includes("attendance")) return "📊";
        return "🔔";
    };

    const filteredNotifications = useMemo(() => {
        const query = search.trim().toLowerCase();

        return notifications.filter((notification) => {
            const priority = String(
                notification.priority || ""
            ).toLowerCase();

            const isRead = Boolean(notification.is_read);

            if (filter === "unread" && isRead) return false;
            if (filter === "high" && priority !== "high") return false;
            if (filter === "medium" && priority !== "medium") return false;
            if (filter === "low" && priority !== "low") return false;

            if (!query) return true;

            const searchableText = [
                notification.title,
                notification.message,
                notification.notification_type,
                notification.student_name,
                notification.student_usn,
                notification.priority,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(query);
        });
    }, [notifications, search, filter]);

    const totalCount = notifications.length;
    const unreadCount = notifications.filter(
        (notification) => !notification.is_read
    ).length;
    const highCount = notifications.filter(
        (notification) =>
            String(notification.priority || "").toLowerCase() === "high"
    ).length;
    const mediumCount = notifications.filter(
        (notification) =>
            String(notification.priority || "").toLowerCase() === "medium"
    ).length;

    const logout = () => {
        localStorage.removeItem("mentorToken");
        localStorage.removeItem("mentorEmail");
        localStorage.removeItem("mentorId");
        localStorage.removeItem("mentorName");
        localStorage.removeItem("mentorDepartment");

        navigate("/mentor-login");
    };

    return (
        <div style={pageStyle}>
            <header style={headerStyle}>
                <div>
                    <div style={brandStyle}>🎓 Mentor Portal</div>
                    <div style={subtitleStyle}>
                        Student Dropout Prediction & Mentoring System
                    </div>
                </div>

                <div style={headerRightStyle}>
                    <div style={mentorInfoStyle}>
                        <strong>{mentorName}</strong>
                        <span>{mentorDepartment}</span>
                    </div>

                    <button
                        style={navButtonStyle}
                        onClick={() => navigate("/mentor-dashboard")}
                    >
                        🏠 Dashboard
                    </button>

                    <button
                        style={navButtonStyle}
                        onClick={() => navigate("/mentor/mentoring")}
                    >
                        👥 Mentoring
                    </button>

                    <button
                        style={navButtonStyle}
                        onClick={() =>
                            navigate("/mentor/student-monitoring")
                        }
                    >
                        📋 Monitoring
                    </button>

                    <button
                        style={navButtonStyle}
                        onClick={() => navigate("/mentor/reports")}
                    >
                        📊 Reports
                    </button>

                    <button style={logoutButtonStyle} onClick={logout}>
                        Logout
                    </button>
                </div>
            </header>

            <main style={containerStyle}>
                <div style={titleRowStyle}>
                    <div>
                        <h1 style={titleStyle}>🔔 Mentor Notifications</h1>
                        <p style={descriptionStyle}>
                            View automatic alerts for assigned students,
                            follow-ups and interventions.
                        </p>
                    </div>

                    <button
                        style={refreshButtonStyle}
                        onClick={loadNotifications}
                        disabled={loading}
                    >
                        🔄 {loading ? "Loading..." : "Refresh"}
                    </button>
                </div>

                {error && (
                    <div style={errorStyle}>
                        <span>⚠️ {error}</span>
                        <button
                            style={errorButtonStyle}
                            onClick={loadNotifications}
                        >
                            Retry
                        </button>
                    </div>
                )}

                <section style={statsGridStyle}>
                    <StatCard
                        icon="🔔"
                        title="Total Notifications"
                        value={totalCount}
                        description="All alerts"
                        background="#eff6ff"
                        border="#bfdbfe"
                    />

                    <StatCard
                        icon="📩"
                        title="Unread"
                        value={unreadCount}
                        description="Need attention"
                        background="#fefce8"
                        border="#fde68a"
                    />

                    <StatCard
                        icon="🚨"
                        title="High Priority"
                        value={highCount}
                        description="Priority alerts"
                        background="#fef2f2"
                        border="#fecaca"
                    />

                    <StatCard
                        icon="⚠️"
                        title="Medium Priority"
                        value={mediumCount}
                        description="Medium alerts"
                        background="#fff7ed"
                        border="#fed7aa"
                    />
                </section>

                <section style={toolbarStyle}>
                    <div style={searchWrapperStyle}>
                        <span style={searchIconStyle}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search notifications, students, USN..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            style={searchInputStyle}
                        />
                    </div>

                    <div style={filterGroupStyle}>
                        {[
                            ["all", "All"],
                            ["unread", "Unread"],
                            ["high", "High"],
                            ["medium", "Medium"],
                            ["low", "Low"],
                        ].map(([value, label]) => (
                            <button
                                key={value}
                                onClick={() => setFilter(value)}
                                style={
                                    filter === value
                                        ? activeFilterStyle
                                        : filterButtonStyle
                                }
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <button
                        style={markAllButtonStyle}
                        onClick={markAllAsRead}
                        disabled={actionLoading || unreadCount === 0}
                    >
                        ✓ Mark All Read
                    </button>
                </section>

                <div style={resultCountStyle}>
                    Showing {filteredNotifications.length} of {totalCount}{" "}
                    notification{totalCount === 1 ? "" : "s"}
                </div>

                <section>
                    {loading ? (
                        <div style={emptyStateStyle}>
                            <div style={loadingIconStyle}>⏳</div>
                            <h3>Loading notifications...</h3>
                            <p>Please wait while the latest alerts are loaded.</p>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div style={emptyStateStyle}>
                            <div style={loadingIconStyle}>🔕</div>
                            <h3>No notifications found</h3>
                            <p>
                                {search || filter !== "all"
                                    ? "Try changing the search or filter."
                                    : "There are currently no notifications for your assigned students."}
                            </p>
                        </div>
                    ) : (
                        <div style={notificationListStyle}>
                            {filteredNotifications.map((notification) => {
                                const priorityStyle = getPriorityStyle(
                                    notification.priority
                                );

                                return (
                                    <article
                                        key={notification.id}
                                        style={{
                                            ...notificationCardStyle,
                                            background: notification.is_read
                                                ? "#ffffff"
                                                : "#f8fbff",
                                            borderLeft: notification.is_read
                                                ? "4px solid #e5e7eb"
                                                : "4px solid #2563eb",
                                        }}
                                    >
                                        <div style={notificationTopStyle}>
                                            <div
                                                style={
                                                    notificationIconStyle
                                                }
                                            >
                                                {getTypeIcon(
                                                    notification.notification_type
                                                )}
                                            </div>

                                            <div style={notificationMainStyle}>
                                                <div
                                                    style={
                                                        notificationTitleRowStyle
                                                    }
                                                >
                                                    <div>
                                                        <h3
                                                            style={
                                                                notificationTitleStyle
                                                            }
                                                        >
                                                            {
                                                                notification.title
                                                            }
                                                        </h3>

                                                        <div
                                                            style={
                                                                notificationMetaStyle
                                                            }
                                                        >
                                                            <span>
                                                                {notification.notification_type ||
                                                                    "Notification"}
                                                            </span>

                                                            {notification.student_name && (
                                                                <>
                                                                    <span>
                                                                        •
                                                                    </span>
                                                                    <span>
                                                                        {
                                                                            notification.student_name
                                                                        }
                                                                    </span>
                                                                    {notification.student_usn && (
                                                                        <>
                                                                            <span>
                                                                                •
                                                                            </span>
                                                                            <span>
                                                                                {
                                                                                    notification.student_usn
                                                                                }
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div
                                                        style={{
                                                            ...priorityBadgeStyle,
                                                            ...priorityStyle,
                                                        }}
                                                    >
                                                        {notification.priority ||
                                                            "Medium"}
                                                    </div>
                                                </div>

                                                <p
                                                    style={
                                                        notificationMessageStyle
                                                    }
                                                >
                                                    {notification.message}
                                                </p>

                                                <div
                                                    style={
                                                        notificationBottomStyle
                                                    }
                                                >
                                                    <span
                                                        style={
                                                            notificationDateStyle
                                                        }
                                                    >
                                                        🕒{" "}
                                                        {formatDate(
                                                            notification.created_at
                                                        )}
                                                    </span>

                                                    {notification.is_read ? (
                                                        <span
                                                            style={
                                                                readBadgeStyle
                                                            }
                                                        >
                                                            ✓ Read
                                                        </span>
                                                    ) : (
                                                        <button
                                                            style={
                                                                markReadButtonStyle
                                                            }
                                                            onClick={() =>
                                                                markAsRead(
                                                                    notification.id
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading
                                                            }
                                                        >
                                                            ✓ Mark as Read
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

function StatCard({
    icon,
    title,
    value,
    description,
    background,
    border,
}) {
    return (
        <div
            style={{
                ...statCardStyle,
                background,
                border: `1px solid ${border}`,
            }}
        >
            <div style={statIconStyle}>{icon}</div>
            <div>
                <div style={statTitleStyle}>{title}</div>
                <div style={statValueStyle}>{value}</div>
                <div style={statDescriptionStyle}>{description}</div>
            </div>
        </div>
    );
}

const pageStyle = {
    minHeight: "100vh",
    background:
        "linear-gradient(180deg, #f8fafc 0%, #eef4ff 45%, #f8fafc 100%)",
    color: "#0f172a",
    fontFamily:
        "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
};

const headerStyle = {
    minHeight: "74px",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "14px 28px",
    position: "sticky",
    top: 0,
    zIndex: 20,
    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.05)",
};

const brandStyle = {
    fontSize: "21px",
    fontWeight: 800,
    color: "#1e3a8a",
};

const subtitleStyle = {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "3px",
};

const headerRightStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "8px",
    flexWrap: "wrap",
};

const mentorInfoStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    marginRight: "6px",
    lineHeight: 1.25,
};

const navButtonStyle = {
    border: "1px solid #dbeafe",
    background: "#eff6ff",
    color: "#1d4ed8",
    borderRadius: "8px",
    padding: "9px 12px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "13px",
};

const logoutButtonStyle = {
    border: "none",
    background: "#dc2626",
    color: "#ffffff",
    borderRadius: "8px",
    padding: "9px 13px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "13px",
};

const containerStyle = {
    maxWidth: "1450px",
    margin: "0 auto",
    padding: "28px",
};

const titleRowStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
    marginBottom: "24px",
};

const titleStyle = {
    margin: 0,
    fontSize: "30px",
    fontWeight: 800,
    color: "#0f172a",
};

const descriptionStyle = {
    margin: "7px 0 0",
    color: "#64748b",
    fontSize: "14px",
};

const refreshButtonStyle = {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    borderRadius: "9px",
    padding: "11px 16px",
    cursor: "pointer",
    fontWeight: 700,
};

const errorStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    padding: "13px 16px",
    borderRadius: "10px",
    marginBottom: "18px",
};

const errorButtonStyle = {
    border: "1px solid #fecaca",
    background: "#ffffff",
    color: "#991b1b",
    borderRadius: "7px",
    padding: "7px 12px",
    cursor: "pointer",
    fontWeight: 700,
};

const statsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "22px",
};

const statCardStyle = {
    borderRadius: "14px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow: "0 5px 18px rgba(15, 23, 42, 0.04)",
};

const statIconStyle = {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    flexShrink: 0,
};

const statTitleStyle = {
    color: "#475569",
    fontSize: "12px",
    fontWeight: 700,
};

const statValueStyle = {
    color: "#0f172a",
    fontSize: "27px",
    fontWeight: 800,
    marginTop: "2px",
};

const statDescriptionStyle = {
    color: "#64748b",
    fontSize: "11px",
    marginTop: "1px",
};

const toolbarStyle = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "14px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    boxShadow: "0 5px 18px rgba(15, 23, 42, 0.04)",
};

const searchWrapperStyle = {
    flex: "1 1 280px",
    minWidth: "240px",
    position: "relative",
};

const searchIconStyle = {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "15px",
};

const searchInputStyle = {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #dbe2ea",
    borderRadius: "9px",
    padding: "10px 12px 10px 36px",
    outline: "none",
    fontSize: "13px",
};

const filterGroupStyle = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexWrap: "wrap",
};

const filterButtonStyle = {
    border: "1px solid #dbe2ea",
    background: "#ffffff",
    color: "#475569",
    borderRadius: "8px",
    padding: "9px 11px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "12px",
};

const activeFilterStyle = {
    ...filterButtonStyle,
    background: "#1d4ed8",
    border: "1px solid #1d4ed8",
    color: "#ffffff",
};

const markAllButtonStyle = {
    border: "1px solid #16a34a",
    background: "#f0fdf4",
    color: "#15803d",
    borderRadius: "8px",
    padding: "9px 12px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "12px",
};

const resultCountStyle = {
    margin: "15px 3px 10px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 600,
};

const notificationListStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
};

const notificationCardStyle = {
    border: "1px solid #e5e7eb",
    borderRadius: "13px",
    padding: "17px",
    boxShadow: "0 5px 18px rgba(15, 23, 42, 0.035)",
};

const notificationTopStyle = {
    display: "flex",
    gap: "15px",
};

const notificationIconStyle = {
    width: "46px",
    height: "46px",
    borderRadius: "12px",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    flexShrink: 0,
};

const notificationMainStyle = {
    flex: 1,
    minWidth: 0,
};

const notificationTitleRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "14px",
};

const notificationTitleStyle = {
    margin: 0,
    fontSize: "16px",
    fontWeight: 800,
    color: "#0f172a",
};

const notificationMetaStyle = {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    flexWrap: "wrap",
    marginTop: "5px",
    color: "#64748b",
    fontSize: "11px",
    fontWeight: 600,
};

const priorityBadgeStyle = {
    borderRadius: "999px",
    padding: "5px 9px",
    fontSize: "10px",
    fontWeight: 800,
    textTransform: "uppercase",
    flexShrink: 0,
};

const notificationMessageStyle = {
    margin: "12px 0",
    color: "#475569",
    lineHeight: 1.6,
    fontSize: "13px",
};

const notificationBottomStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    paddingTop: "10px",
    borderTop: "1px solid #f1f5f9",
};

const notificationDateStyle = {
    color: "#64748b",
    fontSize: "11px",
};

const markReadButtonStyle = {
    border: "1px solid #2563eb",
    background: "#eff6ff",
    color: "#1d4ed8",
    borderRadius: "7px",
    padding: "7px 10px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "11px",
};

const readBadgeStyle = {
    border: "1px solid #bbf7d0",
    background: "#f0fdf4",
    color: "#15803d",
    borderRadius: "999px",
    padding: "5px 9px",
    fontSize: "10px",
    fontWeight: 800,
};

const emptyStateStyle = {
    marginTop: "14px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "55px 20px",
    textAlign: "center",
    boxShadow: "0 5px 18px rgba(15, 23, 42, 0.035)",
};

const loadingIconStyle = {
    fontSize: "38px",
    marginBottom: "8px",
};
