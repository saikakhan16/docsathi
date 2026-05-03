import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function generateSlots() {
  const slots = [];
  for (let h = 9; h < 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      const label = `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
      const value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      slots.push({ label, value });
    }
  }
  return slots;
}

const ALL_SLOTS = generateSlots();
const today = () => new Date().toISOString().split('T')[0];

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctor,       setDoctor]       = useState(null);
  const [date,         setDate]         = useState(today());
  const [bookedSlots,  setBookedSlots]  = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [complaint,    setComplaint]    = useState('');
  const [busy,         setBusy]         = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [error,        setError]        = useState('');

  useEffect(() => {
    axios.get(`/doctors/${doctorId}`)
      .then(r => setDoctor(r.data))
      .catch(() => navigate('/'));
  }, [doctorId]);

  useEffect(() => {
    if (!date) return;
    axios.get(`/appointments/booked-slots?doctor_id=${doctorId}&date=${date}`)
      .then(r => setBookedSlots(r.data))
      .catch(() => setBookedSlots([]));
    setSelectedTime('');
  }, [date, doctorId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!selectedTime) return setError('Please select a time slot');
    setBusy(true); setError('');
    try {
      await axios.post('/appointments', {
        doctor_id: parseInt(doctorId),
        appointment_date: date,
        appointment_time: selectedTime,
        chief_complaint: complaint,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
    } finally { setBusy(false); }
  };

  if (!doctor) return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading…</div>;

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Appointment Booked!</h2>
          <p className="text-gray-600 mb-6">
            Your appointment with <strong>{doctor.name}</strong> is confirmed for{' '}
            <strong>{new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>{' '}
            at <strong>{ALL_SLOTS.find(s => s.value === selectedTime)?.label}</strong>.
          </p>
          <button onClick={() => navigate('/patient/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition">
            View My Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl">👨‍⚕️</div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{doctor.name}</h2>
            <p className="text-blue-600 font-medium">{doctor.specialization}</p>
            <p className="text-gray-500 text-sm">{doctor.clinic_name} · {doctor.clinic_address}</p>
            <p className="text-green-600 font-semibold mt-1">Consultation Fee: ₹{doctor.consultation_fee}</p>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl shadow p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-800">Book Appointment</h3>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
            <input type="date" min={today()} value={date} onChange={e => setDate(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Time Slot</label>
            <div className="grid grid-cols-4 gap-2">
              {ALL_SLOTS.map(slot => {
                const isBooked   = bookedSlots.includes(slot.value);
                const isSelected = selectedTime === slot.value;
                return (
                  <button key={slot.value} type="button" disabled={isBooked} onClick={() => setSelectedTime(slot.value)}
                    className={`py-2 px-1 rounded-lg text-sm font-medium transition border ${
                      isBooked   ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' :
                      isSelected ? 'bg-blue-600 text-white border-blue-600' :
                                   'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                    }`}>
                    {slot.label}
                    {isBooked && <span className="block text-xs text-gray-400">Booked</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chief Complaint (optional)</label>
            <textarea rows={3} value={complaint} onChange={e => setComplaint(e.target.value)}
              placeholder="Briefly describe your symptoms or reason for visit…"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <button type="submit" disabled={busy || !selectedTime}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl transition text-lg">
            {busy ? 'Booking…' : 'Confirm Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}
