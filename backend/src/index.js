const express = require("express");
const app = express();
const PORT = 3000;
const cors = require("cors");
app.use(express.json());
app.use(cors());
const userRoutes = require("./routes/userRoutes");
app.use("/users", userRoutes);
const reportRoutes = require("./routes/reportRoutes");
app.use("/reports",reportRoutes);
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);
const roomRoutes = require("./routes/roomRoutes");
app.use("/rooms", roomRoutes);
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
