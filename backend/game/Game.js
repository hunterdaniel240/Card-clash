const ID_LENGTH = 10;

class Game {
  constructor(gameId, join_code, settings, host, questionIds) {
    this.gameId = gameId;
    this.settings = settings;

    this.hostId = host.id;
    this.join_code = join_code;

    this.players = new Map();
    this.status = "lobby";

    this.questionIds = questionIds;
    this.totalQuestions = questionIds.length;
    this.currentQuestionIndex = 0;

    this.leaderboard = [];
    this.winners = [];

    this.players.set(host.id, host);

    this.created_At = new Date();
  }

  addPlayer(player) {
    this.players.set(player.id, player);
  }

  getPlayer(playerId) {
    return this.players.get(playerId);
  }

  removePlayer(player) {
    this.players.delete(player.id);
  }

  toDTO() {
    let players = [];
    this.players.forEach((player, playerId) => {
      players.push({
        ...player.toDTO(),
      });
    });

    if (this.status == "in_progress") {
      return {
        gameId: this.gameId,
        settings: this.settings,
        hostId: this.hostId,
        join_code: this.join_code,
        players: players,
        status: this.status,
        currrentQuestionIndex: this.currentQuestionIndex,
        leaderboard: this.leaderboard,
        winners: this.winners,
      };
    } else {
      return {
        gameId: this.gameId,
        settings: this.settings,
        hostId: this.hostId,
        join_code: this.join_code,
        players: players,
      };
    }
  }
}

module.exports = { Game };
