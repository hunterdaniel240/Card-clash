const { uploadAnswersController } = require("../controllers/answersController");
const {
  updatePlayerScoreController,
} = require("../controllers/gamePlayerController");
const { GameManager } = require("./gameManager");

async function runGameLoop(socketIo, game) {
  const join_code = game.join_code;
  const timeBetweenQuestions = game.settings.secondsBetweenQuestions; // seconds

  while (game.currentQuestionIndex < game.totalQuestions) {
    if (game.status !== "in_progress") break; // game was reset or host ended game
    if (game.readyPlayers.size == 1) break; // only host is left in the game

    // load question
    const question = game.questionsSelected[game.currentQuestionIndex];

    // ensure all answers stored in player model are reset
    game.resetAnswers();

    // trigger client side question view
    socketIo.to(join_code).emit("question-start", {
      question,
      players: game.getPlayers(),
      timeLimit: game.settings.timePerQuestion,
      currentQuestionIndex: game.currentQuestionIndex,
    });

    // wait for all players to answer or time limit to finish
    const questionStartTime = Date.now();
    await waitForAnswers(game, game.settings.timePerQuestion * 1000);

    if (game.status !== "in_progress") break; // host dropped mid question, break to avoid grading and recording unanswered questions
    if (game.readyPlayers.size == 1) break; // only host is left in the game

    // determine which players answered correctly, apply points to the players
    game.gradeAnswers(questionStartTime);

    // save answers to use in post game summary later
    game.recordAnswerHistory();

    const answer_data = game.getQuestionAnswer(question);
    // trigger client side question reset and send current leaderboard
    socketIo.to(join_code).emit("question-end", {
      correctAnswer: answer_data,
      scores: game.getScores(),
    });
    game.currentQuestionIndex++;
    if (game.currentQuestionIndex == game.totalQuestions) break;
    await sleep(timeBetweenQuestions * 1000);

    if (game.status !== "in_progress") break; // host dropped mid question, break to avoid grading and recording unanswered questions
    if (game.readyPlayers.size == 1) break; // only host is left in the game
  }

  if (game.status === "in_progress") {
    game.completed_previously = true;

    await sleep(timeBetweenQuestions * 1000); // match frontend timer

    // record all question answers to history
    const answersDb_result = await uploadAnswersController({
      gameId: game.gameId,
      join_code: join_code,
      answerHistory: game.answerHistory,
    });

    // record all scores to history
    const scoreDb_result = await updatePlayerScoreController({
      gameId: game.gameId,
      join_code: join_code,
      scores: game.getPlayers(),
    });

    const { questionsSummary, winners } = await GameManager.endGame(game);

    // all questions cleared, send summary and final leaderboard
    socketIo.to(join_code).emit("game-end", {
      finalScores: game.getScores(),
      questionsSummary,
      winners,
    });
  }
}

async function waitForAnswers(game, timeLimit) {
  const start = Date.now();

  while (Date.now() - start < timeLimit) {
    if (game.status !== "in_progress") {
      break; // host dropped mid game
    }
    if (game.allPlayersAnswered()) {
      break;
    }

    await sleep(250);
  }
}

function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds));
}

module.exports = { runGameLoop };
