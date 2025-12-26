import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Target, Lock, ShieldCheck } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

function MapInterface({ coords, stableUserLoc, isDark, claimRadius, scanRadius }) {
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

      <div className="leaflet-bottom leaflet-left leaflet-right" style={{ marginBottom: '24px', padding: '0 24px' }}>
        <div className="leaflet-control w-full pointer-events-none">
          <div className="smart-glass border p-4 rounded-3xl flex justify-between items-center shadow-2xl w-full pointer-events-auto">
            <div className={`text-[10px] font-bold tracking-widest uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {stableUserLoc ? (
                <div className="flex gap-4 opacity-70">
                  <span>{stableUserLoc.lat.toFixed(5)}°N</span>
                  <span>{stableUserLoc.lng.toFixed(5)}°E</span>
                </div>
              ) : 'CONNECTING...'}
            </div>
            
            <div className="text-[rgb(var(--theme-primary))] font-black text-[10px] italic uppercase tracking-tighter flex items-center gap-5">
              <span className="opacity-60">CLAIM: {claimRadius}M</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--theme-primary))] animate-pulse" />
                SCAN: {scanRadius}M
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ExploreTab({ 
  spots = {}, 
  unlockedSpots = [], 
  userLocation, 
  isDark, 
  claimRadius = 20, 
  scanRadius = 50 
}) {
  const [mapRef, setMapRef] = useState(null);

  const stableUserLoc = useMemo(() => {
    if (!userLocation?.lat) return null;
    return {
      lat: Math.round(userLocation.lat * 1000000) / 1000000,
      lng: Math.round(userLocation.lng * 1000000) / 1000000
    };
  }, [userLocation?.lat, userLocation?.lng]);

  const initialCenter = useMemo(() => stableUserLoc ? [stableUserLoc.lat, stableUserLoc.lng] : [40.7306, -73.9352], []);

  const userIcon = useMemo(() => L.divIcon({
    className: 'leaflet-user-diamond',
    html: `<div class="user-diamond-core"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  }), []);

  const spotIcon = (isUnlocked) => L.divIcon({
    className: 'leaflet-spot-icon',
    html: `<div class="marker-core ${isUnlocked ? 'core-green' : ''}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

  return (
    <div className={`relative w-full h-[70vh] rounded-[3rem] overflow-hidden border transition-all duration-700 ${
      isDark ? 'border-white/5 bg-zinc-950' : 'border-[rgb(var(--theme-primary))]/10 bg-emerald-50'
    }`}>
      <style>{`
        .leaflet-container { height: 100% !important; width: 100% !important; background: transparent !important; }
        .user-diamond-core { width: 12px; height: 12px; background: rgb(var(--theme-primary)); border: 2px solid white; transform: rotate(45deg); box-shadow: 0 0 15px rgb(var(--theme-primary)); }
        .core-green { background: #22c55e !important; box-shadow: 0 0 10px #22c55e !important; }
        .leaflet-popup-tip { display: none !important; }
      `}</style>

      <MapContainer center={initialCenter} zoom={15} zoomControl={false} scrollWheelZoom={true} ref={setMapRef}>
        <TileLayer
          key={isDark ? 'dark' : 'light'}
          url={isDark 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
        />

        <MapInterface 
          coords={stableUserLoc} 
          stableUserLoc={stableUserLoc} 
          isDark={isDark} 
          claimRadius={claimRadius} 
          scanRadius={scanRadius}
        />

        {stableUserLoc && (
          <>
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
            
            <Circle
              center={[stableUserLoc.lat, stableUserLoc.lng]}
              radius={scanRadius}
              pathOptions={{
                color: 'rgb(var(--theme-primary))',
                fillColor: 'transparent',
                weight: 1,
                dashArray: '10, 15',
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
            <Marker key={`${spot.id}-${isUnlocked}`} position={[spot.lat, spot.lng]} icon={spotIcon(isUnlocked)}>
              <Popup closeButton={false} offset={[0, -5]}>
                <div className="smart-glass p-3 rounded-2xl border border-white/10 min-w-[140px] shadow-2xl">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Node</p>
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
