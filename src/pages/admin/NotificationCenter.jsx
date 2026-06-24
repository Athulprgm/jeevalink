import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Send, Users, Zap, Clock, CheckCircle2, X, Calendar, Megaphone, AlertTriangle } from 'lucide-react';

const SENT_HISTORY = [
  { _id: 'n1', title: 'System Maintenance Notice', message: 'JeevaLink will undergo scheduled maintenance on Jun 25, 2026 from 2–4 AM.', type: 'broadcast', sentTo: 'all', sentAt: '2026-06-22T10:00:00Z', status: 'delivered' },
  { _id: 'n2', title: '🚨 Emergency Blood Alert', message: 'Urgent O+ blood needed at City Hospital, Ernakulam. Please respond immediately.', type: 'emergency', sentTo: 'donors', sentAt: '2026-06-20T08:30:00Z', status: 'delivered' },
  { _id: 'n3', title: 'Volunteer Meeting Reminder', message: 'Monthly volunteer coordination meeting is scheduled for Jun 28, 2026 at 6 PM.', type: 'scheduled', sentTo: 'volunteers', sentAt: '2026-06-18T09:00:00Z', status: 'delivered' },
];

const TYPE_MAP = {
  broadcast: { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', label: 'Broadcast' },
  emergency: { color: 'text-red-400 bg-red-500/10 border-red-500/20', label: 'Emergency' },
  scheduled: { color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', label: 'Scheduled' },
};

export default function NotificationCenter() {
  const { triggerToast } = useAppStore();
  const [history, setHistory] = useState(SENT_HISTORY);
  const [tab, setTab] = useState('broadcast');
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '', target: 'all', type: 'broadcast' });
  const [emergencyForm, setEmergencyForm] = useState({ title: '🚨 Emergency Alert', message: '', district: 'All Districts', bloodGroup: 'O+' });
  const [scheduleForm, setScheduleForm] = useState({ title: '', message: '', target: 'all', scheduledAt: '' });
  const [sending, setSending] = useState(false);

  const handleSend = async (form, type) => {
    if (!form.title || !form.message) { triggerToast('Title and message are required.', 'error'); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 800));
    const newNotif = {
      _id: `n${Date.now()}`,
      title: form.title,
      message: form.message,
      type,
      sentTo: form.target || 'all',
      sentAt: new Date().toISOString(),
      status: 'delivered',
    };
    setHistory(h => [newNotif, ...h]);
    setSending(false);
    triggerToast(`Notification ${type === 'scheduled' ? 'scheduled' : 'sent'} successfully!`, 'success');
    if (type === 'broadcast') setBroadcastForm({ title: '', message: '', target: 'all', type: 'broadcast' });
    if (type === 'emergency') setEmergencyForm({ title: '🚨 Emergency Alert', message: '', district: 'All Districts', bloodGroup: 'O+' });
    if (type === 'scheduled') setScheduleForm({ title: '', message: '', target: 'all', scheduledAt: '' });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 text-xl font-black">Notification Center</h1>
        <p className="text-slate-500 text-xs mt-0.5">Send push notifications, emergency alerts, and scheduled messages</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Sent Today', value: '3', icon: Send, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
          { label: 'Scheduled', value: '1', icon: Clock, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
          { label: 'Delivered', value: '100%', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`bg-white border rounded-2xl p-4 flex items-center gap-3 ${color.split(' ').find(c => c.startsWith('border'))}`}>
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${color}`}>
              <Icon className={`w-4 h-4 ${color.split(' ')[0]}`} />
            </div>
            <div>
              <p className={`text-xl font-black ${color.split(' ')[0]}`}>{value}</p>
              <p className="text-slate-500 text-[10px]">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Compose + History */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Compose Panel */}
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {[
              { key: 'broadcast', label: 'Broadcast', icon: Megaphone },
              { key: 'emergency', label: 'Emergency', icon: AlertTriangle },
              { key: 'scheduled', label: 'Schedule', icon: Calendar },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
                  tab === key ? 'border-red-500 text-red-400' : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-3">
            {/* Broadcast Form */}
            {tab === 'broadcast' && (
              <>
                <div>
                  <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Notification Title</label>
                  <input value={broadcastForm.title} onChange={e => setBroadcastForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. System Update Notice"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 transition-colors" />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Message</label>
                  <textarea value={broadcastForm.message} onChange={e => setBroadcastForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Enter the notification message..."
                    rows={4}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 transition-colors resize-none" />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Send To</label>
                  <select value={broadcastForm.target} onChange={e => setBroadcastForm(f => ({ ...f, target: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-blue-500/40 transition-colors cursor-pointer">
                    <option value="all">All Users</option>
                    <option value="volunteers">Volunteers Only</option>
                    <option value="donors">Donors Only</option>
                    <option value="hospitals">Hospitals Only</option>
                  </select>
                </div>
                <button onClick={() => handleSend(broadcastForm, 'broadcast')} disabled={sending}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-slate-900 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                  <Send className="w-3.5 h-3.5" /> {sending ? 'Sending...' : 'Send Broadcast'}
                </button>
              </>
            )}

            {/* Emergency Form */}
            {tab === 'emergency' && (
              <>
                <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-[10px] font-bold">⚡ Emergency alerts are sent immediately to all relevant users with high priority.</p>
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Alert Title</label>
                  <input value={emergencyForm.title} onChange={e => setEmergencyForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-red-500/40 transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Blood Group</label>
                    <select value={emergencyForm.bloodGroup} onChange={e => setEmergencyForm(f => ({ ...f, bloodGroup: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-red-500/40 transition-colors cursor-pointer">
                      {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">District</label>
                    <select value={emergencyForm.district} onChange={e => setEmergencyForm(f => ({ ...f, district: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-red-500/40 transition-colors cursor-pointer">
                      {['All Districts', 'Ernakulam', 'Thrissur', 'Bengaluru Urban', 'Chennai', 'Thiruvananthapuram'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Alert Message</label>
                  <textarea value={emergencyForm.message} onChange={e => setEmergencyForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Describe the emergency situation..."
                    rows={3}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 text-xs placeholder:text-slate-600 focus:outline-none focus:border-red-500/40 transition-colors resize-none" />
                </div>
                <button onClick={() => handleSend({ ...emergencyForm, target: 'all' }, 'emergency')} disabled={sending}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-slate-900 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20">
                  <Zap className="w-3.5 h-3.5" /> {sending ? 'Broadcasting...' : 'Send Emergency Alert'}
                </button>
              </>
            )}

            {/* Scheduled Form */}
            {tab === 'scheduled' && (
              <>
                <div>
                  <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Notification Title</label>
                  <input value={scheduleForm.title} onChange={e => setScheduleForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Monthly Meeting Reminder"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 text-xs placeholder:text-slate-600 focus:outline-none focus:border-purple-500/40 transition-colors" />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Message</label>
                  <textarea value={scheduleForm.message} onChange={e => setScheduleForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Enter message..." rows={3}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 text-xs placeholder:text-slate-600 focus:outline-none focus:border-purple-500/40 transition-colors resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Target Audience</label>
                    <select value={scheduleForm.target} onChange={e => setScheduleForm(f => ({ ...f, target: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 text-xs focus:outline-none cursor-pointer">
                      <option value="all">All Users</option>
                      <option value="volunteers">Volunteers</option>
                      <option value="donors">Donors</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Schedule Time</label>
                    <input type="datetime-local" value={scheduleForm.scheduledAt} onChange={e => setScheduleForm(f => ({ ...f, scheduledAt: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-purple-500/40 transition-colors cursor-pointer" />
                  </div>
                </div>
                <button onClick={() => handleSend(scheduleForm, 'scheduled')} disabled={sending}
                  className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-slate-900 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> {sending ? 'Scheduling...' : 'Schedule Notification'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sent History */}
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-slate-900 font-bold text-sm">Sent Notifications</h3>
            <p className="text-slate-500 text-[10px]">{history.length} notifications in history</p>
          </div>
          <div className="divide-y divide-white/[0.04] max-h-[520px] overflow-y-auto">
            {history.map((n, i) => {
              const typeInfo = TYPE_MAP[n.type] || TYPE_MAP.broadcast;
              return (
                <motion.div key={n._id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between mb-1.5">
                    <p className="text-slate-900 text-xs font-semibold flex-1 pr-2">{n.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeInfo.color} shrink-0`}>{typeInfo.label}</span>
                  </div>
                  <p className="text-slate-500 text-[10px] leading-relaxed line-clamp-2">{n.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-slate-600 text-[10px]">→ {n.sentTo} users</span>
                    <span className="text-slate-600 text-[10px]">{new Date(n.sentAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
