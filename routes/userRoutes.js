const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authJWT');
const UserController = require('../controllers/userController');

router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginUser);

router.get('/profil', authenticateJWT, async (req, res) => {
  try {
    const user = await user.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;