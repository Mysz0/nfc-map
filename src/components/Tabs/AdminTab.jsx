import React from 'react';
import { Terminal, Trash2, Zap } from 'lucide-react';

export default function AdminTab({ spots, unlockedSpots, claimSpot, removeSpot, isDark, colors }) {
  return (
    <div className={`${colors.glass} p-8 rounded-[3rem] border space-y-6 animate-in fade-in zoom-in-95 duration-300`}>
      <h2 className="font-bold uppercase flex items-center gap-2 text-[10px] tracking-widest text-emerald-500">
        <Terminal size={14}/> Node Override
      </h2>
      <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
        {Object.values(spots).map(spot => {
          const isClaimed = unlockedSpots.includes(spot.id);
          return (
            <div key={spot.id} className={`${isDark ? 'bg-white/5' : 'bg-white/30'} p-4 rounded-[1.8rem] flex justify-between items-center border border-white/5 hover:border-emerald-500/20 transition-all`}>
              <span className="text-xs font-bold tracking-tight">{spot.name}</span>
              <div className="flex gap-2">
                {isClaimed ? (
                  <button onClick={() => removeSpot(spot.id)} className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                    <Trash2 size={16}/>
                  </button>
                ) : (
                  <button onClick={() => claimSpot(spot.id)} className="p-2.5 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all">
                    <Zap size={16}/>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
