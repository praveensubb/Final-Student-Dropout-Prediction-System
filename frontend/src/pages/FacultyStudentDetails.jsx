import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function FacultyStudentDetails() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const facultyId = localStorage.getItem("facultyId");
  const facultyName = localStorage.getItem("facultyName") || "Faculty";
  const facultyDepartment =
    localStorage.getItem("facultyDepartment") || "Computer Science";

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!facultyId) {
      navigate("/faculty-login");
      return;
    }

    loadStudent();
  }, [studentId, facultyId]);

  const loadStudent = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/faculty/${facultyId}/student/${studentId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load student details.");
      }

      setStudent(data);
    } catch (err) {
      console.error("Student details error:", err);
      setError(err.message || "Unable to load student details.");
    } finally {
      setLoading(false);
    }
  };

  const attendanceStatus = (value) => {
    const number = Number(value);

    if (Number.isNaN(number)) return "Not Available";
    if (number >= 85) return "Good";
    if (number >= 75) return "Average";
    return "Low";
  };

  const cgpaStatus = (value) => {
    const number = Number(value);

    if (Number.isNaN(number)) return "Not Available";
    if (number >= 8) return "Good";
    if (number >= 6.5) return "Average";
    return "Needs Attention";
  };

  const backlogStatus = (value) => {
    const number = Number(value || 0);

    if (number === 0) return "No Backlogs";
    if (number <= 2) return "Needs Attention";
    return "High";
  };

  const riskStatus = student?.risk_status || "Not Available";

  const riskClass = String(riskStatus).toLowerCase().includes("high")
    ? "high"
    : String(riskStatus).toLowerCase().includes("medium")
    ? "medium"
    : "low";

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

  if (loading) {
    return (
      <div className="details-page">
        <div className="loading-card">Loading student details...</div>
        <style>{styles}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="details-page">
        <style>{styles}</style>
        <div className="error-card">
          <h2>Unable to load student</h2>
          <p>{error}</p>
          <button
            className="primary-button"
            onClick={() => navigate("/faculty/students")}
          >
            ← Back to My Students
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="details-page">
      <style>{styles}</style>

      <header className="topbar">
        <div>
          <div className="portal">🎓 FACULTY PORTAL</div>
          <h1>Student Details</h1>
          <p>
            {facultyName} • {facultyDepartment}
          </p>
        </div>

        <div className="top-actions">
          <button
            className="top-button"
            onClick={() => navigate("/faculty-dashboard")}
          >
            🏠 Dashboard
          </button>

          <button
            className="top-button"
            onClick={() => navigate("/faculty/students")}
          >
            👨‍🎓 My Students
          </button>

          <button
            className="top-button"
            onClick={() => navigate("/faculty-attendance")}
          >
            📝 Attendance
          </button>

          <button className="logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="main">
        <div className="back-row">
          <button
            className="back-button"
            onClick={() => navigate("/faculty/students")}
          >
            ← Back to My Students
          </button>
        </div>

        <section className="profile-card">
          <div className="avatar">
            {String(student.name || "S")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="profile-info">
            <h2>{student.name || "Unknown Student"}</h2>
            <p>{student.usn || "USN not available"}</p>

            <div className="profile-tags">
              <span>{student.branch || "N/A"}</span>
              <span>Semester {student.semester ?? "N/A"}</span>
              <span>Section {student.section || "N/A"}</span>
            </div>
          </div>

          <div className={`risk-card ${riskClass}`}>
            <small>DROPout RISK</small>
            <strong>{riskStatus}</strong>
          </div>
        </section>

        <section className="section">
          <div className="section-title">
            <div>
              <h2>🎓 Student Information</h2>
              <p>Basic academic and contact information.</p>
            </div>
          </div>

          <div className="info-grid">
            <Info label="USN" value={student.usn} />
            <Info label="Email" value={student.email} />
            <Info label="Branch" value={student.branch} />
            <Info label="Semester" value={student.semester} />
            <Info label="Section" value={student.section} />
            <Info label="Study Hours / Day" value={student.study_hours} />
          </div>
        </section>

        <section className="performance-grid">
          <PerformanceCard
            icon="📊"
            title="CGPA"
            value={
              student.cgpa !== null && student.cgpa !== undefined
                ? student.cgpa
                : "N/A"
            }
            status={cgpaStatus(student.cgpa)}
            className={
              cgpaStatus(student.cgpa) === "Good"
                ? "good"
                : cgpaStatus(student.cgpa) === "Average"
                ? "average"
                : "attention"
            }
          />

          <PerformanceCard
            icon="📅"
            title="Attendance"
            value={
              student.attendance !== null &&
              student.attendance !== undefined
                ? `${student.attendance}%`
                : "N/A"
            }
            status={attendanceStatus(student.attendance)}
            className={
              attendanceStatus(student.attendance) === "Good"
                ? "good"
                : attendanceStatus(student.attendance) === "Average"
                ? "average"
                : "attention"
            }
          />

          <PerformanceCard
            icon="📚"
            title="Backlogs"
            value={student.backlogs ?? 0}
            status={backlogStatus(student.backlogs)}
            className={
              Number(student.backlogs || 0) === 0
                ? "good"
                : Number(student.backlogs || 0) <= 2
                ? "average"
                : "attention"
            }
          />

          <PerformanceCard
            icon="⏱️"
            title="Daily Study"
            value={
              student.study_hours !== null &&
              student.study_hours !== undefined
                ? `${student.study_hours} hrs`
                : "N/A"
            }
            status="Study Hours"
            className="good"
          />
        </section>

        <section className="section">
          <div className="section-title">
            <div>
              <h2>📈 Performance Overview</h2>
              <p>Current academic indicators for this student.</p>
            </div>
          </div>

          <div className="overview-grid">
            <div className="overview-item">
              <span>CGPA</span>
              <strong>{student.cgpa ?? "N/A"}</strong>
            </div>

            <div className="overview-item">
              <span>Attendance</span>
              <strong>
                {student.attendance !== null &&
                student.attendance !== undefined
                  ? `${student.attendance}%`
                  : "N/A"}
              </strong>
            </div>

            <div className="overview-item">
              <span>Backlogs</span>
              <strong>{student.backlogs ?? 0}</strong>
            </div>

            <div className="overview-item">
              <span>Risk Status</span>
              <strong className={`risk-text ${riskClass}`}>
                {riskStatus}
              </strong>
            </div>
          </div>
        </section>

        <section className="notice">
          <div className="notice-icon">ℹ️</div>
          <div>
            <h3>Faculty Responsibilities</h3>
            <p>
              This page is for viewing the assigned student's academic
              information. Attendance is managed through the Faculty
              Attendance module. Timetable is managed through the Faculty
              Timetable module. Mentoring, counselling and intervention
              activities are handled by the Mentor.
            </p>
          </div>
        </section>

        <div className="bottom-actions">
          <button
            className="secondary-button"
            onClick={() => navigate("/faculty/students")}
          >
            👨‍🎓 My Students
          </button>

          <button
            className="primary-button"
            onClick={() => navigate("/faculty-attendance")}
          >
            📝 Manage Attendance
          </button>

          <button
            className="secondary-button"
            onClick={() => navigate("/faculty-timetable")}
          >
            📅 View Timetable
          </button>
        </div>
      </main>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="info-item">
      <span>{label}</span>
      <strong>{value ?? "N/A"}</strong>
    </div>
  );
}

function PerformanceCard({ icon, title, value, status, className }) {
  return (
    <div className={`performance-card ${className}`}>
      <div className="performance-icon">{icon}</div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{status}</small>
      </div>
    </div>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .details-page {
    min-height: 100vh;
    background: #f5f7fb;
    color: #172033;
    font-family: Arial, Helvetica, sans-serif;
  }

  .topbar {
    min-height: 72px;
    background: #fff;
    border-bottom: 1px solid #e1e6ef;
    padding: 12px 4%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
  }

  .portal {
    color: #315ee7;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1px;
  }

  .topbar h1 {
    margin: 3px 0;
    font-size: 23px;
  }

  .topbar p {
    margin: 0;
    color: #718096;
    font-size: 12px;
  }

  .top-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .top-button,
  .back-button,
  .secondary-button {
    border: 1px solid #d6deea;
    background: #fff;
    color: #29436d;
    padding: 9px 13px;
    border-radius: 7px;
    cursor: pointer;
    font-weight: 600;
  }

  .top-button:hover,
  .back-button:hover,
  .secondary-button:hover {
    background: #f4f7fb;
  }

  .logout {
    border: none;
    background: #ef3030;
    color: #fff;
    padding: 9px 15px;
    border-radius: 7px;
    cursor: pointer;
    font-weight: 700;
  }

  .main {
    max-width: 1250px;
    margin: 0 auto;
    padding: 25px 24px 50px;
  }

  .back-row {
    margin-bottom: 14px;
  }

  .back-button {
    font-size: 12px;
  }

  .profile-card {
    background: #fff;
    border: 1px solid #e0e6f0;
    border-radius: 12px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 18px;
    margin-bottom: 18px;
  }

  .avatar {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: #eaf1ff;
    color: #315ee7;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 27px;
    font-weight: 800;
  }

  .profile-info {
    flex: 1;
  }

  .profile-info h2 {
    margin: 0;
    font-size: 25px;
  }

  .profile-info p {
    margin: 5px 0 10px;
    color: #728096;
  }

  .profile-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .profile-tags span {
    background: #f0f4fa;
    color: #4d5c73;
    padding: 5px 9px;
    border-radius: 14px;
    font-size: 11px;
    font-weight: 600;
  }

  .risk-card {
    min-width: 150px;
    border-radius: 9px;
    padding: 14px;
    text-align: center;
  }

  .risk-card small {
    display: block;
    font-size: 9px;
    font-weight: 700;
    margin-bottom: 5px;
  }

  .risk-card strong {
    font-size: 15px;
  }

  .risk-card.low {
    background: #e8f7ed;
    color: #198443;
  }

  .risk-card.medium {
    background: #fff3d9;
    color: #9a6800;
  }

  .risk-card.high {
    background: #ffe8e8;
    color: #c62828;
  }

  .section {
    background: #fff;
    border: 1px solid #e0e6f0;
    border-radius: 12px;
    padding: 22px;
    margin-bottom: 18px;
  }

  .section-title h2 {
    margin: 0;
    font-size: 19px;
  }

  .section-title p {
    margin: 5px 0 17px;
    color: #7a879b;
    font-size: 12px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .info-item {
    background: #f8fafc;
    border: 1px solid #e8ecf2;
    border-radius: 8px;
    padding: 13px;
  }

  .info-item span {
    display: block;
    color: #8a95a6;
    font-size: 11px;
    margin-bottom: 5px;
  }

  .info-item strong {
    color: #263650;
    font-size: 13px;
    word-break: break-word;
  }

  .performance-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 18px;
  }

  .performance-card {
    background: #fff;
    border: 1px solid #e0e6f0;
    border-radius: 11px;
    padding: 17px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .performance-icon {
    width: 42px;
    height: 42px;
    border-radius: 9px;
    background: #eef4ff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 19px;
  }

  .performance-card span {
    display: block;
    color: #7b8799;
    font-size: 11px;
  }

  .performance-card strong {
    display: block;
    margin-top: 3px;
    font-size: 20px;
  }

  .performance-card small {
    display: block;
    margin-top: 3px;
    font-size: 10px;
    font-weight: 700;
  }

  .performance-card.good small {
    color: #198443;
  }

  .performance-card.average small {
    color: #9a6800;
  }

  .performance-card.attention small {
    color: #c62828;
  }

  .overview-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .overview-item {
    border: 1px solid #e7ebf1;
    border-radius: 8px;
    padding: 14px;
  }

  .overview-item span {
    display: block;
    color: #8994a5;
    font-size: 11px;
    margin-bottom: 6px;
  }

  .overview-item strong {
    font-size: 18px;
  }

  .risk-text.low {
    color: #198443;
  }

  .risk-text.medium {
    color: #9a6800;
  }

  .risk-text.high {
    color: #c62828;
  }

  .notice {
    background: #eef5ff;
    border: 1px solid #d6e5ff;
    border-radius: 10px;
    padding: 16px;
    display: flex;
    gap: 12px;
    margin-bottom: 18px;
  }

  .notice-icon {
    font-size: 22px;
  }

  .notice h3 {
    margin: 0;
    font-size: 14px;
    color: #254b89;
  }

  .notice p {
    margin: 5px 0 0;
    color: #536b92;
    font-size: 12px;
    line-height: 1.5;
  }

  .bottom-actions {
    display: flex;
    justify-content: flex-end;
    gap: 9px;
    flex-wrap: wrap;
  }

  .primary-button {
    border: none;
    background: #2563eb;
    color: #fff;
    padding: 10px 15px;
    border-radius: 7px;
    cursor: pointer;
    font-weight: 700;
  }

  .error-card,
  .loading-card {
    width: min(600px, calc(100% - 30px));
    margin: 100px auto;
    background: #fff;
    border: 1px solid #e0e6f0;
    border-radius: 12px;
    padding: 30px;
    text-align: center;
  }

  .error-card h2 {
    color: #c62828;
  }

  .error-card p {
    color: #718096;
    margin-bottom: 20px;
  }

  @media (max-width: 900px) {
    .topbar {
      align-items: flex-start;
      flex-direction: column;
    }

    .performance-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .info-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .overview-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .profile-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }
  }

  @media (max-width: 600px) {
    .main {
      padding: 18px 12px 40px;
    }

    .performance-grid,
    .info-grid,
    .overview-grid {
      grid-template-columns: 1fr;
    }

    .profile-card {
      flex-direction: column;
    }

    .risk-card {
      width: 100%;
    }
  }
`;

export default FacultyStudentDetails;
