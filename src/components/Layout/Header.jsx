import React from 'react';
import { LogOut } from 'lucide-react';

export default function Header({ isAdmin, username, isDark, logoutMag, handleLogout }) {
  return (
    <header className="relative pt-16 pb-32 px-10 rounded-b-[4.5rem] border-b border-white/[0.05] overflow-hidden">
      <div className="absolute inset-0 mist-overlay z-0" />
      <div className={`absolute inset-0 ${isDark ? 'bg-zinc-950/40' : 'bg-white/10'} backdrop-blur-3xl z-10`} />
      
      <div className="max-w-md mx-auto flex justify-between items-center relative z-20">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
             {isAdmin ? (
               <span className="text-[7px] font-black tracking-[0.2em] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">ADMIN ACCESS</span>
             ) : (
               <span className="text-[7px] font-black tracking-[0.2em] text-zinc-500 uppercase">Explorer Mode</span>
             )}
          </div>
          <h1 className="text-3xl font-bold tracking-tighter italic uppercase">
            {username || 'Hunter'}<span className="text-emerald-500 font-normal">.</span>
          </h1>
        </div>
        
        <button 
          ref={logoutMag.ref} onMouseMove={logoutMag.handleMouseMove} onMouseLeave={logoutMag.reset}
          style={{ transform: `translate(${logoutMag.position.x}px, ${logoutMag.position.y}px)` }}
          onClick={handleLogout} 
          className={`p-3.5 rounded-2xl border transition-all duration-300 active:scale-90 z-30 ${isDark ? 'bg-white/[0.03] border-white/[0.05] text-zinc-500' : 'bg-white/80 border-emerald-100 text-emerald-600 shadow-sm'}`}
        >
          <LogOut size={18}/>
        </button>
      </div>
    </header>
  );
}
