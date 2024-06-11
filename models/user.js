const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: 'default-profile.png' },
  verified: { type: Boolean, default: false },
  role: { type: String, default: 'user' }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  console.log('Hashed password in pre-save:', this.password);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  console.log('Comparing', candidatePassword, 'with', this.password, ':', isMatch);
  return isMatch;
};

const User = mongoose.model('User', userSchema);

module.exports = User;