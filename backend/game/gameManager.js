const { randomInt } = require("crypto");
const { createGameSettings } = require("./gameSettings");
const { Game } = require("./Game");
const { Player } = require("./Player");

// db game
const {
  createGameController,
  deleteGameController,
  endGameController,
} = require("../controllers/gameController");

// db gameplayers
const { addPlayersController } = require("../controllers/gamePlayerController");

const MAX_SAFE_INT = 2 ** 48 - 1;
let games = new Map();

function generateGameCode(length) {
  return randomInt(MAX_SAFE_INT)
    .toString(36)
    .substring(1, length)
    .toUpperCase();
}

class GameManager {
  static createGame(socket, name, role, settingsData) {
    // generate game info
    let join_code;

    // safety check to prevent duplicate game codes
    do {
      join_code = generateGameCode(6);
    } while (games.has(join_code));

    const host = new Player(socket.socketId, socket.userId, name, role);
    const settings = createGameSettings(settingsData);
    const gameId = crypto.randomUUID(); // this is to store in DB, join_code is used primarily for socketIO

    // initialize game
    const game = new Game(gameId, join_code, settings, host);

    games.set(join_code, game);

    return game;
  }

  static deleteGame(userId, join_code) {
    const game = games.get(join_code);

    if (game && game.hostId === userId) {
      games.delete(join_code);

      // host left, but game never started
      if (game.status == "lobby") {
        const deletedGame = deleteGameController(game.gameId);
        console.log("deleted game: " + deletedGame);
        console.log("game deleted from DB");
      }
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
      game.players.size < game.settings.maxPlayers &&
      !game.players.has({ userId: socket.userId })
    ) {
      console.log("adding player: " + game.players.size);
      game.addPlayer(new Player(socket.socketId, socket.userId, name, role));
      return game;
    }

    // TODO handle failed to join game gracefully
  }

  static leaveGame(userId, join_code) {
    const game = games.get(join_code);
    if (!game) return null;

    if (game.hostId === userId) {
      GameManager.deleteGame(userId, join_code);
    } else {
      const player = game.getPlayer(userId);
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

  static async startGame(join_code, questions) {
    const game = games.get(join_code);
    if (!game) return null; // error occured with finding current game

    game.setQuestions(questions);

    if (game.totalQuestions === 0) return null; // error occured with setting questions for the game

    game.status = "in_progress";
    game.currentQuestionIndex = 0;

    if (game.completed_previously) {
      game.gameId = crypto.randomUUID();
    }

    // insert game config into db
    const dbGame = await createGameController({
      gameId: game.gameId,
      host_id: game.hostId,
      join_code: game.join_code,
      status: game.status,
      selected_questions: game.questionsSelected,
    });

    if (!dbGame) {
      console.log("Failed to add game to the DB.");
      GameManager.deleteGame(socket.userId, join_code);
      return null;
    }
    console.log("Added game to DB");

    const dbGamePlayers = await addPlayersController({
      gameId: game.gameId,
      join_code: join_code, // just used for logging
      players: game.players,
    });

    return game;
  }

  static endGame(game) {
    game.status = "finished";
    game.ended_at = Date.now();
    console.log("Server game status: " + game.status);

    const questionsSummary = game.createQuestionsSummary();
    const winners = game.calculateWinners();

    const dbGame = endGameController({
      gameId: game.gameId,
      status: game.status,
      ended_at: game.ended_at,
    });

    return {
      questionsSummary,
      winners,
    };
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

  static recordAnswers() {}
}

module.exports = { GameManager };
