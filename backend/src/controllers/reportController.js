const pool = require("../db");

exports.createReport = async (req, res) => {
  try {
    const { asset_id, description } = req.body;
    const user_id = req.user.id;

    if (!asset_id || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = await pool.query(
      "INSERT INTO reports (user_id, asset_id, description) VALUES ($1, $2, $3) RETURNING *",
      [user_id, asset_id, description]
    );

    await pool.query(
      "UPDATE assets SET status = 'pending' WHERE id = $1",
      [asset_id]
    );

    const io = req.app.get("io");
    io.emit("reportUpdated", { asset_id, status: "pending" });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create report" });
  }
};

exports.getReports = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT reports.id,
              users.name AS user_name,
              assets.name AS asset_name,
              reports.description,
              reports.status,
              reports.created_at
       FROM reports
       JOIN users  ON reports.user_id  = users.id
       JOIN assets ON reports.asset_id = assets.id
       ORDER BY reports.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const userId = req.user.id;

    // FIX: Original query returned raw reports.* with no join, so asset_name
    // was unavailable and the repairer table showed asset_id (an integer).
    // Now we join assets so the frontend gets asset_name directly.
    const result = await pool.query(
      `SELECT reports.*,
              assets.name AS asset_name
       FROM reports
       JOIN assets ON reports.asset_id = assets.id
       WHERE reports.assigned_to = $1
       ORDER BY reports.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};

exports.assignReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;

    const result = await pool.query(
      `UPDATE reports
       SET assigned_to = $1, status = 'assigned'
       WHERE id = $2
       RETURNING *`,
      [assigned_to, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }

    const report = result.rows[0];

    await pool.query(
      "UPDATE assets SET status = 'under_repair' WHERE id = $1",
      [report.asset_id]
    );

    const io = req.app.get("io");
    io.emit("reportUpdated", { asset_id: report.asset_id, status: "under_repair" });

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to assign report" });
  }
};

exports.getMostDamagedAssets = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT assets.name, COUNT(reports.id) AS report_count
       FROM reports
       JOIN assets ON reports.asset_id = assets.id
       GROUP BY assets.name
       ORDER BY report_count DESC`
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const VALID_STATUSES = ["pending", "assigned", "resolved"];
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const reportResult = await pool.query(
      "SELECT * FROM reports WHERE id = $1",
      [id]
    );

    const report = reportResult.rows[0];
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    const query =
      status === "resolved"
        ? "UPDATE reports SET status = $1, resolved_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *"
        : "UPDATE reports SET status = $1 WHERE id = $2 RETURNING *";

    const result = await pool.query(query, [status, id]);

    const assetStatusMap = {
      pending: "pending",
      assigned: "under_repair",
      resolved: "working",
    };

    const assetStatus = assetStatusMap[status];

    await pool.query(
      "UPDATE assets SET status = $1 WHERE id = $2",
      [assetStatus, report.asset_id]
    );

    const io = req.app.get("io");
    io.emit("reportUpdated", { asset_id: report.asset_id, status: assetStatus });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
};

exports.getAverageRepairTime = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT AVG(resolved_at - created_at) AS avg_repair_time FROM reports WHERE status = 'resolved'"
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to fetch repair time" });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT reports.*,
              assets.name       AS asset_name,
              assets.id         AS asset_id,
              assets.x_position,
              assets.y_position,
              rooms.id          AS room_id,
              rooms.name        AS room_name
       FROM reports
       JOIN assets ON reports.asset_id = assets.id
       JOIN rooms  ON assets.room_id   = rooms.id
       WHERE reports.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch report" });
  }
};