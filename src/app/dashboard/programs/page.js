'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ClipboardList, Plus, Edit3, Trash2, Save, Loader2, X } from 'lucide-react';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { loadData(); }, []);
  async function loadData() { setLoading(true); const { data } = await supabase.from('programs').select('*').order('name'); setPrograms(data || []); setLoading(false); }
  async function saveProgram(data) { if (editing) { await supabase.from('programs').update(data).eq('id', editing.id); } else { await supabase.from('programs').insert(data); } setShowModal(false); setEditing(null); loadData(); }
  async function deleteProgram(id) { if (!confirm('Delete?')) return; await supabase.from('programs').delete().eq('id', id); loadData(); }

  if (loading) return <LoadingSpinner text="Loading programs..." />;
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-xl font-bold text-white">Training Programs</h2><p className="text-sm text-white/40 mt-1">{programs.length} programs</p></div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold"><Plus className="w-4 h-4" /> Add</button>
      </div>
      <div className="grid gap-3">
        {programs.map(p => (
          <div key={p.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.05] transition-all">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-white">{p.name}</h3>
                <p className="text-xs text-white/40 mt-1">{p.level || 'All Levels'} · {p.duration || ''}</p>
                {p.description && <p className="text-xs text-white/30 mt-2">{p.description}</p>}
                {p.drills && <div className="mt-2"><span className="text-[10px] text-[#4F9CF9] font-semibold">Drills:</span><p className="text-xs text-white/40">{p.drills}</p></div>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(p); setShowModal(true); }} className="p-1.5 rounded-lg bg-white/[0.04] text-white/30 hover:text-[#4F9CF9]"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => deleteProgram(p.id)} className="p-1.5 rounded-lg bg-white/[0.04] text-white/30 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {programs.length === 0 && <div className="text-center py-16 text-white/30 text-sm">No programs yet</div>}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={() => { setShowModal(false); setEditing(null); }}>
          <div className="bg-[#0a0e17] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <ProgramForm program={editing} onSave={saveProgram} onClose={() => { setShowModal(false); setEditing(null); }} />
          </div>
        </div>
      )}
    </div>
  );
}

function ProgramForm({ program, onSave, onClose }) {
  const [form, setForm] = useState({ name: program?.name || '', level: program?.level || 'Beginner', duration: program?.duration || '', description: program?.description || '', drills: program?.drills || '' });
  const [saving, setSaving] = useState(false);
  async function handleSave() { if (!form.name) return alert('Name required'); setSaving(true); await onSave(form); setSaving(false); }
  return (<>
    <div className="flex items-center justify-between mb-5"><h3 className="text-lg font-bold text-white">{program ? 'Edit' : 'Add'} Program</h3><button onClick={onClose} className="p-1.5 rounded-lg bg-white/[0.06] text-white/40"><X className="w-4 h-4" /></button></div>
    <div className="space-y-3">
      <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Name *</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Level</label><select value={form.level} onChange={e => setForm({...form, level: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none"><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Elite</option></select></div>
        <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Duration</label><input type="text" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} placeholder="e.g. 8 weeks" className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none placeholder:text-white/15" /></div>
      </div>
      <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none resize-none" /></div>
      <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Drills / Activities</label><textarea value={form.drills} onChange={e => setForm({...form, drills: e.target.value})} rows={2} placeholder="Serving, Passing, Setting..." className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none resize-none placeholder:text-white/15" /></div>
    </div>
    <div className="flex gap-3 mt-5">
      <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-white/50 text-sm">Cancel</button>
      <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold flex items-center justify-center gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save</button>
    </div>
  </>);
}