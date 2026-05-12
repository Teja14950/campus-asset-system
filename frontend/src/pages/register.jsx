import { useState } from "react";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "reporter",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:3000/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      console.log(data);

      if (!response.ok) {
        alert(data.error || "Registration failed");
        return;
      }

      alert("Registration successful!");

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "reporter",
      });

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>

        <div>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="reporter">
              Reporter
            </option>

            <option value="repair_person">
              Repair Person
            </option>

            <option value="admin">
              Admin
            </option>
          </select>
        </div>

        <br />

        <button type="submit">
          Register
        </button>

      </form>
    </div>
  );
}

export default Register;