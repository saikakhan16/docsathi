const express = require('express');
const db = require('../database');
const { authenticate, requireDoctor } = require('../middleware/auth');

const router = express.Router();

// All unique patients for the logged-in doctor
router.get('/my', authenticate, requireDoctor, (req, res) => {
  const patients = db.prepare(`
    SELECT
      u.id, u.name, u.email, u.phone, u.age, u.gender,
      COUNT(a.id)                                                   AS total_appointments,
      MAX(a.appointment_date)                                       AS last_visit,
      SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END)      AS completed_count,
      SUM(CASE WHEN a.status = 'confirmed' THEN 1 ELSE 0 END)      AS upcoming_count,
      (
        SELECT p.id FROM prescriptions p
        JOIN appointments ap ON p.appointment_id = ap.id
        WHERE ap.patient_id = u.id AND ap.doctor_id = ?
        ORDER BY p.created_at DESC LIMIT 1
      ) AS latest_prescription_id,
      (
        SELECT ap2.id FROM appointments ap2
        WHERE ap2.patient_id = u.id AND ap2.doctor_id = ?
        ORDER BY ap2.appointment_date DESC, ap2.appointment_time DESC LIMIT 1
      ) AS latest_appointment_id
    FROM appointments a
    JOIN users u ON a.patient_id = u.id
    WHERE a.doctor_id = ?
    GROUP BY u.id
    ORDER BY last_visit DESC, u.name ASC
  `).all(req.user.id, req.user.id, req.user.id);

  res.json(patients);
});

// Full appointment history for one patient (under this doctor)
router.get('/:patientId/appointments', authenticate, requireDoctor, (req, res) => {
  const rows = db.prepare(`
    SELECT a.*, p.id AS prescription_id
    FROM appointments a
    LEFT JOIN prescriptions p ON a.id = p.appointment_id
    WHERE a.patient_id = ? AND a.doctor_id = ?
    ORDER BY a.appointment_date DESC, a.appointment_time ASC
  `).all(req.params.patientId, req.user.id);

  res.json(rows);
});

// Full visit history with prescription details for one patient
router.get('/:patientId/full-history', authenticate, requireDoctor, (req, res) => {
  const excludeAppt = req.query.exclude_appointment || 0;

  const appointments = db.prepare(`
    SELECT a.id, a.appointment_date, a.appointment_time, a.chief_complaint, a.status,
           p.id          AS prescription_id,
           p.symptoms, p.diagnosis, p.notes, p.symptoms_since, p.symptoms_till, p.follow_up_date
    FROM appointments a
    LEFT JOIN prescriptions p ON a.id = p.appointment_id
    WHERE a.patient_id = ? AND a.doctor_id = ? AND a.id != ?
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `).all(req.params.patientId, req.user.id, excludeAppt);

  const withDetails = appointments.map(appt => {
    if (!appt.prescription_id) return { ...appt, medicines: [], lab_tests: [] };
    return {
      ...appt,
      medicines:  db.prepare('SELECT medicine_name, dosage, frequency, duration FROM prescription_medicines WHERE prescription_id = ?').all(appt.prescription_id),
      lab_tests:  db.prepare('SELECT test_name FROM prescription_lab_tests WHERE prescription_id = ?').all(appt.prescription_id),
    };
  });

  res.json(withDetails);
});

// Search all patients by name or phone (for doctor's new appointment modal)
router.get('/search', authenticate, requireDoctor, (req, res) => {
  const q = `%${req.query.q || ''}%`;
  const rows = db.prepare(`
    SELECT id, name, phone, age, gender, email
    FROM users
    WHERE role = 'patient' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)
    ORDER BY name ASC
    LIMIT 20
  `).all(q, q, q);
  res.json(rows);
});

module.exports = router;
