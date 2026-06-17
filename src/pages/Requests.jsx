import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppStore } from '../store/appStore.js';
import { useAuthStore } from '../store/authStore.js';
import { Heart, Plus, List, Droplet, User, Phone, MapPin, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

// Zod Validation Schema for creating request
const createRequestSchema = z.object({
  patientName: z.string().min(2, 'Patient name must be at least 2 characters'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
    errorMap: () => ({ message: 'Please select a blood group' })
  }),
  unitsRequired: z.coerce.number().min(1, 'At least 1 unit is required').max(10, 'Maximum 10 units per request'),
  hospitalName: z.string().min(3, 'Hospital name must be at least 3 characters'),
  location: z.string().min(3, 'Location description must be at least 3 characters'),
  contactNumber: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit contact number'),
  urgencyLevel: z.enum(['Immediate', 'Critical', 'Standard']),
  additionalNotes: z.string().optional()
});

export default function Requests() {
  const { user } = useAuthStore();
  const { 
    requests, 
    fetchRequests, 
    createRequest, 
    fulfillRequest,
    triggerToast 
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'new'
  const [selectedReq, setSelectedReq] = useState(null);
  const [filterBg, setFilterBg] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  // Responsive tracker
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(createRequestSchema),
    defaultValues: { urgencyLevel: 'Standard', unitsRequired: 1 }
  });

  useEffect(() => {
    fetchRequests(filterBg, filterUrgency);
  }, [filterBg, filterUrgency]);

  const onFormSubmit = async (data) => {
    const res = await createRequest(data);
    if (res.success) {
      reset();
      setActiveTab('feed');
    }
  };

  const handleFulfill = async (reqId) => {
    if (!user) {
      triggerToast('Please log in to volunteer.', 'warning');
      return;
    }

    const res = await fulfillRequest(reqId, user._id);
    if (res.success) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#ffffff', '#990f0f']
      });
      setSelectedReq(null);
    }
  };

  // Reusable Form layout render
  const renderRequestForm = () => (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase pl-1 mb-1">Patient Name</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Karan Malhotra"
            {...register('patientName')}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs transition-colors text-slate-900 dark:text-zinc-100 pr-10"
          />
          <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
        {errors.patientName && <span className="text-[10px] font-bold text-red-500 mt-1 pl-1 block">{errors.patientName.message}</span>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase pl-1 mb-1">Blood Group</label>
          <select
            {...register('bloodGroup')}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs transition-colors text-slate-900 dark:text-zinc-100 font-bold"
          >
            <option value="">Select Group</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
          {errors.bloodGroup && <span className="text-[10px] font-bold text-red-500 mt-1 pl-1 block">{errors.bloodGroup.message}</span>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase pl-1 mb-1">Units Required</label>
          <input
            type="number"
            min="1"
            max="10"
            {...register('unitsRequired')}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs transition-colors text-slate-900 dark:text-zinc-100 font-bold"
          />
          {errors.unitsRequired && <span className="text-[10px] font-bold text-red-500 mt-1 pl-1 block">{errors.unitsRequired.message}</span>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase pl-1 mb-1">Hospital Name</label>
        <input
          type="text"
          placeholder="Apollo Hospital"
          {...register('hospitalName')}
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs text-slate-900 dark:text-zinc-100"
        />
        {errors.hospitalName && <span className="text-[10px] font-bold text-red-500 mt-1 pl-1 block">{errors.hospitalName.message}</span>}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase pl-1 mb-1">Location / Address</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Bannerghatta Road, Bengaluru"
            {...register('location')}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs text-slate-900 dark:text-zinc-100 pr-10"
          />
          <MapPin className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
        {errors.location && <span className="text-[10px] font-bold text-red-500 mt-1 pl-1 block">{errors.location.message}</span>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase pl-1 mb-1">Contact Phone</label>
          <div className="relative">
            <input
              type="tel"
              placeholder="9876500111"
              {...register('contactNumber')}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs text-slate-900 dark:text-zinc-100 pr-10"
            />
            <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          {errors.contactNumber && <span className="text-[10px] font-bold text-red-500 mt-1 pl-1 block">{errors.contactNumber.message}</span>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase pl-1 mb-1">Urgency Level</label>
          <select
            {...register('urgencyLevel')}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs text-slate-900 dark:text-zinc-100 font-bold"
          >
            <option value="Standard">Standard</option>
            <option value="Critical">Critical</option>
            <option value="Immediate">Immediate SOS</option>
          </select>
          {errors.urgencyLevel && <span className="text-[10px] font-bold text-red-500 mt-1 pl-1 block">{errors.urgencyLevel.message}</span>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase pl-1 mb-1">Additional Notes <span className="text-slate-400">(Optional)</span></label>
        <div className="relative">
          <textarea
            rows="2"
            placeholder="Need O+ blood for surgery scheduled tomorrow morning. Replacement preferred."
            {...register('additionalNotes')}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs text-slate-900 dark:text-zinc-100 pr-10"
          />
          <FileText className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
        </div>
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-2xl shadow-md cursor-pointer transition-colors mt-6"
      >
        Broadcast Blood Alert
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 px-6 pt-6 pb-24 select-none">
      <div className="max-w-7xl mx-auto">
        
        {/* Render DESKTOP Split Layout */}
        {isDesktop ? (
          <div className="grid grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Active Alerts Feed (col-span-7) */}
            <div className="col-span-7 space-y-4">
              <div className="flex justify-between items-center pl-1">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">Active Blood Alerts Feed</h4>
                
                {/* Desktop Filters */}
                <div className="flex gap-2 text-xs">
                  <select
                    value={filterBg}
                    onChange={(e) => setFilterBg(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl font-bold text-slate-700 dark:text-zinc-300"
                  >
                    <option value="">All Groups</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                  <select
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl font-bold text-slate-700 dark:text-zinc-300"
                  >
                    <option value="">All Urgencies</option>
                    <option value="Immediate">Immediate</option>
                    <option value="Critical">Critical</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>
              </div>

              {requests.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-10 text-center text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-emerald-500" />
                  <p className="text-sm font-semibold">No active blood alerts right now.</p>
                  <p className="text-xs text-slate-500 mt-1">All patients have received matching donors.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {requests.map((req) => {
                    const isSOS = req.urgencyLevel === 'Immediate';
                    const isFulfilled = req.status === 'Fulfilled';

                    return (
                      <div
                        key={req._id}
                        onClick={() => !isFulfilled && setSelectedReq(req)}
                        className={`p-4 bg-white dark:bg-zinc-900 border rounded-2xl shadow-sm flex flex-col justify-between gap-3 ${
                          isFulfilled
                            ? 'border-slate-200/50 dark:border-zinc-800/50 opacity-60'
                            : isSOS
                              ? 'border-red-500/20 hover:border-red-500/40 cursor-pointer animate-pulse'
                              : 'border-slate-200 dark:border-zinc-800 hover:border-slate-350 cursor-pointer'
                        } transition-colors`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                              isFulfilled
                                ? 'bg-slate-100 dark:bg-zinc-800 text-slate-500'
                                : req.urgencyLevel === 'Immediate'
                                  ? 'bg-red-500/10 text-red-650'
                                  : req.urgencyLevel === 'Critical'
                                    ? 'bg-orange-500/10 text-orange-600'
                                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                            }`}>
                              {isFulfilled ? 'Fulfilled' : req.urgencyLevel}
                            </span>
                            <span className="text-[9px] text-slate-450 dark:text-zinc-500 font-bold">
                              {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>

                          <h4 className={`text-sm font-bold text-slate-900 dark:text-zinc-100 truncate mt-2.5 ${isFulfilled ? 'line-through' : ''}`}>
                            {req.patientName} ({req.bloodGroup})
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 truncate">
                            🏥 {req.hospitalName}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-zinc-800/60">
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 truncate max-w-[130px]">📍 {req.location}</span>
                          <div className="flex items-center gap-0.5 text-primary text-xs font-black">
                            <Droplet className="w-3.5 h-3.5 fill-primary" /> {req.unitsRequired} U
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: New Blood Request Form (col-span-5) */}
            <div className="col-span-5 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-5 shadow-sm space-y-4">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 pl-0.5">Post New Blood Alert</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 pl-0.5">Alert matching donors in real-time</p>
              </div>
              {renderRequestForm()}
            </div>
            
          </div>
        ) : (
          
          /* Render MOBILE Tab Layout */
          <div>
            <div className="flex bg-slate-100 dark:bg-zinc-900 rounded-xl p-1 mb-5">
              <button
                onClick={() => setActiveTab('feed')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'feed' 
                    ? 'bg-white dark:bg-zinc-800 text-slate-950 dark:text-zinc-100 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400'
                }`}
              >
                <List className="w-4 h-4" /> Active Alerts Feed
              </button>
              <button
                onClick={() => setActiveTab('new')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'new' 
                    ? 'bg-white dark:bg-zinc-800 text-slate-955 dark:text-zinc-100 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400'
                }`}
              >
                <Plus className="w-4 h-4" /> New Blood Alert
              </button>
            </div>

            {activeTab === 'feed' ? (
              <div>
                <div className="flex gap-2 mb-4">
                  <select
                    value={filterBg}
                    onChange={(e) => setFilterBg(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300"
                  >
                    <option value="">All Blood Groups</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>

                  <select
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300"
                  >
                    <option value="">All Urgencies</option>
                    <option value="Immediate">Immediate</option>
                    <option value="Critical">Critical</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>

                {requests.length === 0 ? (
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-10 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-emerald-500" />
                    <p className="text-sm font-semibold">No active blood alerts right now.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests.map((req) => {
                      const isSOS = req.urgencyLevel === 'Immediate';
                      const isFulfilled = req.status === 'Fulfilled';

                      return (
                        <div
                          key={req._id}
                          onClick={() => !isFulfilled && setSelectedReq(req)}
                          className={`p-4 bg-white dark:bg-zinc-900 border rounded-2xl shadow-sm flex items-start justify-between gap-3 ${
                            isFulfilled
                              ? 'border-slate-200/50 dark:border-zinc-800/50 opacity-60'
                              : isSOS
                                ? 'border-red-500/20 hover:border-red-500/40 cursor-pointer'
                                : 'border-slate-200 dark:border-zinc-800 hover:border-slate-350 cursor-pointer'
                          } transition-colors`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                isFulfilled
                                  ? 'bg-slate-100 dark:bg-zinc-800 text-slate-500'
                                  : req.urgencyLevel === 'Immediate'
                                    ? 'bg-red-500/10 text-red-600'
                                    : req.urgencyLevel === 'Critical'
                                      ? 'bg-orange-500/10 text-orange-600'
                                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-650'
                              }`}>
                                {isFulfilled ? 'Fulfilled' : req.urgencyLevel}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-zinc-550 font-medium">
                                {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                            </div>

                            <h4 className={`text-sm font-bold text-slate-900 dark:text-zinc-100 truncate mt-2 ${isFulfilled ? 'line-through' : ''}`}>
                              {req.patientName} ({req.bloodGroup})
                            </h4>
                            <p className="text-xs text-slate-550 dark:text-zinc-400 mt-0.5 truncate">
                              🏥 {req.hospitalName}
                            </p>
                          </div>

                          <div className="flex flex-col items-end shrink-0 justify-between h-full gap-4">
                            <div className="flex items-center gap-0.5 text-primary bg-rose-500/5 px-2 py-1 rounded-lg border border-red-500/10 text-xs font-black">
                              <Droplet className="w-3.5 h-3.5 fill-primary" /> {req.unitsRequired} U
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm"
              >
                {renderRequestForm()}
              </motion.div>
            )}
          </div>
        )}

      </div>

      {/* Active Request Details & Volunteer overlay Modal */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-900">
              <Droplet className="w-7 h-7 text-primary fill-primary animate-pulse" />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-zinc-100">
              {selectedReq.bloodGroup} Blood Request
            </h3>
            <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1 justify-center">
              <AlertCircle className="w-3.5 h-3.5" /> {selectedReq.urgencyLevel} Attention Needed
            </p>

            <div className="my-5 bg-slate-50 dark:bg-zinc-950 rounded-2xl p-4 border border-slate-100 dark:border-zinc-800/60 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Patient Name:</span>
                <span className="font-bold text-slate-800 dark:text-zinc-100">{selectedReq.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Units Required:</span>
                <span className="font-bold text-slate-800 dark:text-zinc-100">{selectedReq.unitsRequired} Unit(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Hospital Name:</span>
                <span className="font-bold text-slate-800 dark:text-zinc-100">{selectedReq.hospitalName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Location:</span>
                <span className="font-bold text-slate-800 dark:text-zinc-100 truncate max-w-[180px]">{selectedReq.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Contact Number:</span>
                <a href={`tel:${selectedReq.contactNumber}`} className="font-bold text-primary hover:underline">
                  {selectedReq.contactNumber}
                </a>
              </div>
              {selectedReq.additionalNotes && (
                <div className="pt-2 border-t border-slate-200 dark:border-zinc-800">
                  <span className="text-slate-400 font-bold block mb-1">Notes:</span>
                  <p className="text-slate-700 dark:text-zinc-350 italic bg-white dark:bg-zinc-900 p-2 rounded-lg border border-slate-100 dark:border-zinc-800">{selectedReq.additionalNotes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-100 font-semibold rounded-xl transition-colors cursor-pointer text-xs"
              >
                Close
              </button>
              <button
                onClick={() => handleFulfill(selectedReq._id)}
                className="flex-2 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-750 text-white font-semibold rounded-xl shadow-sm transition-colors cursor-pointer text-xs"
              >
                <Heart className="w-3.5 h-3.5 fill-white" /> Volunteer & Fulfill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
