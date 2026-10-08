// GroundUp AI — Main Application Shell
// Multi-Role Architecture, RBAC Security Matrix, React Router Navigation

import React from 'react';
import { Sparkles } from 'lucide-react';
import { AuthScreen } from './screens/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { AccessDeniedScreen } from './components/AccessDeniedScreen';
import { AIChatDrawer } from './components/AIChatDrawer';
import { ProvenanceDrawer } from './components/ProvenanceDrawer';
import { NewUserIntakePage } from './screens/NewUserIntakePage';
import { isScreenPermitted, getRoleDefaultScreen } from '../shared/rbac/matrix';
import { useAppState } from './app/use-app-state';
import { screenToPath } from './app/nav-helpers';
import { AppRoutes } from './app/AppRoutes';

export function App() {
  const {
    currentUser,
    setCurrentUser,
    currentRole,
    setCurrentRole,
    selectedProjectId,
    setSelectedProjectId,
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

  const activeProjectName =
    projects.find(p => p.id === selectedProjectId)?.name ||
    summary?.project_name ||
    '73 Broadway, Hoboken';

  const defaultRoleScreen = getRoleDefaultScreen(currentRole);
  const defaultRolePath = screenToPath(defaultRoleScreen, selectedProjectId);

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
        projects={projects.map(p => ({ id: p.id, name: p.name, status: p.status }))}
        selectedProjectId={selectedProjectId}
        onAddProject={() => navigate('/new-project')}
        onSignOut={handleSignOut}
        builderProfile={builderProfile}
        pendingDrawsCount={1}
        alertsCount={3}
        currentRole={currentRole}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopHeader
          currentRole={currentRole}
          onChangeRole={(role) => {
            setCurrentRole(role);
            handleNavigate(getRoleDefaultScreen(role));
          }}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={handleSelectProject}
          onOpenDrawPacket={() => {
            handleNavigate('draws');
            setIsDrawPacketModalOpen(true);
          }}
          onOpenChangeOrder={() => {
            handleNavigate('budget');
            setIsChangeOrderModalOpen(true);
          }}
          onOpenAIChat={() => setShowAIChat(true)}
          onSignOut={handleSignOut}
          onNavigateScreen={(s) => handleNavigate(s)}
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
              selectedProjectId={selectedProjectId}
              setSelectedProjectId={setSelectedProjectId}
              currentRole={currentRole}
              defaultRolePath={defaultRolePath}
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
        projectId={selectedProjectId}
        projectName={activeProjectName}
        userContext={{
          name: builderProfile.name,
          company: builderProfile.company,
          role: currentRole,
        }}
      />

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
