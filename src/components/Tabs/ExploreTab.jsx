import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Target, Lock, ShieldCheck } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- UTILS ---
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// --- MAP INTERFACE COMPONENT ---
// Handles movement logic and pins the UI buttons to the map corners
function MapInterface({ coords, stableUserLoc, isDark, claimRadius }) {
  const map = useMap();
  const lastPos = useRef(null);

  useEffect(() => {
    if (!coords?.lat || !coords?.lng) return;
    const moveDist = lastPos.current ? getDistance(coords.lat, coords.lng, lastPos.current.lat, lastPos.current.lng) : 999;
    if (moveDist > 3) {
      map.panTo([coords.lat, coords.lng], { animate: true, duration: 1 });
      lastPos.current = coords;
    }
  }, [coords, map]);

  return (
    <>
      {/* Target Button: Top Right */}
      <div className="leaflet-top leaflet-right" style={{ marginTop: '24px', marginRight: '24px' }}>
        <div className="leaflet-control pointer-events-auto">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (stableUserLoc) map.flyTo([stableUserLoc.lat, stableUserLoc.lng], 16);
            }}
            className="smart-glass w-12 h-12 flex items-center justify-center rounded-2xl border border-white/10 active:scale-90 transition-all shadow-2xl"
          >
            <Target size={22} className="text-[rgb(var(--theme-primary))]" />
          </button>
        </div>
      </div>

      {/* Bottom Stats Overlay */}
      <div className="leaflet-bottom leaflet-left leaflet-right" style={{ marginBottom: '24px', padding: '0 24px' }}>
        <div className="leaflet-control w-full pointer-events-none">
          <div className="smart-glass border p-4 rounded-3xl flex justify-between items-center shadow-2xl w-full pointer-events-auto">
            <div className={`text-[10px] font-bold tracking-widest uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {stableUserLoc ? (
                <div className="flex gap-4">
                  <span>{stableUserLoc.lat.toFixed(5)}°N</span>
                  <span>{stableUserLoc.lng.toFixed(5)}°E</span>
                </div>
              ) : 'INITIALIZING SENSORS...'}
            </div>
            
            <div className="text-[rgb(var(--theme-primary))] font-black text-[10px] italic uppercase tracking-tighter flex items-center gap-4">
              <span className="opacity-50">ZONE: {claimRadius}M</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--theme-primary))] animate-pulse" />
                RADAR: {claimRadius * 3}M
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// --- MAIN COMPONENT ---
export default function ExploreTab({ spots = {}, unlockedSpots = [], userLocation, isDark, claimRadius = 20 }) {
  const [mapRef, setMapRef] = useState(null);

  const stableUserLoc = useMemo(() => {
    if (!userLocation?.lat) return null;
    return {
      lat: Math.round(userLocation.lat * 1000000) / 1000000,
      lng: Math.round(userLocation.lng * 1000000) / 1000000
    };
  }, [userLocation?.lat, userLocation?.lng]);

  const initialCenter = useMemo(() => stableUserLoc ? [stableUserLoc.lat, stableUserLoc.lng] : [40.7306, -73.9352], []);

  // Marker Icons
  const userIcon = useMemo(() => L.divIcon({
    className: 'leaflet-user-box-icon',
    html: `<div class="user-box-container"><div class="user-box-scanner"></div><div class="user-box-core"></div></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  }), []);

  const spotIcon = (isUnlocked) => L.divIcon({
    className: 'leaflet-spot-icon',
    html: `<div class="marker-wrapper"><div class="pulse-ring ${isUnlocked ? 'pulse-green' : ''}"></div><div class="marker-core ${isUnlocked ? 'core-green' : ''}"></div></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  return (
    <div className={`relative w-full h-[70vh] rounded-[3rem] overflow-hidden border transition-all duration-700 ${
      isDark ? 'border-white/5 bg-zinc-950' : 'border-[rgb(var(--theme-primary))]/10 bg-emerald-50'
    }`}>
      <style>{`
        .leaflet-container { height: 100% !important; width: 100% !important; background: transparent !important; }
        .user-box-container { position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; }
        .user-box-scanner { position: absolute; width: 100%; height: 100%; border: 2px dashed rgb(var(--theme-primary)); border-radius: 6px; animation: rotateBox 4s linear infinite; opacity: 0.6; }
        .user-box-core { width: 8px; height: 8px; background: rgb(var(--theme-primary)); border-radius: 1px; box-shadow: 0 0 10px rgb(var(--theme-primary)); }
        @keyframes rotateBox { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .marker-wrapper { position: relative; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; }
        .pulse-ring { position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(var(--theme-primary), 0.4); animation: spotPulse 2s ease-out infinite; }
        .pulse-green { background: rgba(34, 197, 94, 0.4) !important; }
        .marker-core { width: 10px; height: 10px; background: rgb(var(--theme-primary)); border: 2px solid white; border-radius: 50%; z-index: 2; transition: all 0.3s ease; }
        .core-green { background: #22c55e !important; box-shadow: 0 0 10px #22c55e; }
        
        @keyframes spotPulse { 0% { transform: scale(0.5); opacity: 0.8; } 100% { transform: scale(2.5); opacity: 0; } }
        
        .radar-ping { animation: radarPing 4s ease-in-out infinite; }
        @keyframes radarPing { 
          0% { stroke-opacity: 0.7; stroke-width: 1px; } 
          50% { stroke-opacity: 0.2; stroke-width: 3px; } 
          100% { stroke-opacity: 0.7; stroke-width: 1px; } 
        }

        .leaflet-popup-content-wrapper { background: transparent !important; box-shadow: none !important; }
        .leaflet-popup-tip { display: none !important; }
      `}</style>

      <MapContainer
        center={initialCenter}
        zoom={15}
        zoomControl={false}
        scrollWheelZoom={true}
        ref={setMapRef}
      >
        <TileLayer
          key={isDark ? 'dark' : 'light'}
          url={isDark 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          }
        />

        <MapInterface 
          coords={stableUserLoc} 
          stableUserLoc={stableUserLoc} 
          isDark={isDark} 
          claimRadius={claimRadius} 
        />

        {stableUserLoc && (
          <>
            {/* Inner Circle: Claim Zone */}
            <Circle
              center={[stableUserLoc.lat, stableUserLoc.lng]}
              radius={claimRadius}
              pathOptions={{
                color: 'rgb(var(--theme-primary))',
                fillColor: 'rgb(var(--theme-primary))',
                fillOpacity: 0.15,
                weight: 2,
                interactive: false
              }}
            />
            
            {/* Outer Circle: Scan Radar */}
            <Circle
              center={[stableUserLoc.lat, stableUserLoc.lng]}
              radius={claimRadius * 3}
              pathOptions={{
                color: 'rgb(var(--theme-primary))',
                fillColor: 'transparent',
                fillOpacity: 0,
                weight: 1,
                dashArray: '8, 12',
                className: 'radar-ping',
                interactive: false
              }}
            />

            <Marker position={[stableUserLoc.lat, stableUserLoc.lng]} icon={userIcon} zIndexOffset={1000} />
          </>
        )}

        {Object.values(spots).map((spot) => {
          const isUnlocked = unlockedSpots.includes(spot.id);
          return (
            <Marker
              key={`${spot.id}-${isUnlocked}`}
              position={[spot.lat, spot.lng]}
              icon={spotIcon(isUnlocked)}
            >
              <Popup closeButton={false} offset={[0, -10]}>
                <div className="smart-glass p-3 rounded-2xl border border-white/10 min-w-[140px] shadow-2xl">
                  <div className="flex items-center gap-2 mb-1">
                    {isUnlocked ? (
                      <ShieldCheck size={12} className="text-green-400" />
                    ) : (
                      <Lock size={12} className="text-zinc-500" />
                    )}
                    <p className={`text-[9px] font-black uppercase tracking-widest ${isUnlocked ? 'text-green-400' : 'text-zinc-500'}`}>
                      {isUnlocked ? 'Secured' : 'Undiscovered'}
                    </p>
                  </div>
                  <p className="text-xs font-bold text-white truncate">{spot.name}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
