// Import required modules
const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use("/", authRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.json("Welcome to Card Clash!");
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
