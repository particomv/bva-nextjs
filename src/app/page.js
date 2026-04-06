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
            Police Club \u00b7 Maldives Police Service
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
        <p className="text-center text-white/20 text-xs mt-6">Blues for Volleyball Academy \u00a9 2026</p>
      </div>
    </div>
  );
}
