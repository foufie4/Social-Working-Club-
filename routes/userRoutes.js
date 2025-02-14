const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const UserController = require('../controllers/userController');
const multer = require('multer');
const path = require('path');
const User = require('../models/user');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'public/uploads/');
    },
    filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });
  
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

  router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

        res.json({ bio: user.bio });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
  });
  
  // Route POST pour /update-profile
router.post('/update-profile', (req, res, next) => {
  console.log('route atteinte : /update-profile');
  next();
},
  authenticateJWT, // Middleware d'authentification
  upload.single('profileImage'), // Gestion des fichiers
  UserController.updateUserProfile // Contrôleur
);
  
module.exports = router;