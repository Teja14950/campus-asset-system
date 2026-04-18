const pool = require("../db");

exports.getUsers = async(req, res) => {
  try{
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({error: "Failed to fetch users"});
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, role} = req.body;
    if(!name || !email || !role){
      return res.status(400).json({ error: "All fields required"});
    }
    const result = await pool.query(
      "INSERT INTO users (name,email,role) VALUES ($1,$2,$3) RETURNING *",
      [name, email, role]
    );
    res.status(201).json(result.rows[0]);
  } catch(err){
    res.status(500).json({error: "Failed to create user"});
  }
};

exports.updateUser = async (req,res) => {
  try {
    const {id} = req.params;
    const {name,email,role} = req.body;

    const result = await pool.query(
      "UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING *",
      [name, email, role]
    );
    if(result.rows.length === 0){
      return res.status(404).json({error: "User not found"});
    }
    res.status(201).json(result.rows[0]);
  } catch (err){
    res.status(500).json({error: "Failed to update user"})
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM users WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete user" });
  }
};