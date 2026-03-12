import { motion } from 'framer-motion';
import { Shield, Smartphone, Globe, Lock, Power } from 'lucide-react';
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

const Cards = () => {
  return (
    <AnimatedPage>
      <div className="space-y-8 relative z-10 pb-10">

        <motion.div variants={zigZagLeft} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">
            Card Management
          </h1>
          <p className="text-slate-400 font-medium tracking-wide mt-1">Virtual and physical card controls</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12">

          {/* Card Visualizer - Slides from Left */}
          <motion.div variants={zigZagLeft} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex-1 flex flex-col items-center justify-center glass-panel py-12">

            {/* 3D Card Hover Effect */}
            <motion.div
              whileHover={{ scale: 1.05, rotateY: 10, rotateX: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-full max-w-sm h-56 bg-gradient-to-br from-slate-800 via-black to-slate-900 rounded-3xl relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 cursor-pointer group perspective-1000"
            >
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />

              {/* Glossy shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

              <div className="absolute top-6 left-8">
                <div className="w-12 h-9 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded flex items-center justify-center border border-yellow-200/50 shadow-inner">
                  <div className="w-8 h-5 border border-yellow-800/20 rounded-sm opacity-50" />
                </div>
              </div>

              <div className="absolute top-6 right-8 text-white font-black italic text-2xl tracking-tighter">GLOBAL</div>

              <div className="absolute bottom-16 left-8 font-mono text-xl tracking-widest text-slate-300 group-hover:text-white transition-colors text-shadow">
                **** **** **** 8829
              </div>

              <div className="absolute bottom-6 left-8 text-white">
                <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Card Holder</p>
                <p className="font-bold tracking-widest text-sm">ALEX STERLING</p>
              </div>
              <div className="absolute bottom-6 right-8 text-white text-right">
                <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Valid Thru</p>
                <p className="font-bold tracking-widest text-sm">12/28</p>
              </div>
            </motion.div>

            <div className="flex gap-4 mt-12 w-full max-w-sm">
              <motion.button variants={roundButton} whileHover="hover" whileTap="tap" className="flex-1 py-3 bg-red-500/10 text-red-400 font-bold border border-red-500/20 flex justify-center items-center gap-2">
                <Power className="w-4 h-4" /> Freeze
              </motion.button>
              <motion.button variants={roundButton} whileHover="hover" whileTap="tap" className="flex-1 py-3 bg-white/5 text-white font-bold border border-white/10 flex justify-center items-center gap-2">
                <Shield className="w-4 h-4" /> Details
              </motion.button>
            </div>
          </motion.div>

          {/* Settings Toggles - Slides from Right */}
          <motion.div variants={zigZagRight} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex-1 space-y-4">
            <h3 className="text-xl font-bold text-white mb-6">Security Parameters</h3>

            {[
              { icon: Smartphone, title: "Contactless (NFC)", desc: "Enable tap-to-pay at physical terminals", color: "text-blue-400", bg: "bg-blue-500/10" },
              { icon: Globe, title: "International Usage", desc: "Allow cross-border transactions", color: "text-purple-400", bg: "bg-purple-500/10" },
              { icon: Lock, title: "Online Purchases", desc: "Allow e-commerce transactions", color: "text-emerald-400", bg: "bg-emerald-500/10" },
            ].map((setting, i) => (
              <div key={i} className="glass-panel p-5 flex items-center justify-between group cursor-pointer hover:border-white/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${setting.bg} ${setting.color} group-hover:scale-110 transition-transform`}>
                    <setting.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white font-bold">{setting.title}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{setting.desc}</p>
                  </div>
                </div>

                {/* Custom Toggle Switch */}
                <div className="relative inline-flex h-7 w-12 items-center rounded-full bg-blue-600 shadow-inner cursor-pointer transition-colors">
                  <span className="translate-x-6 inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform" />
                </div>
              </div>
            ))}

            <div className="glass-panel p-6 mt-8">
              <div className="flex justify-between items-center mb-4">
                <p className="font-bold text-white">Daily Spending Limit</p>
                <p className="font-mono text-blue-400 font-bold">$5,000</p>
              </div>
              <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-[60%] h-full" />
              </div>
              <p className="text-xs text-slate-500 mt-3 text-right">60% Used Today</p>
            </div>

          </motion.div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Cards;