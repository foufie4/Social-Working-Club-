const express = require('express');
const router = express.Router();
const PostController = require('../controllers/postController');
const authenticateJWT = require('../middleware/authJWT');

router.post('/create', authenticateJWT, PostController.createPost);
router.get('/', PostController.getPosts);
router.post('/:id/like', authenticateJWT, PostController.likePost);
router.post('/:id/comment', authenticateJWT, PostController.commentPost);
router.put('/:id', authenticateJWT, PostController.updatePost); 
router.delete('/:id', authenticateJWT, PostController.deletePost); 

module.exports = router;