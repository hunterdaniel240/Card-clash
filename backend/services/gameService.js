const pool = require("../config/database");

async function getTeacherStatsByDate(userId, date_from, date_to) {
  let params = [userId];
  let where = ["g.host_id = $1"];
  let idx = 2;

  if (date_from) {
    where.push(`g.ended_at >= $${idx++}`);
    params.push(date_from);
  }
  if (date_to) {
    where.push(`g.ended_at <= $${idx++}`);
    params.push(date_to);
  }

  const whereSQL = `WHERE ${where.join(" AND ")}`;

  // Per-game summary (for the chart + drilldown)
  const gamesResult = await pool.query(
    `
  SELECT
    g.id AS game_id,
    g.join_code,
    g.ended_at,
    gp_agg.total_players,
    gp_agg.avg_score,
    AVG(qstats.accuracy) AS accuracy,
    json_agg(
      json_build_object(
        'question_id', q.id,
        'question_text', q.question_text,
        'total_responses', qstats.total_responses,
        'correct_count', qstats.correct_count,
        'accuracy', qstats.accuracy,
        'option_a', q.option_a,
        'option_b', q.option_b,
        'option_c', q.option_c,
        'option_d', q.option_d,
        'correct_answer', q.correct_option
      )
      ORDER BY gq.order_index
    ) AS questions
    FROM games g
    JOIN (
      SELECT
        game_id,
        COUNT(DISTINCT user_id) AS total_players,
        AVG(score) AS avg_score
      FROM game_players
      GROUP BY game_id
    ) gp_agg ON gp_agg.game_id = g.id
    JOIN game_questions gq ON gq.game_id = g.id
    JOIN questions q ON q.id = gq.question_id
    JOIN (
      SELECT
        a.game_id,
        a.question_id,
        COUNT(*) AS total_responses,
        SUM(a.is_correct::int) AS correct_count,
        AVG(a.is_correct::int) AS accuracy
      FROM answers a
      GROUP BY a.game_id, a.question_id
    ) qstats ON qstats.game_id = g.id AND qstats.question_id = q.id
    ${whereSQL}
    GROUP BY g.id, g.join_code, g.ended_at, gp_agg.total_players, gp_agg.avg_score
    ORDER BY g.ended_at DESC
  `,
    params,
  );

  // Player leaderboard across all games
  const playersResult = await pool.query(
    `
    SELECT
      u.id,
      u.name,
      COUNT(DISTINCT g.id) AS total_games,
      AVG(gp.score) AS avg_score,
      COUNT(a.id) AS total_answers,
      SUM(a.is_correct::int) AS correct,
      AVG(a.is_correct::int) AS accuracy
    FROM games g
    JOIN answers a ON a.game_id = g.id
    JOIN users u ON u.id = a.user_id
    JOIN game_players gp ON gp.user_id = a.user_id AND gp.game_id = g.id
    ${whereSQL}
    GROUP BY u.id, u.name
    ORDER BY avg_score DESC
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

  // Summary totals
  const summaryResult = await pool.query(
    `
    SELECT
      COUNT(DISTINCT g.id) AS total_games,
      COUNT(DISTINCT a.user_id) AS total_players,
      AVG(gp.score) AS average_score,
      AVG(a.is_correct::int) AS overall_accuracy
    FROM games g
    JOIN answers a ON a.game_id = g.id
    JOIN game_players gp ON gp.user_id = a.user_id AND gp.game_id = g.id
    ${whereSQL}
    `,
    params,
  );

  return {
    timeframe: { date_from, date_to },
    summary: summaryResult.rows[0],
    players: playersResult.rows,
    games: gamesResult.rows,
    questions: questionsResult.rows,
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
      g.join_code AS join_code,
      g.ended_at,
      COUNT(a.id) AS total_answers,
      SUM(a.is_correct::int) AS correct,
      AVG(a.is_correct::int) AS accuracy,
      MAX(gp.score) AS score,
      json_agg(
        json_build_object(
          'question_id', q.id,
          'question_text', q.question_text,
          'option_a', q.option_a,
          'option_b', q.option_b,
          'option_c', q.option_c,
          'option_d', q.option_d,
          'correct_answer', q.correct_option,
          'selected_choice_id', a.selected_option,
          'selected_choice_text', CASE a.selected_option
                                    WHEN 'A' THEN q.option_a
                                    WHEN 'B' THEN q.option_b
                                    WHEN 'C' THEN q.option_c
                                    WHEN 'D' THEN q.option_d
                                  END,
          'is_correct', a.is_correct
        )
          ORDER BY gq.order_index
      ) AS questions
    FROM games g
    JOIN game_players gp
      ON gp.game_id = g.id AND gp.user_id = $1
    JOIN game_questions gq
      ON gq.game_id = g.id
    JOIN questions q
      ON q.id = gq.question_id
    LEFT JOIN answers a 
      ON a.game_id = g.id AND a.question_id = q.id AND a.user_id = $1
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
      join_code: g.join_code,
      score: Number(g.score || 0),
      accuracy: Number(g.accuracy || 0),
      total_answers: Number(g.total_answers || 0),
      correct: Number(g.correct || 0),
      ended_at: g.ended_at,
      questions: (g.questions || []).map((q) => ({
        question_id: q.question_id,
        question_text: q.question_text,
        options: {
          a: q.option_a,
          b: q.option_b,
          c: q.option_c,
          d: q.option_d,
        },
        correct_answer: q.correct_answer,
        selected_option: q.selected_choice_id ?? null,
        selected_text: q.selected_choice_text ?? null,
        is_correct: q.is_correct ?? null,
      })),
    })),
  };
}

module.exports = {
  getTeacherStatsByDate,
  getStudentStatsByDate,
};
