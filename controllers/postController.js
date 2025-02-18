const he = require('he');
const Post = require('../models/post');
// Importation de Firestore
const admin = require('firebase-admin');
const db = admin.firestore();

// Création d'un post
exports.createPost = async (req, res) => {
  const { userId, content } = req.body;
  try {
    const postRef = db.collection('posts').doc();
    await postRef.set({
      userId,
      content,
      createdAt: new Date()
    });
    res.status(201).json({ message: 'Post created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error });
  }
};

// Récupération des posts
exports.getPosts = async (req, res) => {
  try {
    const postsSnapshot = await db.collection('posts').orderBy('createdAt', 'desc').get();
    const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error });
  }
};

exports.likePost = async (req, res) => {
  try {
    const postRef = db.collection("posts").doc(req.params.id);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: "Post not found" });
    }

    const post = postDoc.data();
    const likes = post.likes || [];

    if (likes.includes(req.user.id)) {
      postRef.update({ likes: likes.filter(id => id !== req.user.id) });
    } else {
      postRef.update({ likes: [...likes, req.user.id] });
    }

    res.status(200).json({ message: "Like updated successfully" });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.commentPost = async (req, res) => {
  try {
    const postRef = db.collection("posts").doc(req.params.id);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: "Post not found" });
    }

    const newComment = {
      userId: req.user.id,
      postId: req.params.id,
      content: req.body.content,
      createdAt: new Date()
    };

    await db.collection("comments").add(newComment);
    res.status(200).json({ message: "Comment added successfully" });
  } catch (error) {
    console.error("Error commenting on post:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updatePost = async (req, res) => {
  const { content } = req.body;

  try {
    const postRef = db.collection("posts").doc(req.params.id);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: "Post not found" });
    }

    const post = postDoc.data();

    if (post.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await postRef.update({ content });
    res.status(200).json({ message: "Post updated successfully" });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const commentRef = db.collection("comments").doc(req.params.commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const comment = commentDoc.data();

    if (comment.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await commentRef.delete();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};

exports.updateComment = async (req, res) => {
  const { content } = req.body;

  try {
    const post = await Post.findOne({ 'comments._id': req.params.commentId });
    if (!post) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    comment.content = he.encode(content);
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    await postRef.delete();
    res.status(200).json({ message: 'Post supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression post:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};