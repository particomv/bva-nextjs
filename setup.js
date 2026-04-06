const fs = require('fs');
const path = require('path');

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content.trim() + '\n');
  console.log('  Created: ' + filePath);
}

console.log('\n  Blues for Volleyball Academy - Setup\n');

// next.config.js
writeFile('next.config.js', `
/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true };
module.exports = nextConfig;
`);

// tailwind.config.js
writeFile('tailwind.config.js', `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f3ff', 100: '#dbe1ff', 200: '#b5c2ff', 300: '#8a9eff',
          400: '#5c74ff', 500: '#3b52e0', 600: '#1e3a8a', 700: '#172e6e',
          800: '#112255', 900: '#0b1737',
        },
        accent: { gold: '#f59e0b', emerald: '#10b981', coral: '#f43f5e' }
      },
    },
  },
  plugins: [],
};
`);

// postcss.config.js
writeFile('postcss.config.js', `
module.exports = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
`);

// jsconfig.json
writeFile('jsconfig.json', `
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
`);

// src/lib/supabase.js
writeFile('src/lib/supabase.js', `
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
`);

// src/lib/auth.js
writeFile('src/lib/auth.js', `
'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('bva_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('bva_user'); }
    }
    setLoading(false);
  }, []);

  async function login(username, password) {
    const { data, error } = await supabase
      .from('users').select('*')
      .eq('username', username).eq('password', password).single();
    if (error || !data) throw new Error('Invalid username or password');
    const userData = { id: data.id, username: data.username, role: data.role, name: data.name || data.username };
    setUser(userData);
    localStorage.setItem('bva_user', JSON.stringify(userData));
    return userData;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('bva_user');
    window.location.href = '/';
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
`);

// src/app/globals.css
writeFile('src/app/globals.css', `
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Outfit:wght@400;500;600;700;800&display=swap');

:root {
  --font-display: 'Outfit', system-ui, sans-serif;
  --font-body: 'DM Sans', system-ui, sans-serif;
}

body {
  font-family: var(--font-body);
  background: #0b1737;
  color: #e2e8f0;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }

.stagger-children > * { opacity: 0; animation: fadeIn 0.4s ease-out forwards; }
.stagger-children > *:nth-child(1) { animation-delay: 0.05s; }
.stagger-children > *:nth-child(2) { animation-delay: 0.1s; }
.stagger-children > *:nth-child(3) { animation-delay: 0.15s; }
.stagger-children > *:nth-child(4) { animation-delay: 0.2s; }

.glass {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.08);
}
.glass-hover:hover {
  background: rgba(255,255,255,0.07);
  border-color: rgba(255,255,255,0.14);
}

input:focus, select:focus, textarea:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59,82,224,0.5);
}
`);

// src/app/layout.js
writeFile('src/app/layout.js', `
import './globals.css';
import { AuthProvider } from '@/lib/auth';

export const metadata = {
  title: 'Blues for Volleyball Academy',
  description: 'Police Club - Maldives Police Service',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
`);

// src/app/page.js (Login)
writeFile('src/app/page.js', `
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  if (user) { router.push('/dashboard'); return null; }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(username, password);
      router.push('/dashboard');
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-navy-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent-gold/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.03]" />
      </div>
      <div className="w-full max-w-md relative animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-navy-500 to-navy-700 shadow-lg shadow-navy-500/25 mb-5">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          </div>
          <h1 style={{fontFamily: 'Outfit, system-ui'}} className="text-3xl font-bold text-white mb-1">Blues Academy</h1>
          <p className="text-white/40 text-sm flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Police Club \\u00b7 Maldives Police Service
          </p>
        </div>
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25"
                placeholder="Enter username" required autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 pr-12"
                  placeholder="Enter password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {error && <div className="px-4 py-3 rounded-xl bg-accent-coral/10 border border-accent-coral/20 text-accent-coral text-sm">{error}</div>}
            <button type="submit" disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-navy-500 to-navy-600 text-white font-semibold text-sm hover:from-navy-400 hover:to-navy-500 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-navy-600/25"
              style={{fontFamily: 'Outfit, system-ui'}}>
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>
        </div>
        <p className="text-center text-white/20 text-xs mt-6">Blues for Volleyball Academy \\u00a9 2026</p>
      </div>
    </div>
  );
}
`);

// src/components/Sidebar.js
writeFile('src/components/Sidebar.js', `
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, UserCheck, Calendar, CreditCard,
  Trophy, ClipboardList, Package, GraduationCap, Handshake,
  BarChart3, Settings, X,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Players', href: '/dashboard/players', icon: Users },
  { label: 'Coaches', href: '/dashboard/coaches', icon: UserCheck },
  { label: 'Attendance', href: '/dashboard/attendance', icon: Calendar },
  { label: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { label: 'Matches', href: '/dashboard/matches', icon: Trophy },
  { label: 'Teams', href: '/dashboard/teams', icon: ClipboardList },
  { label: 'Equipment', href: '/dashboard/equipment', icon: Package },
  { label: 'Graduated', href: '/dashboard/graduated', icon: GraduationCap },
  { label: 'Sponsors', href: '/dashboard/sponsors', icon: Handshake },
  { label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />}
      <aside className={\`fixed top-0 left-0 h-full w-64 bg-navy-900/95 backdrop-blur-xl border-r border-white/[0.06] z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static \${open ? 'translate-x-0' : '-translate-x-full'}\`}>
        <div className="px-5 py-6 flex items-center justify-between border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            </div>
            <div>
              <h2 style={{fontFamily:'Outfit,system-ui'}} className="font-bold text-white text-sm leading-tight">Blues Academy</h2>
              <p className="text-[10px] text-white/30 tracking-wider uppercase">Police Club</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                className={\`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all \${isActive ? 'bg-navy-500/30 text-white' : 'text-white/45 hover:text-white/80 hover:bg-white/[0.04]'}\`}>
                <Icon className={\`w-[18px] h-[18px] \${isActive ? 'text-accent-gold' : ''}\`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-white/[0.06]">
          <p className="text-[10px] text-white/20">v2.0 \\u00b7 Next.js + Supabase</p>
        </div>
      </aside>
    </>
  );
}
`);

// src/components/Topbar.js
writeFile('src/components/Topbar.js', `
'use client';
import { useAuth } from '@/lib/auth';
import { Menu, LogOut, Bell, Shield, User, Crown } from 'lucide-react';

const roleConfig = {
  superadmin: { label: 'Super Admin', icon: Crown, color: 'text-accent-gold' },
  admin: { label: 'Admin', icon: Shield, color: 'text-navy-300' },
  coach: { label: 'Coach', icon: User, color: 'text-accent-emerald' },
  player: { label: 'Player', icon: User, color: 'text-white/60' },
};

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const role = roleConfig[user?.role] || roleConfig.player;
  const RoleIcon = role.icon;
  return (
    <header className="h-16 border-b border-white/[0.06] bg-navy-900/60 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 text-white/50 hover:text-white rounded-lg hover:bg-white/[0.06]">
          <Menu className="w-5 h-5" />
        </button>
        <h1 style={{fontFamily:'Outfit,system-ui'}} className="hidden sm:block font-semibold text-white text-sm">Blues for Volleyball Academy</h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/[0.06] relative">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-coral rounded-full" />
        </button>
        <div className="flex items-center gap-3 ml-2 pl-3 border-l border-white/[0.08]">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className={\`text-[11px] flex items-center gap-1 justify-end \${role.color}\`}>
              <RoleIcon className="w-3 h-3" />{role.label}
            </p>
          </div>
          <button onClick={logout} className="p-2 text-white/40 hover:text-accent-coral rounded-lg hover:bg-white/[0.06]" title="Sign out">
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
`);

// src/components/StatsCard.js
writeFile('src/components/StatsCard.js', `
'use client';
export default function StatsCard({ icon: Icon, label, value, sub, color = 'text-navy-300' }) {
  return (
    <div className="glass rounded-2xl p-5 glass-hover transition-all duration-200">
      <div className={\`w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.06] \${color} mb-3\`}>
        <Icon className="w-5 h-5" />
      </div>
      <p style={{fontFamily:'Outfit,system-ui'}} className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-white/40 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-white/25 mt-1">{sub}</p>}
    </div>
  );
}
`);

// src/components/LoadingSpinner.js
writeFile('src/components/LoadingSpinner.js', `
'use client';
import { Loader2 } from 'lucide-react';
export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-8 h-8 text-navy-400 animate-spin" />
      <p className="text-sm text-white/30">{text}</p>
    </div>
  );
}
`);

// src/components/PlayerModal.js
writeFile('src/components/PlayerModal.js', `
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
`);

// src/app/dashboard/layout.js
writeFile('src/app/dashboard/layout.js', `
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner text="Loading academy..." /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-h-screen">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
`);

// src/app/dashboard/page.js
writeFile('src/app/dashboard/page.js', `
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import StatsCard from '@/components/StatsCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Users, ClipboardList, UserCheck, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentPlayers, setRecentPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [
          { count: playerCount },
          { count: teamCount },
          { count: coachCount },
          { data: players },
          { count: attendanceCount },
        ] = await Promise.all([
          supabase.from('players').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('teams').select('*', { count: 'exact', head: true }),
          supabase.from('coaches').select('*', { count: 'exact', head: true }),
          supabase.from('players').select('id, name, jersey_number, team_id, status, created_at').eq('status', 'active').order('created_at', { ascending: false }).limit(5),
          supabase.from('attendance').select('*', { count: 'exact', head: true }),
        ]);
        setStats({ players: playerCount || 0, teams: teamCount || 0, coaches: coachCount || 0, attendance: attendanceCount || 0 });
        setRecentPlayers(players || []);
      } catch (err) { console.error('Dashboard error:', err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 style={{fontFamily:'Outfit,system-ui'}} className="text-2xl font-bold text-white">Welcome back, {user?.name}</h1>
        <p className="text-white/40 text-sm mt-1">Here&apos;s your academy overview</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 stagger-children">
        <StatsCard icon={Users} label="Active Players" value={stats.players} sub="Across all teams" color="text-navy-300" />
        <StatsCard icon={ClipboardList} label="Teams" value={stats.teams} sub="Fulhangi, Surumuthi..." color="text-accent-gold" />
        <StatsCard icon={UserCheck} label="Coaches" value={stats.coaches} sub="Active coaching staff" color="text-accent-emerald" />
        <StatsCard icon={Calendar} label="Attendance Records" value={stats.attendance} sub="Total entries" color="text-purple-400" />
      </div>
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h2 style={{fontFamily:'Outfit,system-ui'}} className="font-semibold text-white text-sm">Recent Players</h2>
          <a href="/dashboard/players" className="text-xs text-navy-300 hover:text-navy-200">View all &rarr;</a>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {recentPlayers.map(player => (
            <div key={player.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-navy-600/50 flex items-center justify-center text-sm font-bold text-white/70" style={{fontFamily:'Outfit,system-ui'}}>
                  {player.jersey_number || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{player.name}</p>
                  <p className="text-xs text-white/30">#{player.jersey_number}</p>
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-accent-emerald bg-accent-emerald/10 px-2 py-1 rounded-full">Active</span>
            </div>
          ))}
          {recentPlayers.length === 0 && <div className="px-5 py-8 text-center text-white/30 text-sm">No players found</div>}
        </div>
      </div>
    </div>
  );
}
`);

// src/app/dashboard/players/page.js
writeFile('src/app/dashboard/players/page.js', `
'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import PlayerModal from '@/components/PlayerModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Search, Plus, Edit3, Trash2, Users, ChevronDown, AlertCircle, UserX } from 'lucide-react';

const statusColors = {
  active: 'text-accent-emerald bg-accent-emerald/10',
  inactive: 'text-white/40 bg-white/[0.06]',
  injured: 'text-accent-coral bg-accent-coral/10',
  suspended: 'text-accent-gold bg-accent-gold/10',
};

export default function PlayersPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [{ data: p }, { data: t }] = await Promise.all([
        supabase.from('players').select('*').order('name'),
        supabase.from('teams').select('*').order('name'),
      ]);
      setPlayers(p || []);
      setTeams(t || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadData();
    const channel = supabase.channel('players-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadData]);

  const filtered = players.filter(p => {
    const s = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || String(p.jersey_number).includes(search);
    const t = !teamFilter || p.team_id === teamFilter;
    const st = !statusFilter || p.status === statusFilter;
    return s && t && st;
  });

  function getTeamName(id) { return teams.find(t => t.id === id)?.name || '\\u2014'; }

  async function handleSave(data, playerId) {
    if (playerId) {
      const { error } = await supabase.from('players').update(data).eq('id', playerId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('players').insert([data]);
      if (error) throw error;
    }
    setShowModal(false); setEditingPlayer(null);
    await loadData();
  }

  async function handleDelete(id) {
    await supabase.from('players').delete().eq('id', id);
    setDeleteConfirm(null);
    await loadData();
  }

  if (loading) return <LoadingSpinner text="Loading players..." />;
  const isAdmin = user?.role === 'superadmin' || user?.role === 'admin';

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 style={{fontFamily:'Outfit,system-ui'}} className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-navy-300" /> Players
          </h1>
          <p className="text-sm text-white/40 mt-0.5">{filtered.length} of {players.length} players</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditingPlayer(null); setShowModal(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-navy-500 to-navy-600 text-white text-sm font-semibold hover:from-navy-400 hover:to-navy-500 shadow-lg shadow-navy-600/25"
            style={{fontFamily:'Outfit,system-ui'}}>
            <Plus className="w-4 h-4" /> Add Player
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm placeholder-white/25"
            placeholder="Search by name or jersey #..." />
        </div>
        <div className="relative">
          <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm min-w-[140px]">
            <option value="">All Teams</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm min-w-[130px]">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="injured">Injured</option>
            <option value="suspended">Suspended</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <UserX className="w-12 h-12 text-white/15 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No players found</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="hidden md:grid grid-cols-[3fr_1fr_2fr_1.5fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/[0.06] text-xs text-white/30 uppercase tracking-wider font-medium">
            <span>Player</span><span>Jersey</span><span>Team</span><span>Position</span><span>Status</span><span className="w-20">Actions</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {filtered.map(player => (
              <div key={player.id} className="px-5 py-3.5 flex flex-col md:grid md:grid-cols-[3fr_1fr_2fr_1.5fr_1fr_auto] md:items-center gap-2 md:gap-4 hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-navy-600/50 flex items-center justify-center text-sm font-bold text-white/60 shrink-0" style={{fontFamily:'Outfit,system-ui'}}>
                    {player.jersey_number || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{player.name}</p>
                    {player.phone && <p className="text-[11px] text-white/25">{player.phone}</p>}
                  </div>
                </div>
                <span className="text-sm text-white/50 hidden md:block">#{player.jersey_number || '\\u2014'}</span>
                <span className="text-sm text-white/50 hidden md:block">{getTeamName(player.team_id)}</span>
                <span className="text-sm text-white/40 hidden md:block">{player.position || '\\u2014'}</span>
                <span className={\`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full w-fit font-medium \${statusColors[player.status] || statusColors.active}\`}>
                  {player.status || 'active'}
                </span>
                {isAdmin && (
                  <div className="flex items-center gap-1 w-20 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingPlayer(player); setShowModal(true); }}
                      className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06]"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteConfirm(player)}
                      className="p-2 rounded-lg text-white/30 hover:text-accent-coral hover:bg-accent-coral/10"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 md:hidden text-xs text-white/30">
                  <span>#{player.jersey_number || '\\u2014'}</span><span>\\u00b7</span>
                  <span>{getTeamName(player.team_id)}</span><span>\\u00b7</span>
                  <span>{player.position || 'No position'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && <PlayerModal player={editingPlayer} teams={teams} onSave={handleSave} onClose={() => { setShowModal(false); setEditingPlayer(null); }} />}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="w-full max-w-sm glass rounded-2xl p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent-coral/10 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-accent-coral" /></div>
              <div>
                <h3 style={{fontFamily:'Outfit,system-ui'}} className="font-semibold text-white text-sm">Delete Player</h3>
                <p className="text-xs text-white/40">This cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-white/60 mb-5">Are you sure you want to delete <strong className="text-white">{deleteConfirm.name}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-white/60 text-sm font-medium hover:bg-white/[0.1]">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 py-2.5 rounded-xl bg-accent-coral text-white text-sm font-semibold hover:bg-accent-coral/80" style={{fontFamily:'Outfit,system-ui'}}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`);

console.log('\n  All files created! Now run: npm run dev\n');
