const express = require('express');
const db = require('../database');

const router = express.Router();

router.get('/', (_req, res) => {
  const doctors = db.prepare(`
    SELECT u.id, u.name, u.email, u.gender,
           dp.specialization, dp.qualification, dp.experience_years,
           dp.registration_no, dp.consultation_fee, dp.clinic_name, dp.clinic_address
    FROM users u
    JOIN doctor_profiles dp ON u.id = dp.user_id
    WHERE u.role = 'doctor'
    ORDER BY dp.specialization, u.name
  `).all();
  res.json(doctors);
});

router.get('/:id', (req, res) => {
  const doctor = db.prepare(`
    SELECT u.id, u.name, u.email, u.gender,
           dp.specialization, dp.qualification, dp.experience_years,
           dp.registration_no, dp.consultation_fee, dp.clinic_name, dp.clinic_address
    FROM users u
    JOIN doctor_profiles dp ON u.id = dp.user_id
    WHERE u.id = ? AND u.role = 'doctor'
  `).get(req.params.id);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  res.json(doctor);
});

module.exports = router;
