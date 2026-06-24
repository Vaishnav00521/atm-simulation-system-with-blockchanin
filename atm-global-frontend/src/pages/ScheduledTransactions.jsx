import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, Plus, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api/axiosClient';

const ScheduledTransactions = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('TRANSFER');
  const [currency, setCurrency] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [targetAddress, setTargetAddress] = useState('');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await api.get('/api/schedules');
      setSchedules(res.data);
    } catch (err) {
      setError('Failed to load scheduled transactions.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!amount) return;
    try {
      const payload = {
        type,
        currency,
        amount: parseFloat(amount),
        targetAddress: type === 'TRANSFER' ? targetAddress : null,
        cronExpression: '0 0 * * * ?' // Simplified mock
      };
      await api.post('/api/schedules', payload);
      setShowForm(false);
      setAmount('');
      setTargetAddress('');
      fetchSchedules();
    } catch (err) {
      setError('Failed to schedule transaction.');
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.delete(`/api/schedules/${id}`);
      fetchSchedules();
    } catch (err) {
      setError('Failed to cancel schedule.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex justify-between items-center bg-zinc-950 border border-zinc-800 p-8 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center shadow-inner border border-blue-500/20">
            <CalendarClock size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Scheduled Transactions</h1>
            <p className="text-blue-500 font-bold text-sm tracking-widest uppercase">Automated Liquidity Routing</p>
          </div>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
        >
          <Plus size={20} /> {showForm ? 'Cancel Form' : 'New Schedule'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 font-bold">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl overflow-hidden">
          <form onSubmit={handleCreate} className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Create Automation Rule</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Transaction Type</label>
                <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none">
                  <option value="TRANSFER">Crypto Transfer</option>
                  <option value="WITHDRAW">Fiat Withdrawal</option>
                  <option value="DEPOSIT">Fiat Deposit</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Asset</label>
                <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none">
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="USD">US Dollar (USD)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Amount</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} step="0.0001" min="0" required className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="0.00" />
              </div>

              {type === 'TRANSFER' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Target Address (Web3)</label>
                  <input type="text" value={targetAddress} onChange={e => setTargetAddress(e.target.value)} required className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 font-mono text-sm" placeholder="0x..." />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all">
                Activate Schedule
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/50 border-b border-zinc-800 text-xs uppercase tracking-widest text-zinc-500">
                <th className="p-5 font-bold">Type</th>
                <th className="p-5 font-bold">Asset</th>
                <th className="p-5 font-bold">Amount</th>
                <th className="p-5 font-bold">Status</th>
                <th className="p-5 font-bold">Next Execution</th>
                <th className="p-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan="6" className="p-5 text-center text-zinc-500">Loading schedules...</td></tr>
              ) : schedules.length === 0 ? (
                <tr><td colSpan="6" className="p-5 text-center text-zinc-500">No active schedules found.</td></tr>
              ) : (
                schedules.map((schedule) => (
                  <tr key={schedule.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                    <td className="p-5 font-bold text-white flex items-center gap-2">
                      <Clock size={16} className="text-blue-500" />
                      {schedule.type}
                    </td>
                    <td className="p-5 text-zinc-300 font-mono">{schedule.currency}</td>
                    <td className="p-5 font-bold text-white">{schedule.amount}</td>
                    <td className="p-5">
                      {schedule.active ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-bold w-max">
                          Cancelled
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-zinc-400 font-mono text-xs">
                      {schedule.active && schedule.nextExecutionTime ? new Date(schedule.nextExecutionTime).toLocaleString() : '---'}
                    </td>
                    <td className="p-5 text-right">
                      {schedule.active && (
                        <button onClick={() => handleCancel(schedule.id)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </motion.div>
  );
};

export default ScheduledTransactions;
