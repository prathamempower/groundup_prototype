import React from 'react';

export function SidebarHeader() {
  return (
    <div className="p-4 px-5 flex items-center justify-between border-b border-slate-100">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center shadow-xs">
          <span className="text-emerald-400 font-black text-base tracking-tighter">G</span>
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-slate-900 text-[15px] tracking-tight leading-none">GroundUp AI</span>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">Finance Intelligence</span>
        </div>
      </div>
    </div>
  );
}
