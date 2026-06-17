import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore.js';
import { useAuthStore } from '../store/authStore.js';
import RequestCard from '../components/RequestCard.jsx';
import {
  ClipboardList, CheckCircle2, XCircle, Clock, Users,
  Activity, ShieldCheck, Bell, ArrowRight, Siren, Award, MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function VolunteerDashboard() {
  const { requests, donors, notifications, fetchRequests, fetchNotifications, verifyRequest, rejectRequest, triggerToast } = useAppStore();
  const { user } = useAuthStore();
  const [tab, setTab] = useState('pending');
  const [selectedMatchReq, setSelectedMatchReq] = useState(null);

  useEffect(() => {
    fetchRequests();
    fetchNotifications();
  }, []);

  const COMPATIBILITY_MAP = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
  };

  const getCompatibleDonors = (bloodGroup) => {
    const compatibleGroups = COMPATIBILITY_MAP[bloodGroup] || [];
    return donors.filter((d) => d.availableForDonation && compatibleGroups.includes(d.bloodGroup));
  };

  const unverified = requests.filter((r) => !r.verified && r.status === 'Pending');
  const verified   = requests.filter((r) =>  r.verified && r.status === 'Pending');
  const fulfilled  = requests.filter((r) => r.status === 'Fulfilled');

  const stats = [
    { label: 'Pending Verification', value: unverified.length, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Verified Today', value: verified.length, icon: ShieldCheck, color: 'text-green-600 bg-green-50' },
    { label: 'Fulfilled', value: fulfilled.length, icon: CheckCircle2, color: 'text-blue-600 bg-blue-50' },
    { label: 'Notifications', value: notifications.filter((n) => !n.read).length, icon: Bell, color: 'text-purple-600 bg-purple-50' },
  ];

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
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-605 flex items-center justify-center shrink-0 border border-emerald-100">
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
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  const tabRequests = tab === 'pending' ? unverified : tab === 'verified' ? verified : fulfilled;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Volunteer Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Hello, {user?.fullName?.split(' ')[0]} — review and verify blood requests</p>
        </div>
        <span className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-xl border border-purple-100">
          Volunteer
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card p-4">
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 font-semibold">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Requests queue */}
        <div className="lg:col-span-2 card p-5 text-left">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Request Queue</h3>
          </div>
          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-5 gap-1">
            {[['pending', 'Needs Verification', unverified.length], ['verified', 'Verified', verified.length], ['fulfilled', 'Fulfilled', fulfilled.length]].map(([val, label, count]) => (
              <button key={val} onClick={() => setTab(val)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${tab === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${tab === val ? 'bg-primary text-white' : 'bg-gray-200 text-gray-550'}`}>{count}</span>
              </button>
            ))}
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto no-scrollbar">
            {tabRequests.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No requests in this category</p>
              </div>
            ) : tabRequests.map((req) => (
              <div key={req._id} className="border border-slate-100 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{req.patientName} ({req.bloodGroup})</p>
                    <p className="text-xs text-gray-500">{req.hospitalName}, {req.city}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{req.unitsRequired} units • {req.urgencyLevel}</p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full ${req.urgencyLevel === 'Immediate' ? 'bg-red-50 text-primary' : req.urgencyLevel === 'Critical' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                    {req.urgencyLevel}
                  </span>
                </div>
                {tab === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => verifyRequest(req._id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold rounded-xl transition-colors cursor-pointer">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                    </button>
                    <button onClick={() => rejectRequest(req._id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 hover:bg-red-100 text-red-650 text-xs font-bold rounded-xl transition-colors cursor-pointer">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
                {tab === 'verified' && (
                  <div className="mt-3 border-t border-slate-50 pt-3">
                    <button
                      onClick={() => setSelectedMatchReq(selectedMatchReq === req._id ? null : req._id)}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {selectedMatchReq === req._id ? 'Hide Matched Donors' : '🔍 Match Compatible Donors'}
                    </button>
                    
                    {selectedMatchReq === req._id && (
                      <div className="mt-3 space-y-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100 max-h-48 overflow-y-auto no-scrollbar animate-fade-in-up">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Compatible Available Donors</p>
                        {getCompatibleDonors(req.bloodGroup).length === 0 ? (
                          <p className="text-[11px] text-gray-500 italic">No compatible available donors found.</p>
                        ) : (
                          getCompatibleDonors(req.bloodGroup).map((donor) => (
                            <div key={donor._id} className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm text-left">
                              <div>
                                <p className="text-xs font-bold text-gray-900">{donor.fullName} ({donor.bloodGroup})</p>
                                <p className="text-[10px] text-gray-500">{donor.city} • {donor.distance} km away</p>
                              </div>
                              <button
                                onClick={() => {
                                  triggerToast(`Emergency alert dispatched to ${donor.fullName}!`, 'success');
                                }}
                                className="px-2.5 py-1 bg-primary text-white text-[10px] font-black rounded-lg cursor-pointer hover:bg-primary-dark transition-colors"
                              >
                                Alert Donor
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          }
        </div>
      </div>

        {/* Right: notifications + activity */}
        <div className="space-y-5 text-left">
          <div className="card p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Notification Center</h3>
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n._id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100/50">
                  {getMiniIcon(n.type)}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-gray-850 truncate">{n.title}</p>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${n.read ? 'bg-transparent' : 'bg-primary animate-pulse'}`} />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Volunteer Activity</h3>
            <div className="space-y-3">
              {[
                { label: 'Requests verified today', value: '3', icon: ShieldCheck, color: 'text-green-600' },
                { label: 'Donors contacted', value: '7', icon: Users, color: 'text-blue-600' },
                { label: 'Avg response time', value: '12 min', icon: Clock, color: 'text-amber-600' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-xs text-gray-600">{item.label}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
