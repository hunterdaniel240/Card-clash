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
  const { game_id, user_id, summary, studentName } = req.body;

  const feedback = await generateStudentFeedback(summary, studentName);

  const summary_dbresult = await controller.createSummaryController({
    game_id: game_id,
    user_id: user_id,
    summary_text: feedback,
  });

  res.json({ summary: feedback });
});

router.post("/teacher", async (req, res) => {
  const { game_id, user_id, summary } = req.body;

  const feedback = await generateTeacherFeedback(summary);

  const summary_dbresult = await controller.createSummaryController({
    game_id: game_id,
    user_id: user_id,
    summary_text: feedback,
  });

  res.json({ summary: feedback });
});
module.exports = router;
