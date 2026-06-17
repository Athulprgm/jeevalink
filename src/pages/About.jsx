import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Target, Eye, Users, Shield, Award } from 'lucide-react';

const team = [
  { name: 'Athul Reji', role: 'Founder & Developer', blood: 'B+', initials: 'AR' },
  { name: 'Priya Menon', role: 'Volunteer Lead', blood: 'O+', initials: 'PM' },
  { name: 'Kiran Raj', role: 'Operations Head', blood: 'A+', initials: 'KR' },
  { name: 'Sneha Pillai', role: 'Community Manager', blood: 'O-', initials: 'SP' },
];

const values = [
  { icon: Heart, title: 'Empathy', desc: 'Every request is a life. We treat each one with urgency and care.', color: 'text-red-600 bg-red-50' },
  { icon: Shield, title: 'Trust', desc: 'All requests are verified by our trained volunteer network.', color: 'text-blue-600 bg-blue-50' },
  { icon: Users, title: 'Community', desc: 'We are 12,000+ donors strong, united by the will to save lives.', color: 'text-green-600 bg-green-50' },
  { icon: Award, title: 'Recognition', desc: 'Every donor earns JeevaPoints for their life-saving contribution.', color: 'text-amber-600 bg-amber-50' },
];

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient py-20">
        <div className="container-wide text-center text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-xs font-bold uppercase tracking-widest text-red-200 bg-white/10 px-4 py-2 rounded-full">About JeevaLink</span>
            <h1 className="text-4xl lg:text-5xl font-black mt-5 mb-4">We Connect Life</h1>
            <p className="text-red-100 text-lg max-w-2xl mx-auto leading-relaxed">
              JeevaLink is India's premier blood donation platform — built by donors, for donors. Our mission is simple: no one should die waiting for blood.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section bg-white">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Target, title: 'Our Mission', color: 'bg-red-50 text-primary border-red-100', text: 'To create a real-time, technology-driven blood donation ecosystem that connects every available donor with every patient in need — instantly, reliably, and at no cost.' },
              { icon: Eye, title: 'Our Vision', color: 'bg-blue-50 text-blue-600 border-blue-100', text: 'A world where no preventable death occurs due to unavailability of blood. We envision every district having enough donors registered to meet emergency needs within 30 minutes.' },
            ].map(({ icon: Icon, title, color, text }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`card p-7 border ${color}`}
              >
                <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-5`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-slate-50">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900">Our Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="card p-6 text-center"
                >
                  <div className={`w-12 h-12 ${v.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-gray-900 mb-2">{v.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section bg-white">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900">Meet the Team</h2>
            <p className="text-gray-500 mt-3">The passionate people behind JeevaLink</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-200">
                  <span className="text-white font-black text-xl">{member.initials}</span>
                </div>
                <h4 className="font-bold text-gray-900">{member.name}</h4>
                <p className="text-xs text-gray-500 mt-0.5 mb-3">{member.role}</p>
                <span className="text-xs font-black text-primary bg-red-50 px-3 py-1 rounded-xl">{member.blood}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Project info */}
      <section className="section-sm hero-gradient">
        <div className="container-wide text-center text-white">
          <h2 className="text-2xl font-black mb-3">Built with Purpose</h2>
          <p className="text-red-200 max-w-lg mx-auto text-sm leading-relaxed">
            JeevaLink was born from a personal mission to solve the blood shortage crisis using modern technology. 
            Started in 2025, it has grown to serve thousands of donors and patients across India.
          </p>
          <div className="flex justify-center gap-8 mt-8">
            {[['2025', 'Founded'], ['12K+', 'Donors'], ['4.5K+', 'Lives Saved']].map(([v, l]) => (
              <div key={l}>
                <p className="text-2xl font-black">{v}</p>
                <p className="text-red-200 text-xs font-semibold">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
