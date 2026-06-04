import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Login failed"); return; }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // FIX: Admin now redirected to admin panel
      if (data.user.role === "repairer") navigate("/repair-dashboard");
      else if (data.user.role === "admin") navigate("/admin");
      else navigate("/dashboard");

    } catch {
      setError("Something went wrong");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center",
      alignItems: "center", background: "#f5f5f5" }}>
      <div style={{ width: "400px", background: "white", padding: "35px",
        borderRadius: "10px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
        <h2 style={{ textAlign: "center" }}>Login</h2>

        {error && (
          <p style={{ color: "#e74c3c", background: "#fdecea", padding: "10px",
            borderRadius: "6px", fontSize: "14px", marginTop: "10px" }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column",
          gap: "15px", marginTop: "20px" }}>
          <input type="email" name="email" placeholder="Email"
            value={formData.email} onChange={handleChange} required style={{ padding: "10px" }} />
          <input type="password" name="password" placeholder="Password"
            value={formData.password} onChange={handleChange} required style={{ padding: "10px" }} />
          <button type="submit" style={{ padding: "12px", cursor: "pointer" }}>Login</button>
        </form>

        <p style={{ marginTop: "15px", textAlign: "center" }}>
          New user? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;