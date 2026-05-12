import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Dashboard() {
  const navigate = useNavigate();
  const [building, setBuilding] = useState("");
  const [block, setBlock] = useState("");
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div>
          <h1>
            Campus Asset Management Dashboard
          </h1>

          <p>
            Welcome, {user?.name}
          </p>
        </div>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Main Section */}
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2>Infrastructure Navigation</h2>

        <p>
          Select a location to access room monitoring
        </p>

        <div
          style={{
            display: "flex",
            gap: "15px",
            marginTop: "20px",
            flexWrap: "wrap",
          }}
        >

          {/* Building */}
          <select
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
          >
            <option value="">
              Select Building
            </option>

            <option value="Academic Complex">
              Academic Complex
            </option>

            <option value="Library">
              Library
            </option>
          </select>

          {/* Block */}
          <select
            value={block}
            onChange={(e) => setBlock(e.target.value)}
          >
            <option value="">
              Select Block
            </option>

            <option value="A">
              Block A
            </option>

            <option value="B">
              Block B
            </option>
          </select>

          {/* Floor */}
          <select
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
          >
            <option value="">
              Select Floor
            </option>

            <option value="1">
              Floor 1
            </option>

            <option value="2">
              Floor 2
            </option>
          </select>

          {/* Room */}
          <select
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          >
            <option value="">
              Select Room
            </option>

            <option value="A-201">
              A-201
            </option>

            <option value="A-202">
              A-202
            </option>
          </select>

        </div>
        <div style={{ marginTop: "20px" }}>
          <strong>Selected:</strong>

          {" "}
          {building || "—"}
          {" > "}
          {block || "—"}
          {" > "}
          {floor || "—"}
          {" > "}
          {room || "—"}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;