import React, { useState } from 'react';
import { useAppStore } from '../store/appStore.js';
import { Mail, Phone, MapPin, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const faqs = [
  { q: 'Who can donate blood?', a: 'Anyone between 18–65 years, weighing at least 50kg, and in good health can donate blood. You should not have donated in the last 3 months.' },
  { q: 'Is blood donation safe?', a: 'Yes, completely. All equipment is sterilized and single-use. The process takes 30–45 minutes and is medically supervised.' },
  { q: 'How do I register as a donor?', a: 'Click on "Register" in the top navigation, fill in your details including blood group and location, and you\'ll be part of our network instantly.' },
  { q: 'How does JeevaLink match donors?', a: 'Our system uses blood group compatibility, location proximity, and donor availability to find the best matches for each request.' },
  { q: 'What are JeevaPoints?', a: 'JeevaPoints are reward points earned for each donation milestone. They can be redeemed for health benefits and recognition certificates.' },
];

export default function Contact() {
  const { triggerToast } = useAppStore();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { triggerToast('Please fill all required fields.', 'warning'); return; }
    triggerToast('Message sent! We\'ll get back to you within 24 hours.', 'success');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient py-16">
        <div className="container-wide text-center text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-black mb-3">Contact Us</h1>
            <p className="text-red-200 text-lg max-w-lg mx-auto">Have a question, suggestion, or emergency? We're here 24/7 to help.</p>
          </motion.div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact form */}
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Full Name *</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-gray-900" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Email *</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-gray-900" placeholder="you@example.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Subject</label>
                  <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-gray-900" placeholder="How can we help?" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Message *</label>
                  <textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-gray-900 resize-none"
                    placeholder="Describe your query or feedback…" />
                </div>
                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl shadow-xl shadow-red-200 transition-all">
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-6">Get in Touch</h2>
                <div className="space-y-4">
                  {[
                    { icon: Mail, title: 'Email Us', detail: 'support@jeevalink.org', sub: 'We reply within 24 hours', color: 'bg-blue-50 text-blue-600' },
                    { icon: Phone, title: 'Call Us', detail: '+91 98765 43210', sub: 'Mon–Sat, 9am–6pm IST', color: 'bg-green-50 text-green-600' },
                    { icon: MapPin, title: 'Our Office', detail: 'Bengaluru, Karnataka', sub: 'India — 560001', color: 'bg-amber-50 text-amber-600' },
                  ].map(({ icon: Icon, title, detail, sub, color }) => (
                    <div key={title} className="card p-4 flex items-center gap-4">
                      <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">{detail}</p>
                        <p className="text-xs text-gray-500">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency */}
              <div className="hero-gradient rounded-2xl p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-red-200 mb-1">🚨 Emergency Helpline</p>
                <p className="text-3xl font-black mb-1">1910</p>
                <p className="text-red-200 text-sm">Available 24/7 for blood emergencies</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-slate-50">
        <div className="container-wide max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-bold text-gray-900">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-primary shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-5 pb-4"
                  >
                    <p className="text-sm text-gray-600 leading-relaxed border-t border-slate-100 pt-3">{faq.a}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
