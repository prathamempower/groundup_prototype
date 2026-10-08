import React from 'react';
import {
  ChevronLeft,
  Layers,
  FileCheck,
  Camera,
  Plus,
} from 'lucide-react';
import { UserRole } from '../../../../shared/types';
import { hasPermission } from '../../../../shared/rbac/matrix';

export interface ProjectDetailHeaderProps {
  projectName: string;
  onBack: () => void;
  currentRole: UserRole;
  onOpenDrawPacketModal: () => void;
  onOpenChangeOrderModal: () => void;
  onOpenClaimModal?: () => void;
  onOpenDailyLog?: () => void;
  onSelectTimeline?: () => void;
}

export const ProjectDetailHeader: React.FC<ProjectDetailHeaderProps> = ({
  projectName,
  onBack,
  currentRole,
  onOpenDrawPacketModal,
  onOpenChangeOrderModal,
  onOpenClaimModal,
  onOpenDailyLog,
  onSelectTimeline,
}) => {
  return (
    <div className="max-w-6xl mx-auto space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <button onClick={onBack} className="hover:text-slate-900 flex items-center gap-1 cursor-pointer">
            <ChevronLeft className="w-3.5 h-3.5" /> Portfolio
          </button>
          <span>/</span>
          <span className="text-slate-900 font-bold">{projectName}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Commercial Model: <strong>Daily Updates / Open-Book</strong></span>
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">{projectName}</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            73 Broadway, Hoboken NJ · 3 Luxury Units · 4,800 sf · Lender: BCB Bank · GC: K&P Construction
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission(currentRole, 'milestone_claim:submit') && (
            <button
              onClick={onOpenDrawPacketModal}
              className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Submit Milestone Claim</span>
            </button>
          )}

          {hasPermission(currentRole, 'field_log:create') && (
            <button
              onClick={onSelectTimeline}
              className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Post Daily Work Log</span>
            </button>
          )}

          {hasPermission(currentRole, 'change_order:create') && (
            <button
              onClick={onOpenChangeOrderModal}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Change Order
            </button>
          )}

          {hasPermission(currentRole, 'draw:create_packet') && (
            <button
              onClick={onOpenDrawPacketModal}
              className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" /> Build Draw Packet
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
