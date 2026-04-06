'use client';
export default function StatsCard({ icon: Icon, label, value, sub, color = 'text-navy-300' }) {
  return (
    <div className="glass rounded-2xl p-5 glass-hover transition-all duration-200">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.06] ${color} mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p style={{fontFamily:'Outfit,system-ui'}} className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-white/40 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-white/25 mt-1">{sub}</p>}
    </div>
  );
}
