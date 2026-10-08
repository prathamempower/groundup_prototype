import React from 'react';
import { Camera } from 'lucide-react';
import { DailyLogEntry } from '../../../../shared/types';

interface GCDailyLogsListProps {
  dailyLogs: DailyLogEntry[];
}

export const GCDailyLogsList: React.FC<GCDailyLogsListProps> = ({ dailyLogs }) => {
  return (
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
  );
};
