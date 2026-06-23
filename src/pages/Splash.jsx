import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore.js';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';

export default function Splash({ onComplete }) {
  const { token } = useAuthStore();
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        navigate(token ? '/donor/dashboard' : '/');
      }
    }, 3200);

    return () => clearTimeout(timerRef.current);
  }, [navigate, token, onComplete]);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-white to-rose-50/50 pointer-events-none" />
      
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="w-64 h-auto mix-blend-multiply drop-shadow-2xl"
        >
          <img 
            src={logoImg} 
            alt="JeevaLink Logo" 
            className="w-full h-full object-contain"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
