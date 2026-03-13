const db = require("../config/database");

const GamePlayer = {

  async addPlayer({ game_id, user_id }) {
    const result = await db.query(
      `INSERT INTO Game_Players (game_id, user_id)
       VALUES ($1,$2)
       RETURNING *`,
      [game_id, user_id]
    );

    return result.rows[0];
  },

  async removePlayer(id) {
    const result = await db.query(
      `DELETE FROM Game_Players
       WHERE id=$1
       RETURNING *`,
      [id]
    );

    return result.rows[0];
  },

  async getPlayersByGame(gameId) {
    const result = await db.query(
      `SELECT * FROM Game_Players
       WHERE game_id=$1`,
      [gameId]
    );

    return result.rows;
  },

  async updateScore(id, score) {
    const result = await db.query(
      `UPDATE Game_Players
       SET score=$1
       WHERE id=$2
       RETURNING *`,
      [score, id]
    );

    return result.rows[0];
  }

};

module.exports = GamePlayer;