'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ClipboardList, Search, Check, X, Eye } from 'lucide-react';

export default function ApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { loadData(); }, []);
  async function loadData() { setLoading(true); const [aRes, tRes] = await Promise.all([supabase.from('applications').select('*').order('created_at', { ascending: false }), supabase.from('teams').select('*')]); setApps(aRes.data || []); setTeams(tRes.data || []); setLoading(false); }
  async function updateStatus(id, status) { await supabase.from('applications').update({ status }).eq('id', id); loadData(); }

  const filtered = apps.filter(a => { if (filter !== 'all' && a.status !== filter) return false; if (search && !a.player_name?.toLowerCase().includes(search.toLowerCase())) return false; return true; });
  const counts = { all: apps.length, pending: apps.filter(a => a.status === 'pending' || a.status === 'paid_review').length, approved: apps.filter(a => a.status === 'approved').length, rejected: apps.filter(a => a.status === 'rejected').length };

  if (loading) return <LoadingSpinner text="Loading applications..." />;
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6"><h2 className="text-xl font-bold text-white">Applications</h2><p className="text-sm text-white/40 mt-1">{apps.length} total</p></div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${filter === f ? 'bg-[#4F9CF9]/15 text-[#4F9CF9] border border-[#4F9CF9]/25' : 'text-white/40 border border-transparent'}`}>{f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f] || 0})</button>
        ))}
      </div>
      <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" /><input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none placeholder:text-white/20" /></div>
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-[10px] text-white/30 uppercase tracking-wider"><th className="px-4 py-3 text-left">Player</th><th className="px-4 py-3 text-left">Parent</th><th className="px-4 py-3">Gender</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={a.id} className={`hover:bg-white/[0.03] ${i > 0 ? 'border-t border-white/[0.04]' : ''}`}>
                  <td className="px-4 py-2.5 font-semibold text-white">{a.player_name}</td>
                  <td className="px-4 py-2.5 text-white/50">{a.parent_name}<br /><span className="text-[10px] text-white/25">{a.parent_phone}</span></td>
                  <td className="px-4 py-2.5 text-center text-white/40">{a.gender}</td>
                  <td className="px-4 py-2.5 text-center text-white/40 text-xs">{a.date || ''}</td>
                  <td className="px-4 py-2.5 text-center"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' : a.status === 'rejected' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>{a.status}</span></td>
                  <td className="px-4 py-2.5 text-center">
                    {(a.status === 'pending' || a.status === 'paid_review') && (<div className="flex gap-1 justify-center">
                      <button onClick={() => updateStatus(a.id, 'approved')} className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={() => updateStatus(a.id, 'rejected')} className="p-1 rounded-lg bg-red-500/10 text-red-400"><X className="w-3.5 h-3.5" /></button>
                    </div>)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-white/30 text-sm">No applications found</div>}
      </div>
    </div>
  );
}