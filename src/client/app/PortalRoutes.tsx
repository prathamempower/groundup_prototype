import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { Project } from '../../shared/types';

interface PortalRoutesProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
}

export function renderPortalRoutes({ projects, selectedProjectId }: PortalRoutesProps) {
  const targetProjectId = selectedProjectId || projects[0]?.id || 'proj-73-broadway';

  return [
    <Route
      key="gc-fixed-portal"
      path="/gc-fixed-portal"
      element={<Navigate to={`/projects/${targetProjectId}/timeline`} replace />}
    />,
    <Route
      key="gc-daily-portal"
      path="/gc-daily-portal"
      element={<Navigate to={`/projects/${targetProjectId}/timeline`} replace />}
    />,
    <Route
      key="cfo-recon"
      path="/cfo-recon"
      element={<Navigate to={`/projects/${targetProjectId}/recon`} replace />}
    />,
    <Route
      key="investor-portal"
      path="/investor-portal"
      element={<Navigate to={`/projects/${targetProjectId}/overview`} replace />}
    />
  ];
}

