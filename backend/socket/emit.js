const { getSocketIo } = require("./index");

function GameUpdate(join_code, gameState) {
  getSocketIo()
    .to(join_code)
    .emit("game-update", {
      ...gameState,
      players: Array.from(gameState.players.values()),
    });
}

module.exports = { GameUpdate };
