import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, MapPin, Globe, MessageCircle, Share2, ArrowUpRight, Droplets } from 'lucide-react';

const platformLinks = [
  { to: '/', label: 'Home' },
  { to: '/donor/search', label: 'Find Donors' },
  { to: '/requests', label: 'Blood Requests' },
  { to: '/register', label: 'Register as Donor' },
];

const companyLinks = [
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact Us' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white">
      <div className="container-wide py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-red-900/30">
                <Droplets className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-lg font-black tracking-tight">
                Jeeva<span className="text-primary">Link</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Connecting blood donors with those in need, across India. Every drop of blood is a gift of life.
            </p>
            <div className="flex items-center gap-2">
              {[Globe, MessageCircle, Share2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-gray-800 hover:bg-primary rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-red-900/30"
                >
                  <Icon className="w-4 h-4 text-gray-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-5">Platform</h4>
            <ul className="space-y-2.5">
              {platformLinks.map((l) => (
                <li key={l.to + l.label}>
                  <Link
                    to={l.to}
                    className="group flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {l.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-5">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="group flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {l.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-5">Contact</h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <Mail className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>support@jeevalink.org</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <Phone className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>Bengaluru, Karnataka, India</span>
              </li>
            </ul>

            {/* Emergency helpline */}
            <div className="mt-5 p-4 bg-gradient-to-br from-red-900/50 to-red-950/50 border border-red-800/40 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                Emergency Helpline
              </p>
              <p className="text-white font-black text-2xl tracking-tight">1910</p>
              <p className="text-red-400/70 text-[10px] mt-0.5">Available 24/7</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800/60 py-5">
        <div className="container-wide flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <p>© 2026 JeevaLink. All rights reserved. Made with <Heart className="w-3 h-3 text-primary inline fill-primary" /> in India.</p>
          <p className="font-semibold">Connecting Life • Sharing Hope</p>
        </div>
      </div>
    </footer>
  );
}
