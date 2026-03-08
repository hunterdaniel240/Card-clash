const express = require("express");
const router = express.Router();

const {
  createUserController,
  getUserByEmailController
} = require("../controllers/userController");

router.post("/", createUserController);
router.get("/:email", getUserByEmailController);

module.exports = router;