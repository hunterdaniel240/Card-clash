const db = require("../config/database");

const Answer = {

  async submitAnswer({
    game_id,
    question_id,
    user_id,
    selected_option,
    is_correct,
    response_time_ms
  }) {

    const result = await db.query(
      `INSERT INTO Answers
      (game_id, question_id, user_id, selected_option, is_correct, response_time_ms)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [game_id, question_id, user_id, selected_option, is_correct, response_time_ms]
    );

    return result.rows[0];
  },

  async getAnswersByGame(gameId) {
    const result = await db.query(
      `SELECT * FROM Answers
       WHERE game_id=$1`,
      [gameId]
    );

    return result.rows;
  },

  async getAnswersByUser(userId) {
    const result = await db.query(
      `SELECT * FROM Answers
       WHERE user_id=$1`,
      [userId]
    );

    return result.rows;
  }

};

module.exports = Answer;