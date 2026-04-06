'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

  useEffect(() => { loadData(); }, []);
  async function loadData() { setLoading(true); const [eRes, sRes, mRes] = await Promise.all([supabase.from('events').select('*'), supabase.from('schedules').select('*'), supabase.from('matches').select('*')]); setEvents(eRes.data || []); setSchedules(sRes.data || []); setMatches(mRes.data || []); setLoading(false); }

  function changeMonth(offset) { let m = month + offset; let y = year; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } setMonth(m); setYear(y); }
  function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
  function getFirstDay(y, m) { return new Date(y, m, 1).getDay(); }

  if (loading) return <LoadingSpinner text="Loading calendar..." />;

  const days = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  function getEventsForDay(day) {
    const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    const dayEvents = events.filter(e => e.date === dateStr);
    const dayMatches = matches.filter(m => m.date === dateStr);
    const dayName = new Date(year, month, day).toLocaleDateString('en-US', { weekday: 'long' });
    const daySchedules = schedules.filter(s => s.day_of_week === dayName);
    return [...dayEvents.map(e => ({ type: 'event', name: e.name })), ...dayMatches.map(m => ({ type: 'match', name: (m.team_a || 'Blues') + ' vs ' + (m.team_b || '?') })), ...daySchedules.map(s => ({ type: 'schedule', name: s.title || 'Training' }))];
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-xl bg-white/[0.06] text-white/60 hover:bg-white/[0.1]"><ChevronLeft className="w-5 h-5" /></button>
        <h2 className="text-lg font-bold text-white">{monthName}</h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-xl bg-white/[0.06] text-white/60 hover:bg-white/[0.1]"><ChevronRight className="w-5 h-5" /></button>
      </div>
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-7 text-center text-[10px] text-white/30 uppercase tracking-wider py-2 border-b border-white/[0.04]">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => <div key={'e' + i} className="p-2 min-h-[70px]" />)}
          {Array.from({ length: days }).map((_, i) => {
            const day = i + 1;
            const isToday = isCurrentMonth && today.getDate() === day;
            const dayEvents = getEventsForDay(day);
            return (
              <div key={day} className={`p-1.5 min-h-[70px] border-t border-l border-white/[0.03] ${isToday ? 'bg-[#4F9CF9]/[0.06]' : ''}`}>
                <span className={`text-xs font-medium ${isToday ? 'text-[#4F9CF9] font-bold' : 'text-white/50'}`}>{day}</span>
                <div className="mt-0.5 space-y-0.5">
                  {dayEvents.slice(0, 2).map((e, ei) => (
                    <div key={ei} className={`text-[8px] px-1 py-0.5 rounded truncate ${e.type === 'match' ? 'bg-amber-500/15 text-amber-400' : e.type === 'event' ? 'bg-purple-500/15 text-purple-400' : 'bg-[#4F9CF9]/10 text-[#4F9CF9]'}`}>{e.name}</div>
                  ))}
                  {dayEvents.length > 2 && <div className="text-[8px] text-white/20">+{dayEvents.length - 2} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}