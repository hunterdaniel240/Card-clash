const express = require("express");
const router = express.Router();
const controller = require("../controllers/aiSummaryController");
const {
  generateStudentFeedback,
  generateTeacherFeedback,
} = require("../services/aiSummaryService");

router.post("/", controller.createSummaryController);
router.get("/game/:gameId", controller.getSummaryByGameController);

// ai calls
router.post("/student", async (req, res) => {
  const { summary, studentName } = req.body;

  const feedback = await generateStudentFeedback(summary, studentName);

  res.json({ feedback });
});

router.post("/teacher", async (req, res) => {
  const { summary } = req.body;

  const feedback = await generateTeacherFeedback(summary);

  res.json({ feedback });
});
module.exports = router;
