const pool = require("../config/database");

async function getTeacherStats(gameId, options = {}) {
  const { filter, sort, date_from, date_to } = options;

  let params = [gameId];
  let where = ["a.game_id = $1"];
  let idx = 2;

  // Filters
  if (date_from) {
    where.push(`a.answered_at >= $${idx++}`);
    params.push(date_from);
  }

  if (date_to) {
    where.push(`a.answered_at <= $${idx++}`);
    params.push(date_to);
  }

  if (filter === "incorrect") {
    where.push(`a.is_correct = false`);
  }

  const whereSQL = `WHERE ${where.join(" AND ")}`;

  // Safe sorting
  let orderBy = "gp.score DESC";
  if (sort === "score_asc") orderBy = "gp.score ASC";
  if (sort === "score_desc") orderBy = "gp.score DESC";
  if (sort === "accuracy_asc") orderBy = "accuracy ASC";
  if (sort === "accuracy_desc") orderBy = "accuracy DESC";

  // Player stats
  const playersResult = await pool.query(
    `
    SELECT 
      a.user_id AS id,
      u.name,
      gp.score,
      COUNT(*) AS total,
      SUM(a.is_correct::int) AS correct,
      AVG(a.is_correct::int) AS accuracy
    FROM answers a
    JOIN users u ON u.id = a.user_id
    JOIN game_players gp 
      ON gp.user_id = a.user_id AND gp.game_id = a.game_id
    ${whereSQL}
    GROUP BY a.user_id, u.name, gp.score
    ORDER BY ${orderBy}
    `,
    params
  );

  // Question stats
  const questionsResult = await pool.query(
    `
    SELECT
      a.question_id,
      COUNT(*) AS total_responses,
      SUM(a.is_correct::int) AS correct_count,
      AVG(a.is_correct::int) AS accuracy
    FROM answers a
    ${whereSQL}
    GROUP BY a.question_id
    ORDER BY a.question_id
    `,
    params
  );

  // Game summary
  const summaryResult = await pool.query(
    `
    SELECT
      COUNT(DISTINCT a.user_id) AS total_players,
      AVG(gp.score) AS average_score,
      AVG(a.is_correct::int) AS overall_accuracy
    FROM answers a
    JOIN game_players gp 
      ON gp.user_id = a.user_id AND gp.game_id = a.game_id
    ${whereSQL}
    `,
    params
  );

  return {
    game: {
      id: gameId,
      ...summaryResult.rows[0]
    },
    players: playersResult.rows,
    questions: questionsResult.rows
  };
}

async function getStudentStats(gameId, userId, options = {}) {
  const { filter, date_from, date_to } = options;

  let params = [gameId, userId];
  let where = [
    "a.game_id = $1",
    "a.user_id = $2"
  ];

  let idx = 3;

  if (date_from) {
    where.push(`a.answered_at >= $${idx++}`);
    params.push(date_from);
  }

  if (date_to) {
    where.push(`a.answered_at <= $${idx++}`);
    params.push(date_to);
  }

  if (filter === "incorrect") {
    where.push(`a.is_correct = false`);
  }

  const whereSQL = `WHERE ${where.join(" AND ")}`;

  // Question detail
  const questionsResult = await pool.query(
    `
    SELECT 
      a.question_id,
      a.selected_option,
      a.is_correct,
      q.correct_option
    FROM answers a
    JOIN questions q ON q.id = a.question_id
    ${whereSQL}
    `,
    params
  );

  // Summary
  const summaryResult = await pool.query(
    `
    SELECT
      gp.score,
      COUNT(*) AS total,
      SUM(a.is_correct::int) AS correct,
      AVG(a.is_correct::int) AS accuracy
    FROM answers a
    JOIN game_players gp
      ON gp.user_id = a.user_id AND gp.game_id = a.game_id
    ${whereSQL}
    GROUP BY gp.score
    `,
    params
  );

  return {
    player: {
      id: userId,
      ...(summaryResult.rows[0] || {
        score: 0,
        total: 0,
        correct: 0,
        accuracy: 0
      })
    },
    questions: questionsResult.rows
  };
}

module.exports = {
  getTeacherStats,
  getStudentStats
};