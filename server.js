require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const User = require('./user');
const Post = require('./post');
const Joi = require('joi');

const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const saltRounds = 10;

// Connect to MongoDB
mongoose.connect('mongodb+srv://shamalow423:Fl0ch1_R1ku@x-files.fujab62.mongodb.net/?retryWrites=true&w=majority&appName=X-files', { 
    useNewUrlParser: true,
    useUnifiedTopology: true
 }).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Middleware
app.use(cors());
app.use(bodyParser.json());
// Serveur des fichiers statiques du dossier 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Envoyer le fichier HTML à la racine
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Schéma Joi pour la validation d'inscription
const registrationSchema = Joi.object({
    fullname: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

// Configurer le transporteur NodeMailer
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    debug: true, // show debug output
    logger: true // log information in console
  });

      // Endpoint pour vérifier le compte
      app.get('/verify', async (req, res) => {
        const { token } = req.query;
        // Ici, vous devriez avoir une logique pour trouver l'utilisateur avec ce token et valider son compte
        try {
          const user = await User.findOne({ verificationToken: token });
          if (!user) {
            return res.status(400).send('Invalid token.');
          }
          
          user.verified = true;
          await user.save();
          
          res.send('Compte vérifié avec succès !');
        } catch (error) {
          console.error(error);
          res.status(500).send('Erreur lors de la vérification du compte.');
        }
      });

// Route d'inscription
app.post('/signup', async (req, res) => {
    try {
        const { fullname, email, password } = await registrationSchema.validateAsync(req.body);
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({ fullname, email, password: hashedPassword });
        await newUser.save();

        // Générer un token de vérification
        const verificationToken = uuidv4();

        // Envoyer l'e-mail de vérification
        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: newUser.email,
            subject: 'Vérification de votre compte',
            html: `<p>Cliquez sur le lien suivant pour vérifier votre compte:</p>
                   <a href="http://localhost:5000/verify?token=${verificationToken}">Vérifier mon compte</a>`
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
                res.status(500).json({ message: "Erreur lors de l'envoi de l'email." });
            } else {
                console.log('Email sent: ' + info.response);
                res.status(201).json({ message: 'Compte créé avec succès! Veuillez vérifier votre email.' });
            }
        });

        console.log('Utilisateur créé avec succès :', newUser);
        
    } catch (error) {
        console.error(error);
        if (error.isJoi === true) {
            res.status(400).json({ message: "Les données fournies ne sont pas valides." });
        } else {
            res.status(500).json({ message: "Erreur lors de la création de l'utilisateur." });
        }
    }
});

// Schéma Joi pour la validation de connexion
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  
  // Route de connexion
  app.post('/login', async (req, res) => {
    try {
      const { email, password } = await loginSchema.validateAsync(req.body);
  
      const user = await User.findOne({ email: email });
      if (user && await bcrypt.compare(password, user.password)) {
        res.json({ message: "Connexion réussie!" });
      } else {
        res.status(400).json({ message: "Email ou mot de passe incorrect." });
      }
    } catch (error) {
      if (error.isJoi === true) {
        res.status(400).json({ message: "Les données fournies ne sont pas valides." });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });

// Démarrez le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
