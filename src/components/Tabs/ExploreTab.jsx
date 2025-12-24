import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { sleekIcon } from '../../utils/geoUtils';

export default function ExploreTab({ mapCenter, isDark, spots, colors }) {
  return (
    <div className={`${colors.card} rounded-[3rem] p-2 shadow-2xl border h-[520px] overflow-hidden backdrop-blur-md`}>
      <MapContainer center={mapCenter} zoom={12} zoomControl={false} className="h-full w-full rounded-[2.5rem] z-0">
        <TileLayer url={isDark ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"} />
        {Object.values(spots).map(spot => (
          <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={sleekIcon(isDark)}>
            <Popup><span className="font-bold text-xs">{spot.name}</span></Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
