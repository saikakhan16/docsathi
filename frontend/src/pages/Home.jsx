import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const SPEC_COLORS = {
  'Cardiologist':       ['#FF6B6B','#EE4444'],
  'General Physician':  ['#4ADE80','#16A34A'],
  'Dermatologist':      ['#F472B6','#DB2777'],
  'Pediatrician':       ['#60A5FA','#2563EB'],
  'Orthopedic Surgeon': ['#FBBF24','#D97706'],
  'Gynecologist':       ['#A78BFA','#7C3AED'],
};
const SPEC_ICONS = {
  'Cardiologist':'❤️','General Physician':'🩺','Dermatologist':'🧴',
  'Pediatrician':'👶','Orthopedic Surgeon':'🦴','Gynecologist':'👩‍⚕️',
};

const SPECIALIZATIONS = [
  'All Specializations','Cardiologist','General Physician','Dermatologist',
  'Pediatrician','Orthopedic Surgeon','Gynecologist',
];

export default function Home() {
  const [doctors,   setDoctors]   = useState([]);
  const [search,    setSearch]    = useState('');
  const [specFilter,setSpecFilter]= useState('All Specializations');
  const { user } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
  axios.get('/doctors').then(r => setDoctors(r.data)).catch(console.error);
}, []);

  const filtered = doctors.filter(d => {
    const matchSpec = specFilter === 'All Specializations' || d.specialization === specFilter;
    const matchSearch = !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase());
    return matchSpec && matchSearch;
  });

  const handleBook = (id) => {
    if (!user) return navigate('/login');
    if (user.role === 'doctor') return;
    navigate(`/book/${id}`);
  };

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── HERO ── */}
      <section className="bg-[#0B2149] relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-700/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-600/20 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />

        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Trusted Healthcare Platform
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
              Dedicated to Long Term <span className="text-blue-400">Health</span> and Well‑Being
            </h1>
            <p className="text-blue-200 text-lg leading-relaxed mb-8">
              At DocSathi, we provide patient-focused medical care backed by experienced doctors, modern technology, and evidence-based practices.
            </p>

            {/* Patient avatars trust badge */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex -space-x-2">
                {['S','R','A','M','P'].map((l,i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-[#0B2149] flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: `hsl(${210+i*20},70%,50%)` }}>{l}</div>
                ))}
              </div>
              <div>
                <p className="text-white font-bold text-sm">5.5k+ Happy Patients</p>
                <p className="text-blue-300 text-xs">Trusted by our community</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {!user && (
                <Link to="/register"
                  className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-7 py-3 rounded-xl transition shadow-lg shadow-blue-500/30">
                  Get Started Now
                </Link>
              )}
              <a href="#specialists"
                className="border border-blue-400/40 hover:border-blue-400 text-blue-200 hover:text-white font-semibold px-7 py-3 rounded-xl transition">
                View Specialists
              </a>
            </div>
          </div>

          {/* Right – visual */}
          <div className="hidden md:flex justify-center">
            <div className="relative">
              <div className="w-72 h-72 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-600/30 border border-blue-400/20 flex items-center justify-center">
                <div className="w-56 h-56 rounded-full bg-gradient-to-br from-blue-600/40 to-indigo-700/40 flex items-center justify-center text-8xl">
                  👨‍⚕️
                </div>
              </div>
              {/* Floating stat cards */}
              <div className="absolute -top-4 -right-8 bg-white rounded-2xl shadow-xl px-4 py-3 text-center min-w-[90px]">
                <p className="text-2xl font-bold text-[#0B2149]">10k+</p>
                <p className="text-gray-500 text-xs">Patients Treated</p>
              </div>
              <div className="absolute -bottom-4 -left-8 bg-white rounded-2xl shadow-xl px-4 py-3 text-center min-w-[90px]">
                <p className="text-2xl font-bold text-green-600">95%</p>
                <p className="text-gray-500 text-xs">Satisfaction Rate</p>
              </div>
              <div className="absolute top-1/2 -right-12 bg-white rounded-2xl shadow-xl px-4 py-3 text-center min-w-[80px]">
                <p className="text-2xl font-bold text-blue-600">60+</p>
                <p className="text-gray-500 text-xs">Expert Doctors</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div id="doctors" className="max-w-4xl mx-auto px-6 pb-10 relative z-10">
          <div className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2.5">
              <span className="text-gray-400">🔍</span>
              <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Search doctor or specialization…"
                className="flex-1 text-sm text-gray-700 outline-none placeholder-gray-400" />
            </div>
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2.5 min-w-[190px]">
              <span className="text-gray-400">🩺</span>
              <select value={specFilter} onChange={e=>setSpecFilter(e.target.value)}
                className="flex-1 text-sm text-gray-700 outline-none bg-transparent">
                {SPECIALIZATIONS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <button className="bg-[#0B2149] hover:bg-blue-900 text-white font-semibold px-7 py-2.5 rounded-xl transition">
              Search Doctor
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-4xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { val:'10k+', label:'Patients Treated', color:'text-blue-700' },
            { val:'95%',  label:'Patient Satisfaction', color:'text-green-600' },
            { val:'150+', label:'Appointments Done', color:'text-purple-600' },
            { val:'6',    label:'Expert Doctors', color:'text-orange-500' },
          ].map(s=>(
            <div key={s.label}>
              <p className={`text-3xl font-bold ${s.color}`}>{s.val}</p>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DOCTOR PORTAL BANNER ── */}
      {!user && (
        <section className="bg-gradient-to-r from-teal-600 to-cyan-600">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">👨‍⚕️</div>
              <div>
                <h2 className="text-white font-bold text-lg">Are you a registered Doctor?</h2>
                <p className="text-teal-100 text-sm">Manage appointments & generate prescriptions from your dashboard.</p>
              </div>
            </div>
            <Link to="/login?role=doctor"
              className="bg-white text-teal-700 hover:bg-teal-50 font-bold px-7 py-3 rounded-xl shadow transition whitespace-nowrap flex-shrink-0">
              Doctor Login →
            </Link>
          </div>
        </section>
      )}

      {/* ── OUR SPECIALISTS ── */}
      <section id="specialists" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2">Medical Experts</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0B2149]">Our Specialists</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Meet our team of qualified and experienced medical professionals dedicated to your health.
          </p>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🔍</div>
            <p>No doctors found matching your search.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(d => {
            const [c1,c2] = SPEC_COLORS[d.specialization] || ['#60A5FA','#2563EB'];
            return (
              <div key={d.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                {/* Top colored band + avatar */}
                <div className="h-24 relative flex items-end justify-center pb-0"
                  style={{ background: `linear-gradient(135deg, ${c1}22, ${c2}33)` }}>
                  <div className="absolute bottom-0 translate-y-1/2 w-20 h-20 rounded-2xl border-4 border-white shadow-md flex items-center justify-center text-4xl"
                    style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                    {SPEC_ICONS[d.specialization] || '👨‍⚕️'}
                  </div>
                </div>

                <div className="pt-14 px-5 pb-5 text-center">
                  <h3 className="font-bold text-gray-900 text-lg">{d.name}</h3>
                  <p className="font-semibold text-sm mt-0.5" style={{ color: c2 }}>{d.specialization}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{d.qualification}</p>

                  <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">⭐ <strong>{d.experience_years} yrs</strong> exp</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="flex items-center gap-1">🏥 {d.clinic_name}</span>
                  </div>

                  {/* Rating stars */}
                  <div className="flex items-center justify-center gap-0.5 mt-3">
                    {[1,2,3,4,5].map(i=>(
                      <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                    <span className="text-xs text-gray-500 ml-1">5.0</span>
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400">Consultation</p>
                      <p className="font-bold text-gray-900">₹{d.consultation_fee}</p>
                    </div>
                    {user?.role !== 'doctor' && (
                      <button onClick={() => handleBook(d.id)}
                        className="text-white font-semibold text-sm px-5 py-2 rounded-xl transition shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                        Book Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── TRUST SECTION ── */}
      <section className="bg-[#0B2149] py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-2">Patient Stories</p>
          <h2 className="text-3xl font-bold text-white mb-10">See Why Patients Trust Us</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { text: 'DocSathi made booking so easy. The prescription was clear and the doctor was very professional.', name: 'Priya S.', stars: 5 },
              { text: 'I love that I can see my complete prescription history anytime. Absolutely brilliant service!', name: 'Rahul M.', stars: 5 },
              { text: 'The best digital health experience. Booked, consulted, and got my prescription printed within minutes.', name: 'Aisha K.', stars: 5 },
            ].map((t,i)=>(
              <div key={i} className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-6 text-left">
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map(s=>(
                    <svg key={s} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-blue-100 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <p className="text-white font-semibold text-sm">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#081a38] text-blue-300 text-center py-6 text-sm">
        © {new Date().getFullYear()} DocSathi · Dedicated to Long Term Health and Well-Being
      </footer>
    </div>
  );
}
