import {
  IAlertService,
  IDocumentService,
  IPipelineService,
  IChatService,
  IProvenanceService,
  IAdminService,
} from '../interfaces';
import {
  AlertRisk,
  Document,
  ResolveAlertResponseDTO,
  ParseDocumentRequestDTO,
  DocumentExtractionResultDTO,
  ParseBatchDocumentsRequestDTO,
  BatchExtractionResultDTO,
  ApplyBatchDocumentsRequestDTO,
  GenericSuccessResponseDTO,
  PipelineProcessRequestDTO,
  PipelineExecutionResultDTO,
  AIChatQueryRequestDTO,
  AIChatResponseDTO,
  FigureProvenanceRequestDTO,
  ProvenanceDrillDown,
  ResetSeedResponseDTO,
} from '../../types';
import { http } from './http-client';

export class HttpAlertService implements IAlertService {
  getAlerts(projectId?: string): Promise<AlertRisk[]> {
    const query = projectId ? `?projectId=${projectId}` : '';
    return http<AlertRisk[]>(`/api/alerts${query}`);
  }

  getProjectAlerts(projectId: string): Promise<AlertRisk[]> {
    return this.getAlerts(projectId);
  }

  resolveAlert(alertId: string, resolutionNotes?: string): Promise<ResolveAlertResponseDTO> {
    return http<ResolveAlertResponseDTO>(`/api/alerts/${alertId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolutionNotes }),
    });
  }
}

export class HttpDocumentService implements IDocumentService {
  parseDocument(payload: ParseDocumentRequestDTO): Promise<DocumentExtractionResultDTO> {
    return http<DocumentExtractionResultDTO>('/api/documents/parse', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  parseBatchDocuments(payload: ParseBatchDocumentsRequestDTO): Promise<BatchExtractionResultDTO> {
    return http<BatchExtractionResultDTO>('/api/documents/parse-batch', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  applyBatchDocuments(payload: ApplyBatchDocumentsRequestDTO): Promise<GenericSuccessResponseDTO> {
    return http<GenericSuccessResponseDTO>('/api/documents/apply-batch', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  getProjectDocuments(projectId: string): Promise<Document[]> {
    return http<Document[]>(`/api/documents/project/${projectId}`);
  }
}

export class HttpPipelineService implements IPipelineService {
  runPipeline(payload: PipelineProcessRequestDTO): Promise<PipelineExecutionResultDTO> {
    return http<PipelineExecutionResultDTO>('/api/ai/run-pipeline', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  executePipeline(payload: PipelineProcessRequestDTO): Promise<PipelineExecutionResultDTO> {
    return this.runPipeline(payload);
  }
}

export class HttpChatService implements IChatService {
  askAnalyst(payload: AIChatQueryRequestDTO): Promise<AIChatResponseDTO> {
    return http<AIChatResponseDTO>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  askQuestion(payload: AIChatQueryRequestDTO): Promise<AIChatResponseDTO> {
    return this.askAnalyst(payload);
  }
}

export class HttpProvenanceService implements IProvenanceService {
  getProvenance(payload: FigureProvenanceRequestDTO): Promise<ProvenanceDrillDown> {
    return http<ProvenanceDrillDown>('/api/ai/provenance', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  getFigureProvenance(payload: FigureProvenanceRequestDTO): Promise<ProvenanceDrillDown> {
    return this.getProvenance(payload);
  }
}

export class HttpAdminService implements IAdminService {
  resetSeedData(): Promise<ResetSeedResponseDTO> {
    return http<ResetSeedResponseDTO>('/api/admin/reset-seed', {
      method: 'POST',
    });
  }

  resetSeed(): Promise<ResetSeedResponseDTO> {
    return this.resetSeedData();
  }
}
