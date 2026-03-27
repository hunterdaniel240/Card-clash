const Game = require("../models/Game"); 
const gameService = require("../services/gameService");

// Create a new game
async function createGameController(req, res) {
  try {
    const game = await Game.createGame(req.body);
    res.status(201).json(game);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create game" });
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
  const { id } = req.params;
  const { view } = req.query;

  try {
    if (view === "teacher") {
      const data = await gameService.getTeacherStats(id);
      return res.json(data);
    }

    if (view === "student") {
      const playerId = req.user?.id; // make sure auth middleware sets this
      const data = await gameService.getStudentStats(id, playerId);
      return res.json(data);
    }

    return res.status(400).json({ message: "Invalid view type" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch game stats" });
  }
}

module.exports = {
  createGameController,
  getGameByIdController,
  getAllGamesController,
  getGameStatsController
};