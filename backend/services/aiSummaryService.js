const OpenAi = require("openai");

const client = new OpenAi();

async function generateStudentFeedback(summary, studentName) {
  const filtered = summary.filter((q) =>
    q.players.some((p) => p.name === studentName && !p.correct),
  );

  const studentQuestions = filtered.map((q) => {
    const student = q.players.find((p) => p.name === studentName);
    return {
      question: q.question_text,
      correctAnswer: `${q.correct_option}: ${q.options[q.correct_option]}`,
      studentAnswer: `${student.answer_selected}: ${q.options[student.answer_selected]}`,
    };
  });

  if (studentQuestions.length === 0) {
    return "You answered all questions correctly!";
  }

  console.log("use for prompt: " + JSON.stringify(studentQuestions));

  const prompt = `You are an educational assistant helping a student improve after a trivia game.

    Analyze ONLY the questions the student got wrong.

    For each incorrect question:
    - Explain why their selected answer might have seemed correct
    - Explain why it is incorrect
    - Identify the concept they misunderstood

    Then provide:
    1. A short summary of their weak areas
    2. 2–3 specific things they should study or review

    Keep the tone encouraging and clear.

    Student Results:
    ${JSON.stringify(studentQuestions, null, 2)}

    Return response in this format:

    Weak Areas:
    - ...

    Per Question Feedback:
    - Question: ...
    Your Answer: ...
    Correct Answer: ...
    Explanation: ...

    Study Recommendations:
    - ...
    `;

  console.log(prompt);
  // const response = await client.responses.create({
  //   model: "gpt-4.1-mini",
  //   input: prompt,
  // });
  // // response.output[0].content[0].text
  // return response.output_text;
}

async function generateTeacherFeedback(summary) {
  const prompt = `
    You are an assistant helping a teacher analyze class performance from a trivia game.

    Analyze the data and provide:

    1. Overall Performance Summary
    2. Questions Students Struggled With Most
    3. Common Misconceptions (based on wrong answers)
    4. Suggested Teaching Improvements

    Focus on patterns across multiple students.

    Game Data:
    ${JSON.stringify(summary, null, 2)}

    Return response in this format:

    Overall Performance:
    - ...

    Difficult Questions:
    - Question: ...
    % Incorrect: ...
    Common Wrong Answers: ...

    Misconceptions:
    - ...

    Teaching Suggestions:
    - ...
    `;

  console.log(prompt);

  // const response = await client.responses.create({
  //   model: "gpt-4.1-mini",
  //   input: prompt,
  // });

  // return response.output_text;
}

module.exports = { generateStudentFeedback, generateTeacherFeedback };
