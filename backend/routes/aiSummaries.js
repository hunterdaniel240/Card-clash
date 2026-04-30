const express = require("express");
const router = express.Router();
const controller = require("../controllers/aiSummaryController");
const {
  generateStudentFeedback,
  generateTeacherFeedback,
} = require("../services/aiSummaryService");
const AISummary = require("../models/AISummary");

// ai calls
router.post("/student", async (req, res) => {
  try {
    const { game_id, user_id, summary, studentName } = req.body;

    const feedback = await generateStudentFeedback(summary, studentName);

    const summary_dbresult = await controller.createSummaryController({
      game_id: game_id,
      user_id: user_id,
      summary_text: feedback,
    });

    res.json({ summary: feedback });
  } catch (error) {
    console.error("AI unavailable: ", error);
    res.status(500).json({ error: "AI service unavailable" });
  }
});

router.post("/teacher", async (req, res) => {
  try {
    const { game_id, user_id, summary } = req.body;

    const feedback = await generateTeacherFeedback(summary);

    const summary_dbresult = await controller.createSummaryController({
      game_id: game_id,
      user_id: user_id,
      summary_text: feedback,
    });

    res.json({ summary: feedback });
  } catch (error) {
    console.error("AI unavailable: ", error);
    res.status(500).json({ error: "AI service unavailable" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { game_id, user_id } = req.query;
    if (!game_id || !user_id) {
      return res
        .status(400)
        .json({ error: "game_id and user_id are required" });
    }

    const result = await AISummary.getSummaryByGame(game_id, user_id);

    res.json(result);
  } catch (err) {
    console.error("Error fetching AI summary:", err);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});
module.exports = router;
