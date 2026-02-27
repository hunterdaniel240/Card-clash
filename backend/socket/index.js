const { Server } = require("socket.io");

let io;

function initSocketServer(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });
}

function getSocketIo() {
  if (!io) {
    throw new Error("SocketIO not initialized");
  }

  return io;
}

module.exports = { initSocketServer, getSocketIo };
