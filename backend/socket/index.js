const { Server } = require("socket.io");
require("dotenv").config();

let io;

function initSocketServer(httpServer, origin) {
  io = new Server(httpServer, {
    cors: {
      origin: origin,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) return next(new Error("No user ID provided"));
    socket.userId = userId;
    next();
  });
}

function getSocketIo() {
  if (!io) {
    throw new Error("SocketIO not initialized");
  }

  return io;
}

module.exports = { initSocketServer, getSocketIo };
