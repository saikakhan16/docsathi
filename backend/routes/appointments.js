const express = require('express');
const db = require('../database');
const { authenticate, requirePatient, requireDoctor } = require('../middleware/auth');

const router = express.Router();

// Patient books their own appointment
router.post('/', authenticate, requirePatient, (req, res) => {
  const { doctor_id, appointment_date, appointment_time, chief_complaint } = req.body;
  if (!doctor_id || !appointment_date || !appointment_time)
    return res.status(400).json({ error: 'Doctor, date and time are required' });

  const clash = db.prepare(`
    SELECT id FROM appointments
    WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled'
  `).get(doctor_id, appointment_date, appointment_time);
  if (clash) return res.status(400).json({ error: 'This time slot is already booked' });

  const result = db.prepare(`
    INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, chief_complaint)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.user.id, doctor_id, appointment_date, appointment_time, chief_complaint || null);

  res.json({ id: result.lastInsertRowid, message: 'Appointment booked successfully' });
});

// Doctor creates appointment for a patient
router.post('/by-doctor', authenticate, requireDoctor, (req, res) => {
  const { patient_id, appointment_date, appointment_time, chief_complaint } = req.body;
  if (!patient_id || !appointment_date || !appointment_time)
    return res.status(400).json({ error: 'Patient, date and time are required' });

  const patient = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'patient'").get(patient_id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const clash = db.prepare(`
    SELECT id FROM appointments
    WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled'
  `).get(req.user.id, appointment_date, appointment_time);
  if (clash) return res.status(400).json({ error: 'This time slot is already booked' });

  const result = db.prepare(`
    INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, chief_complaint)
    VALUES (?, ?, ?, ?, ?)
  `).run(patient_id, req.user.id, appointment_date, appointment_time, chief_complaint || null);

  res.json({ id: result.lastInsertRowid, message: 'Appointment scheduled successfully' });
});

router.get('/my', authenticate, (req, res) => {
  let rows;
  if (req.user.role === 'patient') {
    rows = db.prepare(`
      SELECT a.*, u.name AS doctor_name, dp.specialization, dp.clinic_name,
             p.id AS prescription_id
      FROM appointments a
      JOIN users u ON a.doctor_id = u.id
      JOIN doctor_profiles dp ON u.id = dp.user_id
      LEFT JOIN prescriptions p ON a.id = p.appointment_id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time ASC
    `).all(req.user.id);
  } else {
    rows = db.prepare(`
      SELECT a.*, u.name AS patient_name, u.age AS patient_age, u.gender AS patient_gender, u.phone AS patient_phone,
             p.id AS prescription_id
      FROM appointments a
      JOIN users u ON a.patient_id = u.id
      LEFT JOIN prescriptions p ON a.id = p.appointment_id
      WHERE a.doctor_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time ASC
    `).all(req.user.id);
  }
  res.json(rows);
});

router.get('/booked-slots', (req, res) => {
  const { doctor_id, date } = req.query;
  if (!doctor_id || !date) return res.status(400).json({ error: 'doctor_id and date required' });
  const slots = db.prepare(`
    SELECT appointment_time FROM appointments
    WHERE doctor_id = ? AND appointment_date = ? AND status != 'cancelled'
  `).all(doctor_id, date);
  res.json(slots.map(s => s.appointment_time));
});

router.patch('/:id/cancel', authenticate, (req, res) => {
  const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!appt) return res.status(404).json({ error: 'Not found' });
  if (appt.patient_id !== req.user.id && appt.doctor_id !== req.user.id)
    return res.status(403).json({ error: 'Forbidden' });
  db.prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ?").run(req.params.id);
  res.json({ message: 'Appointment cancelled' });
});

module.exports = router;
