require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const path = require('path');
const passport = require('passport');
const bodyParser = require('body-parser');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./models/user');
const helmet = require('helmet');
const xss = require('xss-clean');

const UserRoutes = require('./routes/userRoutes');
const PostRoutes = require('./routes/postRoutes');
const AdminRoutes = require('./routes/adminRoutes');
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

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({secret: 'W1lly_W0nk4', resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(helmet());
app.use(xss());

app.use('/auth', authRoutes);
app.use('/user', UserRoutes);
app.use('/posts', PostRoutes);
app.use('/admin', AdminRoutes);

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

app.get('/index', function (req, res) {
  res.render('home');
});

// Updated /profil route to send static HTML file
app.get('/profil', isLoggedIn, function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'profil.html'));
});

app.get('/register', function (req, res) {
  res.render('register');
});

app.post('/register', async (req, res) => {
  try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      const user = new User({
          username: req.body.username,
          email: req.body.email,
          password: hashedPassword
      });
      await user.save();
      return res.status(200).json(user);
  } catch (error) {
      return res.status(500).json({ error: error.message });
  }
});

app.get('/login', function (req, res) {
  res.render('login');
});

app.post('/login', (req, res, next) => {
  console.log(`Attempting to login with email: ${req.body.email} and password: ${req.body.password}`);
  passport.authenticate('local', (err, user, info) => {
      if (err) {
          console.error('Authentication error:', err);
          return next(err);
      }
      if (!user) {
          console.log('Authentication failed:', info.message);
          return res.redirect('/login');
      }
      req.logIn(user, (err) => {
          if (err) {
              console.error('Login error:', err);
              return next(err);
          }
          return res.redirect('/profil');
      });
  })(req, res, next);
});

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},
async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('No user found with email:', email);
      return done(null, false, { message: 'Incorrect email.' });
    }
    const isMatch = await user.comparePassword(password);
    console.log('Comparing', password, 'with', user.password, ':', isMatch);
    if (!isMatch) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
      const user = await User.findById(id);
      done(null, user);
  } catch (err) {
      done(err, null);
  }
});

app.get('/logout', function (req, res) {
  req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

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

app.use((req, res, next) => {
  console.log(`Requête entrante : ${req.method} ${req.url}`);
  next();
});