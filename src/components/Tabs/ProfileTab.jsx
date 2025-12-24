import React from 'react';
import { Calendar } from 'lucide-react';

export default function ProfileTab({ 
  tempUsername, 
  setTempUsername, 
  saveUsername, 
  showEmail, 
  toggleEmailVisibility, 
  colors, 
  isDark,
  lastChange,
  user // Added user prop here
}) {
  // Determine provider name (Google, Github, etc.)
  const provider = user?.app_metadata?.provider || 'account';
  const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);

  const getCooldownInfo = () => {
    if (!lastChange) return null;
    const last = new Date(lastChange).getTime();
    const daysPassed = (new Date().getTime() - last) / (1000 * 60 * 60 * 24);
    if (daysPassed >= 7) return null;
    return Math.ceil(7 - daysPassed);
  };

  const daysLeft = getCooldownInfo();

  return (
    <div className={`${colors.glass} p-10 rounded-[3rem] border space-y-8 animate-in fade-in zoom-in-95 duration-300`}>
      <div className="space-y-3">
        <div className="flex justify-between items-end ml-1">
          <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Identity</label>
          {daysLeft && (
            <span className="text-[9px] font-bold text-zinc-500 uppercase flex items-center gap-1">
              <Calendar size={10} /> Lock: {daysLeft}d
            </span>
          )}
        </div>
        <input 
          type="text" 
          value={tempUsername} 
          onChange={(e) => setTempUsername(e.target.value)}
          className={`w-full ${isDark ? 'bg-black/20 border-white/10 text-white' : 'bg-white/40 border-emerald-200/50 text-zinc-900'} border rounded-2xl py-5 px-6 font-bold outline-none focus:border-emerald-500 transition-all text-sm`}
          placeholder="Your callsign..."
        />
        <button 
          onClick={saveUsername}
          disabled={!!daysLeft}
          className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
            daysLeft 
            ? 'bg-zinc-500/10 text-zinc-500 cursor-not-allowed' 
            : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 active:scale-95'
          }`}
        >
          {daysLeft ? 'Identity Locked' : 'Update Identity'}
        </button>
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="space-y-0.5">
          <p className="text-xs font-bold uppercase tracking-tight">Display Email</p>
          {/* DYNAMIC TEXT HERE */}
          <p className="text-[10px] text-zinc-500">Show your {providerName} contact in header</p>
        </div>
        <button 
          onClick={toggleEmailVisibility}
          className={`w-12 h-6 rounded-full transition-all relative ${showEmail ? 'bg-emerald-500' : 'bg-zinc-700'}`}
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${showEmail ? 'left-7' : 'left-1'}`} />
        </button>
      </div>
    </div>
  );
}
