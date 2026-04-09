const Answer = require("../models/Answer");

// Submit an answer
async function uploadAnswersController(data) {
  try {
    const rows = data.answerHistory.flatMap((question) =>
      question.answers.map((answer) => [
        data.gameId,
        question.questionId,
        answer.userId,
        answer.selected_option,
        answer.isCorrect,
        answer.answered_at,
      ]),
    );

    // formats as below
    // ($1, $2, $3, $4, $5, $6), ...
    const placeholder = rows
      .map(
        (_, i) =>
          `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`,
      )
      .join(", ");

    const values = rows.flat();

    // Inserts into game_questions table
    const answers_result = await Answer.submitAnswers(placeholder, values);
    console.log(
      "Answers Added to DB for " +
        data.join_code +
        ": " +
        answers_result.rowCount +
        " added",
    );

    return answers_result;
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Get all answers for a game
async function getAnswersByGameController(req, res) {
  try {
    const answers = await Answer.getAnswersByGame(req.params.gameId);
    res.json(answers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch answers" });
  }
}

// Get all answers by a player
async function getAnswersByUserController(req, res) {
  try {
    const answers = await Answer.getAnswersByUser(req.params.userId);
    res.json(answers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user answers" });
  }
}

module.exports = {
  uploadAnswersController,
  getAnswersByGameController,
  getAnswersByUserController,
};
