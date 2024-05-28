const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { JWT_SECRET } = process.env;

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(`Generated hashed password: ${hashedPassword}`);
        
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        console.log(`Stored hashed password in DB: ${user.password}`);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Attempting login with email: ${email} and password: ${password}`);
    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User not found: ${email}`);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        console.log(`Stored password hash: ${user.password}`);
        const passwordHex = Buffer.from(password, 'utf-8').toString('hex');
        console.log(`Password to compare: ${password}`);
        console.log(`Password in hex: ${passwordHex}`);
        
        const validPassword = await bcrypt.compare(password, user.password);
        console.log(`Password comparison result: ${validPassword}`);

        if (!validPassword) {
            console.log(`Invalid password for user: ${email}`);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.log(`Error during login: ${error.message}`);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;