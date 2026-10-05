// GroundUp AI — Interactive Leaflet/OSM Location Picker Component
// Allows user to click anywhere on the real geographic map to reverse-geocode and auto-input site address

import React, { useEffect, useRef, useState } from 'react';
import { Globe, MapPin, LocateFixed, ExternalLink, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    L: any;
  }
}

interface InteractiveSiteMapPickerProps {
  address: string;
  coords: { lat: number; lng: number } | null;
  onSelectLocation: (address: string, coords: { lat: number; lng: number }) => void;
  isDetectingGPS?: boolean;
  onDetectGPS?: () => void;
}

export function InteractiveSiteMapPicker({
  address,
  coords,
  onSelectLocation,
  isDetectingGPS = false,
  onDetectGPS,
}: InteractiveSiteMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>(
    coords || { lat: 30.2672, lng: -97.7431 } // Default Austin, TX center
  );
  const [isMapReady, setIsMapReady] = useState(false);

  // Load Leaflet CSS and JS dynamically if not present
  useEffect(() => {
    let isSubscribed = true;

    const loadLeaflet = () => {
      if (window.L) {
        if (isSubscribed) setIsMapReady(true);
        return;
      }

      // Check if stylesheet is injected
      if (!document.getElementById('leaflet-css')) {
        const css = document.createElement('link');
        css.id = 'leaflet-css';
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(css);
      }

      // Check if script is injected
      if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          if (isSubscribed) setIsMapReady(true);
        };
        document.head.appendChild(script);
      } else {
        const checkL = setInterval(() => {
          if (window.L) {
            clearInterval(checkL);
            if (isSubscribed) setIsMapReady(true);
          }
        }, 100);
      }
    };

    loadLeaflet();
    return () => {
      isSubscribed = false;
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!isMapReady || !mapRef.current || mapInstanceRef.current) return;

    const L = window.L;

    // Create Map instance
    const initialLat = currentCoords.lat;
    const initialLng = currentCoords.lng;

    const map = L.map(mapRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Custom Red Pin Icon
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="width: 36px; height: 36px; background-color: #059669; border: 3px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); color: white; font-weight: bold;">
            📍
          </div>
          <div style="position: absolute; bottom: -6px; width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #059669;"></div>
        </div>
      `,
      iconSize: [36, 42],
      iconAnchor: [18, 42],
    });

    const marker = L.marker([initialLat, initialLng], { icon: customIcon }).addTo(map);
    markerRef.current = marker;
    mapInstanceRef.current = map;

    // Click Listener on Map -> Reverse Geocode Clicked Location
    map.on('click', async (e: any) => {
      const clickedLat = e.latlng.lat;
      const clickedLng = e.latlng.lng;

      marker.setLatLng([clickedLat, clickedLng]);
      map.panTo([clickedLat, clickedLng]);

      setCurrentCoords({ lat: clickedLat, lng: clickedLng });
      setIsLoadingAddress(true);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${clickedLat}&lon=${clickedLng}`
        );

        if (response.ok) {
          const data = await response.json();
          const addr = data.address || {};
          const houseNumber = addr.house_number ? `${addr.house_number} ` : '';
          const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || 'Site Location';
          const city = addr.city || addr.town || addr.village || addr.county || 'Austin';
          const state = addr.state || 'TX';
          const postcode = addr.postcode || '';

          const formatted = `${houseNumber}${road}, ${city}, ${state} ${postcode}`.trim().replace(/^, /, '');
          onSelectLocation(formatted, { lat: clickedLat, lng: clickedLng });
        } else {
          const fallback = `Site GPS: ${clickedLat.toFixed(5)}, ${clickedLng.toFixed(5)}`;
          onSelectLocation(fallback, { lat: clickedLat, lng: clickedLng });
        }
      } catch {
        const fallback = `Site GPS: ${clickedLat.toFixed(5)}, ${clickedLng.toFixed(5)}`;
        onSelectLocation(fallback, { lat: clickedLat, lng: clickedLng });
      } finally {
        setIsLoadingAddress(false);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isMapReady]);

  // Sync coords prop with map center & marker
  useEffect(() => {
    if (!coords || !mapInstanceRef.current || !markerRef.current) return;

    setCurrentCoords(coords);
    markerRef.current.setLatLng([coords.lat, coords.lng]);
    mapInstanceRef.current.panTo([coords.lat, coords.lng]);
  }, [coords]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white overflow-hidden shadow-md">
      {/* Header Bar */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white text-xs">Interactive Click-to-Pin Location Map</span>
          {isLoadingAddress ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Fetching Address...</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
              GPS: {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {onDetectGPS && (
            <button
              type="button"
              onClick={onDetectGPS}
              disabled={isDetectingGPS}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <LocateFixed className={`w-3 h-3 ${isDetectingGPS ? 'animate-spin' : ''}`} />
              <span>{isDetectingGPS ? 'Detecting...' : '📍 My Device Location'}</span>
            </button>
          )}

          {address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1 cursor-pointer"
            >
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="relative">
        <div ref={mapRef} className="h-64 w-full bg-slate-800 z-10" />

        {/* Floating Instruction Banner */}
        <div className="absolute top-2 left-2 z-20 pointer-events-none">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-700 text-[11px] font-semibold text-emerald-300 shadow-lg flex items-center gap-1.5">
            <span>👇 Click anywhere on map to drop pin & input address</span>
          </div>
        </div>

        {!isMapReady && (
          <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-slate-400 text-xs gap-2 z-30">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Loading interactive map tiles...</span>
          </div>
        )}
      </div>

      {/* Clicked Address Confirmation Bar */}
      {address && (
        <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-2 truncate text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-white">Selected Site:</span>
            <span className="truncate text-emerald-200 font-medium">{address}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-md shrink-0 ml-2">
            Synced to Form ✓
          </span>
        </div>
      )}
    </div>
  );
}
