const express = require("express");
const router = express.Router();
const controller = require("../controllers/gamePlayersController");

router.post("/", controller.addPlayerController);
router.delete("/:id", controller.removePlayerController);
router.get("/game/:gameId", controller.getPlayersByGameController);
router.put("/:id/score", controller.updatePlayerScoreController);

module.exports = router;