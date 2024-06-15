const User = require('../models/user');

const checkAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user && user.role === 'admin') {
      req.isAdmin = true;
      console.log('Admin user:', user);
      next();
    } else {
      req.isAdmin = false;
      console.log('Non-admin user:', user); 
    }
  } catch (error) {
    console.log('Server error in checkAdmin:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = checkAdmin;