const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

const userRoutes = require("./routes/userRoutes");
app.use("/users", userRoutes);
const reportRoutes = require("./routes/reportRoutes");
app.use("/reports",reportRoutes);
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
