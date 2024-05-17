const express = require('express');
const router = express.Router();
const PostController = require('../controllers/postController');
const authenticateJWT = require('../middleware/authJWT');

router.post('/create', authenticateJWT, PostController.createPost);
router.get('/', PostController.getPosts);

module.exports = router;