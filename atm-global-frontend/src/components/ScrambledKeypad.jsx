import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, X } from 'lucide-react';

/**
 * ScrambledKeypad — A virtual numpad where digit positions are
 * Fisher-Yates shuffled on every mount/open.
 *
 * Defeats keyloggers (no keyboard input) and screen-click trackers
 * (digit positions are never in the same place twice).
 *
 * Props:
 *   onComplete(pin: string) — called when PIN is fully entered
 *   maxLength (default: 4)
 *   onCancel() — called when X button is pressed
 */
const ScrambledKeypad = ({ onComplete, maxLength = 4, onCancel, error = false }) => {
  const [digits, setDigits] = useState([]);
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);

  // Fisher-Yates shuffle
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const scramble = useCallback(() => {
    setDigits(shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]));
  }, []);

  useEffect(() => {
    scramble();
  }, [scramble]);

  // Trigger shake + re-scramble on external error signal
  useEffect(() => {
    if (error) {
      setShake(true);
      setInput('');
      setTimeout(() => {
        setShake(false);
        scramble();
      }, 500);
    }
  }, [error, scramble]);

  const handleDigit = (d) => {
    if (input.length >= maxLength) return;
    const newInput = input + d;
    setInput(newInput);
    if (newInput.length === maxLength) {
      // Re-scramble for next use, then call back
      setTimeout(() => {
        onComplete(newInput);
        setInput('');
        scramble();
      }, 120);
    }
  };

  const handleBack = () => {
    setInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setInput('');
    scramble();
  };

  // Build the 4×3 grid layout: rows of 3 from the shuffled digits array
  // Row 0: digits[0..2], Row 1: digits[3..5], Row 2: digits[6..8], Row 3: [CLR, digits[9], ⌫]
  const rows = [
    [digits[0], digits[1], digits[2]],
    [digits[3], digits[4], digits[5]],
    [digits[6], digits[7], digits[8]],
  ];

  const dotStyle = (filled) =>
    `w-3 h-3 rounded-full border-2 transition-all duration-200 ${
      filled ? 'bg-emerald-400 border-emerald-400 scale-110' : 'bg-transparent border-zinc-600'
    }`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 20 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 w-72 shadow-2xl relative"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
          Secure PIN Entry
        </p>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-zinc-600 hover:text-white transition-colors p-1 rounded-lg bg-black border border-zinc-800"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* PIN Dots */}
      <motion.div
        animate={shake ? { x: [-8, 8, -8, 8, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-center gap-4 mb-6"
      >
        {Array.from({ length: maxLength }).map((_, i) => (
          <div key={i} className={dotStyle(i < input.length)} />
        ))}
      </motion.div>

      {/* Digit grid */}
      <div className="space-y-2">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-3 gap-2">
            {row.map((d) => (
              <KeyButton key={d} value={d} onClick={() => handleDigit(String(d))} />
            ))}
          </div>
        ))}

        {/* Bottom row: CLR | 0 | ⌫ */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleClear}
            className="h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 text-xs font-bold uppercase tracking-widest transition-all"
          >
            CLR
          </button>
          <KeyButton value={digits[9]} onClick={() => handleDigit(String(digits[9]))} />
          <button
            onClick={handleBack}
            className="h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-all"
          >
            <Delete size={18} />
          </button>
        </div>
      </div>

      {/* Security notice */}
      <p className="text-center text-[10px] text-zinc-700 mt-4 font-mono">
        🔀 Keys randomized — keylogger proof
      </p>
    </motion.div>
  );
};

const KeyButton = ({ value, onClick }) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.88 }}
    className="h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-bold text-lg
      hover:bg-zinc-800 hover:border-zinc-600 hover:text-emerald-400 transition-all
      active:bg-emerald-500/10 active:border-emerald-500/30 select-none"
  >
    {value}
  </motion.button>
);

export default ScrambledKeypad;
