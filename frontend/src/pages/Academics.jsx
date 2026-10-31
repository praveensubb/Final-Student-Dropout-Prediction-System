import React, { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

function Academics() {
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");

    if (!studentId) {
      setError("Student is not logged in.");
      return;
    }

    api
      .get(`/students/${studentId}`)
      .then((response) => {
        setStudent(response.data);
      })
      .catch((error) => {
        console.error(error);
        setError("Unable to load academic data.");
      });
  }, []);

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div>
        <Sidebar />

        <main style={styles.main}>
          <div style={styles.card}>
            <h2>{error}</h2>
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (!student) {
    return (
      <div>
        <Sidebar />

        <main style={styles.main}>
          <div style={styles.card}>
            <h2>Loading academic data...</h2>
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // ACADEMICS PAGE
  // =====================================================

  return (
    <div>
      <Sidebar />

      <main style={styles.main}>

        {/* =================================================
            HEADER
        ================================================= */}

        <div style={styles.header}>
          <h1>Academic Performance</h1>

          <p>
            {student.name} | {student.usn}
          </p>
        </div>

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div style={styles.grid}>

          {/* CGPA */}

          <div style={styles.statCard}>
            <h3>CGPA</h3>

            <div style={styles.value}>
              {student.cgpa}
            </div>

            <p>Out of 10</p>
          </div>

          {/* ATTENDANCE */}

          <div style={styles.statCard}>
            <h3>Attendance</h3>

            <div style={styles.value}>
              {student.attendance}%
            </div>

            <p>Overall attendance</p>
          </div>

          {/* BACKLOGS */}

          <div style={styles.statCard}>
            <h3>Backlogs</h3>

            <div style={styles.value}>
              {student.backlogs}
            </div>

            <p>Current backlogs</p>
          </div>

          {/* STUDY HOURS */}

          <div style={styles.statCard}>
            <h3>Study Hours</h3>

            <div style={styles.value}>
              {student.study_hours}
            </div>

            <p>Hours per day</p>
          </div>

        </div>

        {/* =================================================
            ACADEMIC INFORMATION
        ================================================= */}

        <div style={styles.card}>

          <h2>Academic Information</h2>

          <table style={styles.table}>

            <tbody>

              {/* NAME */}

              <tr>
                <td style={styles.label}>
                  <strong>Name</strong>
                </td>

                <td style={styles.data}>
                  {student.name}
                </td>
              </tr>

              {/* USN */}

              <tr>
                <td style={styles.label}>
                  <strong>USN</strong>
                </td>

                <td style={styles.data}>
                  {student.usn}
                </td>
              </tr>

              {/* EMAIL */}

              <tr>
                <td style={styles.label}>
                  <strong>Email</strong>
                </td>

                <td style={styles.data}>
                  {student.email}
                </td>
              </tr>

              {/* BRANCH */}

              <tr>
                <td style={styles.label}>
                  <strong>Branch</strong>
                </td>

                <td style={styles.data}>
                  {student.branch}
                </td>
              </tr>

              {/* SEMESTER */}

              <tr>
                <td style={styles.label}>
                  <strong>Semester</strong>
                </td>

                <td style={styles.data}>
                  {student.semester}
                </td>
              </tr>

              {/* =================================================
                  NEW SECTION FIELD
              ================================================= */}

              <tr>
                <td style={styles.label}>
                  <strong>Section</strong>
                </td>

                <td style={styles.data}>
                  {student.section || "Not Assigned"}
                </td>
              </tr>

              {/* CGPA */}

              <tr>
                <td style={styles.label}>
                  <strong>CGPA</strong>
                </td>

                <td style={styles.data}>
                  {student.cgpa}
                </td>
              </tr>

              {/* ATTENDANCE */}

              <tr>
                <td style={styles.label}>
                  <strong>Attendance</strong>
                </td>

                <td style={styles.data}>
                  {student.attendance}%
                </td>
              </tr>

              {/* BACKLOGS */}

              <tr>
                <td style={styles.label}>
                  <strong>Backlogs</strong>
                </td>

                <td style={styles.data}>
                  {student.backlogs}
                </td>
              </tr>

              {/* STUDY HOURS */}

              <tr>
                <td style={styles.label}>
                  <strong>Study Hours</strong>
                </td>

                <td style={styles.data}>
                  {student.study_hours} hours/day
                </td>
              </tr>

            </tbody>

          </table>

        </div>

        {/* =================================================
            SECTION INFORMATION CARD
        ================================================= */}

        <div style={styles.card}>

          <h2>Class Information</h2>

          <div style={styles.classInfo}>

            <div style={styles.classBox}>

              <span style={styles.classLabel}>
                Section
              </span>

              <span style={styles.sectionValue}>
                {student.section || "Not Assigned"}
              </span>

            </div>

            <div style={styles.classBox}>

              <span style={styles.classLabel}>
                Semester
              </span>

              <span style={styles.classValue}>
                {student.semester}
              </span>

            </div>

            <div style={styles.classBox}>

              <span style={styles.classLabel}>
                Branch
              </span>

              <span style={styles.classValue}>
                {student.branch}
              </span>

            </div>

          </div>

        </div>

        {/* =================================================
            ACADEMIC STATUS
        ================================================= */}

        <div style={styles.card}>

          <h2>Academic Status</h2>

          {student.cgpa >= 7.5 &&
          student.attendance >= 75 ? (

            <div style={styles.good}>
              Good academic performance
            </div>

          ) : student.cgpa >= 6 &&
            student.attendance >= 65 ? (

            <div style={styles.average}>
              Average academic performance —
              improvement recommended
            </div>

          ) : (

            <div style={styles.warning}>
              Academic attention required
            </div>

          )}

        </div>

      </main>
    </div>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = {

  main: {
    marginLeft: "240px",
    padding: "40px",
    background: "#f5f7fb",
    minHeight: "100vh",
    boxSizing: "border-box",
  },

  header: {
    background: "white",
    padding: "30px",
    borderRadius: "15px",
    marginBottom: "25px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginBottom: "25px",
  },

  statCard: {
    background: "white",
    padding: "25px",
    borderRadius: "15px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
  },

  value: {
    fontSize: "32px",
    fontWeight: "bold",
    marginTop: "10px",
  },

  card: {
    background: "white",
    padding: "30px",
    borderRadius: "15px",
    marginBottom: "25px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },

  label: {
    padding: "14px 10px",
    borderBottom: "1px solid #e5e7eb",
    width: "40%",
  },

  data: {
    padding: "14px 10px",
    borderBottom: "1px solid #e5e7eb",
  },

  // =====================================================
  // CLASS INFORMATION
  // =====================================================

  classInfo: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginTop: "20px",
  },

  classBox: {
    background: "#f5f7fb",
    padding: "22px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  classLabel: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: "600",
  },

  sectionValue: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#2563eb",
  },

  classValue: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#111827",
  },

  // =====================================================
  // ACADEMIC STATUS
  // =====================================================

  good: {
    padding: "15px",
    background: "#dcfce7",
    color: "#166534",
    borderRadius: "8px",
    fontWeight: "bold",
  },

  average: {
    padding: "15px",
    background: "#fef3c7",
    color: "#92400e",
    borderRadius: "8px",
    fontWeight: "bold",
  },

  warning: {
    padding: "15px",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "8px",
    fontWeight: "bold",
  },
};

export default Academics;