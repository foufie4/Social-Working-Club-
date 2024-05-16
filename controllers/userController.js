const User = require('../models/user');
const jwt = require('jsonwebtoken');
const passport = require('passport');

exports.signupUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const user = new User({ username, email });
    await User.register(user, password);
    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.loginUser = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      console.log('Invalid credentials'); // Journal pour déboguer
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    req.login(user, (err) => {
      if (err) return next(err);
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      console.log('Login successful'); // Journal pour déboguer
      return res.json({ token });
    });
  })(req, res, next);
};