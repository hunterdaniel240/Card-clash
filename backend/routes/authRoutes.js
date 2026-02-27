const express = require("express");
const router = express.Router();
const {
  loginController,
  registerController,
} = require("../controllers/authController");
const authenticateToken = require("../middleware/auth");

// Login
router.post("/auth/login", loginController);

// Register
router.post("/auth/register", registerController);

// Verify token
router.get("/auth/me", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
