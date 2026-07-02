import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Eye, Edit2, ShieldCheck, Mail, Save, X, Loader2, KeyRound, Phone, MapPin
} from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable.jsx';
import FilterBar from '../../components/admin/FilterBar.jsx';
import CameraCapture from '../../components/CameraCapture.jsx';
import { getStorageUrl } from '../../store/api.js';

const STATUS_OPTIONS = ['active', 'inactive', 'suspended', 'pending_approval'];
const ROLES = ['donor', 'patient', 'hospital'];

const StatusBadge = ({ status }) => {
  const map = {
    Active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    Inactive: 'bg-slate-100 text-slate-600 border-slate-500/20',
    inactive: 'bg-slate-100 text-slate-600 border-slate-500/20',
    Suspended: 'bg-red-500/10 text-red-600 border-red-500/20',
    'Pending Approval': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[status] || 'bg-slate-100 text-slate-500 border-slate-500/20'}`}>
      {status}
    </span>
  );
};

export default function UserManagement() {
  const { allUsers, fetchUsers, volunteerSendOtp, volunteerVerifyOtp, volunteerUpdateUser, volunteerAddUser, triggerToast } = useAppStore();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'all', role: 'all' });
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const users = allUsers.filter(u => u.role !== 'admin' && u.role !== 'volunteer');

  const filtered = users.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !q || [v.fullName, v.email, v.mobile].some(f => String(f || '').toLowerCase().includes(q));
    const matchStatus = filters.status === 'all' || (v.status || '').toLowerCase() === filters.status;
    const matchRole = filters.role === 'all' || (v.role || '').toLowerCase() === filters.role;
    return matchSearch && matchStatus && matchRole;
  });

  const handleSendOtp = async () => {
    if (!selectedUser) return;
    setLoading(true);
    const res = await volunteerSendOtp(selectedUser._id);
    if (res.success) {
      setOtpSent(true);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      triggerToast('Please enter a valid 6-digit OTP', 'warning');
      return;
    }
    setLoading(true);
    const res = await volunteerVerifyOtp(selectedUser._id, otpCode);
    if (res.success) {
      setOtpVerified(true);
      // Pre-fill form
      setForm({
        full_name: selectedUser.fullName || '',
        email: selectedUser.email || '',
        mobile: selectedUser.mobile || '',
        blood_group: selectedUser.bloodGroup || 'N/A',
        district: selectedUser.district || '',
        city: selectedUser.city || '',
      });
    }
    setLoading(false);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await volunteerUpdateUser(selectedUser._id, form);
    if (res.success) {
      setShowEditModal(false);
      setOtpSent(false);
      setOtpVerified(false);
      setOtpCode('');
    }
    setLoading(false);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!form.profile_picture) {
      triggerToast('Profile photo is required. Please capture a selfie.', 'warning');
      return;
    }
    setLoading(true);

    const fd = new FormData();
    Object.keys(form).forEach(key => {
      fd.append(key, form[key]);
    });

    const res = await volunteerAddUser(fd);
    if (res.success) {
      setShowAddModal(false);
      setForm({});
    }
    setLoading(false);
  };

  const columns = [
    { key: 'fullName', label: 'Name', sortable: true, render: (val, row) => (
      <div className="flex items-center gap-3">
        <img 
          src={getStorageUrl(row.profilePicture) || `https://api.dicebear.com/7.x/initials/svg?seed=${val}`} 
          alt={val} 
          className="w-8 h-8 rounded-full object-cover border border-slate-100" 
        />
        <div>
          <p className="text-slate-900 text-xs font-semibold">{val}</p>
          <p className="text-slate-600 text-[10px]">{row.email}</p>
        </div>
      </div>
    )},
    { key: 'mobile', label: 'Phone', render: (val) => <span className="text-slate-500 text-xs font-mono">{val || '—'}</span> },
    { key: 'role', label: 'Role', render: (val) => (
      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-full capitalize">{val || 'User'}</span>
    )},
    { key: 'district', label: 'Location', render: (val, row) => <span className="text-slate-500 text-[10px]">{row.city ? `${row.city}, ` : ''}{val}</span> },
    { key: 'status', label: 'Status', sortable: true, render: (val) => <StatusBadge status={val} /> },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Manage Users</h1>
          <p className="text-sm text-gray-500 mt-1">Review and manage platform users</p>
        </div>
        <button 
          onClick={() => { 
            setForm({ role: 'donor', blood_group: 'N/A' }); 
            setShowAddModal(true); 
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors text-sm font-bold shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Table Card */}
      <div className="card overflow-hidden p-0 border border-slate-100">
        <FilterBar
          search={search} onSearch={setSearch}
          searchPlaceholder="Search by name, email, phone..."
          filters={[
            { key: 'status', label: 'Status', options: STATUS_OPTIONS.map(s => ({ value: s, label: s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) })) },
            { key: 'role', label: 'Role', options: ROLES.map(r => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) })) },
          ]}
          filterValues={filters}
          onFilterChange={(k, v) => setFilters(f => ({ ...f, [k]: v }))}
          onReset={() => { setSearch(''); setFilters({ status: 'all', role: 'all' }); }}
        />

        <AdminTable
          columns={columns}
          data={filtered}
          pageSize={15}
          searchKeys={['fullName', 'email', 'mobile']}
          emptyMessage="No users found."
          rowActions={(row) => (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setSelectedUser(row); setShowViewModal(true); }}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:text-primary hover:bg-red-50 transition-colors cursor-pointer"
                title="View"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => { 
                  setSelectedUser(row); 
                  setOtpSent(false);
                  setOtpVerified(false);
                  setOtpCode('');
                  setShowEditModal(true); 
                }}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:text-primary hover:bg-red-50 transition-colors cursor-pointer"
                title="Secure Edit"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            </div>
          )}
        />
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && selectedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setShowViewModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100"><X className="w-4 h-4" /></button>
              <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> User Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {selectedUser.profilePicture ? (
                    <img 
                      src={getStorageUrl(selectedUser.profilePicture)} 
                      alt={selectedUser.fullName} 
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 animate-fade-in" 
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center font-black text-xl">{selectedUser.fullName?.[0]}</div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900">{selectedUser.fullName}</p>
                    <p className="text-xs text-gray-500 capitalize">{selectedUser.role} • {selectedUser.status}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-slate-100 p-3 rounded-xl"><p className="text-[10px] font-bold text-gray-400 mb-1 flex items-center gap-1"><Mail className="w-3 h-3"/> Email</p><p className="text-xs font-semibold text-gray-800 truncate">{selectedUser.email}</p></div>
                  <div className="bg-white border border-slate-100 p-3 rounded-xl"><p className="text-[10px] font-bold text-gray-400 mb-1 flex items-center gap-1"><Phone className="w-3 h-3"/> Phone</p><p className="text-xs font-semibold text-gray-800">{selectedUser.mobile}</p></div>
                  <div className="bg-white border border-slate-100 p-3 rounded-xl"><p className="text-[10px] font-bold text-gray-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> District</p><p className="text-xs font-semibold text-gray-800">{selectedUser.district || '—'}</p></div>
                  <div className="bg-white border border-slate-100 p-3 rounded-xl"><p className="text-[10px] font-bold text-gray-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> City</p><p className="text-xs font-semibold text-gray-800">{selectedUser.city || '—'}</p></div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secure Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
              <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"><X className="w-4 h-4" /></button>
              
              <div className="mb-6">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-primary" /> Secure Profile Edit
                </h3>
                <p className="text-xs text-gray-500 mt-1">Editing {selectedUser.fullName}'s profile</p>
              </div>

              {!otpVerified ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                    <KeyRound className="w-8 h-8 text-amber-500" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Authorization Required</h4>
                  <p className="text-xs text-gray-600 mb-6 px-4">
                    To edit a user's details, you must first verify their consent via OTP sent to <b>{selectedUser.email}</b>.
                  </p>
                  
                  {!otpSent ? (
                    <button 
                      onClick={handleSendOtp} 
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-primary to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                      Send OTP Code
                    </button>
                  ) : (
                    <div className="space-y-4 animate-fade-in-up">
                      <div className="bg-green-50 text-green-700 text-xs font-bold p-3 rounded-xl border border-green-100">
                        Code sent! Please ask the user for the 6-digit OTP.
                      </div>
                      <input 
                        type="text" 
                        maxLength={6} 
                        placeholder="Enter 6-digit OTP" 
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center tracking-[0.5em] font-mono text-xl py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                      <button 
                        onClick={handleVerifyOtp} 
                        disabled={loading || otpCode.length !== 6}
                        className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code & Unlock'}
                      </button>
                      <button 
                        onClick={handleSendOtp}
                        className="text-xs font-bold text-primary hover:underline cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleUpdateSubmit} className="space-y-4 animate-fade-in-up">
                  <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <p className="text-xs font-bold text-emerald-700">Access Granted. You may now edit the details.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Full Name</label>
                      <input type="text" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Blood Group</label>
                      <select value={form.blood_group} onChange={e => setForm({...form, blood_group: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all">
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'N/A'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Mobile</label>
                      <input type="tel" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Email</label>
                      <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">City</label>
                      <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">District</label>
                      <input type="text" value={form.district} onChange={e => setForm({...form, district: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full mt-4 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Changes
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
              <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
              
              <div className="mb-6">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <Plus className="w-6 h-6 text-primary" /> Add New User
                </h3>
                <p className="text-xs text-gray-500 mt-1">A password will be generated and emailed to the user.</p>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 flex flex-col items-center pb-2 border-b border-slate-100">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 text-center w-full">
                      Profile Picture (Selfie)
                    </label>
                    <CameraCapture
                      value={form.profile_picture}
                      onCapture={(file) => setForm({ ...form, profile_picture: file })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Blood Group</label>
                    <select value={form.blood_group} onChange={e => setForm({...form, blood_group: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all">
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'N/A'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Sex / Gender</label>
                    <select value={form.sex || ''} onChange={e => setForm({...form, sex: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" required>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="transgender">Transgender</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Date of Birth</label>
                    <input type="date" value={form.dob || ''} onChange={e => setForm({...form, dob: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Full Name</label>
                    <input type="text" value={form.full_name || ''} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Mobile</label>
                    <input type="tel" value={form.mobile || ''} onChange={e => setForm({...form, mobile: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Email</label>
                    <input type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" required />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Full Address</label>
                    <input type="text" value={form.full_address || ''} onChange={e => setForm({...form, full_address: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="House No, Street Name" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">PIN Code</label>
                    <input type="text" value={form.pincode || ''} onChange={e => setForm({...form, pincode: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" maxLength={6} required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">City</label>
                    <input type="text" value={form.city || ''} onChange={e => setForm({...form, city: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">District</label>
                    <input type="text" value={form.district || ''} onChange={e => setForm({...form, district: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">ID Proof Front</label>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setForm({...form, id_proof_front: e.target.files[0]})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-red-700" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">ID Proof Back</label>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setForm({...form, id_proof_back: e.target.files[0]})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-red-700" required />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full mt-4 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg shadow-gray-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />} Create User
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
