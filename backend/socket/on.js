const { runGameLoop } = require("../game/GameLoop");
const { GameManager } = require("../game/gameManager");
const { LobbyUpdateEmit } = require("../socket/emit");
const { getSocketIo } = require("./index");

function CreateGameOn(socket) {
  socket.on(
    "create-game",
    ({ name, role, settings, questionIds }, callback) => {
      let game = GameManager.createGame(
        socket,
        name,
        role,
        settings,
        questionIds,
      );

      if (game) {
        socket.join(game.join_code);
        const gameDTO = game.toDTO();
        callback(gameDTO);
      } else {
        callback(null);
      }
    },
  );
}

function JoinGameOn(socket) {
  socket.on("join-game", ({ name, role, join_code }, callback) => {
    let game = GameManager.joinGame(socket, join_code, name, role);

    if (game) {
      socket.join(join_code);

      LobbyUpdateEmit(join_code, game);
      callback(game.toDTO());
    } else {
      callback(null);
    }
  });
}

function UpdateGameSettingsOn(socket) {
  socket.on("update-game-settings", ({ join_code, settings }, callback) => {
    let game = GameManager.updateGameSettings(join_code, settings);
    if (game) {
      LobbyUpdateEmit(join_code, game);
      callback(game.toDTO());
    } else {
      callback(null);
    }
  });
}

// host refreshing deletes the lobby
function UserDisconnectingOn(socket) {
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      GameManager.leaveGame(socket, room);
      console.log("user disconnected from game");
    });
  });
}

function StartGameOn(socket) {
  socket.on("start-game", ({ join_code, questions }) => {
    const game = GameManager.startGame(join_code, questions);

    if (!game) return null;

    getSocketIo().to(join_code).emit("game-started", {
      join_code,
      totalQuestions: game.totalQuestions,
    });
  });
}

function ResetGameOn(socket) {
  socket.on("reset-game", ({ join_code }) => {
    const game = GameManager.getGame(join_code);
    if (!game) return;

    game.resetGame();

    // notify ALL clients in lobby
    getSocketIo().to(join_code).emit("game-reset", {
      status: game.status,
    });
  });
}

function GameReadyOn(socket) {
  socket.on("game-page-ready", ({ join_code, role }) => {
    const game = GameManager.getGame(join_code);
    if (!game) return null;

    game.readyPlayers.add(socket.id);

    // loopStarted is REQUIRED. React 18 dev mode mounts components twice which will trigger a race condition to occur in the loop
    if (!game.loopStarted && game.readyPlayers.size === game.players.size) {
      game.loopStarted = true;
      runGameLoop(getSocketIo(), game);
    }
  });
}

function SubmitAnswerOn(socket) {
  socket.on("submit-answer", ({ join_code, answer }) => {
    const game = GameManager.submitAnswer(socket.id, join_code, answer);

    if (!game) return null;

    getSocketIo().to(join_code).emit("player-answered", game.playersAnswered);
  });
}

module.exports = {
  CreateGameOn,
  JoinGameOn,
  UserDisconnectingOn,
  UpdateGameSettingsOn,
  StartGameOn,
  SubmitAnswerOn,
  GameReadyOn,
  ResetGameOn,
};
