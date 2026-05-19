import { Link } from "react-router-dom";

function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          textAlign: "center",
          background: "white",
          padding: "50px",
          borderRadius: "12px",
          boxShadow: "0 0 15px rgba(0,0,0,0.1)",
          width: "550px",
        }}
      >
        <h1>
          Campus Asset Management System
        </h1>

        <p
          style={{
            color: "gray",
            marginTop: "15px",
          }}
        >
          Realtime spatial asset tracking, QR-based issue reporting,
          and repair workflow management for organizations
        </p>

        <div
          style={{
            marginTop: "25px",
            display: "flex",
            justifyContent: "center",
            gap: "15px",
          }}
        >
          <Link to="/login">
            <button
              style={{
                padding: "10px 20px",
                cursor: "pointer",
              }}
            >
              Login
            </button>
          </Link>

          <Link to="/register">
            <button
              style={{
                padding: "10px 20px",
                cursor: "pointer",
              }}
            >
              Register
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;