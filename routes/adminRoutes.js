const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');
const authenticateJWT = require('../middleware/authJWT');
const checkAdmin = require('../middleware/checkAdmin');

router.use(authenticateJWT); // Utiliser JWT pour authentification
router.use(checkAdmin); // Utiliser le middleware admin

// Route pour supprimer un utilisateur
router.delete('/user/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Route pour supprimer une publication
router.delete('/post/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;