import React, { useEffect, useMemo, useState } from "react";



import { useNavigate } from "react-router-dom";







const API_URL = "http://127.0.0.1:8000";







function MentorDashboard() {



    const navigate = useNavigate();







    const mentorId = localStorage.getItem("mentorId");



    const mentorName = localStorage.getItem("mentorName") || "Mentor";



    const mentorDepartment =



        localStorage.getItem("mentorDepartment") || "CSE";







    const [mentor, setMentor] = useState(null);



    const [students, setStudents] = useState([]);



    const [activities, setActivities] = useState([]);



    const [followups, setFollowups] = useState([]);



    const [interventions, setInterventions] = useState([]);

    // =====================================================
    // NOTIFICATIONS
    // =====================================================

    const [notifications, setNotifications] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notificationLoading, setNotificationLoading] = useState(false);








    const [loading, setLoading] = useState(true);



    const [error, setError] = useState("");







    // =====================================================



    // LOAD DASHBOARD DATA



    // =====================================================







    const loadNotifications = async () => {
        const currentMentorId = localStorage.getItem("mentorId");

        if (!currentMentorId) {
            return;
        }

        try {
            setNotificationLoading(true);

            const response = await fetch(
                `${API_URL}/mentor/notifications?mentor_id=${currentMentorId}`
            );

            if (!response.ok) {
                throw new Error("Failed to load notifications");
            }

            const data = await response.json();

            setNotifications(data.notifications || []);
            setUnreadNotifications(data.unread || 0);
        } catch (notificationError) {
            console.error(
                "Notification loading error:",
                notificationError
            );
        } finally {
            setNotificationLoading(false);
        }
    };

    const markNotificationAsRead = async (notificationId) => {
        const currentMentorId = localStorage.getItem("mentorId");

        if (!currentMentorId) {
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/mentor/notifications/${notificationId}/read?mentor_id=${currentMentorId}`,
                {
                    method: "PUT"
                }
            );

            if (!response.ok) {
                throw new Error("Failed to mark notification as read");
            }

            await loadNotifications();
        } catch (notificationError) {
            console.error(
                "Mark notification error:",
                notificationError
            );
        }
    };

    const markAllNotificationsAsRead = async () => {
        const currentMentorId = localStorage.getItem("mentorId");

        if (!currentMentorId) {
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/mentor/notifications/read-all?mentor_id=${currentMentorId}`,
                {
                    method: "PUT"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to mark notifications as read"
                );
            }

            await loadNotifications();
        } catch (notificationError) {
            console.error(
                "Mark all notifications error:",
                notificationError
            );
        }
    };

    const loadDashboard = async () => {



        try {



            setLoading(true);



            setError("");







            if (!mentorId) {



                throw new Error(



                    "Mentor session not found. Please login again."



                );



            }







            const studentsResponse = await fetch(



                `${API_URL}/mentor/students?mentor_id=${mentorId}`



            );







            if (!studentsResponse.ok) {



                const data = await studentsResponse.json();



                throw new Error(



                    data.detail || "Unable to load assigned students."



                );



            }







            const studentsData = await studentsResponse.json();







            const studentList = studentsData.students || [];







            setMentor(studentsData.mentor || null);



            setStudents(studentList);







            // Load mentoring information for every assigned student.



            const studentDetails = await Promise.all(



                studentList.map(async (student) => {



                    const result = {



                        student,



                        activities: [],



                        followups: [],



                        interventions: []



                    };







                    try {



                        const [



                            activitiesResponse,



                            followupsResponse,



                            interventionsResponse



                        ] = await Promise.all([



                            fetch(



                                `${API_URL}/mentor/mentoring/activities/${student.id}?mentor_id=${mentorId}`



                            ),



                            fetch(



                                `${API_URL}/mentor/mentoring/followups/${student.id}?mentor_id=${mentorId}`



                            ),



                            fetch(



                                `${API_URL}/mentor/interventions/${student.id}?mentor_id=${mentorId}`



                            )



                        ]);







                        if (activitiesResponse.ok) {



                            const data =



                                await activitiesResponse.json();







                            result.activities =



                                Array.isArray(data) ? data : [];



                        }







                        if (followupsResponse.ok) {



                            const data =



                                await followupsResponse.json();







                            result.followups =



                                Array.isArray(data) ? data : [];



                        }







                        if (interventionsResponse.ok) {



                            const data =



                                await interventionsResponse.json();







                            result.interventions =



                                Array.isArray(data) ? data : [];



                        }



                    } catch (studentError) {



                        console.error(



                            `Dashboard data error for student ${student.id}:`,



                            studentError



                        );



                    }







                    return result;



                })



            );







            const allActivities = studentDetails.flatMap(



                (item) =>



                    item.activities.map((activity) => ({



                        ...activity,



                        student_name: item.student.name,



                        student_usn: item.student.usn



                    }))



            );







            const allFollowups = studentDetails.flatMap(



                (item) =>



                    item.followups.map((followup) => ({



                        ...followup,



                        student_name: item.student.name,



                        student_usn: item.student.usn



                    }))



            );







            const allInterventions = studentDetails.flatMap(



                (item) =>



                    item.interventions.map((intervention) => ({



                        ...intervention,



                        student_name: item.student.name,



                        student_usn: item.student.usn



                    }))



            );







            setActivities(allActivities);



            setFollowups(allFollowups);



            setInterventions(allInterventions);



        } catch (err) {



            console.error("Mentor dashboard error:", err);



            setError(



                err.message ||



                "Unable to load mentor dashboard."



            );



        } finally {



            setLoading(false);



        }



    };







    useEffect(() => {



        loadDashboard();
        loadNotifications();



    }, [mentorId]);







    // =====================================================



    // CALCULATIONS



    // =====================================================







    const highRiskStudents = useMemo(



        () =>



            students.filter(



                (student) =>



                    student.risk_status === "High Risk"



            ),



        [students]



    );







    const mediumRiskStudents = useMemo(



        () =>



            students.filter(



                (student) =>



                    student.risk_status === "Medium Risk"



            ),



        [students]



    );







    const lowRiskStudents = useMemo(



        () =>



            students.filter(



                (student) =>



                    student.risk_status === "Low Risk"



            ),



        [students]



    );







    const pendingFollowups = useMemo(



        () =>



            followups.filter(



                (followup) =>



                    followup.status === "Pending"



            ),



        [followups]



    );







    const activeInterventions = useMemo(



        () =>



            interventions.filter(



                (intervention) =>



                    intervention.status === "Planned" ||



                    intervention.status === "In Progress"



            ),



        [interventions]



    );







    const completedInterventions = useMemo(



        () =>



            interventions.filter(



                (intervention) =>



                    intervention.status === "Completed"



            ),



        [interventions]



    );








    const parentAlerts = useMemo(
        () =>
            activities.filter(
                (activity) =>
                    String(
                        activity.activity_type || ""
                    ).trim().toLowerCase() === "parent alert"
            ),
        [activities]
    );


    const recentActivities = useMemo(



        () =>



            [...activities]



                .sort(



                    (a, b) =>



                        new Date(b.activity_date) -



                        new Date(a.activity_date)



                )



                .slice(0, 5),



        [activities]



    );







    const recentInterventions = useMemo(



        () =>



            [...interventions]



                .sort(



                    (a, b) =>



                        new Date(b.created_at) -



                        new Date(a.created_at)



                )



                .slice(0, 5),



        [interventions]



    );







    const upcomingFollowups = useMemo(



        () =>



            [...pendingFollowups]



                .filter(



                    (followup) =>



                        followup.follow_up_date



                )



                .sort(



                    (a, b) =>



                        new Date(a.follow_up_date) -



                        new Date(b.follow_up_date)



                )



                .slice(0, 5),



        [pendingFollowups]



    );







    // =====================================================



    // HELPERS



    // =====================================================







    const formatDate = (value) => {



        if (!value) {



            return "-";



        }







        const date = new Date(value);







        if (Number.isNaN(date.getTime())) {



            return value;



        }







        return date.toLocaleDateString("en-IN", {



            day: "2-digit",



            month: "short",



            year: "numeric"



        });



    };







    const formatDateTime = (value) => {



        if (!value) {



            return "-";



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



            minute: "2-digit"



        });



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







    const getInterventionStyle = (status) => {



        if (status === "Completed") {



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







        if (status === "Cancelled") {



            return {



                background: "#f1f5f9",



                color: "#475569"



            };



        }







        return {



            background: "#fef3c7",



            color: "#92400e"



        };



    };







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



            <div style={loadingPageStyle}>



                <div style={loadingCardStyle}>



                    <div style={loadingIconStyle}>



                        👨‍🏫



                    </div>







                    <h2 style={{ margin: "0 0 8px" }}>



                        Loading Mentor Dashboard



                    </h2>







                    <p style={{ margin: 0, color: "#64748b" }}>



                        Loading assigned students and mentoring data...



                    </p>



                </div>



            </div>



        );



    }







    // =====================================================



    // DASHBOARD



    // =====================================================







    return (



        <div style={pageStyle}>



            <div style={containerStyle}>







                {/* HEADER */}







                <div style={headerStyle}>



                    <div>



                        <div style={eyebrowStyle}>



                            MENTOR PORTAL



                        </div>







                        <h1 style={titleStyle}>



                            Mentor Dashboard



                        </h1>







                        <p style={subtitleStyle}>



                            Monitor assigned students, mentoring



                            activities, follow-ups and interventions.



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



                                    {mentor?.name ||



                                        mentorName}



                                </div>







                                <div style={mentorDepartmentStyle}>



                                    {mentor?.department ||



                                        mentorDepartment}



                                </div>



                            </div>



                        </div>







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
                            onClick={() =>
                                navigate("/mentor/parent-alerts")
                            }
                            style={parentAlertHeaderButtonStyle}
                        >
                            🔔 Parent Alerts
                        </button>








                        <div style={notificationWrapperStyle}>
                            <button
                                onClick={() => navigate("/mentor/notifications")}
                                style={notificationButtonStyle}
                                title="Notifications"
                            >
                                🔔
                                {unreadNotifications > 0 && (
                                    <span style={notificationCountStyle}>
                                        {unreadNotifications > 99
                                            ? "99+"
                                            : unreadNotifications}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div style={notificationDropdownStyle}>
                                    <div style={notificationHeaderStyle}>
                                        <div>
                                            <h3
                                                style={{
                                                    margin: 0,
                                                    fontSize: "17px",
                                                    color: "#0f172a"
                                                }}
                                            >
                                                Notifications
                                            </h3>
                                            <span
                                                style={{
                                                    fontSize: "12px",
                                                    color: "#64748b"
                                                }}
                                            >
                                                {unreadNotifications} unread
                                            </span>
                                        </div>

                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "8px",
                                                alignItems: "center"
                                            }}
                                        >
                                            <button
                                                onClick={loadNotifications}
                                                style={notificationRefreshButtonStyle}
                                            >
                                                ↻
                                            </button>

                                            {unreadNotifications > 0 && (
                                                <button
                                                    onClick={markAllNotificationsAsRead}
                                                    style={markAllButtonStyle}
                                                >
                                                    Mark all as read
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div style={notificationListStyle}>
                                        {notificationLoading ? (
                                            <div style={notificationEmptyStyle}>
                                                Loading notifications...
                                            </div>
                                        ) : notifications.length === 0 ? (
                                            <div style={notificationEmptyStyle}>
                                                <div
                                                    style={{
                                                        fontSize: "35px",
                                                        marginBottom: "10px"
                                                    }}
                                                >
                                                    🔔
                                                </div>
                                                <div
                                                    style={{
                                                        fontWeight: "600",
                                                        color: "#334155"
                                                    }}
                                                >
                                                    No notifications
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "13px",
                                                        color: "#94a3b8",
                                                        marginTop: "5px"
                                                    }}
                                                >
                                                    You're all caught up.
                                                </div>
                                            </div>
                                        ) : (
                                            notifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    onClick={() => {
                                                        if (!notification.is_read) {
                                                            markNotificationAsRead(
                                                                notification.id
                                                            );
                                                        }
                                                    }}
                                                    style={{
                                                        ...notificationItemStyle,
                                                        background: notification.is_read
                                                            ? "#ffffff"
                                                            : "#f8fafc",
                                                        cursor: notification.is_read
                                                            ? "default"
                                                            : "pointer"
                                                    }}
                                                >
                                                    <div style={notificationItemRowStyle}>
                                                        <div
                                                            style={{
                                                                ...notificationIconStyle,
                                                                background:
                                                                    notification.priority === "High"
                                                                        ? "#fee2e2"
                                                                        : notification.priority === "Medium"
                                                                        ? "#fef3c7"
                                                                        : "#dbeafe"
                                                            }}
                                                        >
                                                            {notification.priority === "High"
                                                                ? "⚠️"
                                                                : notification.notification_type === "Follow-up"
                                                                ? "📅"
                                                                : notification.notification_type === "Intervention"
                                                                ? "🎯"
                                                                : "🔔"}
                                                        </div>

                                                        <div style={notificationContentStyle}>
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    justifyContent: "space-between",
                                                                    gap: "8px"
                                                                }}
                                                            >
                                                                <strong
                                                                    style={{
                                                                        fontSize: "14px",
                                                                        color: "#0f172a"
                                                                    }}
                                                                >
                                                                    {notification.title}
                                                                </strong>

                                                                {!notification.is_read && (
                                                                    <span
                                                                        style={notificationUnreadDotStyle}
                                                                    />
                                                                )}
                                                            </div>

                                                            <p
                                                                style={{
                                                                    margin: "5px 0",
                                                                    fontSize: "13px",
                                                                    lineHeight: "1.45",
                                                                    color: "#64748b"
                                                                }}
                                                            >
                                                                {notification.message}
                                                            </p>

                                                            {notification.student_name && (
                                                                <div
                                                                    style={{
                                                                        fontSize: "11px",
                                                                        color: "#475569",
                                                                        marginTop: "5px"
                                                                    }}
                                                                >
                                                                    👨‍🎓 {notification.student_name}
                                                                    {notification.student_usn &&
                                                                        ` • ${notification.student_usn}`}
                                                                </div>
                                                            )}

                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    gap: "8px",
                                                                    marginTop: "7px",
                                                                    alignItems: "center",
                                                                    flexWrap: "wrap"
                                                                }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        ...notificationPriorityStyle,
                                                                        background:
                                                                            notification.priority === "High"
                                                                                ? "#fee2e2"
                                                                                : notification.priority === "Medium"
                                                                                ? "#fef3c7"
                                                                                : "#dbeafe",
                                                                        color:
                                                                            notification.priority === "High"
                                                                                ? "#b91c1c"
                                                                                : notification.priority === "Medium"
                                                                                ? "#92400e"
                                                                                : "#1d4ed8"
                                                                    }}
                                                                >
                                                                    {notification.priority}
                                                                </span>

                                                                <span
                                                                    style={{
                                                                        fontSize: "11px",
                                                                        color: "#94a3b8"
                                                                    }}
                                                                >
                                                                    {notification.created_at
                                                                        ? formatDateTime(
                                                                              notification.created_at
                                                                          )
                                                                        : ""}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={loadDashboard}
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



                </div>







                {error && (



                    <div style={errorStyle}>



                        ⚠ {error}



                    </div>



                )}







                {/* SUMMARY CARDS */}







                <div style={summaryGridStyle}>







                    <DashboardCard



                        icon="👨‍🎓"



                        title="Assigned Students"



                        value={students.length}



                        description="Students assigned to you"



                        iconBackground="#ede9fe"



                    />







                    <DashboardCard



                        icon="🔴"



                        title="High Risk"



                        value={highRiskStudents.length}



                        description="Students needing attention"



                        iconBackground="#fee2e2"



                    />







                    <DashboardCard



                        icon="📅"



                        title="Pending Follow-ups"



                        value={pendingFollowups.length}



                        description="Follow-ups awaiting action"



                        iconBackground="#fef3c7"



                    />







                    <DashboardCard



                        icon="🎯"



                        title="Active Interventions"



                        value={activeInterventions.length}



                        description="Planned or in progress"



                        iconBackground="#dbeafe"



                    />



                
                    <DashboardCard
                        icon="🔔"
                        title="Parent Alerts"
                        value={parentAlerts.length}
                        description="Alerts sent to parents"
                        iconBackground="#fce7f3"
                    />

                    <DashboardCard
                        icon="📢"
                        title="Unread Notifications"
                        value={unreadNotifications}
                        description="Notifications requiring attention"
                        iconBackground="#ffedd5"
                    />

</div>







                {/* RISK + INTERVENTION SUMMARY */}







                <div style={twoColumnGridStyle}>







                    <section style={panelStyle}>



                        <div style={panelHeaderStyle}>



                            <div>



                                <h2 style={panelTitleStyle}>



                                    Student Risk Overview



                                </h2>







                                <p style={panelSubtitleStyle}>



                                    Current risk distribution of your



                                    assigned students



                                </p>



                            </div>



                        </div>







                        <div style={riskRowsStyle}>







                            <RiskRow



                                label="Low Risk"



                                value={lowRiskStudents.length}



                                total={students.length}



                                color="#16a34a"



                                background="#dcfce7"



                            />







                            <RiskRow



                                label="Medium Risk"



                                value={mediumRiskStudents.length}



                                total={students.length}



                                color="#d97706"



                                background="#fef3c7"



                            />







                            <RiskRow



                                label="High Risk"



                                value={highRiskStudents.length}



                                total={students.length}



                                color="#dc2626"



                                background="#fee2e2"



                            />







                        </div>



                    </section>







                    <section style={panelStyle}>



                        <div style={panelHeaderStyle}>



                            <div>



                                <h2 style={panelTitleStyle}>



                                    Intervention Summary



                                </h2>







                                <p style={panelSubtitleStyle}>



                                    Current intervention status



                                </p>



                            </div>



                        </div>







                        <div style={miniStatsGridStyle}>







                            <MiniStat



                                icon="🟡"



                                label="Planned"



                                value={



                                    interventions.filter(



                                        (item) =>



                                            item.status === "Planned"



                                    ).length



                                }



                            />







                            <MiniStat



                                icon="🔵"



                                label="In Progress"



                                value={



                                    interventions.filter(



                                        (item) =>



                                            item.status ===



                                            "In Progress"



                                    ).length



                                }



                            />







                            <MiniStat



                                icon="🟢"



                                label="Completed"



                                value={



                                    completedInterventions.length



                                }



                            />







                            <MiniStat



                                icon="📊"



                                label="Total"



                                value={



                                    interventions.length



                                }



                            />







                        </div>



                    </section>



                </div>







                {/* HIGH RISK STUDENTS */}







                <section style={panelStyle}>



                    <div style={panelHeaderStyle}>



                        <div>



                            <h2 style={panelTitleStyle}>



                                Students Requiring Attention



                            </h2>







                            <p style={panelSubtitleStyle}>



                                High and medium risk students assigned



                                to you



                            </p>



                        </div>







                        <button



                            onClick={() =>



                                navigate(



                                    "/mentor/student-monitoring"



                                )



                            }



                            style={smallActionButtonStyle}



                        >



                            View All Students →



                        </button>



                    </div>







                    {[



                        ...highRiskStudents,



                        ...mediumRiskStudents



                    ].length === 0 ? (



                        <EmptyState



                            icon="✅"



                            title="No students currently require attention"



                            text="All assigned students are currently in the Low Risk category."



                        />



                    ) : (



                        <div style={tableWrapperStyle}>



                            <table style={tableStyle}>



                                <thead>



                                    <tr>



                                        <th style={thStyle}>



                                            Student



                                        </th>







                                        <th style={thStyle}>



                                            USN



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



                                            Risk



                                        </th>







                                        <th style={thStyle}>



                                            Action



                                        </th>



                                    </tr>



                                </thead>







                                <tbody>



                                    {[



                                        ...highRiskStudents,



                                        ...mediumRiskStudents



                                    ].map((student) => (



                                        <tr key={student.id}>



                                            <td style={tdStyle}>



                                                <strong>



                                                    {student.name}



                                                </strong>



                                            </td>







                                            <td style={tdStyle}>



                                                {student.usn}



                                            </td>







                                            <td style={tdStyle}>



                                                {student.cgpa !== null &&



                                                student.cgpa !==



                                                    undefined



                                                    ? Number(



                                                        student.cgpa



                                                    ).toFixed(2)



                                                    : "-"}



                                            </td>







                                            <td style={tdStyle}>



                                                {student.attendance !==



                                                    null &&



                                                student.attendance !==



                                                    undefined



                                                    ? `${Number(



                                                        student.attendance



                                                    ).toFixed(2)}%`



                                                    : "-"}



                                            </td>







                                            <td style={tdStyle}>



                                                {student.backlogs ?? 0}



                                            </td>







                                            <td style={tdStyle}>



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



                                            </td>







                                            <td style={tdStyle}>



                                                <button



                                                    onClick={() =>



                                                        navigate(



                                                            "/mentor/mentoring"



                                                        )



                                                    }



                                                    style={



                                                        viewButtonStyle



                                                    }



                                                >



                                                    Mentor



                                                </button>



                                            </td>



                                        </tr>



                                    ))}



                                </tbody>



                            </table>



                        </div>



                    )}



                </section>







                {/* THREE ACTIVITY COLUMNS */}







                <div style={threeColumnGridStyle}>







                    {/* RECENT ACTIVITIES */}







                    <section style={panelStyle}>



                        <div style={panelHeaderStyle}>



                            <div>



                                <h2 style={panelTitleStyle}>



                                    Recent Mentoring Activities



                                </h2>







                                <p style={panelSubtitleStyle}>



                                    Latest sessions recorded



                                </p>



                            </div>







                            <span style={countBadgeStyle}>



                                {activities.length}



                            </span>



                        </div>







                        {recentActivities.length === 0 ? (



                            <EmptyState



                                icon="📋"



                                title="No activities yet"



                                text="Recorded mentoring activities will appear here."



                            />



                        ) : (



                            <div style={listStyle}>



                                {recentActivities.map(



                                    (activity) => (



                                        <div



                                            key={activity.id}



                                            style={listItemStyle}



                                        >



                                            <div



                                                style={



                                                    listIconStyle



                                                }



                                            >



                                                📋



                                            </div>







                                            <div



                                                style={



                                                    listContentStyle



                                                }



                                            >



                                                <strong>



                                                    {



                                                        activity.activity_type



                                                    }



                                                </strong>







                                                <div



                                                    style={



                                                        listStudentStyle



                                                    }



                                                >



                                                    {



                                                        activity.student_name



                                                    }{" "}



                                                    •{" "}



                                                    {



                                                        activity.student_usn



                                                    }



                                                </div>







                                                <p



                                                    style={



                                                        listDescriptionStyle



                                                    }



                                                >



                                                    {



                                                        activity.description



                                                    }



                                                </p>







                                                <small



                                                    style={



                                                        listDateStyle



                                                    }



                                                >



                                                    {formatDateTime(



                                                        activity.activity_date



                                                    )}



                                                </small>



                                            </div>



                                        </div>



                                    )



                                )}



                            </div>



                        )}



                    </section>







                    {/* RECENT INTERVENTIONS */}







                    <section style={panelStyle}>



                        <div style={panelHeaderStyle}>



                            <div>



                                <h2 style={panelTitleStyle}>



                                    Recent Interventions



                                </h2>







                                <p style={panelSubtitleStyle}>



                                    Latest intervention actions



                                </p>



                            </div>







                            <span style={countBadgeStyle}>



                                {interventions.length}



                            </span>



                        </div>







                        {recentInterventions.length === 0 ? (



                            <EmptyState



                                icon="🎯"



                                title="No interventions yet"



                                text="Student interventions will appear here."



                            />



                        ) : (



                            <div style={listStyle}>



                                {recentInterventions.map(



                                    (intervention) => (



                                        <div



                                            key={



                                                intervention.id



                                            }



                                            style={listItemStyle}



                                        >



                                            <div



                                                style={



                                                    listIconStyle



                                                }



                                            >



                                                🎯



                                            </div>







                                            <div



                                                style={



                                                    listContentStyle



                                                }



                                            >



                                                <strong>



                                                    {



                                                        intervention.intervention_type



                                                    }



                                                </strong>







                                                <div



                                                    style={



                                                        listStudentStyle



                                                    }



                                                >



                                                    {



                                                        intervention.student_name



                                                    }{" "}



                                                    •{" "}



                                                    {



                                                        intervention.student_usn



                                                    }



                                                </div>







                                                <p



                                                    style={



                                                        listDescriptionStyle



                                                    }



                                                >



                                                    {



                                                        intervention.description



                                                    }



                                                </p>







                                                <div



                                                    style={{



                                                        display:



                                                            "flex",



                                                        gap: "8px",



                                                        alignItems:



                                                            "center",



                                                        flexWrap:



                                                            "wrap"



                                                    }}



                                                >



                                                    <span



                                                        style={{



                                                            ...badgeStyle,



                                                            ...getPriorityStyle(



                                                                intervention.priority



                                                            )



                                                        }}



                                                    >



                                                        {



                                                            intervention.priority



                                                        }



                                                    </span>







                                                    <span



                                                        style={{



                                                            ...badgeStyle,



                                                            ...getInterventionStyle(



                                                                intervention.status



                                                            )



                                                        }}



                                                    >



                                                        {



                                                            intervention.status



                                                        }



                                                    </span>



                                                </div>



                                            </div>



                                        </div>



                                    )



                                )}



                            </div>



                        )}



                    </section>







                    {/* UPCOMING FOLLOWUPS */}







                    <section style={panelStyle}>



                        <div style={panelHeaderStyle}>



                            <div>



                                <h2 style={panelTitleStyle}>



                                    Upcoming Follow-ups



                                </h2>







                                <p style={panelSubtitleStyle}>



                                    Pending student follow-ups



                                </p>



                            </div>







                            <span style={countBadgeStyle}>



                                {pendingFollowups.length}



                            </span>



                        </div>







                        {upcomingFollowups.length === 0 ? (



                            <EmptyState



                                icon="📅"



                                title="No pending follow-ups"



                                text="Scheduled pending follow-ups will appear here."



                            />



                        ) : (



                            <div style={listStyle}>



                                {upcomingFollowups.map(



                                    (followup) => (



                                        <div



                                            key={followup.id}



                                            style={listItemStyle}



                                        >



                                            <div



                                                style={



                                                    listIconStyle



                                                }



                                            >



                                                📅



                                            </div>







                                            <div



                                                style={



                                                    listContentStyle



                                                }



                                            >



                                                <strong>



                                                    {



                                                        followup.student_name



                                                    }



                                                </strong>







                                                <div



                                                    style={



                                                        listStudentStyle



                                                    }



                                                >



                                                    {



                                                        followup.student_usn



                                                    }



                                                </div>







                                                <p



                                                    style={



                                                        listDescriptionStyle



                                                    }



                                                >



                                                    {



                                                        followup.purpose ||



                                                        "Mentor follow-up"



                                                    }



                                                </p>







                                                <small



                                                    style={



                                                        upcomingDateStyle



                                                    }



                                                >



                                                    {formatDateTime(



                                                        followup.follow_up_date



                                                    )}



                                                </small>



                                            </div>



                                        </div>



                                    )



                                )}



                            </div>



                        )}



                    </section>



                </div>







                {/* QUICK ACTIONS */}







                <section style={quickActionsStyle}>



                    <div>



                        <h2 style={panelTitleStyle}>



                            Quick Actions



                        </h2>







                        <p style={panelSubtitleStyle}>



                            Continue managing your assigned students.



                        </p>



                    </div>







                    <div style={quickActionButtonsStyle}>

                        <button
                            onClick={() =>
                                navigate("/mentor/student-monitoring")
                            }
                            style={quickActionButtonStyle}
                        >
                            👨‍🎓 Student Monitoring
                        </button>

                        <button
                            onClick={() =>
                                navigate("/mentor/mentoring")
                            }
                            style={quickActionButtonStyle}
                        >
                            📝 Open Mentoring
                        </button>

                        <button
                            onClick={() =>
                                navigate("/mentor/parent-alerts")
                            }
                            style={quickActionButtonStyle}
                        >
                            🔔 Parent Alerts
                        </button>

                        <button
                            onClick={() =>
                                navigate("/mentor/reports")
                            }
                            style={quickActionButtonStyle}
                        >
                            📊 Mentor Reports
                        </button>

                        <button
                            onClick={() =>
                                navigate("/mentor/notifications")
                            }
                            style={quickActionButtonStyle}
                        >
                            🔔 Notifications
                        </button>

                    </div>



                </section>







            </div>



        </div>



    );



}







// =====================================================



// COMPONENTS



// =====================================================







function DashboardCard({



    icon,



    title,



    value,



    description,



    iconBackground



}) {



    return (



        <div style={dashboardCardStyle}>



            <div



                style={{



                    ...dashboardCardIconStyle,



                    background: iconBackground



                }}



            >



                {icon}



            </div>







            <div>



                <div style={dashboardCardTitleStyle}>



                    {title}



                </div>







                <div style={dashboardCardValueStyle}>



                    {value}



                </div>







                <div style={dashboardCardDescriptionStyle}>



                    {description}



                </div>



            </div>



        </div>



    );



}







function RiskRow({



    label,



    value,



    total,



    color,



    background



}) {



    const percentage =



        total > 0



            ? Math.round((value / total) * 100)



            : 0;







    return (



        <div style={riskRowStyle}>



            <div style={riskLabelRowStyle}>



                <div style={{ display: "flex", gap: "9px", alignItems: "center" }}>



                    <span



                        style={{



                            width: "10px",



                            height: "10px",



                            borderRadius: "50%",



                            background: color,



                            display: "inline-block"



                        }}



                    />







                    <strong>{label}</strong>



                </div>







                <strong>{value}</strong>



            </div>







            <div style={progressBackgroundStyle}>



                <div



                    style={{



                        ...progressBarStyle,



                        width: `${percentage}%`,



                        background: color



                    }}



                />



            </div>







            <div



                style={{



                    fontSize: "12px",



                    color: "#64748b",



                    marginTop: "5px"



                }}



            >



                {percentage}% of assigned students



            </div>



        </div>



    );



}







function MiniStat({



    icon,



    label,



    value



}) {



    return (



        <div style={miniStatStyle}>



            <div style={miniStatIconStyle}>



                {icon}



            </div>







            <div>



                <div style={miniStatValueStyle}>



                    {value}



                </div>







                <div style={miniStatLabelStyle}>



                    {label}



                </div>



            </div>



        </div>



    );



}







function EmptyState({



    icon,



    title,



    text



}) {



    return (



        <div style={emptyStateStyle}>



            <div style={{ fontSize: "32px", marginBottom: "8px" }}>



                {icon}



            </div>







            <strong



                style={{



                    display: "block",



                    color: "#334155",



                    marginBottom: "5px"



                }}



            >



                {title}



            </strong>







            <span style={{ color: "#94a3b8", fontSize: "13px" }}>



                {text}



            </span>



        </div>



    );



}







// =====================================================



// STYLES



// =====================================================







const pageStyle = {



    minHeight: "100vh",



    background: "#f5f7fb",



    fontFamily: "Arial, sans-serif",



    padding: "28px"



};







const containerStyle = {



    maxWidth: "1450px",



    margin: "0 auto"



};







const loadingPageStyle = {



    minHeight: "100vh",



    background: "#f5f7fb",



    display: "flex",



    alignItems: "center",



    justifyContent: "center",



    fontFamily: "Arial, sans-serif"



};







const loadingCardStyle = {



    background: "#ffffff",



    padding: "40px",



    borderRadius: "20px",



    textAlign: "center",



    boxShadow: "0 10px 30px rgba(0,0,0,0.07)"



};







const loadingIconStyle = {



    fontSize: "45px",



    marginBottom: "15px"



};







const headerStyle = {



    background: "#ffffff",



    borderRadius: "20px",



    padding: "24px 28px",



    display: "flex",



    justifyContent: "space-between",



    alignItems: "center",



    gap: "20px",



    flexWrap: "wrap",



    boxShadow: "0 8px 25px rgba(0,0,0,0.06)",



    marginBottom: "20px"



};







const eyebrowStyle = {



    fontSize: "12px",



    fontWeight: "800",



    color: "#7c3aed",



    letterSpacing: "1.5px",



    marginBottom: "7px"



};







const titleStyle = {



    margin: 0,



    color: "#0f172a",



    fontSize: "30px"



};







const subtitleStyle = {



    margin: "8px 0 0",



    color: "#64748b",



    fontSize: "14px"



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



    marginRight: "5px"



};







const mentorAvatarStyle = {



    width: "44px",



    height: "44px",



    borderRadius: "14px",



    background: "#ede9fe",



    color: "#7c3aed",



    display: "flex",



    alignItems: "center",



    justifyContent: "center",



    fontWeight: "800",



    fontSize: "20px"



};







const mentorNameStyle = {



    fontWeight: "800",



    color: "#0f172a",



    fontSize: "14px"



};







const mentorDepartmentStyle = {



    color: "#64748b",



    fontSize: "12px",



    marginTop: "2px"



};







const secondaryButtonStyle = {



    border: "none",



    borderRadius: "10px",



    padding: "10px 15px",



    background: "#ede9fe",



    color: "#6d28d9",



    fontWeight: "700",



    cursor: "pointer"



};







const reportsButtonStyle = {

    border: "none",

    borderRadius: "10px",

    padding: "10px 15px",

    background: "#f3e8ff",

    color: "#7e22ce",

    fontWeight: "700",

    cursor: "pointer"

};



const notificationWrapperStyle = {
    position: "relative"
};

const notificationButtonStyle = {
    position: "relative",
    border: "none",
    borderRadius: "10px",
    padding: "10px 14px",
    background: "#f8fafc",
    color: "#334155",
    fontSize: "20px",
    cursor: "pointer"
};

const notificationCountStyle = {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    minWidth: "20px",
    height: "20px",
    padding: "0 5px",
    borderRadius: "50px",
    background: "#ef4444",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box"
};

const notificationDropdownStyle = {
    position: "absolute",
    top: "56px",
    right: "0",
    width: "390px",
    maxWidth: "calc(100vw - 30px)",
    maxHeight: "520px",
    background: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
    border: "1px solid #e2e8f0",
    zIndex: 1000,
    overflow: "hidden"
};

const notificationHeaderStyle = {
    padding: "16px 18px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px"
};

const notificationRefreshButtonStyle = {
    border: "none",
    background: "#f1f5f9",
    color: "#475569",
    borderRadius: "8px",
    padding: "6px 9px",
    cursor: "pointer",
    fontWeight: "700"
};

const markAllButtonStyle = {
    border: "none",
    background: "transparent",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap"
};

const notificationListStyle = {
    maxHeight: "430px",
    overflowY: "auto"
};

const notificationEmptyStyle = {
    padding: "45px 20px",
    textAlign: "center",
    color: "#64748b"
};

const notificationItemStyle = {
    padding: "14px 16px",
    borderBottom: "1px solid #f1f5f9",
    transition: "background 0.2s ease"
};

const notificationItemRowStyle = {
    display: "flex",
    gap: "10px"
};

const notificationIconStyle = {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "18px"
};

const notificationContentStyle = {
    flex: 1,
    minWidth: 0
};

const notificationUnreadDotStyle = {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#2563eb",
    flexShrink: 0,
    marginTop: "5px"
};

const notificationPriorityStyle = {
    fontSize: "10px",
    fontWeight: "700",
    padding: "3px 7px",
    borderRadius: "20px"
};

const parentAlertHeaderButtonStyle = {
    border: "1px solid #f9a8d4",
    borderRadius: "10px",
    padding: "10px 14px",
    background: "#fdf2f8",
    color: "#be185d",
    fontWeight: "700",
    cursor: "pointer"
};

const refreshButtonStyle = {



    border: "none",



    borderRadius: "10px",



    padding: "10px 15px",



    background: "#2563eb",



    color: "#ffffff",



    fontWeight: "700",



    cursor: "pointer"



};







const logoutButtonStyle = {



    border: "none",



    borderRadius: "10px",



    padding: "10px 15px",



    background: "#ef4444",



    color: "#ffffff",



    fontWeight: "700",



    cursor: "pointer"



};







const errorStyle = {



    background: "#fee2e2",



    color: "#b91c1c",



    border: "1px solid #fecaca",



    padding: "14px 16px",



    borderRadius: "12px",



    marginBottom: "20px",



    fontWeight: "600"



};







const summaryGridStyle = {



    display: "grid",



    gridTemplateColumns:



        "repeat(auto-fit, minmax(220px, 1fr))",



    gap: "16px",



    marginBottom: "20px"



};







const dashboardCardStyle = {



    background: "#ffffff",



    borderRadius: "17px",



    padding: "20px",



    display: "flex",



    alignItems: "center",



    gap: "15px",



    boxShadow: "0 8px 25px rgba(0,0,0,0.05)"



};







const dashboardCardIconStyle = {



    width: "52px",



    height: "52px",



    borderRadius: "15px",



    display: "flex",



    alignItems: "center",



    justifyContent: "center",



    fontSize: "25px",



    flexShrink: 0



};







const dashboardCardTitleStyle = {



    fontSize: "13px",



    color: "#64748b"



};







const dashboardCardValueStyle = {



    fontSize: "30px",



    fontWeight: "800",



    color: "#0f172a",



    marginTop: "3px"



};







const dashboardCardDescriptionStyle = {



    fontSize: "11px",



    color: "#94a3b8",



    marginTop: "3px"



};







const twoColumnGridStyle = {



    display: "grid",



    gridTemplateColumns:



        "repeat(auto-fit, minmax(360px, 1fr))",



    gap: "20px",



    marginBottom: "20px"



};







const threeColumnGridStyle = {



    display: "grid",



    gridTemplateColumns:



        "repeat(auto-fit, minmax(330px, 1fr))",



    gap: "20px",



    marginBottom: "20px"



};







const panelStyle = {



    background: "#ffffff",



    borderRadius: "18px",



    padding: "22px",



    boxShadow: "0 8px 25px rgba(0,0,0,0.05)",



    minWidth: 0



};







const panelHeaderStyle = {



    display: "flex",



    justifyContent: "space-between",



    alignItems: "flex-start",



    gap: "15px",



    marginBottom: "18px"



};







const panelTitleStyle = {



    margin: 0,



    color: "#0f172a",



    fontSize: "20px"



};







const panelSubtitleStyle = {



    margin: "5px 0 0",



    color: "#64748b",



    fontSize: "13px"



};







const riskRowsStyle = {



    display: "grid",



    gap: "18px"



};







const riskRowStyle = {



    width: "100%"



};







const riskLabelRowStyle = {



    display: "flex",



    justifyContent: "space-between",



    alignItems: "center",



    color: "#334155",



    fontSize: "14px",



    marginBottom: "8px"



};







const progressBackgroundStyle = {



    height: "9px",



    background: "#f1f5f9",



    borderRadius: "20px",



    overflow: "hidden"



};







const progressBarStyle = {



    height: "100%",



    borderRadius: "20px",



    transition: "width 0.3s ease"



};







const miniStatsGridStyle = {



    display: "grid",



    gridTemplateColumns:



        "repeat(2, minmax(120px, 1fr))",



    gap: "12px"



};







const miniStatStyle = {



    background: "#f8fafc",



    borderRadius: "14px",



    padding: "16px",



    display: "flex",



    alignItems: "center",



    gap: "10px"



};







const miniStatIconStyle = {



    fontSize: "22px"



};







const miniStatValueStyle = {



    fontSize: "24px",



    fontWeight: "800",



    color: "#0f172a"



};







const miniStatLabelStyle = {



    fontSize: "12px",



    color: "#64748b"



};







const tableWrapperStyle = {



    overflowX: "auto"



};







const tableStyle = {



    width: "100%",



    borderCollapse: "collapse",



    minWidth: "850px"



};







const thStyle = {



    padding: "13px 12px",



    textAlign: "left",



    fontSize: "12px",



    color: "#64748b",



    background: "#f8fafc",



    borderBottom: "1px solid #e2e8f0",



    whiteSpace: "nowrap"



};







const tdStyle = {



    padding: "14px 12px",



    fontSize: "13px",



    color: "#334155",



    borderBottom: "1px solid #e2e8f0",



    whiteSpace: "nowrap"



};







const badgeStyle = {



    display: "inline-block",



    padding: "6px 10px",



    borderRadius: "20px",



    fontSize: "11px",



    fontWeight: "800"



};







const viewButtonStyle = {



    border: "none",



    borderRadius: "8px",



    padding: "7px 11px",



    background: "#ede9fe",



    color: "#6d28d9",



    fontWeight: "700",



    cursor: "pointer"



};







const smallActionButtonStyle = {



    border: "none",



    background: "#ede9fe",



    color: "#6d28d9",



    borderRadius: "9px",



    padding: "8px 12px",



    fontWeight: "700",



    cursor: "pointer",



    whiteSpace: "nowrap"



};







const countBadgeStyle = {



    minWidth: "28px",



    height: "28px",



    padding: "0 8px",



    borderRadius: "20px",



    background: "#ede9fe",



    color: "#6d28d9",



    display: "flex",



    alignItems: "center",



    justifyContent: "center",



    fontSize: "12px",



    fontWeight: "800"



};







const listStyle = {



    display: "grid",



    gap: "12px"



};







const listItemStyle = {



    display: "flex",



    gap: "12px",



    padding: "12px",



    borderRadius: "12px",



    background: "#f8fafc"



};







const listIconStyle = {



    width: "38px",



    height: "38px",



    borderRadius: "11px",



    background: "#ede9fe",



    display: "flex",



    alignItems: "center",



    justifyContent: "center",



    flexShrink: 0



};







const listContentStyle = {



    minWidth: 0,



    flex: 1



};







const listStudentStyle = {



    fontSize: "11px",



    color: "#64748b",



    marginTop: "3px"



};







const listDescriptionStyle = {



    fontSize: "12px",



    color: "#475569",



    margin: "7px 0",



    lineHeight: "1.45"



};







const listDateStyle = {



    color: "#94a3b8",



    fontSize: "10px"



};







const upcomingDateStyle = {



    color: "#7c3aed",



    fontWeight: "700",



    fontSize: "11px"



};







const emptyStateStyle = {



    minHeight: "150px",



    display: "flex",



    flexDirection: "column",



    alignItems: "center",



    justifyContent: "center",



    textAlign: "center",



    padding: "20px"



};







const quickActionsStyle = {



    background: "#ffffff",



    borderRadius: "18px",



    padding: "22px",



    boxShadow: "0 8px 25px rgba(0,0,0,0.05)",



    display: "flex",



    justifyContent: "space-between",



    alignItems: "center",



    gap: "20px",



    flexWrap: "wrap"



};







const quickActionButtonsStyle = {



    display: "flex",



    gap: "10px",



    flexWrap: "wrap"



};







const quickActionButtonStyle = {



    border: "none",



    borderRadius: "10px",



    padding: "11px 16px",



    background: "#7c3aed",



    color: "#ffffff",



    fontWeight: "700",



    cursor: "pointer"



};







export default MentorDashboard;
