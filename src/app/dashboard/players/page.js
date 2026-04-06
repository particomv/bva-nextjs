'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import PlayerModal from '@/components/PlayerModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Search, Plus, Edit3, Trash2, Users, ChevronDown, AlertCircle, UserX } from 'lucide-react';

const statusColors = {
  active: 'text-accent-emerald bg-accent-emerald/10',
  inactive: 'text-white/40 bg-white/[0.06]',
  injured: 'text-accent-coral bg-accent-coral/10',
  suspended: 'text-accent-gold bg-accent-gold/10',
};

export default function PlayersPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [{ data: p }, { data: t }] = await Promise.all([
        supabase.from('players').select('*').order('name'),
        supabase.from('teams').select('*').order('name'),
      ]);
      setPlayers(p || []);
      setTeams(t || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadData();
    const channel = supabase.channel('players-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadData]);

  const filtered = players.filter(p => {
    const s = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || String(p.jersey_number).includes(search);
    const t = !teamFilter || p.team_id === teamFilter;
    const st = !statusFilter || p.status === statusFilter;
    return s && t && st;
  });

  function getTeamName(id) { return teams.find(t => t.id === id)?.name || '\u2014'; }

  async function handleSave(data, playerId) {
    if (playerId) {
      const { error } = await supabase.from('players').update(data).eq('id', playerId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('players').insert([data]);
      if (error) throw error;
    }
    setShowModal(false); setEditingPlayer(null);
    await loadData();
  }

  async function handleDelete(id) {
    await supabase.from('players').delete().eq('id', id);
    setDeleteConfirm(null);
    await loadData();
  }

  if (loading) return <LoadingSpinner text="Loading players..." />;
  const isAdmin = user?.role === 'superadmin' || user?.role === 'admin';

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 style={{fontFamily:'Outfit,system-ui'}} className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-navy-300" /> Players
          </h1>
          <p className="text-sm text-white/40 mt-0.5">{filtered.length} of {players.length} players</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditingPlayer(null); setShowModal(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-navy-500 to-navy-600 text-white text-sm font-semibold hover:from-navy-400 hover:to-navy-500 shadow-lg shadow-navy-600/25"
            style={{fontFamily:'Outfit,system-ui'}}>
            <Plus className="w-4 h-4" /> Add Player
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm placeholder-white/25"
            placeholder="Search by name or jersey #..." />
        </div>
        <div className="relative">
          <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm min-w-[140px]">
            <option value="">All Teams</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm min-w-[130px]">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="injured">Injured</option>
            <option value="suspended">Suspended</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <UserX className="w-12 h-12 text-white/15 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No players found</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="hidden md:grid grid-cols-[3fr_1fr_2fr_1.5fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/[0.06] text-xs text-white/30 uppercase tracking-wider font-medium">
            <span>Player</span><span>Jersey</span><span>Team</span><span>Position</span><span>Status</span><span className="w-20">Actions</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {filtered.map(player => (
              <div key={player.id} className="px-5 py-3.5 flex flex-col md:grid md:grid-cols-[3fr_1fr_2fr_1.5fr_1fr_auto] md:items-center gap-2 md:gap-4 hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-navy-600/50 flex items-center justify-center text-sm font-bold text-white/60 shrink-0" style={{fontFamily:'Outfit,system-ui'}}>
                    {player.jersey_number || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{player.name}</p>
                    {player.phone && <p className="text-[11px] text-white/25">{player.phone}</p>}
                  </div>
                </div>
                <span className="text-sm text-white/50 hidden md:block">#{player.jersey_number || '\u2014'}</span>
                <span className="text-sm text-white/50 hidden md:block">{getTeamName(player.team_id)}</span>
                <span className="text-sm text-white/40 hidden md:block">{player.position || '\u2014'}</span>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full w-fit font-medium ${statusColors[player.status] || statusColors.active}`}>
                  {player.status || 'active'}
                </span>
                {isAdmin && (
                  <div className="flex items-center gap-1 w-20 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingPlayer(player); setShowModal(true); }}
                      className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06]"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteConfirm(player)}
                      className="p-2 rounded-lg text-white/30 hover:text-accent-coral hover:bg-accent-coral/10"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 md:hidden text-xs text-white/30">
                  <span>#{player.jersey_number || '\u2014'}</span><span>\u00b7</span>
                  <span>{getTeamName(player.team_id)}</span><span>\u00b7</span>
                  <span>{player.position || 'No position'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && <PlayerModal player={editingPlayer} teams={teams} onSave={handleSave} onClose={() => { setShowModal(false); setEditingPlayer(null); }} />}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="w-full max-w-sm glass rounded-2xl p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent-coral/10 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-accent-coral" /></div>
              <div>
                <h3 style={{fontFamily:'Outfit,system-ui'}} className="font-semibold text-white text-sm">Delete Player</h3>
                <p className="text-xs text-white/40">This cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-white/60 mb-5">Are you sure you want to delete <strong className="text-white">{deleteConfirm.name}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-white/60 text-sm font-medium hover:bg-white/[0.1]">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 py-2.5 rounded-xl bg-accent-coral text-white text-sm font-semibold hover:bg-accent-coral/80" style={{fontFamily:'Outfit,system-ui'}}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
