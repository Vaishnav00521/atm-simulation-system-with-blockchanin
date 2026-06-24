import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Key, Shield, Bell, Save, Fingerprint, ShieldCheck, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import api from '../api/axiosClient';
import TotpSetupModal from '../components/TotpSetupModal';
import { useWebAuthn } from '../hooks/useWebAuthn';

const Settings = () => {
  const currentUsername = localStorage.getItem('fintech_username') || 'Administrator';
  const [activeTab, setActiveTab] = useState('profile');
  const [phraseInput, setPhraseInput] = useState(localStorage.getItem('anti_phishing_phrase') || '');
  const [phraseStatus, setPhraseStatus] = useState(null); // 'success' | 'error' | null
  const [phraseSaving, setPhraseSaving] = useState(false);
  const [totpModalOpen, setTotpModalOpen] = useState(false);
  const { registerPasskey } = useWebAuthn();
  const [passkeyStatus, setPasskeyStatus] = useState('');

  const handleSavePhrase = async () => {
    if (!phraseInput.trim()) return;
    setPhraseSaving(true);
    setPhraseStatus(null);
    try {
      await api.put('/api/auth/anti-phishing', { phrase: phraseInput.trim() });
      localStorage.setItem('anti_phishing_phrase', phraseInput.trim());
      setPhraseStatus('success');
    } catch (err) {
      setPhraseStatus('error');
    } finally {
      setPhraseSaving(false);
      setTimeout(() => setPhraseStatus(null), 3000);
    }
  };

  const handleRegisterPasskey = async () => {
    setPasskeyStatus('Registering...');
    const success = await registerPasskey(currentUsername);
    if (success) {
      setPasskeyStatus('Passkey Registered Successfully!');
      setTimeout(() => setPasskeyStatus(''), 3000);
    } else {
      setPasskeyStatus('Failed to register Passkey.');
      setTimeout(() => setPasskeyStatus(''), 3000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      
      <div className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 p-8 rounded-3xl shadow-xl">
        <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center text-4xl font-black text-white uppercase shadow-inner">
          {currentUsername.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-black text-white">{currentUsername}</h1>
          <p className="text-emerald-500 font-bold text-sm tracking-widest uppercase">System Operator Level 4</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 space-y-2">
          {[
            { id: 'profile', icon: <User size={18}/>, label: 'Profile Details' },
            { id: 'security', icon: <Shield size={18}/>, label: 'Security & MFA' },
            { id: 'api', icon: <Key size={18}/>, label: 'Developer APIs' },
            { id: 'notifications', icon: <Bell size={18}/>, label: 'Alert Toggles' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === tab.id ? 'bg-zinc-900 text-white border border-zinc-800' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-xl min-h-[400px]">
          
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white border-b border-zinc-800 pb-4">Operator Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Operator ID</label>
                  <input type="text" readOnly value={currentUsername} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-zinc-400 focus:outline-none cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Registered Email</label>
                  <input type="email" defaultValue={`${currentUsername.toLowerCase()}@global-atm.net`} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Enterprise Branch</label>
                  <select className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 appearance-none">
                    <option>North America (NA-EAST-1)</option>
                    <option>Europe (EU-CENTRAL-1)</option>
                    <option>Asia Pacific (AP-SOUTH-1)</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"><Save size={18}/> Update Profile</button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white border-b border-zinc-800 pb-4">Multi-Factor Security</h3>

              {/* Anti-Phishing Phrase */}
              <div className="bg-black border border-zinc-800 p-5 rounded-2xl space-y-4">
                <div>
                  <h4 className="text-white font-bold flex items-center gap-2"><ShieldCheck className="text-emerald-500" size={18}/> Anti-Phishing Phrase</h4>
                  <p className="text-sm text-zinc-500 mt-1">Set a secret word shown on every page. If it's missing, you're on a fake site.</p>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={phraseInput}
                    onChange={(e) => setPhraseInput(e.target.value)}
                    placeholder="e.g. PurpleDragon2026"
                    className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    maxLength={40}
                  />
                  <button
                    onClick={handleSavePhrase}
                    disabled={phraseSaving || !phraseInput.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                  >
                    {phraseSaving ? 'Saving...' : <><Save size={14}/> Save</>}
                  </button>
                </div>
                {phraseStatus === 'success' && (
                  <p className="text-emerald-400 text-sm flex items-center gap-2"><CheckCircle2 size={14}/> Phrase saved and active.</p>
                )}
                {phraseStatus === 'error' && (
                  <p className="text-red-400 text-sm flex items-center gap-2"><AlertTriangle size={14}/> Failed to save. Try again.</p>
                )}
              </div>

              {/* WebAuthn / TOTP */}
              <div className="bg-black border border-zinc-800 p-5 rounded-2xl flex justify-between items-center">
                <div>
                  <h4 className="text-white font-bold flex items-center gap-2"><Lock className="text-emerald-500" size={18}/> Authenticator App (2FA)</h4>
                  <p className="text-sm text-zinc-500 mt-1">Use Google Authenticator or Authy to generate one-time passcodes.</p>
                </div>
                <button 
                  onClick={() => setTotpModalOpen(true)}
                  className="bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  Configure
                </button>
              </div>
              {/* Biometric WebAuthn */}
              <div className="bg-black border border-zinc-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-4">
                <div>
                  <h4 className="text-white font-bold flex items-center gap-2"><Fingerprint className="text-emerald-500" size={18}/> Biometric WebAuthn</h4>
                  <p className="text-sm text-zinc-500 mt-1">Register TouchID or Windows Hello as a secure Passkey.</p>
                </div>
                <div className="flex flex-col items-end">
                  <button 
                    onClick={handleRegisterPasskey}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                  >
                    Register Passkey
                  </button>
                  {passkeyStatus && (
                    <span className="text-xs text-emerald-400 mt-2">{passkeyStatus}</span>
                  )}
                </div>
              </div>

              {/* Hardware Key */}
              <div className="bg-black border border-zinc-800 p-5 rounded-2xl flex justify-between items-center opacity-50 mt-4">
                <div>
                  <h4 className="text-white font-bold flex items-center gap-2">Hardware Security Key (YubiKey)</h4>
                  <p className="text-sm text-zinc-500 mt-1">FIDO2 compliant physical token required for login.</p>
                </div>
                <button className="bg-zinc-800 text-zinc-400 px-4 py-2 rounded-lg text-sm font-bold cursor-not-allowed">Configure</button>
              </div>
            </div>
          )}

          {/* ... Add content for API and Notifications similarly if desired ... */}
          {(activeTab === 'api' || activeTab === 'notifications') && (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
              <Shield size={48} className="mb-4 opacity-20" />
              <p className="font-bold">Module Locked</p>
              <p className="text-sm">Requires Level 5 Administrator Clearance.</p>
            </div>
          )}

        </div>
      </div>

      <TotpSetupModal 
        isOpen={totpModalOpen} 
        onClose={() => setTotpModalOpen(false)} 
        onComplete={() => {
          // You could show a toast here
          console.log("TOTP Enabled successfully");
        }} 
      />
    </motion.div>
  );
};

export default Settings;