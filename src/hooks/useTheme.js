import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  // New state for Emerald vs Hoarfrost
  const [appStyle, setAppStyle] = useState(localStorage.getItem('app-style') || 'emerald');
  
  const [isAtTop, setIsAtTop] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isNavbarShrunk, setIsNavbarShrunk] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Handle Dark Mode Class
    isDark ? root.classList.add('dark') : root.classList.remove('dark');
    root.style.colorScheme = theme;
    localStorage.setItem('theme', theme);

    // Handle Visual Style Attribute (Emerald vs Winter)
    root.setAttribute('data-theme', appStyle);
    localStorage.setItem('app-style', appStyle);
  }, [theme, isDark, appStyle]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 120) {
        setIsAtTop(true);
      } else if (currentScrollY > 140) {
        setIsAtTop(false);
      }

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

  // Added appStyle and setAppStyle to the return
  return { theme, setTheme, appStyle, setAppStyle, isDark, isAtTop, isNavbarShrunk };
}
