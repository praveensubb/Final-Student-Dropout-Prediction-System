import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

export default function MentorReports() {
    const navigate = useNavigate();
    const mentorId = localStorage.getItem("mentorId");
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadReport = async () => {
        try {
            setLoading(true); setError("");
            if (!mentorId) throw new Error("Mentor session not found. Please login again.");
            const res = await fetch(`${API_URL}/mentor/reports?mentor_id=${mentorId}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Unable to load report.");
            setReport(data);
        } catch (e) { setError(e.message); } finally { setLoading(false); }
    };
    useEffect(() => { loadReport(); }, [mentorId]);

    if (loading) return <div style={center}><div style={card}><div style={{fontSize:45}}>📊</div><h2>Generating Mentor Report</h2><p>Loading student and mentoring data...</p></div></div>;
    if (error) return <div style={center}><div style={card}><h2>Unable to Load Report</h2><p>{error}</p><button style={btn} onClick={loadReport}>Retry</button></div></div>;
    if (!report) return null;

    const s = report.summary;
    const riskTotal = s.low_risk + s.medium_risk + s.high_risk;
    const pct = n => riskTotal ? Math.round(n / riskTotal * 100) : 0;
    const riskStyle = r => r === "High Risk" ? {background:"#fee2e2",color:"#b91c1c"} : r === "Medium Risk" ? {background:"#fef3c7",color:"#92400e"} : {background:"#dcfce7",color:"#166534"};

    return <div style={page}>
        <div style={container}>
            <header style={header}>
                <div><small style={{color:"#7c3aed",fontWeight:800,letterSpacing:1.5}}>MENTOR PORTAL</small><h1 style={{margin:"7px 0",color:"#0f172a"}}>Mentor Reports</h1><p style={muted}>Comprehensive student, mentoring, intervention and follow-up report.</p></div>
                <div style={actions}>
                    <button style={secondary} onClick={()=>navigate("/mentor-dashboard")}>Dashboard</button>
                    <button style={secondary} onClick={()=>navigate("/mentor/mentoring")}>Mentoring</button>
                    <button style={blue} onClick={loadReport}>↻ Refresh</button>
                    <button style={dark} onClick={()=>window.print()}>🖨 Print / PDF</button>
                </div>
            </header>

            <div style={meta}><span><b>Mentor:</b> {report.mentor.name}</span><span><b>Department:</b> {report.mentor.department || "-"}</span><span><b>Report Date:</b> {new Date().toLocaleDateString("en-IN")}</span></div>

            <div style={grid4}>
                <Metric icon="👨‍🎓" title="Assigned Students" value={s.total_students}/>
                <Metric icon="🔴" title="High Risk" value={s.high_risk}/>
                <Metric icon="🎓" title="Average CGPA" value={s.average_cgpa ?? "-"}/>
                <Metric icon="📈" title="Average Attendance" value={s.average_attendance != null ? `${s.average_attendance}%` : "-"}/>
            </div>

            <Section title="Risk Distribution" subtitle="Current risk classification of assigned students.">
                <div style={grid3}><Risk title="Low Risk" value={s.low_risk} percent={pct(s.low_risk)} css={{background:"#dcfce7",color:"#166534"}}/><Risk title="Medium Risk" value={s.medium_risk} percent={pct(s.medium_risk)} css={{background:"#fef3c7",color:"#92400e"}}/><Risk title="High Risk" value={s.high_risk} percent={pct(s.high_risk)} css={{background:"#fee2e2",color:"#b91c1c"}}/></div>
            </Section>

            <Section title="Mentoring Statistics" subtitle="Activities, follow-ups and intervention status.">
                <div style={gridStats}><Stat icon="📋" label="Activities" value={s.total_activities}/><Stat icon="📅" label="Total Follow-ups" value={s.total_followups}/><Stat icon="⏳" label="Pending Follow-ups" value={s.pending_followups}/><Stat icon="✅" label="Completed Follow-ups" value={s.completed_followups}/><Stat icon="🎯" label="Total Interventions" value={s.total_interventions}/><Stat icon="🔵" label="Active Interventions" value={s.planned_interventions+s.in_progress_interventions}/><Stat icon="🏆" label="Completed Interventions" value={s.completed_interventions}/></div>
            </Section>

            <Section title="Student Performance Report" subtitle="Academic and attendance overview for every assigned student.">
                <Table headers={["Student","Branch","Sem","CGPA","Attendance","Backlogs","Risk"]}>
                    {report.students.map(st => <tr key={st.id}><td style={td}><b>{st.name}</b><div style={small}>{st.usn}</div></td><td style={td}>{st.branch || "-"}</td><td style={td}>{st.semester || "-"}</td><td style={td}>{st.cgpa != null ? Number(st.cgpa).toFixed(2) : "-"}</td><td style={td}>{st.attendance != null ? `${Number(st.attendance).toFixed(2)}%` : "-"}</td><td style={td}>{st.backlogs ?? 0}</td><td style={td}><span style={{...badge,...riskStyle(st.risk_status)}}>{st.risk_status}</span></td></tr>)}
                </Table>
            </Section>

            <div style={grid2}>
                <Section title="Recent Mentoring Activities" subtitle="Latest recorded sessions.">{report.recent_activities.length ? <List items={report.recent_activities.map(x => ({title:x.activity_type, student:`${x.student_name} • ${x.student_usn}`, text:x.description, date:new Date(x.activity_date).toLocaleDateString("en-IN")}))}/> : <Empty text="No mentoring activities recorded."/>}</Section>
                <Section title="Upcoming Follow-ups" subtitle="Pending scheduled follow-ups.">{report.upcoming_followups.length ? <List items={report.upcoming_followups.map(x => ({title:x.student_name, student:x.student_usn, text:x.purpose || "Mentor follow-up", date:new Date(x.follow_up_date).toLocaleString("en-IN")}))}/> : <Empty text="No pending follow-ups."/>}</Section>
            </div>

            <Section title="Recent Interventions" subtitle="Latest intervention actions and outcomes.">{report.recent_interventions.length ? <List items={report.recent_interventions.map(x => ({title:x.intervention_type, student:`${x.student_name} • ${x.student_usn}`, text:x.description, date:`${x.priority} • ${x.status}`}))}/> : <Empty text="No interventions recorded."/>}</Section>
        </div>
    </div>;
}

function Section({title,subtitle,children}) { return <section style={section}><div style={{marginBottom:18}}><h2 style={{margin:0,color:"#0f172a",fontSize:20}}>{title}</h2><p style={muted}>{subtitle}</p></div>{children}</section>; }
function Metric({icon,title,value}) { return <div style={metric}><div style={metricIcon}>{icon}</div><div><div style={muted}>{title}</div><strong style={{fontSize:29,color:"#0f172a"}}>{value}</strong></div></div>; }
function Risk({title,value,percent,css}) { return <div style={{...risk,...css}}><b>{title}</b><strong style={{display:"block",fontSize:30,marginTop:7}}>{value}</strong><small>{percent}% of students</small></div>; }
function Stat({icon,label,value}) { return <div style={stat}><span style={{fontSize:23}}>{icon}</span><div><strong style={{fontSize:24}}>{value}</strong><div style={muted}>{label}</div></div></div>; }
function Table({headers,children}) { return <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:800}}><thead><tr>{headers.map(h=><th key={h} style={th}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>; }
function List({items}) { return <div style={{display:"grid",gap:10}}>{items.map((x,i)=><div key={i} style={list}><div style={{fontSize:22}}>📋</div><div><b>{x.title}</b><div style={small}>{x.student}</div><p style={{margin:"6px 0",fontSize:12,color:"#475569"}}>{x.text}</p><small style={{color:"#7c3aed"}}>{x.date}</small></div></div>)}</div>; }
function Empty({text}) { return <div style={{padding:35,textAlign:"center",color:"#94a3b8"}}>📭<br/>{text}</div>; }

const page={minHeight:"100vh",background:"#f5f7fb",fontFamily:"Arial,sans-serif",padding:28};
const container={maxWidth:1450,margin:"0 auto"};
const header={background:"#fff",borderRadius:20,padding:"24px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:20,flexWrap:"wrap",boxShadow:"0 8px 25px rgba(0,0,0,.06)",marginBottom:18};
const actions={display:"flex",gap:9,flexWrap:"wrap"};
const secondary={border:0,borderRadius:10,padding:"10px 14px",background:"#ede9fe",color:"#6d28d9",fontWeight:700,cursor:"pointer"};
const blue={...secondary,background:"#2563eb",color:"#fff"}; const dark={...secondary,background:"#0f172a",color:"#fff"};
const muted={margin:"5px 0 0",color:"#64748b",fontSize:13};
const meta={background:"#fff",borderRadius:14,padding:"14px 18px",display:"flex",gap:25,flexWrap:"wrap",color:"#475569",fontSize:13,marginBottom:18};
const grid4={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginBottom:20};
const grid3={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:15}; const grid2={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(350px,1fr))",gap:20};
const section={background:"#fff",borderRadius:18,padding:22,boxShadow:"0 8px 25px rgba(0,0,0,.05)",marginBottom:20};
const metric={background:"#fff",borderRadius:17,padding:20,display:"flex",alignItems:"center",gap:14,boxShadow:"0 8px 25px rgba(0,0,0,.05)"}; const metricIcon={width:50,height:50,borderRadius:14,background:"#ede9fe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24};
const risk={borderRadius:15,padding:20}; const gridStats={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}; const stat={background:"#f8fafc",borderRadius:14,padding:16,display:"flex",alignItems:"center",gap:12};
const th={padding:"13px 12px",textAlign:"left",fontSize:12,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0"}; const td={padding:"14px 12px",fontSize:13,color:"#334155",borderBottom:"1px solid #e2e8f0"}; const small={color:"#64748b",fontSize:11,marginTop:3}; const badge={display:"inline-block",padding:"6px 10px",borderRadius:20,fontSize:11,fontWeight:800}; const list={display:"flex",gap:12,padding:13,borderRadius:13,background:"#f8fafc"};
const center={minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f5f7fb",fontFamily:"Arial"}; const card={background:"#fff",padding:35,borderRadius:18,textAlign:"center",boxShadow:"0 10px 30px rgba(0,0,0,.07)"}; const btn={...blue,padding:"11px 18px"};
