import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar            from './components/Navbar';
import Home              from './pages/Home';
import Login             from './pages/Login';
import Register          from './pages/Register';
import BookAppointment   from './pages/BookAppointment';
import PatientDashboard  from './pages/PatientDashboard';
import DoctorDashboard   from './pages/DoctorDashboard';
import PrescriptionForm  from './pages/PrescriptionForm';
import PrintPrescription from './pages/PrintPrescription';

function Guard({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />

        <Route path="/book/:doctorId" element={
          <Guard role="patient"><BookAppointment /></Guard>
        } />
        <Route path="/patient/dashboard" element={
          <Guard role="patient"><PatientDashboard /></Guard>
        } />
        <Route path="/doctor/dashboard" element={
          <Guard role="doctor"><DoctorDashboard /></Guard>
        } />
        <Route path="/prescription/write/:appointmentId" element={
          <Guard role="doctor"><PrescriptionForm /></Guard>
        } />
        <Route path="/prescription/:id" element={
          <Guard><PrintPrescription /></Guard>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
