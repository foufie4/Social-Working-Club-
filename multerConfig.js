const express = require('express');
const multer = require('multer');
const router = express.Router();
const User = require('./user');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');  // Ensure this directory exists on your server
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.post('/updateProfile', upload.single('profile-pic'), async (req, res) => {
    try {
        const { username, bio } = req.body;
        const profilePic = req.file ? req.file.path : ''; // Check for file path
        const userId = req.session.userId; // Ensure session is correctly set

        const updatedUser = await User.findByIdAndUpdate(userId, {
            username, bio, profilePic
        }, { new: true });

        if (!updatedUser) {
            return res.status(404).send('User not found.');
        }
        res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).send('Failed to update profile');
    }
});

module.exports = router;