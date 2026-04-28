const Game = require("../models/Game");
const gameService = require("../services/gameService");

// Create a new game
async function createGameController(data) {
  try {
    // Inserts into game table
    const game = await Game.createGame(data);

    // formats as below
    // ($1, $2, $3), ...
    const placeholder = data.selected_questions
      .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`)
      .join(", ");

    const values = data.selected_questions.flatMap((question, i) => [
      data.gameId,
      question.id,
      i,
    ]);

    // Inserts into game_questions table
    const questions_result = await Game.addQuestionsDB(placeholder, values);
    console.log(
      "Questions Added to DB for " +
        game.join_code +
        ": " +
        questions_result.rowCount +
        " added",
    );

    return game;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function deleteGameController(gameId) {
  try {
    const deleted = await Game.deleteGame(gameId);
    if (!deleted) {
      return null;
    }

    return deleted;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function endGameController(data) {
  try {
    const result = await Game.endGameDB(
      data.gameId,
      data.status,
      data.ended_at,
    );
    console.log("end game DB update result: " + result.rowCount);
    if (!result) {
      return null;
    }

    return result;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function updateGameStatusController(gameId, status) {
  try {
    const result = await Game.updateStatus(gameId, status);
    if (!result) {
      return null;
    }

    return result;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function getTeacherStatsByDateController(req, res) {
  const { userId } = req.params;
  const { date_from, date_to } = req.query;

  try {
    const data = await gameService.getTeacherStatsByDate(
      userId,
      date_from,
      date_to,
    );

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
}

async function getStudentStatsByDateController(req, res) {
  const { userId } = req.params;
  const { date_from, date_to } = req.query;

  try {
    const data = await gameService.getStudentStatsByDate(
      userId,
      date_from,
      date_to,
    );

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
}

module.exports = {
  createGameController,
  deleteGameController,
  updateGameStatusController,
  endGameController,
  getStudentStatsByDateController,
  getTeacherStatsByDateController,
  getStudentStatsByDateController,
};
