'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  UserCheck, Plus, Edit3, Trash2, Phone, Mail, Award,
  Save, Loader2, X, Search,
} from 'lucide-react';

export default function CoachesPage() {
  const [coaches, setCoaches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [cRes, tRes] = await Promise.all([
      supabase.from('coaches').select('*').order('name'),
      supabase.from('teams').select('*').order('name'),
    ]);
    setCoaches(cRes.data || []);
    setTeams(tRes.data || []);
    setLoading(false);
  }

  async function saveCoach(data) {
    if (editing) {
      await supabase.from('coaches').update(data).eq('id', editing.id);
    } else {
      await supabase.from('coaches').insert(data);
    }
    setShowModal(false);
    setEditing(null);
    loadData();
  }

  async function deleteCoach(id) {
    if (!confirm('Delete this coach?')) return;
    await supabase.from('coaches').delete().eq('id', id);
    loadData();
  }

  function openEdit(coach) {
    setEditing(coach);
    setShowModal(true);
  }

  const filtered = coaches.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <LoadingSpinner text="Loading coaches..." />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Coaches</h2>
          <p className="text-sm text-white/40 mt-1">{coaches.length} coaching staff</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold hover:shadow-lg hover:shadow-[#4F9CF9]/20 transition-all">
          <Plus className="w-4 h-4" /> Add Coach
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input type="text" placeholder="Search coaches..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none placeholder:text-white/20" />
      </div>

      <div className="grid gap-3">
        {filtered.map(coach => {
          const team = teams.find(t => t.id == coach.team_id);
          return (
            <div key={coach.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.05] transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4F9CF9]/20 to-[#22D3EE]/20 border border-[#4F9CF9]/20 flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-[#4F9CF9]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{coach.name}</h3>
                    <p className="text-xs text-white/40 mt-0.5">{coach.role || 'Coach'} {team ? `• ${team.name}` : ''}</p>
                    <div className="flex items-center gap-4 mt-2">
                      {coach.phone && (
                        <span className="flex items-center gap-1 text-[11px] text-white/30">
                          <Phone className="w-3 h-3" /> {coach.phone}
                        </span>
                      )}
                      {coach.email && (
                        <span className="flex items-center gap-1 text-[11px] text-white/30">
                          <Mail className="w-3 h-3" /> {coach.email}
                        </span>
                      )}
                    </div>
                    {coach.specialization && (
                      <div className="flex items-center gap-1 mt-2">
                        <Award className="w-3 h-3 text-amber-400" />
                        <span className="text-[11px] text-amber-400/70">{coach.specialization}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(coach)} className="p-2 rounded-lg bg-white/[0.04] text-white/30 hover:text-[#4F9CF9] hover:bg-[#4F9CF9]/10 transition-all">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteCoach(coach.id)} className="p-2 rounded-lg bg-white/[0.04] text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-white/30 text-sm">No coaches found</div>
        )}
      </div>

      {showModal && <CoachModal coach={editing} teams={teams} onSave={saveCoach} onClose={() => { setShowModal(false); setEditing(null); }} />}
    </div>
  );
}

function CoachModal({ coach, teams, onSave, onClose }) {
  const [form, setForm] = useState({
    name: coach?.name || '', role: coach?.role || 'Head Coach',
    phone: coach?.phone || '', email: coach?.email || '',
    team_id: coach?.team_id || '', specialization: coach?.specialization || '',
    salary: coach?.salary || '', notes: coach?.notes || '',
    status: coach?.status || 'active',
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.name.trim()) return alert('Name is required');
    setSaving(true);
    await onSave({
      ...form,
      team_id: form.team_id || null,
      salary: form.salary ? parseFloat(form.salary) : null,
    });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#0a0e17] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">{coach ? 'Edit Coach' : 'Add Coach'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/[0.06] text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Name *</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none focus:border-[#4F9CF9]/40" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Role</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none">
                <option value="Head Coach">Head Coach</option>
                <option value="Assistant Coach">Assistant Coach</option>
                <option value="Trainer">Trainer</option>
                <option value="Physio">Physio</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Team</label>
              <select value={form.team_id} onChange={e => setForm({...form, team_id: e.target.value})}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none">
                <option value="">No team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Specialization</label>
            <input type="text" value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} placeholder="e.g. Setting, Defense"
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none placeholder:text-white/20" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Salary (MVR)</label>
            <input type="number" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})}
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2}
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-white/50 text-sm font-medium">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {coach ? 'Update' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
