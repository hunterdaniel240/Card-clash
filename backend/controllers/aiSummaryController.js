const AISummary = require("../models/AISummary");

// Create AI summary
async function createSummaryController(req, res) {
  try {
    const summary = await AISummary.createSummary(req.body);
    res.status(201).json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create summary" });
  }
}

// Get summary by game
async function getSummaryByGameController(req, res) {
  try {
    const summary = await AISummary.getSummaryByGame(req.params.gameId);
    if (!summary) return res.status(404).json({ message: "Summary not found" });
    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch summary" });
  }
}

module.exports = {
  createSummaryController,
  getSummaryByGameController
};