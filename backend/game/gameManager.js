const { randomInt } = require("crypto");
const { createGameSettings } = require("./gameSettings");
const { Game } = require("./Game");
const { Player } = require("./Player");
const { getSocketIo } = require("../socket");

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
    let join_code;

    // safety check to prevent duplicate game codes
    do {
      join_code = generateGameCode(6);
    } while (games.has(join_code));

    const host = new Player(socket.id, name, role);
    const settings = createGameSettings(settingsData);
    const gameId = crypto.randomUUID(); // this is to store in DB, join_code is used primarily for socketIO

    // initialize game
    const game = new Game(gameId, join_code, settings, host, questionIds);

    console.log(game.players);

    games.set(join_code, game);

    return game;
  }

  static deleteGame(socket, join_code) {
    const game = games.get(join_code);

    if (game && game.hostId === socket.id) {
      games.delete(join_code);
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

  static leaveGame(socket, join_code) {
    const game = games.get(join_code);
    if (!game) return null;

    if (game.hostId === socket.id) {
      GameManager.deleteGame(socket, join_code);
    } else {
      const player = game.getPlayer(socket.id);
      if (!player) return null;

      game.removePlayer(player);
    }
  }

  static resetGame(join_code) {
    const game = games.get(join_code);
    if (!game) return null;

    game.resetGameContext();

    return game;
  }

  static updateGameSettings(join_code, settingsData) {
    const game = games.get(join_code);
    if (!game) return null;
    game.updateSettings(settingsData);

    return game;
  }

  static startGame(join_code, questions) {
    const game = games.get(join_code);
    if (!game) return null; // error occured with finding current game

    game.setQuestions(questions);

    if (game.totalQuestions === 0) return null; // error occured with setting questions for the game

    game.status = "in_progress";
    game.currentQuestionIndex = 0;

    return game;
  }

  static submitAnswer(playerId, join_code, answer) {
    const game = games.get(join_code);
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
