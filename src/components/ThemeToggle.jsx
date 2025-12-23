import React from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ isDark, toggleTheme, themeMag }) => (
  <button 
    ref={themeMag.ref} 
    onMouseMove={themeMag.handleMouseMove} 
    onMouseLeave={themeMag.reset}
    style={{ transform: `translate(${themeMag.position.x}px, ${themeMag.position.y}px)` }}
    onClick={toggleTheme} 
    className={`fixed top-6 right-6 p-3.5 rounded-2xl border transition-all duration-300 ease-out active:scale-90 z-[10000] ${
      isDark ? 'bg-zinc-900/80 border-white/10 text-emerald-400' : 'bg-white/80 border-emerald-200 text-emerald-600 shadow-lg backdrop-blur-md'
    }`}
  >
    {isDark ? <Sun size={18}/> : <Moon size={18}/>}
  </button>
);

export default ThemeToggle;
