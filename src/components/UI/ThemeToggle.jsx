import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ themeMag, setTheme, isDark, isAtTop }) {
  const isMagneticActive = themeMag.position.x !== 0 || themeMag.position.y !== 0;

  // --- POSITIONING LOGIC ---
  // When at top, we need to offset it from its fixed '1.5rem' base 
  // to reach the absolute '4.05rem / 6.85rem' position.
  // Calculation: Target (4.05) - Base (1.5) = 2.55rem offset
  const offsetY = isAtTop ? '2.55rem' : '0rem';
  const offsetX = isAtTop ? '-5.35rem' : '0rem'; // Negative moves it left

  return (
    <button 
      ref={themeMag.ref} 
      onMouseMove={themeMag.handleMouseMove} 
      onMouseLeave={themeMag.reset}
      onClick={() => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))} 
      
      className={`z-[10000] p-3.5 rounded-2xl border active:scale-90 will-change-transform ${
        isDark 
          ? 'bg-zinc-900/80 border-white/10 text-[rgb(var(--theme-primary))]' 
          : 'bg-white/80 border-[rgb(var(--theme-primary))]/20 text-[rgb(var(--theme-primary))] shadow-lg shadow-[var(--theme-primary-glow)]'
      } fixed`} // We keep it FIXED always to prevent layout jumping
      
      style={{ 
        top: '1.5rem', 
        right: '1.5rem',
        
        // Combine Position Offset + Magnetic Movement
        // This keeps the "sliding" travel while scrolling but removes the "hop" on click
        transform: `translate(calc(${offsetX} + ${themeMag.position.x}px), calc(${offsetY} + ${themeMag.position.y}px))`,
        
        transition: isMagneticActive 
          ? 'background-color 0.5s, border-color 0.5s, color 0.5s, box-shadow 0.5s' 
          : 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {isDark ? <Sun size={18}/> : <Moon size={18}/>}
    </button>
  );
}
