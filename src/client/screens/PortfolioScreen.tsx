import React, { useState, useMemo } from 'react';
import { Project } from '../../shared/types';
import { 
  Building2, 
  AlertCircle, 
  ArrowRight, 
  Plus, 
  Sparkles, 
  Search, 
  TrendingUp, 
  AlertTriangle,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface PortfolioScreenProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onAddProject: () => void;
  onOpenDealLab: () => void;
  onNavigateDraws: () => void;
}

export const PortfolioScreen: React.FC<PortfolioScreenProps> = ({
  projects,
  onSelectProject,
  onAddProject,
  onOpenDealLab,
  onNavigateDraws
}) => {
  const [filter, setFilter] = useState<'All' | 'Active' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Baseline financial metrics mapped by project ID
  const baseProjectStats: Record<string, any> = {
    'proj-212-maple': {
      spent: 312000,
      funded: 213200,
      cashExposure: 98800,
      progress: 48,
      pendingDraw: 'Draw #3 pending',
      alerts: 2,
      lastUpdated: '15 mins ago'
    },
    'proj-oakridge': {
      spent: 540000,
      funded: 490000,
      cashExposure: 50000,
      progress: 52,
      pendingDraw: 'On Schedule ✅',
      alerts: 0,
      lastUpdated: '1 hour ago'
    },
    'proj-elm-st': {
      spent: 890000,
      funded: 720000,
      cashExposure: 170000,
      progress: 44,
      pendingDraw: 'Draw #2 under review',
      alerts: 1,
      lastUpdated: '3 hours ago'
    },
    '1': {
      spent: 1412400,
      funded: 1094000,
      cashExposure: 318400,
      progress: 72,
      pendingDraw: 'Draw #4 pending',
      alerts: 2,
      lastUpdated: '2 hours ago'
    },
    '2': {
      spent: 374800,
      funded: 346000,
      cashExposure: 28800,
      progress: 38,
      pendingDraw: 'On Schedule ✅',
      alerts: 0,
      lastUpdated: '1 day ago'
    },
    '3': {
      finalSale: 2940000,
      totalCost: 2553000,
      netProfit: 387000,
      roi: 15.2,
      closed: 'March 2026',
      alerts: 0
    }
  };

  // Merge projects with financial metrics
  const enrichedProjects = useMemo(() => {
    return projects.map((p) => {
      const budget = p.target_budget || 1000000;
      const stats = baseProjectStats[p.id] || {
        spent: p.status === 'ACTIVE' ? Math.round(budget * 0.45) : budget,
        funded: p.status === 'ACTIVE' ? Math.round(budget * 0.38) : budget,
        cashExposure: p.status === 'ACTIVE' ? Math.round(budget * 0.07) : 0,
        progress: p.status === 'COMPLETED' ? 100 : 42,
        pendingDraw: p.status === 'ACTIVE' ? 'Draw #1 Under Review' : 'Closed',
        alerts: 0,
        lastUpdated: 'Just now'
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
        gc: p.gc_name || 'K&P Construction',
        lender: p.lender_name || 'BCB Bank',
        lastUpdated: stats.lastUpdated || 'Today',
        finalSale: stats.finalSale,
        totalCost: stats.totalCost,
        netProfit: stats.netProfit,
        roi: stats.roi,
        closed: stats.closed
      };
    });
  }, [projects]);

  // Aggregate Portfolio Totals
  const activeProjects = enrichedProjects.filter(p => p.status === 'ACTIVE');
  const totalBudget = activeProjects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = activeProjects.reduce((sum, p) => sum + p.spent, 0);
  const totalFunded = activeProjects.reduce((sum, p) => sum + p.funded, 0);
  const totalCashExposure = totalSpent - totalFunded;
  const spentPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatShortCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return formatCurrency(value);
  };

  const filteredProjects = enrichedProjects.filter(p => {
    const matchesFilter = 
      filter === 'All' ? true :
      filter === 'Active' ? p.status === 'ACTIVE' :
      filter === 'Completed' ? p.status === 'COMPLETED' : true;

    const matchesSearch = 
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.gc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.lender.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-full bg-slate-50 overflow-y-auto w-full select-none">
      <div className="max-w-7xl mx-auto px-8 py-8 w-full flex-1 flex flex-col gap-6">
        
        {/* Top Executive Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Executive Portfolio Overview
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Good morning, Hardik. <span className="text-xl font-normal">👋</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>October 5, 2026 · {activeProjects.length} active development projects</span>
              <span>·</span>
              <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.2 rounded border border-amber-200">
                2 items need attention
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenDealLab}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Deal Underwriting</span>
            </button>
            <button 
              onClick={onAddProject}
              className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition text-xs font-bold shadow-xs cursor-pointer gap-1.5"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* 4 Financial Domain KPI Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Total Budget */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Active Budget</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Truth 1</span>
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono tracking-tight mt-1">
              {formatShortCurrency(totalBudget)}
            </p>
            <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
              <span>{activeProjects.length} active projects</span>
              <span className="text-emerald-700 font-medium">100% Pro Forma</span>
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Incurred Spend</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Truth 2</span>
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono tracking-tight mt-1">
              {formatShortCurrency(totalSpent)}
            </p>
            <div className="mt-2.5 space-y-1">
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(spentPct, 100)}%` }} 
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{spentPct.toFixed(1)}% of budget</span>
                <span className="font-semibold text-slate-700">Verified OCR</span>
              </div>
            </div>
          </div>

          {/* Total Funded */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Lender Funded</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Truth 3</span>
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono tracking-tight mt-1">
              {formatShortCurrency(totalFunded)}
            </p>
            <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
              <span>Disbursed by lenders</span>
              <span className="text-emerald-700 font-medium">Wired</span>
            </div>
          </div>

          {/* Cash Exposure */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-900">Developer Cash Exposure</span>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Gap</span>
            </div>
            <p className="text-2xl font-black text-amber-950 font-mono tracking-tight mt-1">
              {formatShortCurrency(totalCashExposure)}
            </p>
            <div className="text-xs text-amber-800 mt-2 flex items-center justify-between font-medium">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Outstanding Draws</span>
              </span>
              <span className="text-[11px] font-bold text-amber-700">Draw #4 pending</span>
            </div>
          </div>
        </div>

        {/* Alerts Banner */}
        <div className="bg-red-50/70 border border-red-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl text-red-600 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-950">2 Critical Items Need Your Attention</h4>
              <p className="text-xs text-red-700 mt-0.5">
                73 Broadway plumbing spend is ahead of progress by 27%, and draw request #4 is waiting for lender wire sign-off.
              </p>
            </div>
          </div>
          <button 
            onClick={onNavigateDraws}
            className="text-xs font-bold text-red-800 hover:text-red-950 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 bg-red-100/60 hover:bg-red-200/60 rounded-xl transition cursor-pointer self-start sm:self-center"
          >
            <span>Review Draw & Spend</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Projects Section Header, Filter & Search */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Development Portfolio</h2>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {filteredProjects.length} Projects
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter projects or lenders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 w-48 sm:w-60 shadow-2xs"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/60">
                {(['All', 'Active', 'Completed'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                      filter === tab 
                        ? 'bg-white text-slate-900 shadow-2xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Projects Grid / List */}
          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-slate-200 rounded-2xl shadow-2xs border-dashed text-center">
              <div className="p-4 bg-slate-50 rounded-2xl mb-3">
                <Building2 className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No matching projects found</h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                Try adjusting your search criteria or underwrite a new deal to add to the portfolio.
              </p>
              <button 
                onClick={onAddProject}
                className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition text-xs font-bold shadow-xs cursor-pointer gap-1.5"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Add Project</span>
              </button>
            </div>
          ) : (
            <div className="grid gap-3.5">
              {filteredProjects.map(project => (
                <div 
                  key={project.id}
                  className={`border rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all ${
                    project.status === 'COMPLETED' 
                      ? 'bg-blue-50/20 border-blue-200/70' 
                      : 'bg-white border-slate-200/90'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Identity & Status */}
                    <div className="flex-1 min-w-[260px]">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          project.status === 'ACTIVE' 
                            ? (project.alerts > 0 ? 'bg-amber-500 ring-2 ring-amber-100' : 'bg-emerald-500 ring-2 ring-emerald-100')
                            : 'bg-blue-500 ring-2 ring-blue-100'
                        }`} />
                        <h3 className="text-base font-bold text-slate-900">{project.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider ${
                          project.status === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {project.status}
                        </span>
                        {project.alerts > 0 && (
                          <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-bold bg-red-100 text-red-700 ml-1">
                            {project.alerts} alerts
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs text-slate-500 mb-3">{project.address}</div>
                      
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <span className="text-slate-400">GC:</span> {project.gc}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <span className="text-slate-400">Lender:</span> {project.lender}
                        </span>
                        <span>·</span>
                        <span className="text-slate-400">Updated {project.lastUpdated}</span>
                      </div>
                    </div>

                    {/* Middle: 4 Truths or Completed Metrics */}
                    {project.status === 'COMPLETED' ? (
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">Final Disposition</div>
                          <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                            {formatShortCurrency(project.finalSale || 2940000)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">Total Cost</div>
                          <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                            {formatShortCurrency(project.totalCost || 2553000)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">Net Developer Profit</div>
                          <div className="text-sm font-bold font-mono text-emerald-700 mt-0.5">
                            +{formatShortCurrency(project.netProfit || 387000)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">Realized ROI</div>
                          <div className="text-sm font-bold font-mono text-blue-700 mt-0.5">
                            {project.roi || 15.2}%
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 space-y-3 max-w-xl">
                        {/* Progress Bar */}
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500 font-medium">Verified Progress</span>
                            <span className="font-bold text-slate-900">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                project.alerts > 0 ? 'bg-amber-500' : 'bg-emerald-600'
                              }`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Financial Stats Bar */}
                        <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-100 text-left">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Budget</span>
                            <span className="text-xs font-bold font-mono text-slate-900">{formatShortCurrency(project.budget)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Spent</span>
                            <span className="text-xs font-bold font-mono text-slate-900">{formatShortCurrency(project.spent)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Funded</span>
                            <span className="text-xs font-bold font-mono text-slate-900">{formatShortCurrency(project.funded)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Exposure</span>
                            <span className={`text-xs font-bold font-mono ${
                              project.cashExposure > 0 ? 'text-amber-700 font-black' : 'text-slate-900'
                            }`}>
                              {formatShortCurrency(project.cashExposure)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Right: Action */}
                    <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0">
                      <button 
                        onClick={() => onSelectProject(project.id)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                      >
                        <span>View Project</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Access Footer Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200/80">
          <button 
            onClick={onNavigateDraws}
            className="flex items-center gap-3 p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl transition text-left cursor-pointer shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Submit Draw Request</div>
              <div className="text-[11px] text-slate-500">Compile verified invoices & lien waivers</div>
            </div>
          </button>

          <button 
            onClick={onOpenDealLab}
            className="flex items-center gap-3 p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl transition text-left cursor-pointer shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Underwrite New Deal</div>
              <div className="text-[11px] text-slate-500">Calculate pro forma margins, comps & IRR</div>
            </div>
          </button>

          <button 
            onClick={() => onSelectProject('1')}
            className="flex items-center gap-3 p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl transition text-left cursor-pointer shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Audit Provenance</div>
              <div className="text-[11px] text-slate-500">Trace every dollar to its source invoice</div>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};
