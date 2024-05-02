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
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

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

const users = [{ email: "user@example.com", password: "password123" }]; // Example user list
const adminUsername = process.env.ADMIN_USERNAME;

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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});