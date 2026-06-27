import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../jl-landing.css";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import {
  Heart, Droplets, MapPin, ArrowRight, Shield, Users,
  Award, CheckCircle2, Phone, Activity, Zap,
  Handshake, Bell, Search, UserPlus, Building2, Star, Lock,
} from "lucide-react";

/* ── Inline Social Icons ───────────────────────── */
const SocialIcons = {
  Facebook: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  ),
  Instagram: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  ),
  Twitter: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  Youtube: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12z"/>
    </svg>
  ),
  Linkedin: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zm2-6a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>
    </svg>
  ),
};

/* ── Animated Counter ─────────────────────────── */
function AnimatedCounter({ target, suffix = "", duration = 2 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(0);
  const rounded = useSpring(count, { duration: duration * 1000 });
  const [display, setDisplay] = React.useState(0);
  useEffect(() => { if (isInView) count.set(target); }, [isInView, target, count]);
  useEffect(() => rounded.on("change", (v) => setDisplay(Math.round(v))), [rounded]);
  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

/* ── Motion variants ─────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { type: "spring", damping: 22, stiffness: 100, delay: i * 0.1 },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: (i = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
};

/* ── Data ─────────────────────────────────────── */
const heroStats = [
  { icon: Users, value: "12K+", label: "Donors" },
  { icon: Heart, value: "3.5K+", label: "Lives Saved" },
  { icon: MapPin, value: "28+", label: "Cities" },
  { icon: Handshake, value: "250+", label: "Volunteers" },
];

const bloodTypes = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];

const tickerItems = [
  { city: "Mumbai", type: "O+", urgency: "URGENT" },
  { city: "Delhi", type: "A−", urgency: "NEEDED" },
  { city: "Bangalore", type: "B+", urgency: "URGENT" },
  { city: "Chennai", type: "AB+", urgency: "NEEDED" },
  { city: "Hyderabad", type: "O−", urgency: "CRITICAL" },
  { city: "Pune", type: "A+", urgency: "NEEDED" },
];

const processSteps = [
  { num: "1", icon: UserPlus, title: "Register", desc: "Sign up as a donor and complete your health profile in minutes." },
  { num: "2", icon: Search, title: "Find or Request", desc: "Search donors instantly or post an emergency blood request." },
  { num: "3", icon: Bell, title: "Get Notified", desc: "Nearest verified donors are alerted and respond in real-time." },
  { num: "4", icon: Heart, title: "Save Lives", desc: "Connect, donate, and make a real difference today." },
];

const impactStats = [
  { icon: Users, value: 12842, suffix: "+", label: "Registered Donors" },
  { icon: Droplets, value: 3587, suffix: "+", label: "Lives Saved" },
  { icon: Building2, value: 320, suffix: "+", label: "Partner Hospitals" },
  { icon: Heart, value: 1150, suffix: "+", label: "Requests Fulfilled" },
];

const features = [
  {
    icon: Zap,
    title: "Real-Time Matching",
    desc: "AI-powered matching connects donors with recipients within seconds. No delays in emergencies.",
  },
  {
    icon: Shield,
    title: "Verified & Safe",
    desc: "All donors are medically verified. Every donation meets strict safety and health standards.",
  },
  {
    icon: MapPin,
    title: "Location-Aware",
    desc: "Find the nearest blood donors using precise GPS-based proximity search across cities.",
  },
];

/* ════════════════════════════════════════════════ */
export default function Landing() {
  return (
    <div className="jl-root">

      {/* ══════════════════════════════════════
          HERO
          ══════════════════════════════════════ */}
      <section className="jl-hero">
        {/* Animated bg orbs */}
        <div className="jl-hero-orb-1" aria-hidden />
        <div className="jl-hero-orb-2" aria-hidden />
        <div className="jl-hero-orb-3" aria-hidden />
        {/* Grid pattern */}
        <div className="jl-hero-grid" aria-hidden />

        <div className="jl-container jl-hero-inner">
          {/* ── Left ── */}
          <div className="jl-hero-left">
            <motion.div
              className="jl-hero-tag"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="jl-pulse-dot" />
              Every Drop Counts · Live Requests
            </motion.div>

            <motion.h1
              className="jl-hero-h1"
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              Donate Blood.<br />
              <span className="jl-hero-h1-gradient">Save Lives.</span><br />
              Be a Hero.
            </motion.h1>

            <motion.p
              className="jl-hero-desc"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.26 }}
            >
              JeevaLink connects generous hearts with people in urgent need across India.
              Real-time matching. Verified donors. Life saved.
            </motion.p>

            <motion.div
              className="jl-hero-btns"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link to="/register" className="jl-btn-red">
                Become a Donor <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/requests" className="jl-btn-ghost">
                Request Blood <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Hero stats strip */}
            <motion.div
              className="jl-hero-stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {heroStats.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="jl-hero-stat">
                    <div className="jl-hero-stat-icon">
                      <Icon className="w-4 h-4" style={{ color: "#EF4444" }} />
                    </div>
                    <div>
                      <strong>{s.value}</strong>
                      <span>{s.label}</span>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* ── Right — Visual ── */}
          <motion.div
            className="jl-hero-right"
            initial={{ opacity: 0, scale: 0.88, x: 48 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.18, type: "spring", damping: 20 }}
          >
            {/* Concentric rings */}
            <div className="jl-hero-ring jl-hero-ring-1" aria-hidden />
            <div className="jl-hero-ring jl-hero-ring-2" aria-hidden />
            <div className="jl-hero-ring jl-hero-ring-3" aria-hidden />

            {/* Central floating blood drop SVG */}
            <motion.div
              className="jl-svg-drop-wrap"
              animate={{ y: [0, -18, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg viewBox="0 0 200 240" fill="none" className="jl-svg-drop" aria-hidden>
                <defs>
                  <radialGradient id="dropGrad" cx="38%" cy="28%" r="72%">
                    <stop offset="0%" stopColor="#F87171" />
                    <stop offset="45%" stopColor="#DC2626" />
                    <stop offset="100%" stopColor="#7F1D1D" />
                  </radialGradient>
                  <filter id="dropGlow">
                    <feGaussianBlur stdDeviation="4" result="blur"/>
                    <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                  </filter>
                </defs>
                {/* Drop shape */}
                <path
                  d="M100 10 C100 10 20 100 20 155 C20 200 56 230 100 230 C144 230 180 200 180 155 C180 100 100 10 100 10Z"
                  fill="url(#dropGrad)"
                />
                {/* Specular highlight */}
                <path
                  d="M65 80 C70 60 90 50 100 50 C90 65 72 90 68 110 C62 100 60 92 65 80Z"
                  fill="rgba(255,255,255,0.28)"
                />
                {/* Heart inside */}
                <path
                  d="M100 170 C100 170 72 148 72 132 C72 122 80 116 90 120 C95 122 100 128 100 128 C100 128 105 122 110 120 C120 116 128 122 128 132 C128 148 100 170 100 170Z"
                  fill="white"
                  opacity="0.9"
                />
              </svg>
            </motion.div>

            {/* ECG heartbeat line */}
            <svg viewBox="0 0 400 50" fill="none" className="jl-svg-ecg" aria-hidden>
              <path
                d="M0 25 L80 25 L100 25 L112 5 L124 45 L136 5 L148 45 L160 25 L200 25 L216 25 L228 2 L244 48 L256 25 L280 25 L400 25"
                stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>

            {/* Blood group floating chips */}
            {["A+", "O+", "B+", "AB+"].map((bg, i) => (
              <motion.div
                key={bg}
                className="jl-bg-float-chip"
                style={{
                  top: ["10%", "20%", "65%", "72%"][i],
                  left: ["-2%", "80%", "-4%", "78%"][i],
                }}
                animate={{ y: [0, i % 2 === 0 ? -10 : 10, 0] }}
                transition={{ duration: 3 + i * 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
              >
                {bg}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          EMERGENCY TICKER
          ══════════════════════════════════════ */}
      <section className="jl-ticker-section">
        <div className="jl-container jl-ticker-inner">
          <div className="jl-ticker-label">
            <span className="jl-pulse-dot" style={{ width: 7, height: 7 }} />
            Live Requests
          </div>
          <div className="jl-ticker-track">
            <div className="jl-ticker-scroll">
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <div key={i} className="jl-ticker-item">
                  <Droplets className="w-3 h-3" style={{ color: "#EF4444" }} />
                  <span>{item.urgency}:</span> {item.type} needed in {item.city}
                  <span style={{ color: "rgba(255,255,255,0.15)", marginLeft: 16 }}>•</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          BLOOD TYPES SHOWCASE
          ══════════════════════════════════════ */}
      <section className="jl-blood-types-section">
        <div className="jl-container">
          <motion.div
            className="jl-section-head"
            style={{ marginBottom: 36 }}
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          >
            <span className="jl-section-tag">
              <Droplets className="w-3 h-3" /> All Blood Groups
            </span>
            <h2 className="jl-section-h2" style={{ fontSize: "1.8rem" }}>
              We Connect <span className="jl-red">Every Blood Type</span>
            </h2>
          </motion.div>

          <div className="jl-blood-types-grid">
            {bloodTypes.map((type, i) => (
              <motion.div
                key={type}
                className="jl-blood-type-card"
                variants={fadeIn}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                <div className="jl-blood-type-label">{type}</div>
                <div className="jl-blood-type-sub">Available</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
          ══════════════════════════════════════ */}
      <section className="jl-section jl-how-section">
        <div className="jl-container">
          <motion.div
            className="jl-section-head"
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          >
            <span className="jl-section-tag">
              <Zap className="w-3 h-3" /> How It Works
            </span>
            <h2 className="jl-section-h2">
              Simple Steps. <span className="jl-red">Big Impact.</span>
            </h2>
            <p className="jl-section-p">Your kindness can save someone's life in four easy steps.</p>
          </motion.div>

          {/* Steps row */}
          <div className="jl-steps-row">
            {processSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={step.num}>
                  <motion.div
                    className="jl-process-step"
                    variants={fadeUp}
                    custom={i}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-30px" }}
                  >
                    <div className="jl-process-icon-wrap">
                      <div className="jl-process-icon">
                        <Icon className="w-7 h-7" style={{ color: "#EF4444" }} />
                      </div>
                      <div className="jl-process-num">{step.num}</div>
                    </div>
                    <h4 className="jl-process-title">{step.title}</h4>
                    <p className="jl-process-desc">{step.desc}</p>
                  </motion.div>
                  {/* Arrow connector */}
                  {i < processSteps.length - 1 && (
                    <div className="jl-step-connector" aria-hidden>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Safety note */}
          <motion.div
            className="jl-safety-note"
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          >
            <Shield className="w-5 h-5 flex-shrink-0" style={{ color: "#EF4444" }} />
            <p>Your safety is our priority. We verify all donors and requests to ensure a trusted and secure community across India.</p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          IMPACT — Stats
          ══════════════════════════════════════ */}
      <section className="jl-section jl-impact-section">
        <div className="jl-container jl-impact-inner">
          {/* Left text */}
          <motion.div
            className="jl-impact-left"
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          >
            <span className="jl-section-tag">
              <Activity className="w-3 h-3" /> Our Impact
            </span>
            <h2 className="jl-impact-h2">
              Real People.<br />
              <span className="jl-red">Real Impact.</span>
            </h2>
            <p className="jl-impact-desc">
              Every donation creates a ripple of hope. Together, we're building a healthier and stronger India — one drop at a time.
            </p>
            <Link to="/about" className="jl-btn-red jl-btn-sm">
              Join Our Mission <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Right stats grid */}
          <div className="jl-impact-stats">
            {impactStats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  className="jl-impact-card"
                  variants={fadeUp}
                  custom={i}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-30px" }}
                >
                  <div className="jl-impact-card-icon">
                    <Icon className="w-5 h-5" style={{ color: "#EF4444" }} />
                  </div>
                  <div className="jl-impact-card-num">
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </div>
                  <div className="jl-impact-card-label">{s.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES
          ══════════════════════════════════════ */}
      <section className="jl-section jl-features-section">
        <div className="jl-container">
          <motion.div
            className="jl-section-head"
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          >
            <span className="jl-section-tag">
              <Star className="w-3 h-3" /> Why JeevaLink
            </span>
            <h2 className="jl-section-h2">
              Built for <span className="jl-red">Emergencies.</span>
            </h2>
            <p className="jl-section-p">
              Advanced tools designed to save lives faster and smarter.
            </p>
          </motion.div>

          <div className="jl-features-grid">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  className="jl-feature-card"
                  variants={fadeUp}
                  custom={i}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                >
                  <div className="jl-feature-icon">
                    <Icon className="w-6 h-6" style={{ color: "#EF4444" }} />
                  </div>
                  <h3 className="jl-feature-title">{f.title}</h3>
                  <p className="jl-feature-desc">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA — Be The Reason
          ══════════════════════════════════════ */}
      <section className="jl-cta-section">
        <div className="jl-container jl-cta-inner">
          {/* Left */}
          <motion.div
            className="jl-cta-left"
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          >
            <div className="jl-cta-tag">
              <span className="jl-pulse-dot" />
              Be the Reason
            </div>
            <h2 className="jl-cta-h2">
              Be the reason<br />
              <span className="jl-cta-red-word">someone lives.</span>
            </h2>
            <p className="jl-cta-p">
              Join our growing community of heroes across India and make a life-saving difference starting today.
            </p>
            <div className="jl-cta-btns">
              <Link to="/register" className="jl-btn-red">Become a Donor <ArrowRight className="w-4 h-4" /></Link>
              <Link to="/requests" className="jl-btn-outline-dark">Request Blood</Link>
            </div>

            {/* Social links */}
            <div className="jl-social-row">
              <span className="jl-social-label">Follow:</span>
              {[
                { Icon: SocialIcons.Facebook, label: "Facebook" },
                { Icon: SocialIcons.Instagram, label: "Instagram" },
                { Icon: SocialIcons.Twitter, label: "X / Twitter" },
                { Icon: SocialIcons.Youtube, label: "YouTube" },
                { Icon: SocialIcons.Linkedin, label: "LinkedIn" },
              ].map(({ Icon, label }) => (
                <a key={label} href="#" className="jl-social-icon" aria-label={label}>
                  <Icon />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Right — decorative visual */}
          <motion.div
            className="jl-cta-right"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring", damping: 20 }}
          >
            {/* Large decorative circle */}
            <div className="jl-cta-img-circle" />

            {/* Animated blood drop SVG */}
            <motion.div
              className="jl-cta-svg-wrap"
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg viewBox="0 0 240 290" fill="none" className="jl-cta-svg-drop" aria-hidden>
                <defs>
                  <radialGradient id="ctaDropGrad" cx="38%" cy="28%" r="72%">
                    <stop offset="0%" stopColor="#F87171" />
                    <stop offset="55%" stopColor="#DC2626" />
                    <stop offset="100%" stopColor="#7F1D1D" />
                  </radialGradient>
                </defs>
                <path
                  d="M120 14 C120 14 24 120 24 186 C24 240 68 276 120 276 C172 276 216 240 216 186 C216 120 120 14 120 14Z"
                  fill="url(#ctaDropGrad)"
                />
                {/* Highlight */}
                <path
                  d="M78 96 C84 72 108 60 120 60 C108 78 86 108 82 132 C74 120 72 110 78 96Z"
                  fill="rgba(255,255,255,0.25)"
                />
                {/* Family silhouette inside */}
                <g opacity="0.88" fill="white">
                  <circle cx="90" cy="180" r="12" />
                  <path d="M70 240 C70 216 78 208 90 208 C102 208 110 216 110 240Z" />
                  <circle cx="120" cy="186" r="9" />
                  <path d="M105 240 C105 220 111 214 120 214 C129 214 135 220 135 240Z" />
                  <circle cx="150" cy="180" r="12" />
                  <path d="M130 240 C130 216 138 208 150 208 C162 208 170 216 170 240Z" />
                </g>
              </svg>
            </motion.div>

            {/* Floating stat badge */}
            <motion.div
              className="jl-cta-float-badge"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <Droplets className="w-4 h-4" style={{ color: "#EF4444" }} />
              <span>4,521 lives saved so far</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
