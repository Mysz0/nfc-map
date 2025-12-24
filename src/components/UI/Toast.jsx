import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Toast({ statusMsg }) {
  if (!statusMsg.text) return null;

  const isError = statusMsg.type === 'error';

  return (
    <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[10001] flex items-center gap-2 px-6 py-3 rounded-2xl border backdrop-blur-xl transition-all animate-in fade-in slide-in-from-top-4 duration-300 ${
      isError 
        ? 'bg-red-500/10 border-red-500/20 text-red-400' 
        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
    }`}>
      {isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
      <span className="text-sm font-bold tracking-tight">{statusMsg.text}</span>
    </div>
  );
}
