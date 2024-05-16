const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = new User({ username, email });
    await User.register(user, password);
    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.status(200).json({ message: 'User logged in' });
});

module.exports = router;