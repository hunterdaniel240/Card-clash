const jwt = require('jsonwebtoken');

// Middleware for verifying the JSON Web Tokens
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = authenticateToken;