require('dotenv').config();
console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Pass:', process.env.EMAIL_PASS);

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

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Connect to MongoDB
mongoose.connect('mongodb+srv://shamalow423:Fl0ch1_R1ku@x-files.fujab62.mongodb.net/?retryWrites=true&w=majority&appName=X-files', { 
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// Middleware
app.use(cors());
app.use(bodyParser.json());
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
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS  // Your generated App Password
  }
});

transporter.verify(function(error, success) {
if (error) {
  console.error("Email transporter configuration is incorrect:", error);
} else {
  console.log("Email transporter is ready to send messages.");
}
});

// Endpoint to verify the account
app.get('/verify', async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).send('Invalid token.');
    }
    user.verified = true;
    await user.save();

    res.redirect(`profil.html`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error during account verification.');
  }
});

// Registration route
app.post('/signup', async (req, res) => {
  try {
    const { fullname, email, password } = await registrationSchema.validateAsync(req.body);

    const verificationToken = uuidv4(); // generate the token first
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // create the user with the token
    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
      verificationToken, // include this line to save the token
      verified: false
    });

    await newUser.save(); // then save the user

    // now send the email
    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: newUser.email,
        subject: 'Verify Your Account',
        html: `<p>Click the following link to verify your account:</p>
               <a href="http://localhost:5000/verify?token=${verificationToken}">Verify My Account</a>`
    };

    transporter.sendMail(mailOptions, function(error, info){
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

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

app.post('/updateProfile', upload.single('profileImage'), async (req, res) => {
  try {
    // Check if the user is authenticated first
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "You must be logged in to do that." });
    }
    const userId = req.session.userId;

    // Get the bio and username from the body, and the image file path from multer's req.file
    const { username, bio } = req.body;
    const profileImagePath = req.file ? req.file.path : null;

    const updateData = {
      ...(username && { username }),
      ...(bio && { bio }),
      ...(profileImagePath && { profileImage: profileImagePath })
    };

    await User.findByIdAndUpdate(userId, updateData);
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: "Error updating profile." });
  }
});

  
// Login route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = await loginSchema.validateAsync(req.body);
    const user = await User.findOne({ email: email });
    if (user && await bcrypt.compare(password, user.password)) {
      res.json({ message: "Successfully logged in!" });
    } else {
      res.status(400).json({ message: "Incorrect email or password." });
    }
  } catch (error) {
    if (error.isJoi === true) {
      res.status(400).json({ message: "Provided data is not valid." });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});