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
          padding: "40px",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <h1>
          Campus Asset Management System
        </h1>

        <p>
          Realtime repair tracking and spatial asset management
        </p>

        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
            gap: "15px",
          }}
        >
          <Link to="/login">
            <button>
              Login
            </button>
          </Link>

          <Link to="/register">
            <button>
              Register
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;