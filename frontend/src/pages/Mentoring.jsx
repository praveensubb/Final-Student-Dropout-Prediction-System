import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";



const API_URL = "http://127.0.0.1:8000";



function Mentoring() {

    const navigate = useNavigate();



    const mentorId = localStorage.getItem("mentorId");



    const [students, setStudents] = useState([]);

    const [mentor, setMentor] = useState(null);

    const [selectedStudent, setSelectedStudent] = useState(null);



    const [notes, setNotes] = useState([]);

    const [activities, setActivities] = useState([]);

    const [followups, setFollowups] = useState([]);

    const [interventions, setInterventions] = useState([]);

    const [interventionType, setInterventionType] =
        useState("Academic Support");

    const [interventionPriority, setInterventionPriority] =
        useState("Medium");

    const [interventionDescription, setInterventionDescription] =
        useState("");

    const [interventionTargetDate, setInterventionTargetDate] =
        useState("");

    const [interventionOutcome, setInterventionOutcome] =
        useState("");

    const [interventionStatus, setInterventionStatus] =
        useState("Planned");



    const [mentoringSummary, setMentoringSummary] = useState({
        totalStudents: 0,
        highRisk: 0,
        pendingFollowups: 0,
        mentoringActivities: 0
    });

    const [noteText, setNoteText] = useState("");



    const [activityType, setActivityType] =

        useState("Counselling");



    const [activityDescription, setActivityDescription] =

        useState("");



    const [followupDate, setFollowupDate] =

        useState("");



    const [followupPurpose, setFollowupPurpose] =

        useState("");



    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);



    const [message, setMessage] = useState("");

    const [error, setError] = useState("");





    // =====================================================

    // LOAD ASSIGNED STUDENTS

    // =====================================================



    const loadStudents = async () => {

        try {

            setLoading(true);

            setError("");



            if (!mentorId) {

                throw new Error(

                    "Mentor session not found. Please login again."

                );

            }



            const response = await fetch(

                `${API_URL}/mentor/mentoring/students?mentor_id=${mentorId}`

            );



            const data = await response.json();



            if (!response.ok) {

                throw new Error(

                    data.detail ||

                    "Unable to load assigned students."

                );

            }



            const studentList = data.students || [];

            setMentor(data.mentor || null);
            setStudents(studentList);

            await loadMentoringSummary(studentList);



        } catch (err) {

            console.error(

                "Mentoring student load error:",

                err

            );



            setError(

                err.message ||

                "Unable to load assigned students."

            );

        } finally {

            setLoading(false);

        }

    };





    // =====================================================
// LOAD MENTORING SUMMARY
// =====================================================

    const loadMentoringSummary = async (studentList) => {
        try {
            if (!mentorId) {
                return;
            }

            if (!studentList.length) {
                setMentoringSummary({
                    totalStudents: 0,
                    highRisk: 0,
                    pendingFollowups: 0,
                    mentoringActivities: 0
                });
                return;
            }

            const highRisk = studentList.filter(
                (student) => student.risk_status === "High Risk"
            ).length;

            const studentData = await Promise.all(
                studentList.map(async (student) => {
                    try {
                        const [
                            activitiesResponse,
                            followupsResponse
                        ] = await Promise.all([
                            fetch(
                                `${API_URL}/mentor/mentoring/activities/${student.id}?mentor_id=${mentorId}`
                            ),
                            fetch(
                                `${API_URL}/mentor/mentoring/followups/${student.id}?mentor_id=${mentorId}`
                            )
                        ]);

                        const activitiesData =
                            await activitiesResponse.json();

                        const followupsData =
                            await followupsResponse.json();

                        return {
                            activities:
                                activitiesResponse.ok &&
                                Array.isArray(activitiesData)
                                    ? activitiesData
                                    : [],
                            followups:
                                followupsResponse.ok &&
                                Array.isArray(followupsData)
                                    ? followupsData
                                    : []
                        };
                    } catch (error) {
                        console.error(
                            `Summary load failed for student ${student.id}:`,
                            error
                        );

                        return {
                            activities: [],
                            followups: []
                        };
                    }
                })
            );

            let pendingFollowups = 0;
            let mentoringActivities = 0;

            studentData.forEach((data) => {
                mentoringActivities += data.activities.length;

                pendingFollowups += data.followups.filter(
                    (followup) => followup.status === "Pending"
                ).length;
            });

            setMentoringSummary({
                totalStudents: studentList.length,
                highRisk,
                pendingFollowups,
                mentoringActivities
            });
        } catch (error) {
            console.error("Mentoring summary error:", error);
        }
    };


// =====================================================

    // LOAD STUDENT MENTORING DATA

    // =====================================================



    const loadStudentData = async (studentId) => {

        try {

            setError("");



            const [

                notesResponse,

                activitiesResponse,

                followupsResponse,

                interventionsResponse

            ] = await Promise.all([



                fetch(

                    `${API_URL}/mentor/mentoring/notes/${studentId}?mentor_id=${mentorId}`

                ),



                fetch(

                    `${API_URL}/mentor/mentoring/activities/${studentId}?mentor_id=${mentorId}`

                ),



                fetch(

                    `${API_URL}/mentor/mentoring/followups/${studentId}?mentor_id=${mentorId}`

                ),

                fetch(

                    `${API_URL}/mentor/interventions/${studentId}?mentor_id=${mentorId}`

                )

            ]);





            const notesData =

                await notesResponse.json();



            const activitiesData =

                await activitiesResponse.json();



            const followupsData =

                await followupsResponse.json();

            const interventionsData =

                await interventionsResponse.json();





            if (!notesResponse.ok) {

                throw new Error(

                    notesData.detail ||

                    "Unable to load mentor notes."

                );

            }



            if (!activitiesResponse.ok) {

                throw new Error(

                    activitiesData.detail ||

                    "Unable to load activities."

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





            setNotes(

                Array.isArray(notesData)

                    ? notesData

                    : []

            );



            setActivities(

                Array.isArray(activitiesData)

                    ? activitiesData

                    : []

            );



            setFollowups(

                Array.isArray(followupsData)

                    ? followupsData

                    : []

            );

            setInterventions(

                Array.isArray(interventionsData)

                    ? interventionsData

                    : []

            );



        } catch (err) {

            console.error(

                "Student mentoring data error:",

                err

            );



            setError(

                err.message ||

                "Unable to load mentoring information."

            );



            setNotes([]);

            setActivities([]);

            setFollowups([]);

            setInterventions([]);

        }

    };





    // =====================================================

    // INITIAL LOAD

    // =====================================================



    useEffect(() => {

        loadStudents();

    }, []);





    // =====================================================

    // SELECT STUDENT

    // =====================================================



    const selectStudent = async (student) => {



        setSelectedStudent(student);



        setMessage("");

        setError("");



        setNoteText("");

        setActivityDescription("");

        setFollowupDate("");

        setFollowupPurpose("");

        setInterventionType("Academic Support");

        setInterventionPriority("Medium");

        setInterventionDescription("");

        setInterventionTargetDate("");

        setInterventionOutcome("");

        setInterventionStatus("Planned");



        await loadStudentData(student.id);

    };





    // =====================================================

    // ADD NOTE

    // =====================================================



    const addNote = async () => {



        if (!selectedStudent) {

            setError("Please select a student first.");

            return;

        }



        if (!noteText.trim()) {

            setError("Please enter a mentor note.");

            return;

        }



        try {



            setSaving(true);

            setError("");

            setMessage("");



            const response = await fetch(

                `${API_URL}/mentor/mentoring/notes?mentor_id=${mentorId}&student_id=${selectedStudent.id}&note=${encodeURIComponent(noteText)}`,

                {

                    method: "POST"

                }

            );



            const data = await response.json();



            if (!response.ok) {

                throw new Error(

                    data.detail ||

                    "Unable to save note."

                );

            }



            setMessage(

                "Mentor note added successfully."

            );



            setNoteText("");



            await loadStudentData(

                selectedStudent.id

            );



        } catch (err) {



            setError(

                err.message ||

                "Unable to save note."

            );



        } finally {

            setSaving(false);

        }

    };





    // =====================================================

    // ADD ACTIVITY

    // =====================================================



    const addActivity = async () => {



        if (!selectedStudent) {

            setError("Please select a student first.");

            return;

        }



        if (!activityDescription.trim()) {

            setError(

                "Please enter the activity description."

            );

            return;

        }



        try {



            setSaving(true);

            setError("");

            setMessage("");



            const response = await fetch(

                `${API_URL}/mentor/mentoring/activities?mentor_id=${mentorId}&student_id=${selectedStudent.id}&activity_type=${encodeURIComponent(activityType)}&description=${encodeURIComponent(activityDescription)}`,

                {

                    method: "POST"

                }

            );



            const data = await response.json();



            if (!response.ok) {

                throw new Error(

                    data.detail ||

                    "Unable to record activity."

                );

            }



            setMessage(

                "Mentoring activity recorded successfully."

            );



            setActivityDescription("");



            await loadStudentData(

                selectedStudent.id

            );



        } catch (err) {



            setError(

                err.message ||

                "Unable to record activity."

            );



        } finally {

            setSaving(false);

        }

    };





    // =====================================================

    // CREATE FOLLOW-UP

    // =====================================================



    const createFollowup = async () => {



        if (!selectedStudent) {

            setError("Please select a student first.");

            return;

        }



        if (!followupDate) {

            setError(

                "Please select a follow-up date."

            );

            return;

        }



        try {



            setSaving(true);

            setError("");

            setMessage("");



            const formattedDate =

                followupDate.length === 16

                    ? `${followupDate}:00`

                    : followupDate;



            const response = await fetch(

                `${API_URL}/mentor/mentoring/followups?mentor_id=${mentorId}&student_id=${selectedStudent.id}&follow_up_date=${encodeURIComponent(formattedDate)}&purpose=${encodeURIComponent(followupPurpose)}`,

                {

                    method: "POST"

                }

            );



            const data = await response.json();



            if (!response.ok) {

                throw new Error(

                    data.detail ||

                    "Unable to schedule follow-up."

                );

            }



            setMessage(

                "Follow-up scheduled successfully."

            );



            setFollowupDate("");

            setFollowupPurpose("");



            await loadStudentData(

                selectedStudent.id

            );



        } catch (err) {



            setError(

                err.message ||

                "Unable to schedule follow-up."

            );



        } finally {

            setSaving(false);

        }

    };





    // =====================================================

    // CREATE INTERVENTION

    // =====================================================



    const createIntervention = async () => {

        if (!selectedStudent) {

            setError("Please select a student first.");

            return;

        }

        if (!interventionDescription.trim()) {

            setError("Please enter the intervention description.");

            return;

        }

        try {

            setSaving(true);

            setError("");

            setMessage("");

            const response = await fetch(

                `${API_URL}/mentor/interventions?mentor_id=${mentorId}&student_id=${selectedStudent.id}&intervention_type=${encodeURIComponent(interventionType)}&priority=${encodeURIComponent(interventionPriority)}&description=${encodeURIComponent(interventionDescription)}&target_date=${encodeURIComponent(interventionTargetDate)}`,

                {

                    method: "POST"

                }

            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(

                    data.detail ||

                    "Unable to create intervention."

                );

            }

            setMessage(

                "Intervention created successfully."

            );

            setInterventionDescription("");

            setInterventionTargetDate("");

            await loadStudentData(selectedStudent.id);

        } catch (err) {

            setError(

                err.message ||

                "Unable to create intervention."

            );

        } finally {

            setSaving(false);

        }

    };



    // =====================================================

    // UPDATE INTERVENTION STATUS

    // =====================================================



    const updateInterventionStatus = async (

        interventionId,

        status,

        outcome = ""

    ) => {

        try {

            setSaving(true);

            setError("");

            setMessage("");

            const response = await fetch(

                `${API_URL}/mentor/interventions/${interventionId}?mentor_id=${mentorId}&status=${encodeURIComponent(status)}&outcome=${encodeURIComponent(outcome)}`,

                {

                    method: "PUT"

                }

            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(

                    data.detail ||

                    "Unable to update intervention."

                );

            }

            setMessage(

                `Intervention marked as ${status}.`

            );

            await loadStudentData(selectedStudent.id);

        } catch (err) {

            setError(

                err.message ||

                "Unable to update intervention."

            );

        } finally {

            setSaving(false);

        }

    };



    // =====================================================

    // UPDATE INTERVENTION OUTCOME

    // =====================================================



    const saveInterventionOutcome = async (intervention) => {

        const outcome = interventionOutcome.trim();

        if (!outcome) {

            setError("Please enter the intervention outcome.");

            return;

        }

        await updateInterventionStatus(

            intervention.id,

            intervention.status,

            outcome

        );

        setInterventionOutcome("");

    };



    // =====================================================

    // UPDATE FOLLOW-UP STATUS

    // =====================================================



    const updateFollowupStatus = async (

        followupId,

        status

    ) => {



        try {



            setError("");

            setMessage("");



            const response = await fetch(

                `${API_URL}/mentor/mentoring/followups/${followupId}?mentor_id=${mentorId}&status=${encodeURIComponent(status)}`,

                {

                    method: "PUT"

                }

            );



            const data = await response.json();



            if (!response.ok) {

                throw new Error(

                    data.detail ||

                    "Unable to update follow-up."

                );

            }



            setMessage(

                `Follow-up marked as ${status}.`

            );



            await loadStudentData(

                selectedStudent.id

            );



        } catch (err) {



            setError(

                err.message ||

                "Unable to update follow-up."

            );

        }

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

    // RISK STYLE

    // =====================================================



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





    // =====================================================

    // LOADING

    // =====================================================



    if (loading) {



        return (

            <div style={pageStyle}>

                <div style={loadingCard}>

                    Loading mentoring page...

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



                <div style={headerStyle}>



                    <div>



                        <div style={eyebrowStyle}>

                            MENTOR PORTAL

                        </div>



                        <h1 style={titleStyle}>

                            Mentoring

                        </h1>



                        <p style={subtitleStyle}>

                            Manage assigned students,

                            mentoring activities,

                            notes and follow-ups.

                        </p>



                    </div>





                    <div style={headerActions}>



                        <div style={mentorBox}>



                            <strong>

                                {mentor?.name || "Mentor"}

                            </strong>



                            <span>

                                {mentor?.department || "Mentor"}

                            </span>



                        </div>





                        <button

                            onClick={() =>

                                navigate(

                                    "/mentor-dashboard"

                                )

                            }

                            style={dashboardButton}

                        >

                            Dashboard

                        </button>





                        <button

                            onClick={() =>

                                navigate(

                                    "/mentor/student-monitoring"

                                )

                            }

                            style={monitorButton}

                        >

                            Student Monitoring

                        </button>





                        <button

                            onClick={logout}

                            style={logoutButton}

                        >

                            Logout

                        </button>



                    </div>



                </div>





                {/* MESSAGE */}



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





                                {/* =====================================================
                    MENTORING SUMMARY
                ===================================================== */}

                <div style={summaryGrid}>

                    <SummaryCard
                        title="Total Assigned"
                        value={mentoringSummary.totalStudents}
                        icon="👨‍🎓"
                        description="Students under your mentoring"
                        iconBackground="#ede9fe"
                        iconColor="#7c3aed"
                    />

                    <SummaryCard
                        title="High Risk"
                        value={mentoringSummary.highRisk}
                        icon="🔴"
                        description="Students needing attention"
                        iconBackground="#fee2e2"
                        iconColor="#dc2626"
                    />

                    <SummaryCard
                        title="Pending Follow-ups"
                        value={mentoringSummary.pendingFollowups}
                        icon="📅"
                        description="Follow-ups requiring action"
                        iconBackground="#fef3c7"
                        iconColor="#d97706"
                    />

                    <SummaryCard
                        title="Mentoring Activities"
                        value={mentoringSummary.mentoringActivities}
                        icon="📋"
                        description="Activities recorded"
                        iconBackground="#dcfce7"
                        iconColor="#16a34a"
                    />

                </div>


{/* MAIN GRID */}



                <div style={mainGrid}>



                    {/* STUDENT LIST */}



                    <div style={studentListCard}>



                        <div style={cardHeader}>



                            <div>



                                <h2 style={cardTitle}>

                                    Assigned Students

                                </h2>



                                <p style={cardSubtitle}>

                                    {students.length} students

                                    assigned to you

                                </p>



                            </div>



                            <button

                                onClick={loadStudents}

                                style={refreshButton}

                            >

                                ↻

                            </button>



                        </div>





                        <div style={studentList}>



                            {students.length === 0 ? (



                                <div style={emptyStyle}>

                                    No students assigned.

                                </div>



                            ) : (



                                students.map((student) => (



                                    <button

                                        key={student.id}

                                        onClick={() =>

                                            selectStudent(student)

                                        }

                                        style={{

                                            ...studentItemStyle,

                                            ...(selectedStudent?.id === student.id

                                                ? selectedStudentStyle

                                                : {})

                                        }}

                                    >



                                        <div style={studentAvatar}>

                                            {student.name

                                                ?.charAt(0)

                                                ?.toUpperCase()}

                                        </div>





                                        <div

                                            style={{

                                                flex: 1,

                                                textAlign: "left"

                                            }}

                                        >



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

                                                    marginTop: "3px"

                                                }}

                                            >

                                                {student.usn}

                                            </div>



                                        </div>





                                        <span

                                            style={{

                                                ...riskBadge,

                                                ...getRiskStyle(

                                                    student.risk_status

                                                )

                                            }}

                                        >

                                            {student.risk_status}

                                        </span>



                                    </button>



                                ))



                            )}



                        </div>



                    </div>





                    {/* RIGHT SIDE */}



                    <div>



                        {!selectedStudent ? (



                            <div style={welcomeCard}>



                                <div style={welcomeIcon}>

                                    👨‍🏫

                                </div>



                                <h2>

                                    Select a Student

                                </h2>



                                <p>

                                    Choose an assigned student

                                    from the left to begin

                                    mentoring.

                                </p>



                            </div>



                        ) : (



                            <>



                                {/* STUDENT PROFILE */}



                                <div style={studentProfileCard}>



                                    <div

                                        style={{

                                            display: "flex",

                                            alignItems: "center",

                                            gap: "18px"

                                        }}

                                    >



                                        <div style={largeAvatar}>

                                            {selectedStudent.name

                                                ?.charAt(0)

                                                ?.toUpperCase()}

                                        </div>



                                        <div>



                                            <h2

                                                style={{

                                                    margin: 0,

                                                    color: "#0f172a"

                                                }}

                                            >

                                                {selectedStudent.name}

                                            </h2>



                                            <p

                                                style={{

                                                    margin:

                                                        "5px 0 0",

                                                    color: "#64748b"

                                                }}

                                            >

                                                {selectedStudent.usn}

                                                {" • "}

                                                {selectedStudent.branch}

                                            </p>



                                        </div>



                                        <span

                                            style={{

                                                marginLeft: "auto",

                                                ...largeRiskBadge,

                                                ...getRiskStyle(

                                                    selectedStudent.risk_status

                                                )

                                            }}

                                        >

                                            {selectedStudent.risk_status}

                                        </span>



                                    </div>





                                    <div style={statsGrid}>



                                        <Stat

                                            label="CGPA"

                                            value={

                                                selectedStudent.cgpa !== null

                                                    ? Number(

                                                        selectedStudent.cgpa

                                                    ).toFixed(2)

                                                    : "-"

                                            }

                                        />



                                        <Stat

                                            label="Attendance"

                                            value={

                                                selectedStudent.attendance !== null

                                                    ? `${Number(

                                                        selectedStudent.attendance

                                                    ).toFixed(2)}%`

                                                    : "-"

                                            }

                                        />



                                        <Stat

                                            label="Backlogs"

                                            value={

                                                selectedStudent.backlogs ??

                                                0

                                            }

                                        />



                                        <Stat

                                            label="Semester"

                                            value={

                                                selectedStudent.semester ||

                                                "-"

                                            }

                                        />

                        <Stat
                            label="Last Mentoring"
                            value={
                                activities.length > 0
                                    ? formatDate(
                                        getLatestActivity(activities)?.activity_date
                                    )
                                    : "No session"
                            }
                        />

                        <Stat
                            label="Next Follow-up"
                            value={
                                followups.some(
                                    (followup) => followup.status === "Pending"
                                )
                                    ? formatDate(
                                        getNextPendingFollowup(followups)?.follow_up_date
                                    )
                                    : "Not scheduled"
                            }
                        />

                        <Stat
                            label="Intervention"
                            value={
                                interventions.some(
                                    (intervention) =>
                                        intervention.status === "In Progress"
                                )
                                    ? "Active"
                                    : interventions.some(
                                        (intervention) =>
                                            intervention.status === "Planned"
                                    )
                                        ? "Planned"
                                        : "None"
                            }
                        />



                                    </div>



                                </div>





                                {/* ACTION GRID */}



                                <div style={actionGrid}>



                                    {/* NOTE */}



                                    <div style={actionCard}>



                                        <div style={actionHeader}>

                                            📝

                                            <span>

                                                Mentor Note

                                            </span>

                                        </div>



                                        <textarea

                                            value={noteText}

                                            onChange={(e) =>

                                                setNoteText(

                                                    e.target.value

                                                )

                                            }

                                            placeholder="Write your observation, concern, guidance or student progress note..."

                                            style={textareaStyle}

                                            rows={5}

                                        />



                                        <button

                                            onClick={addNote}

                                            disabled={saving}

                                            style={primaryButton}

                                        >

                                            {saving

                                                ? "Saving..."

                                                : "Add Note"}

                                        </button>



                                    </div>





                                    {/* ACTIVITY */}



                                    <div style={actionCard}>



                                        <div style={actionHeader}>

                                            📋

                                            <span>

                                                Mentoring Activity

                                            </span>

                                        </div>



                                        <select

                                            value={activityType}

                                            onChange={(e) =>

                                                setActivityType(

                                                    e.target.value

                                                )

                                            }

                                            style={inputStyle}

                                        >

                                            <option>

                                                Counselling

                                            </option>



                                            <option>

                                                Academic Discussion

                                            </option>



                                            <option>

                                                Performance Review

                                            </option>



                                            <option>

                                                Attendance Discussion

                                            </option>



                                            <option>

                                                Career Guidance

                                            </option>



                                            <option>

                                                Personal Support

                                            </option>



                                            <option>

                                                Parent Discussion

                                            </option>



                                            <option>

                                                Other

                                            </option>

                                        </select>



                                        <textarea

                                            value={

                                                activityDescription

                                            }

                                            onChange={(e) =>

                                                setActivityDescription(

                                                    e.target.value

                                                )

                                            }

                                            placeholder="Describe what was discussed or done..."

                                            style={textareaStyle}

                                            rows={4}

                                        />



                                        <button

                                            onClick={

                                                addActivity

                                            }

                                            disabled={saving}

                                            style={primaryButton}

                                        >

                                            {saving

                                                ? "Saving..."

                                                : "Record Activity"}

                                        </button>



                                    </div>





                                    {/* FOLLOW-UP */}



                                    <div style={actionCard}>



                                        <div style={actionHeader}>

                                            📅

                                            <span>

                                                Schedule Follow-up

                                            </span>

                                        </div>



                                        <input

                                            type="datetime-local"

                                            value={

                                                followupDate

                                            }

                                            onChange={(e) =>

                                                setFollowupDate(

                                                    e.target.value

                                                )

                                            }

                                            style={inputStyle}

                                        />



                                        <textarea

                                            value={

                                                followupPurpose

                                            }

                                            onChange={(e) =>

                                                setFollowupPurpose(

                                                    e.target.value

                                                )

                                            }

                                            placeholder="Purpose of follow-up..."

                                            style={textareaStyle}

                                            rows={4}

                                        />



                                        <button

                                            onClick={

                                                createFollowup

                                            }

                                            disabled={saving}

                                            style={primaryButton}

                                        >

                                            {saving

                                                ? "Saving..."

                                                : "Schedule Follow-up"}

                                        </button>



                                    </div>



                                </div>


                                {/* INTERVENTION */}

                                <div style={actionCard}>

                                    <div style={actionHeader}>

                                        🛠️

                                        <span>
                                            Intervention Tracking
                                        </span>

                                    </div>

                                    <select
                                        value={interventionType}
                                        onChange={(e) =>
                                            setInterventionType(
                                                e.target.value
                                            )
                                        }
                                        style={inputStyle}
                                    >
                                        <option>
                                            Academic Support
                                        </option>

                                        <option>
                                            Attendance Support
                                        </option>

                                        <option>
                                            Counselling
                                        </option>

                                        <option>
                                            Career Guidance
                                        </option>

                                        <option>
                                            Parent Meeting
                                        </option>

                                        <option>
                                            Financial Support
                                        </option>

                                        <option>
                                            Personal Support
                                        </option>

                                        <option>
                                            Other
                                        </option>
                                    </select>

                                    <select
                                        value={interventionPriority}
                                        onChange={(e) =>
                                            setInterventionPriority(
                                                e.target.value
                                            )
                                        }
                                        style={inputStyle}
                                    >
                                        <option value="Low">
                                            Low Priority
                                        </option>

                                        <option value="Medium">
                                            Medium Priority
                                        </option>

                                        <option value="High">
                                            High Priority
                                        </option>
                                    </select>

                                    <input
                                        type="date"
                                        value={interventionTargetDate}
                                        onChange={(e) =>
                                            setInterventionTargetDate(
                                                e.target.value
                                            )
                                        }
                                        style={inputStyle}
                                    />

                                    <textarea
                                        value={interventionDescription}
                                        onChange={(e) =>
                                            setInterventionDescription(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Describe the intervention plan..."
                                        style={textareaStyle}
                                        rows={4}
                                    />

                                    <button
                                        onClick={createIntervention}
                                        disabled={saving}
                                        style={primaryButton}
                                    >
                                        {saving
                                            ? "Saving..."
                                            : "Create Intervention"}
                                    </button>

                                </div>





                                {/* HISTORY */}



                                <div style={historyGrid}>



                                    {/* NOTES HISTORY */}



                                    <HistoryCard

                                        title="Previous Notes"

                                        icon="📝"

                                        count={notes.length}

                                    >



                                        {notes.length === 0 ? (



                                            <EmptyHistory

                                                text="No mentor notes yet."

                                            />



                                        ) : (



                                            notes.map((note) => (



                                                <div

                                                    key={note.id}

                                                    style={historyItem}

                                                >



                                                    <div

                                                        style={

                                                            historyDate

                                                        }

                                                    >

                                                        {formatDate(

                                                            note.created_at

                                                        )}

                                                    </div>



                                                    <div

                                                        style={

                                                            historyText

                                                        }

                                                    >

                                                        {note.note}

                                                    </div>



                                                </div>



                                            ))



                                        )}



                                    </HistoryCard>





                                    {/* ACTIVITY HISTORY */}



                                    <HistoryCard

                                        title="Mentoring Activities"

                                        icon="📋"

                                        count={

                                            activities.length

                                        }

                                    >



                                        {activities.length === 0 ? (



                                            <EmptyHistory

                                                text="No activities recorded yet."

                                            />



                                        ) : (



                                            activities.map(

                                                (activity) => (



                                                    <div

                                                        key={

                                                            activity.id

                                                        }

                                                        style={

                                                            historyItem

                                                        }

                                                    >



                                                        <div

                                                            style={

                                                                historyTop

                                                            }

                                                        >



                                                            <strong>

                                                                {

                                                                    activity.activity_type

                                                                }

                                                            </strong>



                                                            <span

                                                                style={

                                                                    historyDate

                                                                }

                                                            >

                                                                {formatDate(

                                                                    activity.activity_date

                                                                )}

                                                            </span>



                                                        </div>



                                                        <div

                                                            style={

                                                                historyText

                                                            }

                                                        >

                                                            {

                                                                activity.description

                                                            }

                                                        </div>



                                                    </div>



                                                )

                                            )



                                        )}



                                    </HistoryCard>





                                    {/* FOLLOW-UP HISTORY */}



                                    <HistoryCard

                                        title="Follow-ups"

                                        icon="📅"

                                        count={

                                            followups.length

                                        }

                                    >



                                        {followups.length === 0 ? (



                                            <EmptyHistory

                                                text="No follow-ups scheduled."

                                            />



                                        ) : (



                                            followups.map(

                                                (followup) => (



                                                    <div

                                                        key={

                                                            followup.id

                                                        }

                                                        style={

                                                            historyItem

                                                        }

                                                    >



                                                        <div

                                                            style={

                                                                historyTop

                                                            }

                                                        >



                                                            <strong>

                                                                {formatDate(

                                                                    followup.follow_up_date

                                                                )}

                                                            </strong>



                                                            <span

                                                                style={{

                                                                    ...statusBadge,

                                                                    background:

                                                                        followup.status ===

                                                                        "Completed"

                                                                            ? "#dcfce7"

                                                                            : followup.status ===

                                                                              "Cancelled"

                                                                                ? "#fee2e2"

                                                                                : "#fef3c7",

                                                                    color:

                                                                        followup.status ===

                                                                        "Completed"

                                                                            ? "#166534"

                                                                            : followup.status ===

                                                                              "Cancelled"

                                                                                ? "#b91c1c"

                                                                                : "#92400e"

                                                                }}

                                                            >

                                                                {

                                                                    followup.status

                                                                }

                                                            </span>



                                                        </div>



                                                        <div

                                                            style={

                                                                historyText

                                                            }

                                                        >

                                                            {

                                                                followup.purpose ||

                                                                "No purpose specified."

                                                            }

                                                        </div>





                                                        {followup.status ===

                                                            "Pending" && (



                                                            <div

                                                                style={{

                                                                    display:

                                                                        "flex",

                                                                    gap:

                                                                        "8px",

                                                                    marginTop:

                                                                        "12px"

                                                                }}

                                                            >



                                                                <button

                                                                    onClick={() =>

                                                                        updateFollowupStatus(

                                                                            followup.id,

                                                                            "Completed"

                                                                        )

                                                                    }

                                                                    style={

                                                                        completeButton

                                                                    }

                                                                >

                                                                    ✓ Complete

                                                                </button>



                                                                <button

                                                                    onClick={() =>

                                                                        updateFollowupStatus(

                                                                            followup.id,

                                                                            "Cancelled"

                                                                        )

                                                                    }

                                                                    style={

                                                                        cancelButton

                                                                    }

                                                                >

                                                                    Cancel

                                                                </button>



                                                            </div>



                                                        )}



                                                    </div>



                                                )

                                            )



                                        )}



                                    </HistoryCard>


                                    {/* INTERVENTION HISTORY */}

                                    <HistoryCard
                                        title="Interventions"
                                        icon="🛠️"
                                        count={interventions.length}
                                    >

                                        {interventions.length === 0 ? (

                                            <EmptyHistory
                                                text="No interventions created yet."
                                            />

                                        ) : (

                                            interventions.map(
                                                (intervention) => (

                                                    <div
                                                        key={intervention.id}
                                                        style={historyItem}
                                                    >

                                                        <div
                                                            style={historyTop}
                                                        >

                                                            <strong>
                                                                {
                                                                    intervention.intervention_type
                                                                }
                                                            </strong>

                                                            <span
                                                                style={{
                                                                    ...statusBadge,
                                                                    background:
                                                                        intervention.status === "Completed"
                                                                            ? "#dcfce7"
                                                                            : intervention.status === "Cancelled"
                                                                                ? "#fee2e2"
                                                                                : intervention.status === "In Progress"
                                                                                    ? "#dbeafe"
                                                                                    : "#fef3c7",
                                                                    color:
                                                                        intervention.status === "Completed"
                                                                            ? "#166534"
                                                                            : intervention.status === "Cancelled"
                                                                                ? "#b91c1c"
                                                                                : intervention.status === "In Progress"
                                                                                    ? "#1d4ed8"
                                                                                    : "#92400e"
                                                                }}
                                                            >
                                                                {
                                                                    intervention.status
                                                                }
                                                            </span>

                                                        </div>

                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                gap: "8px",
                                                                flexWrap: "wrap",
                                                                marginTop: "8px"
                                                            }}
                                                        >

                                                            <span
                                                                style={{
                                                                    ...smallBadge,
                                                                    background:
                                                                        intervention.priority === "High"
                                                                            ? "#fee2e2"
                                                                            : intervention.priority === "Low"
                                                                                ? "#dcfce7"
                                                                                : "#fef3c7",
                                                                    color:
                                                                        intervention.priority === "High"
                                                                            ? "#b91c1c"
                                                                            : intervention.priority === "Low"
                                                                                ? "#166534"
                                                                                : "#92400e"
                                                                }}
                                                            >
                                                                {intervention.priority} Priority
                                                            </span>

                                                            {intervention.target_date && (
                                                                <span style={smallBadge}>
                                                                    Target: {formatDateOnly(
                                                                        intervention.target_date
                                                                    )}
                                                                </span>
                                                            )}

                                                        </div>

                                                        <div
                                                            style={{
                                                                ...historyText,
                                                                marginTop: "10px"
                                                            }}
                                                        >
                                                            {
                                                                intervention.description
                                                            }
                                                        </div>

                                                        {intervention.outcome && (

                                                            <div
                                                                style={{
                                                                    marginTop: "9px",
                                                                    padding: "9px 10px",
                                                                    borderRadius: "9px",
                                                                    background: "#f8fafc",
                                                                    color: "#475569",
                                                                    fontSize: "13px"
                                                                }}
                                                            >
                                                                <strong>
                                                                    Outcome:
                                                                </strong>{" "}
                                                                {
                                                                    intervention.outcome
                                                                }
                                                            </div>

                                                        )}

                                                        {intervention.status !== "Completed" &&
                                                            intervention.status !== "Cancelled" && (

                                                            <div
                                                                style={{
                                                                    marginTop: "12px",
                                                                    display: "grid",
                                                                    gap: "8px"
                                                                }}
                                                            >

                                                                <select
                                                                    value={
                                                                        interventionStatus
                                                                    }
                                                                    onChange={(e) =>
                                                                        setInterventionStatus(
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    style={inputStyle}
                                                                >
                                                                    <option value="Planned">
                                                                        Planned
                                                                    </option>

                                                                    <option value="In Progress">
                                                                        In Progress
                                                                    </option>

                                                                    <option value="Completed">
                                                                        Completed
                                                                    </option>

                                                                    <option value="Cancelled">
                                                                        Cancelled
                                                                    </option>
                                                                </select>

                                                                <textarea
                                                                    value={interventionOutcome}
                                                                    onChange={(e) =>
                                                                        setInterventionOutcome(
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    placeholder="Enter intervention outcome..."
                                                                    style={{
                                                                        ...textareaStyle,
                                                                        marginBottom: 0
                                                                    }}
                                                                    rows={3}
                                                                />

                                                                <div
                                                                    style={{
                                                                        display: "flex",
                                                                        gap: "8px"
                                                                    }}
                                                                >

                                                                    <button
                                                                        onClick={() =>
                                                                            updateInterventionStatus(
                                                                                intervention.id,
                                                                                interventionStatus,
                                                                                interventionOutcome
                                                                            )
                                                                        }
                                                                        disabled={saving}
                                                                        style={completeButton}
                                                                    >
                                                                        Update
                                                                    </button>

                                                                    <button
                                                                        onClick={() =>
                                                                            updateInterventionStatus(
                                                                                intervention.id,
                                                                                "Completed",
                                                                                interventionOutcome
                                                                            )
                                                                        }
                                                                        disabled={saving}
                                                                        style={primaryButton}
                                                                    >
                                                                        ✓ Complete
                                                                    </button>

                                                                </div>

                                                            </div>

                                                        )}

                                                    </div>

                                                )
                                            )

                                        )}

                                    </HistoryCard>



                                </div>



                            </>



                        )}



                    </div>



                </div>



            </div>



        </div>

    );

}





// =====================================================

// SMALL COMPONENTS

// =====================================================



function SummaryCard({
    title,
    value,
    icon,
    description,
    iconBackground,
    iconColor
}) {
    return (
        <div style={summaryCardStyle}>
            <div
                style={{
                    ...summaryIconStyle,
                    background: iconBackground,
                    color: iconColor
                }}
            >
                {icon}
            </div>

            <div style={summaryContentStyle}>
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


function Stat({ label, value }) {



    return (

        <div style={statCard}>



            <span style={statLabel}>

                {label}

            </span>



            <strong style={statValue}>

                {value}

            </strong>



        </div>

    );

}





function HistoryCard({

    title,

    icon,

    count,

    children

}) {



    return (

        <div style={historyCard}>



            <div style={historyHeader}>



                <div

                    style={{

                        display: "flex",

                        gap: "8px",

                        alignItems: "center"

                    }}

                >



                    <span>

                        {icon}

                    </span>



                    <strong>

                        {title}

                    </strong>



                </div>



                <span style={countBadge}>

                    {count}

                </span>



            </div>



            <div>

                {children}

            </div>



        </div>

    );

}





function EmptyHistory({ text }) {



    return (

        <div style={emptyHistory}>

            {text}

        </div>

    );

}





// =====================================================

// HELPERS

// =====================================================



function formatDate(dateValue) {



    if (!dateValue) {

        return "-";

    }



    const date = new Date(dateValue);



    if (Number.isNaN(date.getTime())) {

        return String(dateValue);

    }



    return date.toLocaleString();

}


function formatDateOnly(dateValue) {

    if (!dateValue) {
        return "-";
    }

    const date = new Date(`${dateValue}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return String(dateValue);
    }

    return date.toLocaleDateString();
}


function getLatestActivity(activityList) {
    if (!Array.isArray(activityList) || activityList.length === 0) {
        return null;
    }

    return [...activityList].sort(
        (a, b) =>
            new Date(b.activity_date) - new Date(a.activity_date)
    )[0];
}


function getNextPendingFollowup(followupList) {
    if (!Array.isArray(followupList) || followupList.length === 0) {
        return null;
    }

    const pending = followupList
        .filter((followup) => followup.status === "Pending")
        .sort(
            (a, b) =>
                new Date(a.follow_up_date) -
                new Date(b.follow_up_date)
        );

    return pending[0] || null;
}





// =====================================================

// STYLES

// =====================================================



const summaryGrid = {
    display: "grid",
    gridTemplateColumns:
        "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "15px",
    marginBottom: "20px"
};

const summaryCardStyle = {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.05)"
};

const summaryIconStyle = {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
    flexShrink: 0
};

const summaryContentStyle = {
    minWidth: 0
};

const summaryTitleStyle = {
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "3px"
};

const summaryValueStyle = {
    fontSize: "27px",
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: "1.1"
};

const summaryDescriptionStyle = {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "4px"
};


const pageStyle = {

    minHeight: "100vh",

    background: "#f5f7fb",

    padding: "30px",

    fontFamily: "Arial, sans-serif"

};



const containerStyle = {

    maxWidth: "1500px",

    margin: "0 auto"

};



const headerStyle = {

    background: "#ffffff",

    borderRadius: "18px",

    padding: "25px 28px",

    display: "flex",

    justifyContent: "space-between",

    alignItems: "center",

    gap: "20px",

    boxShadow: "0 8px 25px rgba(0,0,0,0.06)",

    marginBottom: "20px"

};



const eyebrowStyle = {

    fontSize: "12px",

    fontWeight: "800",

    color: "#7c3aed",

    letterSpacing: "1px",

    marginBottom: "6px"

};



const titleStyle = {

    margin: 0,

    fontSize: "30px",

    color: "#0f172a"

};



const subtitleStyle = {

    margin: "7px 0 0",

    color: "#64748b"

};



const headerActions = {

    display: "flex",

    alignItems: "center",

    gap: "10px",

    flexWrap: "wrap",

    justifyContent: "flex-end"

};



const mentorBox = {

    display: "flex",

    flexDirection: "column",

    textAlign: "right",

    marginRight: "8px"

};



const dashboardButton = {

    border: "none",

    padding: "10px 14px",

    borderRadius: "10px",

    background: "#e2e8f0",

    color: "#0f172a",

    cursor: "pointer",

    fontWeight: "700"

};



const monitorButton = {

    border: "none",

    padding: "10px 14px",

    borderRadius: "10px",

    background: "#ede9fe",

    color: "#6d28d9",

    cursor: "pointer",

    fontWeight: "700"

};



const logoutButton = {

    border: "none",

    padding: "10px 14px",

    borderRadius: "10px",

    background: "#ef4444",

    color: "#ffffff",

    cursor: "pointer",

    fontWeight: "700"

};



const loadingCard = {

    background: "#ffffff",

    padding: "35px",

    borderRadius: "18px",

    fontWeight: "700",

    boxShadow: "0 8px 25px rgba(0,0,0,0.06)"

};



const successStyle = {

    background: "#dcfce7",

    color: "#166534",

    padding: "13px 18px",

    borderRadius: "12px",

    marginBottom: "15px",

    fontWeight: "600"

};



const errorStyle = {

    background: "#fee2e2",

    color: "#b91c1c",

    padding: "13px 18px",

    borderRadius: "12px",

    marginBottom: "15px",

    fontWeight: "600"

};



const mainGrid = {

    display: "grid",

    gridTemplateColumns: "minmax(300px, 350px) minmax(0, 1fr)",

    gap: "20px",

    alignItems: "start"

};



const studentListCard = {

    background: "#ffffff",

    borderRadius: "18px",

    padding: "20px",

    boxShadow: "0 8px 25px rgba(0,0,0,0.06)"

};



const cardHeader = {

    display: "flex",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: "15px"

};



const cardTitle = {

    margin: 0,

    fontSize: "20px",

    color: "#0f172a"

};



const cardSubtitle = {

    margin: "5px 0 0",

    fontSize: "13px",

    color: "#64748b"

};



const refreshButton = {

    width: "36px",

    height: "36px",

    border: "none",

    borderRadius: "9px",

    background: "#ede9fe",

    color: "#6d28d9",

    cursor: "pointer",

    fontSize: "18px",

    fontWeight: "700"

};



const studentList = {

    display: "flex",

    flexDirection: "column",

    gap: "8px"

};



const studentItemStyle = {

    width: "100%",

    display: "flex",

    alignItems: "center",

    gap: "10px",

    padding: "12px",

    borderRadius: "12px",

    border: "1px solid #e2e8f0",

    background: "#ffffff",

    cursor: "pointer"

};



const selectedStudentStyle = {

    background: "#f5f3ff",

    border: "1px solid #8b5cf6"

};



const studentAvatar = {

    width: "38px",

    height: "38px",

    borderRadius: "50%",

    background: "#ede9fe",

    color: "#6d28d9",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontWeight: "800"

};



const riskBadge = {

    padding: "5px 8px",

    borderRadius: "12px",

    fontSize: "10px",

    fontWeight: "800",

    whiteSpace: "nowrap"

};



const welcomeCard = {

    background: "#ffffff",

    borderRadius: "18px",

    padding: "70px 30px",

    textAlign: "center",

    boxShadow: "0 8px 25px rgba(0,0,0,0.06)"

};



const welcomeIcon = {

    width: "75px",

    height: "75px",

    borderRadius: "20px",

    background: "#ede9fe",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: "38px",

    margin: "0 auto 20px"

};



const studentProfileCard = {

    background: "#ffffff",

    borderRadius: "18px",

    padding: "22px",

    boxShadow: "0 8px 25px rgba(0,0,0,0.06)",

    marginBottom: "18px"

};



const largeAvatar = {

    width: "60px",

    height: "60px",

    borderRadius: "16px",

    background: "#ede9fe",

    color: "#6d28d9",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: "25px",

    fontWeight: "800"

};



const largeRiskBadge = {

    padding: "8px 13px",

    borderRadius: "20px",

    fontSize: "12px",

    fontWeight: "800"

};



const statsGrid = {

    display: "grid",

    gridTemplateColumns:

        "repeat(4, minmax(120px, 1fr))",

    gap: "12px",

    marginTop: "20px"

};



const statCard = {

    background: "#f8fafc",

    borderRadius: "12px",

    padding: "13px"

};



const statLabel = {

    display: "block",

    fontSize: "12px",

    color: "#64748b",

    marginBottom: "5px"

};



const statValue = {

    fontSize: "20px",

    color: "#0f172a"

};



const actionGrid = {

    display: "grid",

    gridTemplateColumns:

        "repeat(auto-fit, minmax(240px, 1fr))",

    gap: "15px",

    marginBottom: "18px"

};



const actionCard = {

    background: "#ffffff",

    borderRadius: "16px",

    padding: "18px",

    boxShadow: "0 8px 25px rgba(0,0,0,0.05)"

};



const actionHeader = {

    display: "flex",

    gap: "8px",

    alignItems: "center",

    fontWeight: "800",

    color: "#0f172a",

    marginBottom: "13px"

};



const textareaStyle = {

    width: "100%",

    boxSizing: "border-box",

    border: "1px solid #cbd5e1",

    borderRadius: "10px",

    padding: "11px",

    fontSize: "14px",

    outline: "none",

    resize: "vertical",

    fontFamily: "Arial, sans-serif",

    marginBottom: "10px"

};



const inputStyle = {

    width: "100%",

    boxSizing: "border-box",

    border: "1px solid #cbd5e1",

    borderRadius: "10px",

    padding: "11px",

    fontSize: "14px",

    outline: "none",

    background: "#ffffff",

    marginBottom: "10px"

};



const primaryButton = {

    width: "100%",

    border: "none",

    borderRadius: "10px",

    padding: "11px",

    background: "#7c3aed",

    color: "#ffffff",

    cursor: "pointer",

    fontWeight: "700"

};



const historyGrid = {

    display: "grid",

    gridTemplateColumns:

        "repeat(auto-fit, minmax(260px, 1fr))",

    gap: "15px"

};



const historyCard = {

    background: "#ffffff",

    borderRadius: "16px",

    padding: "18px",

    boxShadow: "0 8px 25px rgba(0,0,0,0.05)",

    minHeight: "180px"

};



const historyHeader = {

    display: "flex",

    justifyContent: "space-between",

    alignItems: "center",

    paddingBottom: "13px",

    marginBottom: "5px",

    borderBottom: "1px solid #e2e8f0",

    color: "#0f172a"

};



const countBadge = {

    background: "#ede9fe",

    color: "#6d28d9",

    padding: "4px 9px",

    borderRadius: "12px",

    fontSize: "11px",

    fontWeight: "800"

};



const historyItem = {

    padding: "12px 0",

    borderBottom: "1px solid #f1f5f9"

};



const historyTop = {

    display: "flex",

    justifyContent: "space-between",

    gap: "10px",

    alignItems: "center",

    marginBottom: "6px"

};



const historyDate = {

    fontSize: "11px",

    color: "#64748b"

};



const historyText = {

    fontSize: "13px",

    color: "#334155",

    lineHeight: "1.5"

};



const emptyHistory = {

    padding: "25px 5px",

    textAlign: "center",

    color: "#94a3b8",

    fontSize: "13px"

};



const smallBadge = {
    display: "inline-block",
    padding: "5px 8px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
    background: "#f1f5f9",
    color: "#475569"
};


const statusBadge = {

    padding: "5px 9px",

    borderRadius: "12px",

    fontSize: "10px",

    fontWeight: "800"

};



const completeButton = {

    border: "none",

    borderRadius: "8px",

    padding: "7px 10px",

    background: "#dcfce7",

    color: "#166534",

    cursor: "pointer",

    fontSize: "11px",

    fontWeight: "700"

};



const cancelButton = {

    border: "none",

    borderRadius: "8px",

    padding: "7px 10px",

    background: "#fee2e2",

    color: "#b91c1c",

    cursor: "pointer",

    fontSize: "11px",

    fontWeight: "700"

};



const emptyStyle = {

    textAlign: "center",

    padding: "30px 10px",

    color: "#94a3b8",

    fontSize: "14px"

};



export default Mentoring;
