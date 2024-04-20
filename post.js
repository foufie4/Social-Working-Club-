const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    username: String,
    content: String,
    image: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', PostSchema);