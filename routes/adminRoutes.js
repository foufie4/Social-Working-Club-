const express = require('express');
const router = express.Router();
const user = require('../models/user');
const Post = require('../models/post');
const authenticateJWT = require('../middleware/authJWT');
const checkAdmin = require('../middleware/checkAdmin');
const userController = require('../controllers/userController');

router.use(authenticateJWT);
router.use(checkAdmin); 
router.get('/dashboard', userController.adminDashboard);

// Route pour supprimer un utilisateur
router.delete('/user/:id', async (req, res) => {
  try {
    await user.findByIdAndDelete(req.params.id);
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

// Route pour modifier une publication
router.put('/post/:id', async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;