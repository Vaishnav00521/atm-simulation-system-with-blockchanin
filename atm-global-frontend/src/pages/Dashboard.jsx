import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Wallet as WalletIcon, Globe, Zap, ArrowUpRight, ArrowDownRight, 
  BarChart3, RefreshCw, Search, Filter, Download, ShieldCheck, 
  Server, Cpu, CheckCircle2, AlertCircle, Clock, X 
} from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import { 
  ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import api from '../api/axiosConfig';

// ==========================================
// 1. MOCK DATA & CONSTANTS
// ==========================================
const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

const tradingData = [
  { time: '09:00', price: 2840, volume: 1200 }, { time: '10:00', price: 2890, volume: 2100 },
  { time: '11:00', price: 2820, volume: 3400 }, { time: '12:00', price: 2950, volume: 4100 },
  { time: '13:00', price: 3010, volume: 2800 }, { time: '14:00', price: 2980, volume: 1500 },
  { time: '15:00', price: 3100, volume: 5200 }, { time: '16:00', price: 3150, volume: 4800 },
  { time: '17:00', price: 3080, volume: 3900 },
];

const allocationData = [
  { name: 'Ethereum (ETH)', value: 45 }, { name: 'USDC Reserves', value: 30 },
  { name: 'Bitcoin (wBTC)', value: 15 }, { name: 'Polygon (MATIC)', value: 10 },
];

const mockTransactions = Array.from({ length: 45 }).map((_, i) => ({
  id: `TXN-${Math.floor(Math.random() * 1000000)}`,
  type: Math.random() > 0.5 ? 'Deposit' : 'Withdrawal',
  asset: Math.random() > 0.3 ? 'ETH' : 'USDC',
  amount: (Math.random() * 10).toFixed(4),
  status: Math.random() > 0.1 ? 'Completed' : 'Pending',
  date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
  hash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`
}));

// ==========================================
// 2. SUB-COMPONENTS
// ==========================================
const StatCard = ({ title, value, trend, up, icon, sparklineData }) => (
  <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl hover:border-zinc-700 transition-all duration-300 group shadow-lg relative overflow-hidden">
    <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className="p-2.5 bg-black border border-zinc-800 rounded-xl group-hover:border-zinc-600 transition-colors shadow-inner">{icon}</div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${up ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
        {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {trend}
      </div>
    </div>
    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest relative z-10">{title}</p>
    <div className="flex items-end justify-between mt-1 relative z-10">
      <h3 className="text-3xl font-black text-white">{value}</h3>
      {/* 🔴 NUCLEAR FIX 1: Removed ResponsiveContainer entirely for tiny charts to kill the -1 error */}
      <div style={{ width: 64, height: 32 }}>
        <LineChart width={64} height={32} data={sparklineData}>
          <Line type="monotone" dataKey="val" stroke={up ? "#10b981" : "#ef4444"} strokeWidth={2} dot={false} />
        </LineChart>
      </div>
    </div>
  </div>
);

const TransactionModal = ({ tx, onClose }) => {
  if (!tx) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Activity className="text-emerald-500"/> Transaction Details</h3>
            <button onClick={onClose} className="text-zinc-500 hover:text-white bg-black p-2 rounded-lg border border-zinc-800"><X size={18}/></button>
          </div>
          <div className="space-y-4">
            <div className="bg-black border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
              <span className="text-zinc-500 text-sm font-bold">Status</span>
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${tx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                {tx.status === 'Completed' ? <CheckCircle2 size={14}/> : <Clock size={14}/>} {tx.status}
              </span>
            </div>
            <div className="bg-black border border-zinc-800 p-4 rounded-xl space-y-3">
              <div className="flex justify-between"><span className="text-zinc-500 text-sm font-bold">Transaction ID</span><span className="text-white font-mono text-sm">{tx.id}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500 text-sm font-bold">Asset Type</span><span className="text-white font-bold text-sm">{tx.asset}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500 text-sm font-bold">Amount</span><span className="text-emerald-400 font-bold text-lg">{tx.amount} {tx.asset}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500 text-sm font-bold">Date Executed</span><span className="text-white text-sm">{tx.date}</span></div>
              <div className="flex justify-between flex-col gap-1 mt-2 pt-2 border-t border-zinc-800">
                <span className="text-zinc-500 text-sm font-bold">Block Hash</span>
                <span className="text-teal-400 font-mono text-xs bg-teal-500/10 p-2 rounded-lg break-all border border-teal-500/20">{tx.hash}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors">Acknowledge</button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ==========================================
// 3. MAIN DASHBOARD COMPONENT
// ==========================================
const Dashboard = () => {
  const [liveFeed, setLiveFeed] = useState([{ time: new Date().toLocaleTimeString(), node: 'Sys-Core', action: 'Awaiting WebSockets...' }]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('liquidity');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState(null);
  const itemsPerPage = 6;

  const [metrics, setMetrics] = useState({
    fiatBalance: 0.00,
    cryptoBalance: 0.00,
    activeContracts: 1204
  });

  // 🔴 NUCLEAR FIX 2: Manually grab JWT and inject it to bypass the 403 Forbidden error
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem('fintech_jwt');
        const response = await api.get('/api/dashboard/metrics', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if(response.data) setMetrics(response.data);
      } catch (error) {
        console.warn("API 403 / Axios Error. Fallback to default metrics.", error.message);
      }
    };
    fetchMetrics();
  }, []);

  // 🔴 NUCLEAR FIX 3: Force Production HTTPS if on Vercel to stop the SecurityError Crash
  useEffect(() => {
    let client;

    try {
      let rawUrl = import.meta.env.VITE_API_URL || 'https://global-atm-backend.onrender.com';

      // If we are on Vercel (https), absolutely forbid localhost or http
      if (window.location.protocol === 'https:') {
        if (rawUrl.includes('localhost') || rawUrl.startsWith('http://localhost')) {
          rawUrl = 'https://global-atm-backend.onrender.com';
        } else if (rawUrl.startsWith('http://')) {
          rawUrl = rawUrl.replace('http://', 'https://');
        }
      }

      client = new Client({
        webSocketFactory: () => new SockJS(`${rawUrl}/ws-fintech`),
        onConnect: () => {
          client.subscribe('/topic/live-feed', (message) => {
            try {
              const newFeedData = JSON.parse(message.body);
              setLiveFeed(prev => [newFeedData, ...prev].slice(0, 12));
            } catch (e) {}
          });
        },
        onStompError: (frame) => console.warn('Broker warning caught safely.'),
        onWebSocketError: (event) => console.warn('WebSocket connection gracefully failed. UI will not crash.')
      });

      client.activate();
    } catch (err) {
      console.error("Caught socket error to prevent crash:", err);
    }

    return () => {
      if (client && client.active) {
        client.deactivate();
      }
    };
  }, []);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1500);
  };

  const handleExportCSV = () => alert("Exporting Institutional Report (CSV) to local drive...");

  const filteredData = useMemo(() => {
    return mockTransactions.filter(tx => {
      const matchesSearch = tx.id.toLowerCase().includes(searchTerm.toLowerCase()) || tx.hash.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || tx.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const LiquidityTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl shadow-2xl">
          <p className="text-zinc-500 text-xs font-bold mb-3 border-b border-zinc-800 pb-2">{label} UTC</p>
          <div className="space-y-2">
            <p className="text-emerald-400 font-mono text-sm flex justify-between gap-4"><span>Price:</span> <span>${payload[0].value.toLocaleString()}</span></p>
            <p className="text-zinc-400 font-mono text-sm flex justify-between gap-4"><span>Volume:</span> <span>{payload[1].value.toLocaleString()}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Server className="text-emerald-500 w-8 h-8" /> Global Trading Terminal
          </h2>
          <p className="text-sm text-zinc-500 mt-2 font-medium">Real-time cross-border liquidity and smart contract execution metrics.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-black border border-zinc-800 px-4 py-2 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">WSS Linked</span>
          </div>
          <button onClick={handleSync} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-900/20">
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> {isSyncing ? 'Syncing...' : 'Force Sync'}
          </button>
        </div>
      </div>

      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Global Fiat Reserve"
          value={`$${metrics.fiatBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}`}
          trend="+2.4%" up={true} icon={<WalletIcon className="text-emerald-500 w-6 h-6" />} sparklineData={[{val: 10}, {val: 15}, {val: 12}, {val: 20}, {val: 25}]}
        />
        <StatCard
          title="Crypto Vault (ETH)"
          value={metrics.cryptoBalance.toFixed(4)}
          trend="-0.8%" up={false} icon={<Globe className="text-teal-500 w-6 h-6" />} sparklineData={[{val: 25}, {val: 20}, {val: 22}, {val: 15}, {val: 10}]}
        />
        <StatCard title="24h Trading Volume" value="$84.2M" trend="+12.5%" up={true} icon={<BarChart3 className="text-blue-500 w-6 h-6" />} sparklineData={[{val: 5}, {val: 10}, {val: 8}, {val: 18}, {val: 24}]} />
        <StatCard title="Active Contracts" value={metrics.activeContracts} trend="+1.2%" up={true} icon={<Cpu className="text-purple-500 w-6 h-6" />} sparklineData={[{val: 10}, {val: 11}, {val: 11}, {val: 12}, {val: 13}]} />
      </div>

      {/* CHARTS & LIVE FEED */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 min-h-[500px] flex flex-col shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h3 className="font-bold text-white text-lg flex items-center gap-2"><Activity size={20} className="text-emerald-500"/> Core Analytics Hub</h3>
            <div className="flex bg-black p-1 rounded-xl border border-zinc-800">
              {['liquidity', 'allocation'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-lg text-xs font-bold transition-all capitalize ${activeTab === tab ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}>{tab} View</button>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full h-full relative">
            <AnimatePresence mode="wait">
              {activeTab === 'liquidity' ? (
                {/* 🔴 NUCLEAR FIX 1 pt. 2: Forced absolute pixel heights on main charts */}
                <motion.div key="liq" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full" style={{ height: 350, minHeight: 350, position: 'relative' }}>
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={tradingData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="time" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis yAxisId="left" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 100', 'dataMax + 100']} tickFormatter={(v) => `$${v}`} dx={-10} />
                      <YAxis yAxisId="right" orientation="right" hide domain={[0, 'dataMax * 3']} />
                      <Tooltip content={<LiquidityTooltip />} cursor={{ fill: '#27272a', opacity: 0.4 }} />
                      <Bar yAxisId="right" dataKey="volume" fill="#27272a" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Area yAxisId="left" type="monotone" dataKey="price" stroke="#10b981" strokeWidth={3} fill="url(#colorPrice)" activeDot={{ r: 6, fill: '#10b981', stroke: '#000', strokeWidth: 2 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </motion.div>
              ) : (
                <motion.div key="alloc" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full flex items-center justify-center" style={{ height: 350, minHeight: 350 }}>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie data={allocationData} cx="50%" cy="50%" innerRadius={100} outerRadius={140} paddingAngle={5} dataKey="value" stroke="none" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {allocationData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 flex flex-col h-[500px] relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="font-bold text-white flex items-center gap-2 text-lg"><Zap size={20} className="text-amber-500"/> Global Ledger Stream</h3>
            <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10 space-y-3 pb-10">
            {liveFeed.map((item, index) => (
              <motion.div key={`${item.time}-${index}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="bg-black border border-zinc-800 hover:border-zinc-700 transition-colors rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded-md">{item.time}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1"><Globe size={10}/> {item.node}</span>
                </div>
                <p className="text-sm font-medium text-zinc-300 leading-snug">{item.action}</p>
              </motion.div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-zinc-950 to-transparent z-20 pointer-events-none" />
        </div>
      </div>

      {/* DATA GRID (Transactions) */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl shadow-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/50">
          <div>
            <h3 className="font-bold text-white text-xl flex items-center gap-2"><WalletIcon size={20} className="text-emerald-500"/> Transaction History</h3>
            <p className="text-sm text-zinc-500 mt-1">Immutable ledger records from the smart contract.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <input type="text" placeholder="Search Hash or ID..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="bg-black border border-zinc-800 text-sm text-white rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all w-full sm:w-64" />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <select value={filterStatus} onChange={(e) => {setFilterStatus(e.target.value); setCurrentPage(1);}} className="bg-black border border-zinc-800 text-sm text-white rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer">
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <button onClick={handleExportCSV} className="bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 p-2 rounded-xl transition-colors" title="Export CSV"><Download size={18} /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/80 text-xs uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                <th className="p-5 font-bold">Transaction ID</th>
                <th className="p-5 font-bold">Type & Asset</th>
                <th className="p-5 font-bold">Amount</th>
                <th className="p-5 font-bold">Status</th>
                <th className="p-5 font-bold hidden md:table-cell">Date</th>
                <th className="p-5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {paginatedData.length > 0 ? paginatedData.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-5 font-mono text-sm text-zinc-300 group-hover:text-white transition-colors">{tx.id}</td>
                  <td className="p-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{tx.type}</span>
                      <span className="text-xs font-mono text-zinc-500">{tx.asset}</span>
                    </div>
                  </td>
                  <td className="p-5 font-mono text-sm font-bold text-white">{tx.amount} <span className="text-zinc-500 text-xs">{tx.asset}</span></td>
                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${tx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                      {tx.status === 'Completed' ? <CheckCircle2 size={12}/> : <Clock size={12}/>} {tx.status}
                    </span>
                  </td>
                  <td className="p-5 text-sm text-zinc-400 hidden md:table-cell">{tx.date}</td>
                  <td className="p-5 text-right">
                    <button onClick={() => setSelectedTx(tx)} className="text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Details</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-zinc-500 flex flex-col items-center gap-3">
                    <AlertCircle size={32} className="text-zinc-700" />
                    <p>No transactions match your search criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-5 border-t border-zinc-800 bg-black/50 flex justify-between items-center">
          <p className="text-xs text-zinc-500 font-bold tracking-wide">Showing <span className="text-white">{Math.min(filteredData.length, itemsPerPage)}</span> of <span className="text-white">{filteredData.length}</span> records</p>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors">Prev</button>
            <div className="flex gap-1 items-center px-2">
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${currentPage === i + 1 ? 'bg-emerald-600 text-white' : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'}`}>{i + 1}</button>
              ))}
            </div>
            <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors">Next</button>
          </div>
        </div>
      </div>

      <TransactionModal tx={selectedTx} onClose={() => setSelectedTx(null)} />

    </motion.div>
  );
};

export default Dashboard;