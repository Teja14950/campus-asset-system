import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const STATUS_COLOR = {
  pending:     { bg: "#fdecea", color: "#c0392b" },
  assigned:    { bg: "#fef9e7", color: "#d68910" },
  resolved:    { bg: "#eafaf1", color: "#1e8449" },
  under_repair:{ bg: "#fef9e7", color: "#d68910" },
};

function AdminReports() {
  const [reports,   setReports]   = useState([]);
  const [repairers, setRepairers] = useState([]);
  const [assigning, setAssigning] = useState(null); // report being assigned
  const [selectedRepairer, setSelectedRepairer] = useState("");
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState("");
  const token = localStorage.getItem("token");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/reports`,    { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_URL}/users`,      { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([reps, users]) => {
      setReports(Array.isArray(reps) ? reps : []);
      setRepairers(Array.isArray(users) ? users.filter(u => u.role === "repairer") : []);
      setLoading(false);
    });
  }, []);

  const handleAssign = async () => {
    if (!selectedRepairer) return;
    const res = await fetch(`${API_URL}/reports/${assigning.id}/assign`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ assigned_to: selectedRepairer }),
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || "Failed"); return; }
    setReports(prev => prev.map(r => r.id === assigning.id ? { ...r, status: "assigned" } : r));
    setAssigning(null);
    setSelectedRepairer("");
    showToast("✓ Report assigned");
  };

  if (loading) return <div style={{ padding: "40px", color: "#aaa" }}>Loading...</div>;

  return (
    <div style={{ padding: "32px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a2e", marginBottom: "4px" }}>
        All Reports
      </h1>
      <p style={{ color: "#888", fontSize: "14px", marginBottom: "24px" }}>
        Assign pending reports to repairers
      </p>

      <div style={{
        background: "white", borderRadius: "10px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafafa" }}>
              {["ID", "Asset", "Reported By", "Description", "Status", "Date", "Action"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px",
                  color: "#888", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reports.map(r => {
              const sc = STATUS_COLOR[r.status] || { bg: "#eee", color: "#555" };
              return (
                <tr key={r.id} style={{ borderTop: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#888" }}>#{r.id}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "500" }}>{r.asset_name}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px" }}>{r.user_name}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#666", maxWidth: "200px" }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.description}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px",
                      background: sc.bg, color: sc.color, fontWeight: "500" }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "#aaa" }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {r.status === "pending" && (
                      <button
                        onClick={() => { setAssigning(r); setSelectedRepairer(""); }}
                        style={{ padding: "6px 14px", borderRadius: "6px", cursor: "pointer",
                          background: "#1a1a2e", color: "white", border: "none", fontSize: "12px" }}
                      >
                        Assign
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Assign modal */}
      {assigning && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "28px",
            width: "360px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ marginBottom: "16px", fontSize: "16px" }}>
              Assign Report #{assigning.id}
            </h3>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "16px" }}>
              Asset: <strong>{assigning.asset_name}</strong>
            </p>
            <select
              value={selectedRepairer}
              onChange={e => setSelectedRepairer(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: "6px",
                border: "1px solid #ddd", fontSize: "14px", marginBottom: "20px", boxSizing: "border-box" }}
            >
              <option value="">Select a repairer...</option>
              {repairers.map(rep => (
                <option key={rep.id} value={rep.id}>{rep.name}</option>
              ))}
            </select>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setAssigning(null)}
                style={{ padding: "9px 18px", borderRadius: "7px", cursor: "pointer",
                  border: "none", background: "#f0f0f0", fontSize: "14px" }}>
                Cancel
              </button>
              <button onClick={handleAssign} disabled={!selectedRepairer}
                style={{ padding: "9px 18px", borderRadius: "7px", cursor: "pointer",
                  border: "none", background: "#1a1a2e", color: "white", fontSize: "14px" }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: "28px", left: "50%", transform: "translateX(-50%)",
          background: "#1a1a2e", color: "white", padding: "12px 24px",
          borderRadius: "8px", fontSize: "14px", zIndex: 2000 }}>
          {toast}
        </div>
      )}
    </div>
  );
}

export default AdminReports;