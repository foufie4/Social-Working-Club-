const bcrypt = require("bcrypt");
const { db } = require('../firebaseConfig');
// const jwt = require('jsonwebtoken');
// const { JWT_SECRET } = process.env;

// Création d'un utilisateur dans Firestore
exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userRef = db.collection('users').doc(email);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      return res.status(409).json({ message: 'User already exists' });
    }

    await userRef.set({
      username,
      email,
      password, // Pense à gérer le hash du mot de passe côté frontend
      createdAt: new Date()
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};

// Récupération des utilisateurs
exports.getUsers = async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => doc.data());
    res.status(200).json(users);
  } catch (error) {
    console.error('Erreur récupération users:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userRef = db.collection('users').doc(email);

    await userRef.set({ username, email, password });
    res.status(201).json({ message: 'Utilisateur créé' });
  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRef = db.collection("users").where("email", "==", email);
    const snapshot = await userRef.get();

    if (snapshot.empty) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    const user = snapshot.docs[0].data(); // Récupérer les données Firestore

    // Comparer le mot de passe hashé
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    res.status(200).json({ message: "Connexion réussie", user });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

exports.updateUserProfile = async (req, res) => {
  console.log("updateUserProfile appelé avec :", req.body, req.file);

  try {
    const { profileName, profileBio } = req.body;
    const profileImage = req.file ? req.file.filename : null;
    const userId = req.user.id;

    // Récupérer l'utilisateur depuis Firestore
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    let updateData = {};

    if (profileName) updateData.username = profileName;
    if (profileBio) updateData.bio = profileBio;
    if (profileImage) updateData.profileImage = profileImage; // Nom du fichier uploadé

    // Mettre à jour l'utilisateur dans Firestore
    await userRef.update(updateData);

    return res.json({
      profileName: profileName || userDoc.data().username,
      profileBio: profileBio || userDoc.data().bio,
      profileImage: profileImage || userDoc.data().profileImage,
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

exports.adminDashboard = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un administrateur
    const userRef = db.collection("users").doc(req.user.id);
    const userDoc = await userRef.get();

    if (!userDoc.exists || userDoc.data().role !== "admin") {
      return res.status(403).json({ error: "Accès refusé. Administrateurs uniquement." });
    }

    res.send("Admin Dashboard");
  } catch (error) {
    console.error("Erreur dans l'admin dashboard:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};