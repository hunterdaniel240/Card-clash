const db = require("../config/database");

const Answer = {
  async submitAnswers(placeholder, values) {
    const result = await db.query(
      `INSERT INTO Answers
      (game_id, question_id, user_id, selected_option, is_correct, answered_at)
      VALUES ${placeholder}`,
      values,
    );

    return result;
  },

  async getAnswersByGame(gameId) {
    const result = await db.query(
      `SELECT * FROM Answers
       WHERE game_id=$1`,
      [gameId],
    );

    return result.rows;
  },

  async getAnswersByUser(userId) {
    const result = await db.query(
      `SELECT * FROM Answers
       WHERE user_id=$1`,
      [userId],
    );

    return result.rows;
  },
};

module.exports = Answer;
