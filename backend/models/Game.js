const db = require("../config/database");

const Game = {

  async createGame({ host_id, join_code, status }) {
    const result = await db.query(
      `INSERT INTO Games (host_id, join_code, status)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [host_id, join_code, status]
    );

    return result.rows[0];
  },

  async getGameById(id) {
    const result = await db.query(
      `SELECT * FROM Games WHERE id=$1`,
      [id]
    );

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
      [status, id]
    );

    return result.rows[0];
  }

};

module.exports = Game;