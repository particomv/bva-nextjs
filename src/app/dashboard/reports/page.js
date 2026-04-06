'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import { BarChart3, Users, Calendar, CreditCard, Trophy, TrendingUp, Download } from 'lucide-react';

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [players, teams, attendance, payments, matches, coaches, equipment, badges, medical] = await Promise.all([
      supabase.from('players').select('*'),
      supabase.from('teams').select('*'),
      supabase.from('attendance').select('*'),
      supabase.from('payments').select('*'),
      supabase.from('matches').select('*'),
      supabase.from('coaches').select('*'),
      supabase.from('equipment').select('*'),
      supabase.from('badges').select('*'),
      supabase.from('medical_log').select('*'),
    ]);
    setData({
      players: players.data || [], teams: teams.data || [],
      attendance: attendance.data || [], payments: payments.data || [],
      matches: matches.data || [], coaches: coaches.data || [],
      equipment: equipment.data || [], badges: badges.data || [],
      medical: medical.data || [],
    });
    setLoading(false);
  }

  if (loading || !data) return <LoadingSpinner text="Generating reports..." />;

  const activePlayers = data.players.filter(p => p.status === 'active');
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthPayments = data.payments.filter(p => p.month === currentMonth);
  const paidThisMonth = monthPayments.filter(p => p.status === 'paid').length;
  const totalMatches = data.matches.length;
  const wins = data.matches.filter(m => m.result === 'win').length;
  const winRate = totalMatches > 0 ? Math.round(wins / totalMatches * 100) : 0;

  // Attendance rate last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentAtt = data.attendance.filter(a => new Date(a.dt) >= thirtyDaysAgo);
  const presentCount = recentAtt.filter(a => a.st === 'present' || a.st === 'late').length;
  const attRate = recentAtt.length > 0 ? Math.round(presentCount / recentAtt.length * 100) : 0;

  // Position distribution
  const positions = {};
  activePlayers.forEach(p => { const pos = p.position || 'Unassigned'; positions[pos] = (positions[pos] || 0) + 1; });

  // Team sizes
  const teamSizes = data.teams.map(t => ({
    name: t.name,
    count: activePlayers.filter(p => p.team_id == t.id).length,
  }));

  // Monthly payment trend (last 6 months)
  const paymentTrend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.toISOString().slice(0, 7);
    const mp = data.payments.filter(p => p.month === m);
    paymentTrend.push({
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      paid: mp.filter(p => p.status === 'paid').length,
      total: activePlayers.length,
    });
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Reports & Analytics</h2>
          <p className="text-sm text-white/40 mt-1">Academy performance overview</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {['overview', 'attendance', 'payments', 'performance'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              tab === t ? 'bg-[#4F9CF9]/15 text-[#4F9CF9] border border-[#4F9CF9]/25' : 'text-white/40 border border-transparent'
            }`}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Active Players', value: activePlayers.length, icon: Users, color: 'text-[#4F9CF9]', bg: 'bg-[#4F9CF9]/10' },
              { label: 'Attendance Rate', value: `${attRate}%`, icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Payment Rate', value: `${activePlayers.length > 0 ? Math.round(paidThisMonth / activePlayers.length * 100) : 0}%`, icon: CreditCard, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Win Rate', value: `${winRate}%`, icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            ].map(m => (
              <div key={m.label} className={`${m.bg} border border-white/[0.04] rounded-xl p-4`}>
                <m.icon className={`w-5 h-5 ${m.color} mb-2`} />
                <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Quick stats */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Team Distribution */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Team Distribution</h3>
              <div className="space-y-3">
                {teamSizes.map(t => (
                  <div key={t.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/60">{t.name}</span>
                      <span className="text-white/40">{t.count} players</span>
                    </div>
                    <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] rounded-full"
                        style={{ width: `${activePlayers.length > 0 ? (t.count / activePlayers.length * 100) : 0}%` }} />
                    </div>
                  </div>
                ))}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/40">Unassigned</span>
                    <span className="text-white/30">{activePlayers.filter(p => !p.team_id).length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Position Breakdown */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Position Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(positions).sort((a, b) => b[1] - a[1]).map(([pos, count]) => (
                  <div key={pos} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03]">
                    <span className="text-xs text-white/60">{pos}</span>
                    <span className="text-sm font-bold text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Trend */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Payment Trend (6 months)</h3>
              <div className="flex items-end gap-2 h-32">
                {paymentTrend.map(m => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-white/[0.04] rounded-t-md relative" style={{ height: '100%' }}>
                      <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#4F9CF9] to-[#22D3EE] rounded-t-md"
                        style={{ height: `${m.total > 0 ? (m.paid / m.total * 100) : 0}%` }} />
                    </div>
                    <span className="text-[9px] text-white/30">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Numbers */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Quick Numbers</h3>
              <div className="space-y-3">
                {[
                  { label: 'Total Coaches', value: data.coaches.length },
                  { label: 'Equipment Items', value: data.equipment.length },
                  { label: 'Badges Awarded', value: data.badges.length },
                  { label: 'Medical Records', value: data.medical.length },
                  { label: 'Active Injuries', value: data.medical.filter(m => m.status === 'active').length },
                  { label: 'Total Matches', value: totalMatches },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-white/40">{item.label}</span>
                    <span className="text-sm font-bold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'attendance' && <AttendanceReport data={data} />}
      {tab === 'payments' && <PaymentReport data={data} />}
      {tab === 'performance' && <PerformanceReport data={data} />}
    </div>
  );
}

function AttendanceReport({ data }) {
  const activePlayers = data.players.filter(p => p.status === 'active');
  const playerStats = activePlayers.map(p => {
    const records = data.attendance.filter(a => a.pid === p.id);
    const present = records.filter(a => a.st === 'present').length;
    const late = records.filter(a => a.st === 'late').length;
    const total = records.length;
    return { ...p, present, late, total, rate: total > 0 ? Math.round((present + late) / total * 100) : 0 };
  }).sort((a, b) => b.rate - a.rate);

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[10px] text-white/30 uppercase tracking-wider">
            <th className="px-4 py-3">Player</th>
            <th className="px-4 py-3 text-center">Present</th>
            <th className="px-4 py-3 text-center">Late</th>
            <th className="px-4 py-3 text-center">Total</th>
            <th className="px-4 py-3 text-center">Rate</th>
          </tr></thead>
          <tbody>
            {playerStats.map((p, i) => (
              <tr key={p.id} className={`hover:bg-white/[0.03] ${i > 0 ? 'border-t border-white/[0.04]' : ''}`}>
                <td className="px-4 py-2.5 font-medium text-white">{p.name}</td>
                <td className="px-4 py-2.5 text-center text-emerald-400">{p.present}</td>
                <td className="px-4 py-2.5 text-center text-amber-400">{p.late}</td>
                <td className="px-4 py-2.5 text-center text-white/40">{p.total}</td>
                <td className="px-4 py-2.5 text-center">
                  <span className={`font-bold ${p.rate >= 80 ? 'text-emerald-400' : p.rate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{p.rate}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentReport({ data }) {
  const activePlayers = data.players.filter(p => p.status === 'active');
  const months = [...new Set(data.payments.map(p => p.month))].sort().reverse().slice(0, 6);

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[10px] text-white/30 uppercase tracking-wider">
            <th className="px-4 py-3">Month</th>
            <th className="px-4 py-3 text-center">Paid</th>
            <th className="px-4 py-3 text-center">Unpaid</th>
            <th className="px-4 py-3 text-center">Rate</th>
          </tr></thead>
          <tbody>
            {months.map((m, i) => {
              const mp = data.payments.filter(p => p.month === m);
              const paid = mp.filter(p => p.status === 'paid').length;
              return (
                <tr key={m} className={`hover:bg-white/[0.03] ${i > 0 ? 'border-t border-white/[0.04]' : ''}`}>
                  <td className="px-4 py-2.5 font-medium text-white">
                    {new Date(m + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-2.5 text-center text-emerald-400">{paid}</td>
                  <td className="px-4 py-2.5 text-center text-red-400">{activePlayers.length - paid}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="font-bold text-white">{activePlayers.length > 0 ? Math.round(paid / activePlayers.length * 100) : 0}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PerformanceReport({ data }) {
  const matches = data.matches.filter(m => m.result);
  const wins = matches.filter(m => m.result === 'win').length;
  const losses = matches.filter(m => m.result === 'loss').length;
  const draws = matches.filter(m => m.result === 'draw').length;

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-emerald-400">{wins}</p>
          <p className="text-[10px] text-white/40 uppercase mt-1">Wins</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-400">{losses}</p>
          <p className="text-[10px] text-white/40 uppercase mt-1">Losses</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-amber-400">{draws}</p>
          <p className="text-[10px] text-white/40 uppercase mt-1">Draws</p>
        </div>
      </div>
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[10px] text-white/30 uppercase tracking-wider">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Opponent</th>
              <th className="px-4 py-3 text-center">Score</th>
              <th className="px-4 py-3 text-center">Result</th>
            </tr></thead>
            <tbody>
              {data.matches.sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 20).map((m, i) => (
                <tr key={m.id} className={`hover:bg-white/[0.03] ${i > 0 ? 'border-t border-white/[0.04]' : ''}`}>
                  <td className="px-4 py-2.5 text-white/50">{m.date || 'TBD'}</td>
                  <td className="px-4 py-2.5 text-white font-medium">{m.team_b || 'Opponent'}</td>
                  <td className="px-4 py-2.5 text-center text-white/60">{m.score_a ?? '-'} : {m.score_b ?? '-'}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`text-xs font-bold ${
                      m.result === 'win' ? 'text-emerald-400' : m.result === 'loss' ? 'text-red-400' : 'text-amber-400'
                    }`}>{m.result ? m.result.toUpperCase() : '-'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
