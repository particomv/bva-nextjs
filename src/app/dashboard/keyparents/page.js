'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Users, Phone, Mail, Search, Send } from 'lucide-react';

export default function KeyParentsPage() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTeam, setFilterTeam] = useState('all');

  useEffect(() => { loadData(); }, []);
  async function loadData() { setLoading(true); const [pRes, tRes] = await Promise.all([supabase.from('players').select('*').eq('status', 'active').order('name'), supabase.from('teams').select('*')]); setPlayers(pRes.data || []); setTeams(tRes.data || []); setLoading(false); }

  const filtered = players.filter(p => {
    if (filterTeam !== 'all' && p.team_id != filterTeam) return false;
    if (search && !p.name?.toLowerCase().includes(search.toLowerCase()) && !p.parent_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).filter(p => p.parent_name || p.parent_phone);

  if (loading) return <LoadingSpinner text="Loading..." />;
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6"><h2 className="text-xl font-bold text-white">Key Parents</h2><p className="text-sm text-white/40 mt-1">{filtered.length} parent contacts</p></div>
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[180px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" /><input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none placeholder:text-white/20" /></div>
        <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)} className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white/70 outline-none"><option value="all">All Teams</option>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
      </div>
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
        {filtered.map((p, i) => {
          const team = teams.find(t => t.id == p.team_id);
          return (
            <div key={p.id} className={`flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] ${i > 0 ? 'border-t border-white/[0.04]' : ''}`}>
              <div>
                <p className="text-sm font-semibold text-white">{p.parent_name || 'Parent'}</p>
                <p className="text-[10px] text-white/30">Child: {p.name} · {team?.name || ''}</p>
              </div>
              <div className="flex items-center gap-2">
                {p.parent_phone && <a href={'tel:' + p.parent_phone} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] text-xs text-white/40 hover:text-[#4F9CF9]"><Phone className="w-3 h-3" />{p.parent_phone}</a>}
                {p.parent_phone && <a href={'https://wa.me/960' + (p.parent_phone || '').replace(/[^0-9]/g, '')} target="_blank" className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400"><Send className="w-3 h-3" /></a>}
                {p.parent_email && <a href={'mailto:' + p.parent_email} className="p-1.5 rounded-lg bg-white/[0.04] text-white/30 hover:text-[#4F9CF9]"><Mail className="w-3 h-3" /></a>}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center py-12 text-white/30 text-sm">No parent contacts found</div>}
      </div>
    </div>
  );
}