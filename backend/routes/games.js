const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");

// TEST FOR DELETION
// router.post("/", gameController.createGameController);
// router.get("/", gameController.getAllGamesController);
// router.get("/:id/stats", gameController.getGameStatsController);
// router.get("/:id", gameController.getGameByIdController);
router.get(
  "/stats/teacher/:userId",
  gameController.getTeacherStatsByDateController,
);
router.get(
  "/stats/student/:userId",
  gameController.getStudentStatsByDateController,
);

module.exports = router;
