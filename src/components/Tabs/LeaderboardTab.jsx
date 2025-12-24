import React from 'react';

export default function LeaderboardTab({ leaderboard, username, colors }) {
  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500/50 px-4">Global Rankings</h2>
      {leaderboard.map((entry, index) => (
        <div key={index} className={`collection-card ${colors.card} p-5 rounded-[2.2rem] flex items-center justify-between border backdrop-blur-md`}>
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 ${index === 0 ? 'bg-emerald-500 text-white shadow-lg' : 'bg-emerald-500/10 text-emerald-500'} rounded-2xl flex items-center justify-center font-black text-xs`}>{index + 1}</div>
            <div>
              <p className={`font-bold text-sm ${entry.username === username ? 'text-emerald-500' : ''}`}>@{entry.username}</p>
              <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">{entry.found} Nodes Secured</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-black tracking-tighter">{entry.score}</p>
            <p className="text-[8px] font-bold opacity-30 uppercase">Total XP</p>
          </div>
        </div>
      ))}
    </div>
  );
}
