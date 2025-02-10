const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const { sendVerificationEmai} = require('../controllers/userController')

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log('No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Invalid token:', err);
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = user;
    console.log('Authenticated user:', user);
    next();
  });
};

async function triggerVerification(email, token) {
    await sendVerificationEmail(email, token);
}

function redirectIfAuthenticated(req, res, next) {
    if (req.session.userId) {
        return res.redirect('/profil'); // Chemin vers la page de profil
    }
    next();
}

function ensureAuthenticated(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirige vers la page de connexion si non connecté
    }
    next();
}

try {
    const { sendVerificationEmail } = require('../controllers/userController');
    console.log('userController importé avec succès');
} catch (error) {
    console.error('Erreur lors de l\'import de userController:', error.message);
}

module.exports = { triggerVerification, redirectIfAuthenticated, ensureAuthenticated };
module.exports = authenticateJWT;