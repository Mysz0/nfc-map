import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Radar, Flame, CheckCircle2, MapPin, Zap, Lock, Search, Trophy, ChevronDown, Check } from 'lucide-react';
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
  const [sortBy, setSortBy] = useState('ready'); 
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const selectRef = useRef(null);

  const todayStr = new Date().toDateString();
  const currentSpot = activeSpotId ? spots[activeSpotId] : null;
  
  const distance = (userLocation && currentSpot) 
    ? Math.round(getDistance(userLocation.lat, userLocation.lng, currentSpot.lat, currentSpot.lng))
    : null;

  const personalSpotData = activeSpotId ? spotStreaks?.[activeSpotId] : null;
  const isLoggedToday = personalSpotData?.last_claim && new Date(personalSpotData.last_claim).toDateString() === todayStr;

  // Options for our custom select
  const sortOptions = [
    { id: 'ready', label: 'Ready to Sync', icon: Zap },
    { id: 'streak', label: 'Highest Streak', icon: Flame },
    { id: 'points', label: 'Most XP', icon: Trophy },
    { id: 'name', label: 'Alphabetical', icon: Search }
  ];

  const currentSortLabel = sortOptions.find(o => o.id === sortBy)?.label;

  // Close custom select when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) setIsSelectOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAndSortedNodes = useMemo(() => {
    return unlockedSpots
      .map(id => {
        const sInfo = spotStreaks[id];
        const isReady = sInfo?.last_claim ? new Date(sInfo.last_claim).toDateString() !== todayStr : true;
        return { id, ...spots[id], streakCount: sInfo?.streak || 0, isReady };
      })
      .filter(node => node.name?.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'ready') return b.isReady - a.isReady;
        if (sortBy === 'streak') return b.streakCount - a.streakCount;
        if (sortBy === 'points') return (b.points || 0) - (a.points || 0);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [unlockedSpots, spots, spotStreaks, searchQuery, sortBy, todayStr]);

  const getNodeRank = (s) => {
    if (s >= 10) return { color: 'text-yellow-400', bg: 'bg-yellow-400/10' };
    if (s >= 5) return { color: 'text-slate-300', bg: 'bg-slate-300/10' };
    if (s >= 2) return { color: 'text-orange-400', bg: 'bg-orange-400/10' };
    return { color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* SCANNER SECTION */}
      <div className="flex flex-col gap-3">
        {(isNearSpot && activeSpotId) ? (
          <div className="flex flex-col gap-3">
            <div className={`flex items-center gap-3 ${colors?.card || 'bg-zinc-900'} border border-white/5 p-4 rounded-3xl relative overflow-hidden`}>
              <div className={`${isLoggedToday ? 'bg-zinc-800' : canClaim ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-orange-500'} p-2 rounded-xl text-white transition-colors`}>
                <Radar size={16} className={isLoggedToday ? "" : "animate-pulse"} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isLoggedToday ? 'text-zinc-600' : 'text-emerald-500'}`}>
                  {isLoggedToday ? "Offline" : "Live Signal"}
                </p>
                <p className="text-xs text-zinc-400 truncate font-bold uppercase tracking-tight">{currentSpot?.name}</p>
              </div>
            </div>
            <button 
              disabled={isLoggedToday || !canClaim}
              onClick={() => claimSpot(activeSpotId)}
              className={`w-full py-4 rounded-[2rem] font-black text-sm uppercase transition-all active:scale-95 border ${
                isLoggedToday ? 'bg-zinc-900/40 border-white/5 text-zinc-700' : 'bg-emerald-500 border-emerald-400 text-zinc-950'
              }`}
            >
              {isLoggedToday ? "Logged Today" : canClaim ? "Sync Node" : `Range: ${distance}m`}
            </button>
          </div>
        ) : (
          <div className="h-24 flex flex-col items-center justify-center rounded-[2rem] border border-white/5 bg-zinc-900/40 opacity-50">
             <Search className="text-zinc-700 mb-1" size={20} />
             <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Scanning Area...</p>
          </div>
        )}
      </div>

      <StatCard mainVal={totalPoints} subVal={foundCount} colors={colors} />

      {/* SEARCH AND CUSTOM SELECT */}
      <div className="space-y-3 px-1">
        <div className="flex gap-2">
          {/* Custom Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
            <input 
              type="text"
              placeholder="SEARCH..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/80 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-[10px] font-black text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>

          {/* CUSTOM SELECT DROPDOWN */}
          <div className="relative" ref={selectRef}>
            <button 
              onClick={() => setIsSelectOpen(!isSelectOpen)}
              className="h-full px-4 bg-zinc-900/80 border border-white/5 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400 active:bg-zinc-800 transition-all"
            >
              <span>{sortBy.toUpperCase()}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isSelectOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSelectOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-[100] py-2 animate-in fade-in zoom-in-95 duration-200">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { setSortBy(opt.id); setIsSelectOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <opt.icon size={14} className={sortBy === opt.id ? 'text-emerald-500' : 'text-zinc-600'} />
                      <span className={`text-[10px] font-black uppercase ${sortBy === opt.id ? 'text-white' : 'text-zinc-500'}`}>
                        {opt.label}
                      </span>
                    </div>
                    {sortBy === opt.id && <Check size={14} className="text-emerald-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* NODES LIST */}
        <div className="grid gap-3 pb-24 pt-2">
          {filteredAndSortedNodes.map(node => {
            const rank = getNodeRank(node.streakCount);
            return (
              <div key={node.id} className="relative group transition-all">
                {node.isReady && (
                  <div className="absolute -left-1 top-4 bottom-4 w-1 bg-emerald-500 rounded-full z-10 shadow-[0_0_10px_#10b981]" />
                )}
                <div className="bg-zinc-900/80 border border-white/5 p-5 rounded-[2.2rem] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${rank.bg} ${rank.color}`}>
                      {node.streakCount >= 10 ? <Trophy size={18} /> : node.streakCount > 1 ? <Flame size={18} fill="currentColor" /> : <CheckCircle2 size={18} />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-zinc-200">{node.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[9px] font-black uppercase tracking-tighter ${node.isReady ? 'text-emerald-500' : 'text-zinc-600'}`}>
                          {node.isReady ? 'Sync Required' : 'Secured'}
                        </span>
                        {node.streakCount > 1 && <span className="text-[9px] text-zinc-500 font-bold">• STREAK {node.streakCount}x</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-black text-zinc-400">+{node.points}XP</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
