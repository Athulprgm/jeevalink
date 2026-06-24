import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

/**
 * ConfirmModal — Confirmation dialog for destructive / important actions.
 *
 * Props:
 *   isOpen       boolean
 *   onClose      () => void
 *   onConfirm    () => void
 *   title        string
 *   message      string
 *   confirmLabel string (default: 'Confirm')
 *   variant      'danger' | 'warning' | 'info'
 *   loading      boolean
 */
export default function ConfirmModal({
  isOpen, onClose, onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  variant = 'danger',
  loading = false,
}) {
  const variantMap = {
    danger:  { icon: AlertTriangle, bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', btn: 'bg-red-500 hover:bg-red-600 text-white' },
    warning: { icon: AlertTriangle, bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', btn: 'bg-amber-500 hover:bg-amber-600 text-white' },
    info:    { icon: AlertTriangle, bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', btn: 'bg-blue-500 hover:bg-blue-600 text-white' },
  };
  const v = variantMap[variant] || variantMap.danger;
  const Icon = v.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm"
          >
            <div className="bg-[#141929] border border-white/10 rounded-2xl p-6 shadow-2xl mx-4">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon */}
              <div className={`w-12 h-12 ${v.bg} border ${v.border} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <Icon className={`w-6 h-6 ${v.text}`} />
              </div>

              {/* Content */}
              <h3 className="text-white font-black text-center text-base mb-2">{title}</h3>
              <p className="text-slate-400 text-xs text-center leading-relaxed mb-6">{message}</p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold rounded-xl hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 ${v.btn}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </span>
                  ) : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
