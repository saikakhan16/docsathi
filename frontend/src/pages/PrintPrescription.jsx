import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PrintPrescription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rx,      setRx]      = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/prescriptions/${id}`)
      .then(r => { setRx(r.data); setLoading(false); })
      .catch(() => navigate('/'));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading prescription…</div>;

  const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const sympDuration = (from, to) => {
    if (!from) return '';
    const a = new Date(from);
    const b = to ? new Date(to) : new Date();
    const days = Math.round((b - a) / (1000 * 60 * 60 * 24));
    if (days <= 0)  return 'today';
    if (days === 1) return '1 day';
    if (days < 7)   return `${days} days`;
    if (days < 14)  return '1 week';
    if (days < 30)  return `${Math.round(days / 7)} weeks`;
    if (days < 60)  return '1 month';
    return `${Math.round(days / 30)} months`;
  };
  const fmtTime = (t) => {
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour < 12 ? 'AM' : 'PM'}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      {/* Action bar */}
      <div className="no-print flex justify-center gap-3 mb-6">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-full font-semibold shadow transition flex items-center gap-2"
        >
          🖨️ Print Prescription
        </button>
        <button
          onClick={() => navigate(-1)}
          className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 py-2.5 rounded-full font-medium shadow transition"
        >
          ← Back
        </button>
      </div>

      {/* Prescription Paper */}
      <div className="prescription-paper max-w-2xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden print:rounded-none" style={{ fontFamily: "'Times New Roman', Times, serif" }}>

        {/* ── HEADER ── */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-8 py-5">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold tracking-wide">{rx.doctor_name}</h1>
              <p className="text-blue-200 font-medium text-base mt-0.5">{rx.specialization}</p>
              <p className="text-blue-300 text-sm">{rx.qualification}</p>
            </div>
            <div className="text-right text-sm">
              <div className="bg-white text-blue-700 font-bold px-3 py-1 rounded-lg text-base mb-2 inline-block">DocSathi</div>
              <p className="text-blue-200">Reg No: {rx.registration_no}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-600 text-sm text-blue-200">
            <span>🏥 {rx.clinic_name}</span>
            {rx.clinic_address && <span className="ml-4">📍 {rx.clinic_address}</span>}
          </div>
        </div>

        <div className="px-8 py-6 space-y-5">

          {/* ── PATIENT INFO ── */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <InfoRow label="Patient Name" value={rx.patient_name} />
              <InfoRow label="Date" value={`${fmtDate(rx.appointment_date)} · ${fmtTime(rx.appointment_time)}`} />
              <InfoRow label="Age" value={rx.patient_age ? `${rx.patient_age} Years` : 'N/A'} />
              <InfoRow label="Gender" value={rx.patient_gender ? rx.patient_gender.charAt(0).toUpperCase() + rx.patient_gender.slice(1) : 'N/A'} />
              {rx.patient_phone && <InfoRow label="Phone" value={rx.patient_phone} />}
            </div>
          </div>

          {/* ── SYMPTOMS ── */}
          {(rx.symptoms || rx.symptoms_since) && (
            <RxSection title="Chief Complaint / Symptoms">
              {rx.symptoms && <p className="text-gray-800 leading-relaxed mb-2">{rx.symptoms}</p>}
              {rx.symptoms_since && (
                <div className="flex flex-wrap gap-3 mt-1">
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                    Onset: {fmtDate(rx.symptoms_since)}
                    <span className="text-blue-500 font-normal">({sympDuration(rx.symptoms_since, rx.symptoms_till)})</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                    {rx.symptoms_till
                      ? <>Resolved: {fmtDate(rx.symptoms_till)}</>
                      : <>Status: <span className="text-orange-600 font-semibold">Ongoing</span></>}
                  </span>
                </div>
              )}
            </RxSection>
          )}

          {/* ── DIAGNOSIS ── */}
          {rx.diagnosis && (
            <RxSection title="Diagnosis">
              <p className="text-gray-900 font-semibold text-base">{rx.diagnosis}</p>
            </RxSection>
          )}

          {/* ── LAB TESTS ── */}
          {rx.lab_tests?.length > 0 && (
            <RxSection title="Lab Investigations">
              <ul className="space-y-1.5">
                {rx.lab_tests.map((t, i) => (
                  <li key={t.id} className="flex items-start gap-2">
                    <span className="text-blue-700 font-bold text-sm w-5 flex-shrink-0">{i + 1}.</span>
                    <span className="text-gray-800 font-medium">{t.test_name}</span>
                    {t.notes && <span className="text-gray-500 text-sm">— {t.notes}</span>}
                  </li>
                ))}
              </ul>
            </RxSection>
          )}

          {/* ── MEDICINES ── */}
          {rx.medicines?.length > 0 && (
            <RxSection title={<span className="flex items-center gap-1"><span className="text-blue-700 text-xl font-serif">℞</span> Medications</span>}>
              <div className="space-y-3">
                {rx.medicines.map((m, i) => (
                  <div key={m.id} className="border-l-4 border-blue-500 pl-4 py-1">
                    <p className="font-bold text-gray-900 text-base">
                      <span className="text-blue-600 mr-1">{i + 1}.</span>{m.medicine_name}
                    </p>
                    <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 mt-0.5">
                      {m.dosage    && <span>Dose: <strong>{m.dosage}</strong></span>}
                      {m.frequency && <span>Freq: <strong>{m.frequency}</strong></span>}
                      {m.duration  && <span>For: <strong>{m.duration}</strong></span>}
                    </div>
                    {m.instructions && (
                      <p className="text-sm text-gray-500 italic mt-0.5">↳ {m.instructions}</p>
                    )}
                  </div>
                ))}
              </div>
            </RxSection>
          )}

          {/* ── NOTES ── */}
          {rx.notes && (
            <RxSection title="Advice / Instructions">
              <p className="text-gray-800 leading-relaxed">{rx.notes}</p>
            </RxSection>
          )}

          {/* ── FOOTER ── */}
          <div className="border-t-2 border-gray-300 pt-5 flex items-end justify-between mt-4">
            <div className="text-sm text-gray-500">
              {rx.follow_up_date && (
                <p>
                  <span className="font-semibold text-gray-700">Follow-up:</span>{' '}
                  {fmtDate(rx.follow_up_date)}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400">Generated via DocSathi · {fmtDate(rx.created_at)}</p>
            </div>

            <div className="text-center">
              <div className="h-10 border-b-2 border-gray-400 w-44 mb-1" />
              <p className="font-semibold text-gray-800 text-sm">{rx.doctor_name}</p>
              <p className="text-gray-500 text-xs">{rx.specialization}</p>
              <p className="text-gray-400 text-xs">{rx.registration_no}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <span className="text-gray-500 text-xs uppercase tracking-wide">{label}</span>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function RxSection({ title, children }) {
  return (
    <div>
      <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-2 flex items-center gap-1">
        <span className="inline-block w-6 h-0.5 bg-blue-600 mr-1"></span>
        {title}
      </h3>
      {children}
    </div>
  );
}
