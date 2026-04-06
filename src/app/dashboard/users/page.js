'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Users, Plus, Edit3, Trash2, Save, Loader2, X, Search, Key, Shield, ShieldOff } from 'lucide-react';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const isSuperAdmin = currentUser?.role === 'super_admin';

  useEffect(() => { loadData(); }, []);
  async function loadData() { setLoading(true); const [uRes, pRes] = await Promise.all([supabase.from('users').select('*').order('username'), supabase.from('players').select('id, name, jersey_number, team_id').order('name')]); setUsers(uRes.data || []); setPlayers(pRes.data || []); setLoading(false); }
  async function saveUser(data) { if (editing) { await supabase.from('users').update(data).eq('id', editing.id); } else { await supabase.from('users').insert(data); } setShowModal(false); setEditing(null); loadData(); }
  async function deleteUser(id) { if (!confirm('Remove this user?')) return; await supabase.from('users').delete().eq('id', id); loadData(); }
  async function toggleUser(id, enable) { await supabase.from('users').update({ status: enable ? 'active' : 'disabled' }).eq('id', id); loadData(); }
  async function resetPassword(u) { const np = Math.random().toString(36).slice(-6); await supabase.from('users').update({ password: np }).eq('id', u.id); alert('New password: ' + np); loadData(); }

  const filtered = users.filter(u => u.id !== currentUser?.id).filter(u => !search || u.username?.toLowerCase().includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase()));
  if (loading) return <LoadingSpinner text="Loading users..." />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-xl font-bold text-white">User Accounts</h2><p className="text-sm text-white/40 mt-1">{users.length} users</p></div>
        {isSuperAdmin && <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold"><Plus className="w-4 h-4" /> Add User</button>}
      </div>
      <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" /><input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none placeholder:text-white/20" /></div>
      <div className="grid gap-2">
        {filtered.map(u => {
          const isActive = u.status !== 'disabled';
          return (
            <div key={u.id} className={`flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] ${!isActive ? 'opacity-50' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-sm font-bold text-white">{u.name?.charAt(0) || '?'}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{u.name || u.username}</p>
                <p className="text-[10px] text-white/30">👤 {u.username} · 🔒 {u.password} · {u.role}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => { setEditing(u); setShowModal(true); }} className="p-1.5 rounded-lg bg-white/[0.04] text-white/30 hover:text-[#4F9CF9]"><Edit3 className="w-3.5 h-3.5" /></button>
                <button onClick={() => resetPassword(u)} className="p-1.5 rounded-lg bg-white/[0.04] text-white/30 hover:text-amber-400"><Key className="w-3.5 h-3.5" /></button>
                <button onClick={() => toggleUser(u.id, !isActive)} className="p-1.5 rounded-lg bg-white/[0.04] text-white/30 hover:text-white">{isActive ? <ShieldOff className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}</button>
                {isSuperAdmin && u.role !== 'super_admin' && <button onClick={() => deleteUser(u.id)} className="p-1.5 rounded-lg bg-white/[0.04] text-white/30 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            </div>
          );
        })}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={() => { setShowModal(false); setEditing(null); }}>
          <div className="bg-[#0a0e17] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <UserForm user={editing} players={players} onSave={saveUser} onClose={() => { setShowModal(false); setEditing(null); }} />
          </div>
        </div>
      )}
    </div>
  );
}

function UserForm({ user, players, onSave, onClose }) {
  const [form, setForm] = useState({ name: user?.name || '', username: user?.username || '', password: user?.password || Math.random().toString(36).slice(-6), role: user?.role || 'player', status: user?.status || 'active' });
  const [saving, setSaving] = useState(false);
  async function handleSave() { if (!form.username) return alert('Username required'); setSaving(true); await onSave(form); setSaving(false); }
  return (<>
    <div className="flex items-center justify-between mb-5"><h3 className="text-lg font-bold text-white">{user ? 'Edit' : 'Add'} User</h3><button onClick={onClose} className="p-1.5 rounded-lg bg-white/[0.06] text-white/40"><X className="w-4 h-4" /></button></div>
    <div className="space-y-3">
      <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Name</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Username *</label><input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" /></div>
        <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Password</label><input type="text" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" /></div>
      </div>
      <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Role</label><select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none"><option value="admin">Admin</option><option value="player">Parent/Player</option><option value="super_admin">Super Admin</option></select></div>
    </div>
    <div className="flex gap-3 mt-5">
      <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-white/50 text-sm">Cancel</button>
      <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold flex items-center justify-center gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save</button>
    </div>
  </>);
}