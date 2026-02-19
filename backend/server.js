// Import required modules
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Database connection (this is just a placeholder; use your actual database connection logic)
// const mongoose = require('mongoose');
// mongoose.connect('your_database_uri_here', { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log('Database connected successfully'))
//     .catch(err => console.error('Database connection error: ', err));

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
