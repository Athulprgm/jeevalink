import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore.js';
import { useNavigate } from 'react-router-dom';
import loadingVideo from '../assets/InShot_20260608_170726564.mp4';

export default function Splash({ onComplete }) {
  const { token } = useAuthStore();
  const [ready, setReady] = useState(false);
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Safety fallback: if video event doesn't fire, transition anyway
    const fallback = setTimeout(() => {
      setReady(true);
    }, 1500);

    // If video is already cached and ready
    if (videoRef.current && videoRef.current.readyState >= 3) {
      setReady(true);
    }

    return () => {
      clearTimeout(fallback);
      clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (ready) {
      timerRef.current = setTimeout(() => {
        if (onComplete) {
          onComplete();
        } else {
          navigate(token ? '/donor/dashboard' : '/');
        }
      }, 3200);
    }
    return () => {
      clearTimeout(timerRef.current);
    };
  }, [ready, navigate, token, onComplete]);

  const handleVideoLoad = () => {
    setReady(true);
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn("Video play was prevented:", err);
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-rose-50 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-[280px] rounded-[32px] overflow-hidden shadow-2xl shadow-red-200/60 border border-red-100/60 bg-white"
      >
        <video
          ref={videoRef}
          src={loadingVideo}
          autoPlay
          loop={false}
          muted
          playsInline
          preload="auto"
          onLoadedData={handleVideoLoad}
          onCanPlay={handleVideoLoad}
          className="w-full h-full object-cover block"
        />
      </motion.div>
    </div>
  );
}
