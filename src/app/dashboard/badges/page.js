'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Award, Plus, Trash2, Save, Loader2, X, Search, Star, Trophy, Medal } from 'lucide-react';

const BADGE_TYPES = [
  { value: 'mvp', label: 'MVP', icon: '🏆', color: 'text-amber-400 bg-amber-500/15' },
  { value: 'best_player', label: 'Best Player', icon: '⭐', color: 'text-yellow-400 bg-yellow-500/15' },
  { value: 'best_setter', label: 'Best Setter', icon: '🎯', color: 'text-blue-400 bg-blue-500/15' },
  { value: 'best_spiker', label: 'Best Spiker', icon: '💥', color: 'text-red-400 bg-red-500/15' },
  { value: 'best_blocker', label: 'Best Blocker', icon: '🛡️', color: 'text-purple-400 bg-purple-500/15' },
  { value: 'best_server', label: 'Best Server', icon: '🎾', color: 'text-emerald-400 bg-emerald-500/15' },
  { value: 'most_improved', label: 'Most Improved', icon: '📈', color: 'text-cyan-400 bg-cyan-500/15' },
  { value: 'custom', label: 'Custom', icon: '🏅', color: 'text-white/60 bg-white/[0.08]' },
];

export default function BadgesPage() {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [bRes, pRes] = await Promise.all([
      supabase.from('badges').select('*').order('date', { ascending: false }),
      supabase.from('players').select('id, name, jersey_number').order('name'),
    ]);
    setBadges(bRes.data || []);
    setPlayers(pRes.data || []);
    setLoading(false);
  }

  async function saveBadge(data) {
    await supabase.from('badges').insert(data);
    setShowModal(false); loadData();
  }

  async function deleteBadge(id) {
    if (!confirm('Delete this badge?')) return;
    await supabase.from('badges').delete().eq('id', id);
    loadData();
  }

  if (loading) return <LoadingSpinner text="Loading badges..." />;

  const filtered = badges.filter(b => {
    const player = players.find(p => p.id === b.player_id);
    return !search || player?.name?.toLowerCase().includes(search.toLowerCase()) || b.title?.toLowerCase().includes(search.toLowerCase());
  });

  // Top badge holders
  const badgeCounts = {};
  badges.forEach(b => { badgeCounts[b.player_id] = (badgeCounts[b.player_id] || 0) + 1; });
  const topHolders = Object.entries(badgeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Badges & Awards</h2>
          <p className="text-sm text-white/40 mt-1">{badges.length} badges awarded</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold">
          <Plus className="w-4 h-4" /> Award Badge
        </button>
      </div>

      {/* Top holders */}
      {topHolders.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 mb-5">
          <h3 className="text-xs font-bold text-white/30 uppercase tracking-wider mb-3">Top Badge Holders</h3>
          <div className="flex gap-4 overflow-x-auto pb-1">
            {topHolders.map(([pid, count], i) => {
              const player = players.find(p => p.id == pid);
              return (
                <div key={pid} className="text-center min-w-[70px]">
                  <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center text-sm font-bold ${
                    i === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-white/[0.06] text-white/50'
                  }`}>{i === 0 ? '👑' : `#${i + 1}`}</div>
                  <p className="text-[11px] text-white font-medium mt-1 truncate">{player?.name?.split(' ')[0] || '?'}</p>
                  <p className="text-[10px] text-white/30">{count} badge{count > 1 ? 's' : ''}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input type="text" placeholder="Search badges..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none placeholder:text-white/20" />
      </div>

      <div className="grid gap-3">
        {filtered.map(badge => {
          const player = players.find(p => p.id === badge.player_id);
          const bt = BADGE_TYPES.find(t => t.value === badge.type) || BADGE_TYPES[BADGE_TYPES.length - 1];
          return (
            <div key={badge.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between hover:bg-white/[0.05] transition-all">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${bt.color}`}>
                  {bt.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{badge.title || bt.label}</span>
                    <span className="text-[10px] text-white/25">{badge.date}</span>
                  </div>
                  <p className="text-xs text-white/40">{player?.name || 'Unknown'} {badge.event ? `• ${badge.event}` : ''}</p>
                </div>
              </div>
              <button onClick={() => deleteBadge(badge.id)} className="p-1.5 rounded-lg text-white/20 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center py-16 text-white/30 text-sm">No badges found</div>}
      </div>

      {showModal && <BadgeModal players={players} user={user} onSave={saveBadge} onClose={() => setShowModal(false)} />}
    </div>
  );
}

function BadgeModal({ players, user, onSave, onClose }) {
  const [form, setForm] = useState({
    player_id: '', type: 'mvp', title: '', event: '',
    date: new Date().toISOString().split('T')[0], note: '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.player_id) return alert('Select a player');
    setSaving(true);
    const bt = BADGE_TYPES.find(t => t.value === form.type);
    await onSave({
      ...form, player_id: parseInt(form.player_id),
      title: form.title || bt?.label || form.type,
      given_by: user?.username || 'admin',
    });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#0a0e17] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Award Badge</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/[0.06] text-white/40"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Player *</label>
            <select value={form.player_id} onChange={e => setForm({...form, player_id: e.target.value})}
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none">
              <option value="">Select player</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Badge Type</label>
            <div className="grid grid-cols-4 gap-2">
              {BADGE_TYPES.map(bt => (
                <button key={bt.value} onClick={() => setForm({...form, type: bt.value})}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    form.type === bt.value ? 'border-[#4F9CF9]/40 bg-[#4F9CF9]/10' : 'border-white/[0.06] bg-white/[0.02]'
                  }`}>
                  <div className="text-lg mb-0.5">{bt.icon}</div>
                  <div className="text-[9px] text-white/40">{bt.label}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Title</label>
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Auto from type"
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none placeholder:text-white/15" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Event / Match</label>
            <input type="text" value={form.event} onChange={e => setForm({...form, event: e.target.value})} placeholder="e.g. Inter-squad Match"
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none placeholder:text-white/15" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-white/50 text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />} Award
          </button>
        </div>
      </div>
    </div>
  );
}
