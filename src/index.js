const express = require("express");
const pool = require("./db");
const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});
app.get("/test-db",async(req,res)=>{
  try{
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err){
    console.error(err);
    res.status(500).send("Database error");
  }
});
app.get("/users", async(req,res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err){
    console.error(err);
    res.status(500).json({error: "Failed to fetch users"});
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});