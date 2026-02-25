const jwt = require("jsonwebtoken");
require("dotenv").config({ path: [".env.local"] });

async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    // LOG IN DB FUNCTION

    const token = jwt.sign({ id: 1, email: email }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
    });
    res.status(200).json({ message: "successful login" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function registerController(req, res) {
  // const { name, email, password, role } = req.body;
}

module.exports = {
  loginController,
  registerController,
};
