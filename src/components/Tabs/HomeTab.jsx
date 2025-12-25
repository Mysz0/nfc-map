import React, { useState, useMemo } from 'react';
import { Radar, Flame, CheckCircle2, MapPin, Zap, Lock, Search, Trophy, Filter } from 'lucide-react';
import StatCard from '../Shared/StatCard';
import { getDistance } from '../../utils/geoUtils';

export default function HomeTab({ 
  isNearSpot, 
  canClaim, 
  userLocation, 
  activeSpotId, 
  claimSpot, 
  totalPoints, 
  foundCount, 
  unlockedSpots = [], 
  spots = {}, 
  colors, 
  streak,
  spotStreaks = {}
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('ready'); // 'ready', 'streak', 'points', 'name'

  const currentSpot = activeSpotId ? spots[activeSpotId] : null;
  const todayStr = new Date().toDateString();
  
  const distance = (userLocation && currentSpot) 
    ? Math.round(getDistance(userLocation.lat, userLocation.lng, currentSpot.lat, currentSpot.lng))
    : null;

  const personalSpotData = activeSpotId ? spotStreaks?.[activeSpotId] : null;
  const lastClaimDate = personalSpotData?.last_claim ? new Date(personalSpotData.last_claim).toDateString() : null;
  const isLoggedToday = lastClaimDate === todayStr;
  const isGlobalStreakActive = (streak || 0) > 1;

  // --- SORTING & FILTERING LOGIC ---
  const filteredAndSortedNodes = useMemo(() => {
    return unlockedSpots
      .map(id => {
        const sInfo = spotStreaks[id];
        const isReady = sInfo?.last_claim ? new Date(sInfo.last_claim).toDateString() !== todayStr : true;
        return {
          id,
          ...spots[id],
          streakCount: sInfo?.streak || 0,
          isReady
        };
      })
      .filter(node => node.name?.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'ready') return b.isReady - a.isReady; // True (1) first
        if (sortBy === 'streak') return b.streakCount - a.streakCount;
        if (sortBy === 'points') return (b.points || 0) - (a.points || 0);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [unlockedSpots, spots, spotStreaks, searchQuery, sortBy, todayStr]);

  const getNodeRank = (s) => {
    if (s >= 10) return { color: 'text-yellow-400', label: 'Gold Mastery', bg: 'bg-yellow-400/10' };
    if (s >= 5) return { color: 'text-slate-300', label: 'Silver Tier', bg: 'bg-slate-300/10' };
    if (s >= 2) return { color: 'text-orange-400', label: 'Bronze Tier', bg: 'bg-orange-400/10' };
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* HEADER / CLAIM SECTION */}
      <div className="flex flex-col gap-3">
        {(isNearSpot && activeSpotId) ? (
          <div className="flex flex-col gap-3 animate-in zoom-in-95 duration-500">
            <div className={`flex items-center gap-3 ${colors?.card || 'bg-zinc-900'} border border-white/5 p-4 rounded-3xl relative overflow-hidden`}>
              {personalSpotData?.streak > 1 && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                  <MapPin size={8} className="text-emerald-500" />
                  <span className="text-[8px] font-black text-white/50">{personalSpotData.streak}x</span>
                </div>
              )}

              <div className={`${isLoggedToday ? 'bg-zinc-800' : canClaim ? 'bg-emerald-500' : 'bg-orange-500'} p-2 rounded-xl text-white`}>
                <Radar size={16} className={isLoggedToday ? "" : "animate-pulse"} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${
                  isLoggedToday ? 'text-zinc-600' : canClaim ? 'text-emerald-500' : 'text-orange-500'
                }`}>
                  {isLoggedToday ? "Signal Offline" : canClaim ? "Ready to Sync" : "Approaching Node"}
                </p>
                <p className="text-xs text-zinc-400 truncate font-bold uppercase tracking-tight">
                  {currentSpot?.name || 'Locating Node...'}
                </p>
              </div>
            </div>

            <button 
              disabled={isLoggedToday || !canClaim}
              onClick={() => claimSpot(activeSpotId)}
              className={`w-full py-4 rounded-[2rem] font-black text-sm uppercase tracking-tight transition-all flex items-center justify-center gap-2 active:scale-95 border ${
                isLoggedToday 
                  ? 'bg-zinc-900/40 border-white/5 text-zinc-700 cursor-not-allowed' 
                  : canClaim 
                    ? 'bg-emerald-500 border-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-zinc-900/60 border-white/5 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {isLoggedToday ? <><Lock size={16} /><span>Logged Today</span></> : canClaim ? <><MapPin size={18} /><span>Claim Point</span></> : <><Radar size={16} className="animate-spin-slow" /><span>Move Closer ({distance}m)</span></>}
            </button>
          </div>
        ) : (
          <div className={`flex flex-col items-center justify-center p-8 rounded-[2.5rem] border border-white/5 ${colors?.card || 'bg-zinc-900'} opacity-60`}>
             <Search className="text-zinc-500 mb-4" size={32} />
             <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Scanning Area</p>
          </div>
        )}

        <div className={`flex items-center gap-3 ${colors?.card || 'bg-zinc-900'} p-4 rounded-3xl border ${isGlobalStreakActive ? 'border-orange-500/30' : 'border-white/5'}`}>
          <Flame size={20} className={isGlobalStreakActive ? "text-orange-500 animate-bounce" : "text-zinc-500"} />
          <div>
            <p className={`text-sm font-black ${isGlobalStreakActive ? 'text-orange-500' : 'text-white'}`}>{streak || 0} Day Activity</p>
            <p className="text-[8px] font-bold opacity-40 uppercase tracking-widest">Global Streak</p>
          </div>
        </div>
      </div>

      <StatCard mainVal={totalPoints} subVal={foundCount} colors={colors} />

      {/* SEARCH AND SORT SECTION */}
      <div className="px-1 space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
            <input 
              type="text"
              placeholder="SEARCH NODES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <div className="relative">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-zinc-900/50 border border-white/5 rounded-2xl py-3 pl-4 pr-10 text-[10px] font-black tracking-widest uppercase focus:outline-none"
            >
              <option value="ready">Ready</option>
              <option value="streak">Streak</option>
              <option value="points">XP</option>
              <option value="name">A-Z</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={14} />
          </div>
        </div>

        {/* COLLECTIONS LIST */}
        <div className="space-y-3">
          <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 px-4">Your Nodes</h2>

          {filteredAndSortedNodes.length === 0 ? (
            <div className="p-10 text-center text-[10px] uppercase font-bold opacity-20">No matching logs</div>
          ) : (
            <div className="grid gap-3 pb-8">
              {filteredAndSortedNodes.map(node => {
                const rank = getNodeRank(node.streakCount);

                return (
                  <div key={node.id} className={`${colors?.card || 'bg-zinc-900'} p-5 rounded-[2.2rem] flex items-center justify-between border border-white/5 relative overflow-hidden`}>
                    
                    {/* Ready Indicator Bar */}
                    {node.isReady && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[2px_0_10px_rgba(16,185,129,0.3)]" />
                    )}

                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${rank ? rank.bg + ' ' + rank.color : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {node.streakCount >= 10 ? <Trophy size={18} /> : node.streakCount > 1 ? <Flame size={18} fill="currentColor" /> : <CheckCircle2 size={18} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm tracking-tight">{node.name || 'Unknown Node'}</p>
                          {node.isReady && (
                            <span className="bg-emerald-500/20 text-emerald-500 text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase">Ready</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                            {node.isReady ? 'Awaiting Sync' : 'Secured'}
                          </span>
                          {node.streakCount > 1 && (
                            <span className={`text-[9px] font-black uppercase flex items-center gap-1 ${rank?.color || 'text-orange-500'}`}>
                              <MapPin size={8} />
                              {node.streakCount}x Streak
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-zinc-300">+{node.points || 0}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
