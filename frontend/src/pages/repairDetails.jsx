import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function RepairDetails() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [report, setReport]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage]   = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_URL}/reports/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);  // FIX: id added to dependency array

  // FIX: Resolve/Keep Pending buttons were rendered but had no onClick —
  // they did nothing. This function calls PUT /reports/:id/status.
  const updateStatus = async (status) => {
    setUpdating(true);
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/reports/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessage(err.error || "Update failed");
        return;
      }

      const updated = await res.json();
      setReport((prev) => ({ ...prev, status: updated.status }));
      setMessage(`Status updated to "${updated.status}"`);

      // Navigate back after resolve so the repairer doesn't stay on a done report
      if (status === "resolved") {
        setTimeout(() => navigate("/repair-dashboard"), 1200);
      }
    } catch {
      setMessage("Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  const user = JSON.parse(localStorage.getItem("user"));
  const isRepairer = user?.role === "repairer";

  if (loading) return <p style={{ padding: "30px" }}>Loading...</p>;
  if (!report)  return <p style={{ padding: "30px" }}>Report not found.</p>;

  const statusColor = {
    working:     { bg: "#d4edda", color: "#155724" },
    pending:     { bg: "#f8d7da", color: "#721c24" },
    under_repair:{ bg: "#fff3cd", color: "#856404" },
    assigned:    { bg: "#cce5ff", color: "#004085" },
    resolved:    { bg: "#d4edda", color: "#155724" },
  };
  const sc = statusColor[report.status] || { bg: "#eee", color: "#333" };

  return (
    <div style={{ minHeight: "100vh", padding: "30px", background: "#f5f5f5" }}>

      {/* Back button */}
      <button
        onClick={() => navigate("/repair-dashboard")}
        style={{ marginBottom: "20px", padding: "8px 16px", cursor: "pointer" }}
      >
        ← Back
      </button>

      <h1>Repair Details</h1>

      <div style={{
        background: "white", padding: "25px", borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)", marginTop: "15px",
      }}>

        <p><strong>Report ID:</strong> {report.id}</p>
        <p><strong>Asset:</strong>     {report.asset_name}</p>
        <p><strong>Room:</strong>      {report.room_name}</p>
        <p><strong>Description:</strong> {report.description}</p>
        <p>
          <strong>Status:</strong>{" "}
          <span style={{
            padding: "3px 12px", borderRadius: "12px", fontSize: "13px",
            background: sc.bg, color: sc.color,
          }}>
            {report.status}
          </span>
        </p>
        <p><strong>Reported at:</strong> {new Date(report.created_at).toLocaleString()}</p>

        {/* FIX: Repairer action buttons are now wired to updateStatus() */}
        {isRepairer && report.status !== "resolved" && (
          <div style={{ marginTop: "25px", display: "flex", gap: "12px" }}>
            <button
              onClick={() => updateStatus("resolved")}
              disabled={updating}
              style={{
                padding: "10px 20px", cursor: "pointer",
                background: "#28a745", color: "white", border: "none", borderRadius: "6px",
              }}
            >
              {updating ? "Updating..." : "Mark Resolved"}
            </button>

            <button
              onClick={() => updateStatus("pending")}
              disabled={updating}
              style={{
                padding: "10px 20px", cursor: "pointer",
                background: "#ffc107", color: "#333", border: "none", borderRadius: "6px",
              }}
            >
              Keep Pending
            </button>
          </div>
        )}

        {message && (
          <p style={{ marginTop: "15px", color: "#555" }}>{message}</p>
        )}
      </div>
    </div>
  );
}

export default RepairDetails;