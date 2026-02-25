// Import required modules
const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const pool = require("./config/database");

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

// Database connection
(async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("Database ready");
  } catch (err) {
    console.error("DB connection failed", err);
  }
})();

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
