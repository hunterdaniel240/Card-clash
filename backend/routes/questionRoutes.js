const express = require("express");
const router = express.Router();

const {
  createQuestionController,
  deleteQuestionController,
  getQuestionsController,
} = require("../controllers/questionController");

router.get("/:teacher_id", getQuestionsController);
router.post("/", createQuestionController);
router.delete("/:id", deleteQuestionController);

module.exports = router;
