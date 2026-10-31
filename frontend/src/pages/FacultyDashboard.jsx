import React, { useEffect, useState } from "react";



import { useNavigate } from "react-router-dom";



import "./FacultyDashboard.css";



const API_URL = "http://127.0.0.1:8000";



function FacultyDashboard() {



  const navigate = useNavigate();



  // =========================================================



  // STATE



  // =========================================================



  const [students, setStudents] = useState([]);



  const [timetable, setTimetable] = useState([]);



  const [loading, setLoading] = useState(true);



  const [error, setError] = useState("");



  // =========================================================



  // ATTENDANCE STATE



  // =========================================================



  const [selectedTimetable, setSelectedTimetable] = useState("");



  const [attendance, setAttendance] = useState({});



  const [attendanceLoading, setAttendanceLoading] = useState(false);



  const [attendanceMessage, setAttendanceMessage] = useState("");



  const [attendanceError, setAttendanceError] = useState("");

const [attendanceSummary, setAttendanceSummary] = useState({



    total: 0,



    present: 0,



    absent: 0,



    percentage: 0,



  });



  // =========================================================



  // FACULTY LOGIN INFORMATION



  // =========================================================



  const facultyId = localStorage.getItem("facultyId");



  const facultyName = localStorage.getItem("facultyName");



  const facultyEmail = localStorage.getItem("facultyEmail");



  const facultyDepartment =



    localStorage.getItem("facultyDepartment");



  // =========================================================



  // LOAD FACULTY DATA



  // =========================================================



  useEffect(() => {



    if (!facultyId) {



      setError("Faculty login information not found.");



      setLoading(false);



      return;



    }



    loadFacultyData();



  }, [facultyId]);



  // =========================================================



  // LOAD STUDENTS + TIMETABLE



  // =========================================================



  const loadFacultyData = async () => {



    try {



      setLoading(true);



      setError("");



      // -------------------------------------------------------



      // LOAD ONLY ADMIN-ASSIGNED STUDENTS



      // -------------------------------------------------------



      const studentsResponse = await fetch(



        `${API_URL}/faculty/${facultyId}/students`



      );



      if (!studentsResponse.ok) {



        throw new Error(



          "Failed to load assigned students."



        );



      }



      const studentsData = await studentsResponse.json();



      // -------------------------------------------------------



      // LOAD FACULTY TIMETABLE



      // -------------------------------------------------------



      const timetableResponse = await fetch(



        `${API_URL}/faculty/${facultyId}/timetable`



      );



      if (!timetableResponse.ok) {



        throw new Error(



          "Failed to load timetable."



        );



      }



      const timetableData =



        await timetableResponse.json();



      setStudents(



        Array.isArray(studentsData)



          ? studentsData



          : []



      );



      setTimetable(



        Array.isArray(timetableData)



          ? timetableData



          : []



      );



    } catch (err) {



      console.error(



        "Faculty dashboard error:",



        err



      );



      setError(



        err.message ||



          "Unable to load faculty data."



      );



      setStudents([]);



      setTimetable([]);



    } finally {



      setLoading(false);



    }



  };



  // =========================================================



  // LOGOUT



  // =========================================================



  const logout = () => {



    localStorage.removeItem("facultyToken");



    localStorage.removeItem("facultyId");



    localStorage.removeItem("facultyName");



    localStorage.removeItem("facultyEmail");



    localStorage.removeItem("facultyDepartment");



    navigate("/faculty-login");



  };



  // =========================================================



  // ASSIGNED SECTIONS



  // =========================================================



  const assignedSections = [



    ...new Set(



      students



        .map((student) => student.section)



        .filter(Boolean)



    ),



  ];



  // =========================================================



  // VIEW STUDENT DETAILS



  // =========================================================



  const viewStudent = (studentId) => {



    navigate(



      `/faculty/student/${studentId}`



    );



  };



  // =========================================================



  // LAB COUNT



  // =========================================================



  const labCount = timetable.filter(



    (item) => item.class_type === "Lab"



  ).length;



  // =========================================================



  // ATTENDANCE



  // =========================================================



  const handleTimetableChange = async (event) => {



    const timetableId = event.target.value;



    setSelectedTimetable(timetableId);



    setAttendance({});



    setAttendanceMessage("");



    setAttendanceError("");



    setAttendanceSummary({



      total: 0,



      present: 0,



      absent: 0,



      percentage: 0,



    });



    if (!timetableId) {



      return;



    }



    try {



      const response = await fetch(



        `${API_URL}/attendance/faculty/${facultyId}/today?timetable_id=${timetableId}`



      );



      if (!response.ok) {



        return;



      }



      const data = await response.json();



      if (



        data.students &&



        data.students.length > 0



      ) {



        const existingAttendance = {};



        data.students.forEach((student) => {



          existingAttendance[



            student.student_id



          ] = student.status;



        });



        setAttendance(existingAttendance);



        setAttendanceSummary({



          total: data.total_students || 0,



          present: data.present || 0,



          absent: data.absent || 0,



          percentage:



            data.attendance_percentage || 0,



        });



        setAttendanceMessage(



          "Today's attendance is already loaded."



        );



      }



    } catch (err) {



      console.error(



        "Attendance loading error:",



        err



      );



    }



  };



  // =========================================================



  // MARK STUDENT PRESENT / ABSENT



  // =========================================================



  const handleAttendanceChange = (



    studentId,



    status



  ) => {



    setAttendance((previous) => ({



      ...previous,



      [studentId]: status,



    }));



    setAttendanceMessage("");



    setAttendanceError("");



  };



  // =========================================================



  // CALCULATE ATTENDANCE SUMMARY



  // =========================================================



  useEffect(() => {



    let present = 0;



    let absent = 0;



    students.forEach((student) => {



      const status = attendance[student.id];



      if (status === "Present") {



        present++;



      }



      if (status === "Absent") {



        absent++;



      }



    });



    const total = present + absent;



    const percentage =



      total > 0



        ? (present / total) * 100



        : 0;



    setAttendanceSummary({



      total,



      present,



      absent,



      percentage: Number(



        percentage.toFixed(2)



      ),



    });



  }, [attendance, students]);



  // =========================================================



  // SAVE ATTENDANCE



  // =========================================================



  const saveAttendance = async () => {



    setAttendanceMessage("");



    setAttendanceError("");



    if (!selectedTimetable) {



      setAttendanceError(



        "Please select a class or subject first."



      );



      return;



    }



    if (students.length === 0) {



      setAttendanceError(



        "No students are assigned to you."



      );



      return;



    }



    const unmarkedStudents = students.filter(



      (student) =>



        !attendance[student.id]



    );



    if (unmarkedStudents.length > 0) {



      setAttendanceError(



        `Please mark attendance for all students. ${unmarkedStudents.length} student(s) are still unmarked.`



      );



      return;



    }



    setAttendanceLoading(true);



    try {



      const attendanceData =



        students.map((student) => ({



          student_id: student.id,



          status: attendance[student.id],



        }));



      const response = await fetch(



        `${API_URL}/attendance/mark?faculty_id=${facultyId}&timetable_id=${selectedTimetable}`,



        {



          method: "POST",



          headers: {



            "Content-Type":



              "application/json",



          },



          body: JSON.stringify(



            attendanceData



          ),



        }



      );



      const data = await response.json();



      if (!response.ok) {



        throw new Error(



          data.detail ||



            "Failed to save attendance."



        );



      }



      setAttendanceSummary({



        total:



          data.total_students || 0,



        present:



          data.present || 0,



        absent:



          data.absent || 0,



        percentage:



          data.attendance_percentage || 0,



      });



      setAttendanceMessage(



        `Attendance saved successfully. Present: ${data.present}, Absent: ${data.absent}, Attendance: ${data.attendance_percentage}%`



      );



    } catch (err) {



      console.error(



        "Save attendance error:",



        err



      );



      setAttendanceError(



        err.message ||



          "Failed to save attendance."



      );



    } finally {



      setAttendanceLoading(false);



    }



  };



  // =========================================================



  // SELECTED CLASS DETAILS



  // =========================================================



  const selectedClass = timetable.find(



    (item) =>



      String(item.id) ===



      String(selectedTimetable)



  );



  // =========================================================



  // RENDER



  // =========================================================



  return (



    <div className="faculty-dashboard">



      {/* =====================================================



          SIDEBAR



      ====================================================== */}



      <aside className="faculty-sidebar">



        <div className="faculty-logo">



          <h2>🎓 Faculty Portal</h2>



        </div>



        {/* FACULTY PROFILE */}



        <div className="faculty-profile">



          <div className="faculty-avatar">



            {facultyName



              ? facultyName



                  .charAt(0)



                  .toUpperCase()



              : "F"}



          </div>



          <h3>



            {facultyName || "Faculty"}



          </h3>



          <p>



            {facultyDepartment ||



              "Computer Science"}



          </p>



        </div>



        {/* =================================================



            NAVIGATION



        ================================================== */}



        <nav className="faculty-nav">



          <a href="#dashboard">



            🏠 Dashboard



          </a>



          <a
              href="/faculty/students"
              onClick={(event) => {
                event.preventDefault();
                navigate("/faculty/students");
              }}
            >
              👨‍🎓 My Students
            </a>



          <a
              href="/faculty-attendance"
              onClick={(event) => {
                event.preventDefault();
                navigate("/faculty-attendance");
              }}
            >
              📝 Attendance
            </a>



          <a
              href="/faculty-timetable"
              onClick={(event) => {
                event.preventDefault();
                navigate("/faculty-timetable");
              }}
            >
              📅 Timetable
            </a>



        </nav>



        {/* LOGOUT */}



        <button



          className="faculty-logout"



          onClick={logout}



        >



          Logout



        </button>



      </aside>



      {/* =====================================================



          MAIN CONTENT



      ====================================================== */}



      <main className="faculty-main">



        {/* ===================================================



            HEADER



        ==================================================== */}



        <div className="faculty-header">



          <div>



            <h1>



              Welcome,{" "}



              {facultyName || "Faculty"} 👋



            </h1>



            <p>



              {facultyEmail}



            </p>



          </div>



          <button



            className="refresh-btn"



            onClick={() => {



              loadFacultyData();



            }}



          >



            🔄 Refresh



          </button>



        </div>



        {/* ===================================================



            LOADING



        ==================================================== */}



        {loading && (



          <div className="loading-box">



            Loading faculty data...



          </div>



        )}



        {/* ===================================================



            ERROR



        ==================================================== */}



        {error && (



          <div className="error-box">



            ❌ {error}



          </div>



        )}



        {!loading && !error && (



          <>



            {/* =================================================



                STATISTICS



            ================================================== */}



            <section



              className="faculty-stats"



              id="dashboard"



            >



              {/* STUDENTS */}



              <div className="stat-card">



                <div className="stat-icon">



                  👨‍🎓



                </div>



                <div>



                  <h3>



                    {students.length}



                  </h3>



                  <p>



                    My Students



                  </p>



                </div>



              </div>



              {/* SECTIONS */}



              <div className="stat-card">



                <div className="stat-icon">



                  🏫



                </div>



                <div>



                  <h3>



                    {assignedSections.length}



                  </h3>



                  <p>



                    Assigned Sections



                  </p>



                </div>



              </div>



              {/* CLASSES */}



              <div className="stat-card">



                <div className="stat-icon">



                  📚



                </div>



                <div>



                  <h3>



                    {timetable.length}



                  </h3>



                  <p>



                    Total Classes



                  </p>



                </div>



              </div>



              {/* LABS */}



              <div className="stat-card">



                <div className="stat-icon">



                  💻



                </div>



                <div>



                  <h3>



                    {labCount}



                  </h3>



                  <p>



                    Labs



                  </p>



                </div>



              </div>



            </section>



            {/* =================================================



                CLASS ATTENDANCE



            ================================================== */}



            <section



              className="faculty-section"



              id="attendance"



            >



              <div className="section-header">



                <div>



                  <h2>



                    📝 Class Attendance



                  </h2>



                  <p>



                    Mark attendance for students



                    assigned to you by Admin.



                  </p>



                </div>



              </div>



              {/* SELECT CLASS */}



              <div



                className="attendance-controls"



                style={{



                  marginBottom: "25px",



                }}



              >



                <label



                  htmlFor="attendance-class"



                  style={{



                    display: "block",



                    marginBottom: "8px",



                    fontWeight: "600",



                  }}



                >



                  Select Class / Subject



                </label>



                <select



                  id="attendance-class"



                  value={selectedTimetable}



                  onChange={



                    handleTimetableChange



                  }



                  style={{



                    width: "100%",



                    maxWidth: "500px",



                    padding: "12px",



                    borderRadius: "8px",



                    border:



                      "1px solid #ccc",



                    fontSize: "15px",



                  }}



                >



                  <option value="">



                    Select a class



                  </option>



                  {timetable.map((item) => (



                    <option



                      key={item.id}



                      value={item.id}



                    >



                      {item.subject}



                      {" - "}



                      {item.class_name}



                      {" - "}



                      {item.day_of_week}



                      {" "}



                      {item.start_time



                        ? item.start_time.substring(



                            0,



                            5



                          )



                        : ""}



                    </option>



                  ))}



                </select>



              </div>



              {/* SELECTED CLASS */}



              {selectedClass && (



                <div



                  className="empty-box"



                  style={{



                    marginBottom: "20px",



                  }}



                >



                  <p>



                    <strong>



                      Subject:



                    </strong>{" "}



                    {selectedClass.subject}



                  </p>



                  <p>



                    <strong>



                      Class:



                    </strong>{" "}



                    {selectedClass.class_name}



                  </p>



                  <p>



                    <strong>



                      Type:



                    </strong>{" "}



                    {selectedClass.class_type ||



                      "Theory"}



                  </p>



                  <p>



                    <strong>



                      Room:



                    </strong>{" "}



                    {selectedClass.room_no ||



                      "Not assigned"}



                  </p>



                </div>



              )}



              {/* ATTENDANCE SUMMARY */}



              <div



                className="faculty-stats"



                style={{



                  marginBottom: "25px",



                }}



              >



                <div className="stat-card">



                  <div className="stat-icon">



                    👥



                  </div>



                  <div>



                    <h3>



                      {attendanceSummary.total}



                    </h3>



                    <p>



                      Total Students



                    </p>



                  </div>



                </div>



                <div className="stat-card">



                  <div className="stat-icon">



                    ✅



                  </div>



                  <div>



                    <h3>



                      {attendanceSummary.present}



                    </h3>



                    <p>



                      Present



                    </p>



                  </div>



                </div>



                <div className="stat-card">



                  <div className="stat-icon">



                    ❌



                  </div>



                  <div>



                    <h3>



                      {attendanceSummary.absent}



                    </h3>



                    <p>



                      Absent



                    </p>



                  </div>



                </div>



                <div className="stat-card">



                  <div className="stat-icon">



                    📊



                  </div>



                  <div>



                    <h3>



                      {attendanceSummary.percentage}%



                    </h3>



                    <p>



                      Attendance



                    </p>



                  </div>



                </div>



              </div>



              {/* NO CLASS SELECTED */}



              {!selectedTimetable ? (



                <div className="empty-box">



                  <h3>



                    Select a class



                  </h3>



                  <p>



                    Select a subject from the



                    dropdown above to start



                    taking attendance.



                  </p>



                </div>



              ) : students.length === 0 ? (



                <div className="empty-box">



                  <h3>



                    No students assigned



                  </h3>



                  <p>



                    Admin has not assigned any



                    students to you yet.



                  </p>



                </div>



              ) : (



                <>



                  {/* ATTENDANCE TABLE */}



                  <div



                    className="students-table-container"



                  >



                    <table



                      className="students-table"



                    >



                      <thead>



                        <tr>



                          <th>



                            #



                          </th>



                          <th>



                            USN



                          </th>



                          <th>



                            Name



                          </th>



                          <th>



                            Section



                          </th>



                          <th>



                            Present



                          </th>



                          <th>



                            Absent



                          </th>



                          <th>



                            Status



                          </th>



                        </tr>



                      </thead>



                      <tbody>



                        {students.map(



                          (



                            student,



                            index



                          ) => {



                            const status =



                              attendance[



                                student.id



                              ];



                            return (



                              <tr



                                key={



                                  student.id



                                }



                              >



                                <td>



                                  {index + 1}



                                </td>



                                <td>



                                  <strong>



                                    {student.usn}



                                  </strong>



                                </td>



                                <td>



                                  {student.name}



                                </td>



                                <td>



                                  <span



                                    className="section-badge"



                                  >



                                    {student.section ||



                                      "N/A"}



                                  </span>



                                </td>



                                <td>



                                  <button



                                    type="button"



                                    onClick={() =>



                                      handleAttendanceChange(



                                        student.id,



                                        "Present"



                                      )



                                    }



                                    style={{



                                      padding:



                                        "8px 14px",



                                      borderRadius:



                                        "6px",



                                      border:



                                        "1px solid #28a745",



                                      cursor:



                                        "pointer",



                                      background:



                                        status ===



                                        "Present"



                                          ? "#28a745"



                                          : "#fff",



                                      color:



                                        status ===



                                        "Present"



                                          ? "#fff"



                                          : "#28a745",



                                      fontWeight:



                                        "600",



                                    }}



                                  >



                                    ✓ Present



                                  </button>



                                </td>



                                <td>



                                  <button



                                    type="button"



                                    onClick={() =>



                                      handleAttendanceChange(



                                        student.id,



                                        "Absent"



                                      )



                                    }



                                    style={{



                                      padding:



                                        "8px 14px",



                                      borderRadius:



                                        "6px",



                                      border:



                                        "1px solid #dc3545",



                                      cursor:



                                        "pointer",



                                      background:



                                        status ===



                                        "Absent"



                                          ? "#dc3545"



                                          : "#fff",



                                      color:



                                        status ===



                                        "Absent"



                                          ? "#fff"



                                          : "#dc3545",



                                      fontWeight:



                                        "600",



                                    }}



                                  >



                                    ✕ Absent



                                  </button>



                                </td>



                                <td>



                                  {status ===



                                  "Present" ? (



                                    <span



                                      style={{



                                        color:



                                          "#28a745",



                                        fontWeight:



                                          "700",



                                      }}



                                    >



                                      Present



                                    </span>



                                  ) : status ===



                                    "Absent" ? (



                                    <span



                                      style={{



                                        color:



                                          "#dc3545",



                                        fontWeight:



                                          "700",



                                      }}



                                    >



                                      Absent



                                    </span>



                                  ) : (



                                    <span>



                                      Not Marked



                                    </span>



                                  )}



                                </td>



                              </tr>



                            );



                          }



                        )}



                      </tbody>



                    </table>



                  </div>



                  {/* SUCCESS MESSAGE */}



                  {attendanceMessage && (



                    <div



                      style={{



                        marginTop: "20px",



                        padding: "14px",



                        borderRadius: "8px",



                        background:



                          "#e8f5e9",



                        color:



                          "#2e7d32",



                        fontWeight: "600",



                      }}



                    >



                      ✅{" "}



                      {attendanceMessage}



                    </div>



                  )}



                  {/* ERROR MESSAGE */}



                  {attendanceError && (



                    <div



                      style={{



                        marginTop: "20px",



                        padding: "14px",



                        borderRadius: "8px",



                        background:



                          "#ffebee",



                        color:



                          "#c62828",



                        fontWeight: "600",



                      }}



                    >



                      ❌{" "}



                      {attendanceError}



                    </div>



                  )}



                  {/* SAVE BUTTON */}



                  <div



                    style={{



                      marginTop: "25px",



                      display: "flex",



                      justifyContent:



                        "flex-end",



                    }}



                  >



                    <button



                      type="button"



                      onClick={



                        saveAttendance



                      }



                      disabled={



                        attendanceLoading



                      }



                      style={{



                        padding:



                          "13px 25px",



                        border: "none",



                        borderRadius:



                          "8px",



                        cursor:



                          attendanceLoading



                            ? "not-allowed"



                            : "pointer",



                        background:



                          attendanceLoading



                            ? "#999"



                            : "#2563eb",



                        color: "#fff",



                        fontSize: "16px",



                        fontWeight: "700",



                      }}



                    >



                      {attendanceLoading



                        ? "Saving..."



                        : "💾 Save Attendance"}



                    </button>



                  </div>



                </>



              )}



            </section>



            {/* =================================================



                ASSIGNED STUDENTS



            ================================================== */}



            <section



              className="faculty-section"



              id="students"



            >



              <div className="section-header">



                <div>



                  <h2>



                    👨‍🎓 My Students



                  </h2>



                  <p>



                    Students assigned to you by



                    Admin



                  </p>



                </div>



              </div>



              {students.length === 0 ? (



                <div className="empty-box">



                  <h3>



                    No students assigned



                  </h3>



                  <p>



                    Admin has not assigned any



                    students to you yet.



                  </p>



                </div>



              ) : (



                <div



                  className="students-table-container"



                >



                  <table



                    className="students-table"



                  >



                    <thead>



                      <tr>



                        <th>



                          #



                        </th>



                        <th>



                          USN



                        </th>



                        <th>



                          Name



                        </th>



                        <th>



                          Section



                        </th>



                        <th>



                          Branch



                        </th>



                        <th>



                          Semester



                        </th>



                        <th>



                          CGPA



                        </th>



                        <th>



                          Attendance



                        </th>



                        <th>



                          Backlogs



                        </th>



                        <th>



                          Action



                        </th>



                      </tr>



                    </thead>



                    <tbody>



                      {students.map(



                        (



                          student,



                          index



                        ) => (



                          <tr



                            key={



                              student.id



                            }



                          >



                            <td>



                              {index + 1}



                            </td>



                            <td>



                              <strong>



                                {student.usn}



                              </strong>



                            </td>



                            <td>



                              {student.name}



                            </td>



                            <td>



                              <span



                                className="section-badge"



                              >



                                {student.section ||



                                  "N/A"}



                              </span>



                            </td>



                            <td>



                              {student.branch ||



                                "N/A"}



                            </td>



                            <td>



                              {student.semester ||



                                "N/A"}



                            </td>



                            <td>



                              {student.cgpa !==



                                null &&



                              student.cgpa !==



                                undefined



                                ? student.cgpa



                                : "N/A"}



                            </td>



                            <td>



                              {student.attendance !==



                                null &&



                              student.attendance !==



                                undefined



                                ? `${student.attendance}%`



                                : "N/A"}



                            </td>



                            <td>



                              {student.backlogs ??



                                0}



                            </td>



                            <td>



                              <button



                                className="view-student-btn"



                                onClick={() =>



                                  viewStudent(



                                    student.id



                                  )



                                }



                              >



                                View Details



                              </button>



                            </td>



                          </tr>



                        )



                      )}



                    </tbody>



                  </table>



                </div>



              )}



            </section>



            {/* =================================================



                ASSIGNMENT INFORMATION



            ================================================== */}



            <section



              className="faculty-section"



            >



              <div className="section-header">



                <div>



                  <h2>



                    📌 Assignment Information



                  </h2>



                  <p>



                    Your student list is



                    controlled by the Admin.



                  </p>



                </div>



              </div>



              <div className="empty-box">



                <p>



                  <strong>



                    Total students assigned:



                  </strong>{" "}



                  {students.length}



                </p>



                <p>



                  <strong>



                    Sections represented:



                  </strong>{" "}



                  {assignedSections.length > 0



                    ? assignedSections.join(



                        ", "



                      )



                    : "None"}



                </p>



                <p>



                  Admin can assign, reassign,



                  or remove students from your



                  faculty account.



                </p>



              </div>



            </section>



            {/* =================================================



                TIMETABLE



            ================================================== */}



            <section



              className="faculty-section"



              id="timetable"



            >



              <div className="section-header">



                <div>



                  <h2>



                    📅 My Timetable



                  </h2>



                  <p>



                    Your assigned classes and



                    sessions



                  </p>



                </div>



              </div>



              {timetable.length === 0 ? (



                <div className="empty-box">



                  No timetable available.



                </div>



              ) : (



                <div className="timetable-grid">



                  {timetable.map(



                    (item) => (



                      <div



                        className="timetable-card"



                        key={item.id}



                      >



                        <div className="time-box">



                          <strong>



                            {item.start_time



                              ? item.start_time.substring(



                                  0,



                                  5



                                )



                              : "--:--"}



                          </strong>



                          <span>



                            to



                          </span>



                          <strong>



                            {item.end_time



                              ? item.end_time.substring(



                                  0,



                                  5



                                )



                              : "--:--"}



                          </strong>



                        </div>



                        <div className="class-info">



                          <div className="class-top">



                            <span



                              className="day-badge"



                            >



                              {item.day_of_week}



                            </span>



                            <span



                              className={`type-badge ${



                                item.class_type



                                  ? item.class_type.toLowerCase()



                                  : ""



                              }`}



                            >



                              {item.class_type ||



                                "Theory"}



                            </span>



                          </div>



                          <h3>



                            {item.subject}



                          </h3>



                          <p>



                            🏫{" "}



                            {item.class_name ||



                              "Class"}



                          </p>



                          <p>



                            📍{" "}



                            {item.room_no ||



                              "Room not assigned"}



                          </p>



                        </div>



                      </div>



                    )



                  )}



                </div>



              )}



            </section>



          </>



        )}



      </main>



    </div>



  );



}



export default FacultyDashboard;
