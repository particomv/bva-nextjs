'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Stethoscope, Plus, Edit3, Trash2, Save, Loader2, X, Search, AlertCircle } from 'lucide-react';

export default function MedicalPage() {
  const [records, setRecords] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [mRes, pRes] = await Promise.all([
      supabase.from('medical_log').select('*').order('date', { ascending: false }),
      supabase.from('players').select('id, name, jersey_number').order('name'),
    ]);
    setRecords(mRes.data || []);
    setPlayers(pRes.data || []);
    setLoading(false);
  }

  async function saveRecord(data) {
    if (editing) { await supabase.from('medical_log').update(data).eq('id', editing.id); }
    else { await supabase.from('medical_log').insert(data); }
    setShowModal(false); setEditing(null); loadData();
  }

  async function deleteRecord(id) {
    if (!confirm('Delete this record?')) return;
    await supabase.from('medical_log').delete().eq('id', id);
    loadData();
  }

  const types = [...new Set(records.map(r => r.type).filter(Boolean))];
  const filtered = records.filter(r => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    const player = players.find(p => p.id === r.player_id);
    if (search && !player?.name?.toLowerCase().includes(search.toLowerCase()) && !r.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const activeInjuries = records.filter(r => r.status === 'active' || r.status === 'recovering');

  if (loading) return <LoadingSpinner text="Loading medical records..." />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Medical Log</h2>
          <p className="text-sm text-white/40 mt-1">{records.length} records • {activeInjuries.length} active</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold">
          <Plus className="w-4 h-4" /> New Entry
        </button>
      </div>

      {activeInjuries.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-red-400">Active Injuries</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeInjuries.map(r => {
              const player = players.find(p => p.id === r.player_id);
              return (
                <span key={r.id} className="text-xs bg-red-500/10 text-red-300 px-2 py-1 rounded-lg">
                  {player?.name || 'Unknown'}: {r.description || r.type}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none placeholder:text-white/20" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white/70 outline-none">
          <option value="all">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="grid gap-3">
        {filtered.map(record => {
          const player = players.find(p => p.id === record.player_id);
          return (
            <div key={record.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.05] transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white">{player?.name || 'Unknown'}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      record.status === 'active' ? 'bg-red-500/15 text-red-400' :
                      record.status === 'recovering' ? 'bg-amber-500/15 text-amber-400' :
                      'bg-emerald-500/15 text-emerald-400'
                    }`}>{record.status || 'recorded'}</span>
                  </div>
                  <p className="text-xs text-white/50">{record.type}: {record.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-white/25">
                    <span>{record.date}</span>
                    {record.return_date && <span>Return: {record.return_date}</span>}
                    {record.treatment && <span>Tx: {record.treatment}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(record); setShowModal(true); }} className="p-1.5 rounded-lg text-white/20 hover:text-[#4F9CF9]">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteRecord(record.id)} className="p-1.5 rounded-lg text-white/20 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center py-16 text-white/30 text-sm">No records found</div>}
      </div>

      {showModal && <MedicalModal record={editing} players={players} onSave={saveRecord} onClose={() => { setShowModal(false); setEditing(null); }} />}
    </div>
  );
}

function MedicalModal({ record, players, onSave, onClose }) {
  const [form, setForm] = useState({
    player_id: record?.player_id || '', type: record?.type || 'Injury',
    description: record?.description || '', date: record?.date || new Date().toISOString().split('T')[0],
    return_date: record?.return_date || '', treatment: record?.treatment || '',
    status: record?.status || 'active', notes: record?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.player_id || !form.description) return alert('Player and description required');
    setSaving(true);
    await onSave({ ...form, player_id: parseInt(form.player_id) });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#0a0e17] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">{record ? 'Edit Record' : 'New Medical Entry'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/[0.06] text-white/40"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Player *</label>
            <select value={form.player_id} onChange={e => setForm({...form, player_id: e.target.value})}
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none">
              <option value="">Select player</option>
              {players.map(p => <option key={p.id} value={p.id}>#{p.jersey_number || '?'} {p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none">
                {['Injury', 'Illness', 'Checkup', 'Surgery', 'Rehab', 'Other'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none">
                {['active', 'recovering', 'resolved'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Description *</label>
            <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Expected Return</label>
              <input type="date" value={form.return_date} onChange={e => setForm({...form, return_date: e.target.value})}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Treatment</label>
            <textarea value={form.treatment} onChange={e => setForm({...form, treatment: e.target.value})} rows={2}
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-white/50 text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
          </button>
        </div>
      </div>
    </div>
  );
}
