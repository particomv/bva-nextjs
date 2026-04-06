'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Trophy, Plus, Edit3, Trash2, Calendar, MapPin, Save, Loader2, X, Clock, ChevronDown } from 'lucide-react';

const MATCH_TYPES = ['Friendly', 'League', 'Tournament', 'Practice', 'Inter-squad', 'National'];

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [tab, setTab] = useState('upcoming');
  const [expandedMatch, setExpandedMatch] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [mRes, tRes] = await Promise.all([
      supabase.from('matches').select('*').order('date', { ascending: false }),
      supabase.from('teams').select('*').order('name'),
    ]);
    setMatches(mRes.data || []);
    setTeams(tRes.data || []);
    setLoading(false);
  }

  async function saveMatch(data) {
    if (editing) {
      await supabase.from('matches').update(data).eq('id', editing.id);
    } else {
      await supabase.from('matches').insert(data);
    }
    setShowModal(false);
    setEditing(null);
    loadData();
  }

  async function deleteMatch(id) {
    if (!confirm('Delete this match?')) return;
    await supabase.from('matches').delete().eq('id', id);
    loadData();
  }

  async function updateScore(matchId, field, value) {
    await supabase.from('matches').update({ [field]: value }).eq('id', matchId);
    loadData();
  }

  const today = new Date().toISOString().split('T')[0];
  const upcoming = matches.filter(m => m.date >= today || m.status === 'scheduled');
  const completed = matches.filter(m => m.date < today && m.status !== 'scheduled');

  if (loading) return <LoadingSpinner text="Loading matches..." />;

  const displayed = tab === 'upcoming' ? upcoming : completed;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Matches</h2>
          <p className="text-sm text-white/40 mt-1">{matches.length} total matches</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold">
          <Plus className="w-4 h-4" /> New Match
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-emerald-400">{matches.filter(m => m.result === 'win').length}</p>
          <p className="text-[10px] text-white/40 uppercase">Wins</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-red-400">{matches.filter(m => m.result === 'loss').length}</p>
          <p className="text-[10px] text-white/40 uppercase">Losses</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-amber-400">{upcoming.length}</p>
          <p className="text-[10px] text-white/40 uppercase">Upcoming</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {['upcoming', 'completed'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold ${tab === t ? 'bg-[#4F9CF9]/15 text-[#4F9CF9] border border-[#4F9CF9]/25' : 'text-white/40 border border-transparent'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)} ({t === 'upcoming' ? upcoming.length : completed.length})
          </button>
        ))}
      </div>

      {/* Match List */}
      <div className="grid gap-3">
        {displayed.map(match => {
          const expanded = expandedMatch === match.id;
          return (
            <div key={match.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="p-4 cursor-pointer hover:bg-white/[0.03]" onClick={() => setExpandedMatch(expanded ? null : match.id)}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    match.match_type === 'Tournament' ? 'bg-amber-500/15 text-amber-400' :
                    match.match_type === 'League' ? 'bg-purple-500/15 text-purple-400' :
                    'bg-white/[0.06] text-white/40'
                  }`}>{match.match_type || 'Friendly'}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={e => { e.stopPropagation(); setEditing(match); setShowModal(true); }}
                      className="p-1.5 rounded-lg bg-white/[0.04] text-white/30 hover:text-[#4F9CF9]">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); deleteMatch(match.id); }}
                      className="p-1.5 rounded-lg bg-white/[0.04] text-white/30 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-white">{match.team_a || 'Blues'}</h3>
                  </div>
                  <div className="text-center px-4">
                    {match.score_a !== null && match.score_b !== null ? (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-white">{match.score_a}</span>
                        <span className="text-sm text-white/20">-</span>
                        <span className="text-2xl font-black text-white">{match.score_b}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-white/20 font-bold">VS</span>
                    )}
                    {match.result && (
                      <span className={`text-[10px] font-bold uppercase ${
                        match.result === 'win' ? 'text-emerald-400' : match.result === 'loss' ? 'text-red-400' : 'text-amber-400'
                      }`}>{match.result}</span>
                    )}
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className="text-base font-bold text-white">{match.team_b || 'Opponent'}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-[11px] text-white/30">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {match.date || 'TBD'}</span>
                  {match.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {match.time}</span>}
                  {match.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {match.venue}</span>}
                </div>
              </div>
              {expanded && (
                <div className="border-t border-white/[0.04] p-4">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[10px] text-white/30 uppercase tracking-wider">Score {match.team_a || 'Blues'}</label>
                      <input type="number" value={match.score_a || ''} onChange={e => updateScore(match.id, 'score_a', parseInt(e.target.value) || 0)}
                        className="w-full mt-1 px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-white text-sm outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/30 uppercase tracking-wider">Score {match.team_b || 'Opponent'}</label>
                      <input type="number" value={match.score_b || ''} onChange={e => updateScore(match.id, 'score_b', parseInt(e.target.value) || 0)}
                        className="w-full mt-1 px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-white text-sm outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider">Result</label>
                    <div className="flex gap-2 mt-1">
                      {['win', 'loss', 'draw'].map(r => (
                        <button key={r} onClick={() => updateScore(match.id, 'result', r)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            match.result === r
                              ? r === 'win' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : r === 'loss' ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : 'bg-white/[0.04] text-white/30 border-white/[0.06]'
                          }`}>{r.charAt(0).toUpperCase() + r.slice(1)}</button>
                      ))}
                    </div>
                  </div>
                  {match.sets && (
                    <div className="mt-3">
                      <label className="text-[10px] text-white/30 uppercase tracking-wider">Set Scores</label>
                      <p className="text-sm text-white/60 mt-1">{match.sets}</p>
                    </div>
                  )}
                  {match.notes && (
                    <div className="mt-3">
                      <label className="text-[10px] text-white/30 uppercase tracking-wider">Notes</label>
                      <p className="text-sm text-white/50 mt-1">{match.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {displayed.length === 0 && (
          <div className="text-center py-16 text-white/30 text-sm">No {tab} matches</div>
        )}
      </div>

      {showModal && <MatchModal match={editing} teams={teams} onSave={saveMatch} onClose={() => { setShowModal(false); setEditing(null); }} />}
    </div>
  );
}

function MatchModal({ match, teams, onSave, onClose }) {
  const [form, setForm] = useState({
    team_a: match?.team_a || 'Blues', team_b: match?.team_b || '',
    date: match?.date || new Date().toISOString().split('T')[0],
    time: match?.time || '', venue: match?.venue || '',
    match_type: match?.match_type || 'Friendly',
    score_a: match?.score_a || '', score_b: match?.score_b || '',
    result: match?.result || '', sets: match?.sets || '',
    status: match?.status || 'scheduled', notes: match?.notes || '',
    mvp: match?.mvp || '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.team_b.trim()) return alert('Opponent name is required');
    setSaving(true);
    await onSave({
      ...form,
      score_a: form.score_a ? parseInt(form.score_a) : null,
      score_b: form.score_b ? parseInt(form.score_b) : null,
    });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#0a0e17] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">{match ? 'Edit Match' : 'New Match'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/[0.06] text-white/40"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Our Team</label>
              <input type="text" value={form.team_a} onChange={e => setForm({...form, team_a: e.target.value})}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Opponent *</label>
              <input type="text" value={form.team_b} onChange={e => setForm({...form, team_b: e.target.value})}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Time</label>
              <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Venue</label>
              <input type="text" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Type</label>
              <select value={form.match_type} onChange={e => setForm({...form, match_type: e.target.value})}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none">
                {MATCH_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Set Scores</label>
            <input type="text" value={form.sets} onChange={e => setForm({...form, sets: e.target.value})} placeholder="e.g. 25-20, 22-25, 25-18"
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none placeholder:text-white/20" />
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
