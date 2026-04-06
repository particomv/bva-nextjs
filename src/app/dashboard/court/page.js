'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import { RotateCcw, Save, Loader2, Download, ChevronDown } from 'lucide-react';

const ZONES = [
  { k: 'z4', x: 18, y: 30, label: '4' }, { k: 'z3', x: 50, y: 30, label: '3' }, { k: 'z2', x: 82, y: 30, label: '2' },
  { k: 'z5', x: 18, y: 70, label: '5' }, { k: 'z6', x: 50, y: 70, label: '6' }, { k: 'z1', x: 82, y: 70, label: '1' },
];
const POS_COLORS = { setter: '#fbbf24', outside: '#3b82f6', middle: '#f97316', opposite: '#ef4444', libero: '#22c55e', default: '#4F9CF9' };
function getColor(pos) { const p = (pos || '').toLowerCase(); if (p.includes('setter')) return POS_COLORS.setter; if (p.includes('outside') || p.includes('oh')) return POS_COLORS.outside; if (p.includes('middle') || p.includes('mb')) return POS_COLORS.middle; if (p.includes('opposite') || p.includes('opp')) return POS_COLORS.opposite; if (p.includes('libero') || p.includes('lib')) return POS_COLORS.libero; return POS_COLORS.default; }

export default function CourtPage() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState('');
  const [lineup, setLineup] = useState({ z1: null, z2: null, z3: null, z4: null, z5: null, z6: null });
  const [rotation, setRotation] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [tab, setTab] = useState('builder');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);
  async function loadData() { setLoading(true); const [pRes, tRes] = await Promise.all([supabase.from('players').select('*').eq('status', 'active').order('name'), supabase.from('teams').select('*')]); setPlayers(pRes.data || []); setTeams(tRes.data || []); if (tRes.data?.length) setTeam(tRes.data[0].id); setLoading(false); }

  const teamPlayers = players.filter(p => p.team_id == team);
  const onCourt = Object.values(lineup).filter(Boolean);
  const bench = teamPlayers.filter(p => !onCourt.includes(p.id));

  function assignToZone(zone) {
    if (!selectedPlayer) return;
    // Remove player from any existing zone
    const newLineup = { ...lineup };
    Object.keys(newLineup).forEach(k => { if (newLineup[k] === selectedPlayer) newLineup[k] = null; });
    // Swap if zone already occupied
    const existing = newLineup[zone];
    newLineup[zone] = selectedPlayer;
    setLineup(newLineup);
    setSelectedPlayer(null);
  }

  function removeFromZone(zone) { setLineup(prev => ({ ...prev, [zone]: null })); }

  function rotate() {
    setLineup(prev => ({ z1: prev.z6, z2: prev.z1, z3: prev.z2, z4: prev.z3, z5: prev.z4, z6: prev.z5 }));
    setRotation(r => r >= 6 ? 1 : r + 1);
  }

  function clearAll() { setLineup({ z1: null, z2: null, z3: null, z4: null, z5: null, z6: null }); setRotation(1); }

  async function saveLineup() {
    setSaving(true);
    await supabase.from('lineups').upsert({ team_id: parseInt(team), lineup, rotation, updated_at: new Date().toISOString() }, { onConflict: 'team_id' });
    setSaving(false); alert('Lineup saved!');
  }

  function getPlayer(id) { return players.find(p => p.id === id); }

  if (loading) return <LoadingSpinner text="Loading court..." />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div><h2 className="text-xl font-bold text-white">Court Manager</h2><p className="text-sm text-white/40 mt-1">Drag players to court positions</p></div>
        <select value={team} onChange={e => { setTeam(e.target.value); clearAll(); }} className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white outline-none">
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {['builder', 'rotations'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-semibold ${tab === t ? 'bg-[#4F9CF9]/15 text-[#4F9CF9] border border-[#4F9CF9]/25' : 'text-white/40 border border-transparent'}`}>
            {t === 'builder' ? 'Lineup Builder' : 'Rotations'}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Court */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-b from-emerald-900/40 to-emerald-950/60 border border-emerald-500/20 rounded-2xl p-4 relative" style={{ aspectRatio: '1.4' }}>
            {/* Net line */}
            <div className="absolute left-0 right-0 top-[33%] h-[3px] bg-white/20 z-10" />
            <div className="absolute left-1/2 -translate-x-1/2 top-[33%] -translate-y-1/2 bg-white/10 text-white/30 text-[9px] px-2 py-0.5 rounded-full z-20 font-bold">NET</div>

            {/* Rotation indicator */}
            <div className="absolute top-3 left-3 text-[10px] text-white/30 font-bold">R{rotation}</div>

            {/* Zones */}
            {ZONES.map(zone => {
              const player = getPlayer(lineup[zone.k]);
              const color = player ? getColor(player.position) : 'rgba(255,255,255,0.1)';
              return (
                <div key={zone.k} onClick={() => player ? removeFromZone(zone.k) : assignToZone(zone.k)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110 ${selectedPlayer ? 'animate-pulse' : ''}`}
                  style={{ left: `${zone.x}%`, top: `${zone.y}%` }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 shadow-lg"
                    style={{ background: player ? `${color}33` : 'rgba(255,255,255,0.05)', borderColor: player ? color : 'rgba(255,255,255,0.15)' }}>
                    {player ? (player.jersey_number || '?') : zone.label}
                  </div>
                  {player && <p className="text-[9px] text-white/60 text-center mt-1 font-medium">{player.name?.split(' ')[0]}</p>}
                  {!player && <p className="text-[8px] text-white/20 text-center mt-1">Zone {zone.label}</p>}
                </div>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex gap-2 mt-3">
            <button onClick={rotate} className="flex-1 py-2.5 rounded-xl bg-[#4F9CF9]/10 text-[#4F9CF9] text-sm font-semibold border border-[#4F9CF9]/20 flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" /> Rotate (R{rotation})</button>
            <button onClick={clearAll} className="px-4 py-2.5 rounded-xl bg-white/[0.06] text-white/40 text-sm font-semibold">Clear</button>
            <button onClick={saveLineup} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
            </button>
          </div>
        </div>

        {/* Bench */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 max-h-[500px] overflow-y-auto">
          <h3 className="text-xs font-bold text-white/30 uppercase tracking-wider mb-3">Bench ({bench.length})</h3>
          <p className="text-[10px] text-white/15 mb-3">Tap a player, then tap a zone on court</p>
          <div className="space-y-1.5">
            {bench.map(p => (
              <button key={p.id} onClick={() => setSelectedPlayer(selectedPlayer === p.id ? null : p.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all ${selectedPlayer === p.id ? 'bg-[#4F9CF9]/15 border border-[#4F9CF9]/30 ring-1 ring-[#4F9CF9]/20' : 'bg-white/[0.03] border border-transparent hover:bg-white/[0.06]'}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border" style={{ borderColor: getColor(p.position), color: getColor(p.position), background: `${getColor(p.position)}15` }}>
                  {p.jersey_number || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{p.name}</p>
                  <p className="text-[9px] text-white/25">{p.position || 'Player'}</p>
                </div>
              </button>
            ))}
            {bench.length === 0 && <p className="text-xs text-white/15 text-center py-4">All players on court</p>}
          </div>

          {/* On Court Summary */}
          {onCourt.length > 0 && (
            <div className="mt-4 pt-3 border-t border-white/[0.04]">
              <h4 className="text-[9px] text-white/20 uppercase tracking-wider mb-2">On Court ({onCourt.length}/6)</h4>
              <div className="flex flex-wrap gap-1">
                {onCourt.map(id => { const p = getPlayer(id); return p ? (
                  <span key={id} className="text-[9px] px-2 py-0.5 rounded-md bg-white/[0.04] text-white/40">#{p.jersey_number} {p.name?.split(' ')[0]}</span>
                ) : null; })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rotations Tab */}
      {tab === 'rotations' && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(r => {
            let rot = { ...lineup };
            for (let i = 1; i < r; i++) { rot = { z1: rot.z6, z2: rot.z1, z3: rot.z2, z4: rot.z3, z5: rot.z4, z6: rot.z5 }; }
            return (
              <div key={r} className={`bg-white/[0.03] border rounded-xl p-3 ${r === rotation ? 'border-[#4F9CF9]/30' : 'border-white/[0.06]'}`}>
                <p className="text-[10px] font-bold text-white/40 mb-2">Rotation {r}</p>
                <div className="grid grid-cols-3 gap-1 text-center">
                  {['z4','z3','z2','z5','z6','z1'].map(zk => {
                    const p = getPlayer(rot[zk]);
                    return <div key={zk} className="text-[9px] py-1 rounded bg-white/[0.04] text-white/40">{p ? `#${p.jersey_number || '?'}` : '-'}</div>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}