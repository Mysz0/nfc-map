import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Target } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Component to handle dynamic movement after initial load
function MapController({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords?.lat && coords?.lng) {
      map.flyTo([coords.lat, coords.lng], 15, {
        animate: true,
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [coords, map]);
  return null;
}

export default function ExploreTab({ spots = {}, unlockedSpots = [], userLocation, radius, isDark }) {
  // Use user location for initial center if available, otherwise fallback to prevent 0,0 jump
  const initialCenter = userLocation?.lat 
    ? [userLocation.lat, userLocation.lng] 
    : [40.7306, -73.9352];

  // Custom Icons
  const userIcon = L.divIcon({
    className: 'leaflet-user-icon',
    html: `<div class="user-marker-container"><div class="user-pulse-ring"></div><div class="user-marker-core"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const spotIcon = L.divIcon({
    className: 'leaflet-spot-icon',
    html: `<div class="marker-container"><div class="pulse-ring"></div><div class="marker-core"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  return (
    <div 
      style={{ height: '70vh', width: '100%', position: 'relative' }} 
      className={`rounded-[2.5rem] overflow-hidden border shadow-2xl transition-all duration-700 ${
        isDark ? 'border-white/5 bg-zinc-950' : 'border-emerald-500/10 bg-emerald-50'
      }`}
    >
      {/* RECENTER BUTTON */}
      <button 
        onClick={() => {
          if (userLocation) {
            // Find the map instance and fly back home
            const mapContainer = document.querySelector('.leaflet-container');
            if (mapContainer && mapContainer._leaflet_map) {
              mapContainer._leaflet_map.flyTo([userLocation.lat, userLocation.lng], 15);
            }
          }
        }}
        className="absolute top-6 right-6 z-[1000] smart-glass p-3 rounded-2xl border border-emerald-500/20 hover:scale-110 active:scale-90 transition-all pointer-events-auto"
        title="Recenter Camera"
      >
        <Target size={18} className="text-emerald-500" />
      </button>

      <MapContainer 
        center={initialCenter} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer
          url={isDark 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          }
          attribution='&copy; CARTO'
        />

        <MapController coords={userLocation} />

        {/* USER POSITION */}
        {userLocation?.lat && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup closeButton={false} offset={[0, -10]}>
                <div className="custom-popup-box">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Signal Locked</span>
                  </div>
                </div>
              </Popup>
            </Marker>
            <Circle 
              center={[userLocation.lat, userLocation.lng]}
              radius={radius || 10} 
              pathOptions={{ 
                color: '#10b981', 
                fillColor: '#10b981', 
                fillOpacity: isDark ? 0.1 : 0.15,
                weight: 1 
              }}
            />
          </>
        )}

        {/* DATA NODES */}
        {Object.values(spots).map((spot) => (
          <Marker 
            key={spot.id} 
            position={[spot.lat, spot.lng]} 
            icon={spotIcon} 
            opacity={unlockedSpots.includes(spot.id) ? 1 : 0.4}
          >
            <Popup closeButton={false} offset={[0, -10]}>
               <div className="custom-popup-box">
                 <div className="flex flex-col gap-1">
                   <span className={`text-[10px] font-black uppercase tracking-tighter ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                     Node Detected
                   </span>
                   <div className={`text-sm font-bold leading-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                     {spot.name}
                   </div>
                   <div className="h-[1px] w-full bg-emerald-500/10 my-1" />
                   <div className="flex justify-between items-center">
                     <span className="text-[9px] font-bold text-zinc-500 uppercase">Status</span>
                     <span className={`text-[9px] font-black uppercase ${unlockedSpots.includes(spot.id) ? 'text-emerald-500' : 'text-orange-500'}`}>
                       {unlockedSpots.includes(spot.id) ? 'Secured' : 'Locked'}
                     </span>
                   </div>
                 </div>
               </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* FOOTER STATUS PANEL */}
      <div className="absolute bottom-6 left-6 right-6 z-[1000] pointer-events-none">
        <div className="smart-glass border p-4 rounded-2xl flex justify-between items-center shadow-2xl">
          <div className={`text-[10px] font-bold tracking-widest uppercase ${isDark ? 'text-white' : 'text-zinc-800'}`}>
            {userLocation ? (
              <span className="flex gap-3">
                <span>LAT: {userLocation.lat.toFixed(4)}</span>
                <span>LNG: {userLocation.lng.toFixed(4)}</span>
              </span>
            ) : 'AQUIRING SIGNAL...'}
          </div>
          <div className="text-emerald-500 font-black text-[10px] italic uppercase tracking-tighter flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {radius}M RANGE
          </div>
        </div>
      </div>
    </div>
  );
}
