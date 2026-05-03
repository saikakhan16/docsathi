import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_DOCTORS = [
  { name: 'Dr. Arjun Sharma',  spec: 'Cardiologist',       email: 'arjun.sharma@docsathi.com' },
  { name: 'Dr. Priya Patel',   spec: 'General Physician',  email: 'priya.patel@docsathi.com' },
  { name: 'Dr. Rahul Mehta',   spec: 'Dermatologist',      email: 'rahul.mehta@docsathi.com' },
  { name: 'Dr. Sunita Rao',    spec: 'Pediatrician',       email: 'sunita.rao@docsathi.com' },
  { name: 'Dr. Vikram Singh',  spec: 'Orthopedic',         email: 'vikram.singh@docsathi.com' },
  { name: 'Dr. Meera Nair',    spec: 'Gynecologist',       email: 'meera.nair@docsathi.com' },
];

const SPEC_COLORS = [
  { bg: '#fff0f0', color: '#e02424' },
  { bg: '#f0fdf4', color: '#16a34a' },
  { bg: '#eff6ff', color: '#2563eb' },
  { bg: '#fdf4ff', color: '#9333ea' },
  { bg: '#fff7ed', color: '#ea580c' },
  { bg: '#f0fdfa', color: '#0d9488' },
];

export default function Login() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'doctor' ? 'doctor' : 'patient';

  const [role,  setRole]  = useState(initialRole);
  const [form,  setForm]  = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy,  setBusy]  = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    setForm({ email: '', password: '' });
    setError('');
  }, [role]);

  const fillDemo = (email) => setForm({ email, password: 'doctor123' });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const user = await login(form.email, form.password);
      if (role === 'doctor' && user.role !== 'doctor')
        return setError('This account is not a doctor account.');
      navigate(user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally { setBusy(false); }
  };

  const isDoctor = role === 'doctor';

  return (
    <div className="min-h-screen flex" style={{ background: '#f8fafc' }}>

      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-12 text-white relative overflow-hidden"
           style={{ background: 'linear-gradient(160deg, #0B2149 0%, #0d3272 50%, #0a5c9e 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-5 w-48 h-48 rounded-full bg-blue-300 blur-2xl" />
        </div>
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-lg">D</div>
            <span className="text-xl font-bold text-white">DocSathi</span>
          </Link>

          <h2 className="text-4xl font-bold leading-tight mb-4">
            {isDoctor ? 'Welcome back,\nDoctor' : 'Your health,\nour priority'}
          </h2>
          <p className="text-blue-200 text-base leading-relaxed mb-10">
            {isDoctor
              ? 'Access your dashboard, manage appointments, and write digital prescriptions.'
              : 'Book appointments with top specialists and manage your health records in one place.'}
          </p>

          <div className="space-y-4">
            {[
              { icon: '🏥', text: '500+ verified doctors' },
              { icon: '📅', text: 'Easy appointment booking' },
              { icon: '💊', text: 'Digital prescriptions' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center text-lg">{item.icon}</div>
                <span className="text-blue-100 text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-blue-300 text-xs">© 2024 DocSathi. All rights reserved.</p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                 style={{ background: '#0B2149' }}>D</div>
            <span className="text-lg font-bold" style={{ color: '#0B2149' }}>DocSathi</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {isDoctor ? 'Doctor Sign In' : 'Welcome back'}
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            {isDoctor ? 'Sign in to your doctor portal' : 'Sign in to manage your appointments'}
          </p>

          {/* Role Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8 gap-1">
            <button type="button" onClick={() => setRole('patient')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                !isDoctor ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}>
              Patient
            </button>
            <button type="button" onClick={() => setRole('doctor')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isDoctor ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}>
              Doctor Portal
            </button>
          </div>

          {/* Doctor Quick-Fill */}
          {isDoctor && (
            <div className="mb-6 rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Demo Doctors — click to fill</p>
                <p className="text-xs text-gray-400 mt-0.5">Password for all: <strong>doctor123</strong></p>
              </div>
              <div className="divide-y divide-gray-100">
                {DEMO_DOCTORS.map((d, i) => (
                  <button key={d.email} type="button" onClick={() => fillDemo(d.email)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-left">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                         style={{ background: SPEC_COLORS[i].bg, color: SPEC_COLORS[i].color }}>
                      {d.name.split(' ')[1].charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{d.name}</p>
                      <p className="text-xs text-gray-400">{d.spec}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                placeholder={isDoctor ? 'doctor@docsathi.com' : 'you@example.com'} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input type="password" required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                placeholder="••••••••" />
            </div>

            <button type="submit" disabled={busy}
              className="w-full text-white font-semibold py-3.5 rounded-xl transition-all hover:shadow-lg hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              style={{ background: isDoctor ? 'linear-gradient(135deg, #0d9488, #0891b2)' : 'linear-gradient(135deg, #0B2149, #1a4a8a)' }}>
              {busy ? 'Signing in…' : isDoctor ? 'Sign in to Doctor Portal' : 'Sign In'}
            </button>
          </form>

          {!isDoctor && (
            <p className="text-center text-sm text-gray-500 mt-6">
              New to DocSathi?{' '}
              <Link to="/register" className="font-semibold hover:underline" style={{ color: '#0B2149' }}>Create account</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
