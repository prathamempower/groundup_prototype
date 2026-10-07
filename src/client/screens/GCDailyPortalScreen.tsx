// GroundUp AI — GC (Daily Updates / Open-Book) Portal
// Dedicated portal for GCs under cost-plus / daily update contracts: daily work logs, receipts, and GC markup calculations

import React, { useState, useEffect } from 'react';
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
  Clock,
  Layers,
  FileCheck
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

  // Change Orders state synchronized from Owner / localStorage
  const [changeOrders, setChangeOrders] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem(`groundup_change_orders_${selectedProjectId}`);
      if (stored) return JSON.parse(stored);
      const all = localStorage.getItem('groundup_all_change_orders');
      if (all) {
        const parsed = JSON.parse(all);
        const filtered = parsed.filter((c: any) => c.projectId === selectedProjectId || !c.projectId);
        if (filtered.length > 0) return filtered;
      }
    } catch {}
    return [
      {
        id: 'co-1',
        number: 'CO-001',
        category: 'Foundation',
        sub_section: 'Substructure & Pile Reinforcement',
        cost_code: '03-100',
        amount: 40000,
        reason: 'Unforeseen soft soil condition',
        description: 'Engineered grade beams and extra helical piles required by structural engineer.',
        status: 'APPROVED',
        visible_to_gc: true,
        gc_notes: 'Owner approved. GC authorized to proceed with foundation underpinning.',
        date: 'Mar 18, 2026',
        is_other: false,
      },
      {
        id: 'co-other-1',
        number: 'CO-002',
        category: 'Municipal Utility Easement Relocation',
        sub_section: 'Off-Site Civil & Utility Trenching',
        cost_code: '02-310',
        amount: 18500,
        reason: 'Township Utility Conflict',
        description: 'PSE&G mandated emergency lateral line relocation across west boundary easement.',
        status: 'APPROVED',
        visible_to_gc: true,
        gc_notes: 'Approved lateral rework. GC coordinated with municipal inspectors.',
        date: 'Apr 02, 2026',
        is_other: true,
      },
    ];
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem(`groundup_change_orders_${selectedProjectId}`);
        if (stored) {
          setChangeOrders(JSON.parse(stored));
        } else {
          const all = localStorage.getItem('groundup_all_change_orders');
          if (all) {
            const parsed = JSON.parse(all);
            const filtered = parsed.filter((c: any) => c.projectId === selectedProjectId || !c.projectId);
            if (filtered.length > 0) setChangeOrders(filtered);
          }
        }
      } catch {}
    };

    window.addEventListener('groundup_co_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('groundup_co_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [selectedProjectId]);

  const visibleCOs = changeOrders.filter(co => co.visible_to_gc !== false);

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

      {/* ══════════════════════════════════════════════════════════════════
          APPROVED CONTRACT CHANGE ORDERS & SUPPLEMENTAL ORDERS (SHOWED TO GC)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <h3 className="font-bold text-slate-900 text-sm">
                Approved Supplemental Scope & Change Orders (Showed to GC)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                {visibleCOs.length} Orders Authorized
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Owner-approved scope modifications and trade orders broadcasted directly to field contractor operations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl">
              +${visibleCOs.reduce((sum, co) => sum + (Number(co.amount) || 0), 0).toLocaleString()} Total Authorized
            </span>
          </div>
        </div>

        {visibleCOs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No change orders currently assigned or showed to GC for this project.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            <table className="w-full text-xs">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3 text-left">Order #</th>
                  <th className="px-5 py-3 text-left">Trade Category & Sub-Section</th>
                  <th className="px-5 py-3 text-right">Authorized Amount</th>
                  <th className="px-5 py-3 text-left">Root Cause / Scope Description</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-left">Owner Authorization Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleCOs.map((co) => (
                  <tr key={co.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-teal-600" />
                        <span>{co.number}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{co.category}</span>
                        {co.is_other && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            Other Scope
                          </span>
                        )}
                      </div>
                      {co.sub_section && (
                        <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                          Sub-Section: {co.sub_section}
                        </div>
                      )}
                      {co.cost_code && (
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          Cost Code: {co.cost_code}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right font-mono font-bold text-teal-800 text-sm">
                      +${(Number(co.amount) || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-slate-600 max-w-xs">
                      <div className="font-semibold text-slate-800">{co.reason?.replace(/_/g, ' ')}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{co.description}</div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        <CheckCircle2 className="w-3 h-3 text-teal-600" />
                        <span>Showed to GC · Authorized</span>
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{co.date}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-700 max-w-xs">
                      <div className="p-2 bg-teal-50/50 rounded-lg border border-teal-100 text-[11px] text-teal-950 font-medium">
                        {co.gc_notes || 'Owner approved. GC authorized to proceed with trade work.'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
