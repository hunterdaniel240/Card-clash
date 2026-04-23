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
    console.log("end game result" + result.rowCount);
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

// Get game by ID
async function getGameByIdController(req, res) {
  try {
    const game = await Game.getGameById(req.params.id);
    if (!game) return res.status(404).json({ message: "Game not found" });
    res.json(game);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch game" });
  }
}

// Get all games
async function getAllGamesController(req, res) {
  try {
    const games = await Game.getAllGames();
    res.json(games);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch games" });
  }
}

// Get game stats
async function getGameStatsController(req, res) {
  const { id: gameId } = req.params;
  const { view } = req.query;

  try {
    if (view === "teacher") {
      const data = await gameService.getTeacherStats(gameId, req.query);
      return res.json(data);
    }

    if (view === "student") {
      const userId = req.user?.id; // make sure auth middleware sets this
      const data = await gameService.getStudentStats(gameId, userId, req.query);
      return res.json(data);
    }

    return res.status(400).json({ message: "Invalid view type" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch game stats" });
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

async function getStudentStatsByDateController(req, res) {
  const { userId } = req.params;
  const { date_from, date_to } = req.query;

  try {
    const data = await gameService.getStudentStatsByDate(
      userId,
      date_from,
      date_to
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
  getGameByIdController,
  getAllGamesController,
  getGameStatsController,
  getStudentStatsByDateController,
  getTeacherStatsByDateController,
  getStudentStatsByDateController,
};
