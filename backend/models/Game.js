const db = require("../config/database");

const Game = {
  async createGame({ gameId, host_id, join_code, status }) {
    const result = await db.query(
      `INSERT INTO Games (id, host_id, join_code, status)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [gameId, host_id, join_code, status],
    );

    return result.rows[0];
  },

  async getGameById(id) {
    const result = await db.query(`SELECT * FROM Games WHERE id=$1`, [id]);

    return result.rows[0];
  },

  async getAllGames() {
    const result = await db.query(`SELECT * FROM Games`);
    return result.rows;
  },

  async updateStatus(id, status) {
    const result = await db.query(
      `UPDATE Games
       SET status=$1
       WHERE id=$2
       RETURNING *`,
      [status, id],
    );

    return result.rows[0];
  },

  async endGameDB(id, status, ended_at) {
    const result = await db.query(
      `UPDATE games
       SET status = $1,
           ended_at = $2
       WHERE id = $3`,
      [status, ended_at, id],
    );

    return result;
  },

  async deleteGame(id) {
    const result = await db.query(
      `DELETE FROM Games
       WHERE id=$1
       RETURNING *`,
      [id],
    );

    return result.rows[0];
  },

  async addQuestionsDB(placeholder, values) {
    const result = await db.query(
      `INSERT INTO game_questions
       (game_id, question_id, order_index) VALUES ${placeholder}`,
      values,
    );

    return result;
  },
};

module.exports = Game;
