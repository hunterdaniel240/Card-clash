const jwt = require("jsonwebtoken");
const { loginUser, registerUser } = require("../services/authService");
require("dotenv").config({ path: [".env.local"] });

async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    const user = await loginUser({ email, password });
    if (!req.cookies?.token) {
      const token = jwt.sign({ id: 1, email: email }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      // Set token in cookie
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
      });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function registerController(req, res) {
  try {
    const { name, email, password, role } = req.body;
    const user = await registerUser({ name, email, password, role });
    const token = jwt.sign({ id: 1, email: email }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
    });

    res.json({
      message: "Registration successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = {
  loginController,
  registerController,
};
