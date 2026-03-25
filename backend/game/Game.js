class Game {
  constructor(gameId, join_code, settings, host) {
    this.gameId = gameId; // db id
    this.settings = settings;

    this.hostId = host.id;
    this.join_code = join_code; // socketio id

    this.players = new Map();
    this.status = "lobby";
    this.loopStarted = false; // this is used to prevent react 18 race conditions

    this.questionsSelected = [];
    this.totalQuestions = 0;
    this.currentQuestionIndex = 0;
    this.playersAnswered = []; // track which players have already answered
    this.answerHistory = []; // this will be used for statistics later

    this.leaderboard = [];
    this.winners = [];

    this.readyPlayers = new Set();

    this.created_At = new Date();

    this.players.set(host.id, host); // host is added to help ensure all clients are in sync, but isn't part of the leaderboard
  }

  addPlayer(player) {
    this.players.set(player.id, player);
  }

  getPlayer(playerId) {
    return this.players.get(playerId);
  }

  getPlayers() {
    // filter only students
    return Array.from(this.players.values())
      .filter((p) => p.role !== "teacher")
      .map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
        answer: p.answer,
        answeredAt: p.answeredAt,
      }));
  }

  removePlayer(player) {
    this.players.delete(player.id);
    this.readyPlayers.delete(player.id);
  }

  updateSettings(settings) {
    this.settings = settings;
  }

  // set questions to be used in the game
  setQuestions(questions) {
    if (questions.length === 0) return null;

    if (this.settings.shuffleQuestions) {
      const shuffled = [...questions].sort(() => Math.random() - 0.5);
      this.questionsSelected = shuffled;
    } else {
      this.questionsSelected = questions;
    }

    this.totalQuestions = this.questionsSelected.length;
  }

  addPlayerAnswer(player) {
    if (!player) return null;

    this.playersAnswered.push(player.name);
  }

  // Check if all players answered
  allPlayersAnswered() {
    for (const player of this.players.values()) {
      // safety check, isolate only students
      if (player.role !== "teacher" && player.answer === null) {
        return false;
      }
    }
    return true;
  }

  // Reset answers for all players
  resetAnswers() {
    this.playersAnswered = [];

    for (const player of this.players.values()) {
      if (player.role !== "teacher") {
        player.answer = null;
        player.answeredAt = null;
      }
    }
  }

  gradeAnswers(questionStartTime) {
    const question = this.questionsSelected[this.currentQuestionIndex];
    const totalTime = this.settings.timePerQuestion * 1000; // converts seconds to ms

    for (const player of this.players.values()) {
      if (player.role !== "teacher") {
        // student did not answer question in time limit
        if (player.answer == null) {
          player.score += 0;
        }

        if (player.answer == question.correct_option) {
          player.score += this.settings.pointsPerQuestion; // base points given for correct answer

          const answerTime = player.answeredAt - questionStartTime; // answeredAt and question start time is given as ms
          const remainingTime = Math.max(0, totalTime - answerTime); // ex 20s in ms - 5s in ms gives 15s in ms

          const multipler = remainingTime / totalTime; // ex 15s / 20s = 0.75 multi
          const speedBonus = Math.floor(1000 * multipler);

          player.score += speedBonus;
        }
      }
    }
  }

  // returns an array of question context along with player answers
  createQuestionsSummary() {
    function compressOptions(options) {
      return options.reduce((acc, opt) => {
        acc[opt.id] = opt.text;
        return acc;
      }, {});
    }

    const summary = this.questionsSelected.map((q) => {
      const history = this.answerHistory.find((h) => h.questionId === q.id);

      return {
        question_text: q.question_text,
        options: compressOptions(q.options),
        correct_option: q.correct_option,
        players: history
          ? history.answers
              .filter((p) => {
                const player = this.players.get(p.playerId);
                return player && player.role !== "teacher";
              })
              .map((p) => ({
                name: p.name,
                answer_selected: p.answer,
                answer_text: q.options.find((o) => o.id === p.answer)?.text,
                correct: p.isCorrect,
              }))
          : [],
      };
    });

    return summary;
  }

  recordAnswerHistory() {
    const question = this.questionsSelected[this.currentQuestionIndex];
    const answers = [];

    for (const player of this.players.values()) {
      answers.push({
        playerId: player.id,
        name: player.name,
        answer: player.answer,
        isCorrect: player.answer === question.correct_option,
      });
    }

    this.answerHistory.push({
      questionId: question.id,
      answers,
    });
  }

  getScores() {
    return Array.from(this.players.values())
      .filter((p) => p.role !== "teacher")
      .map((player) => ({
        name: player.name,
        score: player.score,
      }));
  }

  resetScores() {
    for (const player of this.players.values()) {
      if (player.role !== "teacher") {
        player.score = 0;
      }
      player.answer = null;
    }
  }

  calculateWinners() {
    const allScores = this.getScores().sort((a, b) => b.score - a.score);
    return allScores.slice(0, 3);
  }

  resetGameContext() {
    this.status = "lobby";
    this.loopStarted = false;

    this.questionsSelected = [];
    this.totalQuestions = 0;
    this.currentQuestionIndex = 0;
    this.playersAnswered = [];
    this.answerHistory = [];

    this.leaderboard = [];
    this.winners = [];

    this.readyPlayers.clear();
    this.resetScores();
  }

  toDTO() {
    let players = [];
    this.players.forEach((player, playerId) => {
      players.push({
        ...player.toDTO(),
      });
    });

    // originally planned on sending whole game back each time, each gameplay server emit is only sending smaller portions.
    // needs further testing to determine if its better to send game config back each time
    if (this.status == "in_progress") {
      return {
        gameId: this.gameId,
        settings: this.settings,
        hostId: this.hostId,
        join_code: this.join_code,
        players: this.getPlayers(),
        status: this.status,
        currentQuestionIndex: this.currentQuestionIndex,
        leaderboard: this.leaderboard,
        winners: this.winners,
      };
    } else {
      return {
        gameId: this.gameId,
        settings: this.settings,
        hostId: this.hostId,
        join_code: this.join_code,
        players: this.getPlayers(),
        questionsSelected: this.questionsSelected,
        status: this.status,
        currentQuestionIndex: this.currentQuestionIndex,
        totalQuestions: this.totalQuestions,
        leaderboard: this.leaderboard,
        winners: this.winners,
      };
    }
  }
}

module.exports = { Game };
