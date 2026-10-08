import React from 'react';
import { Route } from 'react-router-dom';
import { LenderPortalScreen } from '../screens/LenderPortalScreen';
import { GCFixedPortalScreen } from '../screens/GCFixedPortalScreen';
import { GCDailyPortalScreen } from '../screens/GCDailyPortalScreen';
import { CFOReconciliationScreen } from '../screens/CFOReconciliationScreen';
import { InvestorPortalScreen } from '../screens/InvestorPortalScreen';
import { DocumentIntakeScreen } from '../screens/DocumentIntakeScreen';
import { Project } from '../../shared/types';

interface PortalRoutesProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
}

export function renderPortalRoutes({ projects, selectedProjectId, onSelectProject }: PortalRoutesProps) {
  return [
    <Route
      key="lender-portal"
      path="/lender-portal"
      element={
        <LenderPortalScreen
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={onSelectProject}
          onDisburseFunds={(drawId, amount) => {
            console.log(`Disbursed ${amount} for ${drawId}`);
          }}
        />
      }
    />,
    <Route
      key="gc-fixed-portal"
      path="/gc-fixed-portal"
      element={<GCFixedPortalScreen projects={projects} selectedProjectId={selectedProjectId} />}
    />,
    <Route
      key="gc-daily-portal"
      path="/gc-daily-portal"
      element={<GCDailyPortalScreen projects={projects} selectedProjectId={selectedProjectId} />}
    />,
    <Route
      key="cfo-recon"
      path="/cfo-recon"
      element={<CFOReconciliationScreen projects={projects} selectedProjectId={selectedProjectId} />}
    />,
    <Route
      key="investor-portal"
      path="/investor-portal"
      element={<InvestorPortalScreen projects={projects} selectedProjectId={selectedProjectId} />}
    />,
    <Route
      key="document-intake"
      path="/document-intake"
      element={<DocumentIntakeScreen projects={projects} selectedProjectId={selectedProjectId} />}
    />,
  ];
}
