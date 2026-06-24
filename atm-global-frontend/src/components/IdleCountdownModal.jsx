import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, LogOut } from 'lucide-react';

/**
 * IdleCountdownModal — Full-screen countdown overlay shown before auto-eject.
 *
 * Props:
 *   show         — boolean
 *   countdown    — number (10 down to 0)
 *   onStayLoggedIn() — resets timer
 */
const IdleCountdownModal = ({ show, countdown, onStayLoggedIn }) => {
  const pct = (countdown / 10) * 100;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/85 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 30 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className="bg-zinc-950 border-2 border-red-500/40 rounded-3xl p-10 max-w-sm w-full text-center shadow-[0_0_60px_rgba(239,68,68,0.2)]"
          >
            {/* Pulsing warning icon */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6"
            >
              <AlertTriangle size={32} className="text-red-400" />
            </motion.div>

            <h2 className="text-2xl font-black text-white mb-2">Session Expiring</h2>
            <p className="text-zinc-500 text-sm mb-8">
              You've been inactive. Your session will be terminated for security.
            </p>

            {/* Circular countdown */}
            <div className="relative w-28 h-28 mx-auto mb-8">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#27272a" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-black text-red-400">{countdown}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={onStayLoggedIn}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2"
              >
                <Clock size={18} /> Stay Logged In
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="w-full bg-transparent border border-zinc-800 hover:border-red-500/40 text-zinc-500 hover:text-red-400 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                <LogOut size={16} /> Logout Now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IdleCountdownModal;
