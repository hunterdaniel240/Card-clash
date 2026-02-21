const pool = require("../config/database");

async function createUser({ name, email, password_hash, role }) {
  const result = await pool.query(
    `INSERT INTO Users
     (name, email, password_hash, role)
     VALUES ($1,$2,$3,$4)
     RETURNING id, name, email, role, created_at`,
    [name, email, password_hash, role]
  );

  return result.rows[0];
}

async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT * FROM Users WHERE email=$1`,
    [email]
  );

  return result.rows[0];
}

module.exports = {
  createUser,
  findUserByEmail
};