import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: "white", borderRadius: "10px", padding: "24px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)", flex: "1", minWidth: "160px",
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: "28px", fontWeight: "700", color: "#1a1a2e" }}>{value}</div>
      <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>{label}</div>
    </div>
  );
}

function AdminOverview() {
  const [reports, setReports] = useState([]);
  const [rooms,   setRooms]   = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_URL}/reports`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setReports(Array.isArray(d) ? d : []));
    fetch(`${API_URL}/admin/rooms`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setRooms(Array.isArray(d) ? d : []));
  }, []);

  const pending    = reports.filter(r => r.status === "pending").length;
  const inProgress = reports.filter(r => r.status === "assigned").length;
  const resolved   = reports.filter(r => r.status === "resolved").length;

  return (
    <div style={{ padding: "32px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a2e", marginBottom: "8px" }}>
        Overview
      </h1>
      <p style={{ color: "#888", marginBottom: "28px", fontSize: "14px" }}>
        System status at a glance
      </p>

      {/* Stats row */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "32px" }}>
        <StatCard label="Total Reports"   value={reports.length} color="#4a6fa5" />
        <StatCard label="Pending"         value={pending}        color="#e74c3c" />
        <StatCard label="In Progress"     value={inProgress}     color="#f39c12" />
        <StatCard label="Resolved"        value={resolved}       color="#27ae60" />
        <StatCard label="Rooms"           value={rooms.length}   color="#8e44ad" />
      </div>

      {/* Recent reports table */}
      <div style={{
        background: "white", borderRadius: "10px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "600", margin: 0 }}>Recent Reports</h2>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafafa" }}>
              {["ID", "Asset", "Reported By", "Status", "Date"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px",
                  color: "#888", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reports.slice(0, 10).map(r => (
              <tr key={r.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                <td style={{ padding: "12px 16px", fontSize: "13px", color: "#888" }}>#{r.id}</td>
                <td style={{ padding: "12px 16px", fontSize: "13px" }}>{r.asset_name}</td>
                <td style={{ padding: "12px 16px", fontSize: "13px" }}>{r.user_name}</td>
                <td style={{ padding: "12px 16px" }}>
                  <StatusBadge status={r.status} />
                </td>
                <td style={{ padding: "12px 16px", fontSize: "12px", color: "#aaa" }}>
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending:     { bg: "#fdecea", color: "#c0392b" },
    assigned:    { bg: "#fef9e7", color: "#d68910" },
    resolved:    { bg: "#eafaf1", color: "#1e8449" },
    under_repair:{ bg: "#fef9e7", color: "#d68910" },
  };
  const s = map[status] || { bg: "#eee", color: "#555" };
  return (
    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px",
      background: s.bg, color: s.color, fontWeight: "500" }}>
      {status}
    </span>
  );
}

export default AdminOverview;