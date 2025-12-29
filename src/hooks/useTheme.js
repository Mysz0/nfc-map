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
        // set page background colors (helps transition visuals)
        document.documentElement.style.backgroundColor = bgColor;
        document.body.style.backgroundColor = bgColor;

        // update Android/Chrome theme-color meta
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
          meta.setAttribute('content', bgColor);
        }

        // Create or update explicit safe-area filler elements for iOS
        // Using real DOM elements is more reliable than pseudo-elements in some Safari contexts
        let top = document.getElementById('safe-area-top');
        let bottom = document.getElementById('safe-area-bottom');

        if (!top) {
          top = document.createElement('div');
          top.id = 'safe-area-top';
          Object.assign(top.style, {
            position: 'fixed',
            left: '0',
            right: '0',
            top: '0',
            height: 'env(safe-area-inset-top, 0)',
            backgroundColor: bgColor,
            pointerEvents: 'none',
            zIndex: '9999',
          });
          document.body.appendChild(top);
        } else {
          top.style.backgroundColor = bgColor;
          top.style.height = 'env(safe-area-inset-top, 0)';
        }

        if (!bottom) {
          bottom = document.createElement('div');
          bottom.id = 'safe-area-bottom';
          Object.assign(bottom.style, {
            position: 'fixed',
            left: '0',
            right: '0',
            bottom: '0',
            height: 'env(safe-area-inset-bottom, 0)',
            backgroundColor: bgColor,
            pointerEvents: 'none',
            zIndex: '9999',
          });
          document.body.appendChild(bottom);
        } else {
          bottom.style.backgroundColor = bgColor;
          bottom.style.height = 'env(safe-area-inset-bottom, 0)';
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