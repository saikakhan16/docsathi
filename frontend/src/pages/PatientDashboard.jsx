import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyAppointments, cancelAppointment } from '../data/mockDb';

const fmtDate = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

const fmtTime = (t) => {
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour < 12 ? 'AM' : 'PM'}`;
};

const STATUS = {
  confirmed: { label: 'Confirmed',  bg: '#dbeafe', color: '#1d4ed8' },
  completed: { label: 'Completed',  bg: '#d1fae5', color: '#065f46' },
  cancelled:  { label: 'Cancelled', bg: '#fee2e2', color: '#b91c1c' },
};

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    setAppointments(getMyAppointments(user.id, user.role));
    setLoading(false);
  }, []);

  const cancel = (id) => {
    if (!confirm('Cancel this appointment?')) return;
    cancelAppointment(id);
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8fafc' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading your appointments…</p>
      </div>
    </div>
  );

  const upcoming = appointments.filter(a => a.status === 'confirmed');
  const past     = appointments.filter(a => a.status !== 'confirmed');

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <div className="text-white py-12 px-4" style={{ background: 'linear-gradient(135deg, #0B2149 0%, #1a4a8a 100%)' }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-blue-300 text-sm font-medium mb-1">Patient Portal</p>
            <h1 className="text-3xl font-bold text-white">Good day, {user.name.split(' ')[0]}</h1>
            <p className="text-blue-200 text-sm mt-1">
              {upcoming.length > 0
                ? `You have ${upcoming.length} upcoming appointment${upcoming.length > 1 ? 's' : ''}`
                : 'No upcoming appointments'}
            </p>
          </div>
          <Link to="/"
            className="inline-flex items-center gap-2 bg-white text-sm font-semibold px-5 py-3 rounded-xl transition hover:shadow-lg hover:-translate-y-px"
            style={{ color: '#0B2149' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Book Appointment
          </Link>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="max-w-4xl mx-auto px-4 -mt-5">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Visits',  value: appointments.length, icon: '📅' },
            { label: 'Completed',     value: appointments.filter(a => a.status === 'completed').length, icon: '✅' },
            { label: 'Upcoming',      value: upcoming.length, icon: '⏰' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
              <div className="text-2xl">{s.icon}</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {appointments.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-4xl mx-auto mb-5">📅</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No appointments yet</h3>
            <p className="text-gray-500 text-sm mb-7">Browse our specialists and book your first appointment.</p>
            <Link to="/"
              className="inline-block text-white text-sm font-semibold px-8 py-3 rounded-xl transition hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0B2149, #1a4a8a)' }}>
              Find a Doctor
            </Link>
          </div>
        )}

        {upcoming.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h2 className="text-base font-bold text-gray-800">Upcoming Appointments</h2>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{upcoming.length}</span>
            </div>
            <div className="space-y-3">
              {upcoming.map(a => <AppCard key={a.id} a={a} onCancel={cancel} />)}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              <h2 className="text-base font-bold text-gray-800">Past Appointments</h2>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">{past.length}</span>
            </div>
            <div className="space-y-3">
              {past.map(a => <AppCard key={a.id} a={a} onCancel={cancel} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function AppCard({ a, onCancel }) {
  const s = STATUS[a.status] || { label: a.status, bg: '#f3f4f6', color: '#374151' };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
           style={{ background: '#eff6ff' }}>
        👨‍⚕️
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h3 className="font-bold text-gray-900 text-sm">{a.doctor_name}</h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                style={{ background: s.bg, color: s.color }}>
            {s.label}
          </span>
        </div>
        <p className="text-xs font-medium mb-1" style={{ color: '#3b82f6' }}>{a.specialization}</p>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {fmtDate(a.appointment_date)}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {fmtTime(a.appointment_time)}
          </span>
        </div>
        {a.chief_complaint && (
          <p className="text-xs text-gray-400 mt-1 truncate italic">"{a.chief_complaint}"</p>
        )}
      </div>

      <div className="flex gap-2 flex-shrink-0">
        {a.prescription_id && (
          <Link to={`/prescription/${a.prescription_id}`}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg transition text-white"
            style={{ background: 'linear-gradient(135deg, #059669, #0891b2)' }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Prescription
          </Link>
        )}
        {a.status === 'confirmed' && (
          <button onClick={() => onCancel(a.id)}
            className="text-xs font-semibold px-3.5 py-2 rounded-lg border transition hover:bg-red-50"
            style={{ borderColor: '#fca5a5', color: '#dc2626' }}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
