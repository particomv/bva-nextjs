'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Handshake, Plus, Edit3, Trash2, Save, Loader2, X, Globe, Phone, DollarSign } from 'lucide-react';

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.from('sponsors').select('*').order('name');
    setSponsors(data || []);
    setLoading(false);
  }

  async function saveSponsor(data) {
    if (editing) { await supabase.from('sponsors').update(data).eq('id', editing.id); }
    else { await supabase.from('sponsors').insert(data); }
    setShowModal(false); setEditing(null); loadData();
  }

  async function deleteSponsor(id) {
    if (!confirm('Delete?')) return;
    await supabase.from('sponsors').delete().eq('id', id);
    loadData();
  }

  if (loading) return <LoadingSpinner text="Loading sponsors..." />;

  const activeSponors = sponsors.filter(s => s.status === 'active');
  const totalValue = sponsors.reduce((sum, s) => sum + (s.amount || 0), 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Sponsors</h2>
          <p className="text-sm text-white/40 mt-1">{activeSponors.length} active sponsors</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold">
          <Plus className="w-4 h-4" /> Add Sponsor
        </button>
      </div>

      {totalValue > 0 && (
        <div className="bg-[#4F9CF9]/10 border border-[#4F9CF9]/20 rounded-xl p-4 mb-5 text-center">
          <p className="text-2xl font-bold text-[#4F9CF9]">MVR {totalValue.toLocaleString()}</p>
          <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Total Sponsorship Value</p>
        </div>
      )}

      <div className="grid gap-3">
        {sponsors.map(sponsor => (
          <div key={sponsor.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.05] transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center">
                  {sponsor.logo ? <img src={sponsor.logo} alt="" className="w-8 h-8 rounded-lg object-cover" /> : <Handshake className="w-6 h-6 text-amber-400" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{sponsor.name}</h3>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      sponsor.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/[0.06] text-white/30'
                    }`}>{sponsor.status || 'active'}</span>
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">{sponsor.tier || 'Sponsor'} {sponsor.amount ? `• MVR ${sponsor.amount.toLocaleString()}` : ''}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {sponsor.contact && <span className="flex items-center gap-1 text-[11px] text-white/30"><Phone className="w-3 h-3" />{sponsor.contact}</span>}
                    {sponsor.website && <span className="flex items-center gap-1 text-[11px] text-white/30"><Globe className="w-3 h-3" />{sponsor.website}</span>}
                  </div>
                  {sponsor.period && <p className="text-[10px] text-white/20 mt-1">Period: {sponsor.period}</p>}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(sponsor); setShowModal(true); }} className="p-2 rounded-lg bg-white/[0.04] text-white/30 hover:text-[#4F9CF9]">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteSponsor(sponsor.id)} className="p-2 rounded-lg bg-white/[0.04] text-white/30 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {sponsors.length === 0 && (
          <div className="text-center py-16">
            <Handshake className="w-12 h-12 text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No sponsors yet</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={() => { setShowModal(false); setEditing(null); }}>
          <div className="bg-[#0a0e17] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <SponsorForm sponsor={editing} onSave={saveSponsor} onClose={() => { setShowModal(false); setEditing(null); }} />
          </div>
        </div>
      )}
    </div>
  );
}

function SponsorForm({ sponsor, onSave, onClose }) {
  const [form, setForm] = useState({
    name: sponsor?.name || '', tier: sponsor?.tier || 'Gold',
    amount: sponsor?.amount || '', contact: sponsor?.contact || '',
    website: sponsor?.website || '', logo: sponsor?.logo || '',
    period: sponsor?.period || '', status: sponsor?.status || 'active',
    notes: sponsor?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.name.trim()) return alert('Name required');
    setSaving(true);
    await onSave({ ...form, amount: form.amount ? parseFloat(form.amount) : null });
    setSaving(false);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-white">{sponsor ? 'Edit' : 'Add'} Sponsor</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg bg-white/[0.06] text-white/40"><X className="w-4 h-4" /></button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Company Name *</label>
          <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Tier</label>
            <select value={form.tier} onChange={e => setForm({...form, tier: e.target.value})}
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none">
              {['Platinum', 'Gold', 'Silver', 'Bronze', 'Partner'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Amount (MVR)</label>
            <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Contact</label>
            <input type="text" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})}
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Website</label>
            <input type="url" value={form.website} onChange={e => setForm({...form, website: e.target.value})}
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Period</label>
          <input type="text" value={form.period} onChange={e => setForm({...form, period: e.target.value})} placeholder="e.g. Jan 2026 - Dec 2026"
            className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none placeholder:text-white/15" />
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
