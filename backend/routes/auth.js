const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../database');
const { JWT_SECRET } = require('../config');

const router = express.Router();

router.post('/register', (req, res) => {
  const { name, email, password, phone, age, gender } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required' });

  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email))
    return res.status(400).json({ error: 'Email already registered' });

  const hashed = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    `INSERT INTO users (name, email, password, role, phone, age, gender) VALUES (?, ?, ?, 'patient', ?, ?, ?)`
  ).run(name, email, hashed, phone || null, age || null, gender || null);

  const token = jwt.sign({ id: result.lastInsertRowid, role: 'patient' }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: result.lastInsertRowid, name, email, role: 'patient', phone, age, gender } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid email or password' });

  let profile = null;
  if (user.role === 'doctor')
    profile = db.prepare('SELECT * FROM doctor_profiles WHERE user_id = ?').get(user.id);

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role,
            phone: user.phone, age: user.age, gender: user.gender, profile }
  });
});

module.exports = router;
