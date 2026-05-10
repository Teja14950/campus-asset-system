const pool = require("../db");

exports.createReport = async (req,res) => {
  try {
    const {user_id, asset_id, description} = req.body;

    if(!user_id||!asset_id||!description) {
      return res.status(400).json({error: "All fields are required"});
    }

    const result = await pool.query(
      "INSERT INTO reports (user_id,asset_id,description) VALUES ($1,$2,$3) RETURNING *",
      [user_id,asset_id,description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Failed to create report"});
  }
};

exports.getReports = async (req,res) => {
  try{
    const result = await pool.query(
      'SELECT reports.id, users.name AS user_name, assets.name AS asset_name, reports.description, reports.status, reports.created_at FROM reports JOIN users ON reports.user_id = users.id JOIN assets ON reports.asset_id = assets.id'
    );
    res.json(result.rows);
  } catch (err){
    res.status(500).json({error: "Failed to fetch reports"});
  }
};

exports.assignReport = async (req,res) => {
  try{
    const {id} = req.params;
    const {assigned_to} = req.body;

    const result = await pool.query(
      "UPDATE reports SET assigned_to = $1, status = 'assigned' WHERE id = $2 RETURNING *",
      [assigned_to,id]
    );

    if(result.rows.length===0){
      return res.status(404).json({error: "Report not found"});
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({error: "Failed to assign report"});
  }
};

exports.getMostDamagedAssets = async (req,res) => {
  try {
    const result = await pool.query(
      'SELECT assets.name, COUNT(reports.id) AS report_count FROM reports JOIN assets ON reports.asset_id = assets.id GROUP BY assets.name ORDER BY report_count DESC'
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({error: "Failed to fetch analytics"});
  }
};

exports.updateReportStatus = async (req,res) => {
  try {
    const {id} = req.params;
    const {status} = req.body;

    let query;

    if(status === 'resolved') {
      query = 'UPDATE reports SET status = $1, resolved_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
    }
    else {
      query = 'UPDATE reports SET status = $1 WHERE id = $2 RETURNING *';
    }

    const result = await pool.query(query,[status,id]);
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({error: "Failed to update status"});
  }
};

exports.getAverageRepairTime = async (req,res) => {
  try {
    const result = await pool.query(
      "SELECT AVG(resolved_at - created_at) AS avg_repair_time FROM reports WHERE status = 'resolved' "
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({error: 'Failed to fetch repair time'});
  }
};


