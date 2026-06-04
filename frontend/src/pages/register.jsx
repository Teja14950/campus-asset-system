import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Register() {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "reporter",
  });
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // Show the server message (which explains pending approval if repairer)
      setSuccess(data.message || "Registered successfully");
      setTimeout(() => navigate("/login"), 2500);

    } catch (err) {
      setError("Something went wrong");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center",
      alignItems: "center", background: "#f5f5f5" }}>
      <div style={{ width: "420px", background: "white", padding: "35px",
        borderRadius: "10px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>

        <h2 style={{ textAlign: "center", marginBottom: "6px" }}>Register</h2>
        <p style={{ textAlign: "center", fontSize: "13px", color: "#888", marginBottom: "20px" }}>
          Institutional email required
        </p>

        {error && (
          <p style={{ color: "#e74c3c", background: "#fdecea", padding: "10px",
            borderRadius: "6px", fontSize: "13px", marginBottom: "14px" }}>
            {error}
          </p>
        )}
        {success && (
          <p style={{ color: "#155724", background: "#d4edda", padding: "10px",
            borderRadius: "6px", fontSize: "13px", marginBottom: "14px" }}>
            {success} — redirecting to login...
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
          <input type="text"     name="name"     placeholder="Full Name"
            value={formData.name}     onChange={handleChange} required style={{ padding: "10px" }} />
          <input type="email"    name="email"    placeholder="Institutional Email (e.g. you@iitg.ac.in)"
            value={formData.email}    onChange={handleChange} required style={{ padding: "10px" }} />
          <input type="password" name="password" placeholder="Password"
            value={formData.password} onChange={handleChange} required style={{ padding: "10px" }} />

          <div>
            <select name="role" value={formData.role} onChange={handleChange}
              style={{ padding: "10px", width: "100%" }}>
              <option value="reporter">Reporter</option>
              <option value="repairer">Repairer (requires admin approval)</option>
            </select>
            {formData.role === "repairer" && (
              <p style={{ fontSize: "12px", color: "#888", marginTop: "6px" }}>
                You'll be registered as a reporter first. Your repairer request will be reviewed by an admin.
              </p>
            )}
          </div>

          <button type="submit" style={{ padding: "12px", cursor: "pointer", marginTop: "4px" }}>
            Register
          </button>
        </form>

        <p style={{ marginTop: "15px", textAlign: "center", fontSize: "14px" }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;