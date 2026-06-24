import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Search, Filter, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, LogIn, LogOut, Banknote, ShieldAlert,
  Shield, Info, RefreshCw
} from 'lucide-react';
import api from '../api/axiosClient';

// ── Color coding per event action ─────────────────────────────────────────
const ACTION_META = {
  LOGIN:             { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: LogIn },
  LOGOUT:            { color: 'text-zinc-400',    bg: 'bg-zinc-500/10',    border: 'border-zinc-500/20',    icon: LogOut },
  REGISTER:          { color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    icon: CheckCircle2 },
  DEPOSIT:           { color: 'text-teal-400',    bg: 'bg-teal-500/10',    border: 'border-teal-500/20',    icon: Banknote },
  WITHDRAW:          { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   icon: Banknote },
  ETH_TRANSFER:      { color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  icon: Banknote },
  LOGIN_FAILED:      { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     icon: XCircle },
  RATE_LIMIT_BREACH: { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     icon: ShieldAlert },
  ANTI_PHISHING_SET: { color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20',  icon: Shield },
};

const getActionMeta = (action) =>
  ACTION_META[action?.toUpperCase()] || {
    color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', icon: Info
  };

const formatTimestamp = (ts) => {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

const PAGE_SIZE = 15;

const AccountActivity = () => {
  const [events, setEvents] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const fetchEvents = useCallback(async (page = 0, action = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, size: PAGE_SIZE });
      if (action) params.append('action', action);
      const res = await api.get(`/api/audit/events?${params}`);
      setEvents(res.data.events || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalEvents(res.data.totalEvents || 0);
      setCurrentPage(page);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(0, filterAction);
  }, [fetchEvents, filterAction]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // Client-side filter over the current page for the search box
  const displayed = events.filter((ev) =>
    !search ||
    ev.action?.toLowerCase().includes(search.toLowerCase()) ||
    ev.detail?.toLowerCase().includes(search.toLowerCase()) ||
    ev.ipAddress?.toLowerCase().includes(search.toLowerCase())
  );

  const ACTION_FILTERS = ['', 'LOGIN', 'LOGOUT', 'DEPOSIT', 'WITHDRAW', 'LOGIN_FAILED', 'RATE_LIMIT'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ClipboardList size={20} className="text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black text-white">Account Activity</h1>
          </div>
          <p className="text-zinc-500 text-sm ml-13">
            Immutable audit trail — {totalEvents} events recorded
          </p>
        </div>
        <button
          onClick={() => fetchEvents(currentPage, filterAction)}
          className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            type="text"
            placeholder="Search events, details, IP..."
            value={search}
            onChange={handleSearch}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        {/* Action filter pills */}
        <div className="flex gap-2 flex-wrap">
          {ACTION_FILTERS.map((f) => (
            <button
              key={f || 'all'}
              onClick={() => setFilterAction(f)}
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border ${
                filterAction === f
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {f || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Events Timeline */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-600">
            <ClipboardList size={32} className="mb-3 opacity-30" />
            <p className="text-sm">No events found</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-900">
            {displayed.map((ev, idx) => {
              const meta = getActionMeta(ev.action);
              const IconEl = meta.icon;
              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="flex items-start gap-4 px-6 py-4 hover:bg-zinc-900/50 transition-colors"
                >
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-lg ${meta.bg} border ${meta.border} flex items-center justify-center shrink-0 mt-0.5`}>
                    <IconEl size={16} className={meta.color} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className={`text-xs font-black uppercase tracking-widest ${meta.color}`}>
                        {ev.action?.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ev.outcome === 'SUCCESS'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {ev.outcome}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 truncate">{ev.detail}</p>
                    <div className="flex gap-4 mt-1">
                      <span className="text-[11px] text-zinc-600 font-mono">{ev.ipAddress}</span>
                      <span className="text-[11px] text-zinc-700">·</span>
                      <span className="text-[11px] text-zinc-600">{formatTimestamp(ev.timestamp)}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={currentPage === 0}
            onClick={() => fetchEvents(currentPage - 1, filterAction)}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-zinc-500 font-bold">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages - 1}
            onClick={() => fetchEvents(currentPage + 1, filterAction)}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default AccountActivity;
