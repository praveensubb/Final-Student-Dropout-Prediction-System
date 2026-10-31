import React, {



    useEffect,



    useMemo,



    useState



} from "react";







import { useNavigate } from "react-router-dom";







import "../styles/adminDashboard.css";











const API_URL = "http://127.0.0.1:8000";











function AdminDashboard() {







    const navigate = useNavigate();











    // =====================================================



    // STATE



    // =====================================================







    const [dashboard, setDashboard] = useState(null);







    const [activities, setActivities] = useState([]);







    const [search, setSearch] = useState("");







    const [loading, setLoading] = useState(true);







    const [error, setError] = useState("");







    const [selectedRisk, setSelectedRisk] =



        useState("ALL");











    // =====================================================



    // ADMIN NAME



    // =====================================================







    const adminName =



        localStorage.getItem("adminName") ||



        "Administrator";











    // =====================================================



    // LOAD DATA



    // =====================================================







    const loadDashboard = async () => {







        try {







            setLoading(true);







            setError("");











            // ---------------------------------------------



            // Risk dashboard



            // ---------------------------------------------







            const dashboardResponse =



                await fetch(



                    `${API_URL}/prediction/admin-summary`



                );











            if (!dashboardResponse.ok) {







                throw new Error(



                    "Unable to load student risk data."



                );







            }











            const dashboardData =



                await dashboardResponse.json();











            setDashboard(dashboardData);











            // ---------------------------------------------



            // Faculty activities



            // ---------------------------------------------







            try {







                const activityResponse =



                    await fetch(



                        `${API_URL}/activities/all`



                    );











                if (activityResponse.ok) {







                    const activityData =



                        await activityResponse.json();











                    setActivities(



                        Array.isArray(activityData)



                            ? activityData



                            : []



                    );







                }







            } catch (activityError) {







                console.error(



                    "Activity error:",



                    activityError



                );







            }











        } catch (err) {







            console.error(



                "ADMIN DASHBOARD ERROR:",



                err



            );











            setError(



                err.message ||



                "Failed to load dashboard."



            );







        } finally {







            setLoading(false);







        }







    };











    useEffect(() => {







        loadDashboard();







    }, []);











    // =====================================================



    // LOGOUT



    // =====================================================







    const logout = () => {







        localStorage.removeItem(



            "adminToken"



        );







        localStorage.removeItem(



            "adminId"



        );







        localStorage.removeItem(



            "adminName"



        );











        navigate("/admin-login");







    };











    // =====================================================



    // STATISTICS



    // =====================================================







    const totalStudents =



        dashboard?.total_students || 0;











    const highRisk =



        dashboard?.high_risk || 0;











    const mediumRisk =



        dashboard?.medium_risk || 0;











    const lowRisk =



        dashboard?.low_risk || 0;











    const attentionCount =



        highRisk + mediumRisk;











    // =====================================================



    // PERCENTAGES



    // =====================================================







    const highPercentage =



        totalStudents > 0



            ? Math.round(



                (highRisk / totalStudents) * 100



            )



            : 0;











    const mediumPercentage =



        totalStudents > 0



            ? Math.round(



                (mediumRisk / totalStudents) * 100



            )



            : 0;











    const lowPercentage =



        totalStudents > 0



            ? Math.round(



                (lowRisk / totalStudents) * 100



            )



            : 0;











    // =====================================================



    // ACTIVITY COUNTS



    // =====================================================







    const counsellingCount =



        activities.filter(



            (item) =>



                String(



                    item.activity_type || ""



                ).toLowerCase()



                .includes("counselling")



        ).length;











    const interventionCount =



        activities.filter(



            (item) =>



                String(



                    item.activity_type || ""



                ).toLowerCase()



                .includes("intervention")



        ).length;











    const attendanceCount =



        activities.filter(



            (item) =>



                String(



                    item.activity_type || ""



                ).toLowerCase()



                .includes("attendance")



        ).length;











    const parentAlertCount =



        activities.filter(



            (item) =>



                String(



                    item.activity_type || ""



                ).toLowerCase()



                .includes("parent alert")



        ).length;











    // =====================================================



    // FILTER STUDENTS



    // =====================================================







    const filteredStudents = useMemo(() => {







        if (!dashboard?.students) {







            return [];







        }











        let students =



            dashboard.students;











        // ---------------------------------------------



        // Risk filter



        // ---------------------------------------------







        if (selectedRisk !== "ALL") {







            students =



                students.filter(



                    (student) =>



                        student.risk_level ===



                        selectedRisk



                );







        }











        // ---------------------------------------------



        // Search



        // ---------------------------------------------







        const searchValue =



            search.trim().toLowerCase();











        if (searchValue) {







            students =



                students.filter(



                    (student) =>







                        String(



                            student.name || ""



                        )



                            .toLowerCase()



                            .includes(searchValue)







                        ||







                        String(



                            student.usn || ""



                        )



                            .toLowerCase()



                            .includes(searchValue)







                        ||







                        String(



                            student.email || ""



                        )



                            .toLowerCase()



                            .includes(searchValue)



                );







        }











        return students;







    }, [



        dashboard,



        search,



        selectedRisk



    ]);











    // =====================================================



    // PRIORITY STUDENTS



    // =====================================================







    const priorityStudents =



        dashboard?.priority_students || [];











    // =====================================================



    // FACTORS



    // =====================================================







    const factorSummary =



        dashboard?.factor_summary || [];











    // =====================================================



    // LOADING



    // =====================================================







    if (loading) {







        return (







            <div className="admin-loading">







                <div className="loading-orbit">







                    <div></div>







                </div>







                <h2>



                    Initializing AI Command Center



                </h2>







                <p>



                    Loading student intelligence...



                </p>







            </div>







        );







    }











    // =====================================================



    // ERROR



    // =====================================================







    if (error) {







        return (







            <div className="admin-error">







                <div className="error-icon">



                    !



                </div>







                <h2>



                    Dashboard Connection Error



                </h2>







                <p>



                    {error}



                </p>







                <button



                    onClick={loadDashboard}



                >



                    Try Again



                </button>







            </div>







        );







    }











    // =====================================================



    // MAIN



    // =====================================================







    return (







        <div className="unique-admin">











            {/* =================================================



                SIDEBAR



            ================================================= */}







            <aside className="unique-sidebar">











                {/* LOGO */}







                <div className="unique-logo">







                    <div className="logo-orb">







                        <span>



                            AI



                        </span>







                    </div>











                    <div>







                        <h2>



                            DropoutAI



                        </h2>







                        <span>



                            Command Center



                        </span>







                    </div>







                </div>











                {/* SYSTEM STATUS */}







                <div className="system-status">







                    <span className="status-dot"></span>







                    <span>



                        SYSTEM ONLINE



                    </span>







                </div>











                {/* NAVIGATION */}







                <div className="nav-title">



                    CONTROL



                </div>











                <button



                    className="unique-nav active"



                    onClick={() =>



                        navigate("/admin")



                    }



                >







                    <span>◈</span>







                    Command Center







                </button>











                <button



                    className="unique-nav"



                    onClick={() =>



                        navigate("/risk-cluster")



                    }



                >







                    <span>◉</span>







                    Risk Intelligence







                </button>











                <button



                    className="unique-nav"



                    onClick={() =>



                        navigate(



                            "/faculty-assignment"



                        )



                    }



                >







                    <span>⇄</span>







                    Student Assignment







                </button>











                <button



                    className="unique-nav"



                    onClick={() =>



                        navigate(



                            "/admin/faculty-activities"



                        )



                    }



                >







                    <span>▣</span>







                    Faculty Activities







                </button>



                <button

                    className="unique-nav"

                    onClick={() =>

                        navigate(

                            "/admin/mentor-activities"

                        )

                    }

                >

                    <span>◈</span>

                    Mentor Activities

                </button>

























                <div className="nav-title">



                    SYSTEM



                </div>











                <button



                    className="unique-nav"



                    onClick={() =>



                        navigate(



                            "/student-registration"



                        )



                    }



                >







                    <span>＋</span>







                    Register Student







                </button>











                {/* USER */}







                <div className="sidebar-bottom">











                    <div className="admin-profile">







                        <div className="profile-avatar">







                            {adminName



                                .charAt(0)



                                .toUpperCase()}







                        </div>











                        <div>







                            <strong>



                                {adminName}



                            </strong>







                            <span>



                                Administrator



                            </span>







                        </div>







                    </div>











                    <button



                        className="logout-button"



                        onClick={logout}



                    >







                        ↪







                        Logout







                    </button>











                </div>











            </aside>











            {/* =================================================



                MAIN AREA



            ================================================= */}







            <main className="unique-main">











                {/* =================================================



                    TOP HEADER



                ================================================= */}







                <header className="unique-header">











                    <div>







                        <div className="header-label">







                            AI STUDENT INTELLIGENCE







                        </div>











                        <h1>



                            Command Center



                        </h1>











                        <p>



                            Early-warning intelligence



                            for student success.



                        </p>







                    </div>











                    <div className="header-right">











                        <button



                            className="refresh-button"



                            onClick={loadDashboard}



                        >







                            ↻







                            Refresh







                        </button>











                        <div className="live-indicator">







                            <span></span>







                            Live Monitoring







                        </div>











                    </div>











                </header>











                {/* =================================================



                    HERO AI PANEL



                ================================================= */}







                <section className="ai-hero">











                    <div className="hero-content">











                        <div className="ai-chip">







                            <span>



                                ✦



                            </span>







                            AI EARLY WARNING SYSTEM







                        </div>











                        <h2>







                            Know who needs help



                            <br />







                            <span>



                                before they fall behind.



                            </span>







                        </h2>











                        <p>







                            Your student data is continuously



                            transformed into actionable risk



                            intelligence for administrators



                            and faculty.







                        </p>











                        <div className="hero-actions">











                            <button



                                onClick={() =>



                                    navigate(



                                        "/risk-cluster"



                                    )



                                }



                            >







                                View Risk Intelligence







                                <span>



                                    →



                                </span>







                            </button>











                            <button



                                className="secondary-hero"



                                onClick={() =>



                                    navigate(



                                        "/faculty-assignment"



                                    )



                                }



                            >







                                Manage Assignments







                            </button>







                        </div>











                    </div>











                    {/* AI VISUAL */}







                    <div className="ai-visual">











                        <div className="radar-ring ring-one">



                        </div>







                        <div className="radar-ring ring-two">



                        </div>







                        <div className="radar-ring ring-three">



                        </div>











                        <div className="radar-core">







                            <span>



                                AI



                            </span>







                            <small>



                                ACTIVE



                            </small>







                        </div>











                        <div className="radar-pulse pulse-one">



                        </div>







                        <div className="radar-pulse pulse-two">



                        </div>











                    </div>











                </section>











                {/* =================================================



                    STAT CARDS



                ================================================= */}







                <section className="stat-grid">











                    <button



                        className="unique-stat"



                        onClick={() =>



                            setSelectedRisk("ALL")



                        }



                    >







                        <div className="stat-top">







                            <span>



                                STUDENT POPULATION



                            </span>







                            <b>



                                ↗



                            </b>







                        </div>











                        <strong>



                            {totalStudents}



                        </strong>











                        <small>



                            Registered students



                        </small>











                        <div className="stat-line blue">



                        </div>







                    </button>











                    <button



                        className="unique-stat danger"



                        onClick={() =>



                            setSelectedRisk("HIGH")



                        }



                    >







                        <div className="stat-top">







                            <span>



                                HIGH RISK



                            </span>







                            <b>



                                !



                            </b>







                        </div>











                        <strong>



                            {highRisk}



                        </strong>











                        <small>



                            {highPercentage}%



                            of population



                        </small>











                        <div className="stat-line red">



                        </div>







                    </button>











                    <button



                        className="unique-stat warning"



                        onClick={() =>



                            setSelectedRisk("MEDIUM")



                        }



                    >







                        <div className="stat-top">







                            <span>



                                MEDIUM RISK



                            </span>







                            <b>



                                △



                            </b>







                        </div>











                        <strong>



                            {mediumRisk}



                        </strong>











                        <small>



                            {mediumPercentage}%



                            of population



                        </small>











                        <div className="stat-line orange">



                        </div>







                    </button>











                    <button



                        className="unique-stat success"



                        onClick={() =>



                            setSelectedRisk("LOW")



                        }



                    >







                        <div className="stat-top">







                            <span>



                                LOW RISK



                            </span>







                            <b>



                                ✓



                            </b>







                        </div>











                        <strong>



                            {lowRisk}



                        </strong>











                        <small>



                            {lowPercentage}%



                            of population



                        </small>











                        <div className="stat-line green">



                        </div>







                    </button>











                </section>











                {/* =================================================



                    MAIN INTELLIGENCE GRID



                ================================================= */}







                <section className="intelligence-grid">











                    {/* ---------------------------------------------



                        RISK RADAR



                    --------------------------------------------- */}







                    <div className="glass-card radar-card">











                        <div className="card-header">











                            <div>







                                <span>



                                    RISK ANALYTICS



                                </span>







                                <h3>



                                    Risk Distribution



                                </h3>







                            </div>











                            <span className="live-tag">



                                LIVE



                            </span>







                        </div>











                        <div className="radar-dashboard">











                            <div className="large-radar">











                                <div className="large-ring ring-a">



                                </div>







                                <div className="large-ring ring-b">



                                </div>







                                <div className="large-ring ring-c">



                                </div>











                                <div className="radar-center">







                                    <strong>



                                        {totalStudents}



                                    </strong>







                                    <span>



                                        STUDENTS



                                    </span>







                                </div>











                                <div



                                    className="radar-label high-label"



                                >







                                    <b>



                                        {highRisk}



                                    </b>







                                    HIGH







                                </div>











                                <div



                                    className="radar-label medium-label"



                                >







                                    <b>



                                        {mediumRisk}



                                    </b>







                                    MEDIUM







                                </div>











                                <div



                                    className="radar-label low-label"



                                >







                                    <b>



                                        {lowRisk}



                                    </b>







                                    LOW







                                </div>











                            </div>











                            <div className="radar-legend">











                                <div>







                                    <span className="legend-dot red-dot">



                                    </span>







                                    <span>



                                        High Risk



                                    </span>







                                    <b>



                                        {highPercentage}%



                                    </b>







                                </div>











                                <div>







                                    <span className="legend-dot orange-dot">



                                    </span>







                                    <span>



                                        Medium Risk



                                    </span>







                                    <b>



                                        {mediumPercentage}%



                                    </b>







                                </div>











                                <div>







                                    <span className="legend-dot green-dot">



                                    </span>







                                    <span>



                                        Low Risk



                                    </span>







                                    <b>



                                        {lowPercentage}%



                                    </b>







                                </div>











                            </div>











                        </div>











                    </div>











                    {/* ---------------------------------------------



                        PRIORITY QUEUE



                    --------------------------------------------- */}







                    <div className="glass-card priority-card">











                        <div className="card-header">











                            <div>







                                <span>



                                    AI PRIORITY QUEUE



                                </span>







                                <h3>



                                    Needs Attention



                                </h3>







                            </div>











                            <button



                                className="view-link"



                                onClick={() =>



                                    navigate(



                                        "/risk-cluster"



                                    )



                                }



                            >



                                View all →



                            </button>











                        </div>











                        <div className="priority-list">











                            {priorityStudents.length === 0 ? (







                                <div className="empty-state">







                                    No priority students



                                    detected.







                                </div>







                            ) : (







                                priorityStudents



                                    .slice(0, 5)



                                    .map(



                                        (



                                            student,



                                            index



                                        ) => (







                                            <div



                                                className="priority-item"



                                                key={



                                                    student.id



                                                }



                                            >











                                                <div className="priority-number">







                                                    {String(



                                                        index + 1



                                                    ).padStart(



                                                        2,



                                                        "0"



                                                    )}







                                                </div>











                                                <div



                                                    className={



                                                        student.risk_level ===



                                                        "HIGH"



                                                            ? "priority-avatar high"



                                                            : "priority-avatar medium"



                                                    }



                                                >







                                                    {student.name



                                                        ?.charAt(



                                                            0



                                                        )



                                                        .toUpperCase()}







                                                </div>











                                                <div className="priority-info">







                                                    <strong>



                                                        {student.name}



                                                    </strong>







                                                    <span>



                                                        {student.usn}



                                                    </span>







                                                </div>











                                                <div className="priority-score">







                                                    <strong>



                                                        {



                                                            student.risk_percentage



                                                        }%



                                                    </strong>







                                                    <span>



                                                        {



                                                            student.risk_level



                                                        }



                                                    </span>







                                                </div>











                                            </div>







                                        )



                                    )







                            )}











                        </div>











                    </div>











                </section>











                {/* =================================================



                    AI RISK SIGNALS



                ================================================= */}







                <section className="glass-card signals-card">











                    <div className="card-header">











                        <div>







                            <span>



                                EXPLAINABLE AI



                            </span>







                            <h3>



                                What is driving student risk?



                            </h3>







                        </div>











                        <div className="xai-badge">



                            SHAP + CONTEXT



                        </div>







                    </div>











                    <div className="signals-grid">











                        {factorSummary.length === 0 ? (







                            <div className="empty-state">







                                No risk signals detected.







                            </div>







                        ) : (







                            factorSummary



                                .slice(0, 6)



                                .map(



                                    (



                                        factor,



                                        index



                                    ) => (







                                        <div



                                            className="signal-item"



                                            key={



                                                factor.factor



                                            }



                                        >











                                            <div className="signal-icon">







                                                {index === 0



                                                    ? "◉"



                                                    : index === 1



                                                    ? "△"



                                                    : index === 2



                                                    ? "◆"



                                                    : "○"}







                                            </div>











                                            <div className="signal-content">







                                                <strong>



                                                    {



                                                        factor.factor



                                                    }



                                                </strong>







                                                <span>







                                                    Detected in{" "}



                                                    {



                                                        factor.count



                                                    }{" "}



                                                    students







                                                </span>











                                                <div className="signal-progress">







                                                    <div



                                                        style={{



                                                            width:



                                                                `${Math.min(



                                                                    factor.percentage,



                                                                    100



                                                                )}%`



                                                        }}



                                                    />







                                                </div>







                                            </div>











                                            <b>



                                                {



                                                    factor.percentage



                                                }%



                                            </b>











                                        </div>







                                    )



                                )







                        )}











                    </div>











                </section>











                {/* =================================================



                    OPERATIONS



                ================================================= */}







                <section className="operations-grid">











                    <div className="glass-card operation-card">











                        <div className="operation-icon purple">



                            ◉



                        </div>











                        <div>







                            <span>



                                COUNSELLING



                            </span>







                            <strong>



                                {counsellingCount}



                            </strong>







                            <p>



                                Faculty counselling activities



                            </p>







                        </div>











                        <button



                            onClick={() =>



                                navigate(



                                    "/admin/counselling"



                                )



                            }



                        >



                            →



                        </button>











                    </div>











                    <div className="glass-card operation-card">











                        <div className="operation-icon blue">



                            ◆



                        </div>











                        <div>







                            <span>



                                INTERVENTIONS



                            </span>







                            <strong>



                                {interventionCount}



                            </strong>







                            <p>



                                Student support interventions



                            </p>







                        </div>











                        <button



                            onClick={() =>



                                navigate(



                                    "/interventions"



                                )



                            }



                        >



                            →



                        </button>











                    </div>











                    <div className="glass-card operation-card">











                        <div className="operation-icon orange">



                            ♢



                        </div>











                        <div>







                            <span>



                                ATTENDANCE



                            </span>







                            <strong>



                                {attendanceCount}



                            </strong>







                            <p>



                                Attendance activities



                            </p>







                        </div>











                        <button



                            onClick={() =>



                                navigate(



                                    "/admin/faculty-activities"



                                )



                            }



                        >



                            →



                        </button>











                    </div>











                    <div className="glass-card operation-card">











                        <div className="operation-icon red">



                            !



                        </div>











                        <div>







                            <span>



                                PARENT ALERTS



                            </span>







                            <strong>



                                {parentAlertCount}



                            </strong>







                            <p>



                                Parent alert activities



                            </p>







                        </div>











                        <button



                            onClick={() =>



                                navigate(



                                    "/parent-alerts"



                                )



                            }



                        >



                            →



                        </button>











                    </div>











                </section>











                {/* =================================================



                    STUDENT INTELLIGENCE



                ================================================= */}







                <section className="glass-card students-card">











                    <div className="card-header">











                        <div>







                            <span>



                                STUDENT INTELLIGENCE



                            </span>







                            <h3>



                                Registered Students



                            </h3>







                        </div>











                        <button



                            className="register-button"



                            onClick={() =>



                                navigate(



                                    "/student-registration"



                                )



                            }



                        >







                            + Register Student







                        </button>







                    </div>











                    {/* SEARCH */}







                    <div className="student-tools">











                        <div className="student-search">







                            <span>



                                ⌕



                            </span>







                            <input



                                value={search}



                                onChange={(e) =>



                                    setSearch(



                                        e.target.value



                                    )



                                }



                                placeholder="Search name, USN or email..."



                            />







                        </div>











                        <div className="risk-filters">











                            <button



                                className={



                                    selectedRisk ===



                                    "ALL"



                                        ? "selected"



                                        : ""



                                }



                                onClick={() =>



                                    setSelectedRisk(



                                        "ALL"



                                    )



                                }



                            >



                                All



                            </button>











                            <button



                                className={



                                    selectedRisk ===



                                    "HIGH"



                                        ? "selected high-filter"



                                        : ""



                                }



                                onClick={() =>



                                    setSelectedRisk(



                                        "HIGH"



                                    )



                                }



                            >



                                High



                            </button>











                            <button



                                className={



                                    selectedRisk ===



                                    "MEDIUM"



                                        ? "selected medium-filter"



                                        : ""



                                }



                                onClick={() =>



                                    setSelectedRisk(



                                        "MEDIUM"



                                    )



                                }



                            >



                                Medium



                            </button>











                            <button



                                className={



                                    selectedRisk ===



                                    "LOW"



                                        ? "selected low-filter"



                                        : ""



                                }



                                onClick={() =>



                                    setSelectedRisk(



                                        "LOW"



                                    )



                                }



                            >



                                Low



                            </button>











                        </div>











                    </div>











                    {/* TABLE */}







                    <div className="student-table-wrap">











                        <table className="student-table">











                            <thead>







                                <tr>







                                    <th>



                                        STUDENT



                                    </th>







                                    <th>



                                        BRANCH



                                    </th>







                                    <th>



                                        SEM



                                    </th>







                                    <th>



                                        CGPA



                                    </th>







                                    <th>



                                        ATTENDANCE



                                    </th>







                                    <th>



                                        BACKLOGS



                                    </th>







                                    <th>



                                        AI RISK



                                    </th>







                                </tr>







                            </thead>











                            <tbody>











                                {filteredStudents



                                    .slice(0, 10)



                                    .map(



                                        (



                                            student



                                        ) => (







                                            <tr



                                                key={



                                                    student.id



                                                }



                                            >











                                                <td>







                                                    <div className="table-student">







                                                        <div className="table-avatar">







                                                            {student.name



                                                                ?.charAt(



                                                                    0



                                                                )



                                                                .toUpperCase()}







                                                        </div>











                                                        <div>







                                                            <strong>



                                                                {



                                                                    student.name



                                                                }



                                                            </strong>







                                                            <span>



                                                                {



                                                                    student.usn



                                                                }



                                                            </span>







                                                        </div>







                                                    </div>







                                                </td>











                                                <td>



                                                    {



                                                        student.branch



                                                    }



                                                </td>











                                                <td>



                                                    {



                                                        student.semester



                                                    }



                                                </td>











                                                <td>



                                                    {



                                                        student.cgpa ??



                                                        "—"



                                                    }



                                                </td>











                                                <td>







                                                    <span



                                                        className={



                                                            Number(



                                                                student.attendance



                                                            ) < 60



                                                                ? "attendance-low"



                                                                : ""



                                                        }



                                                    >



                                                        {



                                                            student.attendance ??



                                                            "—"



                                                        }



                                                        %



                                                    </span>







                                                </td>











                                                <td>



                                                    {



                                                        student.backlogs ??



                                                        0



                                                    }



                                                </td>











                                                <td>







                                                    <div



                                                        className={



                                                            student.risk_level ===



                                                            "HIGH"



                                                                ? "risk-pill high-pill"



                                                                : student.risk_level ===



                                                                  "MEDIUM"



                                                                ? "risk-pill medium-pill"



                                                                : "risk-pill low-pill"



                                                        }



                                                    >







                                                        {



                                                            student.risk_percentage



                                                        }%







                                                        <span>



                                                            {



                                                                student.risk_level



                                                            }



                                                        </span>







                                                    </div>







                                                </td>











                                            </tr>







                                        )



                                    )}











                                {filteredStudents.length ===



                                    0 && (







                                    <tr>







                                        <td



                                            colSpan="7"



                                            className="no-results"



                                        >







                                            No students found.







                                        </td>







                                    </tr>







                                )}











                            </tbody>











                        </table>











                    </div>











                    <div className="table-footer">







                        Showing{" "}



                        <strong>



                            {Math.min(



                                filteredStudents.length,



                                10



                            )}



                        </strong>{" "}



                        of{" "}



                        <strong>



                            {filteredStudents.length}



                        </strong>{" "}



                        matching students







                    </div>











                </section>











                {/* =================================================



                    FOOTER



                ================================================= */}







                <footer className="unique-footer">







                    <span>



                        DropoutAI



                    </span>







                    <span>



                        •



                    </span>







                    AI Student Dropout



                    Prediction & Counseling System







                    <span>



                        •



                    </span>







                    Command Center







                </footer>











            </main>







        </div>







    );







}











export default AdminDashboard;