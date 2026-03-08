const { addQuestion, deleteQuestion } = require("../models/Question");

async function createQuestionController(req, res) {
  try {
    const question = await addQuestion(req.body);

    res.status(201).json(question);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create question" });
  }
}

async function deleteQuestionController(req, res) {
  try {
    const { id } = req.params;

    const deleted = await deleteQuestion(id);

    if (!deleted) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({
      message: "Question deleted",
      question: deleted
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete question" });
  }
}

module.exports = {
  createQuestionController,
  deleteQuestionController
};