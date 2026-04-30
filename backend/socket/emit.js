const { getSocketIo } = require("./index");

function LobbyUpdateEmit(join_code, gameState) {
  getSocketIo().to(join_code).emit("lobby-update", gameState.toDTO());
}

function LobbyClosedEmit(join_code, reason) {
  getSocketIo().to(join_code).emit("game-terminated", { reason: reason });
  getSocketIo().in(join_code).socketsLeave(join_code);
}

module.exports = { LobbyUpdateEmit, LobbyClosedEmit };
