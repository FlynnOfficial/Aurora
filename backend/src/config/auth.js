const jwt = require('jsonwebtoken');
require('dotenv').config();

const authConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
};

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    authConfig.secret,
    { expiresIn: authConfig.expiresIn }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, authConfig.secret);
};

module.exports = {
  authConfig,
  generateToken,
  verifyToken,
};