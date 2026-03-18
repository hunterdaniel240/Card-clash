const { getSocketIo } = require("./index");

function LobbyUpdateEmit(join_code, gameState) {
  getSocketIo().to(join_code).emit("lobby-update", gameState.toDTO());
}

function LobbyClosedEmit(join_code) {
  getSocketIo().to(join_code).emit("lobby-closed");
}

module.exports = { LobbyUpdateEmit };
