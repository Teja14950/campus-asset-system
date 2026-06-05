const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // ── Domain validation ──────────────────────────────────────────────────
    // Check against admin-configured allowed domains
    const emailDomain = email.split("@")[1];
    if (!emailDomain) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const domainCheck = await pool.query(
      "SELECT id FROM allowed_domains WHERE domain = $1",
      [emailDomain]
    );

    if (domainCheck.rows.length === 0) {
      // Fetch all allowed domains to show a helpful error
      const allDomains = await pool.query("SELECT domain FROM allowed_domains");
      const list = allDomains.rows.map(d => d.domain).join(", ");
      return res.status(403).json({
        error: `Registration is restricted to institutional emails. Allowed domains: ${list || "none configured"}`
      });
    }

    // ── Everyone starts as reporter ────────────────────────────────────────
    // FIX: Regardless of what role was selected, assign reporter.
    // If they wanted repairer, a role_request is created for admin approval.
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'reporter')
       RETURNING id, name, email, role`,
      [name, email, hashedPassword]
    );

    const user = result.rows[0];

    // ── Auto-create repairer request if they asked for it ─────────────────
    let requestCreated = false;
    if (role === "repairer") {
      await pool.query(
        `INSERT INTO role_requests (user_id, requested_role, status)
         VALUES ($1, 'repairer', 'pending')
         ON CONFLICT (user_id, requested_role) DO NOTHING`,
        [user.id]
      );
      requestCreated = true;
    }

    res.status(201).json({
      ...user,
      message: requestCreated
        ? "Registered as reporter. Your repairer role request is pending admin approval."
        : "Registered successfully.",
    });

  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1", [email]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};