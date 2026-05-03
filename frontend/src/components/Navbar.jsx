import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm no-print sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 py-0">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg font-bold"
                 style={{ background: 'linear-gradient(135deg, #0B2149 0%, #1a4a8a 100%)' }}>
              D
            </div>
            <span className="text-xl font-bold" style={{ color: '#0B2149' }}>
              Doc<span className="text-blue-500">Sathi</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {!user && (
              <>
                <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">Home</Link>
                <Link to="/#doctors" className="text-gray-600 hover:text-blue-600 transition-colors">Find Doctors</Link>
                {/* <Link to="/#about" className="text-gray-600 hover:text-blue-600 transition-colors">About</Link> */}
              </>
            )}
            {user?.role === 'patient' && (
              <>
                <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">Find Doctors</Link>
                <Link to="/patient/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">My Appointments</Link>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {!user && (
              <>
                <Link to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                  Sign In
                </Link>
                <Link to="/register"
                  className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:-translate-y-px"
                  style={{ background: 'linear-gradient(135deg, #0B2149, #1a4a8a)' }}>
                  Get Started
                </Link>
                <Link to="/login?role=doctor"
                  className="text-sm font-semibold px-5 py-2.5 rounded-xl border-2 transition-all hover:shadow"
                  style={{ borderColor: '#0B2149', color: '#0B2149' }}>
                  Doctor Portal
                </Link>
              </>
            )}

            {user && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                       style={{ background: user.role === 'doctor' ? 'linear-gradient(135deg, #0d9488, #0891b2)' : 'linear-gradient(135deg, #0B2149, #1a4a8a)' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: user.role === 'doctor' ? '#ccfbf1' : '#dbeafe', color: user.role === 'doctor' ? '#0d9488' : '#1d4ed8' }}>
                    {user.role}
                  </span>
                </div>
                <button onClick={handleLogout}
                  className="text-sm font-medium text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg transition-colors">
                  Sign out
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                  onClick={() => setMenuOpen(o => !o)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-2">
            {!user && (
              <>
                <Link to="/" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Home</Link>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Sign In</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Register</Link>
                <Link to="/login?role=doctor" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm font-semibold rounded-lg"
                      style={{ color: '#0B2149', background: '#f0f4ff' }}>Doctor Portal</Link>
              </>
            )}
            {user?.role === 'patient' && (
              <>
                <Link to="/" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Find Doctors</Link>
                <Link to="/patient/dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">My Appointments</Link>
              </>
            )}
            {user && (
              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                Sign out
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
