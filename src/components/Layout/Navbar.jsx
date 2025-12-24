import React from 'react';
import { Home, Compass, Trophy, User, Terminal } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isAdmin, colors }) {
  const navItems = [
    { id: 'home', icon: Home },
    { id: 'explore', icon: Compass },
    { id: 'leaderboard', icon: Trophy },
    { id: 'profile', icon: User },
    { id: 'dev', icon: Terminal, admin: true },
  ];

  return (
    <nav className="fixed bottom-10 left-8 right-8 z-[9999] flex justify-center">
      <div className={`${colors.nav} backdrop-blur-3xl rounded-[2.5rem] p-1.5 flex items-center border shadow-2xl shadow-black/10`}>
        {navItems.map((item) => (
          (!item.admin || isAdmin) && (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`p-4 px-6 rounded-[2rem] transition-all duration-500 ${activeTab === item.id ? 'bg-emerald-500/10 text-emerald-500 scale-110' : 'text-zinc-500 hover:text-emerald-500/40'}`}
            >
              <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2}/>
            </button>
          )
        ))}
      </div>
    </nav>
  );
}
