import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Eye, Edit2, Trash2, UserCheck, UserX, Lock, Download,
  CheckCircle2, XCircle, Clock, ChevronDown, X, Save, Phone, Mail,
  MapPin, Building2, Hash, StickyNote
} from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable.jsx';
import FilterBar from '../../components/admin/FilterBar.jsx';
import ConfirmModal from '../../components/admin/ConfirmModal.jsx';

const DISTRICTS = ['Ernakulam', 'Thrissur', 'Thiruvananthapuram', 'Kozhikode', 'Bengaluru Urban', 'Chennai', 'Mumbai', 'Delhi', 'Kottayam', 'Palakkad'];
const VOLUNTEER_TYPES = ['Medical', 'Transport', 'Blood Bank', 'Community', 'Emergency Response', 'Administrative'];
const STATUS_OPTIONS = ['active', 'inactive', 'blocked', 'under_review'];

const StatusBadge = ({ status }) => {
  const map = {
    Active:        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    active:        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Inactive:      'bg-slate-500/10 text-slate-400 border-slate-500/20',
    inactive:      'bg-slate-500/10 text-slate-400 border-slate-500/20',
    Suspended:     'bg-red-500/10 text-red-400 border-red-500/20',
    blocked:       'bg-red-500/10 text-red-400 border-red-500/20',
    Blocked:       'bg-red-500/10 text-red-400 border-red-500/20',
    under_review:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Under Review':'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Pending Approval': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
      {status}
    </span>
  );
};

const emptyVolForm = {
  fullName: '', email: '', mobile: '', secondaryPhone: '',
  organizationName: '', volunteerType: 'Medical', pinCode: '',
  address: '', district: 'Ernakulam', city: '', status: 'Active', remarks: ''
};

export default function VolunteerManagement() {
  const { allUsers, fetchUsers, updateUserStatus, triggerToast } = useAppStore();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'all', district: 'all', type: 'all' });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVol, setSelectedVol] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null, vol: null });
  const [form, setForm] = useState(emptyVolForm);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const volunteers = allUsers.filter(u => u.role === 'volunteer' || u.role === 'Volunteer');

  const filtered = volunteers.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !q || [v.fullName, v.email, v.mobile, v.district, v.organizationName || '']
      .some(f => String(f || '').toLowerCase().includes(q));
    const matchStatus = filters.status === 'all' || (v.status || '').toLowerCase() === filters.status;
    const matchDistrict = filters.district === 'all' || v.district === filters.district;
    const matchType = filters.type === 'all' || v.volunteerType === filters.type;
    return matchSearch && matchStatus && matchDistrict && matchType;
  });

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Organization', 'Type', 'District', 'City', 'PIN', 'Status', 'Registered'];
    const rows = filtered.map(v => [
      v.fullName, v.email, v.mobile, v.organizationName || '', v.volunteerType || '',
      v.district, v.city, v.pinCode || '', v.status, v.joinedAt || v.created_at || ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `volunteers_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    triggerToast('CSV exported successfully!', 'success');
  };

  const handleStatusAction = async (vol, newStatus) => {
    setLoading(true);
    await updateUserStatus(vol._id, newStatus);
    setLoading(false);
    setConfirmModal({ open: false, action: null, vol: null });
  };

  const handleBulkAction = async (ids) => {
    for (const id of ids) await updateUserStatus(id, 'Inactive');
    triggerToast(`${ids.length} volunteers deactivated.`, 'warning');
  };

  const columns = [
    { key: 'fullName', label: 'Name', sortable: true, render: (val, row) => (
      <div>
        <p className="text-slate-200 text-xs font-semibold">{val}</p>
        <p className="text-slate-600 text-[10px]">{row.email}</p>
      </div>
    )},
    { key: 'mobile', label: 'Phone', render: (val) => <span className="text-slate-400 text-xs font-mono">{val || '—'}</span> },
    { key: 'organizationName', label: 'Organization', render: (val) => <span className="text-slate-400 text-xs">{val || '—'}</span> },
    { key: 'volunteerType', label: 'Type', render: (val) => (
      <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full">{val || 'General'}</span>
    )},
    { key: 'district', label: 'District', sortable: true, render: (val) => <span className="text-slate-400 text-xs">{val}</span> },
    { key: 'status', label: 'Status', sortable: true, render: (val) => <StatusBadge status={val} /> },
    { key: 'joinedAt', label: 'Registered', sortable: true, render: (val, row) => (
      <span className="text-slate-600 text-[10px]">{new Date(val || row.created_at || Date.now()).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</span>
    )},
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-black">Volunteer Management</h1>
          <p className="text-slate-500 text-xs mt-0.5">{volunteers.length} total volunteers registered</p>
        </div>
        <button
          onClick={() => { setForm(emptyVolForm); setFormError(''); setShowAddModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-lg shadow-red-500/20"
        >
          <Plus className="w-4 h-4" /> Add Volunteer
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-[#141929] border border-white/[0.06] rounded-2xl overflow-hidden">
        {/* Filter Bar */}
        <FilterBar
          search={search} onSearch={setSearch}
          searchPlaceholder="Search by name, email, phone, organization..."
          filters={[
            { key: 'status', label: 'Status', options: STATUS_OPTIONS.map(s => ({ value: s, label: s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) })) },
            { key: 'district', label: 'District', options: DISTRICTS.map(d => ({ value: d, label: d })) },
            { key: 'type', label: 'Type', options: VOLUNTEER_TYPES.map(t => ({ value: t, label: t })) },
          ]}
          filterValues={filters}
          onFilterChange={(k, v) => setFilters(f => ({ ...f, [k]: v }))}
          dateFrom={dateFrom} dateTo={dateTo}
          onDateFrom={setDateFrom} onDateTo={setDateTo}
          onReset={() => { setSearch(''); setFilters({ status: 'all', district: 'all', type: 'all' }); setDateFrom(''); setDateTo(''); }}
        />

        {/* Table */}
        <AdminTable
          columns={columns}
          data={filtered}
          pageSize={25}
          onExport={exportCSV}
          searchKeys={['fullName', 'email', 'mobile', 'district', 'organizationName']}
          emptyMessage="No volunteers found matching the selected filters."
          selectable
          bulkLabel="Deactivate Selected"
          onBulkAction={handleBulkAction}
          rowActions={(row) => (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setSelectedVol(row); setShowViewModal(true); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
                title="View Details"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { setSelectedVol(row); setForm({ ...emptyVolForm, ...row }); setShowEditModal(true); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                title="Edit"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              {row.status === 'Active' ? (
                <button
                  onClick={() => setConfirmModal({ open: true, action: 'deactivate', vol: row })}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                  title="Deactivate"
                >
                  <UserX className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setConfirmModal({ open: true, action: 'activate', vol: row })}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                  title="Activate"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setConfirmModal({ open: true, action: 'block', vol: row })}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Block"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        />
      </div>

      {/* View Details Modal */}
      <AnimatePresence>
        {showViewModal && selectedVol && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={() => setShowViewModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4">
              <div className="bg-[#141929] border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white font-black">Volunteer Details</h3>
                  <button onClick={() => setShowViewModal(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
                </div>
                {/* Avatar row */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-xl">
                    {selectedVol.fullName?.[0] || 'V'}
                  </div>
                  <div>
                    <p className="text-white font-black text-base">{selectedVol.fullName}</p>
                    <StatusBadge status={selectedVol.status} />
                    <p className="text-slate-500 text-[10px] mt-0.5">ID: {selectedVol._id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Mail, label: 'Email', val: selectedVol.email },
                    { icon: Phone, label: 'Phone', val: selectedVol.mobile || '—' },
                    { icon: Building2, label: 'Organization', val: selectedVol.organizationName || '—' },
                    { icon: Users, label: 'Type', val: selectedVol.volunteerType || '—' },
                    { icon: MapPin, label: 'District', val: selectedVol.district },
                    { icon: Hash, label: 'PIN Code', val: selectedVol.pinCode || '—' },
                    { icon: MapPin, label: 'City', val: selectedVol.city || '—' },
                    { icon: Clock, label: 'Registered', val: new Date(selectedVol.joinedAt || selectedVol.created_at || Date.now()).toLocaleDateString('en-IN') },
                  ].map(({ icon: Icon, label, val }) => (
                    <div key={label} className="bg-white/5 border border-white/[0.06] rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Icon className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-500 text-[10px] font-bold uppercase">{label}</span>
                      </div>
                      <p className="text-slate-300 text-xs font-semibold truncate">{val}</p>
                    </div>
                  ))}
                </div>
                {selectedVol.remarks && (
                  <div className="mt-3 bg-amber-500/5 border border-amber-500/10 rounded-xl p-3">
                    <p className="text-amber-400 text-[10px] font-bold mb-1 flex items-center gap-1"><StickyNote className="w-3 h-3" /> Remarks</p>
                    <p className="text-slate-400 text-xs">{selectedVol.remarks}</p>
                  </div>
                )}
                <button onClick={() => setShowViewModal(false)} className="w-full mt-4 py-2.5 bg-white/5 border border-white/10 text-slate-300 text-xs font-bold rounded-xl hover:bg-white/8 transition-colors cursor-pointer">Close</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="bg-[#141929] border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white font-black">{showAddModal ? 'Add New Volunteer' : 'Edit Volunteer'}</h3>
                  <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
                </div>
                {formError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
                    <XCircle className="w-4 h-4 shrink-0" /> {formError}
                  </div>
                )}
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!form.fullName || !form.email || !form.mobile) { setFormError('Name, email, and phone are required.'); return; }
                  setLoading(true);
                  // In real app, call API. Here we just show success toast.
                  await new Promise(r => setTimeout(r, 600));
                  triggerToast(showAddModal ? 'Volunteer added successfully!' : 'Volunteer updated!', 'success');
                  setShowAddModal(false); setShowEditModal(false);
                  setLoading(false);
                }} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'fullName', label: 'Full Name', type: 'text', placeholder: 'e.g. Sreejith Nair' },
                      { key: 'email', label: 'Email', type: 'email', placeholder: 'volunteer@example.com' },
                      { key: 'mobile', label: 'Phone Number', type: 'tel', placeholder: '9876543210' },
                      { key: 'secondaryPhone', label: 'Secondary Phone', type: 'tel', placeholder: 'Optional' },
                      { key: 'organizationName', label: 'Organization Name', type: 'text', placeholder: 'e.g. Red Cross' },
                      { key: 'pinCode', label: 'PIN Code', type: 'text', placeholder: '682001' },
                    ].map(({ key, label, type, placeholder }) => (
                      <div key={key}>
                        <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">{label}</label>
                        <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-200 text-xs placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 transition-colors" />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Volunteer Type</label>
                      <select value={form.volunteerType} onChange={e => setForm(f => ({ ...f, volunteerType: e.target.value }))}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-red-500/50 transition-colors cursor-pointer">
                        {VOLUNTEER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">District</label>
                      <select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-red-500/50 transition-colors cursor-pointer">
                        {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">City</label>
                      <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="e.g. Kochi"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-200 text-xs placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Status</label>
                      <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-red-500/50 transition-colors cursor-pointer">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Blocked</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Address</label>
                    <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Full address"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-200 text-xs placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Remarks</label>
                    <textarea value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Internal notes..."
                      rows={2}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-200 text-xs placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 transition-colors resize-none" />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                      className="flex-1 py-2.5 bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold rounded-xl hover:bg-white/8 transition-colors cursor-pointer">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading}
                      className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20">
                      <Save className="w-3.5 h-3.5" /> {showAddModal ? 'Create Volunteer' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, action: null, vol: null })}
        loading={loading}
        onConfirm={() => {
          const statusMap = { activate: 'Active', deactivate: 'Inactive', block: 'Suspended' };
          handleStatusAction(confirmModal.vol, statusMap[confirmModal.action]);
        }}
        title={confirmModal.action === 'block' ? 'Block Volunteer' : confirmModal.action === 'activate' ? 'Activate Volunteer' : 'Deactivate Volunteer'}
        message={`Are you sure you want to ${confirmModal.action} ${confirmModal.vol?.fullName}? This will ${confirmModal.action === 'activate' ? 'restore their access' : confirmModal.action === 'block' ? 'revoke all access immediately' : 'suspend their operational access'}.`}
        confirmLabel={confirmModal.action === 'block' ? 'Block User' : confirmModal.action === 'activate' ? 'Activate' : 'Deactivate'}
        variant={confirmModal.action === 'block' ? 'danger' : confirmModal.action === 'activate' ? 'info' : 'warning'}
      />
    </div>
  );
}
