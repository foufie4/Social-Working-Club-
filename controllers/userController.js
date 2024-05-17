const User = require('../models/user');
const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;

exports.signupUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const user = new User({ username, email, password });
    await user.save();
    console.log('User registered:', user); // Log pour débogage
    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    console.error('Server error during signup:', error); // Log de l'erreur
    res.status(500).json({ error: 'Server error' });
  }
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found'); // Log pour débogage
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isValidPassword = await user.validPassword(password);
    if (!isValidPassword) {
      console.log('Invalid password'); // Log pour débogage
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful'); // Log pour débogage
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Server error during login:', error); // Log de l'erreur
    res.status(500).json({ error: 'Server error' });
  }
};