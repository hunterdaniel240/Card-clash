const pool = require("../config/database");

// Add Question
async function addQuestion(question) {
  const {
    teacher_id,
    question_text,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_option
  } = question;

  const result = await pool.query(
    `INSERT INTO questions
      (teacher_id, question_text,
       option_a, option_b, option_c, option_d,
       correct_option)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      teacher_id,
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option
    ]
  );

  return result.rows[0];
}

// Delete Question
async function deleteQuestion(id) {
  const result = await pool.query(
    `DELETE FROM questions
     WHERE id=$1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
}

module.exports = {
  addQuestion,
  deleteQuestion
};