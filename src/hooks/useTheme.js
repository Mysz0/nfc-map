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

        // DEBUG: Log env() computed values and heights to help diagnose iOS behavior
        // eslint-disable-next-line no-console
        console.debug('[useTheme] safe-area env values:', {
          envTop: getComputedStyle(document.documentElement).getPropertyValue('padding-top'),
          envBottom: getComputedStyle(document.documentElement).getPropertyValue('padding-bottom'),
          safeTop: top ? top.offsetHeight : null,
          safeBottom: bottom ? bottom.offsetHeight : null
        });

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
                top: 'calc(env(safe-area-inset-top, 0) + 8px)',
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                padding: '8px',
                fontSize: '12px',
                zIndex: '10001',
                borderRadius: '8px',
                maxWidth: 'calc(100vw - 16px)',
                pointerEvents: 'none',
                whiteSpace: 'pre',
                lineHeight: '1.1'
              });
              document.body.appendChild(dbg);
            }

            const meta = document.querySelector('meta[name="theme-color"]');
            dbg.textContent = `style: ${appStyle}\nmode: ${mode}\ndark: ${isDark}\nrootBg: ${rootBg}\nbodyBg: ${bodyBg}\nmeta: ${meta ? meta.getAttribute('content') : ''}\nsafeTop: ${top ? top.offsetHeight : 0}\nsafeBottom: ${bottom ? bottom.offsetHeight : 0}`;
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