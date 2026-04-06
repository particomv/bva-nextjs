'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Settings, User, Lock, Database, Info, LogOut, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('account');
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState({ current: '', newPass: '', confirm: '' });
  const [message, setMessage] = useState('');

  async function changePassword() {
    if (!password.current || !password.newPass) return setMessage('Fill all fields');
    if (password.newPass !== password.confirm) return setMessage('Passwords do not match');
    if (password.newPass.length < 4) return setMessage('Password too short');

    setSaving(true);
    // Verify current password
    const { data } = await supabase.from('users').select('*')
      .eq('username', user.username).eq('password', password.current).single();

    if (!data) { setSaving(false); return setMessage('Current password is wrong'); }

    await supabase.from('users').update({ password: password.newPass }).eq('id', user.id);
    setSaving(false);
    setPassword({ current: '', newPass: '', confirm: '' });
    setMessage('Password updated!');
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <p className="text-sm text-white/40 mt-1">Manage your account</p>
      </div>

      <div className="flex gap-2 mb-5">
        {[
          { key: 'account', label: 'Account', icon: User },
          { key: 'security', label: 'Security', icon: Lock },
          { key: 'about', label: 'About', icon: Info },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.key ? 'bg-[#4F9CF9]/15 text-[#4F9CF9] border border-[#4F9CF9]/25' : 'text-white/40 border border-transparent'
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'account' && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4F9CF9] to-[#22D3EE] flex items-center justify-center text-xl font-bold text-white">
              {user?.name?.charAt(0) || user?.username?.charAt(0) || '?'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{user?.name || user?.username}</h3>
              <p className="text-sm text-white/40">{user?.role || 'User'}</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Username', value: user?.username },
              { label: 'Role', value: user?.role },
              { label: 'Status', value: user?.status || 'active' },
            ].map(f => (
              <div key={f.label} className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                <span className="text-xs text-white/40 uppercase tracking-wider">{f.label}</span>
                <span className="text-sm text-white font-medium">{f.value}</span>
              </div>
            ))}
          </div>
          <button onClick={logout}
            className="flex items-center gap-2 mt-6 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-sm font-semibold border border-red-500/20 hover:bg-red-500/20 transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      )}

      {tab === 'security' && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">Change Password</h3>
          {message && (
            <div className={`text-sm p-3 rounded-xl mb-4 ${message.includes('updated') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {message}
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Current Password</label>
              <input type="password" value={password.current} onChange={e => setPassword({...password, current: e.target.value})}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">New Password</label>
              <input type="password" value={password.newPass} onChange={e => setPassword({...password, newPass: e.target.value})}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Confirm New Password</label>
              <input type="password" value={password.confirm} onChange={e => setPassword({...password, confirm: e.target.value})}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none" />
            </div>
          </div>
          <button onClick={changePassword} disabled={saving}
            className="flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4F9CF9] to-[#22D3EE] text-[#0B0F14] text-sm font-bold">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Update Password
          </button>
        </div>
      )}

      {tab === 'about' && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4F9CF9] to-[#22D3EE] flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Blues for Volleyball Academy</h3>
          <p className="text-sm text-white/40 mt-1">Police Club — Maldives Police Service</p>
          <p className="text-xs text-white/20 mt-4">Version 2.0 — Next.js + Supabase</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Database className="w-3 h-3 text-emerald-400" />
            <span className="text-xs text-emerald-400">Connected to Supabase</span>
          </div>
        </div>
      )}
    </div>
  );
}
