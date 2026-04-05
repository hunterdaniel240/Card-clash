const db = require("../config/database");

const GamePlayer = {
  async addPlayers(placeholder, values) {
    const result = await db.query(
      `INSERT INTO game_players (game_id, user_id)
       VALUES ${placeholder}`,
      values,
    );

    return result;
  },

  async removePlayer(id) {
    const result = await db.query(
      `DELETE FROM Game_Players
       WHERE id=$1
       RETURNING *`,
      [id],
    );

    return result.rows[0];
  },

  async getPlayersByGame(gameId) {
    const result = await db.query(
      `SELECT * FROM Game_Players
       WHERE game_id=$1`,
      [gameId],
    );

    return result.rows;
  },

  async updateScore(id, score) {
    const result = await db.query(
      `UPDATE Game_Players
       SET score=$1
       WHERE id=$2
       RETURNING *`,
      [score, id],
    );

    return result.rows[0];
  },
};

module.exports = GamePlayer;
