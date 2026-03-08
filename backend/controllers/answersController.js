const Answer = require("../models/Answer");

// Submit an answer
async function submitAnswerController(req, res) {
  try {
    const answer = await Answer.submitAnswer(req.body);
    res.status(201).json(answer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit answer" });
  }
}

// Get all answers for a game
async function getAnswersByGameController(req, res) {
  try {
    const answers = await Answer.getAnswersByGame(req.params.gameId);
    res.json(answers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch answers" });
  }
}

// Get all answers by a player
async function getAnswersByUserController(req, res) {
  try {
    const answers = await Answer.getAnswersByUser(req.params.userId);
    res.json(answers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user answers" });
  }
}

module.exports = {
  submitAnswerController,
  getAnswersByGameController,
  getAnswersByUserController
};