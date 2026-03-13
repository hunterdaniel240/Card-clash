const { createUser, findUserByEmail } = require("../models/User");

async function createUserController(req, res) {
  try {
    const { name, email, password_hash, role } = req.body;

    const user = await createUser({
      name,
      email,
      password_hash,
      role
    });

    res.status(201).json(user);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create user" });
  }
}

async function getUserByEmailController(req, res) {
  try {
    const { email } = req.params;

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database error" });
  }
}

module.exports = {
  createUserController,
  getUserByEmailController
};