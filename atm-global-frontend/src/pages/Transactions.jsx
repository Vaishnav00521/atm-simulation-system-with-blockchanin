import { motion } from 'framer-motion';
import { Search, Filter, Download, ArrowUpRight, ArrowDownLeft, RefreshCcw } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';

// --- ANIMATION VARIANTS ---
const zigZagLeft = {
  hidden: { opacity: 0, x: -50, borderRadius: "100%" },
  visible: { opacity: 1, x: 0, borderRadius: "24px", transition: { duration: 0.6, type: "spring", bounce: 0.4 } }
};
const zigZagRight = {
  hidden: { opacity: 0, x: 50, borderRadius: "100%" },
  visible: { opacity: 1, x: 0, borderRadius: "24px", transition: { duration: 0.6, type: "spring", bounce: 0.4 } }
};
const roundButton = {
  hover: { scale: 1.05, borderRadius: "50px" },
  tap: { scale: 0.95, borderRadius: "100%" }
};

const Transactions = () => {
  const transactions = [
    { id: 'TX-99281', to: "Microsoft Azure", date: "Today, 10:42 AM", type: "Cloud Services", status: "Completed", amount: -150.99, icon: ArrowUpRight },
    { id: 'TX-99280', to: "Sarah Jenkins", date: "Yesterday, 4:15 PM", type: "P2P Transfer", status: "Completed", amount: -500.00, icon: ArrowUpRight },
    { id: 'TX-99279', to: "Global Tech Corp", date: "Mar 05, 2026", type: "Salary", status: "Completed", amount: +8500.00, icon: ArrowDownLeft },
    { id: 'TX-99278', to: "Ethereum Network", date: "Mar 04, 2026", type: "Crypto Swap", status: "Pending", amount: -1200.50, icon: RefreshCcw },
    { id: 'TX-99277', to: "Starbucks", date: "Mar 02, 2026", type: "Food & Beverage", status: "Completed", amount: -8.50, icon: ArrowUpRight },
  ];

  return (
    <AnimatedPage>
      <div className="space-y-8 relative z-10 pb-10">

        {/* Header - Slides from Left */}
        <motion.div variants={zigZagLeft} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">
              Global Ledger
            </h1>
            <p className="text-slate-400 font-medium tracking-wide mt-1">Immutable transaction history</p>
          </div>
          <motion.button variants={roundButton} whileHover="hover" whileTap="tap" className="flex items-center gap-2 px-5 py-2.5 glass-panel text-white font-medium hover:bg-white/10 transition">
            <Download className="w-4 h-4" /> Export CSV
          </motion.button>
        </motion.div>

        {/* Filters - Slides from Right */}
        <motion.div variants={zigZagRight} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex gap-4 glass-panel p-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              placeholder="Search by ID, Name, or Wallet Address..."
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition shadow-inner"
            />
          </div>
          <motion.button variants={roundButton} whileHover="hover" whileTap="tap" className="px-6 py-3 bg-black/50 border border-white/10 text-white font-medium flex items-center gap-2 hover:bg-white/5 transition">
            <Filter className="w-4 h-4 text-blue-400" /> Filters
          </motion.button>
        </motion.div>

        {/* Transaction Table - Slides from Left */}
        <motion.div variants={zigZagLeft} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-panel overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-slate-400 text-[10px] uppercase tracking-widest border-b border-white/10">
              <tr>
                <th className="p-6 font-bold">Transaction Details</th>
                <th className="p-6 font-bold">Date & Time</th>
                <th className="p-6 font-bold">Category</th>
                <th className="p-6 font-bold">Status</th>
                <th className="p-6 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition duration-300 group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${tx.amount > 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-white/10 text-slate-300'} group-hover:scale-110 transition-transform`}>
                        <tx.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{tx.to}</p>
                        <p className="text-xs font-mono text-slate-500">{tx.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-sm text-slate-400">{tx.date}</td>
                  <td className="p-6">
                    <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">{tx.type}</span>
                  </td>
                  <td className="p-6">
                    <span className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${tx.status === 'Completed' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tx.status === 'Completed' ? 'bg-emerald-400' : 'bg-yellow-400 animate-pulse'}`} />
                      {tx.status}
                    </span>
                  </td>
                  <td className={`p-6 text-right font-mono font-bold text-lg tracking-tight ${tx.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default Transactions;