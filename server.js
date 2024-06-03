require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const path = require('path');

const UserRouter = require('./routes/userRoutes');
const PostRouter = require('./routes/postRoutes');
const AdminRouter = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const { MONGO_URI, PORT = 5000 } = process.env;

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

app.use(cors());
app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

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
app.use('/user', UserRouter);
app.use('/posts', upload.single('image'), PostRouter);
app.use('/admin', AdminRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});