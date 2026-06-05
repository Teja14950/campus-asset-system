import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// FIX: API_URL from env — no more hardcoded localhost
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function RepairerDashboard() {
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user  = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    fetch(`${API_URL}/reports/my-reports`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        // Guard against the API returning an error object
        setReports(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ minHeight: "100vh", padding: "30px", backgroundColor: "#f5f5f5" }}>

      {/* Header */}
      <div style={{
        background: "white", padding: "20px", borderRadius: "10px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: "20px", boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}>
        <div>
          <h1>Repair Dashboard</h1>
          <p>Welcome, {user?.name}</p>
        </div>
        <button onClick={handleLogout} style={{ padding: "10px 15px", cursor: "pointer" }}>
          Logout
        </button>
      </div>

      {/* Repairer Details */}
      <div style={{
        background: "white", padding: "20px", borderRadius: "10px",
        marginBottom: "20px", boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}>
        <h2>Repairer Details</h2>
        <p><strong>Name:</strong>  {user?.name}</p>
        {/* FIX: Original login only returned id/name/role — email was always undefined.
            authController now returns email too, so this works correctly. */}
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong>  {user?.role}</p>
      </div>

      {/* Assigned Reports */}
      <div style={{
        background: "white", padding: "20px", borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}>
        <h2>Assigned Reports</h2>

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #eee", textAlign: "left" }}>
              <th style={{ padding: "10px" }}>ID</th>
              {/* FIX: Was showing asset_id (an integer). getMyReports now joins
                  assets so asset_name is available in the response. */}
              <th style={{ padding: "10px" }}>Asset</th>
              <th style={{ padding: "10px" }}>Description</th>
              <th style={{ padding: "10px" }}>Image</th>
              <th style={{ padding: "10px" }}>Status</th>
            </tr>
          </thead>

          <tbody>
            {reports.length > 0 ? (
              reports.map((report) => (
                <tr
                  key={report.id}
                  onClick={() => navigate(`/repair/${report.id}`)}
                  style={{
                    cursor: "pointer",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f9f9f9"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                >
                  <td style={{ padding: "10px" }}>{report.id}</td>
                  <td style={{ padding: "10px" }}>{report.asset_name}</td>
                  <td style={{ padding: "10px" }}>{report.description}</td>
                  <td style={{ padding: "10px" }}>
                    {report.image_url ? (
                      <a
                        href={report.image_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        View Image
                      </a>
                    ) : (
                      <span
                        style={{
                          color: "#999",
                        }}
                      >
                        No Image
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "10px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: "12px", fontSize: "13px",
                      background:
                        report.status === "resolved"    ? "#d4edda" :
                        report.status === "under_repair" ? "#fff3cd" : "#f8d7da",
                      color:
                        report.status === "resolved"    ? "#155724" :
                        report.status === "under_repair" ? "#856404" : "#721c24",
                    }}>
                      {report.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#aaa" }}>
                  No reports assigned yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RepairerDashboard;