import { useState, useEffect, useLayoutEffect } from 'react';

export function useTheme() {
  const [mode, setMode] = useState(localStorage.getItem('theme-mode') || 'dark');
  const [appStyle, setAppStyle] = useState(localStorage.getItem('app-style') || 'emerald');
  
  const [isAtTop, setIsAtTop] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isNavbarShrunk, setIsNavbarShrunk] = useState(false);

  const isDark = mode === 'dark';

  useLayoutEffect(() => {
    const root = window.document.documentElement;

    root.setAttribute('data-theme', appStyle);
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = mode;

    // remove any previously set inline var if present (fixes stale inline value)
    root.style.removeProperty('--theme-map-bg');
    document.body.style.removeProperty('--theme-map-bg');

    requestAnimationFrame(() => {
      // read from both root and body to be robust across inheritance and specificity
      const rootBg = getComputedStyle(root).getPropertyValue('--theme-map-bg').trim();
      const bodyBg = getComputedStyle(document.body).getPropertyValue('--theme-map-bg').trim();
      const bgColor = rootBg || bodyBg;

      // debug to help trace why a specific value is used (remove in prod)
      // eslint-disable-next-line no-console
      console.debug(`[useTheme] appStyle=${appStyle} isDark=${isDark} rootBg='${rootBg}' bodyBg='${bodyBg}' => using='${bgColor}'`);

      if (bgColor) {
        // set page background colors (the translucent iOS status bar will show this through)
        document.documentElement.style.backgroundColor = bgColor;
        document.body.style.backgroundColor = bgColor;

        // update Android/Chrome theme-color meta (also affects iOS in some contexts)
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
          meta.setAttribute('content', bgColor);
        }

        // Force a repaint to ensure the color updates immediately
        void document.body.offsetHeight;

        // On-screen debug overlay for devices without remote inspector (enable with ?debugTheme=1 or localStorage.debugTheme='1')
        try {
          const shouldShow = new URLSearchParams(window.location.search).has('debugTheme') || localStorage.getItem('debugTheme') === '1';
          if (shouldShow) {
            let dbg = document.getElementById('theme-debug-overlay');
            if (!dbg) {
              dbg = document.createElement('div');
              dbg.id = 'theme-debug-overlay';
              Object.assign(dbg.style, {
                position: 'fixed',
                left: '8px',
                top: '8px',
                background: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: '8px',
                fontSize: '11px',
                zIndex: '10001',
                borderRadius: '8px',
                maxWidth: 'calc(100vw - 16px)',
                pointerEvents: 'none',
                whiteSpace: 'pre',
                lineHeight: '1.3'
              });
              document.body.appendChild(dbg);
            }

            dbg.textContent = `style: ${appStyle}\nmode: ${mode}\ndark: ${isDark}\nrootBg: ${rootBg}\nbodyBg: ${bodyBg}\nmeta: ${meta ? meta.getAttribute('content') : ''}\ndocBg: ${document.documentElement.style.backgroundColor}\nbodyBg: ${document.body.style.backgroundColor}`;
          }
        } catch (e) {
          // ignore in older browsers
        }
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