import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useAppStore } from '../store/appStore.js';
import {
  Heart, Droplet, MapPin, Siren, Bell, Award, ArrowRight,
  TrendingUp, Activity, CheckCircle2, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import RequestCard from '../components/RequestCard.jsx';

export default function DonorDashboard() {
  const { user, setAvailability } = useAuthStore();
  const { requests, notifications, fetchRequests, fetchNotifications, triggerToast } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
    fetchNotifications();
  }, []);

  const unread = notifications.filter((n) => !n.read).length;
  const pending = requests.filter((r) => r.status === 'Pending');
  const sos = requests.filter((r) => r.urgencyLevel === 'Immediate' && r.status === 'Pending');

  const toggleAvailability = async () => {
    const next = !user?.availableForDonation;
    const res = await setAvailability(next);
    if (res.success) triggerToast(next ? 'You are now AVAILABLE for donations!' : 'Marked as Unavailable.', next ? 'success' : 'warning');
  };

  const getEligibility = () => {
    if (!user?.lastDonated) return { eligible: true, text: 'Eligible to Donate', daysLeft: 0 };
    const last = new Date(user.lastDonated);
    const diffTime = Math.abs(new Date() - last);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 90) {
      return { eligible: true, text: 'Eligible to Donate', daysLeft: 0 };
    }
    return { eligible: false, text: `${90 - diffDays} Days left`, daysLeft: 90 - diffDays };
  };

  const eligibility = getEligibility();

  const statCards = [
    { label: 'Lives Saved', value: user?.livesSaved ?? 0, icon: Heart, color: 'text-red-600 bg-red-50' },
    { label: 'Donations', value: user?.totalDonations ?? 0, icon: Activity, color: 'text-blue-600 bg-blue-50' },
    { label: 'JeevaPoints', value: user?.rewardPoints ?? 0, icon: Award, color: 'text-amber-600 bg-amber-50' },
    { label: 'Active SOS', value: sos.length, icon: Siren, color: 'text-red-600 bg-red-50' },
  ];

  const quickActions = [
    { label: 'Request Blood', icon: Droplet, to: '/requests', color: 'bg-red-50 text-red-600 border-red-100' },
    { label: 'Find Donors', icon: MapPin, to: '/donor/search', color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { label: 'Notifications', icon: Bell, to: '/notifications', color: 'bg-purple-50 text-purple-600 border-purple-100' },
    { label: 'My Profile', icon: Award, to: '/profile', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  ];

  const getMiniIcon = (type) => {
    switch (type) {
      case 'SOS':
        return (
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-650 flex items-center justify-center shrink-0 border border-red-100 animate-pulse animate-duration-1000">
            <Siren className="w-4 h-4" />
          </div>
        );
      case 'Reward':
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Award className="w-4 h-4" />
          </div>
        );
      case 'Fulfilled':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case 'Match':
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <MapPin className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-650 flex items-center justify-center shrink-0 border border-purple-100">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative hero-gradient rounded-3xl p-6 text-white overflow-hidden shadow-lg"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <p className="text-red-200 text-xs font-bold uppercase tracking-widest">Welcome back</p>
              {user?.streak > 0 && (
                <span className="bg-orange-600/30 text-orange-200 border border-orange-400/20 px-2 py-0.5 rounded-full text-[9px] font-black flex items-center gap-0.5 animate-bounce">
                  🔥 {user.streak} Donation Streak
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black mb-1">{user?.fullName?.split(' ')[0] || 'Donor'} 👋</h2>
            <p className="text-red-200 text-sm">{user?.city}, {user?.district}</p>
          </div>
          {/* Blood group badge */}
          <div className="w-16 h-16 bg-white/15 border border-white/20 rounded-2xl flex flex-col items-center justify-center shrink-0">
            <span className="text-[9px] font-bold text-red-200">Group</span>
            <span className="text-2xl font-black">{user?.bloodGroup || 'B+'}</span>
          </div>
        </div>
        {/* Availability toggle */}
        <div className="relative z-10 flex items-center justify-between mt-5 pt-4 border-t border-white/15">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAvailability}
              className="w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer bg-white/20"
              style={{ backgroundColor: user?.availableForDonation ? '#22c55e' : 'rgba(255,255,255,0.2)' }}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${user?.availableForDonation ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <span className="text-sm font-bold">{user?.availableForDonation ? '● Available for donation' : '○ Not available'}</span>
          </div>
          <Link to="/requests" className="text-red-200 text-xs font-bold hover:text-white flex items-center gap-1">
            View Requests <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card p-4"
            >
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 font-semibold mt-0.5">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: quick actions + recent */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickActions.map((a) => {
                const Icon = a.icon;
                return (
                  <Link
                    key={a.label}
                    to={a.to}
                    className={`card p-4 text-center border ${a.color} hover:shadow-md transition-all`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-xs font-bold">{a.label}</p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Donation Eligibility Card */}
          <div className="card p-5 bg-gradient-to-br from-white to-slate-50 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4 text-left">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                eligibility.eligible
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : 'bg-amber-50 text-amber-600 border border-amber-100'
              }`}>
                <Heart className={`w-7 h-7 ${eligibility.eligible ? 'animate-heartbeat fill-emerald-500/10' : ''}`} />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900">Donation Eligibility</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {eligibility.eligible
                    ? 'You are eligible to donate blood today! Thank you for being ready.'
                    : `Next eligibility in ${eligibility.daysLeft} days. Cooldown of 90 days required.`}
                </p>
                {user?.lastDonated && (
                  <p className="text-[10px] text-gray-400 mt-1 font-semibold">
                    Last Donation Date: {new Date(user.lastDonated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>

            {/* Visual Indicator */}
            <div className="shrink-0 flex items-center justify-center relative w-16 h-16">
              {eligibility.eligible ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] uppercase tracking-wider font-black text-emerald-600 bg-emerald-100/50 px-2.5 py-1 rounded-xl">
                    Ready
                  </span>
                </div>
              ) : (
                <div className="relative flex items-center justify-center">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="26" stroke="#f1f5f9" strokeWidth="4.5" fill="transparent" />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="#d97706"
                      strokeWidth="4.5"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 26}
                      strokeDashoffset={2 * Math.PI * 26 * (1 - (90 - eligibility.daysLeft) / 90)}
                    />
                  </svg>
                  <span className="absolute text-[11px] font-black text-amber-700">
                    {eligibility.daysLeft}d
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Recent activity */}
          <div className="card p-5 text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Recent Notifications</h3>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${unread > 0 ? 'bg-red-50 text-primary' : 'bg-slate-100 text-gray-400'}`}>
                {unread} unread
              </span>
            </div>
            <div className="space-y-3">
              {notifications.slice(0, 4).map((n) => (
                <div key={n._id} className="flex items-start gap-3.5 p-2.5 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100/50">
                  {getMiniIcon(n.type)}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-gray-800 truncate">{n.title}</p>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${n.read ? 'bg-transparent' : 'bg-primary animate-pulse'}`} />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: active blood alerts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Active Blood Alerts</h3>
            <Link to="/requests" className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5">
              See all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {pending.length === 0 ? (
            <div className="card p-6 text-center text-gray-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-400" />
              <p className="text-sm">All requests fulfilled!</p>
            </div>
          ) : (
            pending.slice(0, 3).map((req) => (
              <RequestCard key={req._id} request={req} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
