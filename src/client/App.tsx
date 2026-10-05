// GroundUp AI — Main Application Shell (Complete Feature Suite)
// Full Multi-Role Architecture, Full Lifecycle Navigation, and Top Header Integration

import React, { useState, useEffect } from 'react';
import { AuthScreen, AuthenticatedUser } from './screens/AuthScreen';
import { Sidebar, ActiveNavScreen } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { PortfolioScreen } from './screens/PortfolioScreen';
import { ProjectDetailScreen, ProjectTab } from './screens/ProjectDetailScreen';
import { DealLabScreen } from './screens/DealLabScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AIChatDrawer } from './components/AIChatDrawer';
import { ProvenanceDrawer } from './components/ProvenanceDrawer';
import { Project, ProjectFourTruthsSummary, UserRole } from '../shared/types';
import { Sparkles } from 'lucide-react';

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-73-broadway',
    name: '73 Broadway',
    address: '73 Broadway, Hoboken NJ',
    gc_name: 'K&P Construction',
    gc_contract_model: 'DAILY_UPDATES',
    lender_name: 'BCB Community Bank',
    units: 3,
    square_feet: 4800,
    target_budget: 1820000,
    start_date: 'Sep 1, 2025',
    expected_completion: 'Jun 15, 2026',
    status: 'ACTIVE',
    created_by_user_id: 'user-dev-1',
    created_at: '2025-09-01T00:00:00Z',
    acquisition_cost: 1000000,
    expected_sale_price: 3250000,
    contingency_initial: 82000,
    contingency_remaining: 42000,
  },
  {
    id: 'proj-161-woodlawn',
    name: '161 Woodlawn Ave',
    address: '161 Woodlawn Ave, Ridgewood NJ',
    gc_name: 'Metro Builds LLC',
    gc_contract_model: 'FIXED_PRICE',
    lender_name: 'First Republic / Chase',
    units: 1,
    square_feet: 3400,
    target_budget: 892000,
    start_date: 'Jan 15, 2026',
    expected_completion: 'Nov 30, 2026',
    status: 'ACTIVE',
    created_by_user_id: 'user-dev-1',
    created_at: '2026-01-15T00:00:00Z',
    acquisition_cost: 650000,
    expected_sale_price: 1850000,
    contingency_initial: 65000,
    contingency_remaining: 65000,
  },
  {
    id: 'proj-392-1st',
    name: '392 1st Street',
    address: '392 1st Street, Jersey City NJ',
    gc_name: 'Kunal Shah Development',
    gc_contract_model: 'FIXED_PRICE',
    lender_name: 'BCB Community Bank',
    units: 3,
    square_feet: 4200,
    target_budget: 1450000,
    start_date: 'Feb 1, 2025',
    expected_completion: 'Mar 1, 2026',
    status: 'COMPLETED',
    created_by_user_id: 'user-dev-1',
    created_at: '2025-02-01T00:00:00Z',
    acquisition_cost: 850000,
    expected_sale_price: 2940000,
    contingency_initial: 70000,
    contingency_remaining: 52000,
  },
];

export function App() {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(() => {
    try {
      const stored = localStorage.getItem('groundup_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // ── Role Persona (Default: DEVELOPER_OWNER) ──────────────────────────────
  const [currentRole, setCurrentRole] = useState<UserRole>('DEVELOPER_OWNER');

  // ── Navigation ────────────────────────────────────────────────────────────
  const [currentScreen, setCurrentScreen] = useState<ActiveNavScreen>('portfolio');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-73-broadway');

  // ── Data ──────────────────────────────────────────────────────────────────
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const stored = localStorage.getItem('groundup_projects');
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_PROJECTS;
  });

  const [summary, setSummary] = useState<ProjectFourTruthsSummary | null>(null);

  // ── Modals / Overlays ─────────────────────────────────────────────────────
  const [showAIChat, setShowAIChat] = useState(false);
  const [isDrawPacketModalOpen, setIsDrawPacketModalOpen] = useState(false);
  const [isChangeOrderModalOpen, setIsChangeOrderModalOpen] = useState(false);

  const [provenanceTarget, setProvenanceTarget] = useState<{
    type: 'spend' | 'budget' | 'funded' | 'exposure' | 'delay';
    category?: string;
  } | null>(null);

  const builderProfile = {
    name: currentUser?.name || 'Hardik Parikh',
    company: currentUser?.company || 'GroundUp Development Partners',
  };

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchProjects = () => {
    fetch('/api/projects')
      .then(res => res.json())
      .then((data: Project[]) => {
        if (data && data.length > 0) {
          setProjects(prev => {
            // merge backend with default
            const combined = [...data];
            DEFAULT_PROJECTS.forEach(dp => {
              if (!combined.some(p => p.id === dp.id)) combined.push(dp);
            });
            return combined;
          });
        }
      })
      .catch(() => {
        // Fallback to default
        setProjects(DEFAULT_PROJECTS);
      });
  };

  const fetchProjectSummary = (projId: string) => {
    if (!projId) { setSummary(null); return; }
    fetch(`/api/projects/${projId}`)
      .then(res => res.json())
      .then((data: ProjectFourTruthsSummary) => setSummary(data))
      .catch(() => {});
  };

  useEffect(() => {
    if (currentUser) fetchProjects();
  }, [currentUser]);

  useEffect(() => {
    if (selectedProjectId && currentUser) fetchProjectSummary(selectedProjectId);
  }, [selectedProjectId, currentUser]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAuthenticate = (user: AuthenticatedUser) => {
    setCurrentUser(user);
    try { localStorage.setItem('groundup_user', JSON.stringify(user)); } catch {}
  };

  const handleSignOut = () => {
    try { localStorage.removeItem('groundup_user'); } catch {}
    setCurrentUser(null);
  };

  const handleNavigate = (screen: ActiveNavScreen, projectId?: string) => {
    if (projectId) setSelectedProjectId(projectId);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    fetchProjectSummary(projectId);
    setCurrentScreen('project-detail');
  };

  const handleSaveDealAsProject = (dealData: any) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: dealData.address.split(',')[0],
      address: dealData.address,
      gc_name: 'Metro Builds LLC',
      gc_contract_model: 'FIXED_PRICE',
      lender_name: 'BCB Community Bank',
      units: dealData.units || 4,
      square_feet: dealData.sqFt || 4200,
      target_budget: dealData.hardCosts || 1350000,
      start_date: 'Nov 1, 2026',
      expected_completion: 'May 30, 2028',
      status: 'ACTIVE',
      created_by_user_id: currentUser?.id || 'user-dev-1',
      created_at: new Date().toISOString(),
      acquisition_cost: dealData.acquisitionCost || 1100000,
      expected_sale_price: dealData.arv || 3300000,
      contingency_initial: 80000,
      contingency_remaining: 80000,
    };

    setProjects(prev => {
      const updated = [newProject, ...prev];
      try { localStorage.setItem('groundup_projects', JSON.stringify(updated)); } catch {}
      return updated;
    });

    setSelectedProjectId(newProject.id);
    setCurrentScreen('project-detail');
  };

  const activeProjectName =
    projects.find(p => p.id === selectedProjectId)?.name ||
    summary?.project_name ||
    '73 Broadway, Hoboken';

  // ── Auth gate ─────────────────────────────────────────────────────────────
  if (!currentUser) {
    return <AuthScreen onAuthenticate={handleAuthenticate} />;
  }

  // ── Compute counts for badges ─────────────────────────────────────────────
  const alertsCount = 3;
  const pendingDrawsCount = 1;

  // Helper to map active nav screen to project tab
  const getProjectTab = (): ProjectTab => {
    if (currentScreen === 'budget') return 'budget';
    if (currentScreen === 'draws') return 'draws';
    if (currentScreen === 'timeline') return 'timeline';
    if (currentScreen === 'documents') return 'documents';
    if (currentScreen === 'disposition') return 'disposition';
    if (currentScreen === 'alerts') return 'alerts';
    return 'overview';
  };

  const isProjectDetailScreen = [
    'project-detail',
    'budget',
    'draws',
    'timeline',
    'documents',
    'disposition',
    'alerts',
  ].includes(currentScreen);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-900">
      {/* ── Left Sidebar ── */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        projects={projects.map(p => ({ id: p.id, name: p.name, status: p.status }))}
        selectedProjectId={selectedProjectId}
        onAddProject={() => handleNavigate('deal-lab')}
        onSignOut={handleSignOut}
        builderProfile={builderProfile}
        pendingDrawsCount={pendingDrawsCount}
        alertsCount={alertsCount}
      />

      {/* ── Main Layout Column ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Global Header with Role Persona Switcher & Quick Actions */}
        <TopHeader
          currentRole={currentRole}
          onChangeRole={(role) => setCurrentRole(role)}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={(id) => {
            setSelectedProjectId(id);
            fetchProjectSummary(id);
          }}
          onOpenDrawPacket={() => {
            if (!isProjectDetailScreen) setCurrentScreen('draws');
            setIsDrawPacketModalOpen(true);
          }}
          onOpenChangeOrder={() => {
            if (!isProjectDetailScreen) setCurrentScreen('budget');
            setIsChangeOrderModalOpen(true);
          }}
          onOpenAIChat={() => setShowAIChat(true)}
          onSignOut={handleSignOut}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto">
          {/* Portfolio Dashboard */}
          {currentScreen === 'portfolio' && (
            <PortfolioScreen
              projects={projects}
              onSelectProject={handleSelectProject}
              onAddProject={() => handleNavigate('deal-lab')}
              onOpenDealLab={() => handleNavigate('deal-lab')}
              onNavigateDraws={() => handleNavigate('draws')}
            />
          )}

          {/* Project Detail (6 Lifecycle Tabs: Overview, Budget, Draws, Timeline, Documents, Disposition, Alerts) */}
          {isProjectDetailScreen && (
            <ProjectDetailScreen
              projectId={selectedProjectId}
              projects={projects}
              onSelectProject={(id) => {
                setSelectedProjectId(id);
                fetchProjectSummary(id);
              }}
              summary={summary}
              onBack={() => handleNavigate('portfolio')}
              onSubmitDraw={() => setIsDrawPacketModalOpen(true)}
              onOpenLenderPackage={() => {}}
              onOpenInvoices={() => {}}
              onOpenAIChat={() => setShowAIChat(true)}
              onInspectProvenance={(type, category) =>
                setProvenanceTarget({ type, category })
              }
              initialTab={getProjectTab()}
              currentRole={currentRole}
              isDrawPacketModalOpen={isDrawPacketModalOpen}
              onCloseDrawPacketModal={() => setIsDrawPacketModalOpen(false)}
              isChangeOrderModalOpen={isChangeOrderModalOpen}
              onCloseChangeOrderModal={() => setIsChangeOrderModalOpen(false)}
            />
          )}

          {/* Deal Lab Underwriting Calculator */}
          {currentScreen === 'deal-lab' && (
            <DealLabScreen
              onBack={() => handleNavigate('portfolio')}
              onSaveAsProject={handleSaveDealAsProject}
            />
          )}

          {/* Settings & Stakeholder Management */}
          {currentScreen === 'settings' && (
            <SettingsScreen onBack={() => handleNavigate('portfolio')} />
          )}
        </main>
      </div>

      {/* ── Floating AI Chat Button (for fast querying) ── */}
      <button
        onClick={() => setShowAIChat(true)}
        className="fixed bottom-6 right-6 z-30 bg-slate-900 hover:bg-black text-white px-4 py-3 rounded-full shadow-xl flex items-center gap-2 text-xs font-bold transition cursor-pointer border border-slate-700"
      >
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <span>Ask AI Analyst</span>
      </button>

      {/* ── AI Chat Assistant Drawer ── */}
      <AIChatDrawer
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        projectId={selectedProjectId}
        projectName={activeProjectName}
        userContext={{
          name: builderProfile.name,
          company: builderProfile.company,
          role: currentRole,
        }}
      />

      {/* ── Provenance Drill-down Drawer ── */}
      <ProvenanceDrawer
        isOpen={!!provenanceTarget}
        onClose={() => setProvenanceTarget(null)}
        projectId={selectedProjectId}
        projectName={activeProjectName}
        targetType={provenanceTarget?.type || 'spend'}
        category={provenanceTarget?.category}
      />
    </div>
  );
}

export default App;
