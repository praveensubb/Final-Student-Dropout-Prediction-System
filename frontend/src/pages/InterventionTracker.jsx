import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function InterventionTracker() {
    const facultyId = localStorage.getItem("facultyId");

    const [interventions, setInterventions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");

    const [students, setStudents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        studentId: "",
        interventionType: "Academic",
        priority: "Medium",
        status: "Active",
        riskFactor: "",
        action: "",
        followUpDate: "",
        description: "",
    });

    const loadStudents = async () => {
        if (!facultyId) return;

        try {
            const response = await api.get(`/faculty/${facultyId}/students`);
            setStudents(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("ASSIGNED STUDENTS LOAD ERROR:", err);
        }
    };

    const loadInterventions = async () => {
        if (!facultyId) {
            setError("Faculty login information not found.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/interventions/faculty/${facultyId}`
            );

            setInterventions(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (err) {
            console.error("INTERVENTION TRACKER LOAD ERROR:", err);
            setError(
                err.response?.data?.detail ||
                "Unable to load interventions."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInterventions();
        loadStudents();
    }, []);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            studentId: "",
            interventionType: "Academic",
            priority: "Medium",
            status: "Active",
            riskFactor: "",
            action: "",
            followUpDate: "",
            description: "",
        });
    };

    const handleCreateIntervention = async (e) => {
        e.preventDefault();

        if (!formData.studentId) {
            alert("Please select a student.");
            return;
        }

        if (!formData.riskFactor.trim()) {
            alert("Please enter the risk factor.");
            return;
        }

        if (!formData.action.trim()) {
            alert("Please enter the intervention action.");
            return;
        }

        if (!formData.description.trim()) {
            alert("Please enter the description.");
            return;
        }

        try {
            setSaving(true);

            await api.post("/interventions/", {
                faculty_id: Number(facultyId),
                student_id: Number(formData.studentId),
                intervention_type: formData.interventionType,
                priority: formData.priority,
                status: formData.status,
                risk_factor: formData.riskFactor.trim(),
                intervention_action: formData.action.trim(),
                follow_up_date: formData.followUpDate || null,
                description: formData.description.trim(),
            });

            alert("Intervention created successfully.");
            setShowForm(false);
            resetForm();
            await loadInterventions();
        } catch (err) {
            console.error("CREATE INTERVENTION ERROR:", err);
            alert(
                err.response?.data?.detail ||
                "Unable to create intervention."
            );
        } finally {
            setSaving(false);
        }
    };

    const filteredInterventions = useMemo(() => {
        const query = search.trim().toLowerCase();

        return interventions.filter((item) => {
            const matchesSearch =
                !query ||
                String(item.student_name || "").toLowerCase().includes(query) ||
                String(item.usn || "").toLowerCase().includes(query) ||
                String(item.intervention_type || "").toLowerCase().includes(query) ||
                String(item.risk_factor || "").toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "All" || item.status === statusFilter;

            const matchesPriority =
                priorityFilter === "All" || item.priority === priorityFilter;

            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [interventions, search, statusFilter, priorityFilter]);

    const total = interventions.length;
    const active = interventions.filter((x) => x.status === "Active").length;
    const completed = interventions.filter((x) => x.status === "Completed").length;
    const highPriority = interventions.filter((x) => x.priority === "High").length;

    const updateStatus = async (id, newStatus) => {
        try {
            await api.put(`/interventions/${id}/status`, null, {
                params: { status: newStatus },
            });

            await loadInterventions();
        } catch (err) {
            console.error("INTERVENTION STATUS ERROR:", err);
            alert(
                err.response?.data?.detail ||
                "Unable to update intervention status."
            );
        }
    };

    const formatDate = (value) => {
        if (!value) return "Not specified";

        const parts = String(value).split("-");
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }

        return value;
    };

    if (loading) {
        return (
            <div style={styles.loadingPage}>
                <div style={styles.loadingCard}>
                    Loading intervention tracker...
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <div>
                        <div style={styles.eyebrow}>FACULTY SUPPORT</div>
                        <h1 style={styles.title}>Intervention Tracker</h1>
                        <p style={styles.subtitle}>
                            Track student interventions, follow-ups and completion status.
                        </p>
                    </div>

                    <div style={styles.headerButtons}>
                        <button
                            type="button"
                            onClick={() => {
                                resetForm();
                                setShowForm(true);
                            }}
                            style={styles.createButton}
                        >
                            ➕ New Intervention
                        </button>

                        <button
                            type="button"
                            onClick={loadInterventions}
                            style={styles.refreshButton}
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                {error && <div style={styles.error}>{error}</div>}

                <div style={styles.summaryGrid}>
                    <SummaryCard label="Total" value={total} icon="📋" />
                    <SummaryCard label="Active" value={active} icon="🟠" />
                    <SummaryCard label="Completed" value={completed} icon="✅" />
                    <SummaryCard label="High Priority" value={highPriority} icon="🔴" />
                </div>

                <div style={styles.filterCard}>
                    <div style={styles.filterGroup}>
                        <label style={styles.label}>Search</label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search student, USN, intervention or risk factor..."
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.label}>Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={styles.input}
                        >
                            <option value="All">All</option>
                            <option value="Active">Active</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.label}>Priority</label>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            style={styles.input}
                        >
                            <option value="All">All</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setSearch("");
                            setStatusFilter("All");
                            setPriorityFilter("All");
                        }}
                        style={styles.clearButton}
                    >
                        Clear
                    </button>
                </div>

                <div style={styles.resultHeader}>
                    <h2 style={styles.sectionTitle}>Intervention Records</h2>
                    <span style={styles.resultCount}>
                        Showing {filteredInterventions.length} of {interventions.length}
                    </span>
                </div>

                {filteredInterventions.length === 0 ? (
                    <div style={styles.empty}>
                        <div style={styles.emptyIcon}>📭</div>
                        <h2 style={styles.emptyTitle}>No Intervention Records</h2>
                        <p style={styles.emptyText}>
                            Create an intervention from My Students. It will appear here automatically.
                        </p>
                    </div>
                ) : (
                    <div style={styles.list}>
                        {filteredInterventions.map((item) => (
                            <div key={item.id} style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <div>
                                        <div style={styles.cardSectionTitle}>INTERVENTION DETAILS</div>
                                        <div style={styles.studentName}>
                                            Student: {item.student_name || "Unknown Student"}
                                        </div>
                                        <div style={styles.usn}>
                                            USN: {item.usn || "N/A"}
                                        </div>
                                    </div>

                                    <div style={styles.badges}>
                                        <span style={getPriorityStyle(item.priority)}>
                                            {item.priority || "Medium"}
                                        </span>
                                        <span style={getStatusStyle(item.status)}>
                                            {item.status || "Active"}
                                        </span>
                                    </div>
                                </div>

                                <div style={styles.simpleDetails}>
                                    <Detail label="Type" value={item.intervention_type || "Not specified"} />
                                    <Detail label="Priority" value={item.priority || "Medium"} />
                                    <Detail label="Status" value={item.status || "Active"} />
                                </div>

                                <div style={styles.fullSection}>
                                    <div style={styles.fieldLabel}>Risk Factor:</div>
                                    <div style={styles.fieldValue}>
                                        {item.risk_factor || "Not specified"}
                                    </div>
                                </div>

                                <div style={styles.fullSection}>
                                    <div style={styles.fieldLabel}>Action:</div>
                                    <div style={styles.fieldValue}>
                                        {item.intervention_action || "No action recorded."}
                                    </div>
                                </div>

                                <div style={styles.fullSection}>
                                    <div style={styles.fieldLabel}>Follow-up:</div>
                                    <div style={styles.fieldValue}>
                                        {formatDate(item.follow_up_date)}
                                    </div>
                                </div>

                                <div style={styles.fullSection}>
                                    <div style={styles.fieldLabel}>Description:</div>
                                    <div style={styles.fieldValue}>
                                        {item.description || "No description recorded."}
                                    </div>
                                </div>

                                <div style={styles.cardFooter}>
                                    <div style={styles.recordId}>
                                        Intervention ID: {item.id}
                                    </div>

                                    {item.status === "Active" ? (
                                        <button
                                            type="button"
                                            onClick={() => updateStatus(item.id, "Completed")}
                                            style={styles.completeButton}
                                        >
                                            ✓ Mark Completed
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => updateStatus(item.id, "Active")}
                                            style={styles.reopenButton}
                                        >
                                            ↩ Reopen
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showForm && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modal}>
                            <div style={styles.modalHeader}>
                                <div>
                                    <div style={styles.cardSectionTitle}>FACULTY ACTION</div>
                                    <h2 style={styles.modalTitle}>Create Intervention</h2>
                                    <p style={styles.modalSubtitle}>
                                        Faculty manually enters the intervention details for an assigned student.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => !saving && setShowForm(false)}
                                    style={styles.closeButton}
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleCreateIntervention}>
                                <div style={styles.formGrid}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.formLabel}>Student *</label>
                                        <select
                                            name="studentId"
                                            value={formData.studentId}
                                            onChange={handleFormChange}
                                            style={styles.formInput}
                                            required
                                        >
                                            <option value="">Select assigned student</option>
                                            {students.map((student) => (
                                                <option key={student.id} value={student.id}>
                                                    {student.name} - {student.usn}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.formLabel}>Intervention Type *</label>
                                        <select name="interventionType" value={formData.interventionType} onChange={handleFormChange} style={styles.formInput}>
                                            <option>Academic</option>
                                            <option>Attendance</option>
                                            <option>Behaviour</option>
                                            <option>Financial</option>
                                            <option>Career</option>
                                            <option>Personal</option>
                                            <option>Other</option>
                                        </select>
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.formLabel}>Priority *</label>
                                        <select name="priority" value={formData.priority} onChange={handleFormChange} style={styles.formInput}>
                                            <option>Low</option>
                                            <option>Medium</option>
                                            <option>High</option>
                                        </select>
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.formLabel}>Status *</label>
                                        <select name="status" value={formData.status} onChange={handleFormChange} style={styles.formInput}>
                                            <option>Active</option>
                                            <option>Completed</option>
                                        </select>
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.formLabel}>Risk Factor *</label>
                                        <input name="riskFactor" value={formData.riskFactor} onChange={handleFormChange} placeholder="e.g. Low Attendance" style={styles.formInput} />
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.formLabel}>Follow-up Date</label>
                                        <input type="date" name="followUpDate" value={formData.followUpDate} onChange={handleFormChange} style={styles.formInput} />
                                    </div>

                                    <div style={styles.formGroupFull}>
                                        <label style={styles.formLabel}>Action *</label>
                                        <textarea name="action" value={formData.action} onChange={handleFormChange} placeholder="Enter the action taken or planned" style={styles.textarea} rows="3" />
                                    </div>

                                    <div style={styles.formGroupFull}>
                                        <label style={styles.formLabel}>Description *</label>
                                        <textarea name="description" value={formData.description} onChange={handleFormChange} placeholder="Enter counselling/intervention details" style={styles.textarea} rows="4" />
                                    </div>
                                </div>

                                <div style={styles.modalFooter}>
                                    <button type="button" onClick={() => setShowForm(false)} disabled={saving} style={styles.cancelButton}>Cancel</button>
                                    <button type="submit" disabled={saving} style={styles.saveButton}>
                                        {saving ? "Saving..." : "Save Intervention"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function SummaryCard({ label, value, icon }) {
    return (
        <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>{icon}</div>
            <div>
                <div style={styles.summaryValue}>{value}</div>
                <div style={styles.summaryLabel}>{label}</div>
            </div>
        </div>
    );
}

function Detail({ label, value }) {
    return (
        <div style={styles.detail}>
            <div style={styles.detailLabel}>{label}</div>
            <div style={styles.detailValue}>{value}</div>
        </div>
    );
}

function getPriorityStyle(priority) {
    if (priority === "High") return styles.highPriority;
    if (priority === "Medium") return styles.mediumPriority;
    return styles.lowPriority;
}

function getStatusStyle(status) {
    if (status === "Completed") return styles.completedStatus;
    return styles.activeStatus;
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "35px",
        fontFamily: "Arial, Helvetica, sans-serif",
    },
    container: {
        maxWidth: "1400px",
        margin: "0 auto",
    },
    header: {
        background: "#ffffff",
        borderRadius: "20px",
        padding: "30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        boxShadow: "0 10px 30px rgba(20,40,80,0.08)",
        marginBottom: "25px",
    },
    eyebrow: {
        color: "#4f46e5",
        fontWeight: "700",
        fontSize: "13px",
        letterSpacing: "2px",
        marginBottom: "8px",
    },
    title: {
        margin: 0,
        fontSize: "32px",
        color: "#172554",
    },
    subtitle: {
        marginTop: "8px",
        color: "#64748b",
        fontSize: "16px",
    },
    headerButtons: {
        display: "flex",
        gap: "10px",
        alignItems: "center",
        flexWrap: "wrap",
    },
    createButton: {
        border: "none",
        background: "#16a34a",
        color: "#ffffff",
        padding: "13px 20px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "700",
    },
    refreshButton: {
        border: "none",
        background: "#2563eb",
        color: "#ffffff",
        padding: "13px 20px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "700",
    },
    error: {
        background: "#fee2e2",
        color: "#991b1b",
        padding: "15px",
        borderRadius: "10px",
        marginBottom: "20px",
    },
    summaryGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(180px, 1fr))",
        gap: "18px",
        marginBottom: "25px",
    },
    summaryCard: {
        background: "#ffffff",
        borderRadius: "16px",
        padding: "22px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        boxShadow: "0 8px 25px rgba(20,40,80,0.06)",
    },
    summaryIcon: {
        width: "52px",
        height: "52px",
        borderRadius: "14px",
        background: "#eef2ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
    },
    summaryValue: {
        fontSize: "28px",
        fontWeight: "800",
        color: "#172554",
    },
    summaryLabel: {
        color: "#64748b",
        fontSize: "14px",
        marginTop: "3px",
    },
    filterCard: {
        background: "#ffffff",
        borderRadius: "16px",
        padding: "22px",
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr auto",
        gap: "15px",
        alignItems: "end",
        boxShadow: "0 8px 25px rgba(20,40,80,0.06)",
        marginBottom: "30px",
    },
    filterGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "7px",
    },
    label: {
        color: "#334155",
        fontWeight: "700",
        fontSize: "13px",
    },
    input: {
        width: "100%",
        boxSizing: "border-box",
        padding: "12px",
        border: "1px solid #cbd5e1",
        borderRadius: "9px",
        fontSize: "14px",
        outline: "none",
        background: "#ffffff",
    },
    clearButton: {
        border: "none",
        background: "#64748b",
        color: "#ffffff",
        padding: "12px 20px",
        borderRadius: "9px",
        cursor: "pointer",
        fontWeight: "700",
    },
    resultHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "15px",
    },
    sectionTitle: {
        margin: 0,
        color: "#172554",
        fontSize: "22px",
    },
    resultCount: {
        color: "#64748b",
        fontSize: "14px",
    },
    list: {
        display: "grid",
        gap: "20px",
    },
    card: {
        background: "#ffffff",
        borderRadius: "18px",
        padding: "25px",
        boxShadow: "0 8px 25px rgba(20,40,80,0.07)",
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "20px",
        paddingBottom: "18px",
        borderBottom: "1px solid #e5e7eb",
    },
    cardSectionTitle: {
        color: "#4f46e5",
        fontSize: "12px",
        fontWeight: "800",
        letterSpacing: "1.5px",
        marginBottom: "10px",
    },
    studentName: {
        color: "#172554",
        fontSize: "21px",
        fontWeight: "800",
    },
    usn: {
        color: "#64748b",
        marginTop: "5px",
        fontSize: "14px",
    },
    badges: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        justifyContent: "flex-end",
    },
    highPriority: {
        background: "#fee2e2",
        color: "#991b1b",
        padding: "7px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "800",
    },
    mediumPriority: {
        background: "#fef3c7",
        color: "#92400e",
        padding: "7px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "800",
    },
    lowPriority: {
        background: "#dcfce7",
        color: "#166534",
        padding: "7px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "800",
    },
    activeStatus: {
        background: "#dbeafe",
        color: "#1d4ed8",
        padding: "7px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "800",
    },
    completedStatus: {
        background: "#dcfce7",
        color: "#166534",
        padding: "7px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "800",
    },
    simpleDetails: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(150px, 1fr))",
        gap: "15px",
        padding: "20px 0 10px",
    },
    fullSection: {
        padding: "15px 0",
        borderTop: "1px solid #eef2f7",
    },
    fieldLabel: {
        color: "#334155",
        fontWeight: "800",
        fontSize: "14px",
        marginBottom: "6px",
    },
    fieldValue: {
        color: "#475569",
        fontSize: "15px",
        lineHeight: "1.6",
    },
    detail: {
        background: "#f8fafc",
        borderRadius: "10px",
        padding: "13px",
    },
    detailLabel: {
        color: "#64748b",
        fontSize: "12px",
        fontWeight: "700",
        marginBottom: "6px",
    },
    detailValue: {
        color: "#1e293b",
        fontSize: "14px",
        fontWeight: "700",
    },
    textBlock: {
        padding: "15px 0",
        borderTop: "1px solid #e5e7eb",
    },
    blockTitle: {
        color: "#334155",
        fontSize: "13px",
        fontWeight: "800",
        marginBottom: "7px",
    },
    blockText: {
        color: "#475569",
        lineHeight: "1.6",
        whiteSpace: "pre-wrap",
    },
    cardFooter: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "15px",
        paddingTop: "18px",
        borderTop: "1px solid #e5e7eb",
    },
    recordId: {
        color: "#94a3b8",
        fontSize: "12px",
    },
    completeButton: {
        border: "none",
        background: "#16a34a",
        color: "#ffffff",
        padding: "11px 18px",
        borderRadius: "9px",
        cursor: "pointer",
        fontWeight: "700",
    },
    reopenButton: {
        border: "none",
        background: "#2563eb",
        color: "#ffffff",
        padding: "11px 18px",
        borderRadius: "9px",
        cursor: "pointer",
        fontWeight: "700",
    },
    empty: {
        background: "#ffffff",
        borderRadius: "18px",
        padding: "80px 30px",
        textAlign: "center",
        color: "#64748b",
    },
    emptyIcon: {
        fontSize: "50px",
        marginBottom: "15px",
    },
    emptyTitle: {
        color: "#172554",
        marginBottom: "8px",
    },
    emptyText: {
        maxWidth: "600px",
        margin: "0 auto",
        lineHeight: "1.6",
    },
    modalOverlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 9999,
    },
    modal: {
        width: "100%",
        maxWidth: "850px",
        maxHeight: "90vh",
        overflowY: "auto",
        background: "#ffffff",
        borderRadius: "18px",
        padding: "28px",
        boxShadow: "0 25px 70px rgba(0,0,0,0.2)",
    },
    modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "15px",
        marginBottom: "25px",
    },
    modalTitle: {
        margin: "0 0 5px",
        color: "#172554",
        fontSize: "26px",
    },
    modalSubtitle: {
        margin: 0,
        color: "#64748b",
        fontSize: "14px",
    },
    closeButton: {
        border: "none",
        background: "#f1f5f9",
        color: "#334155",
        width: "38px",
        height: "38px",
        borderRadius: "9px",
        cursor: "pointer",
        fontWeight: "700",
    },
    formGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "18px",
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "7px",
    },
    formGroupFull: {
        gridColumn: "1 / -1",
        display: "flex",
        flexDirection: "column",
        gap: "7px",
    },
    formLabel: {
        color: "#334155",
        fontWeight: "700",
        fontSize: "13px",
    },
    formInput: {
        width: "100%",
        boxSizing: "border-box",
        padding: "12px",
        border: "1px solid #cbd5e1",
        borderRadius: "9px",
        fontSize: "14px",
        background: "#ffffff",
    },
    textarea: {
        width: "100%",
        boxSizing: "border-box",
        padding: "12px",
        border: "1px solid #cbd5e1",
        borderRadius: "9px",
        fontSize: "14px",
        resize: "vertical",
        fontFamily: "Arial, Helvetica, sans-serif",
    },
    modalFooter: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "25px",
        paddingTop: "20px",
        borderTop: "1px solid #e5e7eb",
    },
    cancelButton: {
        border: "none",
        background: "#e2e8f0",
        color: "#334155",
        padding: "12px 20px",
        borderRadius: "9px",
        cursor: "pointer",
        fontWeight: "700",
    },
    saveButton: {
        border: "none",
        background: "#2563eb",
        color: "#ffffff",
        padding: "12px 22px",
        borderRadius: "9px",
        cursor: "pointer",
        fontWeight: "700",
    },
    loadingPage: {
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f7fb",
        fontFamily: "Arial, Helvetica, sans-serif",
    },
    loadingCard: {
        background: "#ffffff",
        padding: "30px 40px",
        borderRadius: "15px",
        color: "#475569",
        boxShadow: "0 8px 25px rgba(20,40,80,0.07)",
    },
};

export default InterventionTracker;
