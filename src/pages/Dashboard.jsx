import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { useAppStore } from '../store/appStore.js';
import { Bell, Heart, Droplet, MapPin, Siren, ShieldAlert, Award, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const { 
    user, 
    setAvailability 
  } = useAuthStore();
  const { 
    requests, 
    fetchRequests, 
    notifications, 
    fetchNotifications, 
    setActiveView,
    triggerToast 
  } = useAppStore();

  useEffect(() => {
    fetchRequests();
    fetchNotifications();
  }, []);

  const unreadNotifs = notifications.filter(n => !n.read).length;

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

  // Quick Actions Mapping
  const actions = [
    { title: 'Donate Blood', icon: Heart, view: 'Requests', color: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' },
    { title: 'Request Blood', icon: Droplet, view: 'Requests', color: 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30', focusInput: true },
    { title: 'Nearby Donors', icon: MapPin, view: 'FindDonors', color: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30' },
    { title: 'Emergency SOS', icon: Siren, view: 'SOS', color: 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30' }
  ];

  // Active requests count and emergency requests
  const activeSOS = requests.filter(r => r.urgencyLevel === 'Immediate' && r.status === 'Pending');
  const totalActive = requests.filter(r => r.status === 'Pending').length;

  const handleActionClick = (action) => {
    if (action.view === 'SOS') {
      // Simulate click on the floating SOS button
      const sosBtn = document.querySelector('button[class*="bg-red-500"]');
      if (sosBtn) sosBtn.click();
    } else {
      setActiveView(action.view);
    }
  };

  const toggleAvailability = async () => {
    const nextStatus = !user.availableForDonation;
    const res = await setAvailability(nextStatus);
    if (res.success) {
      triggerToast(
        nextStatus 
          ? 'You are now marked AVAILABLE for blood donations!' 
          : 'You are now marked UNAVAILABLE.',
        nextStatus ? 'success' : 'warning'
      );
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 px-6 pt-6 pb-24 select-none">
      <div className="max-w-7xl mx-auto">
        
        {/* Desktop Grid Split Layout */}
        <div className="grid grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Welcome, ID Passport, Numerical Stats, and Quick Actions (col-span-8) */}
          <div className="col-span-12 md:col-span-8 space-y-6">
            
            {/* Top Header Row */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-0.5">Welcome back</span>
                <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100 mt-0.5">
                  {user ? user.fullName.split(' ')[0] : 'Donor'} 👋
                </h2>
              </div>
              <button 
                onClick={() => setActiveView('Notifications')}
                className="w-11 h-11 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/30 rounded-2xl flex items-center justify-center relative cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-sm md:hidden"
              >
                <Bell className="w-5 h-5 text-slate-700 dark:text-zinc-500" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-2 right-2 bg-primary w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-zinc-950" />
                )}
              </button>
            </div>

            {/* Hero Premium ID Card */}
            <div className="relative rounded-[28px] overflow-hidden bg-gradient-to-br from-[#7f1d1d] via-[#990f0f] to-[#5f1010] p-6 text-white shadow-lg shadow-red-950/20 group">
              <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full blur-2xl translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700" />
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-100 opacity-80">JeevaLink ID Card</span>
                  <h3 className="text-lg font-extrabold tracking-tight mt-1">{user ? user.fullName : 'Guest Donor'}</h3>
                  <p className="text-xs text-red-100 opacity-70 mt-0.5">{user?.city ? `${user.city}, ${user.district}` : 'Bengaluru'}</p>
                </div>
                {/* Blood group indicator badge */}
                <div className="w-16 h-16 bg-white/15 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center border border-white/20">
                  <span className="text-[9px] uppercase font-bold text-red-100 leading-none">Group</span>
                  <span className="text-2xl font-black mt-1 leading-none">{user ? user.bloodGroup : 'O-'}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/15">
                <div>
                  <span className="text-[9px] uppercase font-bold text-red-100 opacity-70">Donation Status</span>
                  {/* Availability Switch */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={toggleAvailability}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 cursor-pointer ${
                        user?.availableForDonation ? 'bg-white' : 'bg-red-400/50'
                      }`}
                    >
                      <div 
                        className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                          user?.availableForDonation ? 'translate-x-4 bg-emerald-600' : 'bg-white'
                        }`} 
                      />
                    </button>
                    <span className="text-xs font-bold">
                      {user?.availableForDonation ? 'Available' : 'Busy'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-red-100 opacity-70">JeevaPoints</span>
                  <p className="text-base font-black flex items-center gap-1 mt-1 justify-end">
                    <Award className="w-4 h-4 text-amber-300 fill-amber-300" /> {user ? user.rewardPoints : 100}
                  </p>
                </div>
              </div>
            </div>

            {/* Numerical Stats Grid */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white dark:bg-zinc-900 border border-rose-100/70 dark:border-zinc-800/20 rounded-2xl p-2.5 text-center shadow-sm">
                <span className="text-lg font-black text-rose-600 dark:text-rose-500 leading-none">
                  {user ? user.livesSaved : 0}
                </span>
                <p className="text-[9px] font-bold text-slate-500 dark:text-zinc-500 mt-1 leading-tight">Lives Saved</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-rose-100/70 dark:border-zinc-800/20 rounded-2xl p-2.5 text-center shadow-sm">
                <span className="text-lg font-black text-slate-900 dark:text-zinc-100 leading-none">
                  {user ? user.totalDonations : 0}
                </span>
                <p className="text-[9px] font-bold text-slate-500 dark:text-zinc-500 mt-1 leading-tight">Donations</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-rose-100/70 dark:border-zinc-800/20 rounded-2xl p-2.5 text-center shadow-sm">
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-550 leading-none">
                  18
                </span>
                <p className="text-[9px] font-bold text-slate-500 dark:text-zinc-500 mt-1 leading-tight">Match Donors</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-rose-100/70 dark:border-zinc-800/20 rounded-2xl p-2.5 text-center shadow-sm">
                <span className="text-lg font-black text-primary leading-none">
                  {activeSOS.length}
                </span>
                <p className="text-[9px] font-bold text-slate-500 dark:text-zinc-500 mt-1 leading-tight">Active SOS</p>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {actions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.title}
                      onClick={() => handleActionClick(act)}
                      className={`flex flex-col lg:flex-row items-center lg:items-start gap-3 p-3.5 rounded-2xl border border-slate-100/80 dark:border-rose-955/20 transition-all duration-200 cursor-pointer text-center lg:text-left hover:scale-[1.02] shadow-sm bg-white dark:bg-zinc-900 hover:shadow-md ${act.color}`}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/20 dark:bg-black/15 shadow-inner">
                        <Icon className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold leading-tight">{act.title}</h4>
                        <p className="text-[9px] opacity-75 mt-0.5">Click to access</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Active Blood Alerts Feed & Mini Notifications Feed (col-span-4) */}
          <div className="col-span-12 md:col-span-4 space-y-6">
            
            {/* Real-time Blood Alerts Feed */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-150/70 dark:border-zinc-800/20 rounded-3xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4 pl-0.5">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">Active Blood Alerts</h3>
                <button 
                  onClick={() => setActiveView('Requests')}
                  className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline cursor-pointer"
                >
                  See all <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {totalActive === 0 ? (
                <div className="bg-rose-50/20 dark:bg-zinc-950 border border-rose-100/40 dark:border-zinc-800/25 rounded-2xl p-6 text-center text-slate-400">
                  <p className="text-sm">All requests fulfilled. Lives saved!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests
                    .filter(r => r.status === 'Pending')
                    .slice(0, 3)
                    .map((req) => {
                      const isSOS = req.urgencyLevel === 'Immediate';
                      
                      return (
                        <div
                          key={req._id}
                          onClick={() => setActiveView('Requests')}
                          className={`p-3.5 rounded-2xl border bg-white dark:bg-zinc-900 shadow-sm flex items-start justify-between gap-3 cursor-pointer hover:border-slate-350 dark:hover:border-zinc-700/40 transition-colors ${
                            isSOS 
                              ? 'border-red-500/20 hover:border-red-500/35 relative overflow-hidden' 
                              : 'border-slate-200 dark:border-zinc-800/20'
                          }`}
                        >
                          {isSOS && (
                            <div className="absolute top-0 right-0 bg-red-655 text-[8px] font-black uppercase text-white px-2 py-0.5 rounded-bl-lg">
                              SOS
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                req.urgencyLevel === 'Immediate' 
                                  ? 'bg-red-500/10 text-primary' 
                                  : req.urgencyLevel === 'Critical' 
                                    ? 'bg-orange-500/10 text-orange-600' 
                                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-500'
                              }`}>
                                {req.urgencyLevel}
                              </span>
                              <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-semibold">
                                {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate mt-2">
                              {req.patientName} ({req.bloodGroup})
                            </h4>
                            <p className="text-[10px] text-slate-505 dark:text-zinc-550 mt-1 truncate">
                              🏥 {req.hospitalName}
                            </p>
                          </div>
                          
                          {/* Big red blood droplet with units required */}
                          <div className="flex flex-col items-center justify-center shrink-0 border border-red-500/10 rounded-xl p-1.5 min-w-10 bg-rose-500/5">
                            <Droplet className="w-3.5 h-3.5 text-primary fill-primary animate-pulse" />
                            <span className="text-[10px] font-black text-slate-900 dark:text-zinc-100 mt-1">{req.unitsRequired} U</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Mini Notifications / Inbox Feed (only visible on desktop for extra dashboard context) */}
            <div className="hidden md:block bg-white dark:bg-zinc-900 border border-slate-150/70 dark:border-zinc-800/20 rounded-3xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4 pl-0.5">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">Recent Alerts</h3>
                <button 
                  onClick={() => setActiveView('Notifications')}
                  className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline cursor-pointer"
                >
                  Inbox
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="bg-rose-50/20 dark:bg-zinc-950 border border-rose-100/40 dark:border-zinc-800/25 rounded-2xl p-4 text-center text-slate-400">
                  <p className="text-xs">No alerts yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 2).map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => setActiveView('Notifications')}
                      className="flex gap-3 items-start cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/30 p-2.5 rounded-2xl border border-transparent hover:border-slate-100/50 dark:hover:border-zinc-800/10 transition-all text-left"
                    >
                      {getMiniIcon(notif.type)}
                      <div className="min-w-0 flex-1 text-left">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                            {notif.title}
                          </h4>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${notif.read ? 'bg-transparent' : 'bg-primary animate-pulse'}`} />
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-550 mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
          
        </div>
      </div>
    </div>
  );
}
