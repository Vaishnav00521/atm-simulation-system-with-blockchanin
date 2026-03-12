import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet as WalletIcon, ArrowRight, ArrowLeftRight, Activity, Unplug, 
  CheckCircle2, ShieldCheck, Lock, History, Coins, QrCode, 
  Send, Copy, ExternalLink, AlertTriangle, Settings, RefreshCcw, Info, X
} from 'lucide-react';
import { ethers } from 'ethers';
import api from '../api/axiosConfig';

// --- CONSTANTS ---
const ETH_PRICE = 2890.50;
const GAS_GWEI = 15.4;

const MOCK_HISTORY = [
  { id: '0x8f7a...3b21', type: 'Swap', amount: '2.5 ETH', target: 'USDC', date: '2 Mins Ago', status: 'Success' },
  { id: '0x2a1c...9d44', type: 'Receive', amount: '1,500 USDC', target: 'Wallet', date: '1 Hour Ago', status: 'Success' },
  { id: '0x9b3e...1a77', type: 'Stake', amount: '5.0 ETH', target: 'Lido Vault', date: 'Yesterday', status: 'Success' },
  { id: '0x4f2d...8c99', type: 'Send', amount: '0.5 ETH', target: '0x71C...9711', date: '3 Days Ago', status: 'Failed' },
];

const ReceiveModal = ({ address, onClose }) => (
  <AnimatePresence>
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2"><QrCode className="text-emerald-500"/> Receive Assets</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white bg-black p-2 rounded-lg border border-zinc-800"><X size={18}/></button>
        </div>
        <div className="bg-white p-4 rounded-2xl mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <div className="w-48 h-48 border-4 border-black border-dashed flex items-center justify-center text-black font-bold text-center">QR CODE<br/>{address ? address.substring(0,10)+'...' : 'Not Connected'}</div>
        </div>
        <p className="text-zinc-500 text-xs text-center mb-2 font-bold uppercase tracking-widest">Your Public Address</p>
        <div className="bg-black border border-zinc-800 px-4 py-3 rounded-xl flex items-center gap-3 w-full justify-between group hover:border-emerald-500/50 transition-colors cursor-pointer" onClick={() => {navigator.clipboard.writeText(address); alert('Address Copied!');}}>
          <span className="font-mono text-sm text-zinc-300 truncate">{address || '0x0000000000000000000000000000000000000000'}</span>
          <Copy size={16} className="text-emerald-500 group-hover:scale-110 transition-transform shrink-0" />
        </div>
        <div className="mt-6 w-full bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-start gap-2">
          <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-400 font-medium">Only send Ethereum (ERC-20) network assets to this address.</p>
        </div>
      </motion.div>
    </div>
  </AnimatePresence>
);

const Wallet = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [web3EthBalance, setWeb3EthBalance] = useState("0.00");
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio'); 
  const [showReceive, setShowReceive] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);

  // 🔴 FETCH LIVE DATABASE METRICS
  const [dbMetrics, setDbMetrics] = useState({ fiatBalance: 0, cryptoBalance: 0 });

  const fetchMetrics = async () => {
    try {
      const response = await api.get('/api/dashboard/metrics');
      setDbMetrics({
        fiatBalance: response.data.fiatBalance || 0,
        cryptoBalance: response.data.cryptoBalance || 0
      });
    } catch (error) {
      console.error("Failed to fetch internal ledger", error);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // 🔴 DYNAMIC ASSET LIST BASED ON DB
  const DYNAMIC_ASSETS = [
    { symbol: 'ETH', name: 'Ethereum Vault', balance: dbMetrics.cryptoBalance.toFixed(4), price: ETH_PRICE, change: '+2.4%', color: 'text-emerald-400' },
    { symbol: 'USDC', name: 'Fiat Reserves', balance: dbMetrics.fiatBalance.toFixed(2), price: 1.00, change: '0.0%', color: 'text-blue-400' },
    { symbol: 'wBTC', name: 'Wrapped Bitcoin', balance: '0.1500', price: 64200.00, change: '-1.2%', color: 'text-amber-400' },
  ];

  const totalPortfolioValue = ((dbMetrics.cryptoBalance * ETH_PRICE) + dbMetrics.fiatBalance + (0.15 * 64200)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsConnecting(true);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        setWalletAddress(address);

        const provider = new ethers.BrowserProvider(window.ethereum);
        const balanceBigInt = await provider.getBalance(address);
        setWeb3EthBalance(parseFloat(ethers.formatEther(balanceBigInt)).toFixed(4));
      } catch (error) {
        console.error("Connection error", error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("MetaMask is not installed!");
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) setWalletAddress(accounts[0]);
        else { setWalletAddress(null); setWeb3EthBalance("0.00"); }
      });
    }
  }, []);

  const handleSimulatedSwap = () => {
    setIsSwapping(true);
    setTimeout(() => {
      setIsSwapping(false);
      alert("Contract Execution Simulated. To execute real swaps, use Emlie Agent.");
      setPayAmount('');
    }, 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 relative z-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-emerald-500 w-8 h-8" /> Institutional Web3 Vault
          </h1>
          <p className="text-sm text-zinc-500 mt-2 font-medium">Decentralized asset management and smart contract interaction.</p>
        </div>
        
        {!walletAddress ? (
           <button onClick={connectWallet} disabled={isConnecting} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-70">
             <Unplug className="w-5 h-5" /> {isConnecting ? "Negotiating Handshake..." : "Connect MetaMask"}
           </button>
        ) : (
           <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
             <CheckCircle2 className="w-5 h-5 text-emerald-400" />
             <div>
               <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Web3 Secured</p>
               <p className="font-mono text-sm text-white">{walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}</p>
             </div>
           </div>
        )}
      </div>

      {/* TABS */}
      <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 max-w-2xl">
        {[
          { id: 'portfolio', label: 'Portfolio', icon: <WalletIcon size={16}/> },
          { id: 'swap', label: 'Quantum Swap', icon: <ArrowLeftRight size={16}/> },
          { id: 'stake', label: 'Yield Staking', icon: <Lock size={16}/> },
          { id: 'history', label: 'Ledger History', icon: <History size={16}/> }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-zinc-800 text-emerald-400 shadow-md' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}>
            {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          
          {activeTab === 'portfolio' && (
            <motion.div key="portfolio" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              <div className="xl:col-span-1 space-y-6">
                <div className="bg-zinc-950 rounded-3xl p-8 border border-zinc-800 relative overflow-hidden shadow-xl h-full flex flex-col justify-center">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
                  <div className="relative z-10 text-center">
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Total Vault Value</p>
                    <h2 className="text-5xl font-black text-white mb-2 tracking-tighter">${totalPortfolioValue}</h2>
                    <p className="text-emerald-400 font-mono text-sm mb-8">+1.2% (24h)</p>
                    
                    <div className="flex gap-4 justify-center">
                      <button disabled={!walletAddress} onClick={() => setShowReceive(true)} className="flex-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 border border-zinc-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"><QrCode size={18}/> Receive</button>
                      <button disabled={!walletAddress} className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"><Send size={18}/> Send</button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-zinc-800/50 flex justify-between items-center text-left">
                      <div>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Network</p>
                        <p className="text-sm font-bold text-white flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Ethereum Mainnet</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Gas Tracker</p>
                        <p className="text-sm font-bold text-zinc-300 font-mono">{GAS_GWEI} Gwei</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="xl:col-span-2 bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-white text-lg flex items-center gap-2"><Coins className="text-emerald-500"/> Asset Allocations</h3>
                  <button onClick={fetchMetrics} className="text-zinc-500 hover:text-emerald-400 text-sm font-bold flex items-center gap-1 transition-colors"><RefreshCcw size={14}/> Refresh</button>
                </div>
                
                <div className="space-y-3">
                  {DYNAMIC_ASSETS.map((asset, i) => (
                    <div key={i} className="bg-black border border-zinc-800 p-5 rounded-2xl flex items-center justify-between hover:border-zinc-700 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black ${asset.color}`}>
                          {asset.symbol.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-white font-bold">{asset.name}</h4>
                          <p className="text-zinc-500 text-sm font-mono">{asset.symbol}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <h4 className="text-white font-bold font-mono">{asset.balance}</h4>
                        <p className="text-zinc-500 text-sm font-mono">${(asset.balance * asset.price).toLocaleString('en-US', {minimumFractionDigits: 2})} <span className={asset.change.includes('+') ? 'text-emerald-500' : 'text-amber-500'}>({asset.change})</span></p>
                      </div>
                    </div>
                  ))}
                  
                  {/* MetaMask Live Check */}
                  {walletAddress && (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-black border border-emerald-500/30 flex items-center justify-center font-black text-emerald-500"><Activity size={20}/></div>
                        <div>
                          <h4 className="text-emerald-400 font-bold">MetaMask Provider (Live)</h4>
                          <p className="text-emerald-500/70 text-sm font-mono">External ETH</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <h4 className="text-emerald-400 font-bold font-mono">{web3EthBalance} ETH</h4>
                        <p className="text-emerald-500/70 text-sm font-mono">≈ ${(web3EthBalance * ETH_PRICE).toLocaleString('en-US')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'swap' && (
            <motion.div key="swap" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="max-w-xl mx-auto">
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 flex flex-col shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none" />
                
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><ArrowLeftRight className="text-emerald-500"/> Quantum Swap</h3>
                  <button className="text-zinc-500 hover:text-white transition-colors"><Settings size={18}/></button>
                </div>
                
                <div className="space-y-2 flex-1 relative z-10">
                  <div className="bg-black rounded-2xl p-5 border border-zinc-800 focus-within:border-emerald-500/50 transition-colors">
                    <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3"><span>Pay With (ETH)</span><span>Vault: {dbMetrics.cryptoBalance.toFixed(4)}</span></div>
                    <div className="flex justify-between items-center gap-4">
                      <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} disabled={!walletAddress} className="bg-transparent text-4xl font-black text-white w-full outline-none placeholder:text-zinc-800 disabled:opacity-50" placeholder="0.0" />
                      <button className="font-bold text-white bg-zinc-900 hover:bg-zinc-800 px-4 py-2 rounded-xl border border-zinc-800 transition-colors flex items-center gap-2">ETH</button>
                    </div>
                  </div>

                  <div className="flex justify-center -my-5 relative z-20">
                    <button className="p-3 rounded-xl bg-zinc-900 text-zinc-400 hover:text-emerald-400 border-4 border-zinc-950 hover:border-emerald-900/30 transition-all"><ArrowRight className="w-5 h-5 rotate-90" /></button>
                  </div>

                  <div className="bg-black rounded-2xl p-5 border border-zinc-800 transition-colors">
                    <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3"><span>Receive (USDC)</span></div>
                    <div className="flex justify-between items-center gap-4">
                      <input type="text" readOnly value={payAmount ? (parseFloat(payAmount) * ETH_PRICE).toFixed(2) : '0.00'} className="bg-transparent text-4xl font-black text-emerald-400 w-full outline-none disabled:opacity-50" />
                      <button className="font-bold text-white bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800 flex items-center gap-2 cursor-default">USDC</button>
                    </div>
                  </div>
                </div>

                <button onClick={handleSimulatedSwap} disabled={!walletAddress || !payAmount || isSwapping} className={`w-full py-4 mt-8 font-extrabold text-lg rounded-2xl transition-all duration-300 relative z-10 flex justify-center items-center gap-2 ${walletAddress && payAmount ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'}`}>
                  {isSwapping ? <RefreshCcw className="animate-spin w-5 h-5"/> : null}
                  {!walletAddress ? "Connect Wallet to Swap" : isSwapping ? "Executing Contract..." : "Confirm Swap"}
                </button>
              </div>
            </motion.div>
          )}
          
          {/* Stake & History tabs remain structurally the same as the previous iteration, shortened for brevity */}
          {activeTab === 'stake' && (
            <motion.div key="stake" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="max-w-3xl mx-auto">
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[60px] pointer-events-none" />
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Lock className="text-emerald-500"/> Institutional Yield</h3>
                    <p className="text-zinc-500 text-sm mt-1">Lock ETH to secure the network and earn daily rewards.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Current APR</p>
                    <p className="text-3xl font-black text-emerald-400">4.25%</p>
                  </div>
                </div>
                <div className="bg-black border border-zinc-800 rounded-2xl p-6 mb-6 text-center relative z-10">
                  <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-2">Your Staked Balance</p>
                  <h2 className="text-4xl font-black text-white">0.00 <span className="text-xl text-zinc-500">stETH</span></h2>
                </div>
                <button disabled={!walletAddress} className={`w-full py-4 font-extrabold text-lg rounded-2xl transition-all duration-300 relative z-10 ${walletAddress ? 'bg-zinc-100 text-black hover:bg-white shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'}`}>
                  {walletAddress ? "Stake ETH" : "Connect Wallet to Stake"}
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
             <motion.div key="history" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
               <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                 <div className="p-6 border-b border-zinc-800 bg-black/50">
                   <h3 className="font-bold text-white text-xl flex items-center gap-2"><History className="text-emerald-500"/> Wallet Activity</h3>
                 </div>
                 <div className="p-6">
                   <p className="text-zinc-500 text-center py-10">Ledger synchronization in progress. Connect MetaMask to view external history.</p>
                 </div>
               </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showReceive && <ReceiveModal address={walletAddress} onClose={() => setShowReceive(false)} />}
      
    </motion.div>
  );
};

export default Wallet;