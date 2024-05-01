const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const app = express();
app.use(express.json());

router.use(bodyParser.json()); // Make sure bodyParser is correctly configured

const users = [
    { email: "shamalow423@gmail.com", password: "oips dqra sdid jloe" }
];

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(401).json({ message: 'Authentication failed' });
    }

    if (user.password !== password) {
        return res.status(401).json({ message: 'Authentication failed' });
    }

    res.json({ message: "Login successful", pseudo: "UserPseudo" });
});

module.exports = router;