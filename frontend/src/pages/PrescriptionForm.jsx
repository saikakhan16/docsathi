import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MEDICINES_LIST, LAB_TESTS_LIST, DOSAGE_PRESETS, DURATION_PRESETS } from '../data/medicalData';

const EMPTY_MED  = { name: '', dosage: '', frequency: '', duration: '', instructions: '' };
const EMPTY_TEST = { name: '', notes: '' };

const FREQ_OPTIONS = [
  'Once daily (OD)',
  'Twice daily (BD)',
  'Three times daily (TID)',
  'Four times daily (QID)',
  'Morning & Evening',
  'Morning only',
  'Evening only',
  'At bedtime (HS)',
  'Every 8 hours',
  'Every 6 hours',
  'SOS / As needed',
  'Before meals',
  'After meals',
  'With meals',
];

function daysBetween(from, to) {
  if (!from) return null;
  const a = new Date(from);
  const b = to ? new Date(to) : new Date();
  const diff = Math.round((b - a) / (1000 * 60 * 60 * 24));
  if (diff < 0) return null;
  if (diff === 0) return 'Today';
  if (diff === 1) return '1 day';
  if (diff < 7)  return `${diff} days`;
  if (diff < 14) return '1 week';
  if (diff < 30) return `${Math.round(diff / 7)} weeks`;
  if (diff < 60) return '1 month';
  return `${Math.round(diff / 30)} months`;
}

export default function PrescriptionForm() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [form, setForm] = useState({
    symptoms:       '',
    symptoms_since: '',
    symptoms_till:  '',
    till_ongoing:   true,
    diagnosis:      '',
    notes:          '',
    follow_up_date: '',
    medicines:  [{ ...EMPTY_MED }],
    lab_tests:  [{ ...EMPTY_TEST }],
  });
  const [busy,    setBusy]    = useState(false);
  const [error,   setError]   = useState('');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    axios.get('/api/appointments/my').then(r => {
      const appt = r.data.find(a => a.id === parseInt(appointmentId));
      if (!appt) { navigate('/doctor/dashboard'); return; }
      setAppointment(appt);
      // Fetch this patient's previous history
      if (appt.patient_id) {
        setHistoryLoading(true);
        axios.get(`/api/patients/${appt.patient_id}/full-history`, {
          params: { exclude_appointment: appointmentId }
        }).then(r => { setHistory(r.data); setHistoryLoading(false); });
      }
    });
  }, [appointmentId]);

  const setField = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  const setCheck = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.checked }));

  const setMed  = (i, field) => (e) => setForm(f => ({ ...f, medicines: f.medicines.map((m, idx) => idx === i ? { ...m, [field]: e.target.value } : m) }));
  const addMed  = () => setForm(f => ({ ...f, medicines: [...f.medicines, { ...EMPTY_MED }] }));
  const remMed  = (i) => setForm(f => ({ ...f, medicines: f.medicines.filter((_, idx) => idx !== i) }));

  const setTest = (i, field) => (e) => setForm(f => ({ ...f, lab_tests: f.lab_tests.map((t, idx) => idx === i ? { ...t, [field]: e.target.value } : t) }));
  const addTest = () => setForm(f => ({ ...f, lab_tests: [...f.lab_tests, { ...EMPTY_TEST }] }));
  const remTest = (i) => setForm(f => ({ ...f, lab_tests: f.lab_tests.filter((_, idx) => idx !== i) }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.diagnosis.trim()) return setError('Diagnosis is required');
    setBusy(true); setError('');
    try {
      const { data } = await axios.post('/api/prescriptions', {
        appointment_id:  parseInt(appointmentId),
        symptoms:        form.symptoms,
        symptoms_since:  form.symptoms_since || null,
        symptoms_till:   form.till_ongoing ? null : (form.symptoms_till || null),
        diagnosis:       form.diagnosis,
        notes:           form.notes,
        follow_up_date:  form.follow_up_date || null,
        medicines:  form.medicines.filter(m => m.name.trim()),
        lab_tests:  form.lab_tests.filter(t => t.name.trim()),
      });
      navigate(`/prescription/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save prescription');
    } finally { setBusy(false); }
  };

  if (!appointment) return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading…</div>;

  const fmtApptDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fmtTime     = (t) => { const [h, m] = t.split(':'); const hour = parseInt(h); return `${hour % 12 || 12}:${m} ${hour < 12 ? 'AM' : 'PM'}`; };

  const duration = daysBetween(form.symptoms_since, form.till_ongoing ? null : form.symptoms_till);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Datalists for autocomplete */}
      <datalist id="medicines-list">
        {MEDICINES_LIST.map(m => <option key={m} value={m} />)}
      </datalist>
      <datalist id="tests-list">
        {LAB_TESTS_LIST.map(t => <option key={t} value={t} />)}
      </datalist>
      <datalist id="dosage-list">
        {DOSAGE_PRESETS.map(d => <option key={d} value={d} />)}
      </datalist>
      <datalist id="duration-list">
        {DURATION_PRESETS.map(d => <option key={d} value={d} />)}
      </datalist>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Write Prescription</h1>

        {/* Patient card */}
        <div className="bg-white rounded-2xl shadow p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">🧑</div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">{appointment.patient_name}</h2>
            <p className="text-gray-500 text-sm">
              {appointment.patient_age ? `${appointment.patient_age} yrs` : ''}
              {appointment.patient_gender ? ` · ${appointment.patient_gender}` : ''}
              {appointment.patient_phone ? ` · ${appointment.patient_phone}` : ''}
            </p>
            <p className="text-gray-500 text-sm">📅 {fmtApptDate(appointment.appointment_date)} · 🕐 {fmtTime(appointment.appointment_time)}</p>
            {appointment.chief_complaint && (
              <p className="text-gray-500 text-sm mt-1 italic">"{appointment.chief_complaint}"</p>
            )}
          </div>
        </div>

        {/* ── PATIENT HISTORY ── */}
        <PatientHistory history={history} loading={historyLoading} />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-5">{error}</div>
        )}

        <form onSubmit={submit} className="space-y-6">

          {/* ── SYMPTOMS ── */}
          <Section title="Symptoms / Chief Complaint" icon="🤒">
            <textarea
              rows={3}
              value={form.symptoms}
              onChange={setField('symptoms')}
              placeholder="Describe patient's symptoms in detail (e.g. Fever, cough, body ache…)"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />

            {/* Symptom duration */}
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Symptom Duration</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Onset Date
                  </label>
                  <input
                    type="date"
                    value={form.symptoms_since}
                    onChange={setField('symptoms_since')}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Resolution Date
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="ongoing"
                      checked={form.till_ongoing}
                      onChange={setCheck('till_ongoing')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="ongoing" className="text-sm text-gray-600">Symptoms ongoing</label>
                  </div>
                  {!form.till_ongoing && (
                    <input
                      type="date"
                      value={form.symptoms_till}
                      onChange={setField('symptoms_till')}
                      min={form.symptoms_since || undefined}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  )}
                </div>
              </div>

              {duration && (
                <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
                  Duration: {duration}{form.till_ongoing && <span className="font-normal text-blue-500"> · ongoing</span>}
                </div>
              )}
            </div>
          </Section>

          {/* ── DIAGNOSIS ── */}
          <Section title="Diagnosis *" icon="🔬">
            <input
              type="text" required
              value={form.diagnosis}
              onChange={setField('diagnosis')}
              placeholder="e.g. Viral Upper Respiratory Tract Infection"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Section>

          {/* ── LAB TESTS ── */}
          <Section title="Lab Investigations" icon="🧪">
            <p className="text-xs text-gray-400 mb-2">Type test name — common tests will appear as suggestions</p>
            <div className="space-y-2">
              {form.lab_tests.map((t, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                  <input
                    list="tests-list"
                    value={t.name}
                    onChange={setTest(i, 'name')}
                    placeholder="Test name (e.g. CBC, Blood Sugar, X-Ray…)"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <input
                    type="text"
                    value={t.notes}
                    onChange={setTest(i, 'notes')}
                    placeholder="Notes"
                    className="w-36 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <button
                    type="button" onClick={() => remTest(i)}
                    disabled={form.lab_tests.length === 1}
                    className="text-red-400 hover:text-red-600 disabled:text-gray-300 text-xl leading-none px-1"
                  >✕</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addTest}
              className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1">
              + Add Test
            </button>
          </Section>

          {/* ── MEDICINES ── */}
          <Section title="Medications (Rx)" icon="💊">
            <p className="text-xs text-gray-400 mb-3">Type medicine name — pre-listed medicines will appear as suggestions</p>
            <div className="space-y-3">
              {form.medicines.map((m, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-2">
                  {/* Medicine name */}
                  <div className="flex gap-2 items-center">
                    <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                    <input
                      list="medicines-list"
                      value={m.name}
                      onChange={setMed(i, 'name')}
                      placeholder="Medicine name (e.g. Paracetamol 500mg)"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    />
                    <button type="button" onClick={() => remMed(i)}
                      disabled={form.medicines.length === 1}
                      className="text-red-400 hover:text-red-600 disabled:text-gray-300 text-xl leading-none">✕</button>
                  </div>

                  {/* Dosage / Frequency / Duration */}
                  <div className="grid grid-cols-3 gap-2 pl-9">
                    <input
                      list="dosage-list"
                      value={m.dosage}
                      onChange={setMed(i, 'dosage')}
                      placeholder="Dosage"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    />
                    <select value={m.frequency} onChange={setMed(i, 'frequency')}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                      <option value="">Frequency</option>
                      {FREQ_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <input
                      list="duration-list"
                      value={m.duration}
                      onChange={setMed(i, 'duration')}
                      placeholder="Duration"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    />
                  </div>

                  {/* Instructions */}
                  <div className="pl-9">
                    <input type="text" value={m.instructions} onChange={setMed(i, 'instructions')}
                      placeholder="Special instructions (e.g. After meals, with warm water)"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addMed}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
              + Add Medicine
            </button>
          </Section>

          {/* ── ADVICE & FOLLOW-UP ── */}
          <Section title="Advice / Notes" icon="📝">
            <textarea rows={3} value={form.notes} onChange={setField('notes')}
              placeholder="General advice, diet, rest, precautions…"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date (optional)</label>
              <input type="date" value={form.follow_up_date} onChange={setField('follow_up_date')}
                min={new Date().toISOString().split('T')[0]}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </Section>

          <div className="flex gap-3 pb-4">
            <button type="button" onClick={() => navigate('/doctor/dashboard')}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition">
              Cancel
            </button>
            <button type="submit" disabled={busy}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition">
              {busy ? 'Saving…' : '💾 Save & Generate Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Patient History Panel ── */
function PatientHistory({ history, loading }) {
  const [expanded,  setExpanded]  = useState(null);
  const [showAll,   setShowAll]   = useState(false);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow p-5 mb-0 flex items-center gap-3 text-gray-400 text-sm">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        Loading patient history…
      </div>
    );
  }

  const completed = history.filter(h => h.prescription_id);

  if (history.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
        <span className="text-2xl">📋</span>
        <p className="text-amber-700 text-sm font-medium">No previous visits with you — this is the patient's first prescription.</p>
      </div>
    );
  }

  const visible = showAll ? history : history.slice(0, 3);

  const fmtD = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📋</span>
          <h3 className="font-bold text-indigo-900">Previous Visit History</h3>
          <span className="bg-indigo-200 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-full">
            {history.length} visit{history.length !== 1 ? 's' : ''}
          </span>
          {completed.length > 0 && (
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {completed.length} Rx
            </span>
          )}
        </div>
      </div>

      {/* Visit list */}
      <div className="divide-y divide-gray-100">
        {visible.map((v) => {
          const isOpen = expanded === v.id;
          const hasPrescription = !!v.prescription_id;

          return (
            <div key={v.id}>
              {/* Row */}
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : v.id)}
                className="w-full text-left px-5 py-4 hover:bg-gray-50 transition flex items-start gap-3"
              >
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${hasPrescription ? 'bg-green-500' : 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800 text-sm">{fmtD(v.appointment_date)}</span>
                    {hasPrescription
                      ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Prescription written</span>
                      : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">No prescription</span>
                    }
                  </div>
                  {v.diagnosis && (
                    <p className="text-gray-700 text-sm mt-0.5 font-medium">Dx: {v.diagnosis}</p>
                  )}
                  {v.chief_complaint && !v.diagnosis && (
                    <p className="text-gray-500 text-sm mt-0.5 italic">"{v.chief_complaint}"</p>
                  )}
                  {!isOpen && hasPrescription && v.medicines?.length > 0 && (
                    <p className="text-gray-400 text-xs mt-1">
                      💊 {v.medicines.slice(0, 2).map(m => m.medicine_name).join(', ')}
                      {v.medicines.length > 2 && ` +${v.medicines.length - 2} more`}
                    </p>
                  )}
                </div>
                <span className="text-gray-400 text-sm flex-shrink-0">{isOpen ? '▲' : '▼'}</span>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="px-5 pb-5 bg-gray-50 space-y-3">
                  {v.chief_complaint && (
                    <Detail label="Chief Complaint" value={v.chief_complaint} />
                  )}
                  {v.symptoms && (
                    <Detail label="Symptoms" value={v.symptoms} />
                  )}
                  {v.symptoms_since && (
                    <Detail label="Duration" value={`Since ${fmtD(v.symptoms_since)}${v.symptoms_till ? ` → ${fmtD(v.symptoms_till)}` : ' (ongoing)'}`} />
                  )}
                  {v.diagnosis && (
                    <Detail label="Diagnosis" value={v.diagnosis} bold />
                  )}

                  {v.lab_tests?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Lab Tests</p>
                      <div className="flex flex-wrap gap-1.5">
                        {v.lab_tests.map((t, i) => (
                          <span key={i} className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-full border border-purple-200">
                            {t.test_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {v.medicines?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Medicines</p>
                      <div className="space-y-1">
                        {v.medicines.map((m, i) => (
                          <div key={i} className="flex flex-wrap items-center gap-x-3 text-sm bg-white rounded-lg px-3 py-2 border border-gray-200">
                            <span className="font-semibold text-gray-800">💊 {m.medicine_name}</span>
                            {m.dosage    && <span className="text-gray-500 text-xs">{m.dosage}</span>}
                            {m.frequency && <span className="text-gray-500 text-xs">{m.frequency}</span>}
                            {m.duration  && <span className="text-gray-500 text-xs">· {m.duration}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {v.notes && <Detail label="Advice" value={v.notes} />}
                  {v.follow_up_date && <Detail label="Follow-up" value={fmtD(v.follow_up_date)} />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show more */}
      {history.length > 3 && (
        <button type="button" onClick={() => setShowAll(s => !s)}
          className="w-full text-center py-3 text-sm text-blue-600 hover:text-blue-700 font-medium border-t hover:bg-blue-50 transition">
          {showAll ? '▲ Show less' : `▼ Show ${history.length - 3} more visit${history.length - 3 !== 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  );
}

function Detail({ label, value, bold }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-sm mt-0.5 ${bold ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{value}</p>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}
