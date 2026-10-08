import { useState, useEffect } from 'react';
import { Project, DailyLogEntry } from '../../../shared/types';
import { GCDailyChangeOrderItem } from './types';
import { getInitialDailyLogs, getInitialGCDailyChangeOrders } from './initial-logs';

export function useGCDailyState(projects: Project[], selectedProjectId: string) {
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const [changeOrders, setChangeOrders] = useState<GCDailyChangeOrderItem[]>(() =>
    getInitialGCDailyChangeOrders(selectedProjectId)
  );

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

  const [dailyLogs, setDailyLogs] = useState<DailyLogEntry[]>(() =>
    getInitialDailyLogs(selectedProjectId)
  );

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

  return {
    activeProject,
    visibleCOs,
    dailyLogs,
    newDate, setNewDate,
    workersCount, setWorkersCount,
    weather, setWeather,
    trades, setTrades,
    workNotes, setWorkNotes,
    subCost, setSubCost,
    gcMarkup, setGcMarkup,
    logSubmitted,
    totalBilledNum,
    handlePostDailyLog,
  };
}
