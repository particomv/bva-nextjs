'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  CreditCard, Check, X, Clock, Search, Filter,
  Download, ChevronDown, DollarSign, Loader2, Receipt,
} from 'lucide-react';

export default function PaymentsPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterTeam, setFilterTeam] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(null);
  const [showModal, setShowModal] = useState(null);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { loadPayments(); }, [month]);

  async function loadData() {
    setLoading(true);
    const [pRes, tRes] = await Promise.all([
      supabase.from('players').select('*').eq('status', 'active').order('name'),
      supabase.from('teams').select('*').order('name'),
    ]);
    setPlayers(pRes.data || []);
    setTeams(tRes.data || []);
    setLoading(false);
  }

  async function loadPayments() {
    const { data } = await supabase.from('payments').select('*').eq('month', month);
    setPayments(data || []);
  }

  function getPaymentStatus(playerId) {
    const p = payments.find(p => p.pid === playerId);
    return p ? p.status : 'unpaid';
  }

  function getPaymentRecord(playerId) {
    return payments.find(p => p.pid === playerId);
  }

  async function togglePayment(player) {
    const existing = getPaymentRecord(player.id);
    const currentStatus = existing?.status || 'unpaid';
    const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';

    setSaving(player.id);
    if (existing) {
      await supabase.from('payments').update({
        status: newStatus,
        paid_date: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : '',
      }).eq('id', existing.id);
    } else {
      await supabase.from('payments').insert({
        pid: player.id,
        month: month,
        status: newStatus,
        paid_date: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : '',
        receipt: '',
      });
    }
    await loadPayments();
    setSaving(null);
  }

  async function saveReceipt(playerId, receipt) {
    const existing = getPaymentRecord(playerId);
    if (existing) {
      await supabase.from('payments').update({ receipt }).eq('id', existing.id);
      await loadPayments();
    }
    setShowModal(null);
  }

  function getFiltered() {
    return players.filter(p => {
      if (filterTeam !== 'all' && p.team_id != filterTeam) return false;
      if (filterStatus !== 'all' && getPaymentStatus(p.id) !== filterStatus) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }

  if (loading) return <LoadingSpinner text="Loading payments..." />;

  const filtered = getFiltered();
  const totalPaid = players.filter(p => getPaymentStatus(p.id) === 'paid').length;
  const totalUnpaid = players.length - totalPaid;
  const monthLabel = new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Payments</h2>
          <p className="text-sm text-white/40 mt-1">Monthly fee tracking — {monthLabel}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{totalPaid}</p>
          <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Paid</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{totalUnpaid}</p>
          <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Unpaid</p>
        </div>
        <div className="bg-[#4F9CF9]/10 border border-[#4F9CF9]/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#4F9CF9]">{players.length > 0 ? Math.round(totalPaid / players.length * 100) : 0}%</p>
          <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Collection</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white outline-none" />
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input type="text" placeholder="Search player..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none placeholder:text-white/20" />
        </div>
        <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white/70 outline-none">
          <option value="all">All Teams</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white/70 outline-none">
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      {/* Player Payment List */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
        {filtered.map((p, i) => {
          const status = getPaymentStatus(p.id);
          const record = getPaymentRecord(p.id);
          const team = teams.find(t => t.id == p.team_id);
          return (
            <div key={p.id} className={`flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-all ${i > 0 ? 'border-t border-white/[0.04]' : ''}`}>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/60 text-xs font-bold">
                  {p.jersey_number || '#'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                  <p className="text-[10px] text-white/30">{team?.name || 'No team'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {record?.receipt && (
                  <span className="text-[10px] text-white/30 hidden sm:block">#{record.receipt}</span>
                )}
                <button onClick={() => setShowModal(p)} className="p-1.5 rounded-lg bg-white/[0.04] text-white/30 hover:text-white/60 hover:bg-white/[0.08]">
                  <Receipt className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => togglePayment(p)} disabled={saving === p.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    status === 'paid'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                  {saving === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> :
                    status === 'paid' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  {status === 'paid' ? 'Paid' : 'Unpaid'}
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-white/30 text-sm">No players found</div>
        )}
      </div>

      {/* Receipt Modal */}
      {showModal && <ReceiptModal player={showModal} record={getPaymentRecord(showModal.id)} onSave={saveReceipt} onClose={() => setShowModal(null)} />}
    </div>
  );
}

function ReceiptModal({ player, record, onSave, onClose }) {
  const [receipt, setReceipt] = useState(record?.receipt || '');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>
      <div className="bg-[#0a0e17] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white mb-1">Receipt — {player.name}</h3>
        <p className="text-xs text-white/30 mb-4">Add receipt or reference number</p>
        <input type="text" value={receipt} onChange={e => setReceipt(e.target.value)} placeholder="Receipt #"
          className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm outline-none mb-4 placeholder:text-white/20 focus:border-[#4F9CF9]/40" />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-white/50 text-sm font-medium">Cancel</button>
          <button onClick={() => onSave(player.id, receipt)} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold">Save</button>
        </div>
      </div>
    </div>
  );
}
