const { sendVerificationEmail } = require('./userController');

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

module.exports = { triggerVerification, redirectIfAuthenticated, ensureAuthenticated };