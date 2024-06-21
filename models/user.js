const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true, index: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: 'default-profile.png' },
  verified: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  console.log('Hashed password in pre-save:', this.password);
  next();
});

<<<<<<< HEAD
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
=======
userSchema.methods.comparePassword = async function(candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  console.log('Comparing', candidatePassword, 'with', this.password, ':', isMatch);
  return isMatch;
>>>>>>> refs/remotes/origin/uxstyle
};

userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);