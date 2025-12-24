import { useState, useEffect } from 'react';

export function useGeoLocation() {
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter] = useState([40.730610, -73.935242]); // NYC Default

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      null,
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { userLocation, mapCenter };
}
