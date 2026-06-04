import { useEffect, useState, useRef, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ASSET_TYPES    = ["fan", "light", "tap", "projector", "ac", "door", "window", "other"];
const STATUS_OPTIONS = ["working", "pending", "under_repair"];
const STATUS_COLOR   = { working: "#27ae60", pending: "#e74c3c", under_repair: "#f39c12" };

// ─── Reusable UI ──────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "white", borderRadius: "12px", padding: "28px",
        width: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>{title}</h3>
          <button onClick={onClose} style={{ border: "none", background: "none",
            fontSize: "20px", cursor: "pointer", color: "#888" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inp = { width: "100%", padding: "9px 12px", borderRadius: "6px",
  border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" };

const btn = (v = "primary") => ({
  padding: "9px 20px", borderRadius: "7px", cursor: "pointer", fontSize: "14px",
  fontWeight: "500", border: "none",
  background: v === "primary" ? "#1a1a2e" : v === "danger" ? "#e74c3c" : "#f0f0f0",
  color: v === "secondary" ? "#333" : "white",
});

// ─── Add Room Modal ────────────────────────────────────────────────────────────

function AddRoomModal({ onClose, onCreated, token }) {
  const [form, setForm] = useState({ name: "", building: "", block: "", floor: "", image_url: "" });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const handle = async () => {
    if (!form.name || !form.building || !form.floor) {
      setError("Name, building and floor are required"); return;
    }
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API_URL}/admin/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed"); setSaving(false); return; }
      onCreated(data);
      onClose();
    } catch { setError("Something went wrong"); setSaving(false); }
  };

  const f = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <Modal title="Add New Room" onClose={onClose}>
      {error && <p style={{ color: "#e74c3c", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <label style={{ fontSize: "12px", fontWeight: "600", color: "#555",
            display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Room Name *
          </label>
          <input style={inp} value={form.name} onChange={f("name")} placeholder="e.g. A-201" autoFocus />
        </div>
        <div>
          <label style={{ fontSize: "12px", fontWeight: "600", color: "#555",
            display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Building *
          </label>
          <input style={inp} value={form.building} onChange={f("building")} placeholder="e.g. Academic Complex" />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#555",
              display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Block
            </label>
            <input style={inp} value={form.block} onChange={f("block")} placeholder="e.g. A" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#555",
              display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Floor *
            </label>
            <input style={inp} value={form.floor} onChange={f("floor")} placeholder="e.g. 2" />
          </div>
        </div>
        <div>
          <label style={{ fontSize: "12px", fontWeight: "600", color: "#555",
            display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Room Image URL
          </label>
          <input style={inp} value={form.image_url} onChange={f("image_url")}
            placeholder="https://... (optional)" />
          {form.image_url && (
            <img src={form.image_url} alt="preview"
              style={{ width: "100%", height: "100px", objectFit: "cover",
                borderRadius: "6px", marginTop: "8px" }}
              onError={e => e.target.style.display = "none"}
            />
          )}
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}>
          <button style={btn("secondary")} onClick={onClose}>Cancel</button>
          <button style={btn()} disabled={saving} onClick={handle}>
            {saving ? "Creating..." : "Create Room"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main RoomEditor ───────────────────────────────────────────────────────────

function RoomEditor() {
  const token = localStorage.getItem("token");

  const [rooms,         setRooms]         = useState([]);
  const [selectedRoom,  setSelectedRoom]  = useState(null);
  const [assets,        setAssets]        = useState([]);
  const [roomData,      setRoomData]      = useState(null);
  const [mode,          setMode]          = useState("view");
  const [pendingClick,  setPendingClick]  = useState(null);
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingAsset,  setEditingAsset]  = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [dragState,     setDragState]     = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [toast,         setToast]         = useState("");
  const [newAsset,      setNewAsset]      = useState({ name: "", type: "fan" });
  const [editForm,      setEditForm]      = useState({ name: "", type: "", status: "" });

  const mapRef = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  useEffect(() => {
    fetch(`${API_URL}/admin/rooms`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setRooms(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    if (!selectedRoom) return;
    fetch(`${API_URL}/admin/rooms/${selectedRoom}/assets`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(d => { setRoomData(d.room); setAssets(d.assets || []); });
  }, [selectedRoom]);

  // ── Map click to place ─────────────────────────────────────────────────────
  const handleMapClick = useCallback((e) => {
    if (mode !== "place" || dragState) return;
    const rect = mapRef.current.getBoundingClientRect();
    setPendingClick({ x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top) });
    setNewAsset({ name: "", type: "fan" });
    setShowAddModal(true);
  }, [mode, dragState]);

  // ── Create asset — BUG FIX: POST to /rooms/:roomId/assets not /rooms/:id/assets
  const handleCreateAsset = async () => {
    if (!newAsset.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/admin/rooms/${selectedRoom}/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: newAsset.name.trim(),
          type: newAsset.type,
          x_position: pendingClick.x,
          y_position: pendingClick.y,
        }),
      });
      const created = await res.json();
      if (!res.ok) { showToast(created.error || "Failed to place asset"); return; }
      setAssets(prev => [...prev, created]);
      setShowAddModal(false);
      setPendingClick(null);
      setMode("view");
      showToast(`✓ ${created.name} placed`);
    } finally { setSaving(false); }
  };

  // ── Drag to reposition ─────────────────────────────────────────────────────
  const handleDotMouseDown = (e, asset) => {
    e.stopPropagation();
    if (mode !== "view") return;
    const startMouseX = e.clientX, startMouseY = e.clientY;
    const startX = asset.x_position, startY = asset.y_position;
    let moved = false;

    const onMove = (me) => {
      const dx = me.clientX - startMouseX, dy = me.clientY - startMouseY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
      const rect = mapRef.current.getBoundingClientRect();
      const newX = Math.max(0, Math.min(rect.width,  startX + dx));
      const newY = Math.max(0, Math.min(rect.height, startY + dy));
      setAssets(prev => prev.map(a =>
        a.id === asset.id ? { ...a, x_position: Math.round(newX), y_position: Math.round(newY) } : a
      ));
    };

    const onUp = async (me) => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      setDragState(null);
      if (!moved) {
        setEditingAsset(asset);
        setEditForm({ name: asset.name, type: asset.type, status: asset.status });
        return;
      }
      const rect = mapRef.current.getBoundingClientRect();
      const dx = me.clientX - startMouseX, dy = me.clientY - startMouseY;
      const newX = Math.max(0, Math.min(rect.width,  startX + dx));
      const newY = Math.max(0, Math.min(rect.height, startY + dy));
      const res = await fetch(`${API_URL}/admin/assets/${asset.id}/position`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ x_position: Math.round(newX), y_position: Math.round(newY) }),
      });
      if (!res.ok) {
        setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, x_position: startX, y_position: startY } : a));
        showToast("Failed to save position");
      } else { showToast("Position saved"); }
    };

    setDragState({ assetId: asset.id });
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/admin/assets/${editingAsset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      const updated = await res.json();
      if (!res.ok) { showToast(updated.error || "Failed"); return; }
      setAssets(prev => prev.map(a => a.id === updated.id ? updated : a));
      setEditingAsset(null);
      showToast("✓ Asset updated");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/admin/assets/${confirmDelete.id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Failed"); return; }
      setAssets(prev => prev.filter(a => a.id !== confirmDelete.id));
      setConfirmDelete(null);
      showToast("✓ Asset deleted");
    } finally { setSaving(false); }
  };

  // Group rooms by building for the sidebar
  const roomsByBuilding = rooms.reduce((acc, room) => {
    const key = room.building || "Uncategorized";
    if (!acc[key]) acc[key] = [];
    acc[key].push(room);
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

      {/* Room sidebar */}
      <div style={{ width: "220px", background: "white", borderRight: "1px solid #eee",
        display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #f0f0f0",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a2e" }}>Rooms</span>
          <button onClick={() => setShowRoomModal(true)}
            style={{ padding: "4px 10px", borderRadius: "5px", cursor: "pointer",
              border: "none", background: "#1a1a2e", color: "white", fontSize: "12px" }}>
            + Add
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {Object.entries(roomsByBuilding).map(([building, bRooms]) => (
            <div key={building}>
              <div style={{ fontSize: "11px", color: "#aaa", fontWeight: "600",
                letterSpacing: "0.5px", padding: "8px 8px 4px",
                textTransform: "uppercase" }}>
                {building}
              </div>
              {bRooms.map(room => (
                <button key={room.id} onClick={() => { setSelectedRoom(room.id); setMode("view"); }}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "8px 10px", borderRadius: "6px", cursor: "pointer",
                    border: "none", marginBottom: "2px", fontSize: "13px",
                    background: selectedRoom === room.id ? "#1a1a2e" : "transparent",
                    color: selectedRoom === room.id ? "white" : "#444",
                  }}>
                  {room.name}
                  <span style={{ fontSize: "11px", opacity: 0.6, display: "block" }}>
                    {room.block ? `Block ${room.block} · ` : ""}Floor {room.floor}
                  </span>
                </button>
              ))}
            </div>
          ))}
          {rooms.length === 0 && (
            <p style={{ fontSize: "13px", color: "#bbb", textAlign: "center", marginTop: "20px" }}>
              No rooms yet
            </p>
          )}
        </div>
      </div>

      {/* Main editor */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {!selectedRoom ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            color: "#bbb", flexDirection: "column", gap: "12px" }}>
            <span style={{ fontSize: "14px" }}>Select a room from the sidebar to start editing</span>
            <button onClick={() => setShowRoomModal(true)}
              style={{ ...btn(), fontSize: "13px", padding: "8px 18px" }}>
              + Add Your First Room
            </button>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div style={{ background: "white", padding: "12px 16px", borderBottom: "1px solid #eee",
              display: "flex", gap: "10px", alignItems: "center" }}>
              <span style={{ fontWeight: "600", fontSize: "14px", marginRight: "8px" }}>
                {roomData?.name}
              </span>
              <button onClick={() => setMode("view")}
                style={{ ...btn(mode === "view" ? "primary" : "secondary"), padding: "6px 14px", fontSize: "13px" }}>
                ↖ Select / Drag
              </button>
              <button onClick={() => setMode("place")}
                style={{ ...btn(mode === "place" ? "primary" : "secondary"), padding: "6px 14px", fontSize: "13px" }}>
                + Place Asset
              </button>
              <span style={{ fontSize: "12px", color: "#aaa", marginLeft: "4px" }}>
                {mode === "place"
                  ? "Click on the map to place an asset"
                  : "Click an asset to edit · Drag to reposition"}
              </span>
            </div>

            {/* Map */}
            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              <div ref={mapRef} onClick={handleMapClick}
                style={{ position: "relative", width: "100%", height: "100%",
                  background: "#2c2c3e", cursor: mode === "place" ? "crosshair" : "default",
                  userSelect: "none" }}>

                {roomData?.image_url ? (
                  <img src={roomData.image_url} alt="room"
                    draggable={false}
                    style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: "rgba(255,255,255,0.15)", fontSize: "14px" }}>
                    No room image — asset positions will still be saved correctly
                  </div>
                )}

                {pendingClick && (
                  <div style={{ position: "absolute", left: `${pendingClick.x}px`, top: `${pendingClick.y}px`,
                    transform: "translate(-50%,-50%)", width: "22px", height: "22px",
                    borderRadius: "50%", background: "rgba(255,255,255,0.5)",
                    border: "2px dashed white", pointerEvents: "none" }} />
                )}

                {assets.map(asset => (
                  <div key={asset.id} title={`${asset.name} — ${asset.status}`}
                    onMouseDown={(e) => handleDotMouseDown(e, asset)}
                    style={{
                      position: "absolute",
                      left: `${asset.x_position}px`, top: `${asset.y_position}px`,
                      transform: "translate(-50%,-50%)",
                      width: "20px", height: "20px", borderRadius: "50%",
                      cursor: mode === "view" ? "grab" : "not-allowed",
                      border: "2.5px solid white",
                      background: STATUS_COLOR[asset.status] || "#888",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                      zIndex: dragState?.assetId === asset.id ? 10 : 1,
                    }} />
                ))}
              </div>
            </div>

            {/* Asset list strip at bottom */}
            <div style={{ background: "white", borderTop: "1px solid #eee",
              maxHeight: "180px", overflowY: "auto" }}>
              <div style={{ padding: "10px 16px", fontSize: "12px", fontWeight: "600",
                color: "#888", borderBottom: "1px solid #f5f5f5" }}>
                {assets.length} asset{assets.length !== 1 ? "s" : ""} in this room
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "10px 16px" }}>
                {assets.map(asset => (
                  <div key={asset.id} style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "5px 10px", borderRadius: "6px", background: "#f8f8f8",
                    fontSize: "12px",
                  }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%",
                      background: STATUS_COLOR[asset.status] || "#888" }} />
                    <span>{asset.name}</span>
                    <span style={{ color: "#aaa" }}>({asset.type})</span>
                    <button onClick={() => { setEditingAsset(asset); setEditForm({ name: asset.name, type: asset.type, status: asset.status }); }}
                      style={{ border: "none", background: "none", cursor: "pointer",
                        color: "#888", fontSize: "11px", padding: "0 2px" }}>✏️</button>
                    <button onClick={() => setConfirmDelete(asset)}
                      style={{ border: "none", background: "none", cursor: "pointer",
                        color: "#e74c3c", fontSize: "11px", padding: "0 2px" }}>🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      {selectedRoom && (
        <div style={{ position: "absolute", bottom: "200px", right: "16px",
          background: "rgba(255,255,255,0.95)", borderRadius: "8px", padding: "10px 14px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontSize: "12px" }}>
          {Object.entries(STATUS_COLOR).map(([s, c]) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }} />
              {s}
            </div>
          ))}
        </div>
      )}

      {/* ── Add Room Modal ── */}
      {showRoomModal && (
        <AddRoomModal
          token={token}
          onClose={() => setShowRoomModal(false)}
          onCreated={(room) => {
            setRooms(prev => [...prev, room]);
            setSelectedRoom(room.id);
            showToast(`✓ Room "${room.name}" created`);
          }}
        />
      )}

      {/* ── Add Asset Modal ── */}
      {showAddModal && (
        <Modal title="Place New Asset" onClose={() => { setShowAddModal(false); setPendingClick(null); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#555",
                display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Asset Name
              </label>
              <input style={inp} autoFocus placeholder="e.g. Ceiling Fan 1"
                value={newAsset.name}
                onChange={e => setNewAsset(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#555",
                display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Type
              </label>
              <select style={inp} value={newAsset.type}
                onChange={e => setNewAsset(p => ({ ...p, type: e.target.value }))}>
                {ASSET_TYPES.map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>
              Position: ({pendingClick?.x}, {pendingClick?.y})
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button style={btn("secondary")} onClick={() => { setShowAddModal(false); setPendingClick(null); }}>
                Cancel
              </button>
              <button style={btn()} disabled={saving || !newAsset.name.trim()} onClick={handleCreateAsset}>
                {saving ? "Saving..." : "Place Asset"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Edit Asset Modal ── */}
      {editingAsset && (
        <Modal title="Edit Asset" onClose={() => setEditingAsset(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {["name", "type", "status"].map(field => (
              <div key={field}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#555",
                  display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {field}
                </label>
                {field === "name" ? (
                  <input style={inp} value={editForm.name}
                    onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
                ) : (
                  <select style={inp} value={editForm[field]}
                    onChange={e => setEditForm(p => ({ ...p, [field]: e.target.value }))}>
                    {(field === "type" ? ASSET_TYPES : STATUS_OPTIONS).map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
            <div style={{ display: "flex", gap: "10px", justifyContent: "space-between", marginTop: "4px" }}>
              <button style={btn("danger")} onClick={() => { setConfirmDelete(editingAsset); setEditingAsset(null); }}>
                Delete
              </button>
              <div style={{ display: "flex", gap: "10px" }}>
                <button style={btn("secondary")} onClick={() => setEditingAsset(null)}>Cancel</button>
                <button style={btn()} disabled={saving} onClick={handleSaveEdit}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Confirm Delete ── */}
      {confirmDelete && (
        <Modal title="Delete Asset" onClose={() => setConfirmDelete(null)}>
          <p style={{ color: "#555", fontSize: "14px", marginBottom: "20px" }}>
            Delete <strong>{confirmDelete.name}</strong>? Assets with open reports cannot be deleted.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button style={btn("secondary")} onClick={() => setConfirmDelete(null)}>Cancel</button>
            <button style={btn("danger")} disabled={saving} onClick={handleDelete}>
              {saving ? "Deleting..." : "Delete"}
            </button>
          </div>
        </Modal>
      )}

      {/* Toast */}
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

export default RoomEditor;