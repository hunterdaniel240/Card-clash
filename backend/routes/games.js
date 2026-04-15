const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");

router.post("/", gameController.createGameController);
router.get("/", gameController.getAllGamesController);
router.get("/:id/stats", gameController.getGameStatsController);
router.get("/:id", gameController.getGameByIdController);
router.get(
  "/stats/student/:userId",
  gameController.getStudentStatsByDateController,
);
router.get(
  "/stats/teacher/:userId",
  gameController.getTeacherStatsByDateController,
);

module.exports = router;
