const { GameManager } = require("../game/gameManager");
const { getSocketIo } = require;

function CreateGameOn(socket) {
  socket.on("create-game", ({ name, settings, questionIds }, callback) => {
    let game = GameManager.createGame(socket, name, settings, questionIds);

    const gameDTO = game.toDTO();
    callback(gameDTO);
  });
}

function JoinGameOn(socket) {
  socket.on("join-game", ({ name, join_code }, callback) => {
    let game = GameManager.joinGame(socket, join_code, name);
    if (game) {
      const gameDTO = game.toDTO();
      callback(gameDTO);
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
module.exports = { CreateGameOn, JoinGameOn, UserDisconnectingOn };
