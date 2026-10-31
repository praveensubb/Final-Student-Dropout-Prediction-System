import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function FacultyStudents() {
  const navigate = useNavigate();

  const facultyId = localStorage.getItem("facultyId");
  const facultyName = localStorage.getItem("facultyName") || "Faculty";
  const facultyDepartment =
    localStorage.getItem("facultyDepartment") || "Computer Science";

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("All Semesters");
  const [sectionFilter, setSectionFilter] = useState("All Sections");

  const loadStudents = async () => {
    if (!facultyId) {
      setError("Faculty login information not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/faculty/${facultyId}/students`
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to load students.");
      }

      const data = await response.json();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.students)
        ? data.students
        : [];

      setStudents(list);
    } catch (err) {
      console.error("Faculty students error:", err);
      setError(err.message || "Unable to load students.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [facultyId]);

  const logout = () => {
    localStorage.removeItem("facultyToken");
    localStorage.removeItem("facultyId");
    localStorage.removeItem("facultyName");
    localStorage.removeItem("facultyEmail");
    localStorage.removeItem("facultyDepartment");
    navigate("/faculty-login");
  };

  const semesters = useMemo(
    () =>
      [...new Set(
        students
          .map((s) => s.semester)
          .filter((v) => v !== null && v !== undefined && v !== "")
      )].sort((a, b) => Number(a) - Number(b)),
    [students]
  );

  const sections = useMemo(
    () =>
      [...new Set(
        students
          .map((s) => String(s.section || "").trim().toUpperCase())
          .filter(Boolean)
      )].sort(),
    [students]
  );

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !query ||
        String(student.name || "").toLowerCase().includes(query) ||
        String(student.usn || "").toLowerCase().includes(query) ||
        String(student.email || "").toLowerCase().includes(query);

      const matchesSemester =
        semesterFilter === "All Semesters" ||
        String(student.semester) === String(semesterFilter);

      const matchesSection =
        sectionFilter === "All Sections" ||
        String(student.section || "").toUpperCase() === sectionFilter;

      return matchesSearch && matchesSemester && matchesSection;
    });
  }, [students, search, semesterFilter, sectionFilter]);

  const goodAttendanceCount = students.filter(
    (s) => Number(s.attendance || 0) >= 85
  ).length;

  const lowAttendanceCount = students.filter(
    (s) => Number(s.attendance || 0) < 75
  ).length;

  const viewStudent = (studentId) => {
    navigate(`/faculty/student/${studentId}`);
  };

  const attendanceClass = (value) => {
    const n = Number(value);
    if (n >= 85) return "good";
    if (n >= 75) return "average";
    return "low";
  };

  const riskClass = (student) => {
    const risk = String(student.risk_status || "").toLowerCase();
    if (risk.includes("high")) return "risk-high";
    if (risk.includes("medium")) return "risk-medium";
    return "risk-low";
  };

  const riskText = (student) => {
    if (student.risk_status) return student.risk_status;
    return "Not Available";
  };

  return (
    <div className="faculty-students-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .faculty-students-page {
          min-height: 100vh;
          background: #f7f9fc;
          color: #172033;
          font-family: Arial, Helvetica, sans-serif;
        }

        .faculty-students-topbar {
          height: 58px;
          background: #ffffff;
          border-bottom: 1px solid #e6eaf0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 18px;
        }

        .faculty-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #17315f;
        }

        .faculty-brand small {
          display: block;
          color: #2764d8;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1px;
          line-height: 1;
          margin-bottom: 2px;
        }

        .faculty-brand h1 {
          margin: 0;
          font-size: 17px;
          font-weight: 800;
          line-height: 1;
        }

        .faculty-top-actions {
          display: flex;
          gap: 7px;
        }

        .top-btn {
          border: 1px solid #d7dfeb;
          background: #fff;
          color: #24436f;
          border-radius: 4px;
          padding: 6px 10px;
          font-size: 10px;
          cursor: pointer;
        }

        .top-btn:hover {
          background: #f3f7ff;
        }

        .top-btn.logout {
          border-color: #e53935;
          background: #ef312d;
          color: white;
          font-weight: 700;
        }

        .faculty-students-main {
          padding: 13px 18px 22px;
          max-width: 1500px;
          margin: 0 auto;
        }

        .page-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 9px;
        }

        .page-heading h2 {
          margin: 0;
          font-size: 18px;
          color: #172033;
        }

        .page-heading p {
          margin: 3px 0 0;
          color: #7b8799;
          font-size: 9px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 9px;
          margin-bottom: 10px;
        }

        .stat-card {
          background: #fff;
          border: 1px solid #dce3ed;
          border-radius: 7px;
          min-height: 61px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          box-shadow: 0 1px 2px rgba(25, 45, 80, 0.03);
        }

        .stat-icon {
          width: 29px;
          height: 29px;
          border-radius: 7px;
          background: #f1f5fb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex: 0 0 auto;
        }

        .stat-card h3 {
          margin: 0;
          font-size: 15px;
          color: #172033;
        }

        .stat-card p {
          margin: 2px 0 0;
          font-size: 8px;
          color: #8b96a8;
        }

        .students-card {
          background: #fff;
          border: 1px solid #dce3ed;
          border-radius: 7px;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(25, 45, 80, 0.03);
        }

        .students-card-header {
          padding: 9px 10px 7px;
          border-bottom: 1px solid #edf0f5;
        }

        .students-card-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2px;
        }

        .students-card-title h3 {
          margin: 0;
          font-size: 11px;
          color: #1a2c4d;
        }

        .student-count {
          background: #edf4ff;
          color: #2563d9;
          border-radius: 10px;
          padding: 3px 7px;
          font-size: 7px;
          font-weight: 700;
        }

        .students-card-subtitle {
          margin: 0;
          color: #8a94a5;
          font-size: 7px;
        }

        .filters {
          display: grid;
          grid-template-columns: minmax(180px, 1fr) 150px 150px auto;
          gap: 7px;
          padding: 8px 10px;
          background: #fbfcfe;
          border-bottom: 1px solid #edf0f5;
        }

        .search-box,
        .filter-select {
          height: 27px;
          border: 1px solid #cfd8e5;
          border-radius: 4px;
          background: #fff;
          color: #35445d;
          font-size: 8px;
          outline: none;
        }

        .search-box {
          padding: 0 9px;
        }

        .filter-select {
          padding: 0 7px;
        }

        .clear-btn {
          height: 27px;
          border: 1px solid #d5dce7;
          background: #fff;
          border-radius: 4px;
          font-size: 8px;
          cursor: pointer;
          color: #43536d;
          padding: 0 10px;
        }

        .table-wrap {
          overflow-x: auto;
        }

        .students-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .students-table th {
          background: #f8fafc;
          color: #53627a;
          font-size: 7px;
          text-transform: uppercase;
          text-align: left;
          padding: 7px 7px;
          border-bottom: 1px solid #e4e9f0;
          white-space: nowrap;
        }

        .students-table td {
          padding: 7px 7px;
          border-bottom: 1px solid #edf0f4;
          font-size: 8px;
          color: #42506a;
          vertical-align: middle;
        }

        .students-table tbody tr:hover {
          background: #fbfdff;
        }

        .student-cell {
          display: flex;
          align-items: center;
          gap: 7px;
          min-width: 120px;
        }

        .student-avatar {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #eaf1ff;
          color: #3567d4;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          font-weight: 700;
          flex: 0 0 auto;
        }

        .student-name {
          font-weight: 700;
          color: #1d2a40;
          font-size: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .student-email {
          margin-top: 1px;
          font-size: 6px;
          color: #8a95a7;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .usn {
          font-size: 7px;
          color: #47556c;
          font-weight: 600;
        }

        .section-badge {
          display: inline-flex;
          min-width: 22px;
          height: 17px;
          padding: 0 6px;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #eaf2ff;
          color: #3166d5;
          font-size: 7px;
          font-weight: 700;
        }

        .attendance-badge {
          display: inline-flex;
          min-width: 30px;
          height: 17px;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-size: 7px;
          font-weight: 700;
        }

        .attendance-badge.good {
          background: #dff7e8;
          color: #16803c;
        }

        .attendance-badge.average {
          background: #fff2ce;
          color: #9b6900;
        }

        .attendance-badge.low {
          background: #ffe0df;
          color: #d32f2f;
        }

        .risk-badge {
          display: inline-flex;
          min-width: 46px;
          padding: 3px 6px;
          border-radius: 9px;
          justify-content: center;
          font-size: 6px;
          font-weight: 700;
          white-space: nowrap;
        }

        .risk-high {
          background: #ffe0df;
          color: #c62828;
        }

        .risk-medium {
          background: #fff1ce;
          color: #a06b00;
        }

        .risk-low {
          background: #e1f7e9;
          color: #198443;
        }

        .view-btn {
          border: none;
          background: #2167df;
          color: white;
          border-radius: 3px;
          padding: 5px 8px;
          font-size: 7px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .view-btn:hover {
          background: #1857c2;
        }

        .empty-row {
          text-align: center !important;
          padding: 25px !important;
          color: #8792a4 !important;
        }

        .loading-box,
        .error-box {
          background: #fff;
          border: 1px solid #dce3ed;
          border-radius: 7px;
          padding: 25px;
          text-align: center;
          font-size: 11px;
        }

        .error-box {
          color: #c62828;
        }

        .bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
          margin-top: 10px;
        }

        .bottom-card {
          background: #fff;
          border: 1px solid #dce3ed;
          border-radius: 7px;
          min-height: 58px;
          padding: 9px 11px;
        }

        .bottom-card h4 {
          margin: 0 0 3px;
          font-size: 10px;
          color: #253552;
        }

        .bottom-card p {
          margin: 0 0 6px;
          font-size: 7px;
          color: #8994a6;
        }

        .bottom-btn {
          border: none;
          border-radius: 3px;
          background: #18243a;
          color: #fff;
          padding: 5px 8px;
          font-size: 7px;
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .filters {
            grid-template-columns: 1fr 1fr;
          }

          .clear-btn {
            width: fit-content;
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .faculty-students-topbar {
            padding: 0 9px;
          }

          .faculty-students-main {
            padding: 10px;
          }

          .faculty-top-actions .top-btn:not(.logout) {
            display: none;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .filters {
            grid-template-columns: 1fr;
          }

          .students-table {
            min-width: 900px;
          }
        }
      `}</style>

      <header className="faculty-students-topbar">
        <div className="faculty-brand">
          <span style={{ fontSize: 18 }}>🎓</span>
          <div>
            <small>FACULTY PORTAL</small>
            <h1>My Students</h1>
          </div>
        </div>

        <div className="faculty-top-actions">
          <button
            className="top-btn"
            onClick={() => navigate("/faculty-dashboard")}
          >
            🏠 Dashboard
          </button>

          <button
            className="top-btn"
            onClick={() => navigate("/faculty-attendance")}
          >
            📝 Attendance
          </button>

          <button className="top-btn logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="faculty-students-main">
        <div className="page-heading">
          <div>
            <h2>My Students</h2>
            <p>
              Students assigned to {facultyName} • {facultyDepartment}
            </p>
          </div>
        </div>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👨‍🎓</div>
            <div>
              <h3>{students.length}</h3>
              <p>Students assigned to you</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div>
              <h3>{goodAttendanceCount}</h3>
              <p>Attendance 85% or above</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div>
              <h3>{lowAttendanceCount}</h3>
              <p>Attendance below 75%</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div>
              <h3>{facultyDepartment}</h3>
              <p>Your department</p>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="loading-box">Loading assigned students...</div>
        ) : error ? (
          <div className="error-box">❌ {error}</div>
        ) : (
          <section className="students-card">
            <div className="students-card-header">
              <div className="students-card-title">
                <h3>🎓 Assigned Students</h3>
                <span className="student-count">
                  {filteredStudents.length} shown
                </span>
              </div>

              <p className="students-card-subtitle">
                Only students assigned to your faculty account are shown here.
              </p>
            </div>

            <div className="filters">
              <input
                className="search-box"
                type="text"
                placeholder="🔍 Search by name, USN or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                className="filter-select"
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
              >
                <option>All Semesters</option>
                {semesters.map((semester) => (
                  <option key={semester} value={semester}>
                    Semester {semester}
                  </option>
                ))}
              </select>

              <select
                className="filter-select"
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
              >
                <option>All Sections</option>
                {sections.map((section) => (
                  <option key={section} value={section}>
                    Section {section}
                  </option>
                ))}
              </select>

              <button
                className="clear-btn"
                onClick={() => {
                  setSearch("");
                  setSemesterFilter("All Semesters");
                  setSectionFilter("All Sections");
                }}
              >
                Clear
              </button>
            </div>

            <div className="table-wrap">
              <table className="students-table">
                <colgroup>
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "8%" }} />
                </colgroup>

                <thead>
                  <tr>
                    <th>Student</th>
                    <th>USN</th>
                    <th>Branch</th>
                    <th>Semester</th>
                    <th>Section</th>
                    <th>Attendance</th>
                    <th>CGPA</th>
                    <th>Backlogs</th>
                    <th>Risk</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="empty-row">
                        No students found.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, index) => (
                      <tr key={student.id || student.usn || index}>
                        <td>
                          <div className="student-cell">
                            <div className="student-avatar">
                              {String(student.name || "S")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <div>
                              <div className="student-name">
                                {student.name || "Unknown"}
                              </div>
                              <div className="student-email">
                                {student.email || "No email"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="usn">{student.usn || "N/A"}</span>
                        </td>

                        <td>{student.branch || "N/A"}</td>

                        <td>{student.semester ?? "N/A"}</td>

                        <td>
                          <span className="section-badge">
                            {student.section || "N/A"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`attendance-badge ${attendanceClass(
                              student.attendance
                            )}`}
                          >
                            {student.attendance !== null &&
                            student.attendance !== undefined
                              ? `${student.attendance}%`
                              : "N/A"}
                          </span>
                        </td>

                        <td>{student.cgpa ?? "N/A"}</td>

                        <td>{student.backlogs ?? 0}</td>

                        <td>
                          <span
                            className={`risk-badge ${riskClass(student)}`}
                          >
                            {riskText(student)}
                          </span>
                        </td>

                        <td>
                          <button
                            className="view-btn"
                            onClick={() => viewStudent(student.id)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <div className="bottom-grid">
          <div className="bottom-card">
            <h4>📊 Attendance</h4>
            <p>Use the Faculty Attendance module to manage attendance.</p>
            <button
              className="bottom-btn"
              onClick={() => navigate("/faculty-attendance")}
            >
              Open Attendance
            </button>
          </div>

          <div className="bottom-card">
            <h4>📅 Timetable</h4>
            <p>View and manage the timetable available to your faculty account.</p>
            <button
              className="bottom-btn"
              onClick={() => navigate("/faculty-timetable")}
            >
              Open Timetable
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default FacultyStudents;
