const { uploadAnswersController } = require("../controllers/answersController");
const {
  updatePlayerScoreController,
} = require("../controllers/gamePlayerController");

async function runGameLoop(socketIo, game) {
  const join_code = game.join_code;
  const timeBetweenQuestions = game.settings.secondsBetweenQuestions; // seconds
  let gameLoopActive = true;

  while (game.currentQuestionIndex < game.totalQuestions) {
    if (game.status !== "in_progress") break; // game was reset or host ended game

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

    // determine which players answered correctly, apply points to the players
    game.gradeAnswers(questionStartTime);

    // save answers to use in post game summary later
    game.recordAnswerHistory();

    const answer_data = game.getQuestionAnswer(question);
    console.log(answer_data);
    // trigger client side question reset and send current leaderboard
    socketIo.to(join_code).emit("question-end", {
      correctAnswer: answer_data,
      scores: game.getScores(),
    });
    game.currentQuestionIndex++;
    if (game.currentQuestionIndex == game.totalQuestions) break;
    await sleep(timeBetweenQuestions * 1000);
  }

  game.status = "finished";
  game.completed_previously = true;
  console.log("game status: " + game.status);

  // record all question answers to history
  const answersDb_result = await uploadAnswersController({
    gameId: game.gameId,
    join_code: join_code,
    answerHistory: game.answerHistory,
  });

  console.log("calling db update");
  const scoreDb_result = await updatePlayerScoreController({
    gameId: game.gameId,
    join_code: join_code,
    scores: game.getPlayers(),
  });

  console.log("server finishing game");
  const questionsSummary = game.createQuestionsSummary();

  const winners = game.calculateWinners();

  // all questions cleared, send summary and final leaderboard
  socketIo.to(join_code).emit("game-end", {
    finalScores: game.getScores(),
    questionsSummary,
    winners,
  });
}

async function waitForAnswers(game, timeLimit) {
  const start = Date.now();

  while (Date.now() - start < timeLimit) {
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
