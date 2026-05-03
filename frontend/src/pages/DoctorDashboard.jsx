import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyAppointments, getMyPatients, searchPatients, getPatientAppointments, getBookedSlots, bookAppointmentByDoctor } from '../data/mockDb';

const todayStr = () => new Date().toISOString().split('T')[0];

const fmtDate = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

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

function generateSlots() {
  const slots = [];
  for (let h = 9; h < 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      const label = `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
      const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      slots.push({ label, value });
    }
  }
  return slots;
}
const ALL_SLOTS = generateSlots();

export default function DoctorDashboard() {
  const [tab,           setTab]          = useState('today');
  const [appointments,  setAppointments] = useState([]);
  const [patients,      setPatients]     = useState([]);
  const [loadingAppt,   setLoadingAppt]  = useState(true);
  const [loadingPat,    setLoadingPat]   = useState(false);
  const [patientModal,  setPatientModal] = useState(null);
  const [showNewAppt,   setShowNewAppt]  = useState(false);
  const { user } = useAuth();

  const refreshAppointments = () => {
    setLoadingAppt(true);
    setAppointments(getMyAppointments(user.id, user.role));
    setLoadingAppt(false);
  };

  useEffect(() => { refreshAppointments(); }, []);

  useEffect(() => {
    if (tab !== 'patients' || patients.length) return;
    setLoadingPat(true);
    setPatients(getMyPatients(user.id));
    setLoadingPat(false);
  }, [tab]);

  const openPatient = (p) => {
    const history = getPatientAppointments(p.id, null);
    setPatientModal({ patient: p, history });
  };

  const today     = appointments.filter(a => a.appointment_date === todayStr());
  const displayed = tab === 'today' ? today : tab === 'all' ? appointments : [];

  const stats = {
    today:     today.length,
    pending:   today.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    patients:  new Set(appointments.map(a => a.patient_id)).size,
  };

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>

      {/* Header */}
      <div className="text-white py-10 px-4" style={{ background: 'linear-gradient(135deg, #0B2149 0%, #0d3272 60%, #0a5c9e 100%)' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-blue-300 text-sm font-medium mb-1">Doctor Portal</p>
            <h1 className="text-3xl font-bold text-white">
              {user.name}
            </h1>
            <p className="text-blue-200 text-sm mt-1">{user.profile?.specialization} · {user.profile?.clinic_name}</p>
          </div>
          <button onClick={() => setShowNewAppt(true)}
            className="inline-flex items-center gap-2 bg-white text-sm font-semibold px-5 py-3 rounded-xl transition hover:shadow-lg hover:-translate-y-px self-start sm:self-auto"
            style={{ color: '#0B2149' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Appointment
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="max-w-5xl mx-auto px-4 -mt-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Today's",    sub: 'Appointments', value: stats.today,     icon: '📅', accent: '#3b82f6' },
            { label: 'Pending',    sub: 'Today',        value: stats.pending,   icon: '⏳', accent: '#f59e0b' },
            { label: 'Completed',  sub: 'All time',     value: stats.completed, icon: '✅', accent: '#10b981' },
            { label: 'Patients',   sub: 'Unique',       value: stats.patients,  icon: '👥', accent: '#8b5cf6' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                   style={{ background: s.accent + '18' }}>
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 leading-tight">{s.label} <span className="text-gray-400">{s.sub}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {[
            { key: 'today',    label: "Today" },
            { key: 'all',      label: 'All Appointments' },
            { key: 'patients', label: 'Patients' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t.key
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Appointments */}
        {(tab === 'today' || tab === 'all') && (
          loadingAppt ? <Spinner /> :
          displayed.length === 0
            ? <Empty text={tab === 'today' ? 'No appointments scheduled for today.' : 'No appointments yet.'} />
            : <div className="space-y-3">
                {displayed.map(a => <AppointmentCard key={a.id} a={a} />)}
              </div>
        )}

        {/* Patient Listing */}
        {tab === 'patients' && (
          loadingPat ? <Spinner /> :
          patients.length === 0
            ? <Empty text="No patients yet. Appointments will appear here." />
            : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patients.map(p => <PatientCard key={p.id} p={p} onOpen={openPatient} />)}
              </div>
        )}
      </div>

      {patientModal && (
        <PatientModal data={patientModal} onClose={() => setPatientModal(null)} />
      )}
      {showNewAppt && (
        <NewAppointmentModal
          doctorId={user.id}
          onClose={() => setShowNewAppt(false)}
          onSuccess={() => { setShowNewAppt(false); refreshAppointments(); }}
        />
      )}
    </div>
  );
}

/* ── New Appointment Modal ── */
function NewAppointmentModal({ doctorId, onClose, onSuccess }) {
  const [query,        setQuery]        = useState('');
  const [results,      setResults]      = useState([]);
  const [selectedPat,  setSelectedPat]  = useState(null);
  const [date,         setDate]         = useState(todayStr());
  const [bookedSlots,  setBookedSlots]  = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [complaint,    setComplaint]    = useState('');
  const [busy,         setBusy]         = useState(false);
  const [error,        setError]        = useState('');
  const searchTimer = useRef(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setResults(searchPatients(query));
    }, 300);
  }, [query]);

  useEffect(() => {
    if (!date) return;
    setSelectedTime('');
    setBookedSlots(getBookedSlots(doctorId, date));
  }, [date, doctorId]);

  const submit = (e) => {
    e.preventDefault();
    if (!selectedPat) return setError('Please select a patient');
    if (!selectedTime) return setError('Please select a time slot');
    setBusy(true); setError('');
    try {
      bookAppointmentByDoctor({
        doctor_id: doctorId, patient_id: selectedPat.id,
        appointment_date: date, appointment_time: selectedTime, chief_complaint: complaint || null,
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to schedule appointment');
      setBusy(false);
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 focus:bg-white";

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
           onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Schedule Appointment</h2>
            <p className="text-xs text-gray-500 mt-0.5">Book an appointment for your patient</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          <form onSubmit={submit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Patient Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Patient <span className="text-red-400">*</span>
              </label>
              {selectedPat ? (
                <div className="flex items-center gap-3 border border-green-200 bg-green-50 rounded-xl px-4 py-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                       style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                    {selectedPat.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{selectedPat.name}</p>
                    <p className="text-gray-500 text-xs">
                      {[selectedPat.age && `${selectedPat.age} yrs`, selectedPat.gender, selectedPat.phone].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <button type="button" onClick={() => { setSelectedPat(null); setQuery(''); }}
                    className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="Search by name or phone number…" className={inputClass} autoFocus />
                  {results.length > 0 && (
                    <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                      {results.map(p => (
                        <button key={p.id} type="button"
                          onClick={() => { setSelectedPat(p); setQuery(''); setResults([]); }}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-3 border-b border-gray-50 last:border-0 transition">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                               style={{ background: 'linear-gradient(135deg, #0B2149, #1a4a8a)' }}>
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                            <p className="text-gray-400 text-xs">{[p.age && `${p.age} yrs`, p.gender, p.phone].filter(Boolean).join(' · ')}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {query.trim().length > 1 && results.length === 0 && (
                    <p className="mt-2 text-xs text-gray-400 text-center">No patients found. They need to register first.</p>
                  )}
                </div>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date <span className="text-red-400">*</span></label>
              <input type="date" value={date} min={todayStr()} onChange={e => setDate(e.target.value)} className={inputClass} />
            </div>

            {/* Time Slots */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot <span className="text-red-400">*</span></label>
              <div className="grid grid-cols-4 gap-2">
                {ALL_SLOTS.map(slot => {
                  const booked   = bookedSlots.includes(slot.value);
                  const selected = selectedTime === slot.value;
                  return (
                    <button key={slot.value} type="button" disabled={booked}
                      onClick={() => setSelectedTime(slot.value)}
                      className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                        booked   ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through' :
                        selected ? 'text-white border-transparent shadow-sm'                                   :
                                   'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                      }`}
                      style={selected ? { background: 'linear-gradient(135deg, #0B2149, #1a4a8a)' } : {}}>
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chief Complaint */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Chief Complaint</label>
              <textarea rows={2} value={complaint} onChange={e => setComplaint(e.target.value)}
                placeholder="Reason for visit (optional)…"
                className={inputClass + ' resize-none'} />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition text-sm">
                Cancel
              </button>
              <button type="submit" disabled={busy}
                className="flex-1 text-white font-semibold py-3 rounded-xl transition hover:shadow-lg disabled:opacity-60 text-sm"
                style={{ background: 'linear-gradient(135deg, #0B2149, #1a4a8a)' }}>
                {busy ? 'Scheduling…' : 'Schedule'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ── Appointment Card ── */
function AppointmentCard({ a }) {
  const s = STATUS[a.status] || { label: a.status, bg: '#f3f4f6', color: '#374151' };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
           style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
        {a.patient_name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h3 className="font-bold text-gray-900 text-sm">{a.patient_name}</h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                style={{ background: s.bg, color: s.color }}>{s.label}</span>
        </div>
        <p className="text-xs text-gray-400 mb-1">
          {[a.patient_age && `${a.patient_age} yrs`, a.patient_gender, a.patient_phone].filter(Boolean).join(' · ')}
        </p>
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
        {a.chief_complaint && <p className="text-gray-400 text-xs mt-1 italic truncate">"{a.chief_complaint}"</p>}
      </div>
      <div className="flex gap-2 flex-shrink-0">
        {a.prescription_id ? (
          <Link to={`/prescription/${a.prescription_id}`}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg text-white transition"
            style={{ background: 'linear-gradient(135deg, #059669, #0891b2)' }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Rx
          </Link>
        ) : a.status === 'confirmed' ? (
          <Link to={`/prescription/write/${a.id}`}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg text-white transition"
            style={{ background: 'linear-gradient(135deg, #0B2149, #1a4a8a)' }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Write Rx
          </Link>
        ) : null}
      </div>
    </div>
  );
}

/* ── Patient Card ── */
function PatientCard({ p, onOpen }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
             style={{ background: 'linear-gradient(135deg, #0B2149, #1a4a8a)' }}>
          {p.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900">{p.name}</h3>
          <p className="text-gray-500 text-xs mt-0.5">
            {[p.age && `${p.age} yrs`, p.gender].filter(Boolean).join(' · ')}
          </p>
          {p.phone && <p className="text-gray-400 text-xs">{p.phone}</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
          {p.total_appointments} Visit{p.total_appointments !== 1 ? 's' : ''}
        </span>
        <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: '#d1fae5', color: '#065f46' }}>
          {p.completed_count} Completed
        </span>
        {p.upcoming_count > 0 && (
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: '#fef3c7', color: '#92400e' }}>
            {p.upcoming_count} Upcoming
          </span>
        )}
      </div>

      {p.last_visit && (
        <p className="text-gray-400 text-xs mb-3">Last visit: {fmtDate(p.last_visit)}</p>
      )}

      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button onClick={() => onOpen(p)}
          className="flex-1 text-sm font-semibold py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition">
          History
        </button>
        {p.latest_prescription_id && (
          <Link to={`/prescription/${p.latest_prescription_id}`}
            className="flex-1 text-sm font-semibold py-2 rounded-xl text-center text-white transition hover:shadow"
            style={{ background: 'linear-gradient(135deg, #059669, #0891b2)' }}>
            Latest Rx
          </Link>
        )}
        {p.latest_appointment_id && !p.latest_prescription_id && (
          <Link to={`/prescription/write/${p.latest_appointment_id}`}
            className="flex-1 text-sm font-semibold py-2 rounded-xl text-center text-white transition hover:shadow"
            style={{ background: 'linear-gradient(135deg, #0B2149, #1a4a8a)' }}>
            Write Rx
          </Link>
        )}
      </div>
    </div>
  );
}

/* ── Patient History Modal ── */
function PatientModal({ data, onClose }) {
  const { patient: p, history } = data;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col"
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, #0B2149, #1a4a8a)' }}>
            {p.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900">{p.name}</h2>
            <p className="text-gray-500 text-sm">
              {[p.age && `${p.age} yrs`, p.gender, p.phone].filter(Boolean).join(' · ')}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Appointment History ({history.length})
          </p>
          {history.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm">No appointment history found.</p>
            </div>
          )}
          <div className="space-y-3">
            {history.map(a => {
              const s = STATUS[a.status] || { label: a.status, bg: '#f3f4f6', color: '#374151' };
              return (
                <div key={a.id} className="border border-gray-100 rounded-xl p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-800 text-sm">
                        {fmtDate(a.appointment_date)} · {fmtTime(a.appointment_time)}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    </div>
                    {a.chief_complaint && (
                      <p className="text-gray-400 text-xs mt-0.5 italic truncate">"{a.chief_complaint}"</p>
                    )}
                  </div>
                  {a.prescription_id ? (
                    <Link to={`/prescription/${a.prescription_id}`} onClick={onClose}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white flex-shrink-0 transition"
                      style={{ background: 'linear-gradient(135deg, #059669, #0891b2)' }}>
                      View Rx
                    </Link>
                  ) : a.status === 'confirmed' ? (
                    <Link to={`/prescription/write/${a.id}`} onClick={onClose}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white flex-shrink-0 transition"
                      style={{ background: 'linear-gradient(135deg, #0B2149, #1a4a8a)' }}>
                      Write Rx
                    </Link>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-9 h-9 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-3xl mx-auto mb-4">📭</div>
      <p className="text-gray-500 text-sm">{text}</p>
    </div>
  );
}
