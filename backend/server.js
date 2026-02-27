// Import required modules
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const pool = require("./config/database");

const { initSocketServer, getSocketIo } = require("./socket");
const { TestOn } = require("./socket/on");

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize SocketIO
initSocketServer(server);

const io = getSocketIo();

// Only accept localhost for now
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json()); // JSON Parsing for the req body
app.use(cookieParser()); // Cookie parsing for the token

// API Route
app.use("/", authRoutes);

// Database connection check
(async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("Database ready");
  } catch (err) {
    console.error("DB connection failed", err);
  }
})();

// Socket.IO connection
io.on("connection", (socket) => {
  TestOn(socket);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Sanity Test
const User = require("./models/User");

app.get("/test-user", async (req, res) => {
  try {
    const user = await User.createUser({
      name: "Test User",
      email: "test@example.com",
      password_hash: "fakehash123",
      role: "student",
    });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating user");
  }
});
