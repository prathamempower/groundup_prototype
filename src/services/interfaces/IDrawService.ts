// GroundUp AI — IDrawService Interface Contract

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

export interface IDrawService {
  /**
   * Fetch all draws and draw line items for a project.
   */
  getProjectDraws(projectId: string): Promise<ProjectDrawsResponseDTO>;

  /**
   * Submit a new draw packet with requested line items.
   */
  createDrawSubmission(
    projectId: string,
    drawNumber: number,
    lines: DrawLineSubmissionInputDTO[],
    actorRole?: UserRole
  ): Promise<CreateDrawSubmissionResponseDTO>;

  /**
   * Record lender review decisions (approvals, partials, rejections with reason codes).
   */
  recordLenderReview(
    drawId: string,
    response: {
      lines: LenderReviewLineItemDTO[];
      lender_notes?: string;
    },
    actorRole?: UserRole | 'LENDER'
  ): Promise<Draw>;

  /**
   * Create a revision of a rejected or partially-approved draw with corrective documents.
   */
  createDrawRevision(
    drawId: string,
    correctiveLines: DrawRevisionLineInputDTO[],
    actorRole?: UserRole
  ): Promise<CreateDrawRevisionResponseDTO>;

  /**
   * Record bank wire disbursement for approved funds (enters Funding Truth).
   */
  recordWireDisbursement(
    drawId: string,
    disbursedAmount: number,
    actorRole?: UserRole | 'LENDER'
  ): Promise<RecordWireDisbursementResponseDTO>;
}
