import React, { useState } from 'react';
import { Droplet, Clock, Building2, Phone, CheckCircle2, ShieldAlert, Flag, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/appStore.js';
import { useAuthStore } from '../store/authStore.js';
import Modal from './Modal.jsx';

const urgencyConfig = {
  Immediate: { cls: 'badge-immediate', icon: ShieldAlert },
  Critical:  { cls: 'badge-critical',  icon: ShieldAlert },
  Moderate:  { cls: 'badge-moderate',  icon: Clock },
};

const bloodColors = {
  'A+':'bg-red-100 text-red-700','A-':'bg-rose-100 text-rose-700',
  'B+':'bg-orange-100 text-orange-700','B-':'bg-amber-100 text-amber-700',
  'AB+':'bg-purple-100 text-purple-700','AB-':'bg-violet-100 text-violet-700',
  'O+':'bg-blue-100 text-blue-700','O-':'bg-teal-100 text-teal-700',
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function RequestCard({ request, showActions = true }) {
  const { user } = useAuthStore();
  const { fulfillRequest, fileComplaint, allUsers } = useAppStore();
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const urg = urgencyConfig[request.urgencyLevel] || urgencyConfig.Moderate;
  const UrgIcon = urg.icon;

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason) return;
    
    // Find the hospital's user ID by searching the database by hospitalName
    const targetHospital = allUsers.find(
      (u) => u.role === 'hospital' && u.fullName?.toLowerCase() === request.hospitalName?.toLowerCase()
    );
    const targetId = targetHospital ? targetHospital._id : 'unknown';

    const res = await fileComplaint({
      reporterName: user?.fullName || 'Anonymous User',
      reporterId: user?._id || 'guest',
      targetName: request.hospitalName || 'Unknown Hospital',
      targetId: targetId,
      reason: `[Patient: ${request.patientName}] ${reportReason}`,
    });

    if (res.success) {
      setShowReportModal(false);
      setReportReason('');
    }
  };

  return (
    <div className={`card p-4 relative overflow-hidden text-left ${request.urgencyLevel === 'Immediate' ? 'border-red-200 ring-1 ring-red-100' : ''}`}>
      {/* SOS ribbon */}
      {request.urgencyLevel === 'Immediate' && (
        <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-bl-xl tracking-wider">
          🚨 SOS
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={urg.cls}>
            <UrgIcon className="w-2.5 h-2.5 inline mr-1" />{request.urgencyLevel}
          </span>
          <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" />{timeAgo(request.createdAt)}
          </span>
          {request.verified && (
            <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" /> Verified
            </span>
          )}
        </div>
        
        {/* Blood group badge & Report icon */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className={`px-2.5 py-1 rounded-xl text-sm font-black ${bloodColors[request.bloodGroup] || 'bg-gray-100 text-gray-700'}`}>
            {request.bloodGroup}
          </div>
          {user && (
            <button
              onClick={() => setShowReportModal(true)}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
              title="Report Hospital/Request"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Patient + Hospital */}
      <h4 className="text-sm font-bold text-gray-900 mb-1">{request.patientName}</h4>
      <div className="flex items-center gap-1.5 text-xs text-gray-550 mb-3">
        <Building2 className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{request.hospitalName}, {request.city}</span>
      </div>

      {/* Units + Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Droplet className="w-4 h-4 text-primary fill-primary" />
          <span className="text-xs font-bold text-gray-700">{request.unitsRequired} units needed</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          request.status === 'Fulfilled'
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {request.status}
        </span>
      </div>

      {/* Actions */}
      {showActions && request.status === 'Pending' && (
        <div className="flex gap-2">
          <a
            href={`tel:${request.contactNumber}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <Phone className="w-3.5 h-3.5" /> Call
          </a>
          <button
            onClick={() => fulfillRequest(request._id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl transition-colors shadow-md shadow-red-200 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Fulfill
          </button>
        </div>
      )}

      {/* Report Modal */}
      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title={`Report Hospital: ${request.hospitalName}`}>
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[11px] text-primary font-semibold flex gap-2">
            <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <p>Please report any issues regarding this blood request or hospital. The administrator will review and take actions including warning or suspension.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Reason for Report</label>
            <select
              required
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-gray-900"
            >
              <option value="">Select a reason</option>
              <option value="Fake or duplicate blood request">Fake or duplicate blood request</option>
              <option value="Commercial use or demanding payment for blood">Commercial use or demanding payment for blood</option>
              <option value="Incorrect patient, units, or urgency information">Incorrect patient, units, or urgency information</option>
              <option value="Inappropriate contact behavior by hospital staff">Inappropriate contact behavior by hospital staff</option>
              <option value="Other reason (specify in detail)">Other reason (specify in detail)</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowReportModal(false)}
              className="flex-1 py-2.5 border border-slate-200 text-gray-700 font-semibold rounded-xl text-xs hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              Submit Report
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
