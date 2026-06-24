import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore.js';
import { useAuthStore } from '../store/authStore.js';
import { motion } from 'framer-motion';
import {
  Users, Droplets, MessageSquare, HeadphonesIcon, Activity, Shield,
  UserCheck, UserX, UserMinus, AlertTriangle, Clock, CheckCircle2,
  XCircle, TrendingUp, BarChart3, Bell, ChevronRight, ArrowUpRight
} from 'lucide-react';
import AdminStatCard from '../components/admin/AdminStatCard.jsx';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const monthlyData = [
  { month: 'Jan', volunteers: 12, requests: 45, completed: 38 },
  { month: 'Feb', volunteers: 18, requests: 62, completed: 55 },
  { month: 'Mar', volunteers: 25, requests: 78, completed: 70 },
  { month: 'Apr', volunteers: 22, requests: 55, completed: 48 },
  { month: 'May', volunteers: 31, requests: 90, completed: 82 },
  { month: 'Jun', volunteers: 38, requests: 110, completed: 98 },
];

const districtData = [
  { district: 'Ernakulam', volunteers: 28, requests: 42 },
  { district: 'Thrissur', volunteers: 21, requests: 35 },
  { district: 'Bengaluru', volunteers: 35, requests: 58 },
  { district: 'Chennai', volunteers: 19, requests: 29 },
  { district: 'TVM', volunteers: 16, requests: 24 },
];

const bloodGroupData = [
  { name: 'O+', value: 42, color: '#ef4444' },
  { name: 'A+', value: 35, color: '#f97316' },
  { name: 'B+', value: 28, color: '#eab308' },
  { name: 'AB+', value: 18, color: '#22c55e' },
  { name: 'O-', value: 14, color: '#3b82f6' },
  { name: 'A-', value: 12, color: '#8b5cf6' },
  { name: 'B-', value: 8, color: '#ec4899' },
  { name: 'AB-', value: 5, color: '#06b6d4' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
        <p className="text-slate-500 text-[10px] font-bold mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs font-semibold" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const { requests, allUsers, complaints, adminStats, fetchRequests, fetchUsers, fetchComplaints, fetchAdminStats } = useAppStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchRequests();
    fetchUsers();
    fetchComplaints();
    fetchAdminStats?.();
  }, []);

  // Derived stats
  const volunteers = allUsers.filter(u => u.role === 'volunteer');
  const activeVol = volunteers.filter(u => u.status === 'Active').length;
  const inactiveVol = volunteers.filter(u => u.status !== 'Active' && u.status !== 'Suspended' && u.status !== 'Blocked').length;
  const blockedVol = volunteers.filter(u => u.status === 'Suspended' || u.status === 'Blocked').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const newToday = allUsers.filter(u => (u.joinedAt || u.created_at || '').startsWith(todayStr)).length;

  const totalReqs = requests.length;
  const pendingReqs = requests.filter(r => r.status === 'Pending').length;
  const completedReqs = requests.filter(r => r.status === 'Fulfilled' || r.status === 'Completed').length;
  const emergencyReqs = requests.filter(r => r.urgencyLevel === 'Immediate' || r.urgencyLevel === 'Emergency SOS').length;
  const pendingComplaints = complaints.filter(c => c.status === 'Pending').length;

  const recentActions = [
    { action: 'User status updated', user: 'Arun Kumar', time: '2m ago', type: 'status', color: 'text-amber-400' },
    { action: 'Blood request approved', user: 'City Hospital', time: '8m ago', type: 'approve', color: 'text-emerald-400' },
    { action: 'Complaint resolved', user: 'Sreejith Nair', time: '15m ago', type: 'resolve', color: 'text-blue-400' },
    { action: 'New volunteer added', user: 'Ananya Menon', time: '32m ago', type: 'add', color: 'text-purple-400' },
    { action: 'Emergency SOS triggered', user: 'Patient: O+ required', time: '1h ago', type: 'sos', color: 'text-red-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white border border-red-100 shadow-sm rounded-2xl p-5 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNlZjQ0NDQiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptNiA2djZoNnYtNmgtNnptLTYgMHY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="text-slate-900 text-xl font-black">Welcome back, {user?.fullName?.split(' ')[0] || 'Admin'} 👋</h1>
            <p className="text-slate-500 text-xs mt-1">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · JeevaLink Admin Panel v2.0
            </p>
          </div>
          <span className="px-3 py-1 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
            Super Admin
          </span>
        </div>
        {pendingReqs > 0 && (
          <div className="relative mt-3 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-xl w-fit">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            <span className="text-red-600 text-xs font-bold">{pendingReqs} blood requests pending your attention</span>
            <Link to="/admin/blood-requests" className="text-red-600 underline text-xs font-bold">Review →</Link>
          </div>
        )}
      </motion.div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        <AdminStatCard label="Total Volunteers" value={volunteers.length} sub={`${activeVol} active`} icon={Users} accent="blue" delay={0} trend={12} />
        <AdminStatCard label="Active Volunteers" value={activeVol} sub="Operational" icon={UserCheck} accent="green" delay={0.05} trend={8} />
        <AdminStatCard label="Inactive Volunteers" value={inactiveVol} sub="Not operational" icon={UserMinus} accent="amber" delay={0.10} />
        <AdminStatCard label="Blocked / Suspended" value={blockedVol} sub="Access revoked" icon={UserX} accent="red" delay={0.15} />
        <AdminStatCard label="New Today" value={newToday} sub="Registrations" icon={TrendingUp} accent="purple" delay={0.20} trend={newToday > 0 ? 100 : 0} />
        <AdminStatCard label="Total Requests" value={totalReqs} sub={`${pendingReqs} pending`} icon={Droplets} accent="red" delay={0.25} />
        <AdminStatCard label="Completed Requests" value={completedReqs} sub="Successfully fulfilled" icon={CheckCircle2} accent="green" delay={0.30} />
        <AdminStatCard label="Emergency / SOS" value={emergencyReqs} sub="Immediate cases" icon={AlertTriangle} accent="red" delay={0.35} pulse={emergencyReqs > 0} />
        <AdminStatCard label="Pending Complaints" value={pendingComplaints} sub="Safety reports" icon={Shield} accent="amber" delay={0.40} />
        <AdminStatCard label="Total Users" value={allUsers.length} sub="All roles" icon={Users} accent="indigo" delay={0.45} />
        <AdminStatCard label="Hospitals" value={allUsers.filter(u => u.role === 'hospital').length} sub="Registered" icon={Activity} accent="blue" delay={0.50} />
        <AdminStatCard label="Platform Health" value="98.7%" sub="Uptime this month" icon={TrendingUp} accent="green" delay={0.55} trend={2} />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Volunteer Growth + Requests */}
        <div className="lg:col-span-2 bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-slate-900 font-bold text-sm">Monthly Activity</h3>
              <p className="text-slate-500 text-[10px]">Volunteer growth & request trends</p>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-blue-400"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Volunteers</span>
              <span className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Requests</span>
              <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Completed</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="volunteers" stroke="#3b82f6" fill="url(#volGrad)" strokeWidth={2} name="Volunteers" />
              <Area type="monotone" dataKey="requests" stroke="#ef4444" fill="url(#reqGrad)" strokeWidth={2} name="Requests" />
              <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} dot={false} name="Completed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Blood Group Pie */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
          <div className="mb-4">
            <h3 className="text-slate-900 font-bold text-sm">Blood Distribution</h3>
            <p className="text-slate-500 text-[10px]">Donor blood groups</p>
          </div>
          <div className="flex justify-center mb-3">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={bloodGroupData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                  {bloodGroupData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {bloodGroupData.map(b => (
              <div key={b.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: b.color }} />
                <span className="text-slate-400 text-[10px] font-semibold">{b.name}</span>
                <span className="text-slate-600 text-[10px] ml-auto">{b.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* District + Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* District Stats */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-slate-900 font-bold text-sm">District Wise Stats</h3>
              <p className="text-slate-500 text-[10px]">Volunteer & request distribution</p>
            </div>
            <Link to="/admin/reports" className="text-red-600 text-[10px] font-bold flex items-center gap-1 hover:text-red-700 transition-colors">
              Full Report <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={districtData} barSize={12} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="district" tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="volunteers" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Volunteers" />
              <Bar dataKey="requests" fill="#ef4444" radius={[4, 4, 0, 0]} name="Requests" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-slate-900 font-bold text-sm">Recent Actions</h3>
              <p className="text-slate-500 text-[10px]">Admin activity timeline</p>
            </div>
            <Link to="/admin/activity-logs" className="text-red-600 text-[10px] font-bold flex items-center gap-1 hover:text-red-700 transition-colors">
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentActions.map((action, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3"
              >
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${action.color.replace('text-', 'bg-')}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 text-xs font-semibold truncate">{action.action}</p>
                  <p className="text-slate-500 text-[10px] truncate">{action.user}</p>
                </div>
                <span className="text-slate-600 text-[10px] shrink-0">{action.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { to: '/admin/volunteers', label: 'Manage Volunteers', sub: `${volunteers.length} total registered`, icon: Users, accent: 'text-red-600 bg-red-50 border-red-100' },
          { to: '/admin/blood-requests', label: 'Blood Requests', sub: `${pendingReqs} awaiting action`, icon: Droplets, accent: 'text-red-600 bg-red-50 border-red-100', alert: pendingReqs > 0 },
          { to: '/admin/support', label: 'Support Center', sub: `${pendingComplaints} open issues`, icon: HeadphonesIcon, accent: 'text-red-600 bg-red-50 border-red-100' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <Link key={card.to} to={card.to}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-white border rounded-2xl p-5 cursor-pointer transition-shadow hover:shadow-md ${card.alert ? 'border-red-200 shadow-sm' : 'border-slate-100 shadow-sm'}`}
              >
                <div className={`w-10 h-10 border rounded-xl flex items-center justify-center mb-3 ${card.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-slate-900 font-bold text-sm">{card.label}</p>
                <p className="text-slate-500 text-[10px] mt-0.5">{card.sub}</p>
                <div className="flex items-center gap-1 mt-3 text-[10px] font-bold text-slate-500 hover:text-slate-700 transition-colors">
                  Open Module <ChevronRight className="w-3 h-3" />
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
