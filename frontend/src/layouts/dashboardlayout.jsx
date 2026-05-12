import { Link, Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div style={{ display: "flex" }}>

      {/* Sidebar */}
      <div
        style={{
          width: "220px",
          minHeight: "100vh",
          background: "#222",
          color: "white",
          padding: "20px",
        }}
      >
        <h2>Campus Assets</h2>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            marginTop: "20px",
          }}
        >
          <Link to="/dashboard">
            Dashboard
          </Link>

          <Link to="/rooms">
            Rooms
          </Link>

          <Link to="/reports">
            Reports
          </Link>

          <Link to="/analytics">
            Analytics
          </Link>
        </nav>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          padding: "20px",
        }}
      >
        <Outlet />
      </div>

    </div>
  );
}

export default DashboardLayout;