const jwt = require("jsonwebtoken");

// Middleware for verifying the JSON Web Tokens
const authenticateToken = (req, res, next) => {
  // Retrieve request's token
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: "Token not found" }); // Unauthorized
  }

  // Token was found, check authenticity
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authenticateToken;
