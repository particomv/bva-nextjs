'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Bell, Plus, Trash2, Save, Loader2, X, Send, MessageCircle } from 'lucide-react';

export default function NoticesPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  useEffect(() => { loadData(); }, []);
  async function loadData() { setLoading(true); const [nRes, tRes] = await Promise.all([supabase.from('notices').select('*').order('date', { ascending: false }), supabase.from('teams').select('*')]); setNotices(nRes.data || []); setTeams(tRes.data || []); setLoading(false); }
  async function saveNotice(data) { await supabase.from('notices').insert(data); setShowModal(false); loadData(); }
  async function deleteNotice(id) { if (!confirm('Delete?')) return; await supabase.from('notices').delete().eq('id', id); loadData(); }

  if (loading) return <LoadingSpinner text="Loading notices..." />;
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-xl font-bold text-white">Notices</h2><p className="text-sm text-white/40 mt-1">{notices.length} notices</p></div>
        {isAdmin && <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold"><Plus className="w-4 h-4" /> New</button>}
      </div>
      <div className="grid gap-3">
        {notices.map(n => (
          <div key={n.id} className="bg-white/[0.03] border-l-2 border-[#4F9CF9]/30 border border-white/[0.06] rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1"><h3 className="text-sm font-bold text-white">{n.title}</h3><p className="text-xs text-white/50 mt-1">{n.message}</p><div className="flex gap-3 mt-2 text-[10px] text-white/25"><span>{n.date}</span><span>To: {n.target || 'all'}</span></div></div>
              <div className="flex gap-1 ml-2">
                <button onClick={() => window.open('https://wa.me/?text=' + encodeURIComponent(n.title + '\n' + n.message))} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400"><Send className="w-3.5 h-3.5" /></button>
                {isAdmin && <button onClick={() => deleteNotice(n.id)} className="p-1.5 rounded-lg bg-white/[0.04] text-white/20 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            </div>
          </div>
        ))}
        {notices.length === 0 && <div className="text-center py-16 text-white/30 text-sm">No notices</div>}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-[#0a0e17] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5"><h3 className="text-lg font-bold text-white">New Notice</h3><button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg bg-white/[0.06] text-white/40"><X className="w-4 h-4" /></button></div>
            <NoticeForm teams={teams} onSave={saveNotice} />
          </div>
        </div>
      )}
    </div>
  );
}

function NoticeForm({ teams, onSave }) {
  const [form, setForm] = useState({ title: '', message: '', target: 'all', date: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);
  async function handleSave() { if (!form.title || !form.message) return alert('Fill title and message'); setSaving(true); await onSave(form); setSaving(false); }
  return (<div className="space-y-3">
    <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Title *</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" /></div>
    <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Message *</label><textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={3} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none resize-none" /></div>
    <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">To</label><select value={form.target} onChange={e => setForm({...form, target: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none"><option value="all">All</option>{teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}</select></div>
    <button onClick={handleSave} disabled={saving} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold flex items-center justify-center gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send</button>
  </div>);
}