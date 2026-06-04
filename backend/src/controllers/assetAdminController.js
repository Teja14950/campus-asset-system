const pool = require("../db");

const VALID_TYPES    = ["fan", "light", "tap", "projector", "ac", "door", "window", "other"];
const VALID_STATUSES = ["working", "pending", "under_repair"];

// GET /admin/rooms/:id/assets — handled in adminController, kept here for reference

// POST /admin/rooms/:roomId/assets — BUG FIX: was using req.params.id but
// the route param is :roomId when nested under /rooms/:roomId/assets
exports.createAsset = async (req, res) => {
  try {
    const { roomId } = req.params; // FIX: was destructuring {id} but param is roomId
    const { name, type, x_position, y_position } = req.body;

    if (!name || !type || x_position == null || y_position == null) {
      return res.status(400).json({
        error: "name, type, x_position, y_position are all required"
      });
    }

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({
        error: `Invalid type. Allowed: ${VALID_TYPES.join(", ")}`
      });
    }

    // FIX: Verify room exists before inserting — gives a clear error instead of FK violation
    const roomCheck = await pool.query("SELECT id FROM rooms WHERE id = $1", [roomId]);
    if (roomCheck.rows.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    const result = await pool.query(
      `INSERT INTO assets (room_id, name, type, status, x_position, y_position)
       VALUES ($1, $2, $3, 'working', $4, $5)
       RETURNING *`,
      [roomId, name, type, x_position, y_position]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create asset" });
  }
};

// PATCH /admin/assets/:id/position
exports.updateAssetPosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { x_position, y_position } = req.body;

    if (x_position == null || y_position == null) {
      return res.status(400).json({ error: "x_position and y_position are required" });
    }

    const result = await pool.query(
      `UPDATE assets SET x_position = $1, y_position = $2
       WHERE id = $3 RETURNING *`,
      [x_position, y_position, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Asset not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update position" });
  }
};

// PATCH /admin/assets/:id
exports.updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, status } = req.body;

    if (type && !VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: `Invalid type. Allowed: ${VALID_TYPES.join(", ")}` });
    }
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Allowed: ${VALID_STATUSES.join(", ")}` });
    }

    const fields = [];
    const values = [];
    let i = 1;
    if (name)   { fields.push(`name = $${i++}`);   values.push(name); }
    if (type)   { fields.push(`type = $${i++}`);   values.push(type); }
    if (status) { fields.push(`status = $${i++}`); values.push(status); }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE assets SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Asset not found" });
    }

    if (status) {
      const io = req.app.get("io");
      io.emit("reportUpdated", { asset_id: parseInt(id), status });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update asset" });
  }
};

// DELETE /admin/assets/:id
exports.deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;

    const reportCheck = await pool.query(
      "SELECT COUNT(*) FROM reports WHERE asset_id = $1 AND status != 'resolved'",
      [id]
    );

    if (parseInt(reportCheck.rows[0].count) > 0) {
      return res.status(409).json({
        error: "Cannot delete asset with open reports. Resolve all reports first.",
      });
    }

    const result = await pool.query(
      "DELETE FROM assets WHERE id = $1 RETURNING *", [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Asset not found" });
    }

    res.json({ message: "Asset deleted", asset: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete asset" });
  }
};