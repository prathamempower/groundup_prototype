import { AlertRisk } from '../domain';

export interface ResolveAlertRequestDTO {
  alertId: string;
  actorName?: string;
}

export interface ResolveAlertResponseDTO {
  alert: AlertRisk;
  resolvedAt: string;
  resolvedBy: string;
}
