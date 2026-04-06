'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import StatsCard from '@/components/StatsCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Users, ClipboardList, UserCheck, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentPlayers, setRecentPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [
          { count: playerCount },
          { count: teamCount },
          { count: coachCount },
          { data: players },
          { count: attendanceCount },
        ] = await Promise.all([
          supabase.from('players').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('teams').select('*', { count: 'exact', head: true }),
          supabase.from('coaches').select('*', { count: 'exact', head: true }),
          supabase.from('players').select('id, name, jersey_number, team_id, status, created_at').eq('status', 'active').order('created_at', { ascending: false }).limit(5),
          supabase.from('attendance').select('*', { count: 'exact', head: true }),
        ]);
        setStats({ players: playerCount || 0, teams: teamCount || 0, coaches: coachCount || 0, attendance: attendanceCount || 0 });
        setRecentPlayers(players || []);
      } catch (err) { console.error('Dashboard error:', err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 style={{fontFamily:'Outfit,system-ui'}} className="text-2xl font-bold text-white">Welcome back, {user?.name}</h1>
        <p className="text-white/40 text-sm mt-1">Here&apos;s your academy overview</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 stagger-children">
        <StatsCard icon={Users} label="Active Players" value={stats.players} sub="Across all teams" color="text-navy-300" />
        <StatsCard icon={ClipboardList} label="Teams" value={stats.teams} sub="Fulhangi, Surumuthi..." color="text-accent-gold" />
        <StatsCard icon={UserCheck} label="Coaches" value={stats.coaches} sub="Active coaching staff" color="text-accent-emerald" />
        <StatsCard icon={Calendar} label="Attendance Records" value={stats.attendance} sub="Total entries" color="text-purple-400" />
      </div>
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h2 style={{fontFamily:'Outfit,system-ui'}} className="font-semibold text-white text-sm">Recent Players</h2>
          <a href="/dashboard/players" className="text-xs text-navy-300 hover:text-navy-200">View all &rarr;</a>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {recentPlayers.map(player => (
            <div key={player.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-navy-600/50 flex items-center justify-center text-sm font-bold text-white/70" style={{fontFamily:'Outfit,system-ui'}}>
                  {player.jersey_number || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{player.name}</p>
                  <p className="text-xs text-white/30">#{player.jersey_number}</p>
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-accent-emerald bg-accent-emerald/10 px-2 py-1 rounded-full">Active</span>
            </div>
          ))}
          {recentPlayers.length === 0 && <div className="px-5 py-8 text-center text-white/30 text-sm">No players found</div>}
        </div>
      </div>
    </div>
  );
}
