import React from 'react';
import { X } from 'lucide-react';

interface DrawPacketHeaderProps {
  nextDrawNumber: number;
  onClose: () => void;
}

export function DrawPacketHeader({ nextDrawNumber, onClose }: DrawPacketHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
          #{nextDrawNumber}
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-base">Build Draw Packet — Draw #{nextDrawNumber}</h3>
          <p className="text-xs text-slate-500">Lender Portal Submission Package (AIA G702 / G703 Specification)</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
