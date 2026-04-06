'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import { CreditCard, Search } from 'lucide-react';

export default function IdCardsPage() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadData(); }, []);
  async function loadData() { setLoading(true); const [pRes, tRes] = await Promise.all([supabase.from('players').select('*').eq('status', 'active').order('name'), supabase.from('teams').select('*')]); setPlayers(pRes.data || []); setTeams(tRes.data || []); setLoading(false); }

  const filtered = players.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()));
  if (loading) return <LoadingSpinner text="Loading..." />;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6"><div><h2 className="text-xl font-bold text-white">Player ID Cards</h2><p className="text-sm text-white/40 mt-1">{players.length} active players</p></div></div>
      <div className="relative mb-5"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" /><input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none placeholder:text-white/20" /></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => {
          const team = teams.find(t => t.id == p.team_id);
          return (
            <div key={p.id} className="bg-gradient-to-br from-[#0a1628] to-[#0d1f3c] border border-[#4F9CF9]/20 rounded-2xl overflow-hidden shadow-lg">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center text-[10px] font-bold text-white">🏐</div><span className="text-[10px] font-bold text-white uppercase tracking-wider">Blues Academy</span></div>
                <span className="text-[8px] text-white/60 font-bold uppercase tracking-widest">Player ID</span>
              </div>
              {/* Body */}
              <div className="p-4 flex gap-4">
                <div className="w-16 h-20 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-2xl font-black text-white/20 flex-shrink-0">
                  {p.jersey_number || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{p.name}</h3>
                  <p className="text-[10px] text-[#4F9CF9] font-semibold mt-0.5">{p.position || 'Player'}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[9px]"><span className="text-white/30">Team</span><span className="text-white/60">{team?.name || '-'}</span></div>
                    <div className="flex justify-between text-[9px]"><span className="text-white/30">Jersey</span><span className="text-white/60">#{p.jersey_number || '-'}</span></div>
                    <div className="flex justify-between text-[9px]"><span className="text-white/30">DOB</span><span className="text-white/60">{p.date_of_birth || '-'}</span></div>
                  </div>
                </div>
              </div>
              {/* Footer */}
              <div className="px-4 py-2 bg-white/[0.02] border-t border-white/[0.04] flex justify-between items-center">
                <span className="text-[8px] text-white/20">Police Club MPS</span>
                <span className="text-[8px] text-white/20">ID: BVA-{String(p.id).padStart(4, '0')}</span>
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && <div className="text-center py-16 text-white/30 text-sm">No players found</div>}
    </div>
  );
}