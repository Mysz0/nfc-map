import { useState, useEffect } from 'react';
import { getDistance } from '../utils/geoUtils'; 

export function useGeoLocation(spots, customRadius, spotStreaks = {}) {
  const [userLocation, setUserLocation] = useState(null);
  const [proximity, setProximity] = useState({ isNear: false, canClaim: false, spotId: null });
  const [mapCenter] = useState([50.0121, 22.6742]);

  useEffect(() => {
    const detectionRange = customRadius || 250;
    const todayStr = new Date().toDateString();

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);

        let readySpot = null;
        let closestReadyDist = Infinity;
        
        let securedSpot = null;
        let closestSecuredDist = Infinity;

        let foundClaimable = false;

        Object.values(spots).forEach(spot => {
          const dist = getDistance(coords.lat, coords.lng, spot.lat, spot.lng);
          const streakInfo = spotStreaks[spot.id];
          const isLoggedToday = streakInfo?.last_claim && new Date(streakInfo.last_claim).toDateString() === todayStr;

          // 1. DYNAMIC DETECTION
          if (dist <= detectionRange) {
            if (!isLoggedToday) {
              // Track the closest node that NEEDS sync
              if (dist < closestReadyDist) {
                closestReadyDist = dist;
                readySpot = spot.id;
              }
            } else {
              // Track the closest node even if it's already secured
              if (dist < closestSecuredDist) {
                closestSecuredDist = dist;
                securedSpot = spot.id;
              }
            }
          }

          // 2. CLAIM RANGE
          // We only allow claiming if the closest node in range is actually ready
          if (dist <= 10 && !isLoggedToday) {
            foundClaimable = true;
          }
        });

        // PRIORITY LOGIC: 
        // Always show the Ready spot if one is in range. 
        // If not, show the Secured spot.
        const activeId = readySpot || securedSpot;

        setProximity({ 
          isNear: !!activeId, 
          canClaim: foundClaimable, 
          spotId: activeId 
        });
      },
      (err) => console.error("GPS Signal Lost:", err),
      { 
        enableHighAccuracy: true, 
        maximumAge: 0,
        timeout: 5000 
      }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [spots, customRadius, spotStreaks]); // Added spotStreaks to dependency array

  return { 
    userLocation, 
    mapCenter, 
    isNearSpot: proximity.isNear, 
    canClaim: proximity.canClaim, 
    activeSpotId: proximity.spotId 
  };
}
