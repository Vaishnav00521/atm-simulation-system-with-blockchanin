import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, ShieldAlert, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiFetch } from '../api/apiFetch';
import DispensingStateMachine from './DispensingStateMachine';

const TransactionPanel = () => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);

  // Dispensing state machine
  const [dispenserOpen, setDispenserOpen] = useState(false);
  const [dispenserType, setDispenserType] = useState('WITHDRAW');
  const [dispenserTxHash, setDispenserTxHash] = useState(null);
  const [dispenserError, setDispenserError] = useState(null);

  const handleTransaction = async (type) => {
    if (!amount || isNaN(amount) || amount <= 0) {
      setError('Please enter a valid ETH amount.');
      return;
    }
    setError(null);
    setDispenserType(type.toUpperCase());
    setDispenserTxHash(null);
    setDispenserError(null);
    setDispenserOpen(true);

    try {
      const response = await apiFetch('/api/transactions/execute', {
        method: 'POST',
        body: JSON.stringify({ type, amount }),
      });
      setDispenserTxHash(response.transactionHash);
      setAmount('');
    } catch (err) {
      const errMsg = err.message || 'Network rejected the transaction.';
      setDispenserError(errMsg);
    }
  };

  const handleDownloadReceipt = () => {
    // Placeholder — real receipt download wired in AccountActivity
    const link = document.createElement('a');
    link.href = `/api/export/transactions/csv`;
    link.setAttribute('download', 'transaction_history.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <>
      <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl mt-6 shadow-xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10">
          <h3 className="font-bold text-white mb-2 text-xl">Smart Contract Execution</h3>
          <p className="text-sm text-zinc-500 mb-6">Move liquidity directly across the Ethereum Sepolia network.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm font-bold">
              <ShieldAlert size={16} /> {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full sm:w-auto">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">ETH</span>
              <input
                type="number"
                step="0.001"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-black border border-zinc-800 text-white pl-14 pr-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 w-full sm:w-64 font-mono transition-colors"
              />
            </div>

            <button
              onClick={() => handleTransaction('deposit')}
              className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20"
            >
              <ArrowDownRight size={20} /> Deposit
            </button>

            <button
              onClick={() => handleTransaction('withdraw')}
              className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3 rounded-xl font-bold transition-all"
            >
              <ArrowUpRight size={20} /> Withdraw
            </button>
          </div>

          {/* Completed tx quicklink */}
          {dispenserTxHash && !dispenserOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-black border border-emerald-500/20 rounded-xl flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Last Transaction</p>
                <p className="text-xs font-mono text-zinc-500 truncate max-w-xs">{dispenserTxHash}</p>
              </div>
              <a
                href={`https://sepolia.etherscan.io/tx/${dispenserTxHash}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-2 rounded-lg transition-colors border border-zinc-800"
              >
                Etherscan <ExternalLink size={12} />
              </a>
            </motion.div>
          )}
        </div>
      </div>

      {/* Dispensing State Machine */}
      <DispensingStateMachine
        isOpen={dispenserOpen}
        transactionType={dispenserType}
        amount={amount || '—'}
        currency="ETH"
        txHash={dispenserTxHash}
        error={dispenserError}
        onClose={() => setDispenserOpen(false)}
        onDownloadReceipt={handleDownloadReceipt}
      />
    </>
  );
};

export default TransactionPanel;

