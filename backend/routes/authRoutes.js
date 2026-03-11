const express = require("express");
const router = express.Router();
const {
  loginController,
  registerController,
  logoutController,
} = require("../controllers/authController");
const authenticateToken = require("../middleware/auth");

// Login
router.post("/login", loginController);

// Register
router.post("/register", registerController);

// logout
router.post("/logout", logoutController);

// Verify token
router.get("/me", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
