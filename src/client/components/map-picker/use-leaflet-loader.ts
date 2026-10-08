import { useState, useEffect } from 'react';

export function useLeafletLoader() {
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

    const loadLeaflet = () => {
      if (window.L) {
        if (isSubscribed) setIsMapReady(true);
        return;
      }

      if (!document.getElementById('leaflet-css')) {
        const css = document.createElement('link');
        css.id = 'leaflet-css';
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(css);
      }

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

  return isMapReady;
}
