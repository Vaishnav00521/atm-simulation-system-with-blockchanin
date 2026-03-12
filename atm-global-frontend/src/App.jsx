import React, { createContext, useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LogOut, LayoutDashboard, Wallet as WalletIcon, Activity, 
  Settings as SettingsIcon, Menu, X, ShieldCheck, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import Network from './pages/Network';
import Contracts from './pages/Contracts';
import Settings from './pages/Settings';
import LisaAI from './components/LisaAI';

const GlobalContext = createContext();
export const useGlobal = () => useContext(GlobalContext);

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('fintech_jwt');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const currentUsername = localStorage.getItem('fintech_username') || 'Guest';
  
  const handleLogout = () => {
    localStorage.removeItem('fintech_jwt');
    localStorage.removeItem('fintech_username'); 
    window.location.href = '/login';
  };

  if (location.pathname === '/login') return null;

  const navItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Trading Terminal' },
    { path: '/wallet', icon: <WalletIcon size={20} />, label: 'Web3 Vault' },
    { path: '/network', icon: <Activity size={20} />, label: 'Node Status' },
    { path: '/contracts', icon: <FileText size={20} />, label: 'Smart Contracts' },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm" />}
      </AnimatePresence>

      <motion.nav className={`fixed lg:static top-0 left-0 h-screen w-72 bg-zinc-950 border-r border-zinc-800 flex flex-col z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between border-b border-zinc-800/50">
          <div>
            <h1 className="text-2xl font-black text-white tracking-widest flex items-center gap-2">GLOBAL<span className="text-emerald-500">ATM</span></h1>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mt-1 flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-500" /> Enterprise Secured</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-zinc-400 hover:text-white p-2 bg-zinc-900 rounded-lg"><X size={20} /></button>
        </div>

        <div className="flex-1 px-4 py-8 space-y-3 overflow-y-auto hide-scrollbar">
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest px-4 mb-2">Main Menu</p>
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${location.pathname === item.path ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 shadow-inner' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900'}`}>
              {item.icon} {item.label}
            </Link>
          ))}
        </div>

        <div className="p-6 border-t border-zinc-800 bg-black/50 space-y-3">
          <div className="flex items-center gap-3 mb-6 p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white uppercase shadow-inner">{currentUsername.charAt(0)}</div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{currentUsername}</p>
              <p className="text-xs text-zinc-500 font-mono">Node Operator</p>
            </div>
          </div>

          {/* 🔴 Now a functional link */}
          <Link to="/settings" onClick={() => setIsOpen(false)} className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-bold transition-all rounded-xl ${location.pathname === '/settings' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}>
            <SettingsIcon size={20} /> System Settings
          </Link>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><LogOut size={20} /> Terminate Session</button>
        </div>
      </motion.nav>
    </>
  );
};

const App = () => {
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <GlobalContext.Provider value={{ aiChatOpen, setAiChatOpen }}>
      <Router>
        <div className="min-h-screen bg-black text-zinc-200 selection:bg-emerald-500/30 font-sans flex overflow-hidden">
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
          
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <div className="lg:hidden bg-zinc-950 border-b border-zinc-800 p-4 flex justify-between items-center z-30 shadow-md">
               <h1 className="text-lg font-black text-white tracking-widest flex items-center gap-1">GLOBAL<span className="text-emerald-500">ATM</span></h1>
               <button onClick={() => setSidebarOpen(true)} className="text-zinc-400 p-2 bg-zinc-900 rounded-lg"><Menu size={20} /></button>
            </div>

            <main className="flex-1 overflow-y-auto custom-scrollbar relative">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
                
                {/* 🔴 The New Pages */}
                <Route path="/network" element={<ProtectedRoute><Network /></ProtectedRoute>} />
                <Route path="/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>

          {localStorage.getItem('fintech_jwt') && <LisaAI />}
        </div>
      </Router>
    </GlobalContext.Provider>
  );
};

export default App;