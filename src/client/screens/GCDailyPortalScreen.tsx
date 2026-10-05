// GroundUp AI — GC (Daily Updates / Open-Book) Portal
// Dedicated portal for GCs under cost-plus / daily update contracts: daily work logs, receipts, and GC markup calculations

import React, { useState } from 'react';
import { 
  Camera, 
  Calendar, 
  Users, 
  Sun, 
  CheckCircle2, 
  FileText, 
  DollarSign, 
  Plus, 
  ShieldCheck, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { Project, DailyLogEntry } from '../../shared/types';

interface GCDailyPortalScreenProps {
  projects: Project[];
  selectedProjectId: string;
}

export function GCDailyPortalScreen({
  projects,
  selectedProjectId,
}: GCDailyPortalScreenProps) {
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Daily logs state
  const [dailyLogs, setDailyLogs] = useState<DailyLogEntry[]>([
    {
      id: 'log-1',
      project_id: selectedProjectId,
      date: 'Oct 5, 2026 (Today)',
      gc_name: 'Sylvia Concrete & Framing',
      weather: 'Clear · 64°F',
      workers_on_site: 14,
      trades_active: ['Framing', 'Plumbing Rough', 'Electrical'],
      work_completed: 'Completed 3rd floor subfloor installation and plumbing vent stack penetrations through roof deck.',
      issues_or_delays: 'Lumber delivery delayed by 2 hours due to bridge traffic; made up time in afternoon.',
      photos_count: 6,
      sub_costs: 8450,
      gc_markup_pct: 0.12,
      total_billed: 9464,
    },
    {
      id: 'log-2',
      project_id: selectedProjectId,
      date: 'Oct 4, 2026',
      gc_name: 'Sylvia Concrete & Framing',
      weather: 'Partly Cloudy · 60°F',
      workers_on_site: 12,
      trades_active: ['Rough Plumbing', 'Framing'],
      work_completed: 'Set cast iron waste lines and rough-in brackets for master bathroom showers.',
      issues_or_delays: 'None',
      photos_count: 4,
      sub_costs: 6200,
      gc_markup_pct: 0.12,
      total_billed: 6944,
    },
  ]);

  // Form state
  const [newDate, setNewDate] = useState('2026-10-05');
  const [workersCount, setWorkersCount] = useState('14');
  const [weather, setWeather] = useState('Clear / Sunny (64°F)');
  const [trades, setTrades] = useState('Framing, Rough Plumbing, Electrical');
  const [workNotes, setWorkNotes] = useState('Completed exterior plywood sheathing on east elevation.');
  const [subCost, setSubCost] = useState('4500');
  const [gcMarkup, setGcMarkup] = useState('12');
  const [logSubmitted, setLogSubmitted] = useState(false);

  const rawCostNum = parseFloat(subCost) || 0;
  const markupPctNum = (parseFloat(gcMarkup) || 12) / 100;
  const totalBilledNum = Math.round(rawCostNum * (1 + markupPctNum));

  const handlePostDailyLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: DailyLogEntry = {
      id: `log-${Date.now()}`,
      project_id: selectedProjectId,
      date: newDate,
      gc_name: 'Sylvia Concrete & Framing',
      weather,
      workers_on_site: parseInt(workersCount) || 10,
      trades_active: trades.split(',').map(t => t.trim()),
      work_completed: workNotes,
      photos_count: 5,
      sub_costs: rawCostNum,
      gc_markup_pct: markupPctNum,
      total_billed: totalBilledNum,
    };

    setDailyLogs(prev => [newEntry, ...prev]);
    setLogSubmitted(true);
    setTimeout(() => setLogSubmitted(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
              GC Portal · Daily Updates & Cost-Plus Accounting
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Daily Field Logs & Subcontractor Receipts</h1>
          <p className="text-xs text-slate-500">
            Contractor: Sylvia Concrete & Framing · Project: {activeProject.name}
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs bg-slate-900 text-white px-3.5 py-2 rounded-xl">
          <span>Contract Terms: Cost + 12% GC Markup</span>
        </div>
      </div>

      {/* Daily Log Entry Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-700" />
          <span>Post Daily Work Report & Receipts</span>
        </h3>

        <form onSubmit={handlePostDailyLog} className="space-y-4 text-xs">
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

      {/* Historical Daily Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Submitted Daily Work Reports ({dailyLogs.length})</span>
          <span className="text-slate-500 font-normal">Reconciled into Spend Truth ledger</span>
        </div>
        <div className="divide-y divide-slate-100">
          {dailyLogs.map((log) => (
            <div key={log.id} className="p-5 hover:bg-slate-50 transition space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-slate-900 text-sm">{log.date}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                    {log.weather}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                    {log.workers_on_site} Workers
                  </span>
                </div>
                <div className="font-mono font-bold text-slate-900 text-sm">
                  ${log.total_billed.toLocaleString()} Billed
                </div>
              </div>

              <p className="text-slate-700 leading-relaxed">{log.work_completed}</p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Trades: {log.trades_active.join(', ')}</span>
                <span className="flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-slate-400" />
                  <span>{log.photos_count} Geotagged Photos Attached</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
