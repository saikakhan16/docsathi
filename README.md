# 🏥 DocSathi — Doctor Appointment & Prescription Platform

DocSathi is a full-stack healthcare web application where patients can search for doctors and book appointments, and doctors can write digital prescriptions for their patients.

**Live URL:** [https://docsathi-bd76.vercel.app](https://docsathi-bd76.vercel.app) 
 
**Backend Health Check:** [https://api.himotechglobal.com/docsathi/api/auth/status](https://api.himotechglobal.com/docsathi/api/auth/status)

---
## ✨ Features

### 🧑‍💼 Patient Features
- **Register & Login** — Create an account with email and password
- **Doctor Search** — Search for doctors by name or specialization
- **Filter by Specialization** — Filter doctors by Cardiologist, Dermatologist, etc.
- **Doctor Profile View** — View doctor's fees, clinic details, and experience
- **Appointment Booking** — Book an appointment by selecting date and time slot
- **Booked Slots** — Already booked time slots are automatically blocked
- **Patient Dashboard** — View all your appointments in one place
- **Appointment Cancel** — Cancel any confirmed appointment
- **Prescription View** — View prescriptions written by your doctor
- **Prescription Print** — Print prescription like a PDF

### 👨‍⚕️ Doctor Features
- **Secure Login** — Login to the dedicated doctor portal
- **Today's Appointments** — Instantly view all appointments for today
- **All Appointments** — View complete appointment history
- **Schedule Appointment** — Book an appointment on behalf of a patient
- **Patient Search** — Search patients by name or phone number
- **Patient List** — View all your unique patients in one place
- **Patient History** — View complete appointment history of any patient
- **Write Prescription** — Write digital prescriptions with medicines and lab tests
- **Add Medicines** — Add medicines with dosage, frequency, and duration
- **Add Lab Tests** — Add required lab tests to the prescription
- **Follow-up Date** — Set next visit date for the patient
- **Auto-Complete Appointment** — Appointment is automatically marked completed after prescription is written

### 🔐 Security Features
- **JWT Authentication** — Every request is verified with a secure token
- **Password Hashing** — Passwords are encrypted using bcrypt
- **Role-based Access** — Separate routes and access for patients and doctors
- **Protected Routes** — Dashboard is not accessible without login

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
# Server will run at: http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` folder:
```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
# Frontend will run at: http://localhost:5173
```

---

## 🌐 Production Deployment

### Backend (Server)
Backend is already deployed at:https://api.himotechglobal.com/api/docsathi

### Frontend (Vercel)

1. Push your code to GitHub:
```bash
git add .
git commit -m "your message"
git push origin main
```

2. Go to [vercel.com](https://vercel.com) → New Project → Select your repo

3. Configure the following settings:
   - **Root Directory:** `frontend`
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. Add the following Environment Variable:VITE_API_URL = https://api.himotechglobal.com/api/docsathi

5. Click Deploy! ✅

---

## 👩‍💻 Developer

**Saika Khan**  
GitHub: [@saikakhan16](https://github.com/saikakhan16)