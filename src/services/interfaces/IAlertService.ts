// GroundUp AI — IAlertService Interface Contract

import {
  AlertRisk,
  ResolveAlertResponseDTO,
} from '../../types';

export interface IAlertService {
  /**
   * Fetch all active financial, schedule, and reconciliation alerts for a project.
   */
  getProjectAlerts(projectId: string): Promise<AlertRisk[]>;

  /**
   * Resolve an alert risk item.
   */
  resolveAlert(alertId: string, actorName?: string): Promise<ResolveAlertResponseDTO>;
}
