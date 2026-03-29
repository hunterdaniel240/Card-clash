const pool = require("../config/database");

async function getTeacherStats(gameId) {
  // Get all answers + user names
  const answersResult = await pool.query(
    `SELECT 
        a.user_id,
        u.name,
        a.question_id,
        a.is_correct
     FROM answers a
     JOIN users u ON u.id = a.user_id
     WHERE a.game_id = $1`,
    [gameId]
  );

  const answers = answersResult.rows;

  // Get player scores
  const scoresResult = await pool.query(
    `SELECT user_id, score
     FROM game_players
     WHERE game_id = $1`,
    [gameId]
  );

  const scoresMap = {};
  scoresResult.rows.forEach(p => {
    scoresMap[p.user_id] = p.score;
  });

  // --- Aggregate players ---
  const playerMap = {};

  answers.forEach(a => {
    if (!playerMap[a.user_id]) {
      playerMap[a.user_id] = {
        id: a.user_id,
        name: a.name,
        score: scoresMap[a.user_id] || 0,
        correct: 0,
        total: 0
      };
    }

    playerMap[a.user_id].total++;
    if (a.is_correct) playerMap[a.user_id].correct++;
  });

  const players = Object.values(playerMap).map(p => ({
    ...p,
    accuracy: p.total ? p.correct / p.total : 0
  }));

  // --- Aggregate questions ---
  const questionMap = {};

  answers.forEach(a => {
    if (!questionMap[a.question_id]) {
      questionMap[a.question_id] = {
        question_id: a.question_id,
        total_responses: 0,
        correct_count: 0
      };
    }

    questionMap[a.question_id].total_responses++;
    if (a.is_correct) questionMap[a.question_id].correct_count++;
  });

  const questions = Object.values(questionMap).map(q => ({
    ...q,
    accuracy: q.total_responses
      ? q.correct_count / q.total_responses
      : 0
  }));

  // --- Game stats ---
  const totalPlayers = players.length;

  const avgScore =
    totalPlayers > 0
      ? players.reduce((sum, p) => sum + p.score, 0) / totalPlayers
      : 0;

  const totalCorrect = players.reduce((sum, p) => sum + p.correct, 0);
  const totalAnswers = players.reduce((sum, p) => sum + p.total, 0);

  return {
    game: {
      id: gameId,
      total_players: totalPlayers,
      average_score: avgScore,
      overall_accuracy:
        totalAnswers > 0 ? totalCorrect / totalAnswers : 0
    },
    players,
    questions
  };
}

async function getStudentStats(gameId, userId) {
  const result = await pool.query(
    `SELECT 
        a.question_id,
        a.selected_option,
        a.is_correct,
        q.correct_option
     FROM answers a
     JOIN questions q ON q.id = a.question_id
     WHERE a.game_id = $1 AND a.user_id = $2`,
    [gameId, userId]
  );

  const data = result.rows;

  const total = data.length;
  const correct = data.filter(r => r.is_correct).length;

  // get score from game_players
  const scoreResult = await pool.query(
    `SELECT score 
     FROM game_players
     WHERE game_id = $1 AND user_id = $2`,
    [gameId, userId]
  );

  const score = scoreResult.rows[0]?.score || 0;

  return {
    player: {
      id: userId,
      score,
      correct,
      total,
      accuracy: total ? correct / total : 0
    },
    questions: data.map(q => ({
      question_id: q.question_id,
      selected_answer: q.selected_option,
      correct_answer: q.correct_option,
      is_correct: q.is_correct
    }))
  };
}

module.exports = {
  getTeacherStats,
  getStudentStats
};