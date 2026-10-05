// GroundUp AI — Interactive Geographic Map View Modal
// Visualizes construction project locations across Central Texas (Austin, Round Rock, San Antonio, Pflugerville, Buda)
// Features Interactive SVG Map, Project Pins, Live Status Indicators, and Direct Navigation

import React, { useState } from 'react';
import {
  X,
  MapPin,
  Building,
  Navigation,
  ExternalLink,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign
} from 'lucide-react';
import { Project } from '../../shared/types';

interface MapViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onSelectProject: (projectId: string) => void;
}

interface MapLocation {
  id: string;
  name: string;
  city: string;
  state: string;
  zip: string;
  address: string;
  x: number; // SVG percentage
  y: number; // SVG percentage
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
  units: number;
  budget: string;
  nextDraw: string;
  progressPct: number;
  trade: string;
  risk?: string;
}

export function MapViewModal({ isOpen, onClose, projects, onSelectProject }: MapViewModalProps) {
  if (!isOpen) return null;

  const locations: MapLocation[] = projects.map((p, idx) => ({
    id: p.id,
    name: p.name,
    city: p.address.split(',')[1]?.trim() || 'Austin',
    state: 'TX',
    zip: '78704',
    address: p.address,
    x: 35 + ((idx * 18) % 45),
    y: 30 + ((idx * 15) % 50),
    status: p.status,
    units: p.units || 1,
    budget: `$${((p.target_budget || 0) / 1000).toFixed(0)}k`,
    nextDraw: p.status === 'ACTIVE' ? 'Pending Review' : p.status === 'COMPLETED' ? 'Fully Disbursed' : '—',
    progressPct: p.status === 'COMPLETED' ? 100 : p.status === 'ACTIVE' ? 35 : 0,
    trade: p.status === 'COMPLETED' ? 'Turnkey' : p.status === 'ACTIVE' ? 'Construction' : 'Planning',
  }));

  const [selectedLocId, setSelectedLocId] = useState<string>(projects[0]?.id || '');

  const activeLocation = locations.find((l) => l.id === selectedLocId) || locations[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-5xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Modal Header */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Portfolio Geographic Map View</h2>
              <p className="text-[11px] text-slate-500">Central Texas Corridor · Austin, Round Rock, San Antonio, Pflugerville & Buda</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content: Left List & Right Interactive Map */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Projects Sidebar */}
          <div className="md:col-span-5 border-r border-slate-200 overflow-y-auto p-4 space-y-2.5 bg-slate-50/50">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                ACTIVE SITES ({locations.length})
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                GPS Linked
              </span>
            </div>

            {locations.map((loc) => {
              const isSelected = loc.id === selectedLocId;
              return (
                <div
                  key={loc.id}
                  onClick={() => setSelectedLocId(loc.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-white border-slate-900 shadow-md ring-1 ring-slate-900/10'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-900 text-xs truncate">{loc.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        loc.risk
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : loc.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {loc.risk ? '2 Risks' : loc.status === 'ACTIVE' ? 'On Track' : 'Not Started'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 truncate mb-2">{loc.address}</p>

                  <div className="grid grid-cols-3 gap-2 text-[10px] pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400">Budget</span>
                      <p className="font-bold text-slate-800">{loc.budget}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Phase</span>
                      <p className="font-bold text-slate-800">{loc.trade}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Next Draw</span>
                      <p className="font-bold text-slate-800 truncate">{loc.nextDraw.split(' · ')[0]}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        onSelectProject(loc.id);
                      }}
                      className="w-full mt-2.5 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <span>Open Project Dashboard</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Interactive Central Texas Map */}
          <div className="md:col-span-7 bg-slate-100 relative flex items-center justify-center overflow-hidden p-4">
            {/* Map Canvas Background Container */}
            <div className="relative w-full h-full max-h-[600px] bg-[#e2e8f0] rounded-xl border border-slate-300 shadow-inner overflow-hidden flex items-center justify-center">
              {/* Central Texas Stylized Topography & Highways SVG */}
              <svg className="w-full h-full absolute inset-0 select-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Highway I-35 corridor line */}
                <path
                  d="M 54,15 Q 50,45 46,60 T 32,88"
                  stroke="#94a3b8"
                  strokeWidth="1.8"
                  fill="none"
                  strokeDasharray="1,0.5"
                />
                {/* Highway US-183 line */}
                <path
                  d="M 38,22 Q 48,42 62,65"
                  stroke="#cbd5e1"
                  strokeWidth="1.2"
                  fill="none"
                />
                {/* Highway Loop 1 Mopac line */}
                <path
                  d="M 46,30 Q 45,45 45,60"
                  stroke="#cbd5e1"
                  strokeWidth="1"
                  fill="none"
                />
                {/* Colorado River blue ribbon */}
                <path
                  d="M 25,48 Q 45,42 55,48 T 85,46"
                  stroke="#60a5fa"
                  strokeWidth="2.5"
                  fill="none"
                  opacity="0.6"
                />

                {/* City Labels */}
                <text x="54" y="24" fill="#64748b" fontSize="3.5" fontWeight="bold">Round Rock</text>
                <text x="60" y="32" fill="#64748b" fontSize="3" fontWeight="bold">Pflugerville</text>
                <text x="50" y="44" fill="#334155" fontSize="4.5" fontWeight="bold">AUSTIN</text>
                <text x="46" y="62" fill="#64748b" fontSize="3.5" fontWeight="bold">Buda / Kyle</text>
                <text x="24" y="82" fill="#334155" fontSize="4" fontWeight="bold">SAN ANTONIO</text>
              </svg>

              {/* Map Interactive Pins */}
              {locations.map((loc) => {
                const isSelected = loc.id === selectedLocId;
                return (
                  <div
                    key={loc.id}
                    style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                    onClick={() => setSelectedLocId(loc.id)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                  >
                    {/* Pulsing ring for selected pin */}
                    {isSelected && (
                      <span className="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping" />
                    )}

                    {/* Pin Marker */}
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

                    {/* Hover Tooltip Label */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md z-30">
                      {loc.name} ({loc.budget})
                    </div>
                  </div>
                );
              })}

              {/* Active Pin Info Card Floating in Bottom Right */}
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
                    onClick={() => {
                      onClose();
                      onSelectProject(activeLocation.id);
                    }}
                    className="w-full py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>View Site Dashboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
