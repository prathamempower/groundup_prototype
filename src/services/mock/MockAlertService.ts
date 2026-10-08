// GroundUp AI — MockAlertService Implementation

import { IAlertService } from '../interfaces/IAlertService';
import {
  AlertRisk,
  ResolveAlertResponseDTO,
} from '../../types';
import { mockStore } from './MockDataStore';
import { delay } from './delay';

export class MockAlertService implements IAlertService {
  async getProjectAlerts(projectId: string): Promise<AlertRisk[]> {
    await delay();
    const summary = mockStore.getProjectFourTruths(projectId);
    return [...summary.active_alerts];
  }

  async resolveAlert(alertId: string, actorName: string = 'User'): Promise<ResolveAlertResponseDTO> {
    await delay();
    const resolvedAlert: AlertRisk = {
      id: alertId,
      project_id: 'proj-resolved',
      type: 'RECONCILIATION_EXCEPTION',
      severity: 'LOW',
      title: 'Resolved Risk',
      description: 'Marked resolved by user',
      source_values: {},
      is_resolved: true,
      created_at: new Date().toISOString(),
    };

    mockStore.recordAuditEvent(
      'DEVELOPER_OWNER',
      actorName,
      'Alert',
      alertId,
      'is_resolved',
      'false',
      'true',
      'Alert Resolved'
    );

    return {
      alert: resolvedAlert,
      resolvedAt: new Date().toISOString(),
      resolvedBy: actorName,
    };
  }
}
