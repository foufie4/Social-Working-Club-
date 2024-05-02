const User = require('./user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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