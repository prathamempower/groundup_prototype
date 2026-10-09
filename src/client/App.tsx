// GroundUp AI — Main Application Shell
// Multi-Role Architecture, RBAC Security Matrix, React Router Navigation

import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { AuthScreen } from './screens/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { TopHeader, BreadcrumbItem } from './components/TopHeader';
import { AccessDeniedScreen } from './components/AccessDeniedScreen';
import { AIChatDrawer } from './components/AIChatDrawer';
import { ProvenanceDrawer } from './components/ProvenanceDrawer';
import { NewUserIntakePage } from './screens/NewUserIntakePage';
import { isScreenPermitted, getRoleDefaultScreen } from '../shared/rbac/matrix';
import { useAppState } from './app/use-app-state';
import { AppRoutes } from './app/AppRoutes';

export function App() {
  const {
    currentUser,
    setCurrentUser,
    currentRole,
    setCurrentRole,
    activeProjectId,
    projects,
    summary,
    showAIChat,
    setShowAIChat,
    isDrawPacketModalOpen,
    setIsDrawPacketModalOpen,
    isChangeOrderModalOpen,
    setIsChangeOrderModalOpen,
    provenanceTarget,
    setProvenanceTarget,
    currentScreen,
    navigate,
    handleAuthenticate,
    handleSignOut,
    handleNavigate,
    handleSelectProject,
    handleSaveDealAsProject,
    handleOnboardingComplete,
  } = useAppState();

  const builderProfile = {
    name: currentUser?.name || 'Hardik Parikh',
    company: currentUser?.company || 'GroundUp Development Partners',
  };

  const activeProject = activeProjectId ? projects.find((p) => p.id === activeProjectId) : null;
  const activeProjectName = activeProject?.name || summary?.project_name || '';

  // Breadcrumbs for top navbar
  const breadcrumbs = useMemo(() => {
    if (!activeProjectId || !activeProject) return undefined;
    const crumbs: BreadcrumbItem[] = [
      { label: activeProject.name, href: `/projects/${activeProjectId}/overview` },
    ];

    if (currentScreen && currentScreen !== 'project-detail' && currentScreen !== 'portfolio') {
      const screenLabels: Record<string, string> = {
        acquisition: 'Acquisition & Closing',
        permits: 'Planning & Permits',
        financing: 'Financing & Debt',
        budget: 'Budget & Contingency',
        timeline: 'Milestones & Delays',
        draws: 'Draw Lab',
        documents: 'Document Inbox',
        invoices: 'Vendor Invoices',
        recon: 'Financial Recon',
        disposition: 'Unit Sales & ROI',
        alerts: 'Risk Alerts',
      };
      if (screenLabels[currentScreen]) {
        crumbs.push({ label: screenLabels[currentScreen] });
      }
    }
    return crumbs;
  }, [activeProjectId, activeProject, currentScreen]);

  if (!currentUser) {
    return <AuthScreen onAuthenticate={handleAuthenticate} />;
  }

  if (currentUser.isNewUser) {
    return (
      <NewUserIntakePage 
        user={currentUser} 
        onCompleteIntake={handleOnboardingComplete} 
        onCancelOrSignOut={handleSignOut} 
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-900">
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        activeProjectId={activeProjectId}
        activeProjectName={activeProject?.name}
        activeProjectStatus={activeProject?.status}
        onAddProject={() => navigate('/new-project')}
        onSignOut={handleSignOut}
        builderProfile={builderProfile}
        pendingDrawsCount={1}
        alertsCount={activeProject ? 2 : 3}
        currentRole={currentRole}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopHeader
          currentRole={currentRole}
          onChangeRole={(role) => {
            setCurrentRole(role);
            handleNavigate(getRoleDefaultScreen(role));
          }}
          onOpenAIChat={() => setShowAIChat(true)}
          onSignOut={handleSignOut}
          breadcrumbs={breadcrumbs}
        />

        <main className="flex-1 overflow-y-auto">
          {!isScreenPermitted(currentRole, currentScreen) ? (
            <AccessDeniedScreen
              requestedScreen={currentScreen}
              currentRole={currentRole}
              onNavigate={(s) => handleNavigate(s)}
              onSwitchRole={(r) => {
                setCurrentRole(r);
                handleNavigate(getRoleDefaultScreen(r));
              }}
            />
          ) : (
            <AppRoutes
              projects={projects}
              summary={summary}
              activeProjectId={activeProjectId}
              currentRole={currentRole}
              defaultRolePath="/projects"
              isDrawPacketModalOpen={isDrawPacketModalOpen}
              setIsDrawPacketModalOpen={setIsDrawPacketModalOpen}
              isChangeOrderModalOpen={isChangeOrderModalOpen}
              setIsChangeOrderModalOpen={setIsChangeOrderModalOpen}
              setShowAIChat={setShowAIChat}
              setProvenanceTarget={setProvenanceTarget}
              setCurrentUser={setCurrentUser}
              onNavigate={handleNavigate}
              onSelectProject={handleSelectProject}
              onSaveDealAsProject={handleSaveDealAsProject}
            />
          )}
        </main>
      </div>

      <button
        onClick={() => setShowAIChat(true)}
        className="fixed bottom-6 right-6 z-30 bg-slate-900 hover:bg-black text-white px-4 py-3 rounded-full shadow-xl flex items-center gap-2 text-xs font-bold transition cursor-pointer border border-slate-700"
      >
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <span>Ask AI Analyst</span>
      </button>

      <AIChatDrawer
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        projectId={activeProjectId || ''}
        projectName={activeProjectName || 'Portfolio Overview'}
        userContext={{
          name: builderProfile.name,
          company: builderProfile.company,
          role: currentRole,
        }}
      />

      <ProvenanceDrawer
        isOpen={!!provenanceTarget}
        onClose={() => setProvenanceTarget(null)}
        projectId={activeProjectId || ''}
        projectName={activeProjectName || 'Portfolio Overview'}
        targetType={provenanceTarget?.type || 'spend'}
        category={provenanceTarget?.category}
      />
    </div>
  );
}

export default App;
