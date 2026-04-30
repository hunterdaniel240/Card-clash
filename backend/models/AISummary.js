const db = require("../config/database");

const AISummary = {
  async createSummary(game_id, user_id, summary_text) {
    const result = await db.query(
      `INSERT INTO AI_Summaries (game_id, user_id, summary_text)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [game_id, user_id, summary_text],
    );

    return result;
  },

  async getSummaryByGame(game_id, user_id) {
    const result = await db.query(
      `SELECT summary_text FROM ai_summaries 
       WHERE game_id = $1 AND user_id = $2 
       ORDER BY generated_at DESC 
       LIMIT 1`,
      [game_id, user_id],
    );

    return result.rows[0];
  },
};

module.exports = AISummary;
