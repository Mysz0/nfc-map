import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function MapController({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords?.lat && coords?.lng) {
      map.flyTo([coords.lat, coords.lng], 15);
    }
  }, [coords, map]);
  return null;
}

export default function ExploreTab({ spots = {}, unlockedSpots = [], userLocation, radius }) {
  
  // 1. BLUE DOT (User)
  const userIcon = L.divIcon({
    className: 'leaflet-user-icon',
    html: `<div class="user-marker-container"><div class="user-pulse-ring"></div><div class="user-marker-core"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  // 2. GREEN DOT (Spots)
  const spotIcon = L.divIcon({
    className: 'leaflet-spot-icon',
    html: `<div class="marker-container"><div class="pulse-ring"></div><div class="marker-core"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  return (
    <div style={{ height: '70vh', width: '100%', position: 'relative' }} className="rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-zinc-950">
      <MapContainer 
        center={[0, 0]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />

        <MapController coords={userLocation} />

        {/* RENDER USER (BLUE DOT) */}
        {userLocation?.lat && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>Current Position</Popup>
            </Marker>
            <Circle 
              center={[userLocation.lat, userLocation.lng]}
              radius={radius || 10} 
              pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1 }}
            />
          </>
        )}

        {/* RENDER SPOTS (GREEN DOTS) */}
        {Object.values(spots).map((spot) => (
          <Marker 
            key={spot.id} 
            position={[spot.lat, spot.lng]} 
            icon={spotIcon} // FIXED: Using spotIcon instead of DefaultIcon
            opacity={unlockedSpots.includes(spot.id) ? 1 : 0.4}
          >
            <Popup>
               <div className="font-bold text-zinc-900">{spot.name}</div>
               <div className="text-[10px] text-zinc-500 uppercase font-bold">
                 {unlockedSpots.includes(spot.id) ? 'Secured' : 'Locked'}
               </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* OVERLAY PANEL */}
      <div className="absolute bottom-6 left-6 right-6 z-[1000] pointer-events-none">
        <div className="bg-zinc-950/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex justify-between items-center shadow-2xl">
          <div className="text-white text-[10px] font-bold tracking-widest uppercase">
            {userLocation ? `LAT: ${userLocation.lat.toFixed(4)} LNG: ${userLocation.lng.toFixed(4)}` : 'SCANNING GPS...'}
          </div>
          <div className="text-emerald-500 font-black text-[10px] italic uppercase">{radius}M RANGE</div>
        </div>
      </div>
    </div>
  );
}
