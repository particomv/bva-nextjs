'use client';
import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

const positions = ['Setter', 'Outside Hitter', 'Middle Blocker', 'Opposite Hitter', 'Libero', 'Defensive Specialist'];

export default function PlayerModal({ player, teams, onSave, onClose }) {
  const isEdit = !!player;
  const [form, setForm] = useState({
    name: '', jersey_number: '', team_id: '', position: '',
    phone: '', email: '', date_of_birth: '', status: 'active', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (player) {
      setForm({
        name: player.name || '', jersey_number: player.jersey_number || '',
        team_id: player.team_id || '', position: player.position || '',
        phone: player.phone || '', email: player.email || '',
        date_of_birth: player.date_of_birth || '', status: player.status || 'active',
        notes: player.notes || '',
      });
    }
  }, [player]);

  function updateField(field, value) { setForm(prev => ({ ...prev, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Player name is required'); return; }
    setSaving(true); setError('');
    try {
      const data = { ...form, jersey_number: form.jersey_number ? parseInt(form.jersey_number) : null, team_id: form.team_id || null };
      await onSave(data, player?.id);
    } catch (err) { setError(err.message); setSaving(false); }
  }

  const ic = "w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg glass rounded-2xl animate-fade-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 style={{fontFamily:'Outfit,system-ui'}} className="font-semibold text-white">{isEdit ? 'Edit Player' : 'Add New Player'}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-white/50 mb-1.5">Full Name *</label>
            <input type="text" value={form.name} onChange={e => updateField('name', e.target.value)} className={ic} placeholder="Player full name" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/50 mb-1.5">Jersey #</label>
              <input type="number" value={form.jersey_number} onChange={e => updateField('jersey_number', e.target.value)} className={ic} placeholder="0" />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1.5">Team</label>
              <select value={form.team_id} onChange={e => updateField('team_id', e.target.value)} className={ic}>
                <option value="">No team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/50 mb-1.5">Position</label>
            <select value={form.position} onChange={e => updateField('position', e.target.value)} className={ic}>
              <option value="">Select position</option>
              {positions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/50 mb-1.5">Phone</label>
              <input type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)} className={ic} placeholder="+960" />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} className={ic} placeholder="email@example.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/50 mb-1.5">Date of Birth</label>
              <input type="date" value={form.date_of_birth} onChange={e => updateField('date_of_birth', e.target.value)} className={ic} />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1.5">Status</label>
              <select value={form.status} onChange={e => updateField('status', e.target.value)} className={ic}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="injured">Injured</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/50 mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e => updateField('notes', e.target.value)} className={ic + " resize-none"} rows={3} placeholder="Optional notes..." />
          </div>
          {error && <div className="px-4 py-2.5 rounded-xl bg-accent-coral/10 border border-accent-coral/20 text-accent-coral text-sm">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-white/60 text-sm font-medium hover:bg-white/[0.1]">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-navy-500 to-navy-600 text-white text-sm font-semibold hover:from-navy-400 hover:to-navy-500 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{fontFamily:'Outfit,system-ui'}}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEdit ? 'Update' : 'Add Player'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
