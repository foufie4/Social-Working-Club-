const express = require('express');
const router = express.Router();
const userController = require('./userController');
const authMiddleware = require('./authMiddleware');
const { loginUser, signupUser, login, register, profil, sendVerificationEmail } = require('./userController');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email }).exec();
        if (!user) {
            console.log("No user found with that email.");
            return res.status(401).json({ success: false, message: 'Incorrect email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Password does not match.");
            return res.status(401).json({ success: false, message: 'Incorrect email or password' });
        }
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log("Login successful, token generated.");
        res.json({ success: true, message: 'Logged in successfully', token: token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/login', loginUser);
router.post('/register', signupUser);
router.get('/login', login);
router.get('/register', register);
router.get('/profil', profil);

router.get('/login', authMiddleware.redirectIfAuthenticated, userController.login);
router.get('/register', authMiddleware.redirectIfAuthenticated, userController.register);
router.get('/profil', authMiddleware.ensureAuthenticated, userController.profil);

module.exports = router;