const Game = require("../models/Game"); 

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

module.exports = {
  createGameController,
  getGameByIdController,
  getAllGamesController
};