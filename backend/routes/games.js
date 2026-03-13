const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");

router.post("/", gameController.createGameController);
router.get("/", gameController.getAllGamesController);
router.get("/:id", gameController.getGameByIdController);

module.exports = router;