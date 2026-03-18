import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Server, Globe, Zap, Cpu, ArrowUpRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const latencyData = Array.from({ length: 20 }).map((_, i) => ({ time: `${i}s`, ms: Math.floor(Math.random() * 40) + 15 }));

const MOCK_NODES = [
  { id: 'N-US-EAST-01', region: 'Virginia, USA', status: 'Optimal', uptime: '99.99%', latency: '24ms', load: '45%' },
  { id: 'N-EU-WEST-04', region: 'Frankfurt, DE', status: 'Optimal', uptime: '99.98%', latency: '32ms', load: '62%' },
  { id: 'N-AP-SOUTH-02', region: 'Mumbai, IN', status: 'Warning', uptime: '99.91%', latency: '145ms', load: '88%' },
  { id: 'N-SA-EAST-01', region: 'São Paulo, BR', status: 'Optimal', uptime: '99.95%', latency: '45ms', load: '30%' },
];

const Network = () => {
  const [activeNodes, setActiveNodes] = useState(14);
  const [tps, setTps] = useState(1204);

  // Simulate live network fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setTps(prev => prev + Math.floor(Math.random() * 50) - 25);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Globe className="text-emerald-500 w-8 h-8" /> Distributed Network Topography
          </h1>
          <p className="text-sm text-zinc-500 mt-2 font-medium">Real-time status of global ATM blockchain validators and RPC endpoints.</p>
        </div>
        <div className="flex items-center gap-3 bg-black border border-zinc-800 px-5 py-3 rounded-xl">
          <div className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <span className="text-sm font-bold text-white uppercase tracking-widest">Mainnet Live</span>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none" />
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Server size={14}/> Active Validators</p>
          <h2 className="text-5xl font-black text-white">{activeNodes} <span className="text-lg text-emerald-500 font-medium">/ 14 Online</span></h2>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none" />
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Zap size={14}/> Transactions Per Second (TPS)</p>
          <h2 className="text-5xl font-black text-white">{tps} <span className="text-lg text-blue-400 font-medium flex items-center gap-1 inline-flex"><ArrowUpRight size={16}/> Peak</span></h2>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-xl relative overflow-hidden">
           <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none" />
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Cpu size={14}/> Global Block Finality</p>
          <h2 className="text-5xl font-black text-white">12.4<span className="text-lg text-zinc-400 font-medium">s</span></h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Node List */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl shadow-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-zinc-800 bg-black/50">
            <h3 className="font-bold text-white text-xl flex items-center gap-2"><Activity size={20} className="text-emerald-500"/> Infrastructure Endpoints</h3>
          </div>
          <div className="p-6 space-y-4 flex-1">
            {MOCK_NODES.map((node, i) => (
              <div key={i} className="bg-black border border-zinc-800 p-4 rounded-2xl flex justify-between items-center hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${node.status === 'Optimal' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'}`}>
                    {node.status === 'Optimal' ? <CheckCircle2 size={20}/> : <AlertTriangle size={20}/>}
                  </div>
                  <div>
                    <h4 className="text-white font-bold font-mono text-sm">{node.id}</h4>
                    <p className="text-zinc-500 text-xs">{node.region}</p>
                  </div>
                </div>
                <div className="text-right flex gap-6">
                  <div className="hidden sm:block">
                     <p className="text-xs text-zinc-500 font-bold uppercase">Uptime</p>
                     <p className="text-white font-mono text-sm">{node.uptime}</p>
                  </div>
                  <div>
                     <p className="text-xs text-zinc-500 font-bold uppercase">Latency</p>
                     <p className={`font-mono text-sm ${node.latency.length > 4 ? 'text-amber-400' : 'text-emerald-400'}`}>{node.latency}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latency Chart */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col min-h-[400px]">
          <h3 className="font-bold text-white text-xl mb-6 flex items-center gap-2"><Activity size={20} className="text-blue-500"/> Average Ping / Latency</h3>
          <div className="flex-1 w-full h-full min-w-0" style={{ position: 'relative', height: 300 }}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={latencyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="ms" stroke="#3b82f6" strokeWidth={3} fill="url(#colorMs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Network;