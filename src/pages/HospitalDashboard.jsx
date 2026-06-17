import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useAppStore } from '../store/appStore.js';
import Modal from '../components/Modal.jsx';
import RequestCard from '../components/RequestCard.jsx';
import {
  Clock, ShieldAlert, LogOut, Plus, Droplets, MapPin,
  CheckCircle2, Users, Heart, ClipboardList, Send, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HospitalDashboard() {
  const { user, logout } = useAuthStore();
  const { requests, donors, createRequest, fulfillRequest, fetchRequests, triggerToast } = useAppStore();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    patientName: '',
    bloodGroup: 'O+',
    urgencyLevel: 'Moderate',
    unitsRequired: 1,
    contactNumber: user?.mobile || '',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  // -------------------------------------------------------------
  // PENDING APPROVAL VIEW
  // -------------------------------------------------------------
  if (user.status === 'Pending Approval') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center space-y-6"
        >
          {/* Animated pulsing warning/hourglass icon */}
          <div className="w-20 h-20 bg-amber-50 border border-amber-100 rounded-3xl flex items-center justify-center mx-auto relative">
            <Clock className="w-10 h-10 text-amber-500 animate-spin-slow" style={{ animationDuration: '6s' }} />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900">Registration Under Review</h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Welcome to JeevaLink, <strong>{user.fullName}</strong>. Your hospital profile has been submitted and is currently awaiting administrator verification.
            </p>
          </div>

          {/* Submitted Data Details Box */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-slate-200 pb-1.5">Submitted Details</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-400 block font-semibold">Hospital Name</span>
                <span className="text-gray-700 font-bold">{user.fullName}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Email</span>
                <span className="text-gray-700 font-bold">{user.email}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Mobile</span>
                <span className="text-gray-700 font-bold">{user.mobile}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">District / City</span>
                <span className="text-gray-700 font-bold">{user.district} / {user.city}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400 block font-semibold">Address</span>
                <span className="text-gray-700 font-bold">{user.address || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl text-xs text-amber-800 text-left flex gap-3 leading-relaxed">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p>
              For security reasons, access to donor listings and request postings is restricted until the administrator approves your hospital license credentials.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold rounded-2xl transition-all text-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </motion.div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // APPROVED HOSPITAL DASHBOARD VIEW
  // -------------------------------------------------------------
  // Filter requests posted by this hospital
  const hospitalRequests = requests.filter(
    (r) => r.hospitalName?.toLowerCase() === user.fullName?.toLowerCase()
  );
  
  const totalPosted = hospitalRequests.length;
  const fulfilledCount = hospitalRequests.filter((r) => r.status === 'Fulfilled').length;
  const pendingCount = hospitalRequests.filter((r) => r.status === 'Pending').length;

  // Get compatible donors matching hospital district
  const districtDonors = donors.filter(
    (d) => d.district?.toLowerCase() === user.district?.toLowerCase() && d.availableForDonation
  );

  const stats = [
    { label: 'Total Requests', value: totalPosted, icon: ClipboardList, color: 'text-blue-600 bg-blue-50' },
    { label: 'Pending Requests', value: pendingCount, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { label: 'Fulfilled Requests', value: fulfilledCount, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Local Donors Available', value: districtDonors.length, icon: Users, color: 'text-red-600 bg-red-50' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientName) {
      triggerToast('Please fill patient name.', 'warning');
      return;
    }

    const payload = {
      patientName: form.patientName,
      bloodGroup: form.bloodGroup,
      urgencyLevel: form.urgencyLevel,
      unitsRequired: Number(form.unitsRequired),
      contactNumber: form.contactNumber,
      hospitalName: user.fullName,
      city: user.city,
      district: user.district,
    };

    const res = await createRequest(payload);
    if (res.success) {
      setShowModal(false);
      setForm({
        patientName: '',
        bloodGroup: 'O+',
        urgencyLevel: 'Moderate',
        unitsRequired: 1,
        contactNumber: user.mobile || '',
      });
      // Refresh requests list
      fetchRequests();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/70 rounded-3xl p-6 text-slate-900 overflow-hidden shadow-sm border border-emerald-100/60"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-100/60 border border-emerald-200 text-emerald-700 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                ● Approved Hospital Account
              </span>
            </div>
            <h2 className="text-2xl font-black mb-1 text-slate-900">{user.fullName}</h2>
            <p className="text-slate-600 text-sm">{user.city}, {user.district} district</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl shadow-xl shadow-red-900/30 transition-all text-sm shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Request Emergency Blood
          </button>
        </div>
      </motion.div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
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

      {/* Split Dashboard panels */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Posted Requests list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Your Posted Blood Requests</h3>
            <span className="text-xs text-gray-400 font-semibold">{hospitalRequests.length} requests posted</span>
          </div>

          {hospitalRequests.length === 0 ? (
            <div className="card p-12 text-center text-gray-400">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30 text-gray-500" />
              <p className="text-sm font-bold">No blood requests posted yet.</p>
              <p className="text-xs text-gray-400 mt-1">Create an emergency request to seek compatible donors in your area.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {hospitalRequests.map((req) => (
                <div key={req._id} className="card p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4 text-left">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        req.urgencyLevel === 'Immediate' ? 'bg-red-50 text-primary' : req.urgencyLevel === 'Critical' ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {req.urgencyLevel}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold">
                        Posted {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-gray-900 truncate">
                      Patient: {req.patientName}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Units: <span className="font-bold text-gray-800">{req.unitsRequired}</span> | Contact: {req.contactNumber}
                    </p>
                    <p className="text-xs text-gray-400">
                      Status: <span className={`font-semibold ${req.status === 'Fulfilled' ? 'text-emerald-600' : 'text-amber-500'}`}>{req.status}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex flex-col items-center justify-center shrink-0">
                      <Droplets className="w-5 h-5 text-primary fill-primary" />
                      <span className="text-sm font-black text-gray-900 leading-none mt-0.5">{req.bloodGroup}</span>
                    </div>
                    {req.status === 'Pending' && (
                      <button
                        onClick={() => fulfillRequest(req._id)}
                        className="px-4 py-2.5 bg-emerald-650 hover:bg-emerald-705 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                      >
                        Mark Fulfilled
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Nearby Compatible Donors */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Active Donors in {user.district}</h3>
            <span className="text-xs text-gray-400 font-semibold">{districtDonors.length} available</span>
          </div>

          {districtDonors.length === 0 ? (
            <div className="card p-8 text-center text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-35" />
              <p className="text-xs font-semibold">No registered active donors found in your district.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {districtDonors.map((donor) => (
                <div key={donor._id} className="card p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-3 text-left">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{donor.fullName}</p>
                    <p className="text-[10px] text-gray-500">{donor.city} • {donor.distance} km</p>
                    <span className="text-[9px] bg-red-50 text-primary border border-red-100/50 px-2 py-0.5 rounded-full font-black mt-1 inline-block">
                      Group {donor.bloodGroup}
                    </span>
                  </div>
                  <button
                    onClick={() => triggerToast(`Emergency notification dispatched to ${donor.fullName}!`, 'success')}
                    className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-[10px] font-black rounded-lg cursor-pointer transition-all shrink-0"
                  >
                    Alert
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Post Request Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Request Emergency Blood">
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[11px] text-primary font-semibold flex gap-2">
            <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <p>
              Posting this request will immediately broadcast alerts to all compatible donors within {user.district} district.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Patient Name *</label>
            <input
              type="text"
              required
              value={form.patientName}
              onChange={(e) => setForm({ ...form, patientName: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-gray-905"
              placeholder="e.g. Rahul Sharma"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Required Blood Group</label>
              <select
                value={form.bloodGroup}
                onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-gray-905"
              >
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Units Required</label>
              <input
                type="number"
                min="1"
                max="20"
                value={form.unitsRequired}
                onChange={(e) => setForm({ ...form, unitsRequired: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-gray-905"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Urgency Level</label>
              <select
                value={form.urgencyLevel}
                onChange={(e) => setForm({ ...form, urgencyLevel: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-gray-905"
              >
                <option value="Moderate">Moderate</option>
                <option value="Critical">Critical</option>
                <option value="Immediate">Immediate / SOS</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact Phone</label>
              <input
                type="tel"
                value={form.contactNumber}
                onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-gray-905"
                placeholder="9876543210"
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-gray-500 space-y-1">
            <p>🏥 <strong>Hospital Location Pre-filled:</strong></p>
            <p>{user.fullName} • {user.city}, {user.district} (District)</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 py-3 border border-slate-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm shadow-xl shadow-red-200 transition-all flex items-center justify-center gap-1.5"
            >
              Post Request <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
