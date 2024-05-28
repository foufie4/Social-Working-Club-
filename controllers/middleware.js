require('dotenv').config();
const jwt = require('jsonwebtoken');
const user = require('../models/User');

// CREATE CONTEXT MIDDLEWARE
const createContext = (req, res, next) => {
  req.context = {
    models: {
      user,
    },
  };
  next();
};

// MIDDLEWARE FOR AUTHORIZATION (MAKING SURE THEY ARE LOGGED IN)
const isLoggedIn = async (req, res, next) => {
  try {
    // check if auth header exists
    if (req.headers.authorization) {
      // parse token from header
      const token = req.headers.authorization.split(' ')[1];
      if (token) {
        const payload = await jwt.verify(token, process.env.SECRET);
        if (payload) {
          // store user data in request object
          req.user = payload;
          next();
        } else {
          res.status(400).json({ error: 'Token verification failed' });
        }
      } else {
        res.status(400).json({ error: 'Malformed auth header' });
      }
    } else {
      res.status(400).json({ error: 'No authorization header' });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
};

module.exports = {
  isLoggedIn,
  createContext,
};