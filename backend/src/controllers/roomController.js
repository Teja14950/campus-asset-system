const pool = require("../db");

const ASSET_TYPES = ["fan", "light", "tap", "projector", "ac", "door", "window", "other"];

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

exports.getAssetTypes = async (req, res) => {
  res.json(ASSET_TYPES);
};

exports.getRoomAssets = async (req,res) => {
  try {
    const {id} = req.params;
    const roomResult = await pool.query(
      "SELECT * FROM rooms WHERE id = $1",
      [id]
    );
    if(roomResult.rows.length===0){
      return res.status(404).json({error: "Room not found"});
    }
    const assetResult = await pool.query(
      'SELECT id, name, type, status, x_position, y_position FROM assets WHERE room_id = $1',[id]
    );
    res.json({
      room: roomResult.rows[0],
      assets: assetResult.rows,
    });
  } catch (err){
    console.error(err);
    res.status(500).json({error: "Failed to fetch room assets"});
  }
};