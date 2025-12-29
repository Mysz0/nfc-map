import { useState, useEffect, useLayoutEffect, useRef } from 'react';

export function useTheme() {
  const [mode, setMode] = useState(localStorage.getItem('theme-mode') || 'dark');
  const [appStyle, setAppStyle] = useState(localStorage.getItem('app-style') || 'emerald');
  
  const [isAtTop, setIsAtTop] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isNavbarShrunk, setIsNavbarShrunk] = useState(false);

  const themeUpdateIdRef = useRef(0);

  const isDark = mode === 'dark';

  useLayoutEffect(() => {
    const root = window.document.documentElement;

    themeUpdateIdRef.current += 1;
    const updateId = themeUpdateIdRef.current;

    root.setAttribute('data-theme', appStyle);
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = mode;

    // remove any previously set inline var if present (fixes stale inline value)
    root.style.removeProperty('--theme-map-bg');
    document.body.style.removeProperty('--theme-map-bg');

    requestAnimationFrame(() => {
      // Ignore stale frames if the user spam-toggled.
      if (themeUpdateIdRef.current !== updateId) return;

      // CLEANUP: Remove any stale safe-area filler elements from previous code versions
      const oldTop = document.getElementById('safe-area-top');
      const oldBottom = document.getElementById('safe-area-bottom');
      if (oldTop) oldTop.remove();
      if (oldBottom) oldBottom.remove();

      // read from both root and body to be robust across inheritance and specificity
      const rootBg = getComputedStyle(root).getPropertyValue('--theme-map-bg').trim();
      const bodyBg = getComputedStyle(document.body).getPropertyValue('--theme-map-bg').trim();
      const bgColor = rootBg || bodyBg;

      if (bgColor) {
        // Ensure the page background is correct (iOS translucent status bar shows this)
        document.documentElement.style.backgroundColor = bgColor;
        document.body.style.backgroundColor = bgColor;

        // iOS Safari can be picky about updating the browser UI color dynamically.
        // Replacing the meta tag (instead of only mutating content) is more reliable.
        const head = document.head;
        if (head) {
          head.querySelectorAll('meta[name="theme-color"]').forEach((el) => el.remove());
          const meta = document.createElement('meta');
          meta.setAttribute('name', 'theme-color');
          meta.setAttribute('content', bgColor);
          head.appendChild(meta);
        }

        // Force a repaint to help Safari apply changes
        // eslint-disable-next-line no-unused-expressions
        document.body.offsetHeight;
      }
    });

    localStorage.setItem('theme-mode', mode);
    localStorage.setItem('app-style', appStyle);
  }, [mode, isDark, appStyle]);

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

  return { mode, setMode, appStyle, setAppStyle, isDark, isAtTop, isNavbarShrunk };
}