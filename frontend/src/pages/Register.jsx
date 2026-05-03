import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form,  setForm]  = useState({ name: '', email: '', password: '', phone: '', age: '', gender: '' });
  const [error, setError] = useState('');
  const [busy,  setBusy]  = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await register(form);
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setBusy(false); }
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 focus:bg-white";

  return (
    <div className="min-h-screen flex" style={{ background: '#f8fafc' }}>

      {/* Left Panel */}
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
            Join thousands of<br />patients today
          </h2>
          <p className="text-blue-200 text-base leading-relaxed mb-10">
            Create your free account and get access to top doctors across all specializations.
          </p>

          <div className="space-y-4">
            {[
              { icon: '✅', text: 'Free account, always' },
              { icon: '🔒', text: 'Secure & private records' },
              { icon: '📱', text: 'Book in under 2 minutes' },
              { icon: '💊', text: 'Digital prescriptions saved' },
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

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                 style={{ background: '#0B2149' }}>D</div>
            <span className="text-lg font-bold" style={{ color: '#0B2149' }}>DocSathi</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm mb-8">Fill in the details below to get started</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-400">*</span></label>
              <input type="text" required value={form.name} onChange={set('name')}
                className={inputClass} placeholder="Rahul Kumar" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address <span className="text-red-400">*</span></label>
              <input type="email" required value={form.email} onChange={set('email')}
                className={inputClass} placeholder="you@example.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password <span className="text-red-400">*</span></label>
              <input type="password" required minLength={6} value={form.password} onChange={set('password')}
                className={inputClass} placeholder="Minimum 6 characters" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input type="tel" value={form.phone} onChange={set('phone')}
                  className={inputClass} placeholder="9876543210" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Age</label>
                <input type="number" min="1" max="120" value={form.age} onChange={set('age')}
                  className={inputClass} placeholder="25" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
              <select value={form.gender} onChange={set('gender')} className={inputClass + ' bg-gray-50'}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button type="submit" disabled={busy}
              className="w-full text-white font-semibold py-3.5 rounded-xl transition-all hover:shadow-lg hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-2"
              style={{ background: 'linear-gradient(135deg, #0B2149, #1a4a8a)' }}>
              {busy ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: '#0B2149' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
