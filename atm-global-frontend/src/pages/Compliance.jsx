import { motion } from 'framer-motion';
import { ShieldCheck, FileText, CheckCircle, Globe, Activity } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import { useGlobal } from '../App';

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

const Compliance = () => {
  const { securityStatus } = useGlobal();

  return (
    <AnimatedPage>
      <div className="space-y-8 relative z-10 pb-10">

        <motion.div variants={zigZagLeft} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex justify-between items-end border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white flex items-center gap-3">
              <ShieldCheck className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              Compliance Matrix
            </h1>
            <p className="text-slate-400 mt-2 font-light tracking-wide">GDPR • AML • KYC Status: <span className="text-emerald-400 font-bold tracking-widest uppercase">Clear</span></p>
          </div>
          <motion.button variants={roundButton} whileHover="hover" whileTap="tap" className="px-6 py-3 bg-blue-600 text-white font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-400/50">
            Generate Audit Report
          </motion.button>
        </motion.div>

        <motion.div variants={zigZagRight} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="glass-panel p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity duration-500">
              <CheckCircle className="w-40 h-40 text-emerald-400" />
            </div>
            <h3 className="text-emerald-400 text-[10px] uppercase tracking-widest font-bold mb-2">Identity Verification</h3>
            <p className="text-4xl font-black text-white mb-6">Level {securityStatus?.kycLevel || 3}</p>
            <div className="space-y-4 relative z-10">
              {['Passport Verified', 'Biometric 3D Scan', 'Proof of Address'].map(item => (
                <div key={item} className="flex items-center gap-3 text-sm text-slate-300 font-medium bg-black/40 p-3 rounded-xl border border-white/5">
                  <CheckCircle className="w-5 h-5 text-emerald-400" /> {item}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-blue-400 text-[10px] uppercase tracking-widest font-bold mb-2">AI AML Risk Score</h3>
              <div className="flex items-end gap-3 mb-6">
                <p className="text-6xl font-black text-white tracking-tighter">{securityStatus?.riskScore || 12}</p>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg mb-2 font-bold uppercase tracking-wider">Low Risk</span>
              </div>
            </div>
            <div>
              <div className="w-full bg-black h-2 rounded-full overflow-hidden shadow-inner">
                <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 w-[12%] h-full shadow-[0_0_15px_#10b981]" />
              </div>
              <p className="text-[10px] text-slate-500 mt-3 uppercase tracking-widest flex items-center gap-1">
                <Activity className="w-3 h-3" /> Machine Learning Model V4.2
              </p>
            </div>
          </div>

          <div className="glass-panel p-8">
            <h3 className="text-purple-400 text-[10px] uppercase tracking-widest font-bold mb-6">Jurisdictional Status</h3>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="font-black text-white text-2xl">Global Trade</p>
                <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Tier 1 Licensed</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm bg-black/40 p-3 rounded-xl border border-white/5">
                <span className="text-slate-400">Tax Residency</span>
                <span className="text-white font-bold">Confirmed</span>
              </div>
              <div className="flex justify-between text-sm bg-black/40 p-3 rounded-xl border border-white/5">
                <span className="text-slate-400">PEP Check</span>
                <span className="text-white font-bold">Passed</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Immutable Audit Log */}
        <motion.div variants={zigZagLeft} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-panel p-0 overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-black/40 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" /> Immutable Blockchain Ledger
            </h3>
            <span className="text-xs text-emerald-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Sync</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-[10px] uppercase tracking-widest bg-white/5">
                  <th className="p-4 pl-6">Block Timestamp</th>
                  <th className="p-4">Action Event</th>
                  <th className="p-4">Tx Hash</th>
                  <th className="p-4 text-right pr-6">Consensus</th>
                </tr>
              </thead>
              <tbody className="text-sm font-mono text-slate-300 divide-y divide-white/5">
                <tr className="hover:bg-white/5 transition-colors group cursor-pointer">
                  <td className="p-4 pl-6 text-slate-400">2026-03-09 11:15:01</td>
                  <td className="p-4 text-white font-bold">KYC_UPDATE</td>
                  <td className="p-4 text-blue-400 text-xs group-hover:underline">0x882f...992a</td>
                  <td className="p-4 text-right pr-6"><span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">Confirmed</span></td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors group cursor-pointer">
                  <td className="p-4 pl-6 text-slate-400">2026-03-09 09:15:22</td>
                  <td className="p-4 text-white font-bold">SESSION_INIT</td>
                  <td className="p-4 text-blue-400 text-xs group-hover:underline">0x771c...A2Bc</td>
                  <td className="p-4 text-right pr-6"><span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">Confirmed</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default Compliance;