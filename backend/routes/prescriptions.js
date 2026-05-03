const express = require('express');
const db = require('../database');
const { authenticate, requireDoctor } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, requireDoctor, (req, res) => {
  const { appointment_id, symptoms, symptoms_since, symptoms_till, diagnosis, lab_tests, medicines, notes, follow_up_date } = req.body;

  const appt = db.prepare('SELECT * FROM appointments WHERE id = ? AND doctor_id = ?').get(appointment_id, req.user.id);
  if (!appt) return res.status(403).json({ error: 'Appointment not found or access denied' });

  if (db.prepare('SELECT id FROM prescriptions WHERE appointment_id = ?').get(appointment_id))
    return res.status(400).json({ error: 'Prescription already exists for this appointment' });

  const prescriptionId = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO prescriptions (appointment_id, symptoms, symptoms_since, symptoms_till, diagnosis, notes, follow_up_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(appointment_id, symptoms, symptoms_since || null, symptoms_till || null, diagnosis, notes, follow_up_date || null);

    const pid = result.lastInsertRowid;

    if (Array.isArray(lab_tests)) {
      const ins = db.prepare('INSERT INTO prescription_lab_tests (prescription_id, test_name, notes) VALUES (?, ?, ?)');
      for (const t of lab_tests) if (t.name?.trim()) ins.run(pid, t.name.trim(), t.notes || null);
    }

    if (Array.isArray(medicines)) {
      const ins = db.prepare(`
        INSERT INTO prescription_medicines (prescription_id, medicine_name, dosage, frequency, duration, instructions)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const m of medicines) if (m.name?.trim()) ins.run(pid, m.name.trim(), m.dosage, m.frequency, m.duration, m.instructions || null);
    }

    db.prepare("UPDATE appointments SET status = 'completed' WHERE id = ?").run(appointment_id);
    return pid;
  })();

  res.json({ id: prescriptionId, message: 'Prescription saved successfully' });
});

const fullPrescriptionQuery = `
  SELECT p.*,
         a.appointment_date, a.appointment_time, a.chief_complaint,
         pu.name AS patient_name, pu.age AS patient_age, pu.gender AS patient_gender, pu.phone AS patient_phone,
         du.name AS doctor_name,
         dp.specialization, dp.qualification, dp.registration_no, dp.clinic_name, dp.clinic_address
  FROM prescriptions p
  JOIN appointments a ON p.appointment_id = a.id
  JOIN users pu ON a.patient_id = pu.id
  JOIN users du ON a.doctor_id = du.id
  JOIN doctor_profiles dp ON du.id = dp.user_id
`;

function attachDetails(prescription) {
  if (!prescription) return null;
  return {
    ...prescription,
    lab_tests: db.prepare('SELECT * FROM prescription_lab_tests WHERE prescription_id = ?').all(prescription.id),
    medicines:  db.prepare('SELECT * FROM prescription_medicines  WHERE prescription_id = ?').all(prescription.id),
  };
}

router.get('/by-appointment/:appointmentId', authenticate, (req, res) => {
  const row = db.prepare(fullPrescriptionQuery + ' WHERE p.appointment_id = ?').get(req.params.appointmentId);
  if (!row) return res.status(404).json({ error: 'Prescription not found' });
  res.json(attachDetails(row));
});

router.get('/:id', authenticate, (req, res) => {
  const row = db.prepare(fullPrescriptionQuery + ' WHERE p.id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Prescription not found' });
  res.json(attachDetails(row));
});

module.exports = router;
