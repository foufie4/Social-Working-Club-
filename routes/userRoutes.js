const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authJWT');
const UserController = require('../controllers/userController');
const User = require('../models/user');

router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginUser);

router.get('/me', authenticateJWT, async (req, res) => {
  try {
    console.log('Fetching user with ID:', req.user.id);
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.log('User not found with ID:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Server error during fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;