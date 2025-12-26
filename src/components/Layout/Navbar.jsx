import React from 'react';
import { Home, Compass, Trophy, User, Terminal } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isAdmin, colors, isShrunk }) {
  const navItems = [
    { id: 'home', icon: Home },
    { id: 'explore', icon: Compass },
    { id: 'leaderboard', icon: Trophy },
    { id: 'profile', icon: User },
    { id: 'dev', icon: Terminal, admin: true },
  ];

  return (
    <div className="flex justify-center w-full pointer-events-none">
      <div className={`
        ${colors.nav} pointer-events-auto backdrop-blur-3xl rounded-[2.5rem] 
        flex items-center border shadow-2xl shadow-black/20 
        /* Synced to 500ms for theme colors, while layout handles the shrink */
        transition-all duration-500 ease-in-out
        ${isShrunk ? 'p-1 gap-0' : 'p-1.5 gap-1'}
      `}>
        {navItems.map((item) => (
          (!item.admin || isAdmin) && (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`
                /* Match global theme transition speed (500ms) */
                transition-all duration-500 ease-in-out relative flex items-center justify-center rounded-[2rem]
                ${isShrunk ? 'p-3 px-4' : 'p-4 px-6'}
                ${activeTab === item.id 
                  ? 'bg-[rgb(var(--theme-primary))]/10 text-[rgb(var(--theme-primary))] scale-105' 
                  : 'text-zinc-500 hover:text-[rgb(var(--theme-primary))]/60 active:scale-95'}
              `}
            >
              <item.icon 
                size={isShrunk ? 18 : 20} 
                strokeWidth={activeTab === item.id ? 2.5 : 2}
                /* Icon color transition now matches the background change speed */
                className="transition-colors duration-500"
              />
              
              {/* Active Indicator Dot */}
              {activeTab === item.id && !isShrunk && (
                <div className="absolute -bottom-1 w-1 h-1 bg-[rgb(var(--theme-primary))] rounded-full shadow-[0_0_8px_var(--theme-primary-glow)] transition-all duration-500" />
              )}
            </button>
          )
        ))}
      </div>
    </div>
  );
}
