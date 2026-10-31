import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function MentorStudentMonitoring() {
    const navigate = useNavigate();

    const mentorId = localStorage.getItem("mentorId");
    const mentorName =
        localStorage.getItem("mentorName") || "Mentor";
    const mentorDepartment =
        localStorage.getItem("mentorDepartment") || "CSE";

    const [mentor, setMentor] = useState(null);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const [studentNotes, setStudentNotes] = useState([]);
    const [studentActivities, setStudentActivities] = useState([]);
    const [studentFollowups, setStudentFollowups] = useState([]);
    const [studentInterventions, setStudentInterventions] = useState([]);
    const [studentNotifications, setStudentNotifications] = useState([]);

    const [search, setSearch] = useState("");
    const [riskFilter, setRiskFilter] = useState("All");

    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // =====================================================
    // LOAD ASSIGNED STUDENTS
    // =====================================================

    const loadStudents = async () => {
        try {
            setLoading(true);
            setError("");
            setMessage("");

            if (!mentorId) {
                throw new Error(
                    "Mentor session not found. Please login again."
                );
            }

            const response = await fetch(
                `${API_URL}/mentor/students?mentor_id=${mentorId}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                        "Unable to load assigned students."
                );
            }

            const list = Array.isArray(data.students)
                ? data.students
                : [];

            setMentor(data.mentor || null);
            setStudents(list);

            // Keep selected student after refresh if possible.
            if (selectedStudent) {
                const updated = list.find(
                    (student) =>
                        Number(student.id) ===
                        Number(selectedStudent.id)
                );

                if (updated) {
                    setSelectedStudent(updated);
                } else {
                    setSelectedStudent(null);
                    clearStudentDetails();
                }
            }
        } catch (err) {
            console.error("Student monitoring error:", err);
            setError(
                err.message ||
                    "Unable to load student monitoring data."
            );
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // LOAD SELECTED STUDENT DETAILS
    // =====================================================

    const loadStudentDetails = async (student) => {
        try {
            setSelectedStudent(student);
            setDetailLoading(true);
            setError("");
            setMessage("");

            const [
                notesResponse,
                activitiesResponse,
                followupsResponse,
                interventionsResponse,
                notificationsResponse
            ] = await Promise.all([
                fetch(
                    `${API_URL}/mentor/mentoring/notes/${student.id}?mentor_id=${mentorId}`
                ),
                fetch(
                    `${API_URL}/mentor/mentoring/activities/${student.id}?mentor_id=${mentorId}`
                ),
                fetch(
                    `${API_URL}/mentor/mentoring/followups/${student.id}?mentor_id=${mentorId}`
                ),
                fetch(
                    `${API_URL}/mentor/interventions/${student.id}?mentor_id=${mentorId}`
                ),
                fetch(
                    `${API_URL}/mentor/notifications?mentor_id=${mentorId}`
                )
            ]);

            const [
                notesData,
                activitiesData,
                followupsData,
                interventionsData,
                notificationsData
            ] = await Promise.all([
                notesResponse.json().catch(() => []),
                activitiesResponse.json().catch(() => []),
                followupsResponse.json().catch(() => []),
                interventionsResponse.json().catch(() => []),
                notificationsResponse.json().catch(() => ({}))
            ]);

            if (!notesResponse.ok) {
                throw new Error(
                    notesData.detail ||
                        "Unable to load mentor notes."
                );
            }

            if (!activitiesResponse.ok) {
                throw new Error(
                    activitiesData.detail ||
                        "Unable to load mentoring activities."
                );
            }

            if (!followupsResponse.ok) {
                throw new Error(
                    followupsData.detail ||
                        "Unable to load follow-ups."
                );
            }

            if (!interventionsResponse.ok) {
                throw new Error(
                    interventionsData.detail ||
                        "Unable to load interventions."
                );
            }

            setStudentNotes(
                Array.isArray(notesData) ? notesData : []
            );

            setStudentActivities(
                Array.isArray(activitiesData)
                    ? activitiesData
                    : []
            );

            setStudentFollowups(
                Array.isArray(followupsData)
                    ? followupsData
                    : []
            );

            setStudentInterventions(
                Array.isArray(interventionsData)
                    ? interventionsData
                    : []
            );

            const allNotifications =
                notificationsData.notifications || [];

            setStudentNotifications(
                allNotifications.filter(
                    (notification) =>
                        Number(notification.student_id) ===
                        Number(student.id)
                )
            );
        } catch (err) {
            console.error(
                "Student detail loading error:",
                err
            );

            setError(
                err.message ||
                    "Unable to load student details."
            );

            clearStudentDetails();
        } finally {
            setDetailLoading(false);
        }
    };

    const clearStudentDetails = () => {
        setStudentNotes([]);
        setStudentActivities([]);
        setStudentFollowups([]);
        setStudentInterventions([]);
        setStudentNotifications([]);
    };

    useEffect(() => {
        loadStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // =====================================================
    // FILTER
    // =====================================================

    const filteredStudents = useMemo(() => {
        const query = search.trim().toLowerCase();

        return students.filter((student) => {
            const matchesSearch =
                !query ||
                String(student.name || "")
                    .toLowerCase()
                    .includes(query) ||
                String(student.usn || "")
                    .toLowerCase()
                    .includes(query) ||
                String(student.email || "")
                    .toLowerCase()
                    .includes(query);

            const matchesRisk =
                riskFilter === "All" ||
                String(student.risk_status || "")
                    .toLowerCase() ===
                    riskFilter.toLowerCase();

            return matchesSearch && matchesRisk;
        });
    }, [students, search, riskFilter]);

    // =====================================================
    // SUMMARY
    // =====================================================

    const highRiskCount = students.filter(
        (student) => student.risk_status === "High Risk"
    ).length;

    const mediumRiskCount = students.filter(
        (student) => student.risk_status === "Medium Risk"
    ).length;

    const lowRiskCount = students.filter(
        (student) => student.risk_status === "Low Risk"
    ).length;

    const averageCgpa = students.length
        ? (
              students.reduce(
                  (total, student) =>
                      total +
                      Number(student.cgpa || 0),
                  0
              ) / students.length
          ).toFixed(2)
        : "-";

    const averageAttendance = students.length
        ? (
              students.reduce(
                  (total, student) =>
                      total +
                      Number(student.attendance || 0),
                  0
              ) / students.length
          ).toFixed(2)
        : "-";

    // =====================================================
    // FORMATTING
    // =====================================================

    const formatDate = (value) => {
        if (!value) return "-";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const formatDateTime = (value) => {
        if (!value) return "-";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getRiskStyle = (risk) => {
        if (risk === "High Risk") {
            return {
                background: "#fee2e2",
                color: "#b91c1c",
                border: "1px solid #fecaca"
            };
        }

        if (risk === "Medium Risk") {
            return {
                background: "#fef3c7",
                color: "#92400e",
                border: "1px solid #fde68a"
            };
        }

        return {
            background: "#dcfce7",
            color: "#166534",
            border: "1px solid #bbf7d0"
        };
    };

    const getPriorityStyle = (priority) => {
        if (priority === "High") {
            return {
                background: "#fee2e2",
                color: "#b91c1c"
            };
        }

        if (priority === "Medium") {
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

    const getStatusStyle = (status) => {
        if (
            status === "Completed" ||
            status === "Stable"
        ) {
            return {
                background: "#dcfce7",
                color: "#166534"
            };
        }

        if (status === "In Progress") {
            return {
                background: "#dbeafe",
                color: "#1d4ed8"
            };
        }

        if (
            status === "Cancelled" ||
            status === "Attention Required"
        ) {
            return {
                background: "#fee2e2",
                color: "#b91c1c"
            };
        }

        return {
            background: "#fef3c7",
            color: "#92400e"
        };
    };

    const getMonitoringStatus = (student) => {
        if (student.risk_status === "High Risk") {
            return "Attention Required";
        }

        if (student.risk_status === "Medium Risk") {
            return "In Progress";
        }

        return "Stable";
    };

    // =====================================================
    // LOGOUT
    // =====================================================

    const logout = () => {
        localStorage.removeItem("mentorToken");
        localStorage.removeItem("mentorId");
        localStorage.removeItem("mentorName");
        localStorage.removeItem("mentorEmail");
        localStorage.removeItem("mentorDepartment");

        navigate("/mentor-login");
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div style={pageStyle}>
                <div style={loadingCardStyle}>
                    <div style={loadingIconStyle}>👨‍🏫</div>
                    <h2 style={{ margin: "0 0 8px" }}>
                        Loading Student Monitoring
                    </h2>
                    <p style={{ margin: 0, color: "#64748b" }}>
                        Loading your assigned students...
                    </p>
                </div>
            </div>
        );
    }

    // =====================================================
    // PAGE
    // =====================================================

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>

                {/* HEADER */}

                <header style={headerStyle}>
                    <div>
                        <div style={eyebrowStyle}>
                            MENTOR PORTAL
                        </div>

                        <h1 style={titleStyle}>
                            Student Monitoring
                        </h1>

                        <p style={subtitleStyle}>
                            Monitor the academic, mentoring and
                            intervention status of your assigned
                            students.
                        </p>
                    </div>

                    <div style={headerActionsStyle}>
                        <div style={mentorInfoStyle}>
                            <div style={mentorAvatarStyle}>
                                {(
                                    mentor?.name ||
                                    mentorName ||
                                    "M"
                                )
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div>
                                <div style={mentorNameStyle}>
                                    {mentor?.name || mentorName}
                                </div>

                                <div
                                    style={
                                        mentorDepartmentStyle
                                    }
                                >
                                    {mentor?.department ||
                                        mentorDepartment}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() =>
                                navigate("/mentor-dashboard")
                            }
                            style={secondaryButtonStyle}
                        >
                            Dashboard
                        </button>

                        <button
                            onClick={() =>
                                navigate("/mentor/mentoring")
                            }
                            style={secondaryButtonStyle}
                        >
                            Mentoring
                        </button>

                        <button
                            onClick={() =>
                                navigate("/mentor/reports")
                            }
                            style={reportsButtonStyle}
                        >
                            📊 Reports
                        </button>

                        <button
                            onClick={loadStudents}
                            style={refreshButtonStyle}
                        >
                            ↻ Refresh
                        </button>

                        <button
                            onClick={logout}
                            style={logoutButtonStyle}
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {message && (
                    <div style={successStyle}>
                        ✓ {message}
                    </div>
                )}

                {error && (
                    <div style={errorStyle}>
                        ⚠ {error}
                    </div>
                )}

                {/* SUMMARY */}

                <section style={summaryGridStyle}>
                    <SummaryCard
                        icon="👨‍🎓"
                        title="Assigned Students"
                        value={students.length}
                        description="Students under your mentoring"
                        background="#ede9fe"
                    />

                    <SummaryCard
                        icon="🔴"
                        title="High Risk"
                        value={highRiskCount}
                        description="Requires immediate attention"
                        background="#fee2e2"
                    />

                    <SummaryCard
                        icon="🟡"
                        title="Medium Risk"
                        value={mediumRiskCount}
                        description="Needs regular monitoring"
                        background="#fef3c7"
                    />

                    <SummaryCard
                        icon="🟢"
                        title="Low Risk"
                        value={lowRiskCount}
                        description="Currently stable"
                        background="#dcfce7"
                    />

                    <SummaryCard
                        icon="🎓"
                        title="Average CGPA"
                        value={averageCgpa}
                        description="Assigned student average"
                        background="#dbeafe"
                    />

                    <SummaryCard
                        icon="📈"
                        title="Average Attendance"
                        value={
                            averageAttendance === "-"
                                ? "-"
                                : `${averageAttendance}%`
                        }
                        description="Faculty-recorded attendance"
                        background="#e0f2fe"
                    />
                </section>

                {/* FILTERS */}

                <section style={filterCardStyle}>
                    <div>
                        <h2 style={sectionTitleStyle}>
                            Assigned Students
                        </h2>

                        <p style={sectionSubtitleStyle}>
                            Only students assigned to you are shown.
                        </p>
                    </div>

                    <div style={filterControlsStyle}>
                        <div style={searchBoxStyle}>
                            <span>🔍</span>
                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search name, USN or email..."
                                style={searchInputStyle}
                            />
                        </div>

                        <select
                            value={riskFilter}
                            onChange={(event) =>
                                setRiskFilter(event.target.value)
                            }
                            style={selectStyle}
                        >
                            <option value="All">
                                All Risk Levels
                            </option>
                            <option value="High Risk">
                                High Risk
                            </option>
                            <option value="Medium Risk">
                                Medium Risk
                            </option>
                            <option value="Low Risk">
                                Low Risk
                            </option>
                        </select>
                    </div>
                </section>

                {/* MAIN CONTENT */}

                <div style={mainGridStyle}>

                    {/* STUDENT LIST */}

                    <section style={studentListCardStyle}>
                        <div style={cardHeaderStyle}>
                            <div>
                                <h2 style={cardTitleStyle}>
                                    Student List
                                </h2>

                                <p style={cardSubtitleStyle}>
                                    {filteredStudents.length} of{" "}
                                    {students.length} students
                                </p>
                            </div>
                        </div>

                        {filteredStudents.length === 0 ? (
                            <div style={emptyStyle}>
                                <div style={{ fontSize: 48 }}>
                                    👨‍🎓
                                </div>
                                <h3>
                                    No students found
                                </h3>
                                <p>
                                    Try changing the search or
                                    risk filter.
                                </p>
                            </div>
                        ) : (
                            <div style={studentCardsStyle}>
                                {filteredStudents.map((student) => {
                                    const selected =
                                        Number(
                                            selectedStudent?.id
                                        ) ===
                                        Number(student.id);

                                    const monitoringStatus =
                                        getMonitoringStatus(
                                            student
                                        );

                                    return (
                                        <button
                                            key={student.id}
                                            onClick={() =>
                                                loadStudentDetails(
                                                    student
                                                )
                                            }
                                            style={{
                                                ...studentRowStyle,
                                                ...(selected
                                                    ? selectedStudentRowStyle
                                                    : {})
                                            }}
                                        >
                                            <div
                                                style={
                                                    studentAvatarStyle
                                                }
                                            >
                                                {String(
                                                    student.name ||
                                                        "S"
                                                )
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div
                                                style={
                                                    studentMainStyle
                                                }
                                            >
                                                <div
                                                    style={
                                                        studentNameRowStyle
                                                    }
                                                >
                                                    <strong>
                                                        {
                                                            student.name
                                                        }
                                                    </strong>

                                                    <span
                                                        style={{
                                                            ...badgeStyle,
                                                            ...getRiskStyle(
                                                                student.risk_status
                                                            )
                                                        }}
                                                    >
                                                        {
                                                            student.risk_status
                                                        }
                                                    </span>
                                                </div>

                                                <div
                                                    style={
                                                        studentMetaStyle
                                                    }
                                                >
                                                    {student.usn ||
                                                        "-"}{" "}
                                                    •{" "}
                                                    {student.branch ||
                                                        "-"}{" "}
                                                    • Sem{" "}
                                                    {student.semester ||
                                                        "-"}
                                                </div>

                                                <div
                                                    style={
                                                        miniMetricsStyle
                                                    }
                                                >
                                                    <span>
                                                        CGPA:{" "}
                                                        <b>
                                                            {student.cgpa ??
                                                                "-"}
                                                        </b>
                                                    </span>

                                                    <span>
                                                        Attendance:{" "}
                                                        <b>
                                                            {student.attendance !=
                                                            null
                                                                ? `${student.attendance}%`
                                                                : "-"}
                                                        </b>
                                                    </span>

                                                    <span>
                                                        Backlogs:{" "}
                                                        <b>
                                                            {student.backlogs ??
                                                                0}
                                                        </b>
                                                    </span>
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    ...statusBadgeStyle,
                                                    ...getStatusStyle(
                                                        monitoringStatus
                                                    )
                                                }}
                                            >
                                                {monitoringStatus}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* DETAILS */}

                    <section style={detailCardStyle}>
                        {!selectedStudent ? (
                            <div style={detailEmptyStyle}>
                                <div
                                    style={{
                                        fontSize: 64,
                                        marginBottom: 16
                                    }}
                                >
                                    👈
                                </div>

                                <h2>
                                    Select a Student
                                </h2>

                                <p>
                                    Select a student from the list
                                    to view complete monitoring
                                    information.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* PROFILE */}

                                <div style={profileHeaderStyle}>
                                    <div
                                        style={
                                            largeAvatarStyle
                                        }
                                    >
                                        {String(
                                            selectedStudent.name ||
                                                "S"
                                        )
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <div
                                        style={
                                            profileInfoStyle
                                        }
                                    >
                                        <div
                                            style={
                                                profileNameRowStyle
                                            }
                                        >
                                            <h2
                                                style={{
                                                    margin: 0,
                                                    fontSize: 24
                                                }}
                                            >
                                                {
                                                    selectedStudent.name
                                                }
                                            </h2>

                                            <span
                                                style={{
                                                    ...badgeStyle,
                                                    ...getRiskStyle(
                                                        selectedStudent.risk_status
                                                    )
                                                }}
                                            >
                                                {
                                                    selectedStudent.risk_status
                                                }
                                            </span>
                                        </div>

                                        <p
                                            style={{
                                                margin:
                                                    "6px 0",
                                                color: "#64748b"
                                            }}
                                        >
                                            {
                                                selectedStudent.usn
                                            }{" "}
                                            •{" "}
                                            {
                                                selectedStudent.email
                                            }
                                        </p>

                                        <p
                                            style={{
                                                margin: 0,
                                                color: "#64748b"
                                            }}
                                        >
                                            {
                                                selectedStudent.branch ||
                                                    "-"
                                            }{" "}
                                            • Semester{" "}
                                            {
                                                selectedStudent.semester ||
                                                    "-"
                                            }{" "}
                                            • Section{" "}
                                            {
                                                selectedStudent.section ||
                                                    "-"
                                            }
                                        </p>
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "8px",
                                            flexWrap: "wrap",
                                            justifyContent: "flex-end"
                                        }}
                                    >
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/mentor/mentoring?student_id=${selectedStudent.id}`
                                                )
                                            }
                                            style={
                                                primaryButtonStyle
                                            }
                                        >
                                            📝 Mentoring
                                        </button>

                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/mentor/parent-alerts?student_id=${selectedStudent.id}`
                                                )
                                            }
                                            style={
                                                parentAlertButtonStyle
                                            }
                                        >
                                            🔔 Parent Alert
                                        </button>

                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/mentor/mentoring?student_id=${selectedStudent.id}&section=intervention`
                                                )
                                            }
                                            style={
                                                interventionButtonStyle
                                            }
                                        >
                                            🎯 Intervention
                                        </button>
                                    </div>
                                </div>

                                {/* PERFORMANCE */}

                                <div
                                    style={
                                        detailMetricsGridStyle
                                    }
                                >
                                    <DetailMetric
                                        label="CGPA"
                                        value={
                                            selectedStudent.cgpa ??
                                            "-"
                                        }
                                        icon="🎓"
                                    />

                                    <DetailMetric
                                        label="Attendance"
                                        value={
                                            selectedStudent.attendance !=
                                            null
                                                ? `${selectedStudent.attendance}%`
                                                : "-"
                                        }
                                        icon="📅"
                                    />

                                    <DetailMetric
                                        label="Backlogs"
                                        value={
                                            selectedStudent.backlogs ??
                                            0
                                        }
                                        icon="📚"
                                    />

                                    <DetailMetric
                                        label="Monitoring Status"
                                        value={getMonitoringStatus(
                                            selectedStudent
                                        )}
                                        icon="📊"
                                    />
                                </div>

                                {/* MENTORING DATA */}

                                <DetailSection
                                    title="📝 Mentor Notes"
                                    count={
                                        studentNotes.length
                                    }
                                >
                                    {detailLoading ? (
                                        <LoadingText />
                                    ) : studentNotes.length === 0 ? (
                                        <EmptyText text="No mentor notes recorded." />
                                    ) : (
                                        <div>
                                            {studentNotes
                                                .slice(0, 5)
                                                .map((note) => (
                                                    <TimelineItem
                                                        key={
                                                            note.id
                                                        }
                                                        title={
                                                            note.note
                                                        }
                                                        date={formatDateTime(
                                                            note.created_at
                                                        )}
                                                        icon="📝"
                                                    />
                                                ))}
                                        </div>
                                    )}
                                </DetailSection>

                                <DetailSection
                                    title="📋 Mentoring Activities"
                                    count={
                                        studentActivities.length
                                    }
                                >
                                    {detailLoading ? (
                                        <LoadingText />
                                    ) : studentActivities.length ===
                                      0 ? (
                                        <EmptyText text="No mentoring activities recorded." />
                                    ) : (
                                        <div>
                                            {studentActivities
                                                .slice(0, 5)
                                                .map(
                                                    (
                                                        activity
                                                    ) => (
                                                        <TimelineItem
                                                            key={
                                                                activity.id
                                                            }
                                                            title={
                                                                activity.activity_type ||
                                                                "Mentoring Activity"
                                                            }
                                                            description={
                                                                activity.description
                                                            }
                                                            date={formatDateTime(
                                                                activity.activity_date
                                                            )}
                                                            icon="📋"
                                                        />
                                                    )
                                                )}
                                        </div>
                                    )}
                                </DetailSection>

                                <DetailSection
                                    title="📅 Follow-ups"
                                    count={
                                        studentFollowups.length
                                    }
                                >
                                    {detailLoading ? (
                                        <LoadingText />
                                    ) : studentFollowups.length ===
                                      0 ? (
                                        <EmptyText text="No follow-ups recorded." />
                                    ) : (
                                        <div
                                            style={{
                                                display: "grid",
                                                gap: 10
                                            }}
                                        >
                                            {studentFollowups
                                                .slice(0, 5)
                                                .map(
                                                    (
                                                        followup
                                                    ) => (
                                                        <div
                                                            key={
                                                                followup.id
                                                            }
                                                            style={
                                                                dataRowStyle
                                                            }
                                                        >
                                                            <div>
                                                                <strong>
                                                                    {followup.purpose ||
                                                                        "Mentor Follow-up"}
                                                                </strong>
                                                                <div
                                                                    style={
                                                                        smallTextStyle
                                                                    }
                                                                >
                                                                    Date:{" "}
                                                                    {formatDate(
                                                                        followup.follow_up_date
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <span
                                                                style={{
                                                                    ...badgeStyle,
                                                                    ...getStatusStyle(
                                                                        followup.status ||
                                                                            "Pending"
                                                                    )
                                                                }}
                                                            >
                                                                {followup.status ||
                                                                    "Pending"}
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                        </div>
                                    )}
                                </DetailSection>

                                <DetailSection
                                    title="🎯 Interventions"
                                    count={
                                        studentInterventions.length
                                    }
                                >
                                    {detailLoading ? (
                                        <LoadingText />
                                    ) : studentInterventions.length ===
                                      0 ? (
                                        <EmptyText text="No interventions recorded." />
                                    ) : (
                                        <div
                                            style={{
                                                display: "grid",
                                                gap: 10
                                            }}
                                        >
                                            {studentInterventions
                                                .slice(0, 5)
                                                .map(
                                                    (
                                                        intervention
                                                    ) => (
                                                        <div
                                                            key={
                                                                intervention.id
                                                            }
                                                            style={
                                                                dataRowStyle
                                                            }
                                                        >
                                                            <div
                                                                style={{
                                                                    flex: 1
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        display:
                                                                            "flex",
                                                                        gap: 8,
                                                                        alignItems:
                                                                            "center",
                                                                        flexWrap:
                                                                            "wrap"
                                                                    }}
                                                                >
                                                                    <strong>
                                                                        {intervention.intervention_type}
                                                                    </strong>

                                                                    <span
                                                                        style={{
                                                                            ...badgeStyle,
                                                                            ...getPriorityStyle(
                                                                                intervention.priority
                                                                            )
                                                                        }}
                                                                    >
                                                                        {intervention.priority ||
                                                                            "Medium"}
                                                                    </span>
                                                                </div>

                                                                <div
                                                                    style={
                                                                        smallTextStyle
                                                                    }
                                                                >
                                                                    {
                                                                        intervention.description
                                                                    }
                                                                </div>

                                                                <div
                                                                    style={
                                                                        smallTextStyle
                                                                    }
                                                                >
                                                                    Target:{" "}
                                                                    {formatDate(
                                                                        intervention.target_date
                                                                    )}
                                                                </div>

                                                                {intervention.outcome && (
                                                                    <div
                                                                        style={{
                                                                            ...smallTextStyle,
                                                                            marginTop: 4
                                                                        }}
                                                                    >
                                                                        Outcome:{" "}
                                                                        {
                                                                            intervention.outcome
                                                                        }
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <span
                                                                style={{
                                                                    ...badgeStyle,
                                                                    ...getStatusStyle(
                                                                        intervention.status
                                                                    )
                                                                }}
                                                            >
                                                                {
                                                                    intervention.status
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                        </div>
                                    )}
                                </DetailSection>

                                <DetailSection
                                    title="🔔 Notifications"
                                    count={
                                        studentNotifications.length
                                    }
                                >
                                    {studentNotifications.length ===
                                    0 ? (
                                        <EmptyText text="No notifications for this student." />
                                    ) : (
                                        <div
                                            style={{
                                                display: "grid",
                                                gap: 10
                                            }}
                                        >
                                            {studentNotifications
                                                .slice(0, 5)
                                                .map(
                                                    (
                                                        notification
                                                    ) => (
                                                        <div
                                                            key={
                                                                notification.id
                                                            }
                                                            style={{
                                                                ...dataRowStyle,
                                                                alignItems:
                                                                    "flex-start"
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    fontSize: 22
                                                                }}
                                                            >
                                                                {notification.priority ===
                                                                "High"
                                                                    ? "🔴"
                                                                    : notification.priority ===
                                                                      "Medium"
                                                                    ? "🟡"
                                                                    : "🟢"}
                                                            </div>

                                                            <div
                                                                style={{
                                                                    flex: 1
                                                                }}
                                                            >
                                                                <strong>
                                                                    {
                                                                        notification.title
                                                                    }
                                                                </strong>

                                                                <div
                                                                    style={
                                                                        smallTextStyle
                                                                    }
                                                                >
                                                                    {
                                                                        notification.message
                                                                    }
                                                                </div>

                                                                <div
                                                                    style={
                                                                        smallTextStyle
                                                                    }
                                                                >
                                                                    {formatDateTime(
                                                                        notification.created_at
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <span
                                                                style={{
                                                                    ...badgeStyle,
                                                                    ...getPriorityStyle(
                                                                        notification.priority
                                                                    )
                                                                }}
                                                            >
                                                                {
                                                                    notification.priority
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                        </div>
                                    )}
                                </DetailSection>
                            </>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

// =========================================================
// REUSABLE COMPONENTS
// =========================================================

function SummaryCard({
    icon,
    title,
    value,
    description,
    background
}) {
    return (
        <div style={summaryCardStyle}>
            <div
                style={{
                    ...summaryIconStyle,
                    background
                }}
            >
                {icon}
            </div>

            <div>
                <div style={summaryTitleStyle}>
                    {title}
                </div>

                <div style={summaryValueStyle}>
                    {value}
                </div>

                <div style={summaryDescriptionStyle}>
                    {description}
                </div>
            </div>
        </div>
    );
}

function DetailMetric({ icon, label, value }) {
    return (
        <div style={detailMetricStyle}>
            <div style={{ fontSize: 24 }}>{icon}</div>

            <div>
                <div style={smallLabelStyle}>
                    {label}
                </div>

                <div style={detailMetricValueStyle}>
                    {value}
                </div>
            </div>
        </div>
    );
}

function DetailSection({ title, count, children }) {
    return (
        <section style={detailSectionStyle}>
            <div style={detailSectionHeaderStyle}>
                <h3 style={{ margin: 0 }}>{title}</h3>

                <span style={countBadgeStyle}>
                    {count}
                </span>
            </div>

            {children}
        </section>
    );
}

function TimelineItem({
    title,
    description,
    date,
    icon
}) {
    return (
        <div style={timelineItemStyle}>
            <div style={timelineIconStyle}>
                {icon}
            </div>

            <div style={{ flex: 1 }}>
                <strong>{title}</strong>

                {description && (
                    <div style={smallTextStyle}>
                        {description}
                    </div>
                )}

                <div style={smallTextStyle}>
                    {date}
                </div>
            </div>
        </div>
    );
}

function LoadingText() {
    return (
        <div style={inlineLoadingStyle}>
            Loading...
        </div>
    );
}

function EmptyText({ text }) {
    return (
        <div style={emptyTextStyle}>
            {text}
        </div>
    );
}

// =========================================================
// STYLES
// =========================================================

const pageStyle = {
    minHeight: "100vh",
    background:
        "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
    padding: "28px",
    fontFamily:
        "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#0f172a",
    boxSizing: "border-box"
};

const containerStyle = {
    maxWidth: "1500px",
    margin: "0 auto"
};

const headerStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)"
};

const eyebrowStyle = {
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "1.4px",
    color: "#6366f1",
    marginBottom: "6px"
};

const titleStyle = {
    margin: 0,
    fontSize: "32px",
    fontWeight: 800
};

const subtitleStyle = {
    margin: "8px 0 0",
    color: "#64748b",
    maxWidth: "700px"
};

const headerActionsStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap"
};

const mentorInfoStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginRight: "4px"
};

const mentorAvatarStyle = {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background:
        "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800
};

const mentorNameStyle = {
    fontWeight: 800,
    fontSize: "14px"
};

const mentorDepartmentStyle = {
    color: "#64748b",
    fontSize: "12px",
    marginTop: "2px"
};

const secondaryButtonStyle = {
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#334155",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700
};

const reportsButtonStyle = {
    border: "none",
    background: "#eef2ff",
    color: "#4338ca",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700
};

const refreshButtonStyle = {
    border: "none",
    background: "#0f172a",
    color: "#ffffff",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700
};

const logoutButtonStyle = {
    border: "none",
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700
};

const successStyle = {
    marginTop: "16px",
    padding: "13px 16px",
    borderRadius: "12px",
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    fontWeight: 700
};

const errorStyle = {
    marginTop: "16px",
    padding: "13px 16px",
    borderRadius: "12px",
    background: "#fee2e2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    fontWeight: 700
};

const summaryGridStyle = {
    marginTop: "20px",
    display: "grid",
    gridTemplateColumns:
        "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "14px"
};

const summaryCardStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)"
};

const summaryIconStyle = {
    width: "46px",
    height: "46px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    flexShrink: 0
};

const summaryTitleStyle = {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 700
};

const summaryValueStyle = {
    fontSize: "25px",
    fontWeight: 850,
    marginTop: "2px"
};

const summaryDescriptionStyle = {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "2px"
};

const filterCardStyle = {
    marginTop: "20px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap"
};

const sectionTitleStyle = {
    margin: 0,
    fontSize: "20px"
};

const sectionSubtitleStyle = {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px"
};

const filterControlsStyle = {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
};

const searchBoxStyle = {
    minWidth: "280px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    padding: "0 12px",
    background: "#fff"
};

const searchInputStyle = {
    border: "none",
    outline: "none",
    padding: "11px 0",
    width: "100%",
    fontSize: "14px"
};

const selectStyle = {
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    padding: "10px 12px",
    background: "#fff",
    color: "#334155",
    fontWeight: 600
};

const mainGridStyle = {
    marginTop: "20px",
    display: "grid",
    gridTemplateColumns:
        "minmax(360px, 0.9fr) minmax(500px, 1.5fr)",
    gap: "20px",
    alignItems: "start"
};

const studentListCardStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)"
};

const detailCardStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "20px",
    minHeight: "500px",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)"
};

const cardHeaderStyle = {
    padding: "20px",
    borderBottom: "1px solid #e2e8f0"
};

const cardTitleStyle = {
    margin: 0,
    fontSize: "19px"
};

const cardSubtitleStyle = {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px"
};

const studentCardsStyle = {
    display: "grid"
};

const studentRowStyle = {
    width: "100%",
    border: "none",
    borderBottom: "1px solid #eef2f7",
    background: "#ffffff",
    padding: "15px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textAlign: "left",
    cursor: "pointer"
};

const selectedStudentRowStyle = {
    background: "#f5f3ff",
    boxShadow: "inset 4px 0 0 #6366f1"
};

const studentAvatarStyle = {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "#ede9fe",
    color: "#6d28d9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    flexShrink: 0
};

const studentMainStyle = {
    flex: 1,
    minWidth: 0
};

const studentNameRowStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap"
};

const studentMetaStyle = {
    marginTop: "4px",
    color: "#64748b",
    fontSize: "12px"
};

const miniMetricsStyle = {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "7px",
    color: "#475569",
    fontSize: "11px"
};

const badgeStyle = {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 8px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 800,
    whiteSpace: "nowrap"
};

const statusBadgeStyle = {
    padding: "5px 8px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: 800,
    whiteSpace: "nowrap"
};

const profileHeaderStyle = {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    paddingBottom: "20px",
    borderBottom: "1px solid #e2e8f0"
};

const largeAvatarStyle = {
    width: "64px",
    height: "64px",
    borderRadius: "18px",
    background:
        "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    fontWeight: 800,
    flexShrink: 0
};

const profileInfoStyle = {
    flex: 1,
    minWidth: 0
};

const profileNameRowStyle = {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    flexWrap: "wrap"
};

const parentAlertButtonStyle = {
    border: "1px solid #f9a8d4",
    borderRadius: "10px",
    padding: "10px 13px",
    background: "#fdf2f8",
    color: "#be185d",
    fontWeight: "700",
    cursor: "pointer"
};

const interventionButtonStyle = {
    border: "1px solid #c7d2fe",
    borderRadius: "10px",
    padding: "10px 13px",
    background: "#eef2ff",
    color: "#4338ca",
    fontWeight: "700",
    cursor: "pointer"
};

const primaryButtonStyle = {
    border: "none",
    background:
        "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#fff",
    padding: "11px 15px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 800,
    whiteSpace: "nowrap"
};

const detailMetricsGridStyle = {
    display: "grid",
    gridTemplateColumns:
        "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "10px",
    marginTop: "16px"
};

const detailMetricStyle = {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "13px",
    padding: "13px",
    display: "flex",
    alignItems: "center",
    gap: "10px"
};

const smallLabelStyle = {
    fontSize: "10px",
    color: "#64748b",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px"
};

const detailMetricValueStyle = {
    marginTop: "3px",
    fontSize: "16px",
    fontWeight: 800
};

const detailSectionStyle = {
    marginTop: "16px",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    overflow: "hidden"
};

const detailSectionHeaderStyle = {
    padding: "13px 15px",
    background: "#f8fafc",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    borderBottom: "1px solid #e2e8f0"
};

const countBadgeStyle = {
    minWidth: "25px",
    height: "25px",
    borderRadius: "50%",
    background: "#e0e7ff",
    color: "#4338ca",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: 800
};

const timelineItemStyle = {
    display: "flex",
    gap: "11px",
    padding: "12px 14px",
    borderBottom: "1px solid #f1f5f9"
};

const timelineIconStyle = {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
};

const dataRowStyle = {
    margin: "10px",
    padding: "11px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    gap: "10px"
};

const smallTextStyle = {
    color: "#64748b",
    fontSize: "12px",
    marginTop: "4px",
    lineHeight: 1.45
};

const emptyStyle = {
    padding: "60px 20px",
    textAlign: "center",
    color: "#64748b"
};

const emptyTextStyle = {
    padding: "18px",
    color: "#64748b",
    fontSize: "13px"
};

const detailEmptyStyle = {
    minHeight: "500px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#64748b",
    padding: "30px"
};

const inlineLoadingStyle = {
    padding: "18px",
    color: "#64748b",
    fontSize: "13px"
};

const loadingPageStyle = {
    minHeight: "100vh",
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px",
    fontFamily:
        "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
};

const loadingCardStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "40px",
    textAlign: "center",
    boxShadow: "0 15px 40px rgba(15, 23, 42, 0.08)"
};

const loadingIconStyle = {
    fontSize: "52px",
    marginBottom: "12px"
};

export default MentorStudentMonitoring;
