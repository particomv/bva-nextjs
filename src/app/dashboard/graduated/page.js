'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import { GraduationCap, Search, RotateCcw, Loader2 } from 'lucide-react';

export default function GraduatedPage() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [restoring, setRestoring] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [pRes, tRes] = await Promise.all([
      supabase.from('players').select('*').in('status', ['graduated', 'inactive', 'transferred', 'discontinued']).order('name'),
      supabase.from('teams').select('*'),
    ]);
    setPlayers(pRes.data || []);
    setTeams(tRes.data || []);
    setLoading(false);
  }

  async function restorePlayer(id) {
    if (!confirm('Restore this player to active status?')) return;
    setRestoring(id);
    await supabase.from('players').update({ status: 'active' }).eq('id', id);
    setRestoring(null);
    loadData();
  }

  const filtered = players.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <LoadingSpinner text="Loading..." />;

  // Group by status
  const grouped = {};
  filtered.forEach(p => {
    const st = p.status || 'inactive';
    if (!grouped[st]) grouped[st] = [];
    grouped[st].push(p);
  });

  const statusLabels = {
    graduated: { label: 'Graduated', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    transferred: { label: 'Transferred', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    discontinued: { label: 'Discontinued', color: 'text-red-400', bg: 'bg-red-500/10' },
    inactive: { label: 'Inactive', color: 'text-white/40', bg: 'bg-white/[0.04]' },
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Graduated / Archive</h2>
          <p className="text-sm text-white/40 mt-1">{players.length} players</p>
        </div>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none placeholder:text-white/20" />
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20">
          <GraduationCap className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No archived players</p>
        </div>
      ) : (
        Object.entries(grouped).map(([status, list]) => {
          const sl = statusLabels[status] || statusLabels.inactive;
          return (
            <div key={status} className="mb-6">
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${sl.color}`}>{sl.label} ({list.length})</h3>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                {list.map((p, i) => {
                  const team = teams.find(t => t.id == p.team_id);
                  return (
                    <div key={p.id} className={`flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] ${i > 0 ? 'border-t border-white/[0.04]' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/40 text-xs font-bold">
                          {p.jersey_number || '#'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white/70">{p.name}</p>
                          <p className="text-[10px] text-white/25">{team?.name || ''} {p.position ? `• ${p.position}` : ''}</p>
                        </div>
                      </div>
                      <button onClick={() => restorePlayer(p.id)} disabled={restoring === p.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.04] text-white/30 text-xs hover:text-emerald-400 hover:bg-emerald-500/10 transition-all">
                        {restoring === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                        Restore
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
