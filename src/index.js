const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

const userRoutes = require("./routes/userRoutes");
app.use("/users", userRoutes);
const reportRoutes = require("./routes/reportRoutes");
app.use("/reports",reportRoutes);

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
