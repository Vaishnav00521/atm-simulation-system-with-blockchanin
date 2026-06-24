import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Cpu, Activity, ShieldCheck, ChevronRight, CheckCircle2 } from 'lucide-react';

const CrossChainBridge = () => {
  const [sourceChain, setSourceChain] = useState('Ethereum');
  const [targetChain, setTargetChain] = useState('Polygon');
  const [amount, setAmount] = useState('');

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="bg-zinc-950 border border-emerald-500/20 p-8 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.05)] relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-600/20 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner border border-emerald-500/20">
              <ArrowRightLeft size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white flex items-center gap-3">
                Global Nexus Bridge
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded border border-emerald-500/30 uppercase tracking-widest">Beta</span>
              </h1>
              <p className="text-zinc-400 text-sm mt-1">Zero-knowledge cross-chain liquidity transfers</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-black border border-zinc-800 rounded-2xl p-6 relative">
            <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm z-20 rounded-2xl flex flex-col items-center justify-center">
              <Cpu className="text-emerald-500 w-12 h-12 mb-4 animate-pulse" />
              <h3 className="text-xl font-bold text-white mb-2">Bridge Protocol Offline</h3>
              <p className="text-zinc-400 text-sm max-w-sm text-center">
                The Global Nexus zero-knowledge bridge is currently undergoing Layer-2 validation upgrades. Cross-chain transfers will be available in the next node deployment.
              </p>
            </div>

            <h3 className="text-lg font-bold text-white mb-4 opacity-50">Transfer Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end opacity-50">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">From Network</label>
                <select disabled className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white">
                  <option>Ethereum (Mainnet)</option>
                </select>
              </div>
              <div className="flex justify-center pb-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                  <ArrowRightLeft size={16} className="text-zinc-500" />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">To Network</label>
                <select disabled className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white">
                  <option>Polygon (PoS)</option>
                  <option>Arbitrum One</option>
                  <option>Optimism</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 space-y-2 opacity-50">
              <label className="text-xs font-bold text-zinc-500 uppercase">Amount to Bridge (ETH)</label>
              <input type="text" disabled className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white" placeholder="0.00" />
            </div>

            <button disabled className="w-full mt-6 bg-zinc-800 text-zinc-500 py-4 rounded-xl font-bold uppercase tracking-widest cursor-not-allowed">
              Initialize Bridge Contract
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-black border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Network Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500 flex items-center gap-2"><Activity size={14}/> Ethereum</span>
                  <span className="text-emerald-500 font-bold">Operational</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500 flex items-center gap-2"><Activity size={14}/> Polygon</span>
                  <span className="text-emerald-500 font-bold">Operational</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500 flex items-center gap-2"><ShieldCheck size={14}/> ZK-Relayers</span>
                  <span className="text-amber-500 font-bold animate-pulse">Upgrading...</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-2">Bridge Mechanics</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Global Nexus uses threshold signatures and light-client validation to securely lock assets on the source chain and mint 1:1 wrapped equivalents on the destination chain, entirely bypassing centralized custodians.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CrossChainBridge;
