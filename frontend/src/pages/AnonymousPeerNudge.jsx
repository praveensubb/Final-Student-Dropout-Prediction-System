import React, { useEffect, useState } from "react";


import {
  Users,
  TrendingUp,
  GraduationCap,
  Clock,
  AlertTriangle,
  Lightbulb,
  LockKeyhole,
} from "lucide-react";
import "./AnonymousPeerNudge.css";

function AnonymousPeerNudge({ studentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // GET STUDENT ID
  // =========================================================

  const getStudentId = () => {
    if (studentId) {
      return studentId;
    }

    // Try common localStorage keys
    const storedId =
      localStorage.getItem("student_id") ||
      localStorage.getItem("studentId") ||
      localStorage.getItem("user_id") ||
      localStorage.getItem("userId");

    return storedId;
  };

  // =========================================================
  // FETCH PEER DATA
  // =========================================================

  useEffect(() => {
    const fetchPeerNudge = async () => {
      try {
        setLoading(true);
        setError("");

        const id = getStudentId();

        if (!id) {
          setError(
            "Student ID not found. Please login again."
          );
          setLoading(false);
          return;
        }

        console.log("Fetching peer nudge for student:", id);

        const response = await fetch(
          `http://127.0.0.1:8000/peer-nudge/${id}`
        );

        if (!response.ok) {
          const errorText = await response.text();

          throw new Error(
            `API Error ${response.status}: ${errorText}`
          );
        }

        const result = await response.json();

        console.log("Peer Nudge API Response:", result);

        setData(result);
      } catch (err) {
        console.error("Peer Nudge Error:", err);

        setError(
          err.message || "Unable to load peer comparison."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPeerNudge();
  }, [studentId]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="peer-nudge-page">
        <div className="loading-card">
          <h2>Loading Anonymous Peer Nudge...</h2>
          <p>
            Comparing your academic pattern with anonymous peers.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="peer-nudge-page">
        <div className="error-card">
          <AlertTriangle size={28} />

          <h2>Unable to load peer comparison</h2>

          <p>{error}</p>

          <button
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // SAFE DATA
  // =========================================================

  const comparison = data?.comparison;

  const cgpa = comparison?.cgpa;
  const attendance = comparison?.attendance;
  const studyHours = comparison?.study_hours;
  const backlogs = comparison?.backlogs;

  // =========================================================
  // FORMAT HELPERS
  // =========================================================

  const formatNumber = (value, digits = 1) => {
    if (value === null || value === undefined) {
      return "--";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return "--";
    }

    return number.toFixed(digits);
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="peer-nudge-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="page-header">

        <div>
          <h1>
            Anonymous Peer Nudge
          </h1>

          <p>
            Compare your academic pattern with similar
            students anonymously.
          </p>
        </div>

        <div className="peer-count-card">

          <Users size={28} />

          <strong>
            {data?.peer_count ?? 0}
          </strong>

          <span>
            Anonymous Peers
          </span>

        </div>

      </div>


      {/* =====================================================
          PRIVACY
      ===================================================== */}

      <div className="privacy-box">

        <LockKeyhole size={22} />

        <div>

          <h3>
            Your privacy is protected
          </h3>

          <p>
            No peer names, USNs, emails or personal information
            are displayed. Only anonymous aggregate statistics
            are used.
          </p>

        </div>

      </div>


      {/* =====================================================
          COMPARISON GRID
      ===================================================== */}

      <div className="comparison-grid">


        {/* ===================================================
            CGPA
        =================================================== */}

        <div className="metric-card">

          <TrendingUp size={24} />

          <h3>
            CGPA
          </h3>

          <div className="comparison-card">

            {/* YOU */}

            <div className="comparison-item">

              <span>
                You
              </span>

              <strong>
                {formatNumber(
                  cgpa?.student,
                  1
                )}
              </strong>

            </div>


            {/* HIGHEST PEER */}

            <div className="comparison-item">

              <span>
                Highest Peer CGPA
              </span>

              <strong>
                {formatNumber(
                  cgpa?.highest_peer,
                  1
                )}
              </strong>

            </div>

          </div>

        </div>


        {/* ===================================================
            ATTENDANCE
        =================================================== */}

        <div className="metric-card">

          <GraduationCap size={24} />

          <h3>
            Attendance
          </h3>

          <div className="comparison-card">

            {/* YOU */}

            <div className="comparison-item">

              <span>
                You
              </span>

              <strong>
                {attendance?.student !== null &&
                attendance?.student !== undefined
                  ? `${formatNumber(
                      attendance.student,
                      0
                    )}%`
                  : "--"}
              </strong>

            </div>


            {/* PEER */}

            <div className="comparison-item">

              <span>
                Peer Average
              </span>

              <strong>
                {attendance?.peer_average !== null &&
                attendance?.peer_average !== undefined
                  ? `${formatNumber(
                      attendance.peer_average,
                      1
                    )}%`
                  : "--"}
              </strong>

            </div>

          </div>

        </div>


        {/* ===================================================
            STUDY HOURS
        =================================================== */}

        <div className="metric-card">

          <Clock size={24} />

          <h3>
            Study Hours
          </h3>

          <div className="comparison-card">

            {/* YOU */}

            <div className="comparison-item">

              <span>
                You
              </span>

              <strong>
                {studyHours?.student !== null &&
                studyHours?.student !== undefined
                  ? `${formatNumber(
                      studyHours.student,
                      1
                    )} hrs`
                  : "--"}
              </strong>

            </div>


            {/* PEER */}

            <div className="comparison-item">

              <span>
                Peer Average
              </span>

              <strong>
                {studyHours?.peer_average !== null &&
                studyHours?.peer_average !== undefined
                  ? `${formatNumber(
                      studyHours.peer_average,
                      1
                    )} hrs`
                  : "--"}
              </strong>

            </div>

          </div>

        </div>


        {/* ===================================================
            BACKLOGS
        =================================================== */}

        <div className="metric-card">

          <AlertTriangle size={24} />

          <h3>
            Backlogs
          </h3>

          <div className="comparison-card">

            {/* YOU */}

            <div className="comparison-item">

              <span>
                You
              </span>

              <strong>
                {backlogs?.student ?? "--"}
              </strong>

            </div>


            {/* PEER */}

            <div className="comparison-item">

              <span>
                Peer Average
              </span>

              <strong>
                {backlogs?.peer_average !== null &&
                backlogs?.peer_average !== undefined
                  ? formatNumber(
                      backlogs.peer_average,
                      1
                    )
                  : "--"}
              </strong>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          NUDGE
      ===================================================== */}

      <div className="nudge-section">

        <div className="nudge-title">

          <Lightbulb size={24} />

          <div>

            <h2>
              Your Anonymous Peer Nudge
            </h2>

            <p>
              Small observations that may help improve
              your academic habits.
            </p>

          </div>

        </div>


        <div className="nudge-message">

          <Lightbulb size={20} />

          <div>

            {data?.nudges &&
            data.nudges.length > 0 ? (

              data.nudges.map(
                (nudge, index) => (
                  <p key={index}>
                    {nudge}
                  </p>
                )
              )

            ) : (

              <p>
                No peer comparison available.
              </p>

            )}

          </div>

        </div>

      </div>


      {/* =====================================================
          KEEP IMPROVING
      ===================================================== */}

      <div className="improve-section">

        <h2>
          Keep Improving
        </h2>

        <p>
          Peer comparison is only a reference point.
          Your goal is not to compete with other students,
          but to identify areas where you can improve.
        </p>

        <button>
          Review My Study Habits
        </button>

      </div>

    </div>
  );
}

export default AnonymousPeerNudge;