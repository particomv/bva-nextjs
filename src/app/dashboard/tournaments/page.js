'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Trophy, Plus, Edit3, Trash2, Save, Loader2, X, ChevronDown } from 'lucide-react';

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [scoreModal, setScoreModal] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [tRes, tmRes, pRes] = await Promise.all([
      supabase.from('tournaments').select('*').order('created_at', { ascending: false }),
      supabase.from('teams').select('*').order('name'),
      supabase.from('players').select('*').eq('status', 'active').order('name'),
    ]);
    setTournaments(tRes.data || []);
    setTeams(tmRes.data || []);
    setPlayers(pRes.data || []);
    setLoading(false);
  }

  async function saveTournament(data) {
    if (editing) { await supabase.from('tournaments').update(data).eq('id', editing.id); }
    else { await supabase.from('tournaments').insert(data); }
    setShowModal(false); setEditing(null); loadData();
  }

  async function deleteTournament(id) {
    if (!confirm('Delete this tournament?')) return;
    await supabase.from('tournaments').delete().eq('id', id);
    loadData();
  }

  async function updateFixtureScore(tournId, fixtureIdx, score1, score2) {
    const tourn = tournaments.find(t => t.id === tournId);
    if (!tourn) return;
    const fixtures = [...(tourn.fixtures || [])];
    fixtures[fixtureIdx] = { ...fixtures[fixtureIdx], score1: parseInt(score1), score2: parseInt(score2) };
    await supabase.from('tournaments').update({ fixtures }).eq('id', tournId);
    setScoreModal(null); loadData();
  }

  function getStandings(tourn) {
    const standings = {};
    (tourn.team_names || []).forEach(tn => { standings[tn] = { w: 0, l: 0, pts: 0, sf: 0, sa: 0 }; });
    (tourn.fixtures || []).filter(f => f.score1 !== undefined && f.score1 !== null).forEach(f => {
      if (!standings[f.team1]) standings[f.team1] = { w: 0, l: 0, pts: 0, sf: 0, sa: 0 };
      if (!standings[f.team2]) standings[f.team2] = { w: 0, l: 0, pts: 0, sf: 0, sa: 0 };
      standings[f.team1].sf += f.score1; standings[f.team1].sa += f.score2;
      standings[f.team2].sf += f.score2; standings[f.team2].sa += f.score1;
      if (f.score1 > f.score2) { standings[f.team1].w++; standings[f.team1].pts += 3; standings[f.team2].l++; }
      else if (f.score2 > f.score1) { standings[f.team2].w++; standings[f.team2].pts += 3; standings[f.team1].l++; }
      else { standings[f.team1].pts++; standings[f.team2].pts++; }
    });
    return Object.entries(standings).sort((a, b) => b[1].pts - a[1].pts || (b[1].sf - b[1].sa) - (a[1].sf - a[1].sa));
  }

  if (loading) return <LoadingSpinner text="Loading tournaments..." />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Tournaments</h2>
          <p className="text-sm text-white/40 mt-1">{tournaments.length} tournaments</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold">
          <Plus className="w-4 h-4" /> Create
        </button>
      </div>

      {tournaments.length === 0 && (
        <div className="text-center py-20"><Trophy className="w-12 h-12 text-white/10 mx-auto mb-3" /><p className="text-white/30 text-sm">No tournaments yet</p></div>
      )}

      <div className="grid gap-4">
        {tournaments.map(tourn => {
          const isExpanded = expanded === tourn.id;
          const fixtures = tourn.fixtures || [];
          const played = fixtures.filter(f => f.score1 !== undefined && f.score1 !== null).length;
          const standings = tourn.format === 'Round Robin' ? getStandings(tourn) : [];

          return (
            <div key={tourn.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/30 p-5 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : tourn.id)}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">🏆 {tourn.name}</h3>
                    <p className="text-xs text-white/50 mt-1">{tourn.format} · {(tourn.team_names || []).length} teams · {tourn.start_date || ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      tourn.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' :
                      tourn.status === 'completed' ? 'bg-blue-500/15 text-blue-400' :
                      'bg-amber-500/15 text-amber-400'
                    }`}>{tourn.status || 'upcoming'}</span>
                    <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                <div className="mt-3 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] rounded-full" style={{ width: `${fixtures.length > 0 ? (played / fixtures.length * 100) : 0}%` }} />
                </div>
                <p className="text-[10px] text-white/30 mt-1">{played}/{fixtures.length} matches played</p>
              </div>

              {isExpanded && (
                <div className="p-4 space-y-4">
                  {/* Standings */}
                  {tourn.format === 'Round Robin' && standings.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-[#4F9CF9] uppercase tracking-wider mb-2">📊 Standings</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead><tr className="text-white/30 text-[9px] uppercase">
                            <th className="text-left px-2 py-1">#</th><th className="text-left px-2 py-1">Team</th>
                            <th className="px-2 py-1">P</th><th className="px-2 py-1">W</th><th className="px-2 py-1">L</th>
                            <th className="px-2 py-1">SW</th><th className="px-2 py-1">SL</th><th className="px-2 py-1">PTS</th>
                          </tr></thead>
                          <tbody>{standings.map(([name, s], i) => (
                            <tr key={name} className="border-t border-white/[0.04]">
                              <td className="px-2 py-1.5 text-white/40">{i + 1}</td>
                              <td className="px-2 py-1.5 font-bold text-white">{name}</td>
                              <td className="px-2 py-1.5 text-center text-white/50">{s.w + s.l}</td>
                              <td className="px-2 py-1.5 text-center text-emerald-400">{s.w}</td>
                              <td className="px-2 py-1.5 text-center text-red-400">{s.l}</td>
                              <td className="px-2 py-1.5 text-center text-white/50">{s.sf}</td>
                              <td className="px-2 py-1.5 text-center text-white/50">{s.sa}</td>
                              <td className="px-2 py-1.5 text-center font-bold text-[#4F9CF9]">{s.pts}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Fixtures */}
                  <div>
                    <h4 className="text-[10px] font-bold text-[#4F9CF9] uppercase tracking-wider mb-2">Fixtures ({fixtures.length})</h4>
                    <div className="space-y-2">
                      {fixtures.map((f, fi) => {
                        const hasScore = f.score1 !== undefined && f.score1 !== null;
                        const w1 = hasScore && f.score1 > f.score2, w2 = hasScore && f.score2 > f.score1;
                        return (
                          <div key={fi} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                            {f.round && <span className="text-[9px] text-white/20 w-16 flex-shrink-0">{f.round}</span>}
                            <span className={`flex-1 text-right text-sm ${w1 ? 'text-[#4F9CF9] font-bold' : 'text-white'}`}>{f.team1}</span>
                            <div className={`px-3 py-1 rounded-lg text-center min-w-[60px] ${hasScore ? 'bg-[#4F9CF9]/10' : 'bg-white/[0.04]'}`}>
                              <span className={`text-base font-black ${hasScore ? 'text-[#4F9CF9]' : 'text-white/30'}`}>
                                {hasScore ? `${f.score1} - ${f.score2}` : 'vs'}
                              </span>
                            </div>
                            <span className={`flex-1 text-sm ${w2 ? 'text-[#4F9CF9] font-bold' : 'text-white'}`}>{f.team2}</span>
                            <button onClick={() => setScoreModal({ tournId: tourn.id, idx: fi, fixture: f })}
                              className="px-2 py-1 rounded-lg bg-[#4F9CF9]/10 text-[#4F9CF9] text-[10px] font-bold flex-shrink-0">
                              {hasScore ? 'Edit' : 'Score'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(tourn); setShowModal(true); }} className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-white/40 text-xs hover:text-[#4F9CF9]">Edit</button>
                    <button onClick={() => deleteTournament(tourn.id)} className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-white/40 text-xs hover:text-red-400">Delete</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Score Modal */}
      {scoreModal && (
        <ScoreModal fixture={scoreModal.fixture} onSave={(s1, s2) => updateFixtureScore(scoreModal.tournId, scoreModal.idx, s1, s2)} onClose={() => setScoreModal(null)} />
      )}

      {showModal && <TournamentModal tournament={editing} teams={teams} onSave={saveTournament} onClose={() => { setShowModal(false); setEditing(null); }} />}
    </div>
  );
}

function ScoreModal({ fixture, onSave, onClose }) {
  const [s1, setS1] = useState(fixture.score1 ?? '');
  const [s2, setS2] = useState(fixture.score2 ?? '');
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#0a0e17] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h3 className="text-sm font-bold text-white text-center mb-4">Enter Score</h3>
        <div className="flex items-center gap-4 justify-center mb-5">
          <div className="text-center">
            <p className="text-xs text-white/50 mb-2">{fixture.team1}</p>
            <input type="number" value={s1} onChange={e => setS1(e.target.value)}
              className="w-16 text-center py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xl font-bold text-white outline-none" />
          </div>
          <span className="text-white/20 text-lg font-bold mt-5">-</span>
          <div className="text-center">
            <p className="text-xs text-white/50 mb-2">{fixture.team2}</p>
            <input type="number" value={s2} onChange={e => setS2(e.target.value)}
              className="w-16 text-center py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xl font-bold text-white outline-none" />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-white/50 text-sm">Cancel</button>
          <button onClick={() => onSave(s1, s2)} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold">Save</button>
        </div>
      </div>
    </div>
  );
}

function TournamentModal({ tournament, teams, onSave, onClose }) {
  const [form, setForm] = useState({
    name: tournament?.name || '', format: tournament?.format || 'Round Robin',
    start_date: tournament?.start_date || new Date().toISOString().split('T')[0],
    venue: tournament?.venue || '', status: tournament?.status || 'upcoming',
    team_names: tournament?.team_names || teams.map(t => t.name),
    fixtures: tournament?.fixtures || [],
  });
  const [saving, setSaving] = useState(false);
  const [customTeams, setCustomTeams] = useState((tournament?.team_names || []).join(', '));

  function generateFixtures() {
    const tn = customTeams.split(',').map(s => s.trim()).filter(Boolean);
    const fixtures = [];
    if (form.format === 'Round Robin') {
      for (let i = 0; i < tn.length; i++) {
        for (let j = i + 1; j < tn.length; j++) {
          fixtures.push({ team1: tn[i], team2: tn[j], round: `Round ${fixtures.length + 1}` });
        }
      }
    } else {
      for (let i = 0; i < tn.length; i += 2) {
        if (i + 1 < tn.length) fixtures.push({ team1: tn[i], team2: tn[i + 1], round: tn.length <= 2 ? 'Final' : `Match ${Math.floor(i / 2) + 1}` });
      }
    }
    setForm({ ...form, team_names: tn, fixtures });
  }

  async function handleSave() {
    if (!form.name.trim()) return alert('Name required');
    setSaving(true);
    const tn = customTeams.split(',').map(s => s.trim()).filter(Boolean);
    await onSave({ ...form, team_names: tn });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#0a0e17] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">{tournament ? 'Edit' : 'Create'} Tournament</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/[0.06] text-white/40"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Name *</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Academy Cup 2026"
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Format</label>
              <select value={form.format} onChange={e => setForm({...form, format: e.target.value})}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none">
                <option>Round Robin</option><option>Knockout</option><option>Friendly</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Date</label>
              <input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Teams (comma separated)</label>
            <textarea value={customTeams} onChange={e => setCustomTeams(e.target.value)} rows={2} placeholder="Fulhangi, Surumuthi, Mekunu"
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none resize-none" />
          </div>
          <button onClick={generateFixtures} className="w-full py-2 rounded-xl bg-white/[0.06] text-white/50 text-xs font-semibold hover:bg-white/[0.1]">
            ⚡ Generate Fixtures ({customTeams.split(',').filter(s => s.trim()).length} teams)
          </button>
          {form.fixtures.length > 0 && (
            <div className="text-xs text-white/30 p-2 bg-white/[0.03] rounded-lg">
              {form.fixtures.length} fixtures generated
            </div>
          )}
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
