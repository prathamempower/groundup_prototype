import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { Project } from '../../shared/types';

interface PortalRoutesProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
}

export function renderPortalRoutes({ selectedProjectId }: PortalRoutesProps) {
  return [
    <Route
      key="gc-fixed-portal"
      path="/gc-fixed-portal"
      element={<Navigate to={`/projects/${selectedProjectId}/timeline`} replace />}
    />,
    <Route
      key="gc-daily-portal"
      path="/gc-daily-portal"
      element={<Navigate to={`/projects/${selectedProjectId}/timeline`} replace />}
    />,
    <Route
      key="cfo-recon"
      path="/cfo-recon"
      element={<Navigate to={`/projects/${selectedProjectId}/recon`} replace />}
    />,
    <Route
      key="investor-portal"
      path="/investor-portal"
      element={<Navigate to={`/projects/${selectedProjectId}/overview`} replace />}
    />
  ];
}
