const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new Database(path.join(__dirname, 'docsathi.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('patient', 'doctor')),
    phone TEXT,
    age INTEGER,
    gender TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS doctor_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    specialization TEXT NOT NULL,
    qualification TEXT,
    experience_years INTEGER DEFAULT 0,
    registration_no TEXT,
    consultation_fee INTEGER DEFAULT 500,
    clinic_name TEXT,
    clinic_address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    status TEXT DEFAULT 'confirmed' CHECK(status IN ('confirmed', 'completed', 'cancelled')),
    chief_complaint TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER UNIQUE NOT NULL,
    symptoms TEXT,
    diagnosis TEXT,
    notes TEXT,
    follow_up_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id)
  );

  CREATE TABLE IF NOT EXISTS prescription_medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prescription_id INTEGER NOT NULL,
    medicine_name TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    duration TEXT,
    instructions TEXT,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id)
  );

  CREATE TABLE IF NOT EXISTS prescription_lab_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prescription_id INTEGER NOT NULL,
    test_name TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id)
  );
`);

function seedDoctors() {
  const count = db.prepare('SELECT COUNT(*) as c FROM users WHERE role = ?').get('doctor');
  if (count.c > 0) return;

  const doctors = [
    { name: 'Dr. Arjun Sharma',  email: 'arjun.sharma@docsathi.com',  spec: 'Cardiologist',       qual: 'MBBS, MD (Cardiology)',      exp: 12, reg: 'MCI-12345', fee: 800, clinic: 'Heart Care Clinic',    addr: '101, Medical Complex, New Delhi' },
    { name: 'Dr. Priya Patel',   email: 'priya.patel@docsathi.com',   spec: 'General Physician',   qual: 'MBBS, MD (General Medicine)', exp: 8,  reg: 'MCI-23456', fee: 500, clinic: 'HealthFirst Clinic',   addr: '205, Sector 12, Mumbai' },
    { name: 'Dr. Rahul Mehta',   email: 'rahul.mehta@docsathi.com',   spec: 'Dermatologist',       qual: 'MBBS, MD (Dermatology)',      exp: 10, reg: 'MCI-34567', fee: 700, clinic: 'SkinCare Centre',      addr: '45, Park Street, Kolkata' },
    { name: 'Dr. Sunita Rao',    email: 'sunita.rao@docsathi.com',    spec: 'Pediatrician',        qual: 'MBBS, MD (Pediatrics)',       exp: 15, reg: 'MCI-45678', fee: 600, clinic: 'ChildCare Hospital',   addr: '78, MG Road, Bangalore' },
    { name: 'Dr. Vikram Singh',  email: 'vikram.singh@docsathi.com',  spec: 'Orthopedic Surgeon',  qual: 'MBBS, MS (Orthopedics)',      exp: 20, reg: 'MCI-56789', fee: 900, clinic: 'BoneJoint Clinic',     addr: '33, Civil Lines, Jaipur' },
    { name: 'Dr. Meera Nair',    email: 'meera.nair@docsathi.com',    spec: 'Gynecologist',        qual: 'MBBS, MD (OBG)',              exp: 14, reg: 'MCI-67890', fee: 750, clinic: 'WomenCare Clinic',     addr: '12, Anna Salai, Chennai' },
  ];

  const insertUser = db.prepare(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'doctor')`);
  const insertProfile = db.prepare(`INSERT INTO doctor_profiles (user_id, specialization, qualification, experience_years, registration_no, consultation_fee, clinic_name, clinic_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  const pwd = bcrypt.hashSync('doctor123', 10);

  for (const d of doctors) {
    const r = insertUser.run(d.name, d.email, pwd);
    insertProfile.run(r.lastInsertRowid, d.spec, d.qual, d.exp, d.reg, d.fee, d.clinic, d.addr);
  }
  console.log('✓ Seeded 6 doctors (password: doctor123)');
}

// Safe migration — add new columns if not already present
const existingCols = db.prepare('PRAGMA table_info(prescriptions)').all().map(c => c.name);
if (!existingCols.includes('symptoms_since')) db.exec('ALTER TABLE prescriptions ADD COLUMN symptoms_since TEXT');
if (!existingCols.includes('symptoms_till'))  db.exec('ALTER TABLE prescriptions ADD COLUMN symptoms_till  TEXT');

seedDoctors();
module.exports = db;
