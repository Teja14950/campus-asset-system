const pool = require("../db");
const bcrypt = require("bcrypt");

exports.register = async(req,res) => {
  try {
    const { name,email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role',
      [name,email,hashedPassword, role]
    );
    res.status(201).json(result.rows[0]);
  } catch(err) {
    console.error(err);
    res.status(500).json({error: "Registration failed"});
  }
};