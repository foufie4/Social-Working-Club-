const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./user'); // Ensure this path is correct
const router = express.Router();
const { loginUser, signupUser } = require('./userController');

router.use(bodyParser.json());

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "No user found with that email" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Password does not match" });
        }

        const token = jwt.sign({ id: user._id }, 'yourSecretKey', { expiresIn: '1h' });
        res.status(200).json({ message: "Login successful", token, pseudo: user.fullname });
    } catch (error) {
        console.error('Login processing error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/login', loginUser);
router.post('/signup', signupUser);

module.exports = router;