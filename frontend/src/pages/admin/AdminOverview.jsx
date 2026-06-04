import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const STATUS_COLORS = { pending:"#e74c3c", assigned:"#f39c12", resolved:"#27ae60" };

function StatCard({ label, value, color }) {
  return (
    <div style={{ background:"white", borderRadius:"10px", padding:"24px",
      boxShadow:"0 1px 4px rgba(0,0,0,0.08)", flex:"1", minWidth:"140px",
      borderLeft:`4px solid ${color}` }}>
      <div style={{ fontSize:"28px", fontWeight:"700", color:"#1a1a2e" }}>{value}</div>
      <div style={{ fontSize:"13px", color:"#888", marginTop:"4px" }}>{label}</div>
    </div>
  );
}

function AdminOverview() {
  const [reports,   setReports]   = useState([]);
  const [rooms,     setRooms]     = useState([]);
  const [damaged,   setDamaged]   = useState([]);
  const [avgRepair, setAvgRepair] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const h = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_URL}/reports`,                         { headers: h }).then(r => r.json()),
      fetch(`${API_URL}/admin/rooms`,                     { headers: h }).then(r => r.json()),
      fetch(`${API_URL}/reports/analytics/damaged-assets`).then(r => r.json()),
      fetch(`${API_URL}/reports/analytics/repair-time`   ).then(r => r.json()),
    ]).then(([reps, rms, dmg, avg]) => {
      setReports(Array.isArray(reps) ? reps : []);
      setRooms(Array.isArray(rms)   ? rms  : []);
      setDamaged(Array.isArray(dmg) ? dmg.slice(0,8) : []);
      setAvgRepair(avg?.avg_repair_time || null);
    });
  }, [token]);

  const pending    = reports.filter(r => r.status === "pending").length;
  const inProgress = reports.filter(r => r.status === "assigned").length;
  const resolved   = reports.filter(r => r.status === "resolved").length;

  const pieData = [
    { name:"Pending",     value:pending,    color:"#e74c3c" },
    { name:"In Progress", value:inProgress, color:"#f39c12" },
    { name:"Resolved",    value:resolved,   color:"#27ae60" },
  ].filter(d => d.value > 0);

  const formatAvg = (v) => {
    if (!v) return "No data";
    const parts = v.toString().split(":");
    const hours = parseInt(parts[0]) || 0;
    const mins  = parseInt(parts[1]) || 0;
    if (hours >= 24) return `${Math.floor(hours/24)}d ${hours%24}h`;
    if (hours > 0)   return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div style={{ padding:"32px" }}>
      <h1 style={{ fontSize:"22px", fontWeight:"700", color:"#1a1a2e", marginBottom:"4px" }}>Overview</h1>
      <p style={{ color:"#888", marginBottom:"28px", fontSize:"14px" }}>System status at a glance</p>

      <div style={{ display:"flex", gap:"16px", flexWrap:"wrap", marginBottom:"28px" }}>
        <StatCard label="Total Reports"   value={reports.length} color="#4a6fa5" />
        <StatCard label="Pending"         value={pending}        color="#e74c3c" />
        <StatCard label="In Progress"     value={inProgress}     color="#f39c12" />
        <StatCard label="Resolved"        value={resolved}       color="#27ae60" />
        <StatCard label="Rooms"           value={rooms.length}   color="#8e44ad" />
        <StatCard label="Avg Repair Time" value={formatAvg(avgRepair)} color="#1abc9c" />
      </div>

      <div style={{ display:"flex", gap:"20px", marginBottom:"28px", flexWrap:"wrap" }}>
        <div style={{ background:"white", borderRadius:"10px", padding:"24px",
          boxShadow:"0 1px 4px rgba(0,0,0,0.08)", flex:"2", minWidth:"300px" }}>
          <h2 style={{ fontSize:"15px", fontWeight:"600", margin:"0 0 20px" }}>Most Reported Assets</h2>
          {damaged.length === 0
            ? <p style={{ color:"#bbb", textAlign:"center", padding:"40px 0", fontSize:"14px" }}>No data yet</p>
            : <ResponsiveContainer width="100%" height={220}>
                <BarChart data={damaged} margin={{ top:0, right:0, left:-20, bottom:40 }}>
                  <XAxis dataKey="name" tick={{ fontSize:11 }} angle={-30} textAnchor="end" />
                  <YAxis allowDecimals={false} tick={{ fontSize:11 }} />
                  <Tooltip formatter={v => [v,"Reports"]} />
                  <Bar dataKey="report_count" radius={[4,4,0,0]}>
                    {damaged.map((_,i) => <Cell key={i} fill={i===0?"#e74c3c":i===1?"#f39c12":"#4a6fa5"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
          }
        </div>

        <div style={{ background:"white", borderRadius:"10px", padding:"24px",
          boxShadow:"0 1px 4px rgba(0,0,0,0.08)", flex:"1", minWidth:"240px" }}>
          <h2 style={{ fontSize:"15px", fontWeight:"600", margin:"0 0 20px" }}>Report Status</h2>
          {pieData.length === 0
            ? <p style={{ color:"#bbb", textAlign:"center", padding:"40px 0", fontSize:"14px" }}>No data yet</p>
            : <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                    {pieData.map((e,i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" iconSize={10}
                    formatter={v => <span style={{ fontSize:"12px", color:"#555" }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
          }
        </div>
      </div>

      <div style={{ background:"white", borderRadius:"10px", boxShadow:"0 1px 4px rgba(0,0,0,0.08)", overflow:"hidden" }}>
        <div style={{ padding:"20px 24px", borderBottom:"1px solid #f0f0f0" }}>
          <h2 style={{ fontSize:"15px", fontWeight:"600", margin:0 }}>Recent Reports</h2>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#fafafa" }}>
              {["ID","Asset","Reported By","Status","Date"].map(h => (
                <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:"12px",
                  color:"#888", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reports.slice(0,8).map(r => {
              const c = STATUS_COLORS[r.status] || "#888";
              return (
                <tr key={r.id} style={{ borderTop:"1px solid #f0f0f0" }}>
                  <td style={{ padding:"12px 16px", fontSize:"13px", color:"#888" }}>#{r.id}</td>
                  <td style={{ padding:"12px 16px", fontSize:"13px" }}>{r.asset_name}</td>
                  <td style={{ padding:"12px 16px", fontSize:"13px" }}>{r.user_name}</td>
                  <td style={{ padding:"12px 16px" }}>
                    <span style={{ padding:"3px 10px", borderRadius:"20px", fontSize:"12px",
                      background:c+"22", color:c, fontWeight:"500" }}>{r.status}</span>
                  </td>
                  <td style={{ padding:"12px 16px", fontSize:"12px", color:"#aaa" }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminOverview;