import React, { useState } from 'react';
import { Project } from '../../shared/types';
import { 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Plus,
  FileText,
  Calculator,
  UploadCloud,
  ChevronRight,
  TrendingUp,
  AlertTriangle
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

  // Dummy projects matching the instructions
  const dummyProjects = [
    {
      id: '1',
      name: '73 Broadway',
      address: '73 Broadway, Hoboken NJ',
      status: 'ACTIVE',
      budget: 1820000,
      spent: 1412400,
      funded: 1094000,
      cashExposure: 318400,
      progress: 72,
      pendingDraw: 'Draw #4 pending',
      alerts: 2,
      gc: 'K&P Construction',
      lender: 'BCB Bank',
      lastUpdated: '2 hours ago'
    },
    {
      id: '2',
      name: '161 Woodlawn Ave',
      address: '161 Woodlawn Ave, Ridgewood NJ',
      status: 'ACTIVE',
      budget: 892000,
      spent: 374800,
      funded: 346000,
      cashExposure: 28800,
      progress: 38,
      pendingDraw: 'On Schedule ✅',
      alerts: 0,
      gc: 'Metro Builds LLC',
      lender: 'First Republic',
      lastUpdated: '1 day ago'
    },
    {
      id: '3',
      name: '392 1st Street',
      address: '392 1st Street, Jersey City NJ',
      status: 'COMPLETED',
      finalSale: 2940000,
      totalCost: 2553000,
      netProfit: 387000,
      roi: 15.2,
      closed: 'March 2026',
      alerts: 0
    }
  ];

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

  const filteredProjects = dummyProjects.filter(p => {
    if (filter === 'All') return true;
    if (filter === 'Active') return p.status === 'ACTIVE';
    if (filter === 'Completed') return p.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto w-full">
      <div className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 flex flex-col gap-8">
        
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Good morning, Hardik. <span className="text-xl">👋</span>
            </h1>
            <p className="text-slate-500 mt-1">
              October 5, 2026 · 3 projects · <span className="text-amber-600 font-medium">2 need attention</span>
            </p>
          </div>
          <button 
            onClick={onAddProject}
            className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </button>
        </div>

        {/* 4 KPI Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Total Budget</h3>
            <p className="text-2xl font-semibold text-slate-900 font-mono tracking-tight">$4.2M</p>
            <p className="text-sm text-slate-500 mt-2">3 active projects</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Total Spent</h3>
            <p className="text-2xl font-semibold text-slate-900 font-mono tracking-tight">$2.85M</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '67.8%' }}></div>
              </div>
              <span className="text-xs font-medium text-slate-600">67.8%</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">of budget</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Total Funded</h3>
            <p className="text-2xl font-semibold text-slate-900 font-mono tracking-tight">$2.14M</p>
            <p className="text-sm text-slate-500 mt-2">Disbursed by lenders</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-medium text-amber-800 mb-1 flex items-center">
              Cash Exposure
            </h3>
            <p className="text-2xl font-semibold text-amber-900 font-mono tracking-tight">$707K</p>
            <p className="text-sm text-amber-700 mt-2 flex items-center font-medium">
              <AlertTriangle className="w-4 h-4 mr-1.5" />
              Outstanding
            </p>
          </div>
        </div>

        {/* Alerts Banner */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="mt-0.5 sm:mt-0 p-1.5 bg-red-100 rounded-full text-red-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-red-900 font-medium">2 items need your attention</h4>
              <p className="text-red-700 text-sm mt-0.5">73 Broadway requires a draw request, and inspection is pending.</p>
            </div>
          </div>
          <button className="text-sm font-medium text-red-700 hover:text-red-800 whitespace-nowrap flex items-center">
            View Alerts <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {/* Projects Section */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <h2 className="text-lg font-semibold text-slate-900">Projects</h2>
            <div className="flex bg-slate-100 p-1 rounded-lg self-start">
              {(['All', 'Active', 'Completed'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    filter === tab 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-slate-200 rounded-xl shadow-sm border-dashed">
              <div className="p-4 bg-slate-50 rounded-full mb-4">
                <Building2 className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No projects yet</h3>
              <p className="text-slate-500 text-center max-w-sm mb-6">
                Add your first project to start tracking construction finance.
              </p>
              <button 
                onClick={onAddProject}
                className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredProjects.map(project => (
                <div 
                  key={project.id}
                  className={`border rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md ${
                    project.status === 'COMPLETED' ? 'bg-blue-50/30 border-blue-100' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    
                    {/* Left: Info */}
                    <div className="flex-1 min-w-[240px]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          project.status === 'ACTIVE' 
                            ? (project.alerts > 0 ? 'bg-amber-500' : 'bg-emerald-500')
                            : 'bg-blue-500'
                        }`} />
                        <h3 className="font-semibold text-slate-900">{project.name}</h3>
                        {project.alerts > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 ml-2">
                            {project.alerts} Alerts
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 flex items-center pl-4.5">
                        {project.address}
                      </p>
                    </div>

                    {/* Middle: Stats */}
                    {project.status === 'ACTIVE' ? (
                      <div className="flex-[2] flex flex-col justify-center">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">Budget</p>
                            <p className="font-mono text-sm font-medium text-slate-900">{formatShortCurrency(project.budget!)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">Spent</p>
                            <p className="font-mono text-sm font-medium text-slate-900">{formatShortCurrency(project.spent!)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">Funded</p>
                            <p className="font-mono text-sm font-medium text-slate-900">{formatShortCurrency(project.funded!)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">Progress</p>
                            <p className="font-mono text-sm font-medium text-slate-900">{project.progress}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${project.alerts > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-500 whitespace-nowrap">{project.pendingDraw}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-[2] flex flex-col justify-center">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">Final Sale</p>
                            <p className="font-mono text-sm font-medium text-slate-900">{formatShortCurrency(project.finalSale!)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">Total Cost</p>
                            <p className="font-mono text-sm font-medium text-slate-900">{formatShortCurrency(project.totalCost!)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">Final Profit</p>
                            <p className="font-mono text-sm font-medium text-emerald-600">{formatShortCurrency(project.netProfit!)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">ROI</p>
                            <p className="font-mono text-sm font-medium text-emerald-600 flex items-center">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {project.roi}%
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-slate-500">
                          Closed: {project.closed}
                        </div>
                      </div>
                    )}

                    {/* Right: Actions */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 gap-4">
                      {project.status === 'ACTIVE' && (
                        <div className="text-xs text-slate-400">
                          {project.gc} · {project.lender}
                        </div>
                      )}
                      <button 
                        onClick={() => onSelectProject(project.id)}
                        className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        View Project
                        <ChevronRight className="w-4 h-4 ml-1 -mr-1" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="mt-4 pt-6 border-t border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={onNavigateDraws}
              className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
            >
              <FileText className="w-4 h-4 mr-2 text-slate-400" />
              Submit Draw
              <ArrowRight className="w-4 h-4 ml-2 text-slate-400" />
            </button>
            <button 
              onClick={onOpenDealLab}
              className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Calculator className="w-4 h-4 mr-2 text-slate-400" />
              Deal Lab (Underwrite New Deal)
              <ArrowRight className="w-4 h-4 ml-2 text-slate-400" />
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm">
              <UploadCloud className="w-4 h-4 mr-2 text-slate-400" />
              Upload Documents
              <ArrowRight className="w-4 h-4 ml-2 text-slate-400" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
