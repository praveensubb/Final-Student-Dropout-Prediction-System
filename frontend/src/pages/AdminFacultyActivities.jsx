import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function AdminFacultyActivities() {
    const navigate = useNavigate();

    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [facultyFilter, setFacultyFilter] = useState("All");

    const loadActivities = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await fetch(
                `${API_URL}/admin/faculty-activities`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Unable to load faculty attendance activities."
                );
            }

            setActivities(
                Array.isArray(data.activities) ? data.activities : []
            );
        } catch (err) {
            console.error("Faculty activity monitoring error:", err);
            setError(
                err.message ||
                "Unable to load faculty attendance activities."
            );
            setActivities([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadActivities();
    }, []);

    const facultyList = useMemo(() => {
        const unique = new Map();

        activities.forEach((activity) => {
            if (!unique.has(activity.faculty_id)) {
                unique.set(activity.faculty_id, {
                    id: activity.faculty_id,
                    name: activity.faculty_name,
                });
            }
        });

        return Array.from(unique.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }, [activities]);

    const filteredActivities = useMemo(() => {
        const query = search.trim().toLowerCase();

        return activities.filter((activity) => {
            const facultyMatches =
                facultyFilter === "All" ||
                String(activity.faculty_id) === String(facultyFilter);

            if (!facultyMatches) {
                return false;
            }

            if (!query) {
                return true;
            }

            return [
                activity.faculty_name,
                activity.faculty_email,
                activity.student_name,
                activity.student_usn,
                activity.activity_title,
                activity.description,
                activity.subject,
                activity.class_name,
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(query)
                );
        });
    }, [activities, search, facultyFilter]);

    const formatDateTime = (value) => {
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

    const clearFilters = () => {
        setSearch("");
        setFacultyFilter("All");
    };

    if (loading) {
        return (
            <div style={pageStyle}>
                <div style={loadingCardStyle}>
                    <div style={loadingIconStyle}>⟳</div>
                    <h2 style={loadingTitleStyle}>Loading Faculty Attendance</h2>
                    <p style={mutedTextStyle}>
                        Loading attendance activities performed by faculty members...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>
                {/* HEADER */}
                <section style={headerStyle}>
                    <div style={headerLeftStyle}>
                        <button
                            type="button"
                            onClick={() => navigate("/admin")}
                            style={backButtonStyle}
                        >
                            ← Back
                        </button>

                        <div>
                            <h1 style={titleStyle}>Faculty Activity Monitoring</h1>
                            <p style={subtitleStyle}>
                                Monitor attendance activities performed by faculty members
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => loadActivities(true)}
                        disabled={refreshing}
                        style={refreshButtonStyle}
                    >
                        {refreshing ? "⟳ Refreshing..." : "↻ Refresh"}
                    </button>
                </section>

                {error && (
                    <div style={errorStyle}>
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {/* SUMMARY */}
                <section style={summaryGridStyle}>
                    <div style={summaryCardStyle}>
                        <div style={summaryIconStyle}>📊</div>
                        <div>
                            <div style={summaryLabelStyle}>Total Activities</div>
                            <div style={summaryValueStyle}>{activities.length}</div>
                        </div>
                    </div>

                    <div style={summaryCardStyle}>
                        <div style={summaryIconStyle}>📝</div>
                        <div>
                            <div style={summaryLabelStyle}>Attendance</div>
                            <div style={summaryValueStyle}>{activities.length}</div>
                        </div>
                    </div>

                    <div style={summaryCardStyle}>
                        <div style={summaryIconStyle}>👨‍🏫</div>
                        <div>
                            <div style={summaryLabelStyle}>Faculty Members</div>
                            <div style={summaryValueStyle}>{facultyList.length}</div>
                        </div>
                    </div>
                </section>

                {/* FILTERS */}
                <section style={filterCardStyle}>
                    <div style={filterHeaderStyle}>
                        <div>
                            <h2 style={sectionTitleStyle}>Activity Records</h2>
                            <p style={mutedTextStyle}>
                                Showing {filteredActivities.length} of {activities.length}
                            </p>
                        </div>
                    </div>

                    <div style={filterRowStyle}>
                        <div style={searchWrapperStyle}>
                            <span style={searchIconStyle}>🔍</span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search faculty, student, USN, subject..."
                                style={searchInputStyle}
                            />
                        </div>

                        <select
                            value={facultyFilter}
                            onChange={(e) => setFacultyFilter(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="All">All Faculty</option>
                            {facultyList.map((faculty) => (
                                <option key={faculty.id} value={faculty.id}>
                                    {faculty.name}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={clearFilters}
                            style={clearButtonStyle}
                        >
                            Clear
                        </button>
                    </div>
                </section>

                {/* TABLE */}
                <section style={tableCardStyle}>
                    {filteredActivities.length === 0 ? (
                        <div style={emptyStyle}>
                            <div style={emptyIconStyle}>📝</div>
                            <h3 style={emptyTitleStyle}>No attendance activities found</h3>
                            <p style={mutedTextStyle}>
                                No faculty attendance records match the current filters.
                            </p>
                        </div>
                    ) : (
                        <div style={tableScrollStyle}>
                            <table style={tableStyle}>
                                <thead>
                                    <tr>
                                        <th style={thStyle}>#</th>
                                        <th style={thStyle}>FACULTY</th>
                                        <th style={thStyle}>ACTIVITY</th>
                                        <th style={thStyle}>CLASS / STUDENT</th>
                                        <th style={thStyle}>DATE & TIME</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredActivities.map((activity, index) => (
                                        <tr key={activity.id} style={trStyle}>
                                            <td style={tdStyle}>{index + 1}</td>

                                            <td style={tdStyle}>
                                                <div style={facultyCellStyle}>
                                                    <div style={avatarStyle}>
                                                        {(activity.faculty_name || "F")
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <strong style={facultyNameStyle}>
                                                            {activity.faculty_name}
                                                        </strong>
                                                        <div style={smallTextStyle}>
                                                            {activity.faculty_email || "-"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td style={tdStyle}>
                                                <div style={activityBadgeStyle}>
                                                    <span style={activityIconStyle}>📋</span>
                                                    <div>
                                                        <strong style={activityTitleStyle}>
                                                            Attendance Marked
                                                        </strong>
                                                        <div style={smallTextStyle}>
                                                            Attendance
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td style={tdStyle}>
                                                <strong style={classTitleStyle}>
                                                    {activity.subject ||
                                                        activity.class_name ||
                                                        "Class / General"}
                                                </strong>

                                                <div style={descriptionStyle}>
                                                    {activity.description || "Attendance recorded."}
                                                </div>

                                                {activity.class_name && (
                                                    <div style={smallTextStyle}>
                                                        {activity.class_name}
                                                        {activity.class_type
                                                            ? ` • ${activity.class_type}`
                                                            : ""}
                                                    </div>
                                                )}

                                                {activity.student_name &&
                                                    activity.student_name !== "Class / General" && (
                                                        <div style={smallTextStyle}>
                                                            {activity.student_name}
                                                            {activity.student_usn
                                                                ? ` • ${activity.student_usn}`
                                                                : ""}
                                                        </div>
                                                    )}
                                            </td>

                                            <td style={tdStyle}>
                                                <strong style={dateStyle}>
                                                    {formatDateTime(activity.created_at)}
                                                </strong>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

const pageStyle = {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "40px 46px",
    boxSizing: "border-box",
    fontFamily: "Inter, Arial, sans-serif",
    color: "#17324d",
};

const containerStyle = {
    maxWidth: "1500px",
    margin: "0 auto",
};

const headerStyle = {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "34px 38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
    boxShadow: "0 10px 30px rgba(28, 50, 80, 0.08)",
};

const headerLeftStyle = {
    display: "flex",
    alignItems: "center",
    gap: "28px",
};

const backButtonStyle = {
    border: "none",
    borderRadius: "16px",
    padding: "14px 22px",
    background: "#eef2ff",
    color: "#273da8",
    fontSize: "18px",
    fontWeight: 700,
    cursor: "pointer",
};

const titleStyle = {
    margin: 0,
    fontSize: "40px",
    lineHeight: 1.15,
    fontWeight: 800,
    color: "#102b46",
};

const subtitleStyle = {
    margin: "8px 0 0",
    fontSize: "20px",
    color: "#62748a",
};

const refreshButtonStyle = {
    border: "none",
    borderRadius: "16px",
    padding: "16px 24px",
    background: "#2864dc",
    color: "white",
    fontSize: "18px",
    fontWeight: 700,
    cursor: "pointer",
};

const summaryGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "26px",
    marginTop: "36px",
};

const summaryCardStyle = {
    background: "white",
    borderRadius: "22px",
    padding: "28px 32px",
    display: "flex",
    alignItems: "center",
    gap: "22px",
    boxShadow: "0 8px 25px rgba(28, 50, 80, 0.07)",
};

const summaryIconStyle = {
    width: "68px",
    height: "68px",
    borderRadius: "18px",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
};

const summaryLabelStyle = {
    fontSize: "17px",
    color: "#65768a",
    marginBottom: "5px",
};

const summaryValueStyle = {
    fontSize: "36px",
    fontWeight: 800,
    color: "#112d49",
};

const filterCardStyle = {
    background: "white",
    borderRadius: "22px",
    padding: "30px 34px",
    marginTop: "36px",
    boxShadow: "0 8px 25px rgba(28, 50, 80, 0.07)",
};

const filterHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "22px",
};

const sectionTitleStyle = {
    margin: 0,
    fontSize: "28px",
    color: "#153451",
};

const mutedTextStyle = {
    margin: "6px 0 0",
    color: "#66798e",
    fontSize: "16px",
};

const filterRowStyle = {
    display: "grid",
    gridTemplateColumns: "minmax(300px, 1fr) 280px auto",
    gap: "18px",
};

const searchWrapperStyle = {
    border: "1px solid #d6dde7",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    background: "white",
};

const searchIconStyle = {
    fontSize: "21px",
    marginRight: "10px",
};

const searchInputStyle = {
    width: "100%",
    border: "none",
    outline: "none",
    fontSize: "17px",
    padding: "16px 0",
    color: "#17324d",
};

const selectStyle = {
    border: "1px solid #d6dde7",
    borderRadius: "14px",
    padding: "0 16px",
    fontSize: "17px",
    background: "white",
    color: "#17324d",
    outline: "none",
};

const clearButtonStyle = {
    border: "none",
    borderRadius: "14px",
    padding: "0 24px",
    background: "#f0f2f5",
    color: "#34485d",
    fontSize: "17px",
    fontWeight: 700,
    cursor: "pointer",
};

const tableCardStyle = {
    background: "white",
    borderRadius: "22px",
    marginTop: "30px",
    overflow: "hidden",
    boxShadow: "0 8px 25px rgba(28, 50, 80, 0.07)",
};

const tableScrollStyle = {
    overflowX: "auto",
};

const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1050px",
};

const thStyle = {
    textAlign: "left",
    padding: "22px 20px",
    background: "#f7f9fc",
    borderBottom: "1px solid #e1e6ed",
    color: "#3f5871",
    fontSize: "15px",
    letterSpacing: "0.03em",
};

const tdStyle = {
    padding: "22px 20px",
    borderBottom: "1px solid #edf0f4",
    verticalAlign: "middle",
};

const trStyle = {
    background: "#ffffff",
};

const facultyCellStyle = {
    display: "flex",
    alignItems: "center",
    gap: "14px",
};

const avatarStyle = {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "#e9edff",
    color: "#3039a5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "20px",
};

const facultyNameStyle = {
    fontSize: "17px",
    color: "#18334e",
};

const smallTextStyle = {
    marginTop: "4px",
    color: "#738397",
    fontSize: "14px",
};

const activityBadgeStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
};

const activityIconStyle = {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "#eef4ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
};

const activityTitleStyle = {
    color: "#2758c7",
    fontSize: "16px",
};

const classTitleStyle = {
    fontSize: "17px",
    color: "#213b55",
};

const descriptionStyle = {
    marginTop: "5px",
    color: "#566b80",
    fontSize: "15px",
    lineHeight: 1.45,
};

const dateStyle = {
    color: "#4e6277",
    fontSize: "15px",
    whiteSpace: "nowrap",
};

const errorStyle = {
    marginTop: "22px",
    padding: "16px 20px",
    borderRadius: "14px",
    background: "#fff0f0",
    color: "#a32828",
    border: "1px solid #ffd1d1",
};

const emptyStyle = {
    padding: "80px 30px",
    textAlign: "center",
};

const emptyIconStyle = {
    fontSize: "50px",
};

const emptyTitleStyle = {
    margin: "14px 0 0",
    fontSize: "22px",
    color: "#243c55",
};

const loadingCardStyle = {
    maxWidth: "700px",
    margin: "120px auto",
    background: "white",
    borderRadius: "24px",
    padding: "60px 40px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(28, 50, 80, 0.08)",
};

const loadingIconStyle = {
    fontSize: "42px",
};

const loadingTitleStyle = {
    margin: "18px 0 0",
    fontSize: "28px",
    color: "#17324d",
};

export default AdminFacultyActivities;
