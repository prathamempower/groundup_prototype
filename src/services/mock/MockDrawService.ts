import { IDrawService } from '../interfaces/IDrawService';
import {
  Draw,
  DrawLine,
  UserRole,
  ProjectDrawsResponseDTO,
  CreateDrawSubmissionResponseDTO,
  CreateDrawRevisionResponseDTO,
  RecordWireDisbursementResponseDTO,
  DrawLineSubmissionInputDTO,
  LenderReviewLineItemDTO,
  DrawRevisionLineInputDTO,
} from '../../types';
import { mockStore } from './MockDataStore';
import { delay } from './delay';
import {
  executeMockLenderReview,
  executeMockDrawRevision,
  executeMockWireDisbursement,
} from './mock-draw-actions';

export class MockDrawService implements IDrawService {
  async getProjectDraws(projectId: string): Promise<ProjectDrawsResponseDTO> {
    await delay();
    const draws = mockStore.draws.filter((d) => d.project_id === projectId);
    const drawLines = mockStore.drawLines.filter((dl) => dl.project_id === projectId);
    return { draws: [...draws], drawLines: [...drawLines] };
  }

  async createDrawSubmission(
    projectId: string,
    drawNumber: number,
    lines: DrawLineSubmissionInputDTO[],
    actorRole: UserRole = 'CFO'
  ): Promise<CreateDrawSubmissionResponseDTO> {
    await delay();
    const drawId = `draw-${projectId}-${drawNumber}-rev0`;
    const requestedTotal = lines.reduce((sum, l) => sum + l.requested_amount, 0);

    const draw: Draw = {
      id: drawId,
      project_id: projectId,
      draw_number: drawNumber,
      revision_number: 0,
      requested_total: requestedTotal,
      approved_total: 0,
      disbursed_total: 0,
      status: 'submitted',
      submitted_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };

    mockStore.draws.push(draw);

    const createdLines: DrawLine[] = [];
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      const dl: DrawLine = {
        id: `dl-${drawId}-${i + 1}`,
        draw_id: drawId,
        project_id: projectId,
        category: l.category,
        requested_amount: l.requested_amount,
        approved_amount: 0,
        funded_amount: 0,
        status: 'requested',
        source_document_id: l.source_document_id,
        source_ref: l.source_ref,
      };
      mockStore.drawLines.push(dl);
      createdLines.push(dl);
    }

    mockStore.recordAuditEvent(
      actorRole,
      'User',
      'Draw',
      draw.id,
      'status',
      'NEW',
      'submitted',
      `Draw #${drawNumber} Submission`
    );

    return { draw, drawLines: createdLines };
  }

  async recordLenderReview(
    drawId: string,
    response: {
      lines: LenderReviewLineItemDTO[];
      lender_notes?: string;
    },
    actorRole: UserRole | 'LENDER' = 'LENDER'
  ): Promise<Draw> {
    await delay();
    return executeMockLenderReview(drawId, response, actorRole);
  }

  async createDrawRevision(
    drawId: string,
    correctiveLines: DrawRevisionLineInputDTO[],
    actorRole: UserRole = 'CFO'
  ): Promise<CreateDrawRevisionResponseDTO> {
    await delay();
    return executeMockDrawRevision(drawId, correctiveLines, actorRole);
  }

  async recordWireDisbursement(
    drawId: string,
    disbursedAmount: number,
    actorRole: UserRole | 'LENDER' = 'LENDER'
  ): Promise<RecordWireDisbursementResponseDTO> {
    await delay();
    return executeMockWireDisbursement(drawId, disbursedAmount, actorRole);
  }
}
