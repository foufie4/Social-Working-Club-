const User = require('./user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const transporter = require('./emailConfig');

console.log("Before defining loginUser");
exports.loginUser = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email: email }).then(user => {
    if (!user) {
      return res.status(401).json({ message: 'No user found with that email' });
    }
    bcrypt.compare(password, user.password).then(isMatch => {
      if (!isMatch) {
        return res.status(401).json({ message: 'Password does not match' });
      }
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ message: "Login successful", token: token });
    });
  }).catch(error => {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  });
};
console.log("After defining loginUser", loginUser);
// Define signupUser function
exports.signupUser = async (req, res) => {
  const { fullname, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ fullname, email, password: hashedPassword });
  try {
      await newUser.save();
      res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Error registering user' });
  }
};
console.log('Defining functions:', loginUser, signupUser, login, register, profil, sendVerificationEmail);
console.log("signupUser type:", typeof signupUser);

// Define the loginUser function
function loginUser(req, res) {
  const { email, password } = req.body;
  // Assuming User is a Mongoose model you've already imported
  User.findOne({ email }).then(user => {
      if (!user) {
          return res.status(401).json({ message: 'No user found with that email' });
      }
      bcrypt.compare(password, user.password).then(isMatch => {
          if (!isMatch) {
              return res.status(401).json({ message: 'Password does not match' });
          }
          const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
          res.status(200).json({ message: "Login successful", token });
      });
  }).catch(error => {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
  });
}

function signupUser(req, res) {
  const { fullname, email, password } = req.body;
  try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = User.findOne({ email });
      if (existingUser) {
          return res.status(409).json({ message: 'Email already registered.' });
      }
      // Hasher le mot de passe
      const hashedPassword = bcrypt.hash(password, 10);
      // Créer un nouvel utilisateur
      const newUser = new User({
          fullname,
          email,
          password: hashedPassword
      });
      // Enregistrer l'utilisateur dans la base de données
      newUser.save();
      // Retourner une réponse de succès
      res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Error registering user' });
  }
}
function login(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
}
function register(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
};
function profil(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'profil.html'));
};

async function sendVerificationEmail(userEmail, verificationToken) {
  const verificationUrl = `http://${req.headers.host}/verify?token=${verificationToken}&email=${userEmail}`;
  const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Verify Your Account',
      html: `<p>Please verify your account by clicking the link: <a href="${verificationUrl}">Verify Account</a></p>`
  };
  try {
      await transporter.sendMail(mailOptions);
      console.log('Verification email sent.');
  } catch (error) {
      console.error('Failed to send verification email:', error);
  }
}

console.log("Defining functions:", loginUser, signupUser, login, register, profil, sendVerificationEmail);
module.exports = {
  loginUser,
  signupUser,
  login,
  register,
  profil,
  sendVerificationEmail
};