import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplets, Eye, CheckCircle2, XCircle, Clock, AlertTriangle,
  Flag, Activity, X, Zap
} from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable.jsx';
import FilterBar from '../../components/admin/FilterBar.jsx';
import ConfirmModal from '../../components/admin/ConfirmModal.jsx';

const StatusBadge = ({ status }) => {
  const map = {
    Pending:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Approved:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Fulfilled: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Rejected:  'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[status] || 'bg-slate-100 text-slate-500 border-slate-500/20'}`}>{status}</span>;
};

const UrgencyBadge = ({ level }) => {
  const isEmergency = level === 'Immediate' || level === 'Emergency SOS';
  const isUrgent = level === 'Critical' || level === 'Urgent';
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 w-fit ${
      isEmergency ? 'bg-red-500/10 text-red-400 border-red-500/20' :
      isUrgent ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
      'bg-slate-100 text-slate-500 border-slate-500/20'
    }`}>
      {isEmergency && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
      {level || 'Normal'}
    </span>
  );
};

export default function AdminBloodRequests() {
  const { requests, fetchRequests, fulfillRequest, rejectRequest, verifyRequest, triggerToast } = useAppStore();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'all', urgency: 'all', blood: 'all' });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null, req: null });
  const [viewReq, setViewReq] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchRequests(); }, []);

  const filtered = requests.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || [r.patientName, r.hospitalName, r.city, r.bloodGroup]
      .some(f => String(f || '').toLowerCase().includes(q));
    const matchStatus = filters.status === 'all' || r.status === filters.status;
    const matchUrgency = filters.urgency === 'all' || r.urgencyLevel === filters.urgency;
    const matchBlood = filters.blood === 'all' || r.bloodGroup === filters.blood;
    return matchSearch && matchStatus && matchUrgency && matchBlood;
  });

  const pending = requests.filter(r => r.status === 'Pending').length;
  const emergency = requests.filter(r => r.urgencyLevel === 'Immediate' || r.urgencyLevel === 'Emergency SOS').length;
  const completed = requests.filter(r => r.status === 'Fulfilled' || r.status === 'Completed').length;

  const handleAction = async (action, req) => {
    setLoading(true);
    if (action === 'complete') await fulfillRequest(req._id);
    else if (action === 'reject') await rejectRequest(req._id);
    else if (action === 'verify') await verifyRequest(req._id);
    setLoading(false);
    setConfirmModal({ open: false, action: null, req: null });
  };

  const columns = [
    { key: 'patientName', label: 'Patient', sortable: true, render: (val, row) => (
      <div className="flex items-center gap-2">
        {(row.urgencyLevel === 'Immediate' || row.urgencyLevel === 'Emergency SOS') && (
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shrink-0" />
        )}
        <div>
          <p className="text-slate-900 text-xs font-semibold">{val}</p>
          <p className="text-slate-600 text-[10px]">ID: {row._id}</p>
        </div>
      </div>
    )},
    { key: 'bloodGroup', label: 'Blood Group', render: (val) => (
      <span className="text-red-400 font-black text-sm">{val}</span>
    )},
    { key: 'unitsRequired', label: 'Units', render: (val) => (
      <span className="text-slate-900 font-bold text-xs">{val} units</span>
    )},
    { key: 'hospitalName', label: 'Hospital', sortable: true, render: (val, row) => (
      <div>
        <p className="text-slate-900 text-xs font-semibold truncate max-w-[140px]">{val}</p>
        <p className="text-slate-600 text-[10px]">{row.district}</p>
      </div>
    )},
    { key: 'urgencyLevel', label: 'Urgency', render: (val) => <UrgencyBadge level={val} /> },
    { key: 'status', label: 'Status', sortable: true, render: (val) => <StatusBadge status={val} /> },
    { key: 'verified', label: 'Verified', render: (val) => val
      ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      : <Clock className="w-4 h-4 text-amber-400" />
    },
    { key: 'requiredByDate', label: 'Required By', sortable: true, render: (val) => (
      <span className="text-slate-500 text-[10px]">{val ? new Date(val).toLocaleDateString('en-IN') : '—'}</span>
    )},
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 text-xl font-black">Blood Request Management</h1>
          <p className="text-slate-500 text-xs mt-0.5">{requests.length} total requests · {pending} pending</p>
        </div>
        <div className="flex items-center gap-2">
          {emergency > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl animate-pulse">
              <Zap className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-400 text-xs font-black">{emergency} Emergency</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pending', value: pending, icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
          { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Emergency', value: emergency, icon: AlertTriangle, color: 'text-red-400 bg-red-500/10 border-red-500/20', pulse: true },
        ].map(({ label, value, icon: Icon, color, pulse }) => (
          <div key={label} className={`bg-white border rounded-2xl p-4 flex items-center gap-3 ${color.split(' ').find(c => c.startsWith('border'))}`}>
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${color}`}>
              <Icon className={`w-4.5 h-4.5 ${color.split(' ')[0]}`} style={{width:'18px',height:'18px'}} />
            </div>
            <div>
              <p className={`text-xl font-black ${color.split(' ')[0]}`}>{value}</p>
              <p className="text-slate-500 text-[10px] font-semibold">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
        <FilterBar
          search={search} onSearch={setSearch}
          searchPlaceholder="Search by patient, hospital, blood group..."
          filters={[
            { key: 'status', label: 'Status', options: [
              { value: 'Pending', label: 'Pending' },
              { value: 'Fulfilled', label: 'Fulfilled' },
              { value: 'Rejected', label: 'Rejected' },
            ]},
            { key: 'urgency', label: 'Urgency', options: [
              { value: 'Immediate', label: 'Emergency SOS' },
              { value: 'Critical', label: 'Critical' },
              { value: 'Normal', label: 'Normal' },
            ]},
            { key: 'blood', label: 'Blood Group', options: ['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bg => ({ value: bg, label: bg })) },
          ]}
          filterValues={filters}
          onFilterChange={(k, v) => setFilters(f => ({ ...f, [k]: v }))}
          dateFrom={dateFrom} dateTo={dateTo}
          onDateFrom={setDateFrom} onDateTo={setDateTo}
          onReset={() => { setSearch(''); setFilters({ status: 'all', urgency: 'all', blood: 'all' }); setDateFrom(''); setDateTo(''); }}
        />

        <AdminTable
          columns={columns}
          data={filtered}
          pageSize={20}
          searchKeys={['patientName', 'hospitalName', 'bloodGroup', 'city']}
          emptyMessage="No blood requests found."
          rowActions={(row) => (
            <div className="flex items-center gap-1">
              <button onClick={() => setViewReq(row)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer" title="View Details">
                <Eye className="w-3.5 h-3.5" />
              </button>
              {!row.verified && (
                <button onClick={() => setConfirmModal({ open: true, action: 'verify', req: row })} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer" title="Verify">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              )}
              {row.status === 'Pending' && (
                <>
                  <button onClick={() => setConfirmModal({ open: true, action: 'complete', req: row })} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer" title="Mark Complete">
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setConfirmModal({ open: true, action: 'reject', req: row })} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer" title="Reject">
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          )}
        />
      </div>

      {/* View Request Modal */}
      <AnimatePresence>
        {viewReq && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={() => setViewReq(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-black">Request Details</h3>
                  <button onClick={() => setViewReq(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-slate-50 cursor-pointer"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex items-center gap-3 mb-5 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <span className="text-red-400 font-black text-lg">{viewReq.bloodGroup}</span>
                  </div>
                  <div>
                    <p className="text-white font-black">{viewReq.patientName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusBadge status={viewReq.status} />
                      <UrgencyBadge level={viewReq.urgencyLevel} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Hospital', val: viewReq.hospitalName },
                    { label: 'District', val: viewReq.district },
                    { label: 'Units Required', val: `${viewReq.unitsRequired} units` },
                    { label: 'Required By', val: viewReq.requiredByDate ? new Date(viewReq.requiredByDate).toLocaleDateString('en-IN') : '—' },
                    { label: 'Contact', val: viewReq.contactNumber || '—' },
                    { label: 'Verified', val: viewReq.verified ? '✓ Verified' : '⏳ Pending Verification' },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500 text-xs">{label}</span>
                      <span className="text-slate-900 text-xs font-semibold">{val}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-5">
                  {viewReq.status === 'Pending' && (
                    <>
                      <button onClick={() => { setConfirmModal({ open: true, action: 'complete', req: viewReq }); setViewReq(null); }}
                        className="flex-1 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-500/20 transition-colors cursor-pointer">
                        Mark Complete
                      </button>
                      <button onClick={() => { setConfirmModal({ open: true, action: 'reject', req: viewReq }); setViewReq(null); }}
                        className="flex-1 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/20 transition-colors cursor-pointer">
                        Reject
                      </button>
                    </>
                  )}
                  {viewReq.status !== 'Pending' && (
                    <button onClick={() => setViewReq(null)} className="flex-1 py-2.5 bg-slate-50 border border-slate-100 text-slate-900 text-xs font-bold rounded-xl cursor-pointer">Close</button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, action: null, req: null })}
        loading={loading}
        onConfirm={() => handleAction(confirmModal.action, confirmModal.req)}
        title={confirmModal.action === 'complete' ? 'Mark as Completed' : confirmModal.action === 'reject' ? 'Reject Request' : 'Verify Request'}
        message={`${confirmModal.action === 'complete' ? 'Mark this blood request as fulfilled/completed?' : confirmModal.action === 'reject' ? 'Reject and remove this blood request? This cannot be undone.' : 'Verify this blood request as legitimate?'}`}
        confirmLabel={confirmModal.action === 'complete' ? 'Mark Complete' : confirmModal.action === 'reject' ? 'Reject' : 'Verify'}
        variant={confirmModal.action === 'reject' ? 'danger' : 'info'}
      />
    </div>
  );
}
