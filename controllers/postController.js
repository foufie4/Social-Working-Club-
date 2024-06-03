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
    await newPost.populate('user', 'username').execPopulate();
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate('user', 'username').populate('comments.user', 'username');
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.likes.includes(req.user.id)) {
      post.likes.pull(req.user.id);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.commentPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = {
      user: req.user.id,
      content: req.body.content
    };

    post.comments.push(comment);
    await post.save();
    await post.populate('comments.user', 'username');
    res.status(200).json(post);
  } catch (error) {
    console.error('Error commenting on post:', error);
    res.status(500).json({ error: 'Server error' });
  }
};