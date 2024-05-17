const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authenticateJWT = require('../middleware/authJWT');

const { JWT_SECRET } = process.env;

router.post('/register', UserController.signupUser);
router.post('/login', UserController.loginUser);

router.get('/profile', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;