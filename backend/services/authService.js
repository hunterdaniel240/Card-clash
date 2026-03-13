const { findUserByEmail, createUser } = require("../models/User");
const bcrypt = require("bcrypt");

async function registerUser({ name, email, password, role }) {
  const existing = await findUserByEmail(email);

  if (existing) {
    throw new Error("Email already in use");
  }

  // password hashing for security
  const password_hash = await bcrypt.hash(password, 10);
  return await createUser({ name, email, password_hash, role });
}

async function loginUser({ email, password }) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("Invalid email");
  }

  // verify password
  const matching = await bcrypt.compare(password, user.password_hash);
  if (!matching) {
    throw new Error("Invalid Password");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  };
}

module.exports = {
  registerUser,
  loginUser,
};
