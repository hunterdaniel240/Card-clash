function createGameSettings({
  timePerQuestion = 20, // seconds
  shuffleQuestions = true,
  showAnswer = false,
  maxPlayers,
}) {
  return {
    timePerQuestion,
    pointsPerQuestion: 100,
    shuffleQuestions,
    secondsBetweenQuestions: 10,
    showAnswer,

    maxPlayers,
  };
}

module.exports = { createGameSettings };
