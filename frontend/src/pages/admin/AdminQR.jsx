import { useEffect, useState } from "react";
import RoomQRCard from "../../components/RoomQRCard";

const API_URL  = import.meta.env.VITE_API_URL  || "http://localhost:3000";
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5173";

function AdminQR() {
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_URL}/admin/rooms`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setRooms(Array.isArray(d) ? d : []); setLoading(false); });
  }, [token]);

  const filtered = rooms.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.building.toLowerCase().includes(search.toLowerCase())
  );

  // Group by building
  const byBuilding = filtered.reduce((acc, room) => {
    const key = room.building || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(room);
    return acc;
  }, {});

  if (loading) return <div style={{ padding: "40px", color: "#aaa" }}>Loading...</div>;

  return (
    <div style={{ padding: "32px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a2e", marginBottom: "4px" }}>
        QR Codes
      </h1>
      <p style={{ color: "#888", fontSize: "14px", marginBottom: "24px" }}>
        Print and post these in each room. Scanning opens the reporting interface directly.
      </p>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search rooms..."
        style={{ padding: "9px 14px", borderRadius: "8px", border: "1px solid #ddd",
          fontSize: "14px", marginBottom: "28px", width: "280px" }}
      />

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#bbb",
          background: "white", borderRadius: "12px", border: "2px dashed #e0e0e0" }}>
          {rooms.length === 0
            ? "No rooms yet — add rooms in the Room Editor first"
            : "No rooms match your search"}
        </div>
      ) : (
        Object.entries(byBuilding).map(([building, bRooms]) => (
          <div key={building} style={{ marginBottom: "36px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#1a1a2e",
              marginBottom: "16px", paddingBottom: "8px",
              borderBottom: "1px solid #eee" }}>
              {building}
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
              {bRooms.map(room => (
                <RoomQRCard key={room.id} room={room} baseUrl={BASE_URL} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminQR;