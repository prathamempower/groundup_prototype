import { useMemo } from 'react';
import { Project } from '../../../shared/types';
import { EnrichedProject } from './types';

const BASE_PROJECT_STATS: Record<string, any> = {
  'proj-73-broadway': {
    spent: 1412400,
    funded: 1094000,
    cashExposure: 318400,
    progress: 72,
    pendingDraw: 'Draw #4 pending',
    alerts: 2,
    lastUpdated: '2 hours ago',
  },
  'proj-212-maple': {
    spent: 312000,
    funded: 213200,
    cashExposure: 98800,
    progress: 48,
    pendingDraw: 'Draw #2 under review',
    alerts: 1,
    lastUpdated: '15 mins ago',
  },
  'proj-161-woodlawn': {
    spent: 350000,
    funded: 315000,
    cashExposure: 35000,
    progress: 38,
    pendingDraw: 'On Schedule ✅',
    alerts: 0,
    lastUpdated: '45 mins ago',
  },
  'proj-oakridge': {
    spent: 540000,
    funded: 490000,
    cashExposure: 50000,
    progress: 52,
    pendingDraw: 'Draw #3 under review',
    alerts: 1,
    lastUpdated: '1 hour ago',
  },
  'proj-elm-st': {
    spent: 890000,
    funded: 720000,
    cashExposure: 170000,
    progress: 44,
    pendingDraw: 'Draw #3 under review',
    alerts: 1,
    lastUpdated: '3 hours ago',
  },
  'proj-392-1st': {
    spent: 1432000,
    funded: 1150000,
    cashExposure: 0,
    progress: 100,
    pendingDraw: 'Closed & Sold ✅',
    alerts: 0,
    lastUpdated: 'Completed',
    finalSale: 2940000,
    totalCost: 2282000,
    netProfit: 658000,
    roi: 23.1,
    closed: 'March 2026',
  },
};

export function usePortfolioMetrics(projects: Project[]) {
  const enrichedProjects: EnrichedProject[] = useMemo(() => {
    return projects.map((p) => {
      const budget = p.target_budget || 1000000;
      const stats = BASE_PROJECT_STATS[p.id] || {
        spent: p.status === 'ACTIVE' ? Math.round(budget * 0.45) : budget,
        funded: p.status === 'ACTIVE' ? Math.round(budget * 0.38) : budget,
        cashExposure: p.status === 'ACTIVE' ? Math.round(budget * 0.07) : 0,
        progress: p.status === 'COMPLETED' ? 100 : 42,
        pendingDraw: p.status === 'ACTIVE' ? 'Draw #1 Under Review' : 'Closed',
        alerts: 0,
        lastUpdated: 'Just now',
      };

      return {
        id: p.id,
        name: p.name,
        address: p.address,
        status: p.status,
        budget: p.target_budget || 1000000,
        spent: stats.spent || 0,
        funded: stats.funded || 0,
        cashExposure: stats.cashExposure || 0,
        progress: stats.progress || 0,
        pendingDraw: stats.pendingDraw || '—',
        alerts: stats.alerts || 0,
        gc: p.gc_name || 'General Contractor LLC',
        lender: p.lender_name || 'Commercial Bank',
        lastUpdated: stats.lastUpdated || 'Today',
        finalSale: stats.finalSale,
        totalCost: stats.totalCost,
        netProfit: stats.netProfit,
        roi: stats.roi,
        closed: stats.closed,
      };
    });
  }, [projects]);

  const activeProjects = enrichedProjects.filter((p) => p.status === 'ACTIVE');
  const totalBudget = activeProjects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = activeProjects.reduce((sum, p) => sum + p.spent, 0);
  const totalFunded = activeProjects.reduce((sum, p) => sum + p.funded, 0);
  const totalCashExposure = totalSpent - totalFunded;
  const spentPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return {
    enrichedProjects,
    activeProjects,
    totalBudget,
    totalSpent,
    totalFunded,
    totalCashExposure,
    spentPct,
  };
}
