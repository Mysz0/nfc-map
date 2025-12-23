import React from 'react';
import { Home, Compass, User, Terminal } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab, isAdmin, colors }) => (
  <nav className="fixed bottom-10 left-8 right-8 z-[9999] flex justify-center">
    <div className={`${colors.nav} backdrop-blur-3xl rounded-[2.5rem] p-1.5 flex items-center border shadow-2xl shadow-black/10`}>
      {['home', 'explore', 'profile', 'dev'].map((tab) => (
        (tab !== 'dev' || isAdmin) && (
          <button key={tab} onClick={() => setActiveTab(tab)} 
            className={`p-4 px-7 rounded-[2rem] transition-all duration-500 relative ${activeTab === tab ? 'bg-emerald-500/10 text-emerald-500 scale-110' : 'text-zinc-500 hover:text-emerald-500/40'}`}>
            {tab === 'home' && <Home size={22} strokeWidth={activeTab === tab ? 2.5 : 2}/>}
            {tab === 'explore' && <Compass size={22} strokeWidth={activeTab === tab ? 2.5 : 2}/>}
            {tab === 'profile' && <User size={22} strokeWidth={activeTab === tab ? 2.5 : 2}/>}
            {tab === 'dev' && <Terminal size={22} strokeWidth={activeTab === tab ? 2.5 : 2}/>}
          </button>
        )
      ))}
    </div>
  </nav>
);

export default Navigation;
