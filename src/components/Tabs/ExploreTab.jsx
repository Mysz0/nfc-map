import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Target, Lock, ShieldCheck } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map movement
function MapController({ coords }) {
  const map = useMap();
  React.useEffect(() => {
    if (coords) {
      map.setView([coords.lat, coords.lng], map.getZoom());
    }
  }, [coords, map]);
  return null;
}

export default function ExploreTab({ 
  spots, 
  unlockedSpots, 
  stableUserLoc, 
  claimRadius, 
  isDark 
}) {
  const [map, setMap] = useState(null);
  const initialCenter = stableUserLoc ? [stableUserLoc.lat, stableUserLoc.lng] : [0, 0];

  // Custom User Icon
  const userIcon = L.divIcon({
    className: 'custom-user-icon',
    html: `
      <div class="user-box-container">
        <div class="user-box-scanner"></div>
        <div class="user-box-core"></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  // Custom Spot Icon
  const spotIcon = (unlocked) => L.divIcon({
    className: 'custom-spot-icon',
    html: `
      <div class="marker-wrapper">
        <div class="pulse-ring ${unlocked ? 'pulse-green' : ''}"></div>
        <div class="marker-core ${unlocked ? 'core-green' : ''}"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  return (
    <div 
      style={{ height: '70vh', width: '100%', position: 'relative' }} 
      className={`rounded-[2.5rem] overflow-hidden border transition-colors duration-700 ${
        isDark ? 'border-white/5 bg-zinc-950' : 'border-[rgb(var(--theme-primary))]/10 bg-emerald-50'
      }`}
    >
      <style>{`
        .user-box-container { position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; }
        .user-box-scanner { position: absolute; width: 100%; height: 100%; border: 2px dashed rgb(var(--theme-primary)); border-radius: 6px; animation: rotateBox 4s linear infinite; opacity: 0.5; }
        .user-box-core { width: 8px; height: 8px; background: rgb(var(--theme-primary)); border-radius: 1px; box-shadow: 0 0 10px rgb(var(--theme-primary)); }
        @keyframes rotateBox { from { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(1.1); } to { transform: rotate(360deg) scale(1); } }
        
        .marker-wrapper { position: relative; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; }
        .pulse-ring { position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(var(--theme-primary), 0.4); animation: spotPulse 2s ease-out infinite; }
        .pulse-green { background: rgba(34, 197, 94, 0.4) !important; }
        .marker-core { width: 10px; height: 10px; background: rgb(var(--theme-primary)); border: 2px solid white; border-radius: 50%; z-index: 2; transition: all 0.5s ease; }
        .core-green { background: #22c55e !important; box-shadow: 0 0 10px rgba(34, 197, 94, 0.6); }
        
        @keyframes spotPulse { 0% { transform: scale(0.5); opacity: 0.8; } 100% { transform: scale(2.5); opacity: 0; } }

        /* Ensure Leaflet popups don't have white backgrounds */
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: transparent !important;
          box-shadow: none !important;
        }
      `}</style>

      {/* Target Button - Re-centered and Z-Indexed */}
      <button 
        onClick={() => stableUserLoc && map?.flyTo([stableUserLoc.lat, stableUserLoc.lng], 16)}
        className="absolute top-6 right-6 z-[1100] smart-glass w-12 h-12 flex items-center justify-center rounded-2xl border border-white/10 active:scale-90 transition-all pointer-events-auto shadow-2xl"
      >
        <Target size={22} className="text-[rgb(var(--theme-primary))]" />
      </button>

      <MapContainer 
        center={initialCenter} 
        zoom={15} 
        style={{ height: '100%', width: '100%', background: 'transparent' }}
        zoomControl={false}
        scrollWheelZoom={true}
        ref={setMap}
        preferCanvas={true}
      >
        <TileLayer
          key={isDark ? 'dark-tiles' : 'light-tiles'}
          url={isDark 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          }
        />

        <MapController coords={stableUserLoc} />

        {stableUserLoc && (
          <>
            <Marker position={[stableUserLoc.lat, stableUserLoc.lng]} icon={userIcon} zIndexOffset={1000} />
            <Circle 
              center={[stableUserLoc.lat, stableUserLoc.lng]}
              radius={claimRadius} 
              pathOptions={{ 
                color: 'rgb(var(--theme-primary))', 
                fillColor: 'rgb(var(--theme-primary))', 
                fillOpacity: 0.1,
                weight: 1,
                dashArray: '4 4',
                interactive: false 
              }}
            />
          </>
        )}

        {Object.values(spots).map((spot) => {
          const isUnlocked = unlockedSpots.includes(spot.id);
          return (
            <Marker 
              // KEY FIX: Forces re-render when a spot is claimed
              key={`${spot.id}-${isUnlocked}`} 
              position={[spot.lat, spot.lng]} 
              icon={spotIcon(isUnlocked)} 
              opacity={isUnlocked ? 1 : 0.7}
            >
               <Popup closeButton={false} offset={[0, -5]}>
                <div className="smart-glass p-3 rounded-xl border border-white/10 min-w-[140px] shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    {isUnlocked ? (
                      <ShieldCheck size={12} className="text-green-400" />
                    ) : (
                      <Lock size={12} className="text-zinc-400" />
                    )}
                    <p className={`text-[9px] font-black uppercase tracking-widest ${isUnlocked ? 'text-green-400' : 'text-zinc-400'}`}>
                      {isUnlocked ? 'Secured Node' : 'Locked Node'}
                    </p>
                  </div>
                  <p className="text-xs font-bold text-white truncate px-1">{spot.name}</p>
                  
                  <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center px-1">
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">Status</span>
                    <span className={`text-[8px] font-black uppercase ${isUnlocked ? 'text-green-400' : 'text-zinc-500'}`}>
                      {isUnlocked ? 'Active' : 'Offline'}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Stats Overlay */}
      <div className="absolute bottom-6 left-6 right-6 z-[1000] pointer-events-none">
        <div className="smart-glass border p-4 rounded-3xl flex justify-between items-center shadow-2xl">
          <div className={`text-[10px] font-bold tracking-widest uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {stableUserLoc ? (
              <span className="flex gap-3">
                <span className="opacity-80">{stableUserLoc.lat.toFixed(5)} N</span>
                <span className="opacity-80">{stableUserLoc.lng.toFixed(5)} E</span>
              </span>
            ) : 'CALIBRATING GPS...'}
          </div>
          <div className="text-[rgb(var(--theme-primary))] font-black text-[10px] italic uppercase tracking-tighter flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--theme-primary))] animate-pulse" />
            {claimRadius}M SCANNER ACTIVE
          </div>
        </div>
      </div>
    </div>
  );
}
