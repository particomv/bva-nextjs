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
            <p className={`text-[11px] flex items-center gap-1 justify-end ${role.color}`}>
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
