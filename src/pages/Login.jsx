import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useAppStore } from '../store/appStore.js';
import { LogIn, Phone, Mail, Eye, EyeOff, ArrowRight, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [method, setMethod] = useState('mobile');
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotInput, setForgotInput] = useState('');

  const { login, googleLogin, loading } = useAuthStore();
  const { triggerToast, fetchRequests, fetchNotifications } = useAppStore();
  const navigate = useNavigate();

  const redirectByRole = (role) => {
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'volunteer') navigate('/volunteer/dashboard');
    else navigate('/donor/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credential || !password) { triggerToast('Please fill all fields.', 'warning'); return; }
    const res = await login(credential, password);
    if (res.success) {
      triggerToast('Welcome back to JeevaLink!', 'success');
      await fetchRequests();
      await fetchNotifications();
      redirectByRole(res.role);
    } else {
      triggerToast('Invalid credentials. Try again.', 'error');
    }
  };

  const handleGoogle = async () => {
    const res = await googleLogin('demo@gmail.com', 'Google Demo User');
    if (res.success) {
      triggerToast('Google sign-in successful!', 'success');
      redirectByRole(res.role);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
              <Droplets className="w-7 h-7 text-white fill-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">JeevaLink</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-5 leading-tight">
            Welcome Back,<br />Life Saver 🩸
          </h1>
          <p className="text-red-200 text-lg leading-relaxed mb-10">
            Sign in to check active blood requests, manage your donor profile, and keep saving lives.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[['12,847+', 'Donors'], ['4,521+', 'Lives Saved'], ['24/7', 'Emergency'], ['98%', 'Match Rate']].map(([v, l]) => (
              <div key={l} className="bg-white/15 rounded-2xl p-4 border border-white/20">
                <p className="text-2xl font-black text-white">{v}</p>
                <p className="text-red-200 text-sm">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Sign In</h2>
            <p className="text-sm text-gray-500 mt-1">Connecting Life • Sharing Hope</p>
          </div>

          {/* Tab */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
            {[['mobile', Phone, 'Mobile'], ['email', Mail, 'Email']].map(([val, Icon, label]) => (
              <button
                key={val}
                onClick={() => { setMethod(val); setCredential(''); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${method === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                {method === 'mobile' ? 'Mobile Number' : 'Email Address'}
              </label>
              <input
                type={method === 'mobile' ? 'tel' : 'email'}
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                placeholder={method === 'mobile' ? '9876543210' : 'you@example.com'}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 transition-colors"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                <button type="button" onClick={() => setForgotOpen(true)} className="text-xs text-primary font-bold hover:underline">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-gray-900 pr-10 transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="accent-primary" />
              <label htmlFor="remember" className="text-xs text-gray-600 font-semibold cursor-pointer">Remember me</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl shadow-xl shadow-red-200 transition-all disabled:opacity-60 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'} {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <span className="relative bg-slate-50 px-3 text-xs font-semibold text-gray-400 uppercase">Or Continue With</span>
          </div>

          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2.5 py-3 bg-white border border-slate-200 text-gray-700 font-semibold rounded-2xl hover:bg-slate-50 transition-colors shadow-sm text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">Register here</Link>
          </p>
        </motion.div>
      </div>

      {/* Forgot password overlay */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reset Password</h3>
            <p className="text-xs text-gray-500 mb-4">Enter your registered email and we'll send you a password reset link.</p>
            <input
              type="email"
              value={forgotInput}
              onChange={(e) => setForgotInput(e.target.value)}
              placeholder="Email Address"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm mb-4 text-gray-900"
            />
            <div className="flex gap-2">
              <button onClick={() => setForgotOpen(false)} className="flex-1 py-2.5 bg-slate-100 text-gray-700 font-semibold rounded-xl text-xs">Cancel</button>
              <button
                onClick={async () => { 
                  if (!forgotInput) return triggerToast('Enter your email.', 'warning');
                  const res = await useAuthStore.getState().forgotPassword(forgotInput);
                  if (res.success) {
                    triggerToast('Password reset link sent to your email.', 'success');
                    setForgotOpen(false);
                    setForgotInput('');
                  } else {
                    triggerToast(res.error, 'error');
                  }
                }}
                disabled={loading}
                className="flex-1 py-2.5 bg-primary text-white font-semibold rounded-xl text-xs disabled:opacity-60"
              >
                {loading ? 'Sending...' : 'Send Link'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
