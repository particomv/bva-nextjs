'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import { CalendarDays, Plus, Edit3, Trash2, Save, Loader2, X, MapPin } from 'lucide-react';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { loadData(); }, []);
  async function loadData() { setLoading(true); const { data } = await supabase.from('events').select('*').order('date', { ascending: false }); setEvents(data || []); setLoading(false); }
  async function saveEvent(data) { if (editing) { await supabase.from('events').update(data).eq('id', editing.id); } else { await supabase.from('events').insert(data); } setShowModal(false); setEditing(null); loadData(); }
  async function deleteEvent(id) { if (!confirm('Delete?')) return; await supabase.from('events').delete().eq('id', id); loadData(); }

  if (loading) return <LoadingSpinner text="Loading events..." />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-xl font-bold text-white">Events</h2><p className="text-sm text-white/40 mt-1">{events.length} events</p></div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold"><Plus className="w-4 h-4" /> Add Event</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {events.map(e => (
          <div key={e.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center hover:bg-white/[0.05] transition-all">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="text-sm font-bold text-white">{e.name}</h3>
            <p className="text-xs text-white/40 mt-1">{e.date} · {e.venue}</p>
            {e.description && <p className="text-xs text-white/30 mt-2 p-2 bg-white/[0.03] rounded-lg">{e.description}</p>}
            <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${e.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' : e.status === 'planning' ? 'bg-amber-500/15 text-amber-400' : 'bg-blue-500/15 text-blue-400'}`}>{e.status || 'upcoming'}</span>
            <div className="flex gap-2 justify-center mt-3">
              <button onClick={() => { setEditing(e); setShowModal(true); }} className="p-1.5 rounded-lg bg-white/[0.04] text-white/30 hover:text-[#4F9CF9]"><Edit3 className="w-4 h-4" /></button>
              <button onClick={() => deleteEvent(e.id)} className="p-1.5 rounded-lg bg-white/[0.04] text-white/30 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {events.length === 0 && <div className="col-span-2 text-center py-16 text-white/30 text-sm">No events yet</div>}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={() => { setShowModal(false); setEditing(null); }}>
          <div className="bg-[#0a0e17] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <EventForm event={editing} onSave={saveEvent} onClose={() => { setShowModal(false); setEditing(null); }} />
          </div>
        </div>
      )}
    </div>
  );
}

function EventForm({ event, onSave, onClose }) {
  const [form, setForm] = useState({ name: event?.name || '', date: event?.date || new Date().toISOString().split('T')[0], venue: event?.venue || '', status: event?.status || 'upcoming', description: event?.description || '' });
  const [saving, setSaving] = useState(false);
  async function handleSave() { if (!form.name.trim()) return alert('Name required'); setSaving(true); await onSave(form); setSaving(false); }
  return (<>
    <div className="flex items-center justify-between mb-5"><h3 className="text-lg font-bold text-white">{event ? 'Edit' : 'Add'} Event</h3><button onClick={onClose} className="p-1.5 rounded-lg bg-white/[0.06] text-white/40"><X className="w-4 h-4" /></button></div>
    <div className="space-y-3">
      <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Name *</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" /></div>
        <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none"><option>upcoming</option><option>planning</option><option>completed</option></select></div>
      </div>
      <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Venue</label><input type="text" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" /></div>
      <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none resize-none" /></div>
    </div>
    <div className="flex gap-3 mt-5">
      <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-white/50 text-sm">Cancel</button>
      <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold flex items-center justify-center gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save</button>
    </div>
  </>);
}
