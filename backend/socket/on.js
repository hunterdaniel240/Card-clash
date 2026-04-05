const { runGameLoop } = require("../game/GameEngine");
const { GameManager } = require("../game/gameManager");
const { LobbyUpdateEmit, LobbyClosedEmit } = require("../socket/emit");
const { getSocketIo } = require("./index");

function CreateGameOn(socket) {
  socket.on("create-game", ({ name, role, settings }, callback) => {
    let game = GameManager.createGame(socket, name, role, settings);

    if (game) {
      socket.join(game.join_code);
      const gameDTO = game.toDTO();
      callback(gameDTO);
    } else {
      callback(null);
    }
  });
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

function LeaveGameOn(socket) {
  socket.on("leave-game", ({ join_code }) => {
    console.log("socket leave-game called on server");
    GameManager.leaveGame(socket.userId, join_code);

    const game = GameManager.getGame(join_code);
    if (game) {
      LobbyUpdateEmit(join_code, game);
    } else {
      LobbyClosedEmit(join_code);
    }
  });
}

function UpdateGameSettingsOn(socket) {
  socket.on("update-game-settings", ({ join_code, settings }, callback) => {
    let game = GameManager.updateGameSettings(join_code, settings);

    if (!game || game.hostId !== socket.userId) return null;

    LobbyUpdateEmit(join_code, game);
    callback(game.toDTO());
  });
}

// host refreshing deletes the lobby
function UserDisconnectingOn(socket) {
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      const game = GameManager.getGame(room);
      if (!game) return;

      // This function gives host a few seconds to reconnect or if the user is a student then disconnect them
      if (game.hostId === socket.userId) {
        getSocketIo().to(room).emit("host-disconnected");

        setTimeout(() => {
          const gone = !getSocketIo().sockets.sockets.get(socket.userId);
          if (gone) {
            GameManager.leaveGame(socket, room);

            getSocketIo()
              .to(room)
              .emit("game-terminated", { reason: "Host has disconnected" });
          } else {
            getSocketIo().to(room).emit("host-reconnected");
          }
        }, 10000);
      } else {
        GameManager.leaveGame(socket.userId, room);
        const updatedGame = GameManager.getGame(room);
        if (updatedGame) {
          LobbyUpdateEmit(room, updatedGame);
        }
      }
      console.log("user disconnected from game");
    });
  });
}

function StartGameOn(socket) {
  socket.on("start-game", async ({ join_code, questions }) => {
    const game = await GameManager.startGame(join_code, questions);

    if (!game || game.hostId !== socket.userId) return null;
    getSocketIo().to(join_code).emit("game-started", {
      join_code,
      totalQuestions: game.totalQuestions,
    });
  });
}

function ResetGameOn(socket) {
  socket.on("reset-game", ({ join_code }) => {
    const newGame = GameManager.resetGame(join_code);

    if (!newGame || newGame.hostId !== socket.userId) return null;

    // notify ALL clients in lobby
    getSocketIo().to(join_code).emit("game-reset", {
      game: newGame.toDTO(),
    });
  });
}

function GameReadyOn(socket) {
  socket.on("game-page-ready", ({ join_code }) => {
    const game = GameManager.getGame(join_code);
    if (!game) return null;

    game.readyPlayers.add(socket.userId);

    // loopStarted is REQUIRED. React 18 dev mode mounts components twice which will trigger a race condition to occur in the loop
    if (!game.loopStarted && game.readyPlayers.size === game.players.size) {
      game.loopStarted = true;
      runGameLoop(getSocketIo(), game);
    }
  });
}

function SubmitAnswerOn(socket) {
  socket.on("submit-answer", ({ join_code, answer }) => {
    console.log("submitted answer called");
    const game = GameManager.submitAnswer(socket.userId, join_code, answer);

    if (!game) return null;

    getSocketIo().to(join_code).emit("player-answered", game.playersAnswered);
  });
}

module.exports = {
  CreateGameOn,
  JoinGameOn,
  LeaveGameOn,
  UserDisconnectingOn,
  UpdateGameSettingsOn,
  StartGameOn,
  SubmitAnswerOn,
  GameReadyOn,
  ResetGameOn,
};
