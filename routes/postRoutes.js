const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authJWT');
const PostController = require('../controllers/postController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/create', authenticateJWT, upload.single('image'), PostController.createPost);
router.get('/', authenticateJWT, PostController.getPosts);
router.post('/:id/like', authenticateJWT, PostController.likePost);
router.post('/:id/comment', authenticateJWT, PostController.commentPost);
router.put('/:id', authenticateJWT, PostController.updatePost);
router.delete('/:id', authenticateJWT, PostController.deletePost);
router.put('/comments/:commentId', authenticateJWT, PostController.updateComment);
router.delete('/comments/:commentId', authenticateJWT, PostController.deleteComment);

module.exports = router;