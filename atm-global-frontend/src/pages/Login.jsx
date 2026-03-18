import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, User, ShieldCheck, Cpu, ArrowRight, Eye, EyeOff, 
  Terminal, AlertTriangle, UserPlus, LogIn
} from 'lucide-react';
import api from '../api/axiosConfig'; // 🔴 Shared API instance
import { useNavigate } from 'react-router-dom';

const bootSequence = [
  "[SYS] Initializing Global ATM Protocol...",
  "[NET] Establishing secure WebSocket to Enterprise Node...",
  "[SEC] Verifying TLS 1.3 Cryptographic Handshake...",
  "[DB] Synchronizing MySQL User Ledgers...",
  "[AI] Waking Emlie Neural Agent...",
  "[SYS] Mainframe Ready. Awaiting Credentials."
];

const Login = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [terminalLines, setTerminalLines] = useState([]);

  // --- TERMINAL TYPING EFFECT ---
  useEffect(() => {
    let delay = 0;
    setTerminalLines([]);
    bootSequence.forEach((line) => {
      setTimeout(() => {
        setTerminalLines(prev => [...prev, line]);
      }, delay);
      delay += 400 + Math.random() * 400;
    });
  }, []);

  // --- AUTHENTICATION HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (isRegistering && password !== confirmPassword) {
      setError('Security protocols failed: Passwords do not match.');
      setIsLoading(false);
      return;
    }

    // 🔴 Use the shared api instance which handles baseURL and security protocols
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';

    try {
      const response = await api.post(endpoint, {
        username: username,
        password: password
      });

      if (response.data && response.data.token) {
        // Store Token AND Username securely in the browser
        localStorage.setItem('fintech_jwt', response.data.token);
        localStorage.setItem('fintech_username', response.data.username || username);

        // Safely route to dashboard
        navigate('/dashboard');
      } else {
        setError('System error: Token not received from mainframe.');
      }
    } catch (err) {
      console.error("Auth Error:", err);

      if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        setError('Cannot connect to server. Ensure backend is online and CORS is configured.');
      } else if (err.response) {
        setError(err.response.data?.message || `Server error: ${err.response.status}`);
      } else if (err.request) {
        setError('No response from server. Backend may be down.');
      } else {
        setError(isRegistering ? 'Registration failed. System error.' : 'Authorization failed. Invalid credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-black flex overflow-hidden text-zinc-200">
      
      {/* 🔴 LEFT PANEL: BRANDING & TERMINAL */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-zinc-950 border-r border-zinc-800 flex-col justify-between p-12">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-black border border-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-900/20">
            <Cpu className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-4">
            GLOBAL<span className="text-emerald-500">ATM</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
            Enterprise-grade liquidity management and decentralized asset routing architecture.
          </p>
        </div>

        {/* Live Terminal */}
        <div className="relative z-10 bg-black/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 h-64 overflow-hidden flex flex-col font-mono text-xs shadow-2xl">
          <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
            <Terminal size={14} className="text-zinc-500" />
            <span className="text-zinc-500 font-bold uppercase tracking-widest">System Boot Sequence</span>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col justify-end space-y-2">
            {terminalLines.map((line, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-emerald-400/80">
                {line}
              </motion.div>
            ))}
            <div className="flex items-center gap-2 mt-2 text-zinc-300">
              <span className="text-emerald-500">root@global-atm:~#</span> 
              <span className="w-2 h-4 bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* 🔴 RIGHT PANEL: DYNAMIC AUTHENTICATION FLOW */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md relative z-10">
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={isRegistering ? "register" : "login"} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }} 
              transition={{ duration: 0.3 }}
              className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl shadow-2xl"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  {isRegistering ? 'Initialize Node' : 'Access Terminal'}
                </h2>
                <p className="text-zinc-500 text-sm mt-2 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> 
                  {isRegistering ? 'Create your enterprise profile' : 'Secure Mainframe Connection'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl flex items-center gap-3">
                    <AlertTriangle size={16} className="shrink-0" /> {error}
                  </motion.div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Profile ID</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="Enter desired username" required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Access Passcode</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl py-3.5 pl-11 pr-12 text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="Enter secure passcode" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-600 hover:text-white transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {isRegistering && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1.5 overflow-hidden">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Confirm Passcode</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="Verify secure passcode" required />
                    </div>
                  </motion.div>
                )}

                <button type="submit" disabled={isLoading || !username || !password} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  {isLoading ? "Processing..." : isRegistering ? <>Establish Profile <UserPlus className="w-5 h-5" /></> : <>Initialize Handshake <ArrowRight className="w-5 h-5" /></>}
                </button>

                <div className="relative mt-8">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-zinc-950 px-4 text-zinc-600 font-bold uppercase tracking-widest">Or</span>
                  </div>
                </div>

                <div className="text-center mt-6">
                  <button type="button" onClick={toggleMode} className="text-sm font-bold text-zinc-400 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2 w-full">
                    {isRegistering ? <><LogIn size={16}/> Return to Terminal Access</> : <><UserPlus size={16}/> Register New Enterprise Node</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default Login;