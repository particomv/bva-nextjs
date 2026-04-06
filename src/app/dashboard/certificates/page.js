'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Award, Download, Loader2 } from 'lucide-react';

export default function CertificatesPage() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [certType, setCertType] = useState('completion');
  const [preview, setPreview] = useState(false);

  useEffect(() => { loadData(); }, []);
  async function loadData() { setLoading(true); const [pRes, tRes] = await Promise.all([supabase.from('players').select('*').order('name'), supabase.from('teams').select('*')]); setPlayers(pRes.data || []); setTeams(tRes.data || []); setLoading(false); }

  const player = players.find(p => p.id == selectedPlayer);
  const team = player ? teams.find(t => t.id == player.team_id) : null;
  const certTypes = [
    { value: 'completion', label: 'Training Completion', desc: 'Completed the training program' },
    { value: 'achievement', label: 'Achievement Award', desc: 'Outstanding performance' },
    { value: 'participation', label: 'Participation', desc: 'Active participation in academy' },
    { value: 'mvp', label: 'MVP Award', desc: 'Most Valuable Player' },
  ];

  if (loading) return <LoadingSpinner text="Loading..." />;
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6"><h2 className="text-xl font-bold text-white">Certificates</h2><p className="text-sm text-white/40 mt-1">Generate player certificates</p></div>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Player</label><select value={selectedPlayer} onChange={e => setSelectedPlayer(e.target.value)} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none"><option value="">Select player</option>{players.map(p => <option key={p.id} value={p.id}>#{p.jersey_number || '?'} {p.name}</option>)}</select></div>
        <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Certificate Type</label><select value={certType} onChange={e => setCertType(e.target.value)} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none">{certTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
      </div>
      {selectedPlayer && <button onClick={() => setPreview(true)} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold mb-6">Generate Preview</button>}
      {preview && player && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-amber-500/30 rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
          <div className="text-4xl mb-3">🏆</div>
          <p className="text-[10px] text-amber-400 uppercase tracking-[4px] font-bold mb-1">Blues for Volleyball Academy</p>
          <p className="text-[9px] text-white/30 uppercase tracking-wider mb-6">Police Club — Maldives Police Service</p>
          <h2 className="text-2xl font-black text-white mb-1">{certTypes.find(t => t.value === certType)?.label}</h2>
          <p className="text-xs text-white/40 mb-6">{certTypes.find(t => t.value === certType)?.desc}</p>
          <p className="text-sm text-white/30 mb-1">Awarded to</p>
          <h1 className="text-3xl font-black text-amber-400 mb-1">{player.name}</h1>
          <p className="text-xs text-white/40">{team?.name || ''} · #{player.jersey_number || ''} · {player.position || 'Player'}</p>
          <div className="mt-8 pt-6 border-t border-white/[0.06] flex justify-between items-end px-8">
            <div className="text-center"><div className="w-24 border-b border-white/20 mb-1" /><p className="text-[9px] text-white/30">Head Coach</p></div>
            <p className="text-[10px] text-white/20">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            <div className="text-center"><div className="w-24 border-b border-white/20 mb-1" /><p className="text-[9px] text-white/30">Academy Director</p></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
        </div>
      )}
      {!selectedPlayer && <div className="text-center py-20"><Award className="w-12 h-12 text-white/10 mx-auto mb-3" /><p className="text-white/30 text-sm">Select a player to generate a certificate</p></div>}
    </div>
  );
}