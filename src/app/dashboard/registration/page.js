'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserPlus, Save, Loader2, Check } from 'lucide-react';

export default function RegistrationPage() {
  const [form, setForm] = useState({ player_name: '', date_of_birth: '', gender: 'Male', parent_name: '', parent_phone: '', parent_email: '', school: '', address: '', medical: '', jersey_size: '' });
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!form.player_name || !form.parent_name || !form.parent_phone) return alert('Fill required fields');
    setSaving(true);
    await supabase.from('applications').insert({ ...form, status: 'pending', date: new Date().toISOString().split('T')[0] });
    setSaving(false); setSubmitted(true);
  }

  if (submitted) return (
    <div className="max-w-md mx-auto text-center py-20">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-emerald-400" /></div>
      <h2 className="text-xl font-bold text-white">Application Submitted!</h2>
      <p className="text-sm text-white/40 mt-2">Thank you for applying to Blues for Volleyball Academy. We will review your application and contact you soon.</p>
      <button onClick={() => { setSubmitted(false); setForm({ player_name: '', date_of_birth: '', gender: 'Male', parent_name: '', parent_phone: '', parent_email: '', school: '', address: '', medical: '', jersey_size: '' }); }} className="mt-6 px-6 py-2.5 rounded-xl bg-white/[0.06] text-white/50 text-sm">Submit Another</button>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🏐</div>
        <h2 className="text-xl font-bold text-white">Player Registration</h2>
        <p className="text-sm text-white/40 mt-1">Blues for Volleyball Academy — Police Club MPS</p>
      </div>
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <h3 className="text-xs font-bold text-[#4F9CF9] uppercase tracking-wider mb-4">Player Information</h3>
        <div className="space-y-3">
          <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Player Name *</label><input type="text" value={form.player_name} onChange={e => setForm({...form, player_name: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Date of Birth</label><input type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" /></div>
            <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Gender</label><select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none"><option>Male</option><option>Female</option></select></div>
          </div>
          <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">School</label><input type="text" value={form.school} onChange={e => setForm({...form, school: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" /></div>
          <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Jersey Size</label><select value={form.jersey_size} onChange={e => setForm({...form, jersey_size: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none"><option value="">Select</option><option>S</option><option>M</option><option>L</option><option>XL</option><option>XXL</option></select></div>
        </div>
        <h3 className="text-xs font-bold text-[#4F9CF9] uppercase tracking-wider mt-6 mb-4">Parent / Guardian</h3>
        <div className="space-y-3">
          <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Parent Name *</label><input type="text" value={form.parent_name} onChange={e => setForm({...form, parent_name: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Phone *</label><input type="tel" value={form.parent_phone} onChange={e => setForm({...form, parent_phone: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" /></div>
            <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Email</label><input type="email" value={form.parent_email} onChange={e => setForm({...form, parent_email: e.target.value})} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" /></div>
          </div>
          <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Address</label><textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={2} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none resize-none" /></div>
          <div><label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Medical Conditions</label><input type="text" value={form.medical} onChange={e => setForm({...form, medical: e.target.value})} placeholder="Any allergies, conditions..." className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none placeholder:text-white/15" /></div>
        </div>
        <button onClick={handleSubmit} disabled={saving} className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold flex items-center justify-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Submit Application
        </button>
      </div>
    </div>
  );
}