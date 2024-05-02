const express = require('express');
const multer = require('multer');
const router = express.Router();
const User = require('./user');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/'); // Assurez-vous que ce répertoire existe
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
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

router.post('/updateProfile', upload.single('profilePic'), async (req, res) => {
    const { username, bio } = req.body;
    const profilePic = req.file ? req.file.path : ''; // Assuming the form field for the file is named 'profilePic'
    const userId = req.session.userId;  // Make sure this is set correctly somewhere in your session handling

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, {
            username,
            bio,
            profilePic
        }, { new: true });

        res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).send('Failed to update profile');
    }
});

module.exports = router;