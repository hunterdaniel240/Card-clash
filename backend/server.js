// Import required modules
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

// Routes
const authRoutes = require("./routes/authRoutes");
const questionRoutes = require("./routes/questionRoutes");
const gameRoutes = require("./routes/games");
const answersRoutes = require("./routes/answers");
const aiSummaryRoutes = require("./routes/aiSummaries");

const cookieParser = require("cookie-parser");
const pool = require("./config/database");
const { initSocketServer, getSocketIo } = require("./socket");
const {
  CreateGameOn,
  JoinGameOn,
  LeaveGameOn,
  KickPlayerOn,
  UserDisconnectingOn,
  UpdateGameSettingsOn,
  StartGameOn,
  SubmitAnswerOn,
  GameReadyOn,
  ResetGameOn,
} = require("./socket/on");

// Initialize Express app
const app = express();
const server = http.createServer(app);
const env = app.get("env");
console.log("environment: " + env);

const origin =
  env == "production" ? process.env.SITEURL : "http://localhost:3000";

// Initialize SocketIO
initSocketServer(server, origin);

const io = getSocketIo();

app.use(
  cors({
    origin: origin,
    credentials: true,
  }),
);

app.use(express.json()); // JSON Parsing for the req body
app.use(cookieParser()); // Cookie parsing for the token

// API Route
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api", gameRoutes);
app.use("/api/answers", answersRoutes);
app.use("/api/aiSummaries", aiSummaryRoutes);

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
  CreateGameOn(socket);
  JoinGameOn(socket);
  LeaveGameOn(socket);
  KickPlayerOn(socket);
  UserDisconnectingOn(socket);
  UpdateGameSettingsOn(socket);
  StartGameOn(socket);
  SubmitAnswerOn(socket);
  GameReadyOn(socket);
  ResetGameOn(socket);
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
