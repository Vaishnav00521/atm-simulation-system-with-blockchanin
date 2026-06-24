import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, QrCode, KeyRound, Copy, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api/axiosClient';

/**
 * TotpSetupModal — Handles the 2-step TOTP enrollment flow.
 *
 * Props:
 *   isOpen: boolean
 *   onClose: () => void
 *   onComplete: () => void (called when TOTP is successfully enabled)
 */
const TotpSetupModal = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [secret, setSecret] = useState('');
  const [qrUri, setQrUri] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Fetch TOTP secret when modal opens
  React.useEffect(() => {
    if (isOpen && step === 1) {
      setLoading(true);
      setError('');
      api.get('/api/totp/setup')
        .then((res) => {
          setSecret(res.data.secret);
          setQrUri(res.data.qrUri);
        })
        .catch(() => setError('Failed to generate TOTP secret. Please try again.'))
        .finally(() => setLoading(false));
    } else if (!isOpen) {
      // Reset state on close
      setStep(1);
      setSecret('');
      setQrUri('');
      setCode('');
      setError('');
      setCopied(false);
    }
  }, [isOpen, step]);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    setError('');

    try {
      await api.post('/api/totp/verify-setup', { code: parseInt(code, 10) });
      onComplete(); // Notify parent
      onClose();    // Close modal
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Enable 2FA</h3>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest">Google Authenticator</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors bg-zinc-900 rounded-lg">
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm font-bold">
                  <AlertTriangle size={16} /> {error}
                </div>
              )}

              {step === 1 ? (
                // Step 1: Scan QR
                <div className="space-y-6">
                  <p className="text-zinc-400 text-sm">
                    Scan this QR code with Google Authenticator, Authy, or your preferred TOTP app.
                  </p>

                  <div className="flex justify-center bg-white p-4 rounded-2xl w-fit mx-auto shadow-inner">
                    {loading || !qrUri ? (
                      <div className="w-40 h-40 flex items-center justify-center border border-dashed border-zinc-300 rounded-xl">
                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <QRCodeSVG value={qrUri} size={160} level="M" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Or enter secret manually</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-3 font-mono text-emerald-400 text-sm overflow-hidden text-ellipsis">
                        {secret || 'Loading...'}
                      </div>
                      <button
                        onClick={handleCopySecret}
                        disabled={!secret}
                        className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 p-3 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {copied ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!secret}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    Next Step <ArrowRight size={18} />
                  </button>
                </div>
              ) : (
                // Step 2: Verify Code
                <div className="space-y-6">
                  <p className="text-zinc-400 text-sm">
                    Enter the 6-digit code generated by your authenticator app to verify setup.
                  </p>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Verification Code</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <KeyRound className="h-5 w-5 text-emerald-500" />
                      </div>
                      <input
                        type="text"
                        maxLength="6"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-black border border-zinc-800 rounded-xl py-4 pl-11 pr-4 text-emerald-400 placeholder-zinc-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono tracking-[0.5em] text-center text-lg"
                        placeholder="000000"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleVerify}
                    disabled={code.length !== 6 || loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Enable 2FA'}
                  </button>
                  
                  <button
                    onClick={() => setStep(1)}
                    className="w-full bg-transparent text-zinc-500 hover:text-white font-bold py-2 text-sm transition-colors"
                  >
                    Back to QR Code
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TotpSetupModal;
