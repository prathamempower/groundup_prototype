import React, { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { Project } from '../../shared/types';
import { MapLocation } from './map-view/types';
import { ProjectListSidebar } from './map-view/ProjectListSidebar';
import { TexasMapSvgCanvas } from './map-view/TexasMapSvgCanvas';

interface MapViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onSelectProject: (projectId: string) => void;
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

  const handleOpenDashboard = (id: string) => {
    onClose();
    onSelectProject(id);
  };

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
          <ProjectListSidebar
            locations={locations}
            selectedLocId={selectedLocId}
            onSelectLocation={setSelectedLocId}
            onOpenDashboard={handleOpenDashboard}
          />

          <TexasMapSvgCanvas
            locations={locations}
            selectedLocId={selectedLocId}
            activeLocation={activeLocation}
            onSelectLocation={setSelectedLocId}
            onOpenDashboard={handleOpenDashboard}
          />
        </div>
      </div>
    </div>
  );
}
