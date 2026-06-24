import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Shield, Cpu, Banknote, CheckCircle2, XCircle,
  Download, ArrowRight
} from 'lucide-react';

/**
 * DispensingStateMachine — Multi-step animated overlay that simulates
 * the physical mechanics of an ATM dispensing funds.
 *
 * States: AUTHENTICATING → SECURING_NETWORK → EXECUTING_CONTRACT → DISPENSING → COMPLETE | ERROR
 *
 * Props:
 *   isOpen         — controls visibility
 *   transactionType — 'DEPOSIT' | 'WITHDRAW'
 *   amount         — the amount string
 *   currency       — 'ETH' | 'USD'
 *   txHash         — tx hash on completion
 *   error          — error string on failure
 *   onClose()      — called when user dismisses
 *   onDownloadReceipt() — called when user clicks download
 */

const STAGES = [
  {
    id: 'AUTHENTICATING',
    label: 'Authenticating Identity',
    sub: 'Verifying cryptographic credentials against ledger...',
    icon: Lock,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    duration: 1500,
  },
  {
    id: 'SECURING_NETWORK',
    label: 'Securing Network',
    sub: 'Establishing encrypted channel to consensus nodes...',
    icon: Shield,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    duration: 2000,
  },
  {
    id: 'EXECUTING_CONTRACT',
    label: 'Executing Smart Contract',
    sub: 'Broadcasting signed transaction to Ethereum network...',
    icon: Cpu,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    duration: 3000,
  },
  {
    id: 'DISPENSING',
    label: 'Dispensing Funds',
    sub: 'Settling balance in your institutional vault...',
    icon: Banknote,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    duration: 2000,
  },
];

const DispensingStateMachine = ({
  isOpen,
  transactionType = 'WITHDRAW',
  amount = '0',
  currency = 'ETH',
  txHash = null,
  error = null,
  onClose,
  onDownloadReceipt,
}) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isError, setIsError] = useState(false);
  const [terminalLines, setTerminalLines] = useState([]);

  useEffect(() => {
    if (!isOpen) {
      // Reset on close
      setCurrentStageIdx(0);
      setIsComplete(false);
      setIsError(false);
      setTerminalLines([]);
      return;
    }

    if (error) {
      setIsError(true);
      return;
    }

    // Auto-advance through stages
    let totalDelay = 0;
    STAGES.forEach((stage, idx) => {
      setTimeout(() => {
        setCurrentStageIdx(idx);
        setTerminalLines((prev) => [
          ...prev,
          `[${new Date().toISOString().substring(11, 19)}] ${stage.label}...`,
        ]);
      }, totalDelay);
      totalDelay += stage.duration;
    });

    // Complete
    setTimeout(() => {
      setIsComplete(true);
      setTerminalLines((prev) => [
        ...prev,
        `[${new Date().toISOString().substring(11, 19)}] Transaction confirmed. Hash: ${txHash || 'pending...'}`,
      ]);
    }, totalDelay);
  }, [isOpen, error, txHash]);

  const currentStage = STAGES[Math.min(currentStageIdx, STAGES.length - 1)];
  const StageIcon = currentStage.icon;
  const progress = isComplete ? 100 : ((currentStageIdx + 1) / STAGES.length) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            transition={{ type: 'spring', bounce: 0.25 }}
            className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-2">
                GlobalATM — {transactionType} Protocol
              </p>
              <h2 className="text-2xl font-black text-white">
                {amount} {currency}
              </h2>
            </div>

            {/* State display */}
            {!isComplete && !isError && (
              <div className="flex flex-col items-center gap-6 mb-8">
                <motion.div
                  key={currentStage.id}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`w-20 h-20 rounded-2xl ${currentStage.bg} border ${currentStage.border} flex items-center justify-center`}
                >
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <StageIcon size={36} className={currentStage.color} />
                  </motion.div>
                </motion.div>

                <div className="text-center">
                  <motion.h3
                    key={currentStage.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-bold text-white mb-1"
                  >
                    {currentStage.label}
                  </motion.h3>
                  <motion.p
                    key={currentStage.sub}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-zinc-500"
                  >
                    {currentStage.sub}
                  </motion.p>
                </div>
              </div>
            )}

            {/* Complete state */}
            {isComplete && !isError && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="flex flex-col items-center gap-4 mb-8"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 size={40} className="text-emerald-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-emerald-400 mb-1">Transaction Complete</h3>
                  {txHash && (
                    <p className="text-xs font-mono text-zinc-500 bg-zinc-900 px-3 py-1.5 rounded-lg mt-2 break-all">
                      {txHash}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Error state */}
            {isError && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-4 mb-8"
              >
                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <XCircle size={40} className="text-red-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-red-400 mb-1">Transaction Failed</h3>
                  <p className="text-sm text-zinc-500 max-w-xs">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Progress bar */}
            {!isError && (
              <div className="mb-6">
                <div className="flex justify-between text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">
                  {STAGES.map((s, i) => (
                    <span key={s.id} className={i <= currentStageIdx || isComplete ? 'text-emerald-500' : ''}>
                      {i + 1}
                    </span>
                  ))}
                </div>
                <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-[9px] text-zinc-700 mt-1.5 font-mono">
                  {STAGES.map((s) => (
                    <span key={s.id}>{s.id.replace(/_/g, ' ')}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Terminal log */}
            {terminalLines.length > 0 && (
              <div className="bg-black border border-zinc-800 rounded-xl p-3 mb-6 font-mono text-xs text-emerald-400/70 space-y-1 max-h-24 overflow-y-auto">
                {terminalLines.map((line, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
                    {line}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              {(isComplete || isError) && (
                <>
                  {isComplete && onDownloadReceipt && (
                    <button
                      onClick={onDownloadReceipt}
                      className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Download size={16} /> Download Receipt
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    Return to Terminal <ArrowRight size={16} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DispensingStateMachine;
