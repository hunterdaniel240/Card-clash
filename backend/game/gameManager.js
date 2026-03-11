const { randomInt } = require("crypto");
const { createGameSettings } = require("./gameSettings");
const { Game } = require("./Game");
const { Player } = require("./Player");

const MAX_SAFE_INT = 2 ** 48 - 1;
let games = new Map();

function generateGameCode(length) {
  return randomInt(MAX_SAFE_INT)
    .toString(36)
    .substring(1, length)
    .toUpperCase();
}

class GameManager {
  static createGame(socket, name, settingsData, questionIds) {
    // generate game info
    const join_code = generateGameCode(6);
    const host = new Player(socket.id, name);
    const settings = createGameSettings(settingsData);
    const gameId = crypto.randomUUID();

    // joining game
    const game = new Game(gameId, join_code, settings, host, questionIds);
    socket.join(join_code);

    games.set(join_code, game);

    return game;
  }

  static deleteGame(socket, gameId) {
    const game = games.get(gameId);

    if (game && game.hostId === socket.id) {
      games.delete(gameId);

      // TODO broadcast game deleted.. kick everyone out
    }
  }

  static getGame(join_code) {
    return games.get(join_code);
  }

  static joinGame(socket, join_code, name) {
    const game = games.get(join_code);

    // verify game is not in progress and lobby is not full
    if (
      game &&
      game.status == "lobby" &&
      game.players.size < game.settings.maxPlayers
    ) {
      socket.join(join_code);
      game.addPlayer(new Player(socket.id, name));
      return game;
    }

    // TODO handle failed to join game gracefully
  }

  static leaveGame(socket, gameId) {
    const game = games.get(gameId);

    if (game) {
      if (game.hostId === socket.id) {
        GameManager.deleteGame(socket, gameId);
      } else {
        const player = game.getPlayer(socket.id);

        game.removePlayer(player);
      }
    }
  }
}

module.exports = { GameManager };
