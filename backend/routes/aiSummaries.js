const express = require("express");
const router = express.Router();
const controller = require("../controllers/aiSummaryController");

router.post("/", controller.createSummaryController);
router.get("/game/:gameId", controller.getSummaryByGameController);

module.exports = router;