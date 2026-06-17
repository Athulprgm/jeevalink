import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/appStore.js';

export default function Toast() {
  const { toast, clearToast } = useAppStore();

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />,
    error:   <XCircle className="w-5 h-5 text-red-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info:    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const colors = {
    success: 'border-green-200 bg-green-50',
    error:   'border-red-200 bg-red-50',
    warning: 'border-amber-200 bg-amber-50',
    info:    'border-blue-200 bg-blue-50',
  };

  return (
    <div className="fixed top-4 right-4 z-[100] pointer-events-none">
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.9 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={clearToast}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-xl max-w-sm cursor-pointer ${colors[toast.type] || colors.info}`}
          >
            {icons[toast.type] || icons.info}
            <p className="text-sm font-semibold text-gray-800 leading-snug">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
