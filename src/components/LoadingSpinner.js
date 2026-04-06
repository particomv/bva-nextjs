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
