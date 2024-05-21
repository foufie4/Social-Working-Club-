const User = require('../models/user');

const checkAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user && user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = checkAdmin;