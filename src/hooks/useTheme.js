import { useState, useEffect } from 'react';

export function useTheme() {
  // 'mode' is strictly light or dark
  const [mode, setMode] = useState(localStorage.getItem('theme-mode') || 'dark');
  // 'appStyle' is the aesthetic profile (emerald, sakura, abyss, marble)
  const [appStyle, setAppStyle] = useState(localStorage.getItem('app-style') || 'emerald');
  
  const [isAtTop, setIsAtTop] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isNavbarShrunk, setIsNavbarShrunk] = useState(false);

  const isDark = mode === 'dark';

  useEffect(() => {
    const root = window.document.documentElement;
    
    // 1. Sync Light/Dark Mode
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.style.colorScheme = mode;
    localStorage.setItem('theme-mode', mode);

    // 2. Sync Aesthetic Style (The New Engine)
    root.setAttribute('data-theme', appStyle);
    localStorage.setItem('app-style', appStyle);
  }, [mode, isDark, appStyle]);

  // Scroll Logic (Preserved)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsAtTop(currentScrollY < 120);
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsNavbarShrunk(true);
      } else if (lastScrollY - currentScrollY > 15 || currentScrollY < 10) {
        setIsNavbarShrunk(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return { 
    mode, 
    setMode, 
    appStyle, 
    setAppStyle, 
    isDark, 
    isAtTop, 
    isNavbarShrunk 
  };
}
