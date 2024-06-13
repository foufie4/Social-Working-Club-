require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const path = require('path');
const helmet = require('helmet');
const xss = require('xss-clean');
const User = require('./models/user'); // Assurez-vous que le modèle User est importé correctement

const UserRouter = require('./routes/userRoutes');
const PostRouter = require('./routes/postRoutes');
const AdminRouter = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const { MONGO_URI, PORT = 5000, ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  socketTimeoutMS: 30000, // Increase socket timeout to 30 seconds
})
  .then(() => {
    console.log('Connected to MongoDB');
    createAdminUser();
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));

app.use(cors());
app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use(helmet());
app.use(xss());

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

const createAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      const adminUser = new User({
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin'
      });
      await adminUser.save();
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};