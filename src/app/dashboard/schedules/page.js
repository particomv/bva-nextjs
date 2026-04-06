'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import { CalendarDays, Plus, Edit3, Trash2, Save, Loader2, X, Clock, MapPin } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.from('schedules').select('*').order('day_of_week');
    setSchedules(data || []);
    setLoading(false);
  }

  async function saveSchedule(data) {
    if (editing) {
      await supabase.from('schedules').update(data).eq('id', editing.id);
    } else {
      await supabase.from('schedules').insert(data);
    }
    setShowModal(false); setEditing(null); loadData();
  }

  async function deleteSchedule(id) {
    if (!confirm('Delete this schedule?')) return;
    await supabase.from('schedules').delete().eq('id', id);
    loadData();
  }

  if (loading) return <LoadingSpinner text="Loading schedules..." />;

  const byDay = {};
  DAYS.forEach(d => { byDay[d] = schedules.filter(s => s.day_of_week === d); });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Training Schedule</h2>
          <p className="text-sm text-white/40 mt-1">Weekly training sessions</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold">
          <Plus className="w-4 h-4" /> Add Session
        </button>
      </div>

      <div className="grid gap-3">
        {DAYS.map(day => {
          const daySessions = byDay[day];
          const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;
          return (
            <div key={day} className={`bg-white/[0.03] border rounded-2xl p-4 ${isToday ? 'border-[#4F9CF9]/30 bg-[#4F9CF9]/[0.03]' : 'border-white/[0.06]'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-bold ${isToday ? 'text-[#4F9CF9]' : 'text-white/70'}`}>{day}</h3>
                  {isToday && <span className="text-[9px] bg-[#4F9CF9]/15 text-[#4F9CF9] px-2 py-0.5 rounded-full font-bold">TODAY</span>}
                </div>
                <span className="text-[11px] text-white/25">{daySessions.length} session(s)</span>
              </div>
              {daySessions.length === 0 ? (
                <p className="text-xs text-white/15 italic">No sessions scheduled</p>
              ) : (
                <div className="space-y-2">
                  {daySessions.map(s => (
                    <div key={s.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs text-white/50">
                          <Clock className="w-3 h-3" /> {s.start_time} - {s.end_time}
                        </div>
                        <span className="text-sm text-white font-medium">{s.title || 'Training'}</span>
                        {s.venue && <span className="flex items-center gap-1 text-[10px] text-white/25"><MapPin className="w-3 h-3" />{s.venue}</span>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditing(s); setShowModal(true); }} className="p-1.5 rounded-lg text-white/20 hover:text-[#4F9CF9]">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteSchedule(s.id)} className="p-1.5 rounded-lg text-white/20 hover:text-red-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={() => { setShowModal(false); setEditing(null); }}>
          <div className="bg-[#0a0e17] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <ScheduleForm schedule={editing} onSave={saveSchedule} onClose={() => { setShowModal(false); setEditing(null); }} />
          </div>
        </div>
      )}
    </div>
  );
}

function ScheduleForm({ schedule, onSave, onClose }) {
  const [form, setForm] = useState({
    day_of_week: schedule?.day_of_week || 'Monday',
    start_time: schedule?.start_time || '06:00',
    end_time: schedule?.end_time || '08:00',
    title: schedule?.title || 'Training',
    venue: schedule?.venue || '',
    notes: schedule?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-white">{schedule ? 'Edit Session' : 'New Session'}</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg bg-white/[0.06] text-white/40"><X className="w-4 h-4" /></button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Day</label>
          <select value={form.day_of_week} onChange={e => setForm({...form, day_of_week: e.target.value})}
            className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none">
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Title</label>
          <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
            className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Start</label>
            <input type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})}
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">End</label>
            <input type="time" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})}
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Venue</label>
          <input type="text" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})}
            className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-white/50 text-sm">Cancel</button>
        <button onClick={handleSave} disabled={saving}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold flex items-center justify-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
        </button>
      </div>
    </>
  );
}
