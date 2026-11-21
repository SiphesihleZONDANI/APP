import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function MapComponent({
  center = [47.6062, -122.3321],
  zoom = 15,
  markers = [],
  onLocationSelect = null,
  showAccuracyCircle = true,
  accuracyRadius = 25,
  height = '240px',
  interactive = true,
  pulseCenter = true
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerGroupRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not yet created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center[0], center[1]],
        zoom,
        zoomControl: interactive,
        dragging: interactive,
        touchZoom: interactive,
        scrollWheelZoom: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const markerGroup = L.layerGroup().addTo(map);
      markerGroupRef.current = markerGroup;

      if (interactive && onLocationSelect) {
        map.on('click', (e) => {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        });
      }

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map view and markers when center or markers change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setView([center[0], center[1]], zoom, { animate: true });

    if (markerGroupRef.current) {
      markerGroupRef.current.clearLayers();

      // Pulsing user/report marker at center
      if (pulseCenter) {
        const pulseIcon = L.divIcon({
          className: 'custom-pulse-container',
          html: `<div class="sos-pulse-marker"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });
        L.marker([center[0], center[1]], { icon: pulseIcon }).addTo(markerGroupRef.current);

        if (showAccuracyCircle && accuracyRadius > 0) {
          L.circle([center[0], center[1]], {
            radius: Math.max(accuracyRadius, 20),
            color: '#dc2626',
            fillColor: '#ef4444',
            fillOpacity: 0.15,
            weight: 1.5,
            dashArray: '4, 4'
          }).addTo(markerGroupRef.current);
        }
      }

      // Additional markers (police units, other reports)
      markers.forEach(m => {
        let icon;
        if (m.type === 'POLICE') {
          icon = L.divIcon({
            className: 'police-marker-container',
            html: `<div class="police-marker" title="${m.title || 'Police Unit'}">🚓</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });
        } else if (m.type === 'INCIDENT') {
          const colorClass = m.priority === 'CRITICAL' ? 'bg-red-600' : m.priority === 'HIGH' ? 'bg-orange-500' : 'bg-amber-500';
          icon = L.divIcon({
            className: 'incident-marker-container',
            html: `<div class="w-6 h-6 rounded-full ${colorClass} border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold">${m.priority === 'CRITICAL' ? '!' : '•'}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
        } else {
          icon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41]
          });
        }

        const markerObj = L.marker([m.lat, m.lng], { icon }).addTo(markerGroupRef.current);
        if (m.title || m.description) {
          markerObj.bindPopup(`<strong>${m.title || 'Location'}</strong><br/>${m.description || ''}`);
        }
        if (m.onClick) {
          markerObj.on('click', () => m.onClick(m));
        }
      });
    }
  }, [center, zoom, markers, pulseCenter, showAccuracyCircle, accuracyRadius]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      {interactive && onLocationSelect && (
        <div className="absolute top-2 left-2 z-10 bg-slate-900/80 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-full pointer-events-none border border-slate-700">
          📍 Tap map to calibrate pin
        </div>
      )}
    </div>
  );
}
