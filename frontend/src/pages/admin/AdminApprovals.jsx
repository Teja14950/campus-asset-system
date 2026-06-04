import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const STATUS_STYLE = {
  pending:  { bg: "#fff3cd", color: "#856404" },
  approved: { bg: "#d4edda", color: "#155724" },
  rejected: { bg: "#f8d7da", color: "#721c24" },
};

function AdminApprovals() {
  const [requests,  setRequests]  = useState([]);
  const [selected,  setSelected]  = useState(new Set()); // selected request ids
  const [loading,   setLoading]   = useState(true);
  const [acting,    setActing]    = useState(false);
  const [toast,     setToast]     = useState("");
  const [filter,    setFilter]    = useState("pending"); // pending | approved | rejected | all
  const token = localStorage.getItem("token");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const fetchRequests = () => {
    setLoading(true);
    fetch(`${API_URL}/admin/role-requests`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { setRequests(Array.isArray(d) ? d : []); setLoading(false); });
  };

  useEffect(() => { fetchRequests(); }, []);

  const filtered = requests.filter(r => filter === "all" || r.status === filter);
  const pendingCount = requests.filter(r => r.status === "pending").length;

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const pendingIds = filtered.filter(r => r.status === "pending").map(r => r.id);
    if (selected.size === pendingIds.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pendingIds));
    }
  };

  const handleBulkAction = async (action) => {
    if (selected.size === 0) return;
    setActing(true);
    try {
      const res = await fetch(`${API_URL}/admin/role-requests/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ request_ids: Array.from(selected) }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Failed"); return; }
      showToast(`✓ ${data.message}`);
      setSelected(new Set());
      fetchRequests();
    } finally {
      setActing(false);
    }
  };

  if (loading) return <div style={{ padding: "40px", color: "#aaa" }}>Loading...</div>;

  return (
    <div style={{ padding: "32px" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a2e", margin: 0 }}>
            Role Approvals
          </h1>
          {pendingCount > 0 && (
            <span style={{ background: "#e74c3c", color: "white", borderRadius: "20px",
              padding: "2px 10px", fontSize: "12px", fontWeight: "600" }}>
              {pendingCount} pending
            </span>
          )}
        </div>
        <p style={{ color: "#888", fontSize: "14px" }}>
          Approve or reject repairer role requests. Select multiple to act in bulk.
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {["pending", "approved", "rejected", "all"].map(f => (
          <button key={f} onClick={() => { setFilter(f); setSelected(new Set()); }}
            style={{
              padding: "7px 16px", borderRadius: "20px", cursor: "pointer", fontSize: "13px",
              border: filter === f ? "none" : "1px solid #ddd",
              background: filter === f ? "#1a1a2e" : "white",
              color: filter === f ? "white" : "#555",
              fontWeight: filter === f ? "600" : "400",
            }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "pending" && pendingCount > 0 && ` (${pendingCount})`}
          </button>
        ))}
      </div>

      {/* Bulk action bar */}
      {filter === "pending" && filtered.length > 0 && (
        <div style={{ display: "flex", gap: "10px", alignItems: "center",
          marginBottom: "16px", padding: "12px 16px", background: "white",
          borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <input type="checkbox"
            checked={selected.size === filtered.filter(r => r.status === "pending").length && filtered.length > 0}
            onChange={toggleAll}
            style={{ width: "16px", height: "16px", cursor: "pointer" }}
          />
          <span style={{ fontSize: "13px", color: "#666", flex: 1 }}>
            {selected.size > 0 ? `${selected.size} selected` : "Select all"}
          </span>
          <button
            onClick={() => handleBulkAction("approve")}
            disabled={selected.size === 0 || acting}
            style={{ padding: "7px 18px", borderRadius: "6px", cursor: "pointer",
              border: "none", background: selected.size > 0 ? "#27ae60" : "#ccc",
              color: "white", fontSize: "13px", fontWeight: "500" }}>
            {acting ? "Processing..." : `Approve${selected.size > 0 ? ` (${selected.size})` : ""}`}
          </button>
          <button
            onClick={() => handleBulkAction("reject")}
            disabled={selected.size === 0 || acting}
            style={{ padding: "7px 18px", borderRadius: "6px", cursor: "pointer",
              border: "none", background: selected.size > 0 ? "#e74c3c" : "#ccc",
              color: "white", fontSize: "13px", fontWeight: "500" }}>
            {acting ? "Processing..." : `Reject${selected.size > 0 ? ` (${selected.size})` : ""}`}
          </button>
        </div>
      )}

      {/* Request cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#bbb",
          background: "white", borderRadius: "12px", border: "2px dashed #e0e0e0" }}>
          No {filter === "all" ? "" : filter} requests
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map(req => {
            const ss = STATUS_STYLE[req.status] || { bg: "#eee", color: "#555" };
            const isSelected = selected.has(req.id);
            const isPending  = req.status === "pending";
            return (
              <div key={req.id} style={{
                background: "white", borderRadius: "10px", padding: "20px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                border: isSelected ? "2px solid #1a1a2e" : "2px solid transparent",
                display: "flex", alignItems: "center", gap: "16px",
              }}>
                {/* Checkbox — only for pending */}
                {isPending && (
                  <input type="checkbox" checked={isSelected}
                    onChange={() => toggleSelect(req.id)}
                    style={{ width: "16px", height: "16px", cursor: "pointer", flexShrink: 0 }}
                  />
                )}

                {/* Avatar */}
                <div style={{
                  width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0,
                  background: "#1a1a2e", color: "white", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: "16px", fontWeight: "700",
                }}>
                  {req.user_name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600", fontSize: "15px", marginBottom: "2px" }}>
                    {req.user_name}
                  </div>
                  <div style={{ fontSize: "13px", color: "#666" }}>{req.user_email}</div>
                  <div style={{ fontSize: "12px", color: "#aaa", marginTop: "4px" }}>
                    Current role: <strong>{req.current_role}</strong>
                    {" · "}Requesting: <strong>{req.requested_role}</strong>
                    {" · "}
                    {new Date(req.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Status badge */}
                <span style={{ padding: "4px 14px", borderRadius: "20px", fontSize: "12px",
                  fontWeight: "600", background: ss.bg, color: ss.color, flexShrink: 0 }}>
                  {req.status}
                </span>

                {/* Individual quick actions for pending */}
                {isPending && (
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button
                      onClick={async () => {
                        setActing(true);
                        const res = await fetch(`${API_URL}/admin/role-requests/approve`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ request_ids: [req.id] }),
                        });
                        const data = await res.json();
                        showToast(res.ok ? `✓ ${req.user_name} approved` : data.error);
                        if (res.ok) fetchRequests();
                        setActing(false);
                      }}
                      disabled={acting}
                      style={{ padding: "6px 14px", borderRadius: "6px", cursor: "pointer",
                        border: "none", background: "#27ae60", color: "white", fontSize: "12px" }}>
                      Approve
                    </button>
                    <button
                      onClick={async () => {
                        setActing(true);
                        const res = await fetch(`${API_URL}/admin/role-requests/reject`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ request_ids: [req.id] }),
                        });
                        const data = await res.json();
                        showToast(res.ok ? `✓ ${req.user_name} rejected` : data.error);
                        if (res.ok) fetchRequests();
                        setActing(false);
                      }}
                      disabled={acting}
                      style={{ padding: "6px 14px", borderRadius: "6px", cursor: "pointer",
                        border: "none", background: "#fdecea", color: "#c0392b", fontSize: "12px" }}>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: "28px", left: "50%", transform: "translateX(-50%)",
          background: "#1a1a2e", color: "white", padding: "12px 24px",
          borderRadius: "8px", fontSize: "14px", zIndex: 2000,
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

export default AdminApprovals;