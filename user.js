require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    verificationToken: { type: String, required: false },
    notificationsEnabled: { type: Boolean, default: false },
    bio: String
});
// Hash password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, saltRounds);
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;