import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function AdminSettings() {
  const [domains,    setDomains]    = useState([]);
  const [newDomain,  setNewDomain]  = useState("");
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState("");
  const [error,      setError]      = useState("");
  const token = localStorage.getItem("token");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  useEffect(() => {
    fetch(`${API_URL}/admin/domains`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setDomains(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const handleAdd = async () => {
    setError("");
    if (!newDomain.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/admin/domains`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ domain: newDomain.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed"); return; }
      setDomains(prev => [...prev, data]);
      setNewDomain("");
      showToast(`✓ ${data.domain} added`);
    } finally { setSaving(false); }
  };

  const handleDelete = async (domain) => {
    const res = await fetch(`${API_URL}/admin/domains/${domain.id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || "Failed"); return; }
    setDomains(prev => prev.filter(d => d.id !== domain.id));
    showToast(`✓ ${domain.domain} removed`);
  };

  if (loading) return <div style={{ padding: "40px", color: "#aaa" }}>Loading...</div>;

  return (
    <div style={{ padding: "32px", maxWidth: "600px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a2e", marginBottom: "4px" }}>
        Settings
      </h1>
      <p style={{ color: "#888", fontSize: "14px", marginBottom: "32px" }}>
        Configure which email domains are allowed to register
      </p>

      {/* Allowed Domains */}
      <div style={{ background: "white", borderRadius: "10px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "600", margin: "0 0 4px" }}>
            Allowed Email Domains
          </h2>
          <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>
            Only users with these email domains can register. Changing this does not affect existing users.
          </p>
        </div>

        {/* Current domains */}
        <div style={{ padding: "16px 24px" }}>
          {domains.length === 0 ? (
            <p style={{ color: "#bbb", fontSize: "14px" }}>
              No domains configured — all registrations will be blocked.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
              {domains.map(d => (
                <div key={d.id} style={{ display: "flex", alignItems: "center",
                  justifyContent: "space-between", padding: "10px 14px",
                  background: "#f8f8f8", borderRadius: "8px" }}>
                  <div>
                    <span style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: "500" }}>
                      @{d.domain}
                    </span>
                    <span style={{ fontSize: "12px", color: "#aaa", marginLeft: "10px" }}>
                      Added {new Date(d.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <button onClick={() => handleDelete(d)}
                    style={{ border: "none", background: "#fdecea", color: "#c0392b",
                      borderRadius: "6px", padding: "5px 12px", cursor: "pointer", fontSize: "12px" }}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new domain */}
          <div style={{ borderTop: domains.length > 0 ? "1px solid #f0f0f0" : "none",
            paddingTop: domains.length > 0 ? "16px" : "0" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#555",
              display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Add Domain
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <span style={{ position: "absolute", left: "10px", top: "50%",
                  transform: "translateY(-50%)", color: "#aaa", fontSize: "14px" }}>@</span>
                <input
                  value={newDomain}
                  onChange={e => { setNewDomain(e.target.value); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleAdd()}
                  placeholder="iitg.ac.in"
                  style={{ width: "100%", padding: "9px 12px 9px 28px", borderRadius: "6px",
                    border: error ? "1px solid #e74c3c" : "1px solid #ddd",
                    fontSize: "14px", boxSizing: "border-box", fontFamily: "monospace" }}
                />
              </div>
              <button onClick={handleAdd} disabled={saving || !newDomain.trim()}
                style={{ padding: "9px 20px", borderRadius: "7px", cursor: "pointer",
                  border: "none", background: "#1a1a2e", color: "white", fontSize: "14px",
                  opacity: saving || !newDomain.trim() ? 0.6 : 1 }}>
                {saving ? "Adding..." : "Add"}
              </button>
            </div>
            {error && <p style={{ color: "#e74c3c", fontSize: "13px", marginTop: "6px" }}>{error}</p>}
            <p style={{ fontSize: "12px", color: "#aaa", marginTop: "8px" }}>
              Example: iitg.ac.in, bits-pilani.ac.in, iitb.ac.in
            </p>
          </div>
        </div>
      </div>

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

export default AdminSettings;