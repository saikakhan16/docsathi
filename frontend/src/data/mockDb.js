const DOCTORS = [
  { id: 1, name: 'Dr. Arjun Sharma',  specialization: 'Cardiologist',       qualification: 'MBBS, MD (Cardiology)',  experience_years: 15, clinic_name: 'Heart Care Clinic',       clinic_address: 'Sector 12, Delhi',          consultation_fee: 500, registration_no: 'DEL-12345' },
  { id: 2, name: 'Dr. Priya Patel',   specialization: 'General Physician',  qualification: 'MBBS, MD',               experience_years: 10, clinic_name: 'Patel Wellness Centre',   clinic_address: 'Koramangala, Bangalore',    consultation_fee: 300, registration_no: 'KAR-67890' },
  { id: 3, name: 'Dr. Rahul Mehta',   specialization: 'Dermatologist',      qualification: 'MBBS, DVD',              experience_years: 8,  clinic_name: 'Skin Solutions',          clinic_address: 'Bandra, Mumbai',            consultation_fee: 600, registration_no: 'MH-11223'  },
  { id: 4, name: 'Dr. Sunita Rao',    specialization: 'Pediatrician',       qualification: 'MBBS, DCH',              experience_years: 12, clinic_name: 'Child Care Clinic',       clinic_address: 'Anna Nagar, Chennai',       consultation_fee: 400, registration_no: 'TN-44556'  },
  { id: 5, name: 'Dr. Vikram Singh',  specialization: 'Orthopedic Surgeon', qualification: 'MBBS, MS (Ortho)',       experience_years: 18, clinic_name: 'Bone & Joint Centre',     clinic_address: 'Andheri, Mumbai',           consultation_fee: 700, registration_no: 'MH-77889'  },
  { id: 6, name: 'Dr. Meera Nair',    specialization: 'Gynecologist',       qualification: 'MBBS, MD (OBG)',         experience_years: 14, clinic_name: "Women's Health Centre", clinic_address: 'Indiranagar, Bangalore',    consultation_fee: 550, registration_no: 'KAR-99001' },
];

const SEED_DOCTORS = [
  { id: 101, name: 'Dr. Arjun Sharma', email: 'arjun.sharma@docsathi.com', password: 'doctor123', role: 'doctor', profile: { doctor_id: 1, specialization: 'Cardiologist',       qualification: 'MBBS, MD (Cardiology)', clinic_name: 'Heart Care Clinic',       registration_no: 'DEL-12345' } },
  { id: 102, name: 'Dr. Priya Patel',  email: 'priya.patel@docsathi.com',  password: 'doctor123', role: 'doctor', profile: { doctor_id: 2, specialization: 'General Physician',  qualification: 'MBBS, MD',              clinic_name: 'Patel Wellness Centre',   registration_no: 'KAR-67890' } },
  { id: 103, name: 'Dr. Rahul Mehta',  email: 'rahul.mehta@docsathi.com',  password: 'doctor123', role: 'doctor', profile: { doctor_id: 3, specialization: 'Dermatologist',      qualification: 'MBBS, DVD',             clinic_name: 'Skin Solutions',          registration_no: 'MH-11223'  } },
  { id: 104, name: 'Dr. Sunita Rao',   email: 'sunita.rao@docsathi.com',   password: 'doctor123', role: 'doctor', profile: { doctor_id: 4, specialization: 'Pediatrician',       qualification: 'MBBS, DCH',             clinic_name: 'Child Care Clinic',       registration_no: 'TN-44556'  } },
  { id: 105, name: 'Dr. Vikram Singh', email: 'vikram.singh@docsathi.com', password: 'doctor123', role: 'doctor', profile: { doctor_id: 5, specialization: 'Orthopedic Surgeon', qualification: 'MBBS, MS (Ortho)',      clinic_name: 'Bone & Joint Centre',     registration_no: 'MH-77889'  } },
  { id: 106, name: 'Dr. Meera Nair',   email: 'meera.nair@docsathi.com',   password: 'doctor123', role: 'doctor', profile: { doctor_id: 6, specialization: 'Gynecologist',       qualification: 'MBBS, MD (OBG)',        clinic_name: "Women's Health Centre", registration_no: 'KAR-99001' } },
];

function apiErr(msg) {
  const e = new Error(msg);
  e.response = { data: { error: msg } };
  return e;
}

function getUsers() {
  const raw = localStorage.getItem('ds_users');
  if (!raw) { localStorage.setItem('ds_users', JSON.stringify(SEED_DOCTORS)); return SEED_DOCTORS; }
  return JSON.parse(raw);
}
function saveUsers(u) { localStorage.setItem('ds_users', JSON.stringify(u)); }

function getAppointments() {
  const raw = localStorage.getItem('ds_appointments');
  return raw ? JSON.parse(raw) : [];
}
function saveAppointments(a) { localStorage.setItem('ds_appointments', JSON.stringify(a)); }

function getRxList() {
  const raw = localStorage.getItem('ds_prescriptions');
  return raw ? JSON.parse(raw) : [];
}
function saveRxList(r) { localStorage.setItem('ds_prescriptions', JSON.stringify(r)); }

export function getAllDoctors() { return DOCTORS; }
export function getDoctorById(id) { return DOCTORS.find(d => d.id === parseInt(id)) || null; }

export function login(email, password) {
  const user = getUsers().find(u => u.email === email && u.password === password);
  if (!user) throw apiErr('Invalid email or password');
  const { password: _, ...safe } = user;
  return { token: `mock_${user.id}_${Date.now()}`, user: safe };
}

export function register({ name, email, password, phone, age, gender }) {
  const users = getUsers();
  if (users.find(u => u.email === email)) throw apiErr('Email already registered');
  const newUser = { id: Date.now(), name, email, password, role: 'patient', phone: phone || null, age: age ? parseInt(age) : null, gender: gender || null };
  saveUsers([...users, newUser]);
  const { password: _, ...safe } = newUser;
  return { token: `mock_${newUser.id}_${Date.now()}`, user: safe };
}

export function getBookedSlots(doctorId, date) {
  return getAppointments()
    .filter(a => a.doctor_id === parseInt(doctorId) && a.appointment_date === date && a.status !== 'cancelled')
    .map(a => a.appointment_time);
}

function makeAppt(doctorId, patientId, date, time, complaint) {
  const doctor  = DOCTORS.find(d => d.id === parseInt(doctorId));
  const patient = getUsers().find(u => u.id === patientId);
  return {
    id: Date.now(),
    doctor_id:        parseInt(doctorId),
    patient_id:       patientId,
    appointment_date: date,
    appointment_time: time,
    chief_complaint:  complaint || '',
    status:           'confirmed',
    prescription_id:  null,
    doctor_name:      doctor?.name || '',
    specialization:   doctor?.specialization || '',
    patient_name:     patient?.name || '',
    patient_age:      patient?.age || null,
    patient_gender:   patient?.gender || null,
    patient_phone:    patient?.phone || null,
  };
}

export function bookAppointment({ patient_id, doctor_id, appointment_date, appointment_time, chief_complaint }) {
  const appt = makeAppt(doctor_id, patient_id, appointment_date, appointment_time, chief_complaint);
  saveAppointments([...getAppointments(), appt]);
  return appt;
}

export function bookAppointmentByDoctor({ doctor_id, patient_id, appointment_date, appointment_time, chief_complaint }) {
  const appt = makeAppt(doctor_id, patient_id, appointment_date, appointment_time, chief_complaint);
  saveAppointments([...getAppointments(), appt]);
  return appt;
}

export function getMyAppointments(userId, role) {
  const appts = getAppointments();
  if (role === 'doctor') {
    const user = getUsers().find(u => u.id === userId);
    const doctorId = user?.profile?.doctor_id;
    return appts.filter(a => a.doctor_id === doctorId)
      .sort((a, b) => b.appointment_date.localeCompare(a.appointment_date));
  }
  return appts.filter(a => a.patient_id === userId)
    .sort((a, b) => b.appointment_date.localeCompare(a.appointment_date));
}

export function cancelAppointment(id) {
  saveAppointments(getAppointments().map(a => a.id === parseInt(id) ? { ...a, status: 'cancelled' } : a));
}

export function getMyPatients(doctorUserId) {
  const user = getUsers().find(u => u.id === doctorUserId);
  const doctorId = user?.profile?.doctor_id;
  const appts = getAppointments().filter(a => a.doctor_id === doctorId);
  const map = {};
  appts.forEach(a => {
    if (!map[a.patient_id]) {
      map[a.patient_id] = { id: a.patient_id, name: a.patient_name, age: a.patient_age, gender: a.patient_gender, phone: a.patient_phone, total_appointments: 0, completed_count: 0, upcoming_count: 0, last_visit: null, latest_appointment_id: null, latest_prescription_id: null };
    }
    const p = map[a.patient_id];
    p.total_appointments++;
    if (a.status === 'completed') p.completed_count++;
    if (a.status === 'confirmed') p.upcoming_count++;
    if (!p.last_visit || a.appointment_date > p.last_visit) {
      p.last_visit = a.appointment_date;
      p.latest_appointment_id = a.id;
      p.latest_prescription_id = a.prescription_id;
    }
  });
  return Object.values(map);
}

export function searchPatients(query) {
  const q = query.toLowerCase();
  return getUsers()
    .filter(u => u.role === 'patient' && (u.name.toLowerCase().includes(q) || (u.phone && u.phone.includes(q))))
    .map(({ password: _, ...u }) => u);
}

export function getPatientAppointments(patientId, excludeId) {
  const rxList = getRxList();
  return getAppointments()
    .filter(a => a.patient_id === parseInt(patientId) && (!excludeId || a.id !== parseInt(excludeId)))
    .map(a => {
      const rx = a.prescription_id ? rxList.find(r => r.id === a.prescription_id) : null;
      return { ...a, diagnosis: rx?.diagnosis || null, symptoms: rx?.symptoms || null, symptoms_since: rx?.symptoms_since || null, symptoms_till: rx?.symptoms_till || null, notes: rx?.notes || null, follow_up_date: rx?.follow_up_date || null, medicines: rx?.medicines || [], lab_tests: rx?.lab_tests || [] };
    })
    .sort((a, b) => b.appointment_date.localeCompare(a.appointment_date));
}

export function savePrescription({ appointment_id, symptoms, symptoms_since, symptoms_till, diagnosis, notes, follow_up_date, medicines, lab_tests }) {
  const appts = getAppointments();
  const appt  = appts.find(a => a.id === parseInt(appointment_id));
  if (!appt) throw apiErr('Appointment not found');
  const doctor = DOCTORS.find(d => d.id === appt.doctor_id);
  const rx = {
    id: Date.now(),
    appointment_id: parseInt(appointment_id),
    doctor_name: doctor?.name || '', specialization: doctor?.specialization || '',
    qualification: doctor?.qualification || '', clinic_name: doctor?.clinic_name || '',
    clinic_address: doctor?.clinic_address || '', registration_no: doctor?.registration_no || '',
    patient_name: appt.patient_name, patient_age: appt.patient_age,
    patient_gender: appt.patient_gender, patient_phone: appt.patient_phone,
    appointment_date: appt.appointment_date, appointment_time: appt.appointment_time,
    symptoms, symptoms_since, symptoms_till, diagnosis, notes, follow_up_date,
    medicines: medicines.map((m, i) => ({ id: i + 1, medicine_name: m.name, ...m })),
    lab_tests:  lab_tests.map((t, i) => ({ id: i + 1, test_name: t.name, ...t })),
    created_at: new Date().toISOString().split('T')[0],
  };
  saveRxList([...getRxList(), rx]);
  saveAppointments(appts.map(a => a.id === parseInt(appointment_id) ? { ...a, prescription_id: rx.id, status: 'completed' } : a));
  return rx;
}

export function getPrescriptionById(id) {
  return getRxList().find(r => r.id === parseInt(id)) || null;
}
