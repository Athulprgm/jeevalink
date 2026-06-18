import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/appStore.js';
import { useAuthStore } from '../store/authStore.js';
import Modal from '../components/Modal.jsx';
import {
  Users, Droplets, ClipboardList, Activity, TrendingUp,
  CheckCircle2, XCircle, Clock, ShieldCheck, Eye, Plus, Check, Mail, UserCheck,
  Flag, AlertTriangle, ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const chartData = [
  { month: 'Jan', requests: 45, fulfilled: 38 },
  { month: 'Feb', requests: 62, fulfilled: 55 },
  { month: 'Mar', requests: 78, fulfilled: 70 },
  { month: 'Apr', requests: 55, fulfilled: 48 },
  { month: 'May', requests: 90, fulfilled: 82 },
  { month: 'Jun', requests: 110, fulfilled: 98 },
];

const bloodGroupData = [
  { group: 'O+', count: 42 }, { group: 'A+', count: 35 }, { group: 'B+', count: 28 },
  { group: 'AB+', count: 18 }, { group: 'O-', count: 14 }, { group: 'A-', count: 12 },
  { group: 'B-', count: 8 }, { group: 'AB-', count: 5 },
];

export default function AdminDashboard() {
  const { requests, allUsers, complaints, fetchRequests, fetchUsers, fetchComplaints, updateUserStatus, resolveComplaint, suspendUser, warnUser, triggerToast, updateUserEligibility } = useAppStore();
  const { addVolunteer } = useAuthStore();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';
  const setTab = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  // Volunteer creation states
  const [showVolModal, setShowVolModal] = useState(false);
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [createdVol, setCreatedVol] = useState(null);
  const [volError, setVolError] = useState('');
  const [volForm, setVolForm] = useState({ fullName: '', email: '', mobile: '', password: '', district: 'Bengaluru Urban' });

  const handleOpenVolModal = () => {
    const randomPass = 'jeeva-' + Math.random().toString(36).substring(2, 8);
    setVolForm({ fullName: '', email: '', mobile: '', password: randomPass, district: 'Bengaluru Urban' });
    setVolError('');
    setShowVolModal(true);
  };

  const handleVolSubmit = async (e) => {
    e.preventDefault();
    if (!volForm.fullName || !volForm.email || !volForm.mobile) {
      setVolError('All fields are required.');
      return;
    }

    // Client-side limit check: max 3 volunteers per district
    const districtCount = allUsers.filter(
      (u) => u.role === 'volunteer' && u.district?.toLowerCase() === volForm.district?.toLowerCase()
    ).length;

    if (districtCount >= 3) {
      setVolError(`District limit reached: ${volForm.district} already has the maximum of 3 volunteers.`);
      triggerToast(`Limit reached: ${volForm.district} has 3 volunteers.`, 'warning');
      return;
    }

    const res = await addVolunteer(volForm);
    if (res.success) {
      setCreatedVol({ ...volForm });
      setShowVolModal(false);
      setShowCredsModal(true);
      triggerToast('Volunteer registered successfully!', 'success');
    } else {
      setVolError(res.error || 'Failed to add volunteer.');
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchUsers();
    fetchComplaints();
  }, []);

  const totalUsers   = allUsers.length;
  const activeUsers  = allUsers.filter((u) => u.status === 'Active').length;
  const totalReqs    = requests.length;
  const fulfilled    = requests.filter((r) => r.status === 'Fulfilled').length;
  const pending      = requests.filter((r) => r.status === 'Pending').length;
  const sosCount     = requests.filter((r) => r.urgencyLevel === 'Immediate').length;

  const topStats = [
    { label: 'Total Users', value: totalUsers, sub: `${activeUsers} active`, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Requests', value: totalReqs, sub: `${pending} pending`, icon: ClipboardList, color: 'text-amber-600 bg-amber-50' },
    { label: 'Fulfillment Rate', value: `${Math.round((fulfilled / totalReqs) * 105)}%`, sub: `${fulfilled} fulfilled`, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
    { label: 'SOS Emergencies', value: sosCount, sub: 'Immediate cases', icon: Activity, color: 'text-red-600 bg-red-50' },
  ];

  const pendingHospitals = allUsers.filter((u) => u.role === 'hospital' && u.status === 'Pending Approval');
  const pendingComplaints = complaints.filter((c) => c.status === 'Pending');
  const activeSOS = requests.filter((r) => r.urgencyLevel === 'Immediate' && r.status === 'Pending');

  const tabs = ['overview', 'analytics', 'users', 'requests', 'hospitals', 'complaints'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Full platform visibility and control</p>
        </div>
        <span className="px-3 py-1.5 bg-red-50 text-primary text-xs font-bold rounded-xl border border-red-100">
          Administrator
        </span>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {topStats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card p-4">
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 font-semibold">{s.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 rounded-xl p-1 gap-1 w-full max-w-2xl overflow-x-auto">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all whitespace-nowrap cursor-pointer ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-red-50 via-rose-50 to-red-100/70 rounded-3xl p-6 text-slate-900 overflow-hidden shadow-sm border border-red-100/60"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="relative z-10 space-y-2">
              <h2 className="text-xl font-black text-slate-900">Welcome Back, System Administrator</h2>
              <p className="text-slate-600 text-xs max-w-2xl leading-relaxed">
                JeevaLink platform operations are normal. You have pending requests and registrations requiring audit. Use the quick cards below to take action.
              </p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            {/* Card 1: Hospital Approvals */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-5 flex flex-col justify-between border border-slate-100 shadow-sm"
            >
              <div>
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Hospital Approvals</h3>
                <p className="text-2xl font-black text-gray-900 mt-2">
                  {pendingHospitals.length}
                </p>
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  Hospitals awaiting credentials verification
                </p>
              </div>
              <button
                onClick={() => setTab('hospitals')}
                className="w-full mt-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs transition-colors cursor-pointer text-center shadow-md shadow-red-200"
              >
                Review Approvals
              </button>
            </motion.div>

            {/* Card 2: Complaints */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-5 flex flex-col justify-between border border-slate-100 shadow-sm"
            >
              <div>
                <div className="w-10 h-10 bg-red-50 text-red-655 rounded-xl flex items-center justify-center mb-4">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Safety Reports</h3>
                <p className="text-2xl font-black text-gray-900 mt-2">
                  {pendingComplaints.length}
                </p>
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  Unresolved safety complaints / reports
                </p>
              </div>
              <button
                onClick={() => setTab('complaints')}
                className="w-full mt-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs transition-colors cursor-pointer text-center shadow-md shadow-red-200"
              >
                Review Reports
              </button>
            </motion.div>

            {/* Card 3: SOS Emergencies */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-5 flex flex-col justify-between border border-slate-100 shadow-sm"
            >
              <div>
                <div className="w-10 h-10 bg-rose-50 text-primary rounded-xl flex items-center justify-center mb-4 animate-pulse">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Emergency SOS</h3>
                <p className="text-2xl font-black text-primary mt-2">
                  {activeSOS.length}
                </p>
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  Immediate emergency blood cases
                </p>
              </div>
              <button
                onClick={() => setTab('requests')}
                className="w-full mt-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs transition-colors cursor-pointer text-center shadow-md shadow-red-200"
              >
                Monitor Emergencies
              </button>
            </motion.div>
          </div>

          {/* Quick Stats Summary */}
          <div className="card p-5 text-left border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Platform System Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/60">
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Total Users</span>
                <span className="text-lg font-black text-gray-900">{allUsers.length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/60">
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Donors</span>
                <span className="text-lg font-black text-gray-900">{allUsers.filter(u => u.role === 'donor').length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/60">
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Volunteers</span>
                <span className="text-lg font-black text-gray-900">{allUsers.filter(u => u.role === 'volunteer').length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/60">
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Hospitals</span>
                <span className="text-lg font-black text-gray-900">{allUsers.filter(u => u.role === 'hospital').length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Analytics */}
      {tab === 'analytics' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly requests chart */}
          <div className="card p-5 border border-slate-100 shadow-sm text-left">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Monthly Requests vs Fulfilled</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={16} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="requests" fill="#FEE2E2" radius={6} name="Requests" />
                <Bar dataKey="fulfilled" fill="#DC2626" radius={6} name="Fulfilled" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Blood group distribution */}
          <div className="card p-5 border border-slate-100 shadow-sm text-left">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Blood Group Distribution</h3>
            <div className="space-y-2.5">
              {bloodGroupData.map((b) => (
                <div key={b.group} className="flex items-center gap-3">
                  <span className="w-10 text-xs font-black text-gray-700">{b.group}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(b.count / 42) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                  <span className="w-8 text-xs text-gray-500 text-right">{b.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Users */}
      {tab === 'users' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-gray-900">User Management</h3>
              <p className="text-[10px] text-gray-400 font-semibold">{allUsers.length} total users</p>
            </div>
            <button
              onClick={handleOpenVolModal}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Volunteer
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Name', 'Email', 'Role', 'Blood', 'District', 'Eligibility', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {allUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{u.fullName}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${u.role === 'admin' ? 'bg-red-50 text-primary' : u.role === 'volunteer' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-black text-primary text-sm">{u.bloodGroup}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{u.district}</td>
                    <td className="px-4 py-3">
                      {u.role === 'donor' ? (
                        <select
                          value={u.eligibilityStatus || 'Pending Check'}
                          onChange={(e) => updateUserEligibility(u._id, e.target.value)}
                          className={`text-[10px] font-black px-2 py-1 rounded-lg border cursor-pointer outline-none transition-colors ${
                            u.eligibilityStatus === 'Eligible'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : u.eligibilityStatus === 'Ineligible'
                              ? 'bg-red-50 text-primary border-red-200'
                              : 'bg-slate-50 text-gray-500 border-slate-200'
                          }`}
                        >
                          <option value="Eligible">Eligible</option>
                          <option value="Ineligible">Ineligible</option>
                          <option value="Pending Check">Pending Check</option>
                        </select>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${u.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => updateUserStatus(u._id, u.status === 'Active' ? 'Inactive' : 'Active')}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${u.status === 'Active' ? 'text-red-655 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                        >
                          {u.status === 'Active' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Requests */}
      {tab === 'requests' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Request Monitoring</h3>
            <span className="text-xs text-gray-500">{requests.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Patient', 'Blood', 'Hospital', 'City', 'Urgency', 'Units', 'Status', 'Verified'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {requests.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{r.patientName}</td>
                    <td className="px-4 py-3 font-black text-primary">{r.bloodGroup}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[150px] truncate">{r.hospitalName}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{r.city}</td>
                    <td className="px-4 py-3">
                      <span className={r.urgencyLevel === 'Immediate' ? 'badge-immediate' : r.urgencyLevel === 'Critical' ? 'badge-critical' : 'badge-moderate'}>
                        {r.urgencyLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-700">{r.unitsRequired}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${r.status === 'Fulfilled' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.verified
                        ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                        : <Clock className="w-4 h-4 text-amber-400" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Hospitals */}
      {tab === 'hospitals' && (() => {
        const hospitalsList = allUsers.filter((u) => u.role === 'hospital');
        return (
          <div className="card overflow-hidden text-left">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Hospital Approvals</h3>
                <p className="text-[10px] text-gray-400 font-semibold">{hospitalsList.length} hospitals registered</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['Hospital Name', 'Email Address', 'District', 'City', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {hospitalsList.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-xs text-gray-400 font-semibold">No registered hospitals found.</td>
                    </tr>
                  ) : hospitalsList.map((h) => (
                    <tr key={h._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap text-left">{h.fullName}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap text-left">{h.email}</td>
                      <td className="px-4 py-3 text-gray-550 text-xs whitespace-nowrap text-left">{h.district}</td>
                      <td className="px-4 py-3 text-gray-550 text-xs whitespace-nowrap text-left">{h.city}</td>
                      <td className="px-4 py-3 text-left">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          h.status === 'Active' ? 'bg-green-50 text-green-600' : h.status === 'Pending Approval' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-red-50 text-red-655'
                        }`}>
                          {h.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-left">
                        {h.status === 'Pending Approval' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateUserStatus(h._id, 'Active')}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition-colors border border-emerald-200"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </button>
                            <button
                              onClick={() => updateUserStatus(h._id, 'Rejected')}
                              className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-655 font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition-colors border border-red-200"
                            >
                              <XCircle className="w-3 h-3" /> Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => updateUserStatus(h._id, h.status === 'Active' ? 'Inactive' : 'Active')}
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${h.status === 'Active' ? 'text-red-655 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                          >
                            {h.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* Tab: Complaints */}
      {tab === 'complaints' && (() => {
        const activeComplaints = complaints;
        return (
          <div className="card overflow-hidden text-left">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Safety Reports & Complaints</h3>
                <p className="text-[10px] text-gray-400 font-semibold">{activeComplaints.length} reports filed</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['Reporter', 'Accused Target', 'Reason / Incident Details', 'Date Filed', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activeComplaints.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-xs text-gray-400 font-semibold">No complaints filed.</td>
                    </tr>
                  ) : activeComplaints.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-left">
                        <div className="font-semibold text-gray-900">{c.reporterName}</div>
                        <div className="text-[10px] text-gray-400">ID: {c.reporterId}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-left">
                        <div className="font-semibold text-gray-900 flex items-center gap-1">
                          {c.targetName}
                          {allUsers.find(u => u._id === c.targetId)?.status === 'Suspended' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">Suspended</span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400">ID: {c.targetId}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-650 text-xs max-w-xs break-words text-left leading-relaxed">
                        {c.reason}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap text-left">
                        {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-left">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          c.status === 'Resolved' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-left">
                        {c.status === 'Pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => resolveComplaint(c._id)}
                              className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-650 font-semibold rounded-lg text-[10px] border border-slate-200 transition-colors cursor-pointer"
                              title="Dismiss Complaint"
                            >
                              Dismiss
                            </button>
                            <button
                              onClick={() => {
                                warnUser(c.targetId, `A warning has been issued regarding complaint: ${c.reason}`);
                                resolveComplaint(c._id);
                              }}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-600 font-semibold rounded-lg text-[10px] border border-amber-200 transition-colors cursor-pointer"
                              title="Warn Accused User"
                            >
                              Warn
                            </button>
                            <button
                              onClick={async () => {
                                await suspendUser(c.targetId);
                                resolveComplaint(c._id);
                              }}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-655 font-bold rounded-lg text-[10px] border border-red-200 transition-colors cursor-pointer"
                              title="Suspend Accused User"
                            >
                              Suspend
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">Action Taken</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* Add Volunteer Modal */}
      <Modal isOpen={showVolModal} onClose={() => setShowVolModal(false)} title="Add New District Volunteer">
        <form onSubmit={handleVolSubmit} className="space-y-4 text-left">
          {volError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-primary font-semibold flex gap-2">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{volError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              value={volForm.fullName}
              onChange={(e) => setVolForm({ ...volForm, fullName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-gray-900"
              placeholder="e.g. Sreejith Nair"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email (Username)</label>
              <input
                type="email"
                required
                value={volForm.email}
                onChange={(e) => setVolForm({ ...volForm, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-gray-900"
                placeholder="volunteer@jeevalink.org"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile</label>
              <input
                type="tel"
                required
                value={volForm.mobile}
                onChange={(e) => setVolForm({ ...volForm, mobile: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-gray-900"
                placeholder="9876543210"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assigned District</label>
              <select
                value={volForm.district}
                onChange={(e) => setVolForm({ ...volForm, district: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-gray-900"
              >
                {['Bengaluru Urban', 'Ernakulam', 'Thrissur', 'Chennai', 'Thiruvananthapuram'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
              <input
                type="text"
                required
                value={volForm.password}
                onChange={(e) => setVolForm({ ...volForm, password: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-gray-900"
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-[11px] text-gray-500 leading-relaxed">
            💡 <strong>District Capacity Limit:</strong> There is a maximum limit of 3 volunteers per district. The system validates this limit prior to volunteer enrollment.
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowVolModal(false)}
              className="flex-1 py-2.5 border border-slate-200 text-gray-700 font-semibold rounded-xl text-xs hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              Create Volunteer
            </button>
          </div>
        </form>
      </Modal>

      {/* Credentials Confirmation Modal */}
      <Modal isOpen={showCredsModal} onClose={() => setShowCredsModal(false)} title="Volunteer Registered Successfully">
        <div className="space-y-4 text-left">
          <div className="w-12 h-12 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center mx-auto text-green-600 mb-2">
            <UserCheck className="w-6 h-6" />
          </div>

          <p className="text-xs text-gray-500 text-center leading-relaxed">
            The volunteer account has been created. An email containing login credentials has been sent to their registered email address.
          </p>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-2.5 text-xs font-mono select-all">
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-gray-405 font-sans">Full Name:</span>
              <span className="text-gray-750 font-bold">{createdVol?.fullName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-gray-405 font-sans">Username (Email):</span>
              <span className="text-gray-750 font-bold">{createdVol?.email}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-gray-405 font-sans">Password:</span>
              <span className="text-gray-750 font-bold">{createdVol?.password}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-405 font-sans">District:</span>
              <span className="text-gray-750 font-bold font-sans">{createdVol?.district}</span>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-800 flex gap-2 leading-relaxed">
            <Mail className="w-4 h-4 shrink-0 mt-0.5" />
            <p><strong>Email Dispatch Simulation:</strong> Login credentials have been dispatched to <strong>{createdVol?.email}</strong>. The user can now access their account immediately using these details.</p>
          </div>

          <button
            onClick={() => setShowCredsModal(false)}
            className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </Modal>
    </div>
  );
}
