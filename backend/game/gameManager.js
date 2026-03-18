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
  static createGame(socket, name, role, settingsData, questionIds) {
    // generate game info
    const join_code = generateGameCode(6);
    const host = new Player(socket.id, name, role);
    const settings = createGameSettings(settingsData);
    const gameId = crypto.randomUUID(); // this is to store in DB, join_code is used primarily for socketIO

    // initialize game
    const game = new Game(gameId, join_code, settings, host, questionIds);

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

  static joinGame(socket, join_code, name, role) {
    const game = games.get(join_code);

    // verify game is not in progress and lobby is not full
    if (
      game &&
      game.status == "lobby" &&
      game.players.size < game.settings.maxPlayers
    ) {
      game.addPlayer(new Player(socket.id, name, role));
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
        return game;
      }
    }
  }

  static updateGameSettings(gameId, settingsData) {
    const game = games.get(gameId);
    if (!game) return null;
    game.updateSettings(settingsData);

    return game;
  }

  static startGame(gameId, questions) {
    const game = games.get(gameId);
    if (!game) return null; // error occured with finding current game

    game.setQuestions(questions);

    if (game.totalQuestions === 0) return null; // error occured with setting questions for the game

    game.status = "in_progress";
    game.currentQuestionIndex = 0;

    return game;
  }

  static submitAnswer(playerId, gameId, answer) {
    const game = games.get(gameId);
    if (!game) return null;

    const player = game.players.get(playerId);
    if (!player) return null;
    player.answer = answer;
    player.answeredAt = Date.now();

    game.addPlayerAnswer(player);

    return game;
  }
}

module.exports = { GameManager };
