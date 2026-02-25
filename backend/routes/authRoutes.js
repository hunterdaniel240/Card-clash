const express = require("express");
const router = express.Router();
const { loginController } = require("../controllers/authController");
const authenticateToken = require("../middleware/auth");

// Login
router.post("/auth/login", loginController);

// Verify token
router.get("/auth/me", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
