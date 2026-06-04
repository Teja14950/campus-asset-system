import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ROLE_COLOR = {
  admin:    { bg: "#ede9fe", color: "#5b21b6" },
  repairer: { bg: "#dbeafe", color: "#1d4ed8" },
  reporter: { bg: "#d1fae5", color: "#065f46" },
};

function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editRole,    setEditRole]    = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState("");
  const token = localStorage.getItem("token");
  const me    = JSON.parse(localStorage.getItem("user"));

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  useEffect(() => {
    fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setUsers(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const handleRoleUpdate = async () => {
    const res = await fetch(`${API_URL}/users/${editingUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: editingUser.name, email: editingUser.email, role: editRole }),
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || "Failed"); return; }
    setUsers(prev => prev.map(u => u.id === data.id ? data : u));
    setEditingUser(null);
    showToast("✓ Role updated");
  };

  const handleDelete = async () => {
    const res = await fetch(`${API_URL}/users/${confirmDelete.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) { showToast("Failed to delete"); return; }
    setUsers(prev => prev.filter(u => u.id !== confirmDelete.id));
    setConfirmDelete(null);
    showToast("✓ User deleted");
  };

  if (loading) return <div style={{ padding: "40px", color: "#aaa" }}>Loading...</div>;

  return (
    <div style={{ padding: "32px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a2e", marginBottom: "4px" }}>
        Users
      </h1>
      <p style={{ color: "#888", fontSize: "14px", marginBottom: "24px" }}>
        Manage roles and remove users
      </p>

      <div style={{ background: "white", borderRadius: "10px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafafa" }}>
              {["Name", "Email", "Role", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px",
                  color: "#888", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const rc = ROLE_COLOR[user.role] || { bg: "#eee", color: "#555" };
              const isMe = user.id === me?.id;
              return (
                <tr key={user.id} style={{ borderTop: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "500" }}>
                    {user.name} {isMe && <span style={{ fontSize: "11px", color: "#aaa" }}>(you)</span>}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#666" }}>{user.email}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px",
                      background: rc.bg, color: rc.color, fontWeight: "500" }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {!isMe && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => { setEditingUser(user); setEditRole(user.role); }}
                          style={{ padding: "5px 12px", borderRadius: "6px", cursor: "pointer",
                            border: "1px solid #ddd", background: "white", fontSize: "12px" }}>
                          Change Role
                        </button>
                        <button
                          onClick={() => setConfirmDelete(user)}
                          style={{ padding: "5px 12px", borderRadius: "6px", cursor: "pointer",
                            border: "none", background: "#fdecea", color: "#c0392b", fontSize: "12px" }}>
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit role modal */}
      {editingUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "28px",
            width: "340px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ marginBottom: "16px", fontSize: "16px" }}>Change Role</h3>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "16px" }}>
              User: <strong>{editingUser.name}</strong>
            </p>
            <select value={editRole} onChange={e => setEditRole(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: "6px",
                border: "1px solid #ddd", fontSize: "14px", marginBottom: "20px", boxSizing: "border-box" }}>
              <option value="reporter">Reporter</option>
              <option value="repairer">Repairer</option>
              <option value="admin">Admin</option>
            </select>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setEditingUser(null)}
                style={{ padding: "9px 18px", borderRadius: "7px", cursor: "pointer",
                  border: "none", background: "#f0f0f0", fontSize: "14px" }}>Cancel</button>
              <button onClick={handleRoleUpdate}
                style={{ padding: "9px 18px", borderRadius: "7px", cursor: "pointer",
                  border: "none", background: "#1a1a2e", color: "white", fontSize: "14px" }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "28px",
            width: "340px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ marginBottom: "12px", fontSize: "16px" }}>Delete User</h3>
            <p style={{ fontSize: "14px", color: "#555", marginBottom: "20px" }}>
              Delete <strong>{confirmDelete.name}</strong>? This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmDelete(null)}
                style={{ padding: "9px 18px", borderRadius: "7px", cursor: "pointer",
                  border: "none", background: "#f0f0f0", fontSize: "14px" }}>Cancel</button>
              <button onClick={handleDelete}
                style={{ padding: "9px 18px", borderRadius: "7px", cursor: "pointer",
                  border: "none", background: "#e74c3c", color: "white", fontSize: "14px" }}>Delete</button>
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

export default AdminUsers;