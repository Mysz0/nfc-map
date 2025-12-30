import React, { useMemo } from 'react';

// Safe viewport wrapper that sits inside the app shell (not the viewport) to avoid triggering iOS safe-area bars.
// Uses a small inset + safe-area padding and absolute positioning so it never touches screen edges.
const AtmosphereFrame = ({ children }) => (
  <div
    className="pointer-events-none"
    style={{
      position: 'absolute',
      inset: 0,
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)',
      paddingRight: 'calc(env(safe-area-inset-right, 0px) + 10px)',
      paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)',
      paddingLeft: 'calc(env(safe-area-inset-left, 0px) + 10px)',
      overflow: 'hidden',
      zIndex: 0,
      maxWidth: '100%',
      maxHeight: '100%',
      contain: 'layout paint size',
      transform: 'translateZ(0)',
      borderRadius: '16px',
      WebkitOverflowScrolling: 'touch',
    }}
  >
    <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
      {children}
    </div>
  </div>
);

/* ==============================================
   WINTER: Crystalline Frost
   ============================================== */
const WinterEffect = () => (
  <>
    {/* Ice crystal sparkles (no background tint) */}
    <div 
      className="absolute inset-0 opacity-20"
      style={{
        zIndex: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(186, 230, 253, 0.4) 1px, transparent 1px),
          radial-gradient(circle at 60% 70%, rgba(186, 230, 253, 0.3) 1px, transparent 1px),
          radial-gradient(circle at 80% 20%, rgba(186, 230, 253, 0.3) 1px, transparent 1px)
        `,
        backgroundSize: '200px 200px, 300px 300px, 250px 250px',
        animation: 'gentlePulse 8s ease-in-out infinite'
      }}
    />
  </>
);

/* ==============================================
   SAKURA: Soft Petal Rain
   ============================================== */
const SakuraEffect = () => {
  const petals = useMemo(() => {
    return [...Array(15)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${12 + Math.random() * 8}s`,
      delay: `${Math.random() * 5}s`,
      size: `${4 + Math.random() * 6}px`,
      rotation: Math.random() * 360
    }));
  }, []);

  return (
    <>
      {/* Falling petals (no background tint) */}
      <div className="absolute inset-0 overflow-hidden">
        {petals.map((p) => (
          <div 
            key={p.id} 
            className="sakura-petal absolute bg-gradient-to-br from-[rgb(var(--theme-primary))] to-pink-200 rounded-full blur-[0.5px]"
            style={{
              width: p.size, 
              height: p.size, 
              left: p.left, 
              top: '-5%',
              animation: `fallingPetal ${p.duration} linear infinite`,
              animationDelay: p.delay,
              transform: `rotate(${p.rotation}deg)`
            }} 
          />
        ))}
      </div>
    </>
  );
};

/* ==============================================
   KOI: Water Garden
   ============================================== */
const KoiEffect = () => {
  const ripples = useMemo(() => {
    return [...Array(5)].map((_, i) => ({
      id: i,
      left: `${10 + Math.random() * 80}%`, 
      top: `${10 + Math.random() * 80}%`,  
      delay: i * 2, 
      size: 150 + Math.random() * 100
    }));
  }, []);

  return (
    <>
      {ripples.map((ripple) => (
        <div 
          key={ripple.id}
          className="absolute rounded-full border"
          style={{
            width: `${ripple.size}px`,
            height: `${ripple.size}px`,
            left: ripple.left,
            top: ripple.top,
            borderColor: 'rgba(234, 68, 38, 0.3)',
            animation: `rippleOut 10s ease-out infinite`,
            animationDelay: `${ripple.delay}s`,
            animationFillMode: 'backwards',
            willChange: 'transform, opacity'
          }}
        />
      ))}
    </>
  );
};

/* ==============================================
   ABYSS: Deep Ocean Pressure
   ============================================== */
const AbyssEffect = () => {
  const bubbles = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${10 + Math.random() * 12}s`,
      delay: `${Math.random() * 6}s`,
      size: `${2 + Math.random() * 2}px`
    }));
  }, []);

  return (
    <>
      {/* Rising bubbles */}
      {bubbles.map((b) => (
        <div 
          key={b.id} 
          className="absolute bg-gradient-to-t from-cyan-200 to-white rounded-full"
          style={{
            width: b.size, 
            height: b.size, 
            left: b.left, 
            bottom: '-5%',
            opacity: 0.15,
            animation: `floatUp ${b.duration} ease-in infinite`,
            animationDelay: b.delay,
            boxShadow: '0 0 4px rgba(14, 165, 233, 0.3)'
          }} 
        />
      ))}
    </>
  );
};

/* ==============================================
   SUPERNOVA: Cosmic Energy
   ============================================== */
const SupernovaEffect = () => {
  const particles = useMemo(() => {
    return [...Array(30)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2
    }));
  }, []);

  return (
    <>
      {/* Energy particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-1 h-1 bg-purple-400 rounded-full"
          style={{
            left: p.left,
            top: p.top,
            animation: `gentlePulse ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            boxShadow: '0 0 6px rgba(168, 85, 247, 0.6)'
          }}
        />
      ))}
    </>
  );
};

/* ==============================================
   SALMON: Warm Coral Waves
   ============================================== */
const SalmonEffect = () => (
  <>
  </>
);

/* ==============================================
   MARBLE: Minimal Architectural
   ============================================== */
const MarbleEffect = () => (
  <>
  </>
);

/* ==============================================
   MAIN COMPONENT
   ============================================== */
function ThemeAtmosphere({ activeStyle }) {
  const EffectComponent = useMemo(() => {
    if (activeStyle === 'winter') return WinterEffect;
    if (activeStyle === 'sakura') return SakuraEffect;
    if (activeStyle === 'koi') return KoiEffect;
    if (activeStyle === 'abyss') return AbyssEffect;
    if (activeStyle === 'supernova') return SupernovaEffect;
    if (activeStyle === 'salmon') return SalmonEffect;
    if (activeStyle === 'marble') return MarbleEffect;
    return null;
  }, [activeStyle]);

  if (!EffectComponent) return null;

  return (
    <AtmosphereFrame>
      <EffectComponent />
    </AtmosphereFrame>
  );
}

export default React.memo(ThemeAtmosphere);
