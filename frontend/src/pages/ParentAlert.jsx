import React, { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function ParentAlert() {
    const [students, setStudents] = useState([]);
    const [alerts, setAlerts] = useState([]);

    const [selectedStudent, setSelectedStudent] = useState("");
    const [alertType, setAlertType] = useState("Attendance");
    const [priority, setPriority] = useState("Medium");
    const [message, setMessage] = useState("");
    const [followUpDate, setFollowUpDate] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const facultyId = localStorage.getItem("facultyId");

    useEffect(() => {
        if (!facultyId) {
            setError("Faculty session not found. Please login again.");
            setLoading(false);
            return;
        }

        loadData();
    }, [facultyId]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const studentsResponse = await fetch(
                `${API_URL}/faculty/${facultyId}/students`
            );

            if (!studentsResponse.ok) {
                const data = await studentsResponse.json().catch(() => ({}));
                throw new Error(
                    data.detail || "Failed to load assigned students"
                );
            }

            const studentsData = await studentsResponse.json();

            setStudents(
                Array.isArray(studentsData) ? studentsData : []
            );

            const activitiesResponse = await fetch(
                `${API_URL}/activities/faculty/${facultyId}`
            );

            if (activitiesResponse.ok) {
                const activitiesData = await activitiesResponse.json();

                const parentAlerts = Array.isArray(activitiesData)
                    ? activitiesData.filter(
                          (item) =>
                              item.activity_type === "Parent Alert"
                      )
                    : [];

                setAlerts(parentAlerts);
            } else {
                setAlerts([]);
            }
        } catch (err) {
            console.error("PARENT ALERT LOAD ERROR:", err);
            setError(
                err.message || "Unable to load parent alert data."
            );
        } finally {
            setLoading(false);
        }
    };

    // Get complete student information, including parent details.
    const getCompleteStudent = async (student) => {
        if (!student) {
            return null;
        }

        // If parent details are already returned, use them.
        if (student.parent_mobile) {
            return student;
        }

        // Otherwise get the complete student record.
        const response = await fetch(
            `${API_URL}/students/${student.id}`
        );

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(
                data.detail || "Unable to get student parent details."
            );
        }

        return await response.json();
    };

    const normalizeIndianMobile = (value) => {
        let mobile = String(value || "")
            .trim()
            .replace(/\s+/g, "")
            .replace(/-/g, "");

        if (mobile.startsWith("+91")) {
            mobile = mobile.substring(3);
        } else if (
            mobile.startsWith("91") &&
            mobile.length === 12
        ) {
            mobile = mobile.substring(2);
        }

        if (!/^[6-9]\d{9}$/.test(mobile)) {
            return null;
        }

        return mobile;
    };

    const openWhatsApp = (student) => {
        const mobile = normalizeIndianMobile(
            student.parent_mobile
        );

        if (!mobile) {
            throw new Error(
                "Invalid parent mobile number. Please update the student's parent mobile number."
            );
        }

        const parentName =
            student.parent_name || "Parent/Guardian";

        const whatsappMessage = [
            "🔔 Student Parent Alert",
            "",
            `Dear ${parentName},`,
            "",
            `Your ward ${student.name} (${student.usn}) has received an alert from the Student Dropout Prediction System.`,
            "",
            `Alert Type: ${alertType}`,
            `Priority: ${priority}`,
            `Message: ${message.trim()}`,
            `Follow-up Date: ${
                followUpDate || "Not specified"
            }`,
            "",
            "Please contact the concerned faculty for more information.",
        ].join("\n");

        const whatsappUrl =
            `https://wa.me/91${mobile}?text=` +
            encodeURIComponent(whatsappMessage);

        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!facultyId) {
            setError("Faculty session not found. Please login again.");
            return;
        }

        if (!selectedStudent) {
            setError("Please select a student.");
            return;
        }

        if (!message.trim()) {
            setError("Please enter an alert message.");
            return;
        }

        try {
            setSaving(true);

            const selected = students.find(
                (item) =>
                    String(item.id) === String(selectedStudent)
            );

            if (!selected) {
                throw new Error("Selected student was not found.");
            }

            // Get parent mobile/name from backend.
            const student = await getCompleteStudent(selected);

            if (!student.parent_mobile) {
                throw new Error(
                    "Parent mobile number is not registered for this student."
                );
            }

            const description = [
                `Alert Type: ${alertType}`,
                `Priority: ${priority}`,
                `Message: ${message.trim()}`,
                `Follow-up Date: ${
                    followUpDate || "Not specified"
                }`,
            ].join("\n");

            const params = new URLSearchParams();

            params.append("faculty_id", facultyId);
            params.append("activity_type", "Parent Alert");
            params.append(
                "activity_title",
                `Parent Alert - ${alertType}`
            );
            params.append("description", description);
            params.append("student_id", String(selectedStudent));

            const response = await fetch(
                `${API_URL}/activities/?${params.toString()}`,
                {
                    method: "POST",
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.detail || "Failed to save parent alert."
                );
            }

            setSuccess(
                `Parent alert saved for ${student.name}. Opening WhatsApp...`
            );

            // Open WhatsApp after the alert is successfully saved.
            openWhatsApp(student);

            setSelectedStudent("");
            setAlertType("Attendance");
            setPriority("Medium");
            setMessage("");
            setFollowUpDate("");

            await loadData();
        } catch (err) {
            console.error("PARENT ALERT SAVE ERROR:", err);

            setError(
                err.message || "Failed to save parent alert."
            );
        } finally {
            setSaving(false);
        }
    };

    const getStudentName = (studentId) => {
        const student = students.find(
            (item) => String(item.id) === String(studentId)
        );

        return student
            ? `${student.name} (${student.usn})`
            : `Student ID: ${studentId}`;
    };

    const getField = (description, field) => {
        if (!description) {
            return "";
        }

        const line = description
            .split("\n")
            .find((item) =>
                item.startsWith(`${field}:`)
            );

        return line
            ? line.substring(field.length + 1).trim()
            : "";
    };

    const getPriorityClass = (value) => {
        if (value === "High") {
            return "priority-high";
        }

        if (value === "Low") {
            return "priority-low";
        }

        return "priority-medium";
    };

    return (
        <div className="parent-alert-page">
            <style>{`
                * {
                    box-sizing: border-box;
                }

                .parent-alert-page {
                    min-height: 100vh;
                    padding: 30px;
                    background: #f4f7fb;
                    font-family: Arial, sans-serif;
                    color: #1f2937;
                }

                .parent-alert-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .parent-alert-header,
                .alert-form-card,
                .alerts-card {
                    background: white;
                    border-radius: 16px;
                    padding: 25px;
                    margin-bottom: 25px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
                }

                .parent-alert-header h1 {
                    margin: 0 0 8px;
                    font-size: 28px;
                }

                .parent-alert-header p {
                    margin: 0;
                    color: #6b7280;
                }

                .alert-form-card h2,
                .alerts-card h2 {
                    margin-top: 0;
                    margin-bottom: 20px;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 18px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                }

                .form-group.full-width {
                    grid-column: 1 / -1;
                }

                .form-group label {
                    font-weight: 600;
                    margin-bottom: 7px;
                    font-size: 14px;
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 9px;
                    font-size: 14px;
                    outline: none;
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    border-color: #2563eb;
                }

                .form-group textarea {
                    min-height: 120px;
                    resize: vertical;
                }

                .parent-mobile-info {
                    margin-top: 6px;
                    color: #6b7280;
                    font-size: 13px;
                }

                .save-button {
                    margin-top: 20px;
                    padding: 13px 24px;
                    border: none;
                    border-radius: 9px;
                    background: #2563eb;
                    color: white;
                    font-weight: 600;
                    font-size: 15px;
                    cursor: pointer;
                }

                .save-button:hover {
                    background: #1d4ed8;
                }

                .save-button:disabled {
                    background: #9ca3af;
                    cursor: not-allowed;
                }

                .whatsapp-note {
                    margin-top: 10px;
                    color: #6b7280;
                    font-size: 13px;
                }

                .message-success,
                .message-error {
                    margin-bottom: 18px;
                    padding: 12px 15px;
                    border-radius: 8px;
                }

                .message-success {
                    background: #dcfce7;
                    color: #166534;
                }

                .message-error {
                    background: #fee2e2;
                    color: #991b1b;
                }

                .alert-item {
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 18px;
                    margin-top: 15px;
                }

                .alert-item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 10px;
                }

                .alert-student {
                    font-weight: 700;
                    font-size: 16px;
                }

                .alert-title {
                    color: #4b5563;
                    margin-top: 4px;
                }

                .priority {
                    padding: 5px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                }

                .priority-high {
                    background: #fee2e2;
                    color: #b91c1c;
                }

                .priority-medium {
                    background: #fef3c7;
                    color: #92400e;
                }

                .priority-low {
                    background: #dcfce7;
                    color: #166534;
                }

                .alert-description {
                    white-space: pre-line;
                    color: #4b5563;
                    line-height: 1.6;
                    margin-top: 10px;
                }

                .alert-date {
                    margin-top: 10px;
                    color: #6b7280;
                    font-size: 13px;
                }

                .empty-state,
                .loading {
                    padding: 30px;
                    text-align: center;
                    color: #6b7280;
                }

                @media (max-width: 700px) {
                    .parent-alert-page {
                        padding: 15px;
                    }

                    .form-grid {
                        grid-template-columns: 1fr;
                    }

                    .form-group.full-width {
                        grid-column: auto;
                    }

                    .alert-item-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                }
            `}</style>

            <div className="parent-alert-container">
                <div className="parent-alert-header">
                    <h1>🔔 Parent Alerts</h1>
                    <p>
                        Record and track parent alerts for students
                        assigned to you.
                    </p>
                </div>

                {loading ? (
                    <div className="loading">
                        Loading parent alert data...
                    </div>
                ) : (
                    <>
                        <div className="alert-form-card">
                            <h2>Create Parent Alert</h2>

                            {error && (
                                <div className="message-error">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="message-success">
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>
                                            Select Student
                                        </label>

                                        <select
                                            value={selectedStudent}
                                            onChange={(e) =>
                                                setSelectedStudent(
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">
                                                -- Select Student --
                                            </option>

                                            {students.map((student) => (
                                                <option
                                                    key={student.id}
                                                    value={student.id}
                                                >
                                                    {student.name} -{" "}
                                                    {student.usn}
                                                </option>
                                            ))}
                                        </select>

                                        {selectedStudent &&
                                            (() => {
                                                const selected =
                                                    students.find(
                                                        (student) =>
                                                            String(
                                                                student.id
                                                            ) ===
                                                            String(
                                                                selectedStudent
                                                            )
                                                    );

                                                return selected?.parent_mobile ? (
                                                    <div className="parent-mobile-info">
                                                        Parent Mobile:{" "}
                                                        {
                                                            selected.parent_mobile
                                                        }
                                                    </div>
                                                ) : (
                                                    <div className="parent-mobile-info">
                                                        Parent mobile will be
                                                        loaded when sending.
                                                    </div>
                                                );
                                            })()}
                                    </div>

                                    <div className="form-group">
                                        <label>Alert Type</label>

                                        <select
                                            value={alertType}
                                            onChange={(e) =>
                                                setAlertType(
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="Attendance">
                                                Attendance
                                            </option>
                                            <option value="Academic">
                                                Academic
                                            </option>
                                            <option value="Behavior">
                                                Behavior
                                            </option>
                                            <option value="Financial">
                                                Financial
                                            </option>
                                            <option value="Risk">
                                                Dropout Risk
                                            </option>
                                            <option value="General">
                                                General
                                            </option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Priority</label>

                                        <select
                                            value={priority}
                                            onChange={(e) =>
                                                setPriority(
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="Low">
                                                Low
                                            </option>
                                            <option value="Medium">
                                                Medium
                                            </option>
                                            <option value="High">
                                                High
                                            </option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Follow-up Date</label>

                                        <input
                                            type="date"
                                            value={followUpDate}
                                            onChange={(e) =>
                                                setFollowUpDate(
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>
                                            Alert Message
                                        </label>

                                        <textarea
                                            value={message}
                                            onChange={(e) =>
                                                setMessage(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter the message or reason for contacting the parent..."
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="save-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : "🔔 Save & Open WhatsApp"}
                                </button>

                                <div className="whatsapp-note">
                                    WhatsApp will open with the message
                                    ready. The faculty must press Send
                                    in WhatsApp.
                                </div>
                            </form>
                        </div>

                        <div className="alerts-card">
                            <h2>Parent Alert History</h2>

                            {alerts.length === 0 ? (
                                <div className="empty-state">
                                    No parent alerts recorded yet.
                                </div>
                            ) : (
                                alerts.map((alert) => {
                                    const alertPriority =
                                        getField(
                                            alert.description,
                                            "Priority"
                                        ) || "Medium";

                                    return (
                                        <div
                                            className="alert-item"
                                            key={alert.id}
                                        >
                                            <div className="alert-item-header">
                                                <div>
                                                    <div className="alert-student">
                                                        👨‍🎓{" "}
                                                        {getStudentName(
                                                            alert.student_id
                                                        )}
                                                    </div>

                                                    <div className="alert-title">
                                                        {
                                                            alert.activity_title
                                                        }
                                                    </div>
                                                </div>

                                                <span
                                                    className={`priority ${getPriorityClass(
                                                        alertPriority
                                                    )}`}
                                                >
                                                    {alertPriority}
                                                </span>
                                            </div>

                                            <div className="alert-description">
                                                {alert.description}
                                            </div>

                                            <div className="alert-date">
                                                Created:{" "}
                                                {alert.created_at
                                                    ? new Date(
                                                          alert.created_at
                                                      ).toLocaleString()
                                                    : "Unknown"}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ParentAlert;
