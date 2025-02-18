const express = require('express');
const { db } = require("../firebaseConfig");
const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
require('dotenv').config();

// const { JWT_SECRET } = process.env;
// const UserController = require('../controllers/userController');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    const userRef = db.collection("users").where("email", "==", email);
    const snapshot = await userRef.get();

    if (!snapshot.empty) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Enregistrer l'utilisateur dans Firestore
    const newUser = {
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };

    await db.collection("users").add(newUser);

    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
});

// Removed the duplicate router.post('/login') definition
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRef = db.collection("users").where("email", "==", email);
    const snapshot = await userRef.get();

    if (snapshot.empty) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    const user = snapshot.docs[0].data(); // Récupérer les données

    // Comparer le mot de passe (ajouter bcrypt si besoin)
    if (user.password !== password) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    res.status(200).json({ message: "Connexion réussie", user });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// router.post('/register', UserController.registerUser);
// router.post('/login', UserController.loginUser);

module.exports = router;