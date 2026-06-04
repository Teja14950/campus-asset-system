const pool = require("../db");

// ─── Role Requests ────────────────────────────────────────────────────────────

// GET /admin/role-requests — all pending requests
exports.getRoleRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT role_requests.id,
              role_requests.status,
              role_requests.requested_role,
              role_requests.created_at,
              users.id       AS user_id,
              users.name     AS user_name,
              users.email    AS user_email,
              users.role     AS current_role
       FROM role_requests
       JOIN users ON role_requests.user_id = users.id
       ORDER BY
         CASE WHEN role_requests.status = 'pending' THEN 0 ELSE 1 END,
         role_requests.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch role requests" });
  }
};

// POST /admin/role-requests/approve — approve one or many requests
exports.approveRoleRequests = async (req, res) => {
  const client = await pool.connect();
  try {
    const { request_ids } = req.body; // array of role_request ids

    if (!Array.isArray(request_ids) || request_ids.length === 0) {
      return res.status(400).json({ error: "request_ids must be a non-empty array" });
    }

    await client.query("BEGIN");

    // Mark requests as approved
    const requestResult = await client.query(
      `UPDATE role_requests
       SET status = 'approved', reviewed_at = NOW()
       WHERE id = ANY($1::int[]) AND status = 'pending'
       RETURNING user_id, requested_role`,
      [request_ids]
    );

    // Update each user's role
    for (const row of requestResult.rows) {
      await client.query(
        "UPDATE users SET role = $1 WHERE id = $2",
        [row.requested_role, row.user_id]
      );
    }

    await client.query("COMMIT");

    res.json({
      approved: requestResult.rows.length,
      message: `${requestResult.rows.length} request(s) approved`,
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Failed to approve requests" });
  } finally {
    client.release();
  }
};

// POST /admin/role-requests/reject — reject one or many requests
exports.rejectRoleRequests = async (req, res) => {
  try {
    const { request_ids } = req.body;

    if (!Array.isArray(request_ids) || request_ids.length === 0) {
      return res.status(400).json({ error: "request_ids must be a non-empty array" });
    }

    const result = await pool.query(
      `UPDATE role_requests
       SET status = 'rejected', reviewed_at = NOW()
       WHERE id = ANY($1::int[]) AND status = 'pending'
       RETURNING id`,
      [request_ids]
    );

    res.json({
      rejected: result.rows.length,
      message: `${result.rows.length} request(s) rejected`,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reject requests" });
  }
};

// ─── Rooms ────────────────────────────────────────────────────────────────────

// GET /admin/rooms
exports.getRooms = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM rooms ORDER BY building, block, floor, name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
};

// POST /admin/rooms — create a new room
exports.createRoom = async (req, res) => {
  try {
    const { name, building, block, floor, image_url } = req.body;

    if (!name || !building || !floor) {
      return res.status(400).json({ error: "name, building, and floor are required" });
    }

    const result = await pool.query(
      `INSERT INTO rooms (name, building, block, floor, image_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, building, block || null, floor, image_url || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "A room with this name already exists" });
    }
    res.status(500).json({ error: "Failed to create room" });
  }
};

// PATCH /admin/rooms/:id — update room details
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, building, block, floor, image_url } = req.body;

    const result = await pool.query(
      `UPDATE rooms SET
         name      = COALESCE($1, name),
         building  = COALESCE($2, building),
         block     = COALESCE($3, block),
         floor     = COALESCE($4, floor),
         image_url = COALESCE($5, image_url)
       WHERE id = $6 RETURNING *`,
      [name, building, block, floor, image_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update room" });
  }
};

// DELETE /admin/rooms/:id
exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    // Block deletion if room has assets with open reports
    const check = await pool.query(
      `SELECT COUNT(*) FROM assets
       JOIN reports ON assets.id = reports.asset_id
       WHERE assets.room_id = $1 AND reports.status != 'resolved'`,
      [id]
    );

    if (parseInt(check.rows[0].count) > 0) {
      return res.status(409).json({
        error: "Cannot delete room with open reports. Resolve all reports first."
      });
    }

    const result = await pool.query(
      "DELETE FROM rooms WHERE id = $1 RETURNING *", [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({ message: "Room deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete room" });
  }
};

// GET /admin/rooms/:id/assets
exports.getRoomAssets = async (req, res) => {
  try {
    const { id } = req.params;

    const roomResult = await pool.query("SELECT * FROM rooms WHERE id = $1", [id]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    const assetResult = await pool.query(
      `SELECT id, name, type, status, x_position, y_position
       FROM assets WHERE room_id = $1 ORDER BY name`,
      [id]
    );

    res.json({ room: roomResult.rows[0], assets: assetResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch assets" });
  }
};

// ─── Allowed Domains ──────────────────────────────────────────────────────────

// GET /admin/domains
exports.getDomains = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM allowed_domains ORDER BY created_at"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch domains" });
  }
};

// POST /admin/domains
exports.addDomain = async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ error: "domain is required" });

    // Basic domain format check
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return res.status(400).json({ error: "Invalid domain format (e.g. iitg.ac.in)" });
    }

    const result = await pool.query(
      "INSERT INTO allowed_domains (domain) VALUES ($1) RETURNING *",
      [domain.toLowerCase()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Domain already exists" });
    }
    res.status(500).json({ error: "Failed to add domain" });
  }
};

// DELETE /admin/domains/:id
exports.deleteDomain = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting the last domain — would lock out all registrations
    const countResult = await pool.query("SELECT COUNT(*) FROM allowed_domains");
    if (parseInt(countResult.rows[0].count) <= 1) {
      return res.status(409).json({
        error: "Cannot delete the last allowed domain. Add another domain first."
      });
    }

    const result = await pool.query(
      "DELETE FROM allowed_domains WHERE id = $1 RETURNING *", [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Domain not found" });
    }

    res.json({ message: "Domain removed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete domain" });
  }
};