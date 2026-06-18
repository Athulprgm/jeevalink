import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useAppStore } from '../store/appStore.js';
import {
  LayoutDashboard, Users, Droplets, Bell, User,
  Settings, ClipboardList, ShieldCheck, Activity, LogOut, ChevronRight, ShieldAlert, Siren
} from 'lucide-react';
import { motion } from 'framer-motion';

const donorLinks = [
  { to: '/donor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/donor/search', label: 'Find Donors', icon: Users },
  { to: '/requests', label: 'Blood Requests', icon: Droplets },
  { to: '/profile', label: 'Profile', icon: User },
];

const volunteerLinks = [
  { to: '/volunteer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/requests', label: 'All Requests', icon: ClipboardList },
  { to: '/donor/search', label: 'Find Donors', icon: Users },
  { to: '/profile', label: 'Profile', icon: User },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/dashboard?tab=users', label: 'Users', icon: Users },
  { to: '/admin/dashboard?tab=hospitals', label: 'Verify Hospitals', icon: ShieldCheck, badgeCountKey: 'hospitals' },
  { to: '/requests', label: 'Requests', icon: ClipboardList },
  { to: '/admin/emergency', label: 'Emergency Alerts', icon: Siren },
  { to: '/admin/dashboard?tab=analytics', label: 'Analytics', icon: Activity },
  { to: '/admin/dashboard?tab=complaints', label: 'Complaints', icon: ShieldAlert, badgeCountKey: 'complaints' },
  { to: '/profile', label: 'Profile', icon: User },
];

const hospitalLinks = [
  { to: '/hospital/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/donor/search', label: 'Find Donors', icon: Users },
  { to: '/requests', label: 'Blood Requests', icon: Droplets },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { allUsers, complaints } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  let links =
    user?.role === 'admin' ? adminLinks :
    user?.role === 'volunteer' ? volunteerLinks :
    user?.role === 'hospital' ? hospitalLinks :
    donorLinks;

  if (user?.role === 'hospital' && user?.status === 'Pending Approval') {
    links = [
      { to: '/hospital/dashboard', label: 'Dashboard', icon: LayoutDashboard }
    ];
  }

  const isActive = (to) => {
    try {
      const toUrl = new URL(to, window.location.origin);
      const currentUrl = new URL(location.pathname + location.search, window.location.origin);

      if (toUrl.pathname !== currentUrl.pathname) {
        return false;
      }

      const toParams = Array.from(toUrl.searchParams.entries());
      if (toParams.length > 0) {
        return toParams.every(([key, value]) => currentUrl.searchParams.get(key) === value);
      }

      const currentTab = currentUrl.searchParams.get('tab');
      return !currentTab || currentTab === 'overview';
    } catch (e) {
      return location.pathname === to;
    }
  };

  const pendingHospitalsCount = allUsers.filter(
    (u) => u.role === 'hospital' && u.status === 'Pending Approval'
  ).length;

  const pendingComplaintsCount = complaints.filter(
    (c) => c.status === 'Pending'
  ).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-slate-100/80 shrink-0 shadow-[2px_0_12px_rgba(0,0,0,0.03)]">

      {/* Logo */}
      <Link to="/" className="h-16 flex items-center gap-1 px-5 border-b border-slate-100 group shrink-0">
        <img
          src="/logo.png"
          alt="JeevaLink"
          className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-105"
          style={{ mixBlendMode: 'multiply' }}
        />
        <span className="text-[17px] font-black text-gray-900 tracking-tight leading-none">
          Jeeva<span className="text-primary">Link</span>
        </span>
      </Link>


      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.to);
          
          let badgeCount = 0;
          if (link.badgeCountKey === 'hospitals') badgeCount = pendingHospitalsCount;
          if (link.badgeCountKey === 'complaints') badgeCount = pendingComplaintsCount;

          return (
            <Link
              key={`${link.to}-${link.label}`}
              to={link.to}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                active
                  ? 'bg-gradient-to-r from-red-50 to-rose-50/50 text-primary shadow-sm border border-red-100/60'
                  : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full"
                />
              )}
              <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span>{link.label}</span>
              {badgeCount > 0 ? (
                <span className="ml-auto px-2 py-0.5 text-[10px] font-black bg-primary text-white rounded-full animate-pulse shrink-0">
                  {badgeCount}
                </span>
              ) : (
                active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary/60 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Blood group badge */}
      {user?.bloodGroup && (
        <div className="px-4 mb-3">
          <div className="px-4 py-3 bg-gradient-to-br from-red-50 via-rose-50 to-red-50/50 rounded-2xl border border-red-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-red-400 mb-1">Your Blood Group</p>
            <p className="text-3xl font-black text-primary leading-none">{user.bloodGroup}</p>
          </div>
        </div>
      )}

      {/* Settings & Sign out */}
      <div className="p-3 border-t border-slate-100 space-y-0.5">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-slate-50 hover:text-gray-900 transition-colors"
        >
          <Settings className="w-4 h-4 text-gray-400" /> Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
