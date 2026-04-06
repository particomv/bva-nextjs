'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  Calendar, Check, X, Clock, Users, ChevronLeft, ChevronRight,
  Save, Loader2, Filter, Download,
} from 'lucide-react';

export default function AttendancePage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterTeam, setFilterTeam] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [records, setRecords] = useState({});
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('morning');
  const [tab, setTab] = useState('mark'); // mark | history

  useEffect(() => { loadData(); }, []);
  useEffect(() => { loadAttendance(); }, [selectedDate]);

  async function loadData() {
    setLoading(true);
    const [pRes, tRes, sRes] = await Promise.all([
      supabase.from('players').select('*').eq('status', 'active').order('name'),
      supabase.from('teams').select('*').order('name'),
      supabase.from('schedules').select('*').order('day_of_week'),
    ]);
    setPlayers(pRes.data || []);
    setTeams(tRes.data || []);
    setSessions(sRes.data || []);
    setLoading(false);
  }

  async function loadAttendance() {
    const { data } = await supabase.from('attendance').select('*').eq('dt', selectedDate);
    if (data) {
      const map = {};
      data.forEach(a => { map[`${a.pid}-${a.sid || 'morning'}`] = a.st; });
      setRecords(map);
      setAttendance(data);
    }
  }

  function toggleStatus(playerId) {
    const key = `${playerId}-${selectedSession}`;
    const current = records[key] || 'absent';
    const next = current === 'present' ? 'late' : current === 'late' ? 'excused' : current === 'excused' ? 'absent' : 'present';
    setRecords(prev => ({ ...prev, [key]: next }));
  }

  function markAll(status) {
    const filtered = getFilteredPlayers();
    const newRecords = { ...records };
    filtered.forEach(p => { newRecords[`${p.id}-${selectedSession}`] = status; });
    setRecords(newRecords);
  }

  async function saveAttendance() {
    setSaving(true);
    const filtered = getFilteredPlayers();
    const rows = filtered.map(p => ({
      pid: p.id,
      nm: p.name,
      dt: selectedDate,
      st: records[`${p.id}-${selectedSession}`] || 'absent',
      sid: selectedSession,
    }));

    // Upsert - delete existing for this date/session, then insert
    await supabase.from('attendance').delete().eq('dt', selectedDate).eq('sid', selectedSession);
    const { error } = await supabase.from('attendance').insert(rows);
    setSaving(false);
    if (!error) {
      alert('Attendance saved!');
      loadAttendance();
    }
  }

  function getFilteredPlayers() {
    return players.filter(p => filterTeam === 'all' || p.team_id == filterTeam);
  }

  function getStats() {
    const filtered = getFilteredPlayers();
    let present = 0, late = 0, excused = 0, absent = 0;
    filtered.forEach(p => {
      const st = records[`${p.id}-${selectedSession}`] || 'absent';
      if (st === 'present') present++;
      else if (st === 'late') late++;
      else if (st === 'excused') excused++;
      else absent++;
    });
    return { present, late, excused, absent, total: filtered.length };
  }

  function changeDate(offset) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  }

  function getStatusColor(st) {
    if (st === 'present') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (st === 'late') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (st === 'excused') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  }

  function getStatusIcon(st) {
    if (st === 'present') return <Check className="w-4 h-4" />;
    if (st === 'late') return <Clock className="w-4 h-4" />;
    if (st === 'excused') return <Calendar className="w-4 h-4" />;
    return <X className="w-4 h-4" />;
  }

  if (loading) return <LoadingSpinner text="Loading attendance..." />;

  const stats = getStats();
  const filtered = getFilteredPlayers();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Attendance</h2>
          <p className="text-sm text-white/40 mt-1">Track daily training attendance</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {['mark', 'history'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t ? 'bg-[#4F9CF9]/15 text-[#4F9CF9] border border-[#4F9CF9]/25' : 'text-white/40 hover:text-white/60 border border-transparent'}`}>
            {t === 'mark' ? 'Mark Attendance' : 'History'}
          </button>
        ))}
      </div>

      {tab === 'mark' && (
        <>
          {/* Date Picker */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <button onClick={() => changeDate(-1)} className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/60">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-center">
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                  className="bg-transparent border-none text-white text-lg font-bold text-center cursor-pointer outline-none" />
                <p className="text-xs text-white/30 mt-1">
                  {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button onClick={() => changeDate(1)} className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/60">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white/70 outline-none">
              <option value="all">All Teams</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select value={selectedSession} onChange={e => setSelectedSession(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white/70 outline-none">
              <option value="morning">Morning Session</option>
              <option value="evening">Evening Session</option>
              <option value="special">Special Session</option>
            </select>
            <div className="flex gap-2 ml-auto">
              <button onClick={() => markAll('present')} className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 hover:bg-emerald-500/20">All Present</button>
              <button onClick={() => markAll('absent')} className="px-3 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-semibold border border-red-500/20 hover:bg-red-500/20">All Absent</button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Present', value: stats.present, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Late', value: stats.late, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Excused', value: stats.excused, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Absent', value: stats.absent, color: 'text-red-400', bg: 'bg-red-500/10' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center border border-white/[0.04]`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Player List */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden mb-4">
            {filtered.map((p, i) => {
              const key = `${p.id}-${selectedSession}`;
              const st = records[key] || 'absent';
              const team = teams.find(t => t.id == p.team_id);
              return (
                <div key={p.id} onClick={() => toggleStatus(p.id)}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.03] transition-all ${i > 0 ? 'border-t border-white/[0.04]' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/60 text-xs font-bold">
                      {p.jersey_number || '#'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{p.name}</p>
                      <p className="text-[10px] text-white/30">{team?.name || 'No team'} • {p.position || 'Player'}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${getStatusColor(st)}`}>
                    {getStatusIcon(st)}
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-white/30 text-sm">No players found</div>
            )}
          </div>

          {/* Save Button */}
          <button onClick={saveAttendance} disabled={saving}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#4F9CF9]/20 transition-all disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </>
      )}

      {tab === 'history' && <AttendanceHistory players={players} teams={teams} />}
    </div>
  );
}

function AttendanceHistory({ players, teams }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => { loadHistory(); }, [month]);

  async function loadHistory() {
    setLoading(true);
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;
    const { data } = await supabase.from('attendance').select('*')
      .gte('dt', startDate).lte('dt', endDate).order('dt', { ascending: false });
    setHistory(data || []);
    setLoading(false);
  }

  if (loading) return <LoadingSpinner text="Loading history..." />;

  // Group by date
  const byDate = {};
  history.forEach(a => {
    if (!byDate[a.dt]) byDate[a.dt] = [];
    byDate[a.dt].push(a);
  });

  return (
    <div>
      <div className="mb-4">
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white outline-none" />
      </div>
      {Object.keys(byDate).length === 0 && (
        <div className="text-center py-12 text-white/30 text-sm">No attendance records for this month</div>
      )}
      {Object.entries(byDate).sort((a, b) => b[0].localeCompare(a[0])).map(([date, records]) => {
        const present = records.filter(r => r.st === 'present').length;
        const total = records.length;
        return (
          <div key={date} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs text-white/30 mt-1">{records[0]?.sid || 'morning'} session</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-400">{present}/{total}</p>
                <p className="text-[10px] text-white/30">present</p>
              </div>
            </div>
            <div className="mt-3 h-2 bg-white/[0.04] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                style={{ width: `${total > 0 ? (present / total * 100) : 0}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
