import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Eye, EyeOff } from 'lucide-react';

/**
 * AntiPhishingBanner — Always shows the user's secret phrase so they
 * can immediately spot a fake/cloned website (which won't know the phrase).
 *
 * If no phrase is set, shows a subtle prompt to configure one.
 */
const AntiPhishingBanner = () => {
  const [visible, setVisible] = useState(true);
  const phrase = localStorage.getItem('anti_phishing_phrase');

  if (!phrase) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="mx-4 mb-3"
      >
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl px-3 py-2 flex items-center gap-2">
          <AlertTriangle size={12} className="text-amber-500 shrink-0" />
          <p className="text-[10px] text-amber-400/80 font-medium">
            No anti-phishing phrase set.{' '}
            <a href="/settings" className="underline hover:text-amber-300 transition-colors">
              Configure in Settings.
            </a>
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mx-4 mb-3"
    >
      <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl px-3 py-2 flex items-center gap-2 group">
        <ShieldCheck size={12} className="text-emerald-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">
            Your Security Phrase
          </p>
          <p className="text-[11px] text-emerald-400 font-bold truncate flex items-center gap-1">
            {visible ? phrase : '••••••••••'}
          </p>
        </div>
        <button
          onClick={() => setVisible((v) => !v)}
          className="text-zinc-600 hover:text-emerald-400 transition-colors shrink-0"
          title={visible ? 'Hide phrase' : 'Show phrase'}
        >
          {visible ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>
      </div>
    </motion.div>
  );
};

export default AntiPhishingBanner;
