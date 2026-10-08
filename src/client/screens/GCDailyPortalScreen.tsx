// GroundUp AI — GC (Daily Updates / Open-Book) Portal
// Dedicated portal for GCs under cost-plus / daily update contracts: daily work logs, receipts, and GC markup calculations

import React from 'react';
import { Project } from '../../shared/types';
import { useGCDailyState } from './gc-daily/use-gc-daily-state';
import { GCDailyHeader } from './gc-daily/components/GCDailyHeader';
import { GCDailyLogForm } from './gc-daily/components/GCDailyLogForm';
import { GCDailyLogsList } from './gc-daily/components/GCDailyLogsList';
import { GCDailyChangeOrders } from './gc-daily/components/GCDailyChangeOrders';

interface GCDailyPortalScreenProps {
  projects: Project[];
  selectedProjectId: string;
}

export function GCDailyPortalScreen({
  projects,
  selectedProjectId,
}: GCDailyPortalScreenProps) {
  const state = useGCDailyState(projects, selectedProjectId);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <GCDailyHeader activeProject={state.activeProject} />

      <GCDailyLogForm
        newDate={state.newDate}
        setNewDate={state.setNewDate}
        workersCount={state.workersCount}
        setWorkersCount={state.setWorkersCount}
        weather={state.weather}
        setWeather={state.setWeather}
        trades={state.trades}
        setTrades={state.setTrades}
        workNotes={state.workNotes}
        setWorkNotes={state.setWorkNotes}
        subCost={state.subCost}
        setSubCost={state.setSubCost}
        gcMarkup={state.gcMarkup}
        setGcMarkup={state.setGcMarkup}
        logSubmitted={state.logSubmitted}
        totalBilledNum={state.totalBilledNum}
        onSubmit={state.handlePostDailyLog}
      />

      <GCDailyLogsList dailyLogs={state.dailyLogs} />

      <GCDailyChangeOrders visibleCOs={state.visibleCOs} />
    </div>
  );
}
