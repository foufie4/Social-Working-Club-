const Post = require('../models/post');

exports.createPost = async (req, res) => {
  const { content } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!content) {
    return res.status(400).json({ error: 'Le contenu de la publication est requis.' });
  }

  try {
    const newPost = new Post({
      user: req.user.id,
      content,
      image
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Server error' });
  }
}; 

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate('user', 'username');
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error); // Log pour débogage
    res.status(500).json({ error: 'Server error' });
  }
};