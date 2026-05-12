import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

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
        <h2>Room Monitoring</h2>

        <p>
          Interactive spatial asset tracking system
        </p>
      </div>
    </div>
  );
}

export default Dashboard;