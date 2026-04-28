const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");

router.get(
  "/stats/teacher/:userId",
  gameController.getTeacherStatsByDateController,
);
router.get(
  "/stats/student/:userId",
  gameController.getStudentStatsByDateController,
);

module.exports = router;
