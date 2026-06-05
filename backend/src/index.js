const express = require("express");
const app     = express();
const PORT    = process.env.PORT || 3000;
const cors    = require("cors");
const http    = require("http");
const { Server } = require("socket.io");

app.use(express.json());
app.use(cors());

const userRoutes   = require("./routes/userRoutes");
const reportRoutes = require("./routes/reportRoutes");
const authRoutes   = require("./routes/authRoutes");
const roomRoutes   = require("./routes/roomRoutes");
const adminRoutes  = require("./routes/adminRoutes"); // NEW
const uploadRoutes = require("./routes/uploadRoutes");

app.use("/users",   userRoutes);
app.use("/reports", reportRoutes);
app.use("/auth",    authRoutes);
app.use("/rooms",   roomRoutes);
app.use("/admin",   adminRoutes); // NEW — all protected by admin middleware in the router
app.use("/upload", uploadRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:5173" },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("disconnect", () => console.log("User disconnected:", socket.id));
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));