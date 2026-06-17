import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useMotionValue, useSpring, useTransform, useAnimationFrame } from 'framer-motion';
import { Heart, Droplets, MapPin, ArrowRight, Shield, Clock, Users, Award, CheckCircle2, Star, Phone, Activity, Zap, Handshake } from 'lucide-react';

// Animated counter component
function AnimatedCounter({ target, suffix = '', duration = 2 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(0);
  const rounded = useSpring(count, { duration: duration * 1000 });
  const [display, setDisplay] = React.useState(0);

  useEffect(() => {
    if (isInView) count.set(target);
  }, [isInView, target, count]);

  useEffect(() => {
    return rounded.on('change', (v) => setDisplay(Math.round(v)));
  }, [rounded]);

  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

const stats = [
  { value: 12847, suffix: '+', label: 'Registered Donors', icon: Users, color: 'text-blue-600 bg-blue-50' },
  { value: 4521, suffix: '+', label: 'Lives Saved', icon: Heart, color: 'text-red-600 bg-red-50' },
  { value: 8930, suffix: '+', label: 'Requests Fulfilled', icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
  { value: 98, suffix: '%', label: 'Match Accuracy', icon: Award, color: 'text-amber-600 bg-amber-50' },
];

const steps = [
  { step: '01', title: 'Register as Donor', desc: 'Create your free account and enter your blood group, location, and availability.', icon: Users },
  { step: '02', title: 'Get Matched', desc: 'Our smart system matches you with urgent requests nearby based on compatibility.', icon: MapPin },
  { step: '03', title: 'Save a Life', desc: 'Connect with the hospital, donate blood, and earn JeevaPoints for your heroic act.', icon: Heart },
];

const benefits = [
  { icon: Activity, title: 'Free Health Check', desc: 'Get a free mini health screening every time you donate.', color: 'text-rose-605 bg-rose-50 border-rose-100' },
  { icon: Zap, title: 'Real-time Alerts', desc: 'Instant notifications for blood requests matching your group nearby.', color: 'text-amber-500 bg-amber-50 border-amber-100' },
  { icon: Award, title: 'Earn JeevaPoints', desc: 'Redeem reward points for every donation milestone.', color: 'text-yellow-605 bg-yellow-50 border-yellow-100' },
  { icon: Shield, title: 'Verified Requests', desc: 'All blood requests are verified by our volunteer network.', color: 'text-green-600 bg-green-50 border-green-100' },
  { icon: MapPin, title: 'Smart Matching', desc: 'AI-powered donor-patient matching based on location and compatibility.', color: 'text-blue-600 bg-blue-50 border-blue-100' },
  { icon: Handshake, title: 'Community Support', desc: 'Join 12,000+ donors making a difference every day.', color: 'text-purple-650 bg-purple-50 border-purple-100' },
];

const testimonials = [
  { name: 'Rahul Nair', role: 'Blood Donor, Kochi', text: 'JeevaLink made it incredibly easy to find a recipient. I donated within 2 hours of registering!', rating: 5, blood: 'O+' },
  { name: 'Divya Krishnan', role: 'Patient\'s Family, Bengaluru', text: 'We found 3 matching donors within minutes for my father\'s surgery. This platform is a lifesaver!', rating: 5, blood: 'A-' },
  { name: 'Arjun Menon', role: 'Volunteer, Thrissur', text: 'Being a volunteer here is the most fulfilling thing I\'ve done. We\'ve helped over 200 families.', rating: 5, blood: 'B+' },
];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Landing() {
  // Parallax / 3D Tilt for Hero
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);
  
  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-15, 15]);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = clientX / innerWidth - 0.5;
    const y = clientY / innerHeight - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  // Ticker animation
  const baseX = useMotionValue(0);
  
  useAnimationFrame((t, delta) => {
    // move at 50px per second
    let moveBy = -50 * (delta / 1000);
    let newX = baseX.get() + moveBy;
    // reset loop seamlessly (assuming roughly 1000px width for 4 items, we use a percentage approach instead)
    baseX.set(newX);
  });
  
  // We use modulo to create an infinite loop effect
  // Let's assume the first 4 items take up 50% of the flex container width
  const xTransform = useTransform(baseX, (v) => `${(v % 50)}%`);

  // Text Stagger animation variants
  const textContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };
  
  const textItem = {
    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', damping: 12, stiffness: 100 } }
  };

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────── */}
      <section 
        className="relative hero-gradient overflow-hidden min-h-[92vh] flex items-center"
        style={{ perspective: 1000 }}
        onMouseMove={handleMouseMove}
      >
        {/* Floating Background circles */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
            y: [0, -30, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 40, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-1/4 w-32 h-32 bg-red-400/30 rounded-full blur-xl pointer-events-none" 
        />

        <div className="container-wide relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left text */}
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
                className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full mb-6 backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              >
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Live: 24 Active Emergency Requests Nearby
              </motion.div>
              
              <motion.h1 
                variants={textContainer}
                initial="hidden"
                animate="show"
                className="text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6"
              >
                <motion.div variants={textItem}>Donate Blood.</motion.div>
                <motion.div variants={textItem} className="text-red-200">Save Lives.</motion.div>
                <motion.div variants={textItem} className="text-white/80">Be a Hero.</motion.div>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-red-100 text-lg leading-relaxed mb-8 max-w-lg"
              >
                JeevaLink connects blood donors with patients in need across India. 
                Real-time matching, instant alerts, and a community of 12,000+ life-savers.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="flex flex-wrap gap-3"
              >
                <Link
                  to="/register"
                  className="group relative inline-flex items-center gap-2 px-6 py-3.5 bg-white text-primary font-bold rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all overflow-hidden hover:-translate-y-1"
                >
                  <motion.div
                    className="absolute inset-0 bg-white/40"
                    initial={{ x: '-100%', skewX: -15 }}
                    whileHover={{ x: '200%' }}
                    transition={{ duration: 0.7, ease: 'easeInOut' }}
                  />
                  <Heart className="w-5 h-5 fill-primary group-hover:scale-110 transition-transform duration-300" /> Become a Donor
                </Link>
                <Link
                  to="/requests"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold rounded-2xl hover:bg-white/25 transition-all hover:-translate-y-1"
                >
                  Request Blood <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              {/* Emergency line */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex items-center gap-2 mt-8 text-red-200 text-sm"
              >
                <Phone className="w-4 h-4" />
                <span>Emergency Helpline: <strong className="text-white">1910</strong></span>
              </motion.div>
            </div>

            {/* Right — blood groups grid (3D Parallax) */}
            <motion.div
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              className="hidden lg:block relative z-20"
            >
              <div className="relative">
                {/* Central drop */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: "translateZ(80px)" }}>
                  <motion.div 
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-40 h-40 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                  >
                    <Droplets className="w-20 h-20 text-white/90 fill-white/40 drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]" />
                  </motion.div>
                </div>
                {/* Blood group orbs around it */}
                <div className="grid grid-cols-4 gap-4 p-8" style={{ transform: "translateZ(30px)" }}>
                  {bloodGroups.map((bg, i) => (
                    <motion.div
                      key={bg}
                      initial={{ opacity: 0, scale: 0, rotate: -45 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ type: "spring", damping: 12, delay: 0.5 + i * 0.08 }}
                      whileHover={{ scale: 1.15, zIndex: 10, rotate: 5, y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                      className="w-full aspect-square bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-2xl flex items-center justify-center text-white font-black text-xl cursor-default transition-shadow"
                    >
                      {bg}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Live requests ticker banner */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-md border-t border-white/10 py-3 overflow-hidden select-none z-30">
          <div className="container-wide flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-red-200 uppercase font-black tracking-wider shrink-0 text-[10px] z-10 bg-red-900/40 backdrop-blur-xl px-2.5 py-1 rounded-md border border-red-500/30">
              <motion.span 
                animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-red-500 rounded-full" 
              />
              Live Alerts:
            </span>
            <div className="overflow-hidden relative flex-1" style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
              <motion.div 
                style={{ x: xTransform }}
                className="flex gap-12 text-xs font-semibold text-white/90 whitespace-nowrap w-[200%]"
              >
                <span>🚨 B+ Required at Apollo Hospital, Bengaluru (12m ago)</span>
                <span>🚨 O- Required urgently at Lakeshore Hospital, Kochi (45m ago)</span>
                <span>🚨 AB+ Required at General Hospital, Thrissur (5m ago)</span>
                <span>🚨 A- Required at Aster Medcity, Kochi (3h ago)</span>
                {/* Duplicate for infinite marquee scrolling effect */}
                <span>🚨 B+ Required at Apollo Hospital, Bengaluru (12m ago)</span>
                <span>🚨 O- Required urgently at Lakeshore Hospital, Kochi (45m ago)</span>
                <span>🚨 AB+ Required at General Hospital, Thrissur (5m ago)</span>
                <span>🚨 A- Required at Aster Medcity, Kochi (3h ago)</span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────── */}
      <section className="section-sm bg-white border-b border-slate-100">
        <div className="container-wide">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                  whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ type: "spring", damping: 15, delay: i * 0.1 }}
                  className="text-center"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-14 h-14 ${s.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm`}
                  >
                    <Icon className="w-7 h-7" />
                  </motion.div>
                  <p className="text-3xl lg:text-4xl font-black text-gray-900 mb-1 tracking-tight">
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-sm text-gray-500 font-semibold">{s.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section className="section bg-slate-50 overflow-hidden">
        <div className="container-wide">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-red-50 px-4 py-2 rounded-full border border-red-100">How It Works</span>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mt-5 mb-4">3 Simple Steps to Save a Life</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">Getting started is easy. Register, get matched, and make a difference — all within minutes.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for larger screens */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-red-100 via-red-300 to-red-100 -translate-y-1/2 z-0" />
            
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 50, rotateX: -15 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ type: "spring", damping: 20, delay: i * 0.2 }}
                  whileHover={{ y: -10, boxShadow: "0 20px 40px -10px rgba(220,38,38,0.15)" }}
                  className="card p-8 text-center relative z-10 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                >
                  <motion.span 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: i * 0.2 + 0.3, type: "spring" }}
                    className="absolute -top-4 -right-4 w-12 h-12 bg-primary text-white text-xl font-black rounded-full flex items-center justify-center shadow-lg shadow-red-200"
                  >
                    {step.step}
                  </motion.span>
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner"
                  >
                    <Icon className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-black text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── EMERGENCY BANNER ─────────────────────────── */}
      <section className="py-12 hero-gradient relative overflow-hidden">
        {/* Animated pulse background */}
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl"
        />
        <div className="container-wide relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-white">
            <div className="flex items-center gap-5">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] backdrop-blur-sm"
              >
                <Droplets className="w-9 h-9 fill-white text-white" />
              </motion.div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-red-200 mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full animate-ping" />
                  Emergency Alert
                </p>
                <h3 className="text-2xl font-black">O- Blood Needed Urgently in Kochi</h3>
                <p className="text-red-200 text-sm mt-1">Lakeshore Hospital • 3 units required • 45 minutes ago</p>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/requests"
                className="shrink-0 px-8 py-4 bg-white text-primary font-black rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-all flex items-center gap-2"
              >
                Respond Now <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── BENEFITS ─────────────────────────────────── */}
      <section className="section bg-white">
        <div className="container-wide">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-red-50 px-4 py-2 rounded-full border border-red-100">Benefits</span>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mt-5 mb-4">Why Donate with JeevaLink?</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, scale: 0.9, filter: 'blur(5px)' }}
                  whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ type: "spring", damping: 20, delay: i * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.08)" }}
                  className="card p-7 border border-slate-100 bg-gradient-to-b from-white to-slate-50/50 text-left"
                >
                  <motion.div 
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border ${b.color} shadow-sm`}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>
                  <h4 className="text-lg font-black text-gray-900 mb-2">{b.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────── */}
      <section className="section bg-slate-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-50 to-transparent pointer-events-none" />
        <div className="container-wide relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-red-50 px-4 py-2 rounded-full border border-red-100">Testimonials</span>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mt-5 mb-4">Stories from Our Community</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ type: "spring", damping: 20, delay: i * 0.15 }}
                whileHover={{ y: -5, boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)" }}
                className="card p-8 bg-white border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <div className="flex mb-5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 + j * 0.1 }}
                    >
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow-sm" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-base text-gray-600 leading-relaxed mb-8 italic">"{t.text}"</p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-red-700 rounded-2xl flex items-center justify-center shrink-0 shadow-inner shadow-red-900/20">
                    <span className="text-white font-black text-lg">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500 font-medium">{t.role}</p>
                  </div>
                  <span className="ml-auto text-xs font-black text-primary bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">{t.blood}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ─────────────────────────────────── */}
      <section className="section bg-white border-t border-slate-100 relative overflow-hidden">
        {/* Radial gradient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl aspect-square bg-red-50 rounded-full blur-[100px] pointer-events-none opacity-50" />
        
        <div className="container-wide text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", damping: 20 }}
          >
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-5">Ready to Save a Life?</h2>
            <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">Join thousands of donors making a difference. Registration takes less than 2 minutes.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/register" className="px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-[0_10px_30px_rgba(220,38,38,0.3)] transition-all">
                  Register as Donor
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/about" className="px-8 py-4 border-2 border-slate-200 text-gray-700 font-black rounded-2xl hover:border-red-200 hover:bg-red-50 transition-colors">
                  Learn More
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
