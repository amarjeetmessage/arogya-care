import React, { useEffect, useState } from 'react';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  Stethoscope,
  Building2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ASSETS } from '../data/mockData';
import { BrandMark } from '../components/BrandMark';
import { UserRole } from '../types/healthcare';

export function AuthPage() {
  const {
    setPortalMode,
    loginWithCredentials,
    registerAccount,
    claimAdminPasscode,
    loginDemoRole,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('patient');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminConfigured, setAdminConfigured] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/auth/admin-status')
      .then((r) => r.json())
      .then((d) => setAdminConfigured(Boolean(d.adminConfigured)))
      .catch(() => setAdminConfigured(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      setLoading(true);
      if (role === 'hospital_admin') {
        const res = await claimAdminPasscode(
          fullName || 'Hospital Administrator',
          email,
          password
        );
        setLoading(false);
        if (!res.ok) setError(res.error || 'Could not claim admin setup.');
        return;
      }
      const res = await registerAccount(fullName, email, password, role);
      setLoading(false);
      if (!res.ok) setError(res.error || 'Registration failed.');
      return;
    }

    // Login flow
    setLoading(true);
    const res = await loginWithCredentials(email, password, role);
    setLoading(false);
    if (!res.ok) setError(res.error || 'Invalid email or password.');
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full mx-auto space-y-5">
        <button
          type="button"
          onClick={() => setPortalMode('landing')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Aarogya Care Home
        </button>

        {/* Split Authentication Card (Panel #2 Showcase Inspiration) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Brand & Welcome Panel */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <BrandMark label="Aarogya Care" inverted />
              <div className="space-y-2.5">
                <h1 className="font-display text-3xl font-bold leading-tight text-balance">
                  Welcome Back! Your health journey continues here.
                </h1>
                <p className="text-sm text-teal-100/90 leading-relaxed">
                  Secure role-based access for Patients, Doctors, and Hospital Care Teams across
                  India.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-3 flex items-center gap-3.5">
                <img
                  src={ASSETS.doctorMeera}
                  alt="Dr. Meera Sharma"
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />
                <div className="text-xs space-y-0.5">
                  <p className="font-semibold text-white">Verified Role-Based Access</p>
                  <p className="text-teal-100/80">
                    Encrypted password hashing & signed session tokens protect every account.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-teal-200">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Your medical records remain private under your control</span>
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-6">
            {/* Login / Register Segmented Tabs */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-center bg-slate-100 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors min-h-[40px] ${
                    mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors min-h-[40px] ${
                    mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Register
                </button>
              </div>
              <span className="text-xs text-slate-500 hidden sm:inline">
                Role-Based Access
              </span>
            </div>

            {/* Role Selector */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600">Select Account Role</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'patient' as const, label: 'Patient', icon: User },
                  { id: 'doctor' as const, label: 'Doctor', icon: Stethoscope },
                  { id: 'hospital_admin' as const, label: 'Hospital Admin', icon: Building2 },
                ].map((r) => {
                  const Icon = r.icon;
                  const active = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setRole(r.id);
                        setError(null);
                        if (r.id === 'hospital_admin' && !adminConfigured) {
                          setMode('register');
                        }
                      }}
                      className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold flex flex-col sm:flex-row items-center justify-center gap-1.5 min-h-[46px] transition-colors ${
                        active
                          ? 'border-teal-700 bg-teal-50 text-teal-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="whitespace-nowrap">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {role === 'hospital_admin' && !adminConfigured && (
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                First-run setup: Claim the Hospital Admin password below (minimum 8 characters), or
                use Instant Demo Access at the bottom.
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g., Ramesh Kumar Verma"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-teal-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password {mode === 'register' ? '(min 8 characters)' : ''}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-teal-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-teal-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm min-h-[48px] inline-flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === 'register'
                  ? role === 'hospital_admin'
                    ? 'Claim Admin Account & Enter'
                    : 'Create Account'
                  : 'Sign In Securely'}
              </button>
            </form>

            {/* Instant 1-Click Role Demo Entry */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <p className="text-xs font-medium text-slate-500 text-center">
                Or explore immediately with a server-verified Demo Account
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => loginDemoRole('patient', 'dashboard')}
                  className="py-2.5 px-3 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-50 text-teal-900 text-xs font-semibold min-h-[42px]"
                >
                  Patient Demo
                </button>
                <button
                  type="button"
                  onClick={() => loginDemoRole('doctor')}
                  className="py-2.5 px-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-900 text-xs font-semibold min-h-[42px]"
                >
                  Doctor Portal Demo
                </button>
                <button
                  type="button"
                  onClick={() => loginDemoRole('hospital_admin')}
                  className="py-2.5 px-3 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900 text-xs font-semibold min-h-[42px]"
                >
                  Hospital Admin Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
