import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useAppStore } from '../store/appStore.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Droplets, MessageSquare, HeadphonesIcon,
  BarChart3, Bell, Activity, Settings, LogOut, ChevronLeft,
  ChevronRight, Shield, Menu, X, Zap, FileText, BookOpen, AlertTriangle,
  Handshake
} from 'lucide-react';

const NAV_ITEMS = [
  { group: 'Core', items: [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: null },
    { to: '/admin/volunteers', icon: Users, label: 'Volunteers', badge: null },
    { to: '/admin/blood-requests', icon: Droplets, label: 'Blood Requests', badge: 'requests' },
  ]},
  { group: 'Communication', items: [
    { to: '/admin/feedback', icon: MessageSquare, label: 'Feedback', badge: 'feedback' },
    { to: '/admin/support', icon: HeadphonesIcon, label: 'Support Center', badge: 'tickets' },
    { to: '/admin/notifications', icon: Bell, label: 'Notifications', badge: null },
  ]},
  { group: 'Intelligence', items: [
    { to: '/admin/reports', icon: BarChart3, label: 'Reports & Analytics', badge: null },
    { to: '/admin/activity-logs', icon: Activity, label: 'Activity Logs', badge: null },
  ]},
  { group: 'System', items: [
    { to: '/admin/partners', icon: Handshake, label: 'Partners Management', badge: null },
    { to: '/admin/settings', icon: Settings, label: 'System Settings', badge: null },
  ]},
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const { notifications, adminStats } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const unreadNotif = notifications.filter(n => !n.read).length;
  const pendingRequests = adminStats?.pendingRequests || 0;
  const pendingFeedback = adminStats?.pendingFeedback || 0;
  const openTickets = adminStats?.openTickets || 0;

  const getBadgeCount = (badge) => {
    if (badge === 'requests') return pendingRequests;
    if (badge === 'feedback') return pendingFeedback;
    if (badge === 'tickets') return openTickets;
    return 0;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/');

  const currentPageLabel = NAV_ITEMS
    .flatMap(g => g.items)
    .find(item => isActive(item.to))?.label || 'Admin Panel';

  const SidebarContent = ({ isCollapsed }) => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-100 ${isCollapsed ? 'justify-center px-2' : ''}`}>
        <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        {!isCollapsed && (
          <div>
            <p className="text-slate-900 font-black text-sm leading-tight">JeevaLink</p>
            <p className="text-red-600 text-[10px] font-bold uppercase tracking-widest">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map((group) => (
          <div key={group.group} className={`mb-2 ${isCollapsed ? 'px-1' : 'px-3'}`}>
            {!isCollapsed && (
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest px-3 mb-1.5">{group.group}</p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              const badgeCount = getBadgeCount(item.badge);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-200 relative group ${
                    active
                      ? 'bg-red-50 text-red-600 border border-red-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  } ${isCollapsed ? 'justify-center px-2.5' : ''}`}
                >
                  {active && (
                    <motion.span
                      layoutId="admin-sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-red-600 rounded-r-full"
                    />
                  )}
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${active ? 'text-red-600' : ''}`} style={{width:'18px',height:'18px'}} />
                  {!isCollapsed && (
                    <span className={`text-xs font-semibold flex-1 truncate ${active ? 'font-bold' : ''}`}>{item.label}</span>
                  )}
                  {!isCollapsed && badgeCount > 0 && (
                    <span className="text-[9px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                  {isCollapsed && badgeCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white" />
                  )}
                </Link>
              );
            })}
            {!isCollapsed && <div className="h-px bg-slate-100 mx-3 mt-2 mb-1" />}
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className={`border-t border-slate-100 p-3 ${isCollapsed ? 'flex justify-center' : ''}`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-xs shrink-0">
              {user?.fullName?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 text-xs font-bold truncate">{user?.fullName || 'Administrator'}</p>
              <p className="text-slate-500 text-[10px] truncate">System Admin</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            title="Logout"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col h-screen sticky top-0 bg-white border-r border-slate-200 overflow-hidden shrink-0 z-40 shadow-sm"
      >
        <SidebarContent isCollapsed={collapsed} />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-20 -right-3 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer shadow-sm"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-200 z-50 flex flex-col"
            >
              <SidebarContent isCollapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-14 bg-white/90 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs hidden sm:block">Admin</span>
              <ChevronRight className="w-3 h-3 text-slate-400 hidden sm:block" />
              <span className="text-slate-900 text-sm font-semibold">{currentPageLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Alert badge */}
            {pendingRequests > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-100 rounded-lg">
                <AlertTriangle className="w-3 h-3 text-red-600" />
                <span className="text-red-600 text-[10px] font-bold">{pendingRequests} pending</span>
              </div>
            )}

            {/* Notification Bell */}
            <Link
              to="/notifications"
              className="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadNotif > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </Link>

            {/* Admin Avatar */}
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
              {user?.fullName?.[0] || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
