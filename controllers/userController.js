const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const user = new User({ username, email, password });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log(`Attempting to login with email: ${email} and password: ${password}`);

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User not found: ${email}`);
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        console.log(`User found: ${user.email}`);

        const isValidPassword = await user.comparePassword(password);
        console.log(`Is valid password: ${isValidPassword}`);

        if (!isValidPassword) {
            console.log(`Invalid password for user: ${email}`);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        console.log('Login successful');
        res.status(200).json({ message: 'Login successful', token, username: user.username });
    } catch (error) {
        console.error('Server error during login:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateUserProfile = async (req, res) => {
    const { username } = req.body;
    const profileImage = req.file ? req.file.filename : null;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (username) user.username = username;
        if (profileImage) user.profileImage = profileImage;

        await user.save();
        res.status(200).json(user);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
};