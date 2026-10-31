import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function FacultyTimetable() {
  const navigate = useNavigate();

  const facultyId = localStorage.getItem("facultyId");
  const facultyName = localStorage.getItem("facultyName") || "Faculty";
  const facultyDepartment =
    localStorage.getItem("facultyDepartment") || "Computer Science";

  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDay, setSelectedDay] = useState("All Days");

  useEffect(() => {
    if (!facultyId) {
      navigate("/faculty-login");
      return;
    }

    loadTimetable();
  }, [facultyId]);

  const loadTimetable = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/attendance/faculty/${facultyId}/timetable`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load timetable.");
      }

      setTimetable(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Timetable error:", err);
      setError(err.message || "Unable to load timetable.");
    } finally {
      setLoading(false);
    }
  };

  const normalizeDay = (day) => {
    const value = String(day || "").trim().toLowerCase();

    const map = {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
    };

    return map[value] || day || "Not Assigned";
  };

  const formatTime = (time) => {
    if (!time) return "N/A";

    const value = String(time).substring(0, 5);
    const [hours, minutes] = value.split(":");

    if (hours === undefined || minutes === undefined) return value;

    let hour = Number(hours);
    const suffix = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${hour}:${minutes} ${suffix}`;
  };

  const days = useMemo(() => {
    const order = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    return order.filter((day) =>
      timetable.some((item) => normalizeDay(item.day_of_week) === day)
    );
  }, [timetable]);

  const filteredTimetable = useMemo(() => {
    if (selectedDay === "All Days") return timetable;

    return timetable.filter(
      (item) => normalizeDay(item.day_of_week) === selectedDay
    );
  }, [timetable, selectedDay]);

  const groupedTimetable = useMemo(() => {
    const groups = {};

    filteredTimetable.forEach((item) => {
      const day = normalizeDay(item.day_of_week);

      if (!groups[day]) groups[day] = [];
      groups[day].push(item);
    });

    const order = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    return Object.keys(groups)
      .sort((a, b) => {
        const ai = order.indexOf(a);
        const bi = order.indexOf(b);

        if (ai === -1 && bi === -1) return a.localeCompare(b);
        if (ai === -1) return 1;
        if (bi === -1) return -1;

        return ai - bi;
      })
      .map((day) => ({
        day,
        classes: [...groups[day]].sort((a, b) =>
          String(a.start_time || "").localeCompare(
            String(b.start_time || "")
          )
        ),
      }));
  }, [filteredTimetable]);

  const totalClasses = timetable.length;

  const labCount = timetable.filter((item) =>
    String(item.class_type || "").toLowerCase().includes("lab")
  ).length;

  const theoryCount = totalClasses - labCount;

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

  return (
    <div className="faculty-timetable-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .faculty-timetable-page {
          min-height: 100vh;
          background: #f5f7fb;
          color: #172033;
          font-family: Arial, Helvetica, sans-serif;
        }

        .topbar {
          min-height: 72px;
          background: #fff;
          border-bottom: 1px solid #e1e6ef;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 4%;
          gap: 20px;
        }

        .portal {
          color: #315ee7;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .top-title {
          margin: 2px 0;
          font-size: 23px;
          font-weight: 800;
        }

        .top-subtitle {
          margin: 0;
          color: #718096;
          font-size: 12px;
        }

        .top-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .top-button {
          border: 1px solid #d8dfeb;
          background: #fff;
          color: #24406e;
          padding: 8px 12px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }

        .top-button:hover {
          background: #f3f6fb;
        }

        .logout {
          background: #ef3030;
          border-color: #ef3030;
          color: #fff;
        }

        .main {
          max-width: 1280px;
          margin: 0 auto;
          padding: 25px 24px 50px;
        }

        .page-heading {
          margin-bottom: 18px;
        }

        .page-heading h2 {
          margin: 0;
          font-size: 27px;
        }

        .page-heading p {
          margin: 6px 0 0;
          color: #718096;
          font-size: 13px;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 18px;
        }

        .stat {
          background: #fff;
          border: 1px solid #e0e6f0;
          border-radius: 11px;
          padding: 17px;
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .stat-icon {
          width: 43px;
          height: 43px;
          border-radius: 9px;
          background: #eef4ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .stat-value {
          font-size: 23px;
          font-weight: 800;
        }

        .stat-label {
          color: #778399;
          font-size: 12px;
          margin-top: 2px;
        }

        .filter-card {
          background: #fff;
          border: 1px solid #e0e6f0;
          border-radius: 11px;
          padding: 17px;
          margin-bottom: 18px;
        }

        .filter-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
        }

        .filter-label {
          font-weight: 700;
          font-size: 14px;
        }

        .day-buttons {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .day-button {
          border: 1px solid #d6deea;
          background: #fff;
          color: #4a5a72;
          border-radius: 7px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }

        .day-button.active {
          background: #2563eb;
          color: #fff;
          border-color: #2563eb;
        }

        .schedule-card {
          background: #fff;
          border: 1px solid #e0e6f0;
          border-radius: 11px;
          overflow: hidden;
          margin-bottom: 18px;
        }

        .day-header {
          background: #f7f9fd;
          border-bottom: 1px solid #e5e9f0;
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .day-header h3 {
          margin: 0;
          font-size: 17px;
        }

        .class-count {
          background: #eaf1ff;
          color: #315ee7;
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 11px;
          font-weight: 700;
        }

        .class-list {
          padding: 10px 15px;
        }

        .class-row {
          display: grid;
          grid-template-columns: 150px 1fr 150px 130px 130px;
          gap: 15px;
          align-items: center;
          padding: 15px 8px;
          border-bottom: 1px solid #edf0f4;
        }

        .class-row:last-child {
          border-bottom: none;
        }

        .time {
          color: #315ee7;
          font-weight: 800;
          font-size: 13px;
        }

        .subject {
          font-weight: 800;
          font-size: 14px;
          color: #202d43;
        }

        .class-name {
          margin-top: 3px;
          color: #7b8799;
          font-size: 11px;
        }

        .info {
          color: #4d5b70;
          font-size: 12px;
        }

        .info-label {
          color: #8994a5;
          font-size: 10px;
          display: block;
          margin-bottom: 2px;
        }

        .type-badge {
          display: inline-block;
          background: #eef4ff;
          color: #315ee7;
          padding: 5px 9px;
          border-radius: 13px;
          font-size: 10px;
          font-weight: 700;
        }

        .lab-badge {
          background: #fff3df;
          color: #a56200;
        }

        .empty {
          background: #fff;
          border: 1px solid #e0e6f0;
          border-radius: 11px;
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          padding: 30px;
        }

        .empty-icon {
          font-size: 42px;
          margin-bottom: 8px;
        }

        .empty h3 {
          margin: 0;
          font-size: 19px;
        }

        .empty p {
          color: #78859a;
          font-size: 13px;
        }

        .error {
          background: #fff0f0;
          color: #c62828;
          border: 1px solid #ffd0d0;
          border-radius: 8px;
          padding: 12px 15px;
          margin-bottom: 15px;
          font-size: 13px;
          font-weight: 600;
        }

        .refresh-button {
          border: none;
          background: #2563eb;
          color: #fff;
          padding: 8px 13px;
          border-radius: 7px;
          cursor: pointer;
          font-weight: 700;
          font-size: 12px;
        }

        .heading-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 15px;
        }

        @media (max-width: 900px) {
          .stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .class-row {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .topbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .stats {
            grid-template-columns: 1fr 1fr;
          }

          .filter-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .heading-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .class-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }
        }
      `}</style>

      <header className="topbar">
        <div>
          <div className="portal">🎓 FACULTY PORTAL</div>
          <h1 className="top-title">📅 Timetable</h1>
          <p className="top-subtitle">
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

          <button className="top-button logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="main">
        <div className="heading-row">
          <div className="page-heading">
            <h2>My Timetable</h2>
            <p>
              View the timetable assigned to your faculty account.
            </p>
          </div>

          <button className="refresh-button" onClick={loadTimetable}>
            🔄 Refresh
          </button>
        </div>

        {error && <div className="error">❌ {error}</div>}

        {loading ? (
          <div className="empty">
            <div className="empty-icon">⏳</div>
            <h3>Loading timetable...</h3>
          </div>
        ) : (
          <>
            <section className="stats">
              <div className="stat">
                <div className="stat-icon">📅</div>
                <div>
                  <div className="stat-value">{totalClasses}</div>
                  <div className="stat-label">Total Classes</div>
                </div>
              </div>

              <div className="stat">
                <div className="stat-icon">📚</div>
                <div>
                  <div className="stat-value">{theoryCount}</div>
                  <div className="stat-label">Theory Classes</div>
                </div>
              </div>

              <div className="stat">
                <div className="stat-icon">💻</div>
                <div>
                  <div className="stat-value">{labCount}</div>
                  <div className="stat-label">Lab Classes</div>
                </div>
              </div>

              <div className="stat">
                <div className="stat-icon">🗓️</div>
                <div>
                  <div className="stat-value">{days.length}</div>
                  <div className="stat-label">Teaching Days</div>
                </div>
              </div>
            </section>

            {timetable.length > 0 && (
              <section className="filter-card">
                <div className="filter-row">
                  <div className="filter-label">
                    Filter by Day
                  </div>

                  <div className="day-buttons">
                    <button
                      className={`day-button ${
                        selectedDay === "All Days" ? "active" : ""
                      }`}
                      onClick={() => setSelectedDay("All Days")}
                    >
                      All Days
                    </button>

                    {days.map((day) => (
                      <button
                        key={day}
                        className={`day-button ${
                          selectedDay === day ? "active" : ""
                        }`}
                        onClick={() => setSelectedDay(day)}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {groupedTimetable.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">📅</div>
                <h3>No timetable available</h3>
                <p>
                  No timetable has been assigned to this faculty account yet.
                </p>
              </div>
            ) : (
              groupedTimetable.map((group) => (
                <section className="schedule-card" key={group.day}>
                  <div className="day-header">
                    <h3>📅 {group.day}</h3>
                    <span className="class-count">
                      {group.classes.length}{" "}
                      {group.classes.length === 1 ? "Class" : "Classes"}
                    </span>
                  </div>

                  <div className="class-list">
                    {group.classes.map((item) => {
                      const classType = String(
                        item.class_type || "Theory"
                      );

                      const isLab = classType
                        .toLowerCase()
                        .includes("lab");

                      return (
                        <div
                          className="class-row"
                          key={item.id}
                        >
                          <div>
                            <div className="time">
                              {formatTime(item.start_time)}
                              {" - "}
                              {formatTime(item.end_time)}
                            </div>
                          </div>

                          <div>
                            <div className="subject">
                              {item.subject || "Subject Not Assigned"}
                            </div>
                            <div className="class-name">
                              {item.class_name || "Class Not Assigned"}
                            </div>
                          </div>

                          <div className="info">
                            <span className="info-label">
                              CLASS TYPE
                            </span>
                            <span
                              className={`type-badge ${
                                isLab ? "lab-badge" : ""
                              }`}
                            >
                              {classType}
                            </span>
                          </div>

                          <div className="info">
                            <span className="info-label">
                              ROOM
                            </span>
                            {item.room_no || "Not Assigned"}
                          </div>

                          <div className="info">
                            <span className="info-label">
                              ACTION
                            </span>
                            <button
                              className="top-button"
                              onClick={() =>
                                navigate(
                                  `/faculty-attendance?tt=${item.id}`
                                )
                              }
                            >
                              📝 Attendance
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default FacultyTimetable;
