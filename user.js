const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const saltRounds = 10;  // Cost factor for hashing

const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    notificationsEnabled: { type: Boolean, default: false }
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        const hash = await bcrypt.hash(this.password, saltRounds);
        this.password = hash;
        next();
    } catch (error) {
        return next(error);
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;