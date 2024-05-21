require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');
const connectDB = require('../db/connexion');

connectDB();

const checkAdmin = async () => {
  try {
    const admin = await User.findOne({ email: 'admin@example.com' });
    if (admin) {
      console.log('Admin user found:', admin);
    } else {
      console.log('Admin user not found');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error checking admin user:', error);
    process.exit(1);
  }
};

checkAdmin();