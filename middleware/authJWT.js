const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        console.log('Token expired', err);
        return res.status(403).json({ error: 'Token expired' });
      } else {
        console.log('Token verification failed:', err);
        return res.status(403).json({ error: 'Token verification failed' });
      }
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateJWT;