const db = require("../config/database");

const AISummary = {

  async createSummary({ game_id, summary_text }) {

    const result = await db.query(
      `INSERT INTO AI_Summaries (game_id, summary_text)
       VALUES ($1,$2)
       RETURNING *`,
      [game_id, summary_text]
    );

    return result.rows[0];
  },

  async getSummaryByGame(gameId) {

    const result = await db.query(
      `SELECT * FROM AI_Summaries
       WHERE game_id=$1`,
      [gameId]
    );

    return result.rows[0];
  }

};

module.exports = AISummary;