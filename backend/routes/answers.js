const express = require("express");
const router = express.Router();
const controller = require("../controllers/answersController");

router.post("/", controller.submitAnswerController);
router.get("/game/:gameId", controller.getAnswersByGameController);
router.get("/user/:userId", controller.getAnswersByUserController);

module.exports = router;