import React from 'react';
import { ExternalLink } from 'lucide-react';
import { MapLocation } from './types';

interface ProjectListSidebarProps {
  locations: MapLocation[];
  selectedLocId: string;
  onSelectLocation: (id: string) => void;
  onOpenDashboard: (id: string) => void;
}

export function ProjectListSidebar({
  locations,
  selectedLocId,
  onSelectLocation,
  onOpenDashboard,
}: ProjectListSidebarProps) {
  return (
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
            onClick={() => onSelectLocation(loc.id)}
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
                  onOpenDashboard(loc.id);
                }}
                className="w-full mt-2.5 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <span>Open Project Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
