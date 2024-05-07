require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const userRoutes = require('./userRoutes');
const jwt = require('jsonwebtoken');

const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const Joi = require('joi');
// Import models
const User = require('./user');
const Post = require('./post');

// Import routers
const PORT = process.env.PORT || 3000;
const saltRounds = 10;

// Multer for handling file uploads
const multer = require('multer');
const app = express();
const upload = multer();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('hex');
console.log(secret);  // This will print a random 64 characters hex string

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' }
}));

// MongoDB Connection
mongoose.connect('mongodb+srv://foufie:Sh4mel3ss@socialworkingclub.vonvql2.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

function redirectIfAuthenticated(req, res, next) {
  if (req.session.userId) {
      return res.redirect('/profil'); // Chemin vers la page de profil
  }
  next();
}

app.get('/login', redirectIfAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', redirectIfAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

function ensureAuthenticated(req, res, next) {
  if (!req.session.userId) {
      return res.redirect('/login'); // Redirige vers la page de connexion si non connecté
  }
  next();
}

app.get('/profil', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profil.html'));
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
      res.redirect('/login'); // Redirige vers la page de connexion après la déconnexion
  });
});

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
  }
});

app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(409).json({ success: false, message: "Email already registered." });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
          username,
          email,
          password: hashedPassword,
          verified: false,
          verificationToken: uuidv4()
      });

      await newUser.save();

      const verificationUrl = `http://${req.headers.host}/verify?token=${newUser.verificationToken}&email=${email}`;
      const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Verify Your Account',
          html: `<p>Please verify your account by clicking the link: <a href="${verificationUrl}">Verify Account</a></p>`
      };

      await transporter.sendMail(mailOptions);

      res.status(201).json({ success: true, message: "User registered successfully. Please check your email for verification." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

transporter.verify(function(error, success) {
  if (error) {
      console.error("Email transporter configuration is incorrect:", error);
  } else {
      console.log("Server is ready to take our messages");
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

app.get('/verify', async (req, res) => {
  const { token, email } = req.query;
  try {
    const user = await User.findOne({ email, verificationToken: token });
    if (!user) {
        return res.status(400).send('Invalid verification link or user already verified');
    }

    user.verified = true;
    user.verificationToken = undefined; // Clear the token after verification
    await user.save();

    const userToken = generateToken(user._id);
    res.cookie('authToken', userToken);

    res.redirect('/profil.html'); // Redirect to the profile page
  } catch (error) {
    res.status(500).send({ message: "Internal server error during verification" });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Incorrect email or password' });
      }

        // Generate a token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Start a session
        req.session.userId = user._id;

        res.json({ success: true, message: 'Logged in successfully', token: token });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const newUser = new User({ username, email, password: hashedPassword });
  await newUser.save();
  req.session.userId = newUser._id;
  res.redirect('/profil');
});

require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;

app.post('/api/users/update-settings', (req, res) => {
  const { username, bio, notificationsEnabled } = req.body;

  if (!username || !bio) {
      return res.status(400).json({ error: 'Missing required fields' });
  }

  console.log('Updating settings for:', username);
  // Simulez la mise à jour dans votre base de données ici

  res.json({ success: true, message: 'Settings updated successfully' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});