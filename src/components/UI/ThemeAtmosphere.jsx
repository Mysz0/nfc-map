import React, { useMemo } from 'react';

// WINTER: Frost overlay & Shimmering Ice
const WinterEffect = () => (
  <>
    {/* 1. Subtle Frost Vignette (Edges) */}
    <div className="fixed inset-0 pointer-events-none z-0" 
         style={{ background: 'var(--frost-vignette)' }} />
    
    {/* 2. Global Cracked Ice & Frost Surface */}
    <div className="frozen-surface" />

    {/* No more "big bar" shimmer here */}
  </>
);

// SAKURA: Falling petals & Pink glow
const SakuraEffect = () => {
  // Memoize the petals so they don't re-randomize on every render
  const petals = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${10 + Math.random() * 10}s`,
      delay: `${Math.random() * 5}s`,
      size: `${5 + Math.random() * 5}px`
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(244,172,183,0.15),transparent_60%)]" />
      <div className="absolute inset-0 opacity-40">
        {petals.map((p) => (
          <div 
            key={p.id} 
            className="sakura-petal absolute bg-[rgb(var(--theme-primary))] rounded-full blur-[0.5px]"
            style={{
              width: p.size, 
              height: '5px', 
              left: p.left, 
              top: '-5%',
              animation: `fallingPetal ${p.duration} linear infinite`,
              animationDelay: p.delay
            }} 
          />
        ))}
      </div>
    </div>
  );
};

// KOI: Water ripples
const KoiEffect = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 opacity-20" 
         style={{ background: 'radial-gradient(circle at 50% 50%, rgba(234,68,38,0.05) 0%, transparent 70%)' }} />
    <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full border border-[rgb(var(--theme-primary))] opacity-10 animate-ping" 
         style={{ animationDuration: '8s' }} />
  </div>
);

// ABYSS: Floating bubbles
const AbyssEffect = () => {
  const bubbles = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${5 + Math.random() * 10}s`,
      delay: `${Math.random() * 5}s`
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {bubbles.map((b) => (
        <div key={b.id} className="absolute bg-white rounded-full opacity-10"
             style={{
               width: '4px', height: '4px', left: b.left, bottom: '-5%',
               animation: `floatUp ${b.duration} ease-in infinite`,
               animationDelay: b.delay
             }} />
      ))}
    </div>
  );
};

// SUPERNOVA: Pulsing starfield
const SupernovaEffect = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.1),transparent_80%)] animate-pulse" />
    <div className="absolute inset-0 opacity-20"
         style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
  </div>
);

function ThemeAtmosphere({ activeStyle }) {
  switch (activeStyle) {
    case 'winter': return <WinterEffect />;
    case 'sakura': return <SakuraEffect />;
    case 'koi': return <KoiEffect />;
    case 'abyss': return <AbyssEffect />;
    case 'supernova': return <SupernovaEffect />;
    default: return null;
  }
}

// WRAP IN MEMO: This prevents the whole component from re-rendering unless the theme actually changes
export default React.memo(ThemeAtmosphere);
