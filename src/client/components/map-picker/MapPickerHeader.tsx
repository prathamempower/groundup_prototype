import React from 'react';
import { Globe, LocateFixed, ExternalLink, Loader2 } from 'lucide-react';

interface MapPickerHeaderProps {
  isLoadingAddress: boolean;
  currentCoords: { lat: number; lng: number };
  isDetectingGPS: boolean;
  onDetectGPS?: () => void;
  address: string;
}

export function MapPickerHeader({
  isLoadingAddress,
  currentCoords,
  isDetectingGPS,
  onDetectGPS,
  address,
}: MapPickerHeaderProps) {
  return (
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
  );
}
