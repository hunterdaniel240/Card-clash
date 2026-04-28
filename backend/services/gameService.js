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
    params,
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
    params,
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
    params,
  );

  return {
    game: {
      id: gameId,
      ...summaryResult.rows[0],
    },
    players: playersResult.rows,
    questions: questionsResult.rows,
  };
}

async function getStudentStats(gameId, userId, options = {}) {
  const { filter, date_from, date_to } = options;

  let params = [gameId, userId];
  let where = ["a.game_id = $1", "a.user_id = $2"];

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
    params,
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
    params,
  );

  return {
    player: {
      id: userId,
      ...(summaryResult.rows[0] || {
        score: 0,
        total: 0,
        correct: 0,
        accuracy: 0,
      }),
    },
    questions: questionsResult.rows,
  };
}

async function getTeacherStatsByDate(userId, date_from, date_to) {
  let params = [userId];
  let where = ["g.host_id = $1"];
  let idx = 2;

  // Date filtering
  if (date_from) {
    where.push(`g.ended_at >= $${idx++}`);
    params.push(date_from);
  }

  if (date_to) {
    where.push(`g.ended_at <= $${idx++}`);
    params.push(date_to);
  }

  const whereSQL = `WHERE ${where.join(" AND ")}`;

  console.log("where clause: " + whereSQL);

  // Player stats across games
  const playersResult = await pool.query(
    `
    SELECT 
      a.user_id AS id,
      u.name,
      COUNT(DISTINCT g.id) AS total_games,
      SUM(DISTINCT gp.score) AS total_score,
      COUNT(*) AS total_answers,
      SUM(a.is_correct::int) AS correct,
      AVG(a.is_correct::int) AS accuracy
    FROM games g
    JOIN answers a ON a.game_id = g.id
    JOIN users u ON u.id = a.user_id
    JOIN game_players gp 
      ON gp.user_id = a.user_id AND gp.game_id = g.id
    ${whereSQL}
    GROUP BY a.user_id, u.name
    ORDER BY total_score DESC
    `,
    params,
  );

  // Question stats
  const questionsResult = await pool.query(
    `
    SELECT
      a.question_id,
      q.question_text,
      COUNT(*) AS total_responses,
      SUM(a.is_correct::int) AS correct_count,
      AVG(a.is_correct::int) AS accuracy
    FROM games g
    JOIN answers a ON a.game_id = g.id
    JOIN questions q ON q.id = a.question_id
    ${whereSQL}
    GROUP BY a.question_id, q.question_text
    `,
    params,
  );

  // Summary
  const summaryResult = await pool.query(
    `
    SELECT
      COUNT(DISTINCT g.id) AS total_games,
      COUNT(DISTINCT a.user_id) AS total_players,
      AVG(gp.score) AS average_score,
      AVG(a.is_correct::int) AS overall_accuracy
    FROM games g
    JOIN answers a ON a.game_id = g.id
    JOIN game_players gp 
      ON gp.user_id = a.user_id AND gp.game_id = g.id
    ${whereSQL}
    `,
    params,
  );

  return {
    timeframe: { date_from, date_to },
    summary: summaryResult.rows[0],
    players: playersResult.rows,
    questions: questionsResult.rows,
  };
}

async function getStudentStatsByDate(userId, date_from, date_to) {
  let params = [userId];
  let dateWhere = [];
  let idx = 2;

  if (date_from) {
    dateWhere.push(`g.ended_at >= $${idx++}`);
    params.push(date_from);
  }

  if (date_to) {
    dateWhere.push(`g.ended_at <= $${idx++}`);
    params.push(date_to);
  }

  console.log(params.toString());
  const dateWhereSQL = dateWhere.length ? `AND ${dateWhere.join(" AND ")}` : "";

  // Summary stats for the student
  const summaryResult = await pool.query(
    `
    SELECT
      COUNT(DISTINCT g.id)        AS total_games,
      SUM(gp.score)               AS total_score,
      AVG(gp.score)               AS average_score,
      SUM(a.is_correct::int)      AS total_correct,
      COUNT(a.id)                 AS total_answers,
      AVG(a.is_correct::int)      AS overall_accuracy
    FROM games g
    JOIN game_players gp ON gp.game_id = g.id AND gp.user_id = $1
    JOIN answers a       ON a.game_id = g.id  AND a.user_id = $1
    WHERE g.ended_at IS NOT NULL
    ${dateWhereSQL}
    `,
    params,
  );

  // Per game breakdown for the graph (one row per game)
  const gamesResult = await pool.query(
    `
    SELECT
      g.id                        AS game_id,
      g.ended_at,
      gp.score,
      SUM(a.is_correct::int)      AS correct,
      COUNT(a.id)                 AS total_answers,
      AVG(a.is_correct::int)      AS accuracy
    FROM games g
    JOIN game_players gp ON gp.game_id = g.id AND gp.user_id = $1
    JOIN answers a       ON a.game_id = g.id  AND a.user_id = $1
    WHERE g.ended_at IS NOT NULL
    ${dateWhereSQL}
    GROUP BY g.id, g.ended_at, gp.score
    ORDER BY g.ended_at ASC
    `,
    params,
  );

  return {
    timeframe: { date_from, date_to },
    summary: summaryResult.rows[0],
    games: gamesResult.rows,
  };
}

async function getStudentStatsByDate(userId, date_from, date_to) {
  let params = [userId];
  let where = ["a.user_id = $1"];
  let idx = 2;

  // Date filtering (based on game end)
  if (date_from) {
    where.push(`g.ended_at >= $${idx++}`);
    params.push(date_from);
  }

  if (date_to) {
    where.push(`g.ended_at <= $${idx++}`);
    params.push(date_to);
  }

  const whereSQL = `WHERE ${where.join(" AND ")}`;

  // Question-level data (what student answered)
  const gamesResult = await pool.query(
    `
    SELECT
      g.id AS game_id,
      g.ended_at,
      COUNT(a.id) AS total_answers,
      SUM(a.is_correct::int) AS correct,
      AVG(a.is_correct::int) AS accuracy,
      MAX(gp.score) AS score  
    FROM games g
    JOIN answers a ON a.game_id = g.id
    JOIN game_players gp
      ON gp.game_id = g.id AND gp.user_id = $1
    ${whereSQL}
    GROUP BY g.id, g.ended_at
    ORDER BY g.ended_at DESC
    `,
    params,
  );

  // Summary aggregation
  const summaryResult = await pool.query(
    `
    SELECT
      COUNT(*) AS total_answers,
      SUM(a.is_correct::int) AS total_correct,
      AVG(a.is_correct::int) AS overall_accuracy,
      COUNT(DISTINCT g.id) AS total_games,
      SUM(DISTINCT gp.score) AS total_score,
      AVG(DISTINCT gp.score) AS average_score
    FROM answers a
    JOIN games g ON g.id = a.game_id
    JOIN game_players gp 
      ON gp.game_id = g.id AND gp.user_id = a.user_id
    ${whereSQL}
    `,
    params,
  );

  const summary = summaryResult.rows[0] || {};

  return {
    timeframe: { date_from, date_to },

    summary: {
      total_games: Number(summary.total_games || 0),
      total_answers: Number(summary.total_answers || 0),
      total_correct: Number(summary.total_correct || 0),
      total_score: Number(summary.total_score || 0),
      average_score: Number(summary.average_score || 0),
      overall_accuracy: Number(summary.overall_accuracy || 0),
    },

    games: gamesResult.rows.map((g) => ({
      game_id: g.game_id,
      name: new Date(g.ended_at).toLocaleDateString(), // chart label
      score: Number(g.score || 0),
      accuracy: Number(g.accuracy || 0),
      total_answers: Number(g.total_answers || 0),
      correct: Number(g.correct || 0),
      ended_at: g.ended_at,
    })),
  };
}

async function getStudentStatsByDate(userId, date_from, date_to) {
  let params = [userId];
  let where = ["a.user_id = $1"];
  let idx = 2;

  // Date filtering (based on game end)
  if (date_from) {
    where.push(`g.ended_at >= $${idx++}`);
    params.push(date_from);
  }

  if (date_to) {
    where.push(`g.ended_at <= $${idx++}`);
    params.push(date_to);
  }

  const whereSQL = `WHERE ${where.join(" AND ")}`;

  // Question-level data (what student answered)
  const gamesResult = await pool.query(
    `
    SELECT
      g.id AS game_id,
      g.ended_at,
      COUNT(a.id) AS total_answers,
      SUM(a.is_correct::int) AS correct,
      AVG(a.is_correct::int) AS accuracy,
      MAX(gp.score) AS score  
    FROM games g
    JOIN answers a ON a.game_id = g.id
    JOIN game_players gp
      ON gp.game_id = g.id AND gp.user_id = $1
    ${whereSQL}
    GROUP BY g.id, g.ended_at
    ORDER BY g.ended_at DESC
    `,
    params,
  );

  // Summary aggregation
  const summaryResult = await pool.query(
    `
    SELECT
      COUNT(*) AS total_answers,
      SUM(a.is_correct::int) AS total_correct,
      AVG(a.is_correct::int) AS overall_accuracy,
      COUNT(DISTINCT g.id) AS total_games,
      SUM(DISTINCT gp.score) AS total_score,
      AVG(DISTINCT gp.score) AS average_score
    FROM answers a
    JOIN games g ON g.id = a.game_id
    JOIN game_players gp 
      ON gp.game_id = g.id AND gp.user_id = a.user_id
    ${whereSQL}
    `,
    params,
  );

  const summary = summaryResult.rows[0] || {};

  return {
    timeframe: { date_from, date_to },

    summary: {
      total_games: Number(summary.total_games || 0),
      total_answers: Number(summary.total_answers || 0),
      total_correct: Number(summary.total_correct || 0),
      total_score: Number(summary.total_score || 0),
      average_score: Number(summary.average_score || 0),
      overall_accuracy: Number(summary.overall_accuracy || 0),
    },

    games: gamesResult.rows.map((g) => ({
      game_id: g.game_id,
      name: new Date(g.ended_at).toLocaleDateString(), // chart label
      score: Number(g.score || 0),
      accuracy: Number(g.accuracy || 0),
      total_answers: Number(g.total_answers || 0),
      correct: Number(g.correct || 0),
      ended_at: g.ended_at,
    })),
  };
}

module.exports = {
  getTeacherStats,
  getStudentStats,
  getTeacherStatsByDate,
  getStudentStatsByDate,
};
