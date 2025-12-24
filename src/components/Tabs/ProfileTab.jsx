import React from 'react';

export default function ProfileTab({ 
  tempUsername, 
  setTempUsername, 
  saveUsername, 
  showEmail, 
  toggleEmailVisibility, 
  colors, 
  isDark 
}) {
  return (
    <div className={`${colors.glass} p-10 rounded-[3rem] border space-y-8 animate-in fade-in zoom-in-95 duration-300`}>
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest ml-1">Identity</label>
        <input 
          type="text" value={tempUsername} onChange={(e) => setTempUsername(e.target.value)}
          className={`w-full ${isDark ? 'bg-black/20 border-white/10' : 'bg-white/40 border-emerald-200/50'} border rounded-2xl py-5 px-6 font-bold outline-none focus:border-emerald-500 transition-all text-sm`}
          placeholder="Your callsign..."
        />
      </div>

      {/* Email Visibility Toggle */}
      <div className="flex items-center justify-between px-1">
        <div className="space-y-0.5">
          <p className="text-xs font-bold uppercase tracking-tight">Display Email</p>
          <p className="text-[10px] text-zinc-500">Show your GitHub contact in header</p>
        </div>
        <button 
          onClick={toggleEmailVisibility}
          className={`w-12 h-6 rounded-full transition-all duration-300 relative ${showEmail ? 'bg-emerald-500' : 'bg-zinc-700/50'}`}
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${showEmail ? 'left-7' : 'left-1'}`} />
        </button>
      </div>

      <button onClick={saveUsername} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all text-sm">
        Apply Changes
      </button>
    </div>
  );
}
