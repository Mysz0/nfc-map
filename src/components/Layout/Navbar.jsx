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

  // Filter items based on admin status
  const visibleItems = navItems.filter(item => !item.admin || isAdmin);

  return (
    /* Outer fixed wrapper to ensure full-width centering */
    <div className="fixed bottom-6 left-0 right-0 flex justify-center w-full pointer-events-none z-50 px-4">
      <div className={`
        ${colors.nav} 
        pointer-events-auto backdrop-blur-3xl rounded-[2.5rem] 
        flex items-center border shadow-2xl shadow-black/20 
        
        /* Width: Full mobile width minus 2rem gutter, capped at md for larger screens */
        w-full max-w-md
        
        /* Layout Transitions */
        transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1)
        ${isShrunk ? 'p-1 gap-0 max-w-[320px]' : 'p-1.5 gap-1'}
      `}>
        {visibleItems.map((item) => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id)} 
            className={`
              /* flex-1 forces every tab to occupy exactly the same amount of space */
              relative flex flex-1 items-center justify-center rounded-[2rem]
              
              /* Interaction: Snappy transform effect */
              transition-all duration-200 ease-out
              
              /* Vertical padding provides height; horizontal padding removed so flex handles it */
              ${isShrunk ? 'py-2.5' : 'py-4'}
              
              ${activeTab === item.id 
                ? 'bg-[rgb(var(--theme-primary))]/10 text-[rgb(var(--theme-primary))] scale-105' 
                : 'text-zinc-500 hover:text-[rgb(var(--theme-primary))]/60 active:scale-90'}
            `}
          >
            <item.icon 
              size={isShrunk ? 18 : 22} 
              strokeWidth={activeTab === item.id ? 2.5 : 2}
              className="block flex-shrink-0"
            />
            
            {/* Active Indicator Dot */}
            {activeTab === item.id && !isShrunk && (
              <div className="absolute -bottom-1 w-1.5 h-1.5 bg-[rgb(var(--theme-primary))] rounded-full shadow-[0_0_8px_var(--theme-primary-glow)]" />
            )}

            {/* Subtle Tooltip for desktop only if you want */}
            <span className="sr-only">{item.id}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
