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

  async updateScore(gameId, playerIds, scores) {
    const result = await db.query(
      `UPDATE game_players gp
       SET score = updates.score
       FROM UNNEST($1::int[], $2::int[]) AS updates(user_id, score)
       WHERE gp.user_id = updates.user_id
       AND gp.game_id = $3`,
      [playerIds, scores, gameId],
    );

    return result;
  },
};

module.exports = GamePlayer;
