import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Toast({ statusMsg, setStatusMsg }) {
  // Logic to clear the message after 3 seconds
  useEffect(() => {
    if (statusMsg.text) {
      const timer = setTimeout(() => {
        setStatusMsg({ text: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg.text, setStatusMsg]);

  if (!statusMsg.text) return null;

  const isError = statusMsg.type === 'error';

  return (
    <div className={`
      fixed top-24 left-1/2 -translate-x-1/2 z-[10001] 
      flex items-center gap-3 px-6 py-3.5 rounded-2xl border 
      smart-glass shadow-2xl transition-all 
      animate-in fade-in slide-in-from-top-4 duration-300
      w-max max-w-[90vw] whitespace-nowrap
      ${isError 
        ? 'border-red-500/30 text-red-500 shadow-red-500/10' 
        : 'border-[rgb(var(--theme-primary))]/30 text-[rgb(var(--theme-primary))] shadow-[var(--theme-primary-glow)]'
      }
    `}>
      <div className="flex-shrink-0">
        {isError ? (
          <AlertCircle size={18} className="animate-pulse" />
        ) : (
          <CheckCircle2 size={18} />
        )}
      </div>
      
      <span className="text-[11px] font-black uppercase tracking-wider">
        {statusMsg.text}
      </span>
    </div>
  );
}
