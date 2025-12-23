import React from 'react';
import { Radar } from 'lucide-react';

const HomeView = ({ isNearSpot, totalPoints, unlockedSpots, spots, colors }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
    {isNearSpot && (
      <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-3xl animate-in zoom-in-95 duration-500">
        <div className="bg-emerald-500 p-2 rounded-xl text-white animate-pulse">
           <Radar size={16} />
        </div>
        <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Signal Detected: You are within 1km of a point!</p>
      </div>
    )}

    <div className={`${colors.card} backdrop-blur-2xl rounded-[3rem] p-10 border flex justify-between items-center`}>
      <div>
        <p className="text-6xl font-bold tracking-tighter leading-none">{totalPoints}</p>
        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] mt-4">Experience</p>
      </div>
      <div className="h-12 w-px bg-emerald-500/10" />
      <div className="text-right">
        <p className="text-3xl font-bold leading-none">{unlockedSpots.length}</p>
        <p className="text-zinc-500 text-[10px] font-bold uppercase mt-1">Found</p>
      </div>
    </div>

    <div className="space-y-3">
      <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500/50 px-4">Collections</h2>
      {unlockedSpots.map(id => (
        <div key={id} className={`collection-card ${colors.card} p-5 rounded-[2.2rem] flex items-center justify-between border transition-all duration-300 hover:scale-[1.02] backdrop-blur-md`}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center font-bold">✓</div>
            <div>
              <p className="font-bold text-sm tracking-tight">{spots[id]?.name}</p>
              <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Entry Logged</p>
            </div>
          </div>
          <div className="text-xs font-bold opacity-30">+{spots[id]?.points}</div>
        </div>
      ))}
    </div>
  </div>
);

export default HomeView;
