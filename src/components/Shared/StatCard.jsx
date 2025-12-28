import React from 'react';
import { Flame } from 'lucide-react';

export default function StatCard({ mainVal = 0, subVal = 0, streak = 0 }) {
  // HELPER: Formats numbers like 1200 -> 1.2K or 1000000 -> 1M
  const formatCompact = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 10000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toLocaleString();
  };

  // Logic to shrink text size based on string length
  const getFontSize = (val) => {
    const len = val.toString().length;
    if (len > 8) return 'text-xl'; 
    if (len > 5) return 'text-2xl';
    return 'text-4xl';
  };

  return (
    <div className="smart-glass rounded-[3rem] p-6 border flex justify-between items-center transition-all duration-700 shadow-2xl gap-2">
      
      {/* XP Section */}
      <div className="flex-[1.5] min-w-0">
        <p className={`${getFontSize(mainVal)} font-bold tracking-tighter leading-none truncate`}>
          {formatCompact(mainVal)}
        </p>
        <p className="text-[8px] font-black text-[rgb(var(--theme-primary))] uppercase tracking-[0.2em] mt-2 opacity-80 whitespace-nowrap">
          Total XP
        </p>
      </div>

      {/* Divider 1 - Switched to opacity instead of white/10 */}
      <div className="h-8 w-px bg-current opacity-10 shrink-0" />

      {/* Nodes Section */}
      <div className="text-center px-2 shrink-0">
        <p className="text-xl font-bold leading-none tracking-tight">
          {formatCompact(subVal)}
        </p>
        <p className="opacity-40 text-[7px] font-black uppercase mt-2 tracking-widest whitespace-nowrap">
          Nodes
        </p>
      </div>

      {/* Divider 2 */}
      <div className="h-8 w-px bg-current opacity-10 shrink-0" />

      {/* STREAK Section */}
      <div className="flex-1 min-w-0 flex flex-col items-end">
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="text-xl font-bold leading-none tracking-tight text-orange-500 truncate">
            {formatCompact(streak)}
          </p>
          <Flame size={14} className="text-orange-500 fill-orange-500/20 shrink-0" />
        </div>
        <p className="text-orange-500 opacity-50 text-[7px] font-black uppercase mt-2 tracking-widest whitespace-nowrap text-right">
          Day Streak
        </p>
      </div>
    </div>
  );
}
