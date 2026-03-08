const express = require("express");
const router = express.Router();

const {
  createQuestionController,
  deleteQuestionController
} = require("../controllers/questionController");

router.post("/", createQuestionController);
router.delete("/:id", deleteQuestionController);

module.exports = router;