import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Code2, Play, Lock, CheckCircle2, ChevronDown, ChevronUp, Copy, Shield } from 'lucide-react';

const DEPLOYED_CONTRACTS = [
  { id: '0x1A4...B92F', name: 'Global Liquidity Pool', type: 'ERC-20 Routing', status: 'Active', balance: '1,450 ETH', verified: true },
  { id: '0x8B2...4E11', name: 'Cross-Border Escrow', type: 'Time-Lock Vault', status: 'Active', balance: '320 USDC', verified: true },
  { id: '0xC99...F0A2', name: 'Yield Staking Logic', type: 'Reward Distributor', status: 'Paused', balance: '0 ETH', verified: false },
];

const Contracts = () => {
  const [expandedId, setExpandedId] = useState(DEPLOYED_CONTRACTS[0].id);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <FileText className="text-emerald-500 w-8 h-8" /> Smart Contract Registry
          </h1>
          <p className="text-sm text-zinc-500 mt-2 font-medium">Manage, audit, and execute deployed blockchain logic.</p>
        </div>
        <button className="bg-white text-black hover:bg-zinc-200 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg">
          <Code2 size={18} /> Deploy New Contract
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Contract List */}
        <div className="lg:col-span-2 space-y-4">
          {DEPLOYED_CONTRACTS.map((contract) => (
            <div key={contract.id} className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl transition-all duration-300">
              {/* Header Toggle */}
              <div 
                onClick={() => setExpandedId(expandedId === contract.id ? null : contract.id)}
                className="p-6 cursor-pointer hover:bg-zinc-900/50 flex justify-between items-center transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${contract.status === 'Active' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-zinc-800 border-zinc-700'}`}>
                    <Shield className={contract.status === 'Active' ? 'text-emerald-500' : 'text-zinc-500'} size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">{contract.name} {contract.verified && <CheckCircle2 size={14} className="text-blue-400" title="Audited & Verified"/>}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs font-mono text-zinc-500 bg-black px-2 py-0.5 rounded border border-zinc-800">{contract.id}</p>
                      <p className="text-xs text-zinc-400 font-bold uppercase">{contract.type}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-zinc-500 uppercase">TVL</p>
                    <p className="font-mono text-white">{contract.balance}</p>
                  </div>
                  {expandedId === contract.id ? <ChevronUp className="text-zinc-500" /> : <ChevronDown className="text-zinc-500" />}
                </div>
              </div>

              {/* Expanded ABI Interface */}
              <motion.div initial={false} animate={{ height: expandedId === contract.id ? 'auto' : 0, opacity: expandedId === contract.id ? 1 : 0 }} className="overflow-hidden bg-black/50 border-t border-zinc-800">
                <div className="p-6 space-y-4">
                  <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Write Functions (ABI)</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black border border-zinc-800 p-4 rounded-xl">
                      <p className="text-emerald-400 font-mono text-sm mb-3">function transferLiquidity()</p>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Target Address 0x..." className="w-full bg-zinc-950 border border-zinc-800 text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500" />
                        <button className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg transition-colors"><Play size={16}/></button>
                      </div>
                    </div>

                    <div className="bg-black border border-zinc-800 p-4 rounded-xl">
                      <p className="text-emerald-400 font-mono text-sm mb-3">function pauseContract()</p>
                      <button className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-sm py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <Lock size={16}/> Emergency Pause
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Global Contract Stats */}
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-xl text-center">
             <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4"><Shield className="text-blue-500 w-8 h-8"/></div>
             <h3 className="text-3xl font-black text-white">0.00 <span className="text-lg text-zinc-500 font-medium">Critical Vulns</span></h3>
             <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-2">Latest Audit: Passed</p>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-xl">
            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Constructor Bytecode</h4>
            <div className="bg-black border border-zinc-800 rounded-xl p-4 relative group">
              <p className="text-xs font-mono text-zinc-600 break-all leading-relaxed line-clamp-6">
                608060405234801561001057600080fd5b50600436106100415760003560e01c806306fdde0314610046578063095ea7b31461006457806318160ddd1461008257806323b872dd...
              </p>
              <button className="absolute top-2 right-2 p-2 bg-zinc-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"><Copy size={14}/></button>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default Contracts;