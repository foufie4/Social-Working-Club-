const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

exports.registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token, username: user.username });
  } catch (error) {
    console.error('Server error during login:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateUserProfile = async (req, res) => {
  console.log('Contrôleur appelé');
  console.log('Body :', req.body);
  console.log('File :', req.file);

  try {
    const { profileName, profileBio } = req.body;
    const profileImage = req.file ? req.file.filename : null;
    //récup l'user depuis la bdd
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé'});
    }

    //mettre à jour les infos
    if (profileName) user.username = profileName;
    if (profileBio) user.bio = profileBio;
    if (profileImage) user.profileImage = profileImage; //nom du fichier uploadé

    await user.save(); //save dans la bdd

    return res.json({
      profileName: user.username,
      profileBio: user.bio,
      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return res.status(500). json({ error: 'Erreur interne du serveur'});
  }
};

console.log('updateUserProfile appelé avec :', req.body, req.file);

exports.adminDashboard = (req, res) => {
  res.send('Admin Dashboard');
};