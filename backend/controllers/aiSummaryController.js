const AISummary = require("../models/AISummary");

// Create AI summary
async function createSummaryController(data) {
  try {
    const summary = await AISummary.createSummary(
      data.game_id,
      data.user_id,
      data.summary_text,
    );

    console.log(
      "Summary added to DB for " +
        data.game_id +
        ": " +
        summary.rowCount +
        " added",
    );
    return summary;
  } catch (err) {
    console.error(err);
    return null;
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
  getSummaryByGameController,
};
