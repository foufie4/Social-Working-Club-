require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./db/connexion');
const { log } = require('mercedlogger');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const path = require('path');

const UserRouter = require('./routes/userRoutes');
const PostRouter = require('./routes/postRoutes');
const AdminRouter = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

const { PORT = 5000, JWT_SECRET } = process.env;

const app = express();

connectDB();

app.use(cors());
app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser());

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

app.use('/auth', authRoutes);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/user', UserRouter);
app.use('/posts', upload.single('image'), PostRouter);
app.use('/admin', AdminRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/user/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await user.findOne({ email });

    if (!user || !user.comparePassword(password)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    // Generate a token or handle successful login
    const token = generateToken(user); // Your token generation logic
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/user/profil', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await user.findById(decoded.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.get('/profil.html', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.sendFile(path.join(__dirname, 'public', 'profil.html'));
  });
});

app.get('/logout', (req, res) => {
  res.redirect('/login');
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => log.green('SERVER STATUS', `Listening on port ${PORT}`));