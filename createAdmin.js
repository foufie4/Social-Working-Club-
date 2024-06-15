// require('dotenv').config();
// const mongoose = require('mongoose');
// const User = require('./models/user');

// const { MONGO_URI, ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

// const createAdminUser = async () => {
//   try {
//     await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
//     const existingAdmin = await User.findOne({ role: 'admin' });
//     if (!existingAdmin) {
//       const adminUser = new User({
//         username: ADMIN_USERNAME,
//         email: ADMIN_EMAIL,
//         password: ADMIN_PASSWORD,
//         role: 'admin'
//       });
//       await adminUser.save();
//       console.log('Admin user created successfully');
//     } else {
//       console.log('Admin user already exists');
//     }
//     mongoose.connection.close();
//   } catch (error) {
//     console.error('Error creating admin user:', error);
//     mongoose.connection.close();
//   }
// };

// createAdminUser();