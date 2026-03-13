function createGameSettings({
  timePerQuestion = 20,
  shuffleQuestions = true,
  showAnswer = false,
  maxPlayers,
}) {
  return {
    timePerQuestion,
    pointsPerQuestion: 100,
    speedBonus: 5, // decreasing multiplier
    shuffleQuestions,
    secondsBetweenQuestions: 10,
    showAnswer,

    maxPlayers,
  };
}

module.exports = { createGameSettings };
