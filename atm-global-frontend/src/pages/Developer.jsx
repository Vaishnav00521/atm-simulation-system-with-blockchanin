import { motion } from 'framer-motion';
// FIXED: Added 'Shield' to the import list below
import { Terminal, Copy, Key, Lock, Shield } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';

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

const Developer = () => {
  return (
    <AnimatedPage>
      <div className="space-y-8 relative z-10 pb-10">

        <motion.div variants={zigZagLeft} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex justify-between items-end border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white">Developer API</h1>
            <p className="text-slate-400 mt-2 font-light tracking-wide">Open Banking Interface (PSD2 Compliant)</p>
          </div>
          <motion.button variants={roundButton} whileHover="hover" whileTap="tap" className="px-6 py-3 bg-white text-black font-extrabold shadow-[0_0_20px_rgba(255,255,255,0.2)] rounded-xl">
            Roll New Keys
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* API Keys - Slides from Left */}
          <motion.div variants={zigZagLeft} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-panel p-8 space-y-6 flex flex-col justify-center">
            <h3 className="flex items-center gap-2 text-white font-bold text-xl mb-4">
              <Key className="w-6 h-6 text-yellow-400" /> Production Credentials
            </h3>

            <div className="bg-black/60 p-5 rounded-2xl border border-white/10 flex justify-between items-center group relative overflow-hidden">
              <div className="absolute left-0 top-0 w-1 h-full bg-blue-500" />
              <div>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">Public Key (Client-Side)</p>
                <p className="font-mono text-white text-sm tracking-wider">pk_live_51Mz...992X</p>
              </div>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 transition-colors">
                <Copy className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="bg-black/60 p-5 rounded-2xl border border-white/10 flex justify-between items-center group relative overflow-hidden">
              <div className="absolute left-0 top-0 w-1 h-full bg-red-500" />
              <div>
                <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mb-1">Secret Key (Server-Side)</p>
                <p className="font-mono text-white text-sm tracking-wider blur-[4px] hover:blur-none transition-all duration-300 select-none">sk_live_8829...0021</p>
              </div>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 transition-colors">
                <Lock className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Here is where the Shield icon caused the crash previously */}
            <p className="text-xs text-slate-500 mt-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> Never expose your secret key in frontend code.
            </p>
          </motion.div>

          {/* Terminal / Sandbox - Slides from Right */}
          <motion.div variants={zigZagRight} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-panel p-0 rounded-3xl overflow-hidden flex flex-col h-full border-white/10 shadow-2xl">
            <div className="bg-[#0f172a] p-4 border-b border-white/10 flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-xs text-slate-400 font-mono tracking-widest ml-4">POST /v1/transfer</span>
              </div>
              <Terminal className="w-4 h-4 text-slate-500" />
            </div>

            <div className="p-8 font-mono text-sm leading-relaxed text-slate-300 flex-1 bg-black shadow-inner">
              <p><span className="text-purple-400">curl</span> -X POST https://api.globalatm.com/v1/transfer \</p>
              <p className="pl-6">-u <span className="text-emerald-400">sk_live_...</span>: \</p>
              <p className="pl-6">-H <span className="text-yellow-400">"Content-Type: application/json"</span> \</p>
              <p className="pl-6">-d <span className="text-blue-400">{"'{"}</span></p>
              <p className="pl-10 text-blue-300">"amount": <span className="text-yellow-400">500000</span>,</p>
              <p className="pl-10 text-blue-300">"currency": <span className="text-yellow-400">"USD"</span>,</p>
              <p className="pl-10 text-blue-300">"destination": <span className="text-yellow-400">"DID:ETH:0x992..."</span></p>
              <p className="pl-6 text-blue-400">{"}'"}</p>
              <br/>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="border-t border-white/10 pt-4 mt-2">
                <p className="text-slate-500 mb-2"># Response (200 OK):</p>
                <p className="text-emerald-400">{"{"}</p>
                <p className="pl-4 text-emerald-300">"status": "success",</p>
                <p className="pl-4 text-emerald-300">"tx_hash": "0x882f...992a",</p>
                <p className="pl-4 text-emerald-300">"settlement": "instant"</p>
                <p className="text-emerald-400">{"}"}</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Developer;