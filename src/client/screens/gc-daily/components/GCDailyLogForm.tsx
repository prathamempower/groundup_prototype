import React from 'react';
import { Calendar, DollarSign, Camera, CheckCircle2, Plus } from 'lucide-react';

interface GCDailyLogFormProps {
  newDate: string;
  setNewDate: (d: string) => void;
  workersCount: string;
  setWorkersCount: (w: string) => void;
  weather: string;
  setWeather: (w: string) => void;
  trades: string;
  setTrades: (t: string) => void;
  workNotes: string;
  setWorkNotes: (n: string) => void;
  subCost: string;
  setSubCost: (c: string) => void;
  gcMarkup: string;
  setGcMarkup: (m: string) => void;
  logSubmitted: boolean;
  totalBilledNum: number;
  onSubmit: (e: React.FormEvent) => void;
}

export const GCDailyLogForm: React.FC<GCDailyLogFormProps> = ({
  newDate,
  setNewDate,
  workersCount,
  setWorkersCount,
  weather,
  setWeather,
  trades,
  setTrades,
  workNotes,
  setWorkNotes,
  subCost,
  setSubCost,
  gcMarkup,
  setGcMarkup,
  logSubmitted,
  totalBilledNum,
  onSubmit,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
        <Calendar className="w-5 h-5 text-teal-700" />
        <span>Post Daily Work Report & Receipts</span>
      </h3>

      <form onSubmit={onSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Workers on Site</label>
            <input
              type="number"
              value={workersCount}
              onChange={(e) => setWorkersCount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Weather Conditions</label>
            <input
              type="text"
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Active Subcontractor Trades on Site</label>
          <input
            type="text"
            value={trades}
            onChange={(e) => setTrades(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Work Description & Accomplishments</label>
          <textarea
            rows={2}
            value={workNotes}
            onChange={(e) => setWorkNotes(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            required
          />
        </div>

        {/* Granular Cost & Markup Math */}
        <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-xl space-y-3">
          <span className="font-bold text-teal-900 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-teal-700" />
            <span>Cost-Plus Transparent Billed Math</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-teal-800 mb-0.5">Raw Material / Sub Costs ($)</label>
              <input
                type="number"
                value={subCost}
                onChange={(e) => setSubCost(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-teal-300 rounded-lg font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-teal-800 mb-0.5">Contractor Markup (%)</label>
              <input
                type="number"
                value={gcMarkup}
                onChange={(e) => setGcMarkup(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-teal-300 rounded-lg font-mono font-bold text-slate-900"
              />
            </div>
            <div className="flex flex-col justify-end">
              <span className="text-[11px] text-teal-700">Total Billed to Owner:</span>
              <span className="font-mono font-bold text-base text-slate-900">
                ${totalBilledNum.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Photo Upload Simulator */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-teal-700" />
            <span className="font-medium text-slate-700">Attach Daily Geotagged Site Photos (5 photos selected)</span>
          </div>
          <span className="text-teal-700 font-bold text-[11px]">Ready to upload</span>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-2"
          >
            {logSubmitted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Daily Log Posted to Control Center!</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-teal-400" />
                <span>Publish Daily Report (${totalBilledNum.toLocaleString()})</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
