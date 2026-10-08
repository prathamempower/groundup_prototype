import React from 'react';
import { Smartphone, Upload, Sparkles, ArrowRight } from 'lucide-react';
import { SitePhoto } from '../types';

interface SiteProgressStepProps {
  sitePhotos: SitePhoto[];
  onViewChecklist: () => void;
}

export function SiteProgressStep({ sitePhotos, onViewChecklist }: SiteProgressStepProps) {
  return (
    <div className="space-y-5">
      {/* Subheader with Action Buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Site progress · Apr 25</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            14 photos uploaded by foreman. AI verified framing milestone for Draw #2.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert('Mobile sync: Camera tethering active for foreman.')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-slate-500" />
            <span>Add from phone</span>
          </button>

          <button
            onClick={() => alert('Select photos to upload from site survey.')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* AI Photo Analysis Banner */}
      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            PHOTO ANALYSIS
          </p>
          <p className="text-xs text-emerald-950 mt-1 leading-relaxed">
            <span className="font-bold">Framing milestone confirmed.</span> AI matched site photos to Heritage Bank's required progression for Draw #2 (framing 80%+, roof trusses set, sheathing complete). Ready to submit.{' '}
            <button
              onClick={onViewChecklist}
              className="font-semibold underline hover:text-emerald-700 inline-flex items-center gap-0.5 cursor-pointer"
            >
              See checklist <ArrowRight className="w-3 h-3" />
            </button>
          </p>
        </div>
      </div>

      {/* 6 Photo Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sitePhotos.map((photo, index) => (
          <div
            key={photo.id}
            className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs hover:border-slate-300 transition"
          >
            {/* Photo Placeholder Area */}
            <div className="h-44 bg-slate-100 flex items-center justify-center border-b border-slate-100 relative">
              <span className="text-xs font-medium text-slate-400 font-mono">
                [site photo {index + 1}]
              </span>
              <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur-xs">
                {(photo.aiConfidence * 100).toFixed(0)}% AI match
              </div>
            </div>

            {/* Photo Meta and Tags */}
            <div className="p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">{photo.title}</span>
                <span className="text-slate-400 text-[11px]">{photo.time}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {photo.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${tag.color}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
