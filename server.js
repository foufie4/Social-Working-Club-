//charger les variables d'environnement => .env
require('dotenv').config();
//import les bibliothèques nécessaires
const express = require('express');
const { loginUser, signupUser, login, register, profil, sendVerificationEmail } = require('./userController');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const userRoutes = require('./userRoutes');
const jwt = require('jsonwebtoken');
//config de bcrypt pour le hashage des mdp
const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid'); //générateur d'UUID pour les tokens de vérif
const Joi = require('joi'); //bibliothèque de validation
//import des modèles MongoDB pour les users et les posts
const User = require('./user');
const Post = require('./post');
//def du port du serv à partir des variables d'environnement ou par défaut à 5000
const PORT = process.env.PORT || 5000;
const saltRounds = 10; //nombre de tours de salage pour bcrypt
//initialisation de multer pour la gestion des downloads de fichiers
const multer = require('multer');
const app = express();
const upload = multer();
//config des middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); //servir les fichiers statiques depuis le dossier "public"
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
//génération d'une clé secrète aléatoire pour la session
const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('hex');
console.log(secret); //affiche une chaîne hexadécimale aléatoire de 64 caractères
//lecture du fichier .env pour vérif
const fs = require('fs');
fs.readFile('.env', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading .env file:', err);
    return;
  }
  console.log('.env content:', data);
});
//config de la session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' } //sécuriser les cookies selon le protocole (http ou https)
}));
// MongoDB connection with Mongoose
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
//vérif que l'URL de MongoDB est défini
console.log('MongoDB URI:', process.env.MONGODB_URI);
if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined');
    process.exit(1);
}
//recherche d'un user spécifique + gestion de connexion/déconnexion de MongoDB
User.findOne({ email })
.then(user => {
    if (!user) throw new Error('No user found');
    return bcrypt.compare(password, user.password);
})
.then(isMatch => {
    if (!isMatch) throw new Error('Password does not match');
    // logique pour une connexion réussie
})
.catch(error => {
    console.error('Authentication failed:', error);
    res.status(401).send('Authentication failed');
});
//route pour la déconnexion
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
      res.redirect('/login'); // Redirige vers la page de connexion après la déconnexion
  });
});
app.post('/login', loginUser);
console.log('UserController loaded', loginUser);
app.post('/register', signupUser);
app.get('/login', login);
app.get('/register', register);
app.get('/profil', profil);
//création d'un user with hashage du mot de passe et envoi d'un e-mail de vérif
async function hashPassword(password) {
    try {
        return await bcrypt.hash(password, saltRounds);
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error; // Renvoyer l'erreur pour une gestion plus haute dans la pile d'appels
    }
}
async function createUser(req, res) {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await hashPassword(password);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).send('User created successfully');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Failed to create user');
    }
}
async function verifyUser(req, res) {
  try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).exec();
      if (!user) {
          return res.status(404).send('User not found');
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(401).send('Incorrect password');
      }
      res.send('User authenticated successfully');
  } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).send('Authentication failed');
  }
}
//route pour l'inscription d'un user
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(409).send('Email already registered.');
      }
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
      const newUser = new User({
          username: req.body.username,
          email: req.body.email,
          password: hashedPassword,
          verified: false,
          verificationToken: uuidv4()
      });
      await newUser.save();
      res.send('User successfully registered.');
  } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).send('Failed to register user.');
  }
});
//def des routes users
app.use('/user', userRoutes);
//config du moteur de rendu de vue
app.set('view engine', 'ejs');
//route principales pour la page d'acceuil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
//route pour la page de profil + rendu de la vue
app.get('/profil', (req, res) => {
  res.render('profil', { adminUsername: process.env.ADMIN_USERNAME });
});
//insertion d'users prédéfinis dans MongoDB
const users = [
  { username: "johndoe", email: "john@example.com", bio: "Developer.", notificationsEnabled: true },
  { username: "janedoe", email: "jane@example.com", bio: "Designer.", notificationsEnabled: false }
];

User.insertMany(users)
  .then(() => console.log("Users added successfully"))
  .catch(err => console.error("Error adding users:", err));
//route pour mettre à jour le profil de l'user
app.post('/updateProfile', async (req, res) => {
  const { id, username, bio, profilePic } = req.body;
  if (!id || !username || !bio) {
      return res.status(400).send('Missing required fields');
  }
  try {
      const updatedUser = await User.findByIdAndUpdate(id, {
          username, bio, profilePic
      }, { new: true });
      if (!updatedUser) {
          return res.status(404).send('User not found');
      }
      res.send({ message: "Profile updated successfully", data: updatedUser });
  } catch (error) {
      console.error('Database update failed:', error);
      res.status(500).send('Failed to update user profile');
  }
});
//fonction pour authentifier l'user
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
//route pour vérifier l'authenticité du token de l'user
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

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Both email and password are required");
  }
  User.findOne({ email: email })
      .then(user => {
          if (!user) {
              return res.status(404).send('No user found');
          }
          bcrypt.compare(password, user.password)
          .then(isMatch => {
              if (!isMatch) {
                  return res.status(401).send('Invalid credentials');
              }
              const token = jwt.sign(
                { userId: user._id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
              );
              res.json({
                message: 'Login successful',
                token: token,
                user: {
                  id: user._id,
                  name: user.name,
                  email: user.email
                }
              });
          })
          .catch(err => {
              console.error('Error comparing password:', err);
              res.status(500).send('Internal Server Error');
          });
      })
      .catch(err => {
          console.error('Error finding user:', err);
          res.status(500).send('Internal Server Error');
      });
});

app.post('/update-user', (req, res) => {
  const { email, newName, newBio } = req.body;

  User.findOneAndUpdate({ email }, { $set: { name: newName, bio: newBio }}, { new: true })
  .then(updatedUser => {
      if (!updatedUser) {
          return res.status(404).send('User not found');
      }
      res.send({ message: "User updated successfully", updatedUser });
  })
  .catch(error => {
      console.error('Error updating user:', error);
      res.status(500).send('Internal Server Error');
  });
});

app.delete('/delete-user', (req, res) => {
  const { email } = req.body;

  User.findOneAndDelete({ email })
  .then(result => {
      if (!result) {
          return res.status(404).send('No user found');
      }
      res.send({ message: "User deleted successfully" });
  })
  .catch(error => {
      console.error('Error deleting user:', error);
      res.status(500).send('Internal Server Error');
  });
});
app.get('/user-details', (req, res) => {
  const { email } = req.query;

  User.findOne({ email }, '-password') // Exclude password from the results
  .then(user => {
      if (!user) {
          return res.status(404).send('User not found');
      }
      res.send(user);
  })
  .catch(error => {
      console.error('Error fetching user:', error);
      res.status(500).send('Internal Server Error');
  });
});
//route pour mettre à jour les paramètres d'user
app.post('/api/users/update-settings', (req, res) => {
  const { username, bio, notificationsEnabled } = req.body;
  if (!username || !bio) {
      return res.status(400).json({ error: 'Missing required fields' });
  }
  console.log('Updating settings for:', username);
  // Simulez la mise à jour dans votre base de données ici
  res.json({ success: true, message: 'Settings updated successfully' });
});
//route pour tester bcrypt
app.get('/test-bcrypt', (req, res) => {
  const password = 'password';
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, function(err, hash) {
  console.log('Generated Hash:', hash);
    if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).send('Error hashing password');
    }
    console.log('Hash:', hash);
    const passwordAttempt = 'thePasswordToTest';
    const storedHash = 'W4nk1l_Stud10'; // replace with your actual hash
  bcrypt.compare(passwordAttempt, storedHash, function(err, result) {
    if (result) {
      console.log('Password is correct!');
    } else {
      console.log('Password is incorrect.');
    }
  });
});
});