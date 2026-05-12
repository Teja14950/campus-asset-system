const express = require("express");
const app = express();
const PORT = 3000;
const cors = require("cors");
const http = require("http");
const {Server} = require("socket.io");
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
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});
app.set("io", io);
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
