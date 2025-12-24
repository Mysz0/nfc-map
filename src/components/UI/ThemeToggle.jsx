import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ 
  themeMag, 
  setTheme, 
  isDark, 
  isAtTop 
}) {
  return (
    <button 
      ref={themeMag.ref} 
      onMouseMove={themeMag.handleMouseMove} 
      onMouseLeave={themeMag.reset}
      onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} 
      className={`fixed z-[10000] p-3.5 rounded-2xl border transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) active:scale-90 ${
        isDark 
          ? 'bg-zinc-900/80 border-white/10 text-emerald-400' 
          : 'bg-white/80 border-emerald-200 text-emerald-600 shadow-lg'
      }`}
      style={{ 
        /* Features preserved: Dynamic alignment with Header.jsx content */
        top: isAtTop ? '4.15rem' : '1.5rem', 
        right: isAtTop ? '6.8rem' : '1.5rem',
        transform: `translate(${themeMag.position.x}px, ${themeMag.position.y}px)`
      }}
    >
      {isDark ? <Sun size={18}/> : <Moon size={18}/>}
    </button>
  );
}
