import React from 'react';
import { Building, ExternalLink } from 'lucide-react';
import { MapLocation } from './types';

interface TexasMapSvgCanvasProps {
  locations: MapLocation[];
  selectedLocId: string;
  activeLocation: MapLocation | null;
  onSelectLocation: (id: string) => void;
  onOpenDashboard: (id: string) => void;
}

export function TexasMapSvgCanvas({
  locations,
  selectedLocId,
  activeLocation,
  onSelectLocation,
  onOpenDashboard,
}: TexasMapSvgCanvasProps) {
  return (
    <div className="md:col-span-7 bg-slate-100 relative flex items-center justify-center overflow-hidden p-4">
      <div className="relative w-full h-full max-h-[600px] bg-[#e2e8f0] rounded-xl border border-slate-300 shadow-inner overflow-hidden flex items-center justify-center">
        {/* SVG Road Map */}
        <svg className="w-full h-full absolute inset-0 select-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 54,15 Q 50,45 46,60 T 32,88" stroke="#94a3b8" strokeWidth="1.8" fill="none" strokeDasharray="1,0.5" />
          <path d="M 38,22 Q 48,42 62,65" stroke="#cbd5e1" strokeWidth="1.2" fill="none" />
          <path d="M 46,30 Q 45,45 45,60" stroke="#cbd5e1" strokeWidth="1" fill="none" />
          <path d="M 25,48 Q 45,42 55,48 T 85,46" stroke="#60a5fa" strokeWidth="2.5" fill="none" opacity="0.6" />

          <text x="54" y="24" fill="#64748b" fontSize="3.5" fontWeight="bold">Round Rock</text>
          <text x="60" y="32" fill="#64748b" fontSize="3" fontWeight="bold">Pflugerville</text>
          <text x="50" y="44" fill="#334155" fontSize="4.5" fontWeight="bold">AUSTIN</text>
          <text x="46" y="62" fill="#64748b" fontSize="3.5" fontWeight="bold">Buda / Kyle</text>
          <text x="24" y="82" fill="#334155" fontSize="4" fontWeight="bold">SAN ANTONIO</text>
        </svg>

        {/* Interactive Map Pins */}
        {locations.map((loc) => {
          const isSelected = loc.id === selectedLocId;
          return (
            <div
              key={loc.id}
              style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
              onClick={() => onSelectLocation(loc.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
            >
              {isSelected && (
                <span className="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping" />
              )}

              <div
                className={`relative flex items-center justify-center rounded-full shadow-lg transition transform hover:scale-125 ${
                  isSelected
                    ? 'w-9 h-9 bg-slate-900 text-white border-2 border-white ring-2 ring-emerald-500'
                    : loc.risk
                    ? 'w-7 h-7 bg-amber-500 text-white border-2 border-white'
                    : 'w-7 h-7 bg-emerald-600 text-white border-2 border-white'
                }`}
              >
                <Building className={`${isSelected ? 'w-4 h-4' : 'w-3 h-3'}`} />
              </div>

              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md z-30">
                {loc.name} ({loc.budget})
              </div>
            </div>
          );
        })}

        {/* Floating Active Info Card */}
        {activeLocation && (
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-300 shadow-xl max-w-xs z-30 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-900 text-xs truncate">{activeLocation.name}</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                {activeLocation.city}, TX
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mb-2">{activeLocation.address}</p>

            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-200 mb-2">
              <span>Budget: <strong>{activeLocation.budget}</strong></span>
              <span>Next Draw: <strong>{activeLocation.nextDraw.split(' · ')[0]}</strong></span>
            </div>

            <button
              onClick={() => onOpenDashboard(activeLocation.id)}
              className="w-full py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>View Site Dashboard</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
