# 🏥 DocSathi — Doctor Appointment & Prescription Platform

DocSathi is a full-stack healthcare web application where patients can search for doctors and book appointments, and doctors can write digital prescriptions for their patients.

**Live URL:** [https://docsathi-bd76.vercel.app](https://docsathi-bd76.vercel.app) 
 
**Backend Health Check:** [https://api.himotechglobal.com/docsathi/api/auth/status](https://api.himotechglobal.com/docsathi/api/auth/status)

---

## 📁 Project Structure

```
docsathi/
├── frontend/          # React + Vite frontend (Vercel pe deploy)
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Login/Register/Logout logic
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Doctor listing + search
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── Register.jsx       # Patient registration
│   │   │   ├── BookAppointment.jsx       # Patient appointment booking
│   │   │   ├── PatientDashboard.jsx      # Patient ka dashboard
│   │   │   ├── DoctorDashboard.jsx       # Doctor ka dashboard
│   │   │   ├── PrescriptionForm.jsx      # Doctor prescription likhta hai
│   │   │   └── PrintPrescription.jsx     # Prescription print/view
│   │   └── main.jsx
│   ├── .env                       # Environment variables (local)
│   ├── vercel.json                # Vercel routing config
│   └── vite.config.js
│
└── backend/           # Node.js + Express backend (Server pe deploy)
    ├── routes/
    │   ├── auth.js          # Register & Login APIs
    │   ├── doctors.js       # Doctor listing APIs
    │   ├── appointments.js  # Appointment booking APIs
    │   ├── patients.js      # Patient management APIs
    │   └── prescriptions.js # Prescription APIs
    ├── middleware/
    │   └── auth.js          # JWT authentication middleware
    ├── database.js          # SQLite database setup & seeding
    ├── config.js            # JWT secret & PORT config
    └── server.js            # Express server entry point
```

---

## 🚀 Tech Stack

| Part | Technology |
|------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | SQLite (better-sqlite3) |
| Auth | JWT (JSON Web Token) + bcryptjs |
| Frontend Deploy | Vercel |
| Backend Deploy | Custom Server (himotechglobal.com) |

---

## ✨ Features

### Patient
- ✅ Register & Login
- ✅ Doctors browse karo (specialization se filter)
- ✅ Doctor search karo (naam ya specialization se)
- ✅ Appointment book karo (date + time slot select karke)
- ✅ Apne appointments dashboard pe dekho
- ✅ Appointment cancel karo
- ✅ Prescription view karo

### Doctor
- ✅ Login karo (pre-seeded accounts)
- ✅ Aaj ke aur saare appointments dekho
- ✅ Patient ke liye appointment schedule karo
- ✅ Patient history dekho
- ✅ Digital prescription likho (medicines + lab tests)
- ✅ Prescription print karo

---

## 🔐 Doctor Login Credentials

Yeh doctors pehle se database mein hain:

| Doctor | Email | Password |
|--------|-------|----------|
| Dr. Arjun Sharma (Cardiologist) | arjun.sharma@docsathi.com | doctor123 |
| Dr. Priya Patel (General Physician) | priya.patel@docsathi.com | doctor123 |
| Dr. Rahul Mehta (Dermatologist) | rahul.mehta@docsathi.com | doctor123 |
| Dr. Sunita Rao (Pediatrician) | sunita.rao@docsathi.com | doctor123 |
| Dr. Vikram Singh (Orthopedic Surgeon) | vikram.singh@docsathi.com | doctor123 |
| Dr. Meera Nair (Gynecologist) | meera.nair@docsathi.com | doctor123 |

---

## 🗄️ Database Schema

```sql
users                  -- Patients aur Doctors dono
doctor_profiles        -- Doctor ki extra info (specialization, clinic, fees)
appointments           -- Booked appointments
prescriptions          -- Doctor ki likhi prescriptions
prescription_medicines -- Prescription mein medicines
prescription_lab_tests -- Prescription mein lab tests
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Patient register |
| POST | `/auth/login` | Login (patient + doctor) |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/doctors` | Saare doctors ki list |
| GET | `/doctors/:id` | Ek doctor ki detail |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/appointments/my` | Apne appointments dekho |
| POST | `/appointments` | Patient appointment book kare |
| POST | `/appointments/by-doctor` | Doctor appointment schedule kare |
| GET | `/appointments/booked-slots` | Kaunse slots booked hain |
| PATCH | `/appointments/:id/cancel` | Appointment cancel karo |

### Patients (Doctor only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/patients/my` | Doctor ke saare patients |
| GET | `/patients/search?q=` | Patient search karo |
| GET | `/patients/:id/appointments` | Patient ki appointment history |

### Prescriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/prescriptions` | Prescription likho |
| GET | `/prescriptions/:id` | Prescription dekho |

---

## 💻 Local Setup (Development)

### Prerequisites
- Node.js v18+
- npm

### Backend Setup
```bash
cd backend
npm install
node server.js
# Server chalega: http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
```

`.env` file banao `frontend` folder mein:
```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
# Frontend chalega: http://localhost:5173
```

---

## 🌐 Production Deployment

### Backend (Server pe)
Backend already deploy hai:
```
https://api.himotechglobal.com/api/docsathi
```

### Frontend (Vercel pe)

1. GitHub pe push karo:
```bash
git add .
git commit -m "your message"
git push origin main
```

2. [vercel.com](https://vercel.com) pe jaao → New Project → Repo select karo

3. Settings:
   - **Root Directory:** `frontend`
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. Environment Variable add karo:
```
VITE_API_URL = https://api.himotechglobal.com/api/docsathi
```

5. Deploy! ✅

---

## 👩‍💻 Developer

**Saika Khan**  
GitHub: [@saikakhan16](https://github.com/saikakhan16)
