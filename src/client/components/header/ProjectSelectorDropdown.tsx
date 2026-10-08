import React, { useState } from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import { Project } from '../../../shared/types';

interface ProjectSelectorDropdownProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
}

export function ProjectSelectorDropdown({
  projects,
  selectedProjectId,
  onSelectProject,
}: ProjectSelectorDropdownProps) {
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  return (
    <div className="relative">
      <button
        onClick={() => setShowProjectMenu(!showProjectMenu)}
        className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 transition-all cursor-pointer shadow-2xs"
      >
        <div className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center shrink-0">
          <Building2 className="w-3 h-3 text-emerald-400" />
        </div>
        <span className="font-bold">{activeProject ? activeProject.name : 'Select Project'}</span>
        <span
          className={`w-2 h-2 rounded-full ${
            activeProject?.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-blue-500'
          }`}
        />
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {showProjectMenu && (
        <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Select Project
          </div>
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                onSelectProject(p.id);
                setShowProjectMenu(false);
              }}
              className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                p.id === selectedProjectId ? 'bg-slate-100/80 font-bold text-slate-900' : 'text-slate-700'
              }`}
            >
              <div className="min-w-0 pr-2">
                <div className="font-semibold text-slate-900 truncate">{p.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{p.address}</div>
              </div>
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  p.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-blue-500'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
