import React from 'react';
import { Radar, Flame, CheckCircle2 } from 'lucide-react';
import StatCard from '../Shared/StatCard';

export default function HomeTab({ 
  isNearSpot, 
  totalPoints, 
  foundCount, 
  unlockedSpots, 
  spots, 
  colors, 
  streak 
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* HEADER SECTION: Signal & Streak */}
      <div className="flex gap-3">
        {isNearSpot && (
          <div className="flex-[2] flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-3xl animate-in zoom-in-95 duration-500">
            <div className="bg-emerald-500 p-2 rounded-xl text-white animate-pulse">
              <Radar size={16} />
            </div>
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
              Signal Detected!
            </p>
          </div>
        )}

        {/* STREAK CARD */}
        <div className={`flex-1 flex items-center gap-3 ${colors.card} p-4 rounded-3xl border transition-all duration-500 ${streak > 1 ? 'border-orange-500/30' : 'border-white/5'}`}>
          <div className={`${streak > 1 ? 'text-orange-500' : 'text-zinc-500'} transition-colors`}>
            <Flame size={20} className={streak > 1 ? "animate-bounce" : ""} />
          </div>
          <div>
            <p className={`text-sm font-black leading-none ${streak > 1 ? 'text-orange-500' : colors.text}`}>
              {streak || 0}
            </p>
            <p className="text-[8px] font-bold opacity-40 uppercase tracking-widest">Streak</p>
          </div>
        </div>
      </div>

      {/* MAIN STATS */}
      <StatCard mainVal={totalPoints} subVal={foundCount} colors={colors} />

      {/* COLLECTIONS LIST */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-4">
          <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500/50">
            Collections
          </h2>
          {streak > 1 && (
            <span className="text-[8px] font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded-lg uppercase tracking-tighter">
              1.1x Streak Active
            </span>
          )}
        </div>

        {unlockedSpots.length === 0 ? (
          <div className={`${colors.card} p-10 rounded-[2.2rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center opacity-50`}>
            <p className="text-xs font-bold uppercase tracking-widest">No spots logged yet</p>
            <p className="text-[10px]">Explore the map to find signals</p>
          </div>
        ) : (
          unlockedSpots.map(id => {
            const spot = spots[id];
            const basePoints = spot?.points || 0;
            // Visual representation of points
            const displayPoints = streak > 1 ? Math.round(basePoints * 1.1) : basePoints;

            return (
              <div 
                key={id} 
                className={`collection-card ${colors.card} p-5 rounded-[2.2rem] flex items-center justify-between border transition-all duration-300 hover:scale-[1.02] backdrop-blur-md`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm tracking-tight">{spot?.name || 'Unknown Spot'}</p>
                    <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">
                      Entry Logged
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-xs font-black ${streak > 1 ? 'text-orange-500' : 'opacity-40'}`}>
                    +{displayPoints}
                  </div>
                  {streak > 1 && (
                    <div className="text-[8px] font-bold text-orange-500/50 line-through">
                      {basePoints}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
