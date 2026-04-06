'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ClipboardList, Plus, Edit3, Trash2, Users, Save, Loader2, X, ChevronDown } from 'lucide-react';

const TEAM_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expandedTeam, setExpandedTeam] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [tRes, pRes] = await Promise.all([
      supabase.from('teams').select('*').order('name'),
      supabase.from('players').select('*').eq('status', 'active').order('name'),
    ]);
    setTeams(tRes.data || []);
    setPlayers(pRes.data || []);
    setLoading(false);
  }

  async function saveTeam(data) {
    if (editing) {
      await supabase.from('teams').update(data).eq('id', editing.id);
    } else {
      await supabase.from('teams').insert(data);
    }
    setShowModal(false);
    setEditing(null);
    loadData();
  }

  async function deleteTeam(id) {
    if (!confirm('Delete this team? Players will be unassigned.')) return;
    await supabase.from('players').update({ team_id: null }).eq('team_id', id);
    await supabase.from('teams').delete().eq('id', id);
    loadData();
  }

  async function assignPlayer(playerId, teamId) {
    await supabase.from('players').update({ team_id: teamId }).eq('id', playerId);
    loadData();
  }

  async function removeFromTeam(playerId) {
    await supabase.from('players').update({ team_id: null }).eq('id', playerId);
    loadData();
  }

  if (loading) return <LoadingSpinner text="Loading teams..." />;

  const unassigned = players.filter(p => !p.team_id);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Teams</h2>
          <p className="text-sm text-white/40 mt-1">{teams.length} teams • {players.length} active players</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold">
          <Plus className="w-4 h-4" /> Add Team
        </button>
      </div>

      <div className="grid gap-3">
        {teams.map((team, idx) => {
          const teamPlayers = players.filter(p => p.team_id == team.id);
          const color = team.color || TEAM_COLORS[idx % TEAM_COLORS.length];
          const expanded = expandedTeam === team.id;
          return (
            <div key={team.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.03]"
                onClick={() => setExpandedTeam(expanded ? null : team.id)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                    style={{ background: `${color}20`, color: color, border: `1px solid ${color}30` }}>
                    {team.name?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{team.name}</h3>
                    <p className="text-[11px] text-white/30">{teamPlayers.length} players {team.captain ? `• Captain: ${players.find(p => p.id == team.captain)?.name || ''}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={e => { e.stopPropagation(); setEditing(team); setShowModal(true); }}
                    className="p-2 rounded-lg bg-white/[0.04] text-white/30 hover:text-[#4F9CF9]">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); deleteTeam(team.id); }}
                    className="p-2 rounded-lg bg-white/[0.04] text-white/30 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expanded && (
                <div className="border-t border-white/[0.04] p-4">
                  {teamPlayers.length === 0 ? (
                    <p className="text-sm text-white/20 text-center py-4">No players assigned</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {teamPlayers.map(p => (
                        <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03]">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white/50 w-6">#{p.jersey_number || '?'}</span>
                            <span className="text-sm text-white">{p.name}</span>
                            <span className="text-[10px] text-white/25">{p.position || ''}</span>
                          </div>
                          <button onClick={() => removeFromTeam(p.id)} className="text-white/20 hover:text-red-400">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Add player to team */}
                  {unassigned.length > 0 && (
                    <div className="mt-3">
                      <select onChange={e => { if (e.target.value) { assignPlayer(parseInt(e.target.value), team.id); e.target.value = ''; } }}
                        className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white/50 outline-none">
                        <option value="">+ Add unassigned player...</option>
                        {unassigned.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unassigned Players */}
      {unassigned.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-bold text-white/50 mb-3">Unassigned Players ({unassigned.length})</h3>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
            <div className="flex flex-wrap gap-2">
              {unassigned.map(p => (
                <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <span className="text-xs text-white/60">{p.name}</span>
                  <select onChange={e => { if (e.target.value) assignPlayer(p.id, parseInt(e.target.value)); }}
                    className="bg-transparent text-[10px] text-[#4F9CF9] outline-none cursor-pointer">
                    <option value="">→ Assign</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showModal && <TeamModal team={editing} players={players} onSave={saveTeam} onClose={() => { setShowModal(false); setEditing(null); }} />}
    </div>
  );
}

function TeamModal({ team, players, onSave, onClose }) {
  const [form, setForm] = useState({
    name: team?.name || '', color: team?.color || '#3b82f6',
    captain: team?.captain || '', notes: team?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.name.trim()) return alert('Team name is required');
    setSaving(true);
    await onSave({ ...form, captain: form.captain || null });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#0a0e17] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">{team ? 'Edit Team' : 'New Team'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/[0.06] text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Team Name *</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Team Color</label>
            <div className="flex gap-2">
              {TEAM_COLORS.map(c => (
                <button key={c} onClick={() => setForm({...form, color: c})}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${form.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Captain</label>
            <select value={form.captain} onChange={e => setForm({...form, captain: e.target.value})}
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none">
              <option value="">No captain</option>
              {players.filter(p => !team || p.team_id == team.id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2}
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
