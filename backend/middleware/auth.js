const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const requireDoctor = (req, res, next) => {
  if (req.user?.role !== 'doctor') return res.status(403).json({ error: 'Doctor access required' });
  next();
};

const requirePatient = (req, res, next) => {
  if (req.user?.role !== 'patient') return res.status(403).json({ error: 'Patient access required' });
  next();
};

module.exports = { authenticate, requireDoctor, requirePatient };
