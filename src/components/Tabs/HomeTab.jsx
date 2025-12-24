import React from 'react';
import { Radar, Flame, CheckCircle2, MapPin, Zap, Clock } from 'lucide-react';
import StatCard from '../Shared/StatCard';

export default function HomeTab({ 
  isNearSpot, 
  activeSpotId, 
  claimSpot, 
  totalPoints, 
  foundCount, 
  unlockedSpots, 
  spots, 
  colors, 
  streak 
}) {
  // Check if this spot was EVER found
  const hasBeenFoundBefore = activeSpotId && unlockedSpots.includes(activeSpotId);
  const currentSpot = spots[activeSpotId];

  // Logic to check if we can claim it today
  // Note: Your useGameLogic handles the "already claimed today" check via toast,
  // but we show the button if it's a nearby signal.
  const isStreakActive = streak > 1;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* HEADER SECTION: Signal & Action */}
      <div className="flex flex-col gap-3">
        {isNearSpot && (
          <div className="flex flex-col gap-3 animate-in zoom-in-95 duration-500">
            {/* Signal Banner */}
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-3xl">
              <div className="bg-emerald-500 p-2 rounded-xl text-white animate-pulse">
                <Radar size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest leading-none mb-1">
                  {hasBeenFoundBefore ? "Known Signal Detected" : "New Signal Detected"}
                </p>
                <p className={`text-[10px] ${colors.text} opacity-60 truncate font-medium uppercase`}>
                  Source: {currentSpot?.name || 'Unknown Location'}
                </p>
              </div>
            </div>

            {/* DYNAMIC CLAIM BUTTON */}
            <button 
              onClick={() => claimSpot(activeSpotId)}
              className={`group relative w-full overflow-hidden py-4 rounded-[2rem] font-black text-sm uppercase tracking-tight transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg ${
                hasBeenFoundBefore 
                  ? 'bg-orange-500 text-white shadow-orange-500/20' 
                  : 'bg-emerald-500 text-zinc-950 shadow-emerald-500/20'
              }`}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              
              {hasBeenFoundBefore ? (
                <>
                  <Clock size={18} className="relative z-10" />
                  <span className="relative z-10">Daily Re-Log {isStreakActive && `(${streak}d)`}</span>
                </>
              ) : (
                <>
                  <MapPin size={18} className="relative z-10" />
                  <span className="relative z-10">Claim Access Point</span>
                </>
              )}
              <Zap size={14} className="relative z-10 fill-current" />
            </button>
          </div>
        )}

        {/* STREAK & MULTIPLIER STATS */}
        <div className="flex gap-3">
          <div className={`flex-[1.5] flex items-center gap-3 ${colors.card} p-4 rounded-3xl border transition-all duration-500 ${isStreakActive ? 'border-orange-500/30' : 'border-white/5'}`}>
            <div className={`${isStreakActive ? 'text-orange-500' : 'text-zinc-500'} transition-colors`}>
              <Flame size={20} className={isStreakActive ? "animate-bounce" : ""} />
            </div>
            <div>
              <p className={`text-sm font-black leading-none ${isStreakActive ? 'text-orange-500' : colors.text}`}>
                {streak || 0} Day Streak
              </p>
              <p className="text-[8px] font-bold opacity-40 uppercase tracking-widest">Consistency Bonus</p>
            </div>
          </div>
          
          {isStreakActive && (
            <div className="flex-1 flex items-center justify-center bg-orange-500/10 border border-orange-500/20 p-4 rounded-3xl animate-in fade-in zoom-in duration-1000">
              <span className="text-[10px] font-black text-orange-500 uppercase italic">1.1x Boost</span>
            </div>
          )}
        </div>
      </div>

      {/* MAIN STATS DISPLAY */}
      <StatCard mainVal={totalPoints} subVal={foundCount} colors={colors} />

      {/* COLLECTIONS LIST */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-4">
          <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500/50">
            Secure Entry Logs
          </h2>
          <span className="text-[8px] font-bold opacity-30 uppercase tracking-widest">
            {unlockedSpots.length} Total Nodes
          </span>
        </div>

        {unlockedSpots.length === 0 ? (
          <div className={`${colors.card} p-12 rounded-[2.5rem] border border-dashed border-white/5 flex flex-col items-center justify-center text-center`}>
            <div className="w-12 h-12 bg-zinc-500/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
              <Radar size={20} className="text-zinc-600" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-40">No Signal History</p>
            <p className="text-[9px] opacity-30 mt-1 uppercase">Move within 250m of a pin to begin sequence</p>
          </div>
        ) : (
          <div className="grid gap-3 pb-4">
            {[...unlockedSpots].reverse().map(id => {
              const spot = spots[id];
              const basePoints = spot?.points || 0;
              const displayPoints = isStreakActive ? Math.round(basePoints * 1.1) : basePoints;

              return (
                <div 
                  key={id} 
                  className={`collection-card ${colors.card} p-5 rounded-[2.2rem] flex items-center justify-between border transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] backdrop-blur-md`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm tracking-tight">{spot?.name || 'Unknown Node'}</p>
                      <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-[0.1em]">
                        {hasBeenFoundBefore && id === activeSpotId ? "Active Session" : "Integrity Verified"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-xs font-black ${isStreakActive ? 'text-orange-500' : colors.text}`}>
                      +{displayPoints}
                    </div>
                    {isStreakActive && (
                      <div className="flex items-center justify-end gap-0.5 text-[7px] font-bold text-orange-500/50 uppercase">
                        <Flame size={8} />
                        Bonus
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
