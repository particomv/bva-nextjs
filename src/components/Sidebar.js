'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserCheck, Calendar, CreditCard, Trophy, ClipboardList, Package, GraduationCap, Handshake, BarChart3, Settings, X, Stethoscope, Award, Image, CalendarDays, Bell, Key, MessageCircle, UserPlus, ShoppingBag, Volleyball, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const navGroups = [
  { label: 'Main', items: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Players', href: '/dashboard/players', icon: Users },
    { label: 'Coaches', href: '/dashboard/coaches', icon: UserCheck },
    { label: 'Teams', href: '/dashboard/teams', icon: ClipboardList },
  ]},
  { label: 'Operations', items: [
    { label: 'Attendance', href: '/dashboard/attendance', icon: Calendar },
    { label: 'Payments', href: '/dashboard/payments', icon: CreditCard },
    { label: 'Schedules', href: '/dashboard/schedules', icon: CalendarDays },
    { label: 'Programs', href: '/dashboard/programs', icon: ClipboardList },
  ]},
  { label: 'Competition', items: [
    { label: 'Matches', href: '/dashboard/matches', icon: Trophy },
    { label: 'Tournaments', href: '/dashboard/tournaments', icon: Trophy },
    { label: 'Court', href: '/dashboard/court', icon: Volleyball },
  ]},
  { label: 'Data', items: [
    { label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
    { label: 'Medical', href: '/dashboard/medical', icon: Stethoscope },
    { label: 'Badges', href: '/dashboard/badges', icon: Award },
    { label: 'Equipment', href: '/dashboard/equipment', icon: Package },
  ]},
  { label: 'Communication', items: [
    { label: 'Notices', href: '/dashboard/notices', icon: Bell },
    { label: 'Messages', href: '/dashboard/messaging', icon: MessageCircle },
    { label: 'Events', href: '/dashboard/events', icon: CalendarDays },
    { label: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
    { label: 'Key Parents', href: '/dashboard/keyparents', icon: Users },
    { label: 'Sponsors', href: '/dashboard/sponsors', icon: Handshake },
  ]},
  { label: 'System', items: [
    { label: 'Users', href: '/dashboard/users', icon: Key },
    { label: 'Applications', href: '/dashboard/applications', icon: UserPlus },
    { label: 'Gallery', href: '/dashboard/gallery', icon: Image },
    { label: 'Graduated', href: '/dashboard/graduated', icon: GraduationCap },
    { label: 'ExCo', href: '/dashboard/exco', icon: Users },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]},
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState({});
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0a0e17]/95 backdrop-blur-xl border-r border-white/[0.06] z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F9CF9] to-[#22D3EE] flex items-center justify-center"><Volleyball className="w-5 h-5 text-white" /></div>
            <div><h1 className="text-sm font-bold text-white tracking-tight">Blues Academy</h1><p className="text-[10px] text-white/30 font-medium">Police Club MPS</p></div>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2 px-3">
          {navGroups.map(group => (
            <div key={group.label} className="mb-1">
              <button onClick={() => setCollapsed(p => ({...p, [group.label]: !p[group.label]}))} className="flex items-center justify-between w-full px-3 py-1.5 text-[9px] font-bold text-white/25 uppercase tracking-widest hover:text-white/40">
                {group.label}<ChevronDown className={`w-3 h-3 transition-transform ${collapsed[group.label] ? '-rotate-90' : ''}`} />
              </button>
              {!collapsed[group.label] && <div className="space-y-0.5 mt-0.5">
                {group.items.map(item => {
                  const active = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                  return (<Link key={item.href} href={item.href} onClick={onClose} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[12px] font-medium transition-all ${active ? 'bg-[#4F9CF9]/10 text-[#4F9CF9] border border-[#4F9CF9]/20' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-transparent'}`}><item.icon className="w-[16px] h-[16px]" />{item.label}</Link>);
                })}
              </div>}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
