import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

function ReporterMyReports() {
  const [reports, setReports] =
    useState([]);

  const token =
    localStorage.getItem("token");

  useEffect(() => {
    fetch(
      `${API_URL}/reports/my-submissions`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) =>
        setReports(
          Array.isArray(data)
            ? data
            : []
        )
      )
      .catch(console.error);
  }, []);

  return (
    <div
      style={{
        padding: "30px",
      }}
    >
      <h1>My Reports</h1>

      <table
        style={{
          width: "100%",
          borderCollapse:
            "collapse",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr>
            <th>Asset</th>
            <th>Description</th>
            <th>Status</th>
            <th>Image</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td>
                {report.asset_name}
              </td>

              <td>
                {report.description}
              </td>

              <td>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    background:
                      report.status === "resolved"
                        ? "#d4edda"
                        : report.status === "assigned"
                        ? "#fff3cd"
                        : "#f8d7da",
                    color:
                      report.status === "resolved"
                        ? "#155724"
                        : report.status === "assigned"
                        ? "#856404"
                        : "#721c24",
                  }}
                >
                  {report.status}
                </span>
              </td>

              <td>
                {report.image_url ? (
                  <a
                    href={
                      report.image_url
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Image
                  </a>
                ) : (
                  "No Image"
                )}
              </td>

              <td>
                {new Date(
                  report.created_at
                ).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReporterMyReports;