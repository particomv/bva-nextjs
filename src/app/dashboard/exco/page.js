'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Users, Plus, Edit3, Trash2, Save, Loader2, X, Phone, Mail } from 'lucide-react';

export default function ExcoPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { loadData(); }, []);
  async function loadData() { setLoading(true); const { data } = await supabase.from('exco').select('*').order('position_order'); setMembers(data || []); setLoading(false); }
  async function saveMember(data) { if (editing) { await supabase.from('exco').update(data).eq('id', editing.id); } else { await supabase.from('exco').insert(data); } setShowModal(false); setEditing(null); loadData(); }
  async function deleteMember(id) { if (!confirm('Remove?')) return; await supabase.from('exco').delete().eq('id', id); loadData(); }

  if (loading) return <LoadingSpinner text="Loading..." />;
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-xl font-bold text-white">Executive Committee</h2><p className="text-sm text-white/40 mt-1">{members.length} members</p></div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold"><Plus className="w-4 h-4" /> Add</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {members.map(m => (
          <div key={m.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center hover:bg-white/[0.05] transition-all">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#4F9CF9]/20 to-[#22D3EE]/20 border border-[#4F9CF9]/20 flex items-center justify-center mx-auto mb-3 text-xl font-bold text-[#4F9CF9]">{m.name?.charAt(0) || '?'}</div>
            <h3 className="text-sm font-bold text-white">{m.name}</h3>
            <p className="text-xs text-[#4F9CF9] font-semibold mt-0.5">{m.position}</p>
            <div className="flex items-center justify-center gap-3 mt-2">
              {m.phone && <span className="flex items-center gap-1 text-[10px] text-white/30"><Phone className="w-3 h-3" />{m.phone}</span>}
              {m.email && <span className="flex items-center gap-1 text-[10px] text-white/30"><Mail className="w-3 h-3" />{m.email}</span>}
            </div>
            <div className="flex gap-2 justify-center mt-3">
              <button onClick={() => { setEditing(m); setShowModal(true); }} className="p-1.5 rounded-lg bg-white/[0.04] text-white/30 hover:text-[#4F9CF9]"><Edit3 className="w-4 h-4" /></button>
              <button onClick={() => deleteMember(m.id)} className="p-1.5 rounded-lg bg-white/[0.04] text-white/30 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {members.length === 0 && <div className="col-span-2 text-center py-16 text-white/30 text-sm">No members yet</div>}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={() => { setShowModal(false); setEditing(null); }}>
          <div className="bg-[#0a0e17] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5"><h3 className="text-lg font-bold text-white">{editing ? 'Edit' : 'Add'} Member</h3><button onClick={() => { setShowModal(false); setEditing(null); }} className="p-1.5 rounded-lg bg-white/[0.06] text-white/40"><X className="w-4 h-4" /></button></div>
            <ExcoForm member={editing} onSave={saveMember} />
          </div>
        </div>
      )}
    </div>
  );
}

function ExcoForm({ member, onSave }) {
  const [form, setForm] = useState({ name: member?.name || '', position: member?.position || '', phone: member?.phone || '', email: member?.email || '', position_order: member?.position_order || 0 });
  const [saving, setSaving] = useState(false);
  async function handleSave() { if (!form.name) return alert('Name required'); setSaving(true); await onSave(form); setSaving(false); }
  return (<div className="space-y-3">
    <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Name *</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" /></div>
    <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Position</label><input type="text" value={form.position} onChange={e => setForm({...form, position: e.target.value})} placeholder="e.g. Chairman, Secretary" className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none placeholder:text-white/15" /></div>
    <div className="grid grid-cols-2 gap-3">
      <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Phone</label><input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" /></div>
      <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" /></div>
    </div>
    <button onClick={handleSave} disabled={saving} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold flex items-center justify-center gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save</button>
  </div>);
}