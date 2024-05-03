require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const userRoutes = require('./userRoutes');

const path = require('path');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');

// Import models
const User = require('./user');
const Post = require('./post');

// Import routers
const app = express();
const PORT = process.env.PORT || 3000;
const saltRounds = 10;

// Multer for handling file uploads
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/socialTravailClub', {  // Update your connection string as needed
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
  }
});

transporter.verify(function(error, success) {
  if (error) {
      console.error("Email transporter configuration is incorrect:", error);
  } else {
      console.log("Email transporter is ready to send messages.");
  }
});

// Routes
app.use('/user', userRoutes);

app.set('view engine', 'ejs');

// Root endpoint
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/profile', (req, res) => {
  res.render('profile', { adminUsername: process.env.ADMIN_USERNAME });
});

app.get('/config', (req, res) => {
  res.json({ adminUsername: process.env.ADMIN_USERNAME });
});
const users = [
  { username: "johndoe", email: "john@example.com", bio: "Developer.", notificationsEnabled: true },
  { username: "janedoe", email: "jane@example.com", bio: "Designer.", notificationsEnabled: false }
];

User.insertMany(users)
  .then(() => console.log("Users added successfully"))
  .catch(err => console.error("Error adding users:", err));
  
const adminUsername = process.env.ADMIN_USERNAME;

app.post('/updateProfile', async (req, res) => {
  const { id, username, bio, profilePic } = req.body;

  if (!id || !username || !bio) {
      return res.status(400).send('Missing required fields');
  }

  try {
      const updatedUser = await User.findByIdAndUpdate(id, {
          username, bio, profilePic
      }, { new: true }); // `new: true` returns the updated document

      if (!updatedUser) {
          return res.status(404).send('User not found');
      }

      res.send({ message: "Profile updated successfully", data: updatedUser });
  } catch (error) {
      console.error('Database update failed:', error);
      res.status(500).send('Failed to update user profile');
  }
});

function authenticate(email, password) {
  return new Promise((resolve, reject) => {
    const user = users.find(user => user.email === email && user.password === password);
    if (user) {
      resolve(user); // Authentication successful
    } else {
      reject(new Error("Authentication failed")); // Authentication failed
    }
  });
}

// Verification endpoint
app.get('/verify', async (req, res) => {
  const { token } = req.query; // Extract the token from query string
  if (!token) {
      return res.status(400).json({ message: "No token provided" });
  }

  try {
      const user = await User.findOne({ verificationToken: token });
      if (!user) {
          return res.status(404).json({ message: "User not found or already verified" });
      }

      user.verified = true;
      await user.save();

      // Redirect to a success page or send a success response
      res.redirect('/verification-success.html'); // Assuming you have a success page
  } catch (error) {
      console.error('Verification error:', error);
      res.status(500).json({ message: "Error verifying user." });
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ message: 'No user found with that email' });
      }
      return bcrypt.compare(password, user.password).then(isMatch => {
        if (!isMatch) {
          return res.status(401).json({ message: 'Password does not match' });
        }
        // Assuming token generation and other operations here
        res.cookie('fullname', user.fullname, { maxAge: 900000, httpOnly: true });
        res.status(200).json({ message: "Login successful", user });
      });
    })
    .catch(error => {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    });
});

app.post('/signup', async (req, res) => {
  try {
      const { fullname, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const newUser = new User({
          fullname,
          email,
          password: hashedPassword,
          verificationToken: uuidv4(), // Ensure this generates a token
          verified: false
      });

      console.log('New User:', newUser); // Log the new user object

      await newUser.save();

      let mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Verify Your Account',
          html: `<p>Click the following link to verify your account:</p><a href="http://localhost:${PORT}/verify?token=${newUser.verificationToken}">Verify My Account</a>`
      };

      console.log('Verification Email Link:', mailOptions.html); // Log the final email link

      transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
              console.log(error);
              res.status(500).json({ message: "Error sending email." });
          } else {
              console.log('Email sent: ' + info.response);
              res.status(201).json({ message: 'Account created successfully! Please check your email.' });
          }
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creating user." });
  }
});

require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;

app.get('/some-route', (req, res) => {
  res.render('profile.html', { adminUsername: process.env.ADMIN_USERNAME });
});

// API endpoint to update user settings
app.post('/api/users/update-settings', async (req, res) => {
  const { userId, notificationsEnabled } = req.body;

  if (!userId) {
      return res.status(400).send('User ID is required');
  }
  if (typeof notificationsEnabled !== 'boolean') {
      return res.status(400).send('Invalid notifications setting');
  }

  try {
      const updatedUser = await User.findByIdAndUpdate(userId, {
          notificationsEnabled
      }, { new: true });  // 'new: true' to return the updated document

      if (!updatedUser) {
          return res.status(404).send('User not found');
      }

      res.json({
          message: "Settings updated successfully",
          user: {
              id: updatedUser._id,
              username: updatedUser.username,
              notificationsEnabled: updatedUser.notificationsEnabled
          }
      });
  } catch (error) {
      console.error('Database update failed:', error);
      res.status(500).send('Error updating user settings');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});