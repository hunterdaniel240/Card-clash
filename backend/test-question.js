const Question = require("./models/Question");

(async () => {
  // a teacher with id 1 must exist prior to testing question
  const mockQuestion = {
    teacher_id: 1,
    question_text: "Test question?",
    option_a: "A1",
    option_b: "B1",
    option_c: "C1",
    option_d: "D1",
    correct_option: "A"
  };

  const inserted = await Question.addQuestion(mockQuestion);
  console.log("INSERTED:", inserted);

  const deleted = await Question.deleteQuestion(inserted.id);
  console.log("DELETED:", deleted);

})();