import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LocationContext = createContext(null);

// Default Metro City coordinates for reliable demo fallback
const DEFAULT_METRO_COORDS = {
  lat: 47.6062,
  lng: -122.3321,
  accuracy: 4.8,
  address: "615 Pike St, Downtown Metro Center, Metro City",
  timestamp: new Date().toISOString()
};

export const LocationProvider = ({ children }) => {
  const [coords, setCoords] = useState(DEFAULT_METRO_COORDS);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt', 'granted', 'denied'
  const [isLocating, setIsLocating] = useState(false);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [watchId, setWatchId] = useState(null);

  // Reverse geocoding helper (OpenStreetMap Nominatim with fallback)
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { headers: { 'User-Agent': 'SafeHer-WomenSafetyApp/1.0' } }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          // Truncate long address to readable street/neighborhood format
          const parts = data.display_name.split(',');
          return parts.slice(0, 3).join(',').trim();
        }
      }
    } catch (err) {
      // Fallback
    }
    return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)} (GPS Lock)`;
  };

  // Request & acquire location
  const refreshLocation = useCallback(async () => {
    setIsLocating(true);
    setLocationError(null);

    if (!('geolocation' in navigator)) {
      setPermissionStatus('denied');
      setLocationError('Geolocation is not supported by your device browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setPermissionStatus('granted');
        const readableAddress = await reverseGeocode(latitude, longitude);

        setCoords({
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy * 10) / 10,
          address: readableAddress,
          timestamp: new Date().toISOString()
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation access failed or denied, using simulated precision location:', err.message);
        setPermissionStatus(err.code === 1 ? 'denied' : 'prompt');
        setLocationError(
          err.code === 1
            ? 'Location permission was denied. You can manually enter your address or use default coordinates.'
            : 'Unable to retrieve GPS fix. Using standard downtown coordinates.'
        );
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000
      }
    );
  }, []);

  // Initial check on mount
  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  // Start continuous tracking during an active emergency
  const startEmergencyTracking = () => {
    setIsTrackingActive(true);
    if ('geolocation' in navigator) {
      const id = navigator.geolocation.watchPosition(
        async (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const address = await reverseGeocode(latitude, longitude);
          setCoords({
            lat: latitude,
            lng: longitude,
            accuracy: Math.round(accuracy * 10) / 10,
            address,
            timestamp: new Date().toISOString()
          });
        },
        (err) => console.warn('Watch position error:', err),
        { enableHighAccuracy: true }
      );
      setWatchId(id);
    }
  };

  const stopEmergencyTracking = () => {
    setIsTrackingActive(false);
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  // Manual override if permission denied or user wants to pin specific spot
  const setManualLocation = (newLat, newLng, customAddress) => {
    setCoords({
      lat: Number(newLat),
      lng: Number(newLng),
      accuracy: 2.0,
      address: customAddress || `Manual Address (${Number(newLat).toFixed(4)}, ${Number(newLng).toFixed(4)})`,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <LocationContext.Provider value={{
      coords,
      permissionStatus,
      isLocating,
      isTrackingActive,
      locationError,
      refreshLocation,
      startEmergencyTracking,
      stopEmergencyTracking,
      setManualLocation
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
