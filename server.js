require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const userRoutes = require('./userRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });

// Routes
app.use('/user', userRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/profil', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profil.html'));
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.post('/updateProfile', async (req, res) => {
  const { id, username, bio, profilePic } = req.body;
  if (!id || !username || !bio) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(id, { username, bio, profilePic }, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: "Profile updated successfully", data: updatedUser });
  } catch (error) {
    console.error('Database update failed:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

app.post('/api/users/update-settings', (req, res) => {
  const { username, bio } = req.body;
  if (!username || !bio) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  console.log('Updating settings for:', username);
  res.json({ success: true, message: 'Settings updated successfully' });
});

app.get('/test-bcrypt', (req, res) => {
  const bcrypt = require('bcrypt');
  const password = 'password';
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, function (err, hash) {
    console.log('Generated Hash:', hash);
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ error: 'Error hashing password' });
    }
    console.log('Hash:', hash);
    const passwordAttempt = 'thePasswordToTest';
    const storedHash = 'W4nk1l_Stud10'; // replace with your actual hash
    bcrypt.compare(passwordAttempt, storedHash, function (err, result) {
      if (result) {
        console.log('Password is correct!');
      } else {
        console.log('Password is incorrect.');
      }
    });
  });
});

// Gestion des 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});