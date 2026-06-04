import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import RoomMap from "../components/RoomMap";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user  = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [rooms,    setRooms]    = useState([]);
  const [building, setBuilding] = useState("");
  const [block,    setBlock]    = useState("");
  const [floor,    setFloor]    = useState("");
  const [roomId,   setRoomId]   = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/rooms`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : [];
        setRooms(list);

        // Pre-select room if arriving from a QR scan (?room=<id>)
        const qrRoomId = searchParams.get("room") || sessionStorage.getItem("qr_room_id");
        if (qrRoomId) {
          const found = list.find(r => r.id === parseInt(qrRoomId));
          if (found) {
            setBuilding(found.building || "");
            setBlock(found.block || "");
            setFloor(found.floor || "");
            setRoomId(found.id);
            sessionStorage.removeItem("qr_room_id");
          }
        }
      });
  }, [token, searchParams]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const buildings   = [...new Set(rooms.map(r => r.building).filter(Boolean))];
  const blocks      = [...new Set(rooms.filter(r => r.building === building).map(r => r.block).filter(Boolean))];
  const floors      = [...new Set(rooms.filter(r => r.building === building && (!block || r.block === block)).map(r => r.floor).filter(Boolean))];
  const roomsInFloor = rooms.filter(r => r.building === building && (!block || r.block === block) && r.floor === floor);

  return (
    <div style={{ minHeight: "100vh", padding: "30px", background: "#f5f5f5" }}>
      <div style={{ background: "white", padding: "20px", borderRadius: "10px",
        marginBottom: "25px", display: "flex", justifyContent: "space-between",
        alignItems: "center", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
        <div>
          <h1>Campus Asset Dashboard</h1>
          <p>Welcome, {user?.name}</p>
        </div>
        <button onClick={handleLogout} style={{ padding: "10px 15px", cursor: "pointer" }}>Logout</button>
      </div>

      <div style={{ background: "white", padding: "25px", borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
        <h2>Infrastructure Navigation</h2>
        <p>Select a location to access room monitoring</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginTop: "20px" }}>
          <select value={building} onChange={e => { setBuilding(e.target.value); setBlock(""); setFloor(""); setRoomId(null); }} style={{ padding: "10px" }}>
            <option value="">Select Building</option>
            {buildings.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={block} onChange={e => { setBlock(e.target.value); setFloor(""); setRoomId(null); }} style={{ padding: "10px" }} disabled={!building}>
            <option value="">Select Block</option>
            {blocks.map(b => <option key={b} value={b}>Block {b}</option>)}
          </select>
          <select value={floor} onChange={e => { setFloor(e.target.value); setRoomId(null); }} style={{ padding: "10px" }} disabled={!building}>
            <option value="">Select Floor</option>
            {floors.map(f => <option key={f} value={f}>Floor {f}</option>)}
          </select>
          <select value={roomId || ""} onChange={e => setRoomId(parseInt(e.target.value) || null)} style={{ padding: "10px" }} disabled={!floor}>
            <option value="">Select Room</option>
            {roomsInFloor.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div style={{ marginTop: "25px" }}>
          <strong>Selected:</strong>{" "}
          {building || "—"} {" > "} {block || "—"} {" > "} {floor || "—"} {" > "}
          {rooms.find(r => r.id === roomId)?.name || "—"}
        </div>
      </div>

      {roomId && (
        <div style={{ marginTop: "30px" }}>
          <RoomMap roomId={roomId} role="reporter" />
        </div>
      )}
    </div>
  );
}

export default Dashboard;