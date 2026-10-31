import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function FacultyAttendance() {
  const navigate = useNavigate();

  const facultyId = localStorage.getItem("facultyId");
  const facultyName = localStorage.getItem("facultyName");
  const facultyDepartment =
    localStorage.getItem("facultyDepartment") || "Computer Science";

  const [students, setStudents] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [selectedTimetable, setSelectedTimetable] = useState("");
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    absent: 0,
    percentage: 0,
  });

  useEffect(() => {
    if (!facultyId) {
      navigate("/faculty-login");
      return;
    }

    loadData();
  }, [facultyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [studentsResponse, timetableResponse] = await Promise.all([
        fetch(`${API_URL}/attendance/faculty/${facultyId}/students`),
        fetch(`${API_URL}/attendance/faculty/${facultyId}/timetable`),
      ]);

      const studentsData = await studentsResponse.json();
      const timetableData = await timetableResponse.json();

      if (!studentsResponse.ok) {
        throw new Error(
          studentsData.detail || "Failed to load assigned students."
        );
      }

      if (!timetableResponse.ok) {
        throw new Error(
          timetableData.detail || "Failed to load faculty timetable."
        );
      }

      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setTimetable(Array.isArray(timetableData) ? timetableData : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load attendance data.");
    } finally {
      setLoading(false);
    }
  };

  const loadTodayAttendance = async (timetableId) => {
    setAttendance({});
    setMessage("");
    setError("");

    if (!timetableId) {
      setSummary({
        total: 0,
        present: 0,
        absent: 0,
        percentage: 0,
      });
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/attendance/faculty/${facultyId}/today?timetable_id=${timetableId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to load today's attendance.");
      }

      const existing = {};

      if (Array.isArray(data.students)) {
        data.students.forEach((item) => {
          existing[item.student_id] = item.status;
        });
      }

      setAttendance(existing);

      setSummary({
        total: data.total_students || 0,
        present: data.present || 0,
        absent: data.absent || 0,
        percentage: Number(data.attendance_percentage || 0),
      });

      if (data.students && data.students.length > 0) {
        setMessage("Today's attendance has been loaded. You can update it.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load today's attendance.");
    }
  };

  const handleClassChange = (event) => {
    const value = event.target.value;
    setSelectedTimetable(value);
    loadTodayAttendance(value);
  };

  const markAttendance = (studentId, status) => {
    setAttendance((previous) => ({
      ...previous,
      [studentId]: status,
    }));
    setMessage("");
    setError("");
  };

  useEffect(() => {
    let present = 0;
    let absent = 0;

    students.forEach((student) => {
      if (attendance[student.id] === "Present") present += 1;
      if (attendance[student.id] === "Absent") absent += 1;
    });

    const total = present + absent;
    const percentage = total > 0 ? (present / total) * 100 : 0;

    setSummary({
      total,
      present,
      absent,
      percentage: Number(percentage.toFixed(2)),
    });
  }, [attendance, students]);

  const saveAttendance = async () => {
    setMessage("");
    setError("");

    if (!selectedTimetable) {
      setError("Please select a class or subject.");
      return;
    }

    if (students.length === 0) {
      setError("No students are assigned to you.");
      return;
    }

    const unmarked = students.filter(
      (student) => !attendance[student.id]
    );

    if (unmarked.length > 0) {
      setError(
        `Please mark attendance for all students. ${unmarked.length} student(s) are still unmarked.`
      );
      return;
    }

    try {
      setAttendanceLoading(true);

      const attendanceData = students.map((student) => ({
        student_id: student.id,
        status: attendance[student.id],
      }));

      const response = await fetch(
        `${API_URL}/attendance/mark?faculty_id=${facultyId}&timetable_id=${selectedTimetable}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(attendanceData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to save attendance.");
      }

      setSummary({
        total: data.total_students || 0,
        present: data.present || 0,
        absent: data.absent || 0,
        percentage: Number(data.attendance_percentage || 0),
      });

      setMessage(
        `Attendance saved successfully. Present: ${data.present}, Absent: ${data.absent}, Attendance: ${data.attendance_percentage}%`
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save attendance.");
    } finally {
      setAttendanceLoading(false);
    }
  };

  const selectedClass = useMemo(
    () =>
      timetable.find(
        (item) => String(item.id) === String(selectedTimetable)
      ),
    [timetable, selectedTimetable]
  );

  const logout = () => {
    [
      "facultyToken",
      "facultyId",
      "facultyName",
      "facultyEmail",
      "facultyDepartment",
    ].forEach((key) => localStorage.removeItem(key));

    navigate("/faculty-login");
  };

  const allMarked =
    students.length > 0 &&
    students.every((student) => Boolean(attendance[student.id]));

  if (loading) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.loadingCard}>Loading attendance...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.portal}>🎓 FACULTY PORTAL</div>
          <h1 style={styles.headerTitle}>📝 Attendance</h1>
          <p style={styles.headerSub}>
            {facultyName || "Faculty"} • {facultyDepartment}
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            style={styles.headerButton}
            onClick={() => navigate("/faculty-dashboard")}
          >
            🏠 Dashboard
          </button>
          <button
            style={styles.headerButton}
            onClick={() => navigate("/faculty/students")}
          >
            👨‍🎓 My Students
          </button>
          <button style={styles.logoutButton} onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main style={styles.container}>
        {error && <div style={styles.error}>{error}</div>}
        {message && <div style={styles.success}>{message}</div>}

        <section style={styles.heroCard}>
          <div>
            <h2 style={styles.heroTitle}>Class Attendance</h2>
            <p style={styles.heroText}>
              Mark attendance only for students assigned to your faculty
              account.
            </p>
          </div>

          <div style={styles.dateBox}>
            <span>📅</span>
            <strong>{new Date().toLocaleDateString()}</strong>
          </div>
        </section>

        <section style={styles.card}>
          <label style={styles.label}>Select Class / Subject</label>

          <select
            value={selectedTimetable}
            onChange={handleClassChange}
            style={styles.select}
          >
            <option value="">Select a class</option>

            {timetable.map((item) => (
              <option key={item.id} value={item.id}>
                {item.subject || "Subject"} -{" "}
                {item.class_name || "Class"} -{" "}
                {item.day_of_week || ""}{" "}
                {item.start_time
                  ? item.start_time.substring(0, 5)
                  : ""}
              </option>
            ))}
          </select>

          {selectedClass && (
            <div style={styles.classInfo}>
              <div>
                <span>Subject</span>
                <strong>{selectedClass.subject || "N/A"}</strong>
              </div>
              <div>
                <span>Class</span>
                <strong>{selectedClass.class_name || "N/A"}</strong>
              </div>
              <div>
                <span>Type</span>
                <strong>{selectedClass.class_type || "Theory"}</strong>
              </div>
              <div>
                <span>Room</span>
                <strong>{selectedClass.room_no || "Not assigned"}</strong>
              </div>
            </div>
          )}
        </section>

        <section style={styles.statsGrid}>
          <Stat icon="👥" value={summary.total} label="Total Students" />
          <Stat icon="✅" value={summary.present} label="Present" />
          <Stat icon="❌" value={summary.absent} label="Absent" />
          <Stat
            icon="📊"
            value={`${summary.percentage}%`}
            label="Attendance"
          />
        </section>

        {!selectedTimetable ? (
          <section style={styles.emptyCard}>
            <div style={styles.emptyIcon}>📝</div>
            <h2>Select a class</h2>
            <p>
              Select a subject from the dropdown above to start taking
              attendance.
            </p>
          </section>
        ) : students.length === 0 ? (
          <section style={styles.emptyCard}>
            <div style={styles.emptyIcon}>👨‍🎓</div>
            <h2>No students assigned</h2>
            <p>Admin has not assigned any students to you yet.</p>
          </section>
        ) : (
          <section style={styles.card}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>👨‍🎓 Assigned Students</h2>
                <p style={styles.sectionSub}>
                  Mark every student as Present or Absent.
                </p>
              </div>

              <div style={styles.markedBadge}>
                {Object.keys(attendance).length}/{students.length} Marked
              </div>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Student</th>
                    <th style={styles.th}>USN</th>
                    <th style={styles.th}>Section</th>
                    <th style={styles.th}>Attendance</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student, index) => {
                    const status = attendance[student.id];

                    return (
                      <tr key={student.id}>
                        <td style={styles.td}>{index + 1}</td>

                        <td style={styles.td}>
                          <strong>{student.name}</strong>
                          <small style={styles.email}>
                            {student.email || ""}
                          </small>
                        </td>

                        <td style={styles.td}>{student.usn}</td>

                        <td style={styles.td}>
                          <span style={styles.sectionBadge}>
                            {student.section || "N/A"}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <div style={styles.buttonGroup}>
                            <button
                              onClick={() =>
                                markAttendance(student.id, "Present")
                              }
                              style={{
                                ...styles.presentButton,
                                ...(status === "Present"
                                  ? styles.presentActive
                                  : {}),
                              }}
                            >
                              ✓ Present
                            </button>

                            <button
                              onClick={() =>
                                markAttendance(student.id, "Absent")
                              }
                              style={{
                                ...styles.absentButton,
                                ...(status === "Absent"
                                  ? styles.absentActive
                                  : {}),
                              }}
                            >
                              ✕ Absent
                            </button>
                          </div>
                        </td>

                        <td style={styles.td}>
                          {status ? (
                            <span
                              style={
                                status === "Present"
                                  ? styles.statusPresent
                                  : styles.statusAbsent
                              }
                            >
                              {status}
                            </span>
                          ) : (
                            <span style={styles.notMarked}>
                              Not Marked
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={styles.bottomBar}>
              <div>
                {!allMarked && (
                  <span style={styles.warning}>
                    ⚠️ Mark all students before saving.
                  </span>
                )}
              </div>

              <button
                onClick={saveAttendance}
                disabled={attendanceLoading || !allMarked}
                style={{
                  ...styles.saveButton,
                  ...(attendanceLoading || !allMarked
                    ? styles.saveDisabled
                    : {}),
                }}
              >
                {attendanceLoading
                  ? "Saving..."
                  : "💾 Save Attendance"}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Stat({ icon, value, label }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>{icon}</div>
      <div>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    color: "#172033",
    fontFamily:
      "Inter, Arial, Helvetica, sans-serif",
  },

  centerPage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f7fb",
  },

  loadingCard: {
    background: "#fff",
    padding: "30px 45px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },

  header: {
    background: "#fff",
    borderBottom: "1px solid #e1e6ef",
    padding: "20px 4%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },

  portal: {
    fontSize: "12px",
    fontWeight: "800",
    color: "#315ee7",
    letterSpacing: "1px",
  },

  headerTitle: {
    margin: "3px 0",
    fontSize: "25px",
  },

  headerSub: {
    margin: 0,
    color: "#718096",
    fontSize: "13px",
  },

  headerActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  headerButton: {
    border: "1px solid #d8dfeb",
    background: "#fff",
    color: "#24406e",
    padding: "9px 14px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  logoutButton: {
    border: "none",
    background: "#ef3030",
    color: "#fff",
    padding: "9px 16px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "700",
  },

  container: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "28px 24px 50px",
  },

  heroCard: {
    background: "#fff",
    border: "1px solid #e0e6f0",
    borderRadius: "12px",
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "18px",
  },

  heroTitle: {
    margin: 0,
    fontSize: "26px",
  },

  heroText: {
    color: "#68758a",
    margin: "7px 0 0",
  },

  dateBox: {
    background: "#f0f5ff",
    color: "#315ee7",
    padding: "12px 16px",
    borderRadius: "9px",
    display: "flex",
    gap: "8px",
    alignItems: "center",
    whiteSpace: "nowrap",
  },

  card: {
    background: "#fff",
    border: "1px solid #e0e6f0",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "18px",
  },

  label: {
    display: "block",
    fontWeight: "700",
    marginBottom: "9px",
  },

  select: {
    width: "100%",
    maxWidth: "600px",
    padding: "12px 14px",
    border: "1px solid #ccd5e2",
    borderRadius: "8px",
    background: "#fff",
    fontSize: "15px",
    outline: "none",
  },

  classInfo: {
    marginTop: "18px",
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(120px, 1fr))",
    gap: "12px",
  },

  classInfoItem: {},

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "18px",
  },

  statCard: {
    background: "#fff",
    border: "1px solid #e0e6f0",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  statIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "10px",
    background: "#eef4ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
  },

  statValue: {
    fontSize: "24px",
    fontWeight: "800",
  },

  statLabel: {
    color: "#748096",
    fontSize: "13px",
    marginTop: "3px",
  },

  emptyCard: {
    background: "#fff",
    border: "1px solid #e0e6f0",
    borderRadius: "12px",
    minHeight: "260px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "30px",
  },

  emptyIcon: {
    fontSize: "42px",
    marginBottom: "5px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "18px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "20px",
  },

  sectionSub: {
    margin: "5px 0 0",
    color: "#748096",
    fontSize: "13px",
  },

  markedBadge: {
    background: "#eef4ff",
    color: "#315ee7",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
  },

  tableWrap: {
    overflowX: "auto",
    border: "1px solid #e4e8ef",
    borderRadius: "9px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "850px",
  },

  th: {
    textAlign: "left",
    padding: "13px",
    background: "#f8fafc",
    color: "#526176",
    fontSize: "12px",
    textTransform: "uppercase",
    borderBottom: "1px solid #e3e7ee",
  },

  td: {
    padding: "13px",
    borderBottom: "1px solid #edf0f4",
    fontSize: "14px",
  },

  email: {
    display: "block",
    color: "#8994a5",
    fontSize: "11px",
    marginTop: "3px",
  },

  sectionBadge: {
    background: "#edf3ff",
    color: "#315ee7",
    padding: "5px 9px",
    borderRadius: "14px",
    fontWeight: "700",
    fontSize: "12px",
  },

  buttonGroup: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  presentButton: {
    padding: "7px 11px",
    borderRadius: "6px",
    border: "1px solid #28a745",
    background: "#fff",
    color: "#218838",
    cursor: "pointer",
    fontWeight: "600",
  },

  presentActive: {
    background: "#28a745",
    color: "#fff",
  },

  absentButton: {
    padding: "7px 11px",
    borderRadius: "6px",
    border: "1px solid #dc3545",
    background: "#fff",
    color: "#dc3545",
    cursor: "pointer",
    fontWeight: "600",
  },

  absentActive: {
    background: "#dc3545",
    color: "#fff",
  },

  statusPresent: {
    background: "#e8f7ed",
    color: "#218838",
    padding: "5px 9px",
    borderRadius: "14px",
    fontWeight: "700",
    fontSize: "12px",
  },

  statusAbsent: {
    background: "#fdeaea",
    color: "#c62828",
    padding: "5px 9px",
    borderRadius: "14px",
    fontWeight: "700",
    fontSize: "12px",
  },

  notMarked: {
    color: "#8994a5",
    fontSize: "12px",
  },

  bottomBar: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
  },

  warning: {
    color: "#b26a00",
    fontSize: "13px",
    fontWeight: "600",
  },

  saveButton: {
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "12px 22px",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "14px",
  },

  saveDisabled: {
    background: "#9aa4b2",
    cursor: "not-allowed",
  },

  error: {
    background: "#fff0f0",
    color: "#c62828",
    border: "1px solid #ffd1d1",
    padding: "13px 16px",
    borderRadius: "8px",
    marginBottom: "15px",
    fontWeight: "600",
  },

  success: {
    background: "#effaf2",
    color: "#247a38",
    border: "1px solid #ccebd3",
    padding: "13px 16px",
    borderRadius: "8px",
    marginBottom: "15px",
    fontWeight: "600",
  },
};

export default FacultyAttendance;
