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
      <aside className={`fixed top-0 left-0 h-full w-64 bg-navy-900/95 backdrop-blur-xl border-r border-white/[0.06] z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static ${open ? 'translate-x-0' : '-translate-x-full'}`}>
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-navy-500/30 text-white' : 'text-white/45 hover:text-white/80 hover:bg-white/[0.04]'}`}>
                <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-accent-gold' : ''}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-white/[0.06]">
          <p className="text-[10px] text-white/20">v2.0 \u00b7 Next.js + Supabase</p>
        </div>
      </aside>
    </>
  );
}
