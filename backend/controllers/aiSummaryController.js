const AISummary = require("../models/AISummary");

// Create AI summary
async function createSummaryController(data) {
  try {
    console.log("Adding summary to gameId: " + data.game_id);

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

module.exports = {
  createSummaryController,
};
