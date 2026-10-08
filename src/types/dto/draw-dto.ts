import { Draw, DrawLine, UserRole, RejectionReasonCode } from '../domain';

export interface DrawLineSubmissionInputDTO {
  category: string;
  requested_amount: number;
  source_document_id?: string;
  source_ref?: string;
}

export interface CreateDrawSubmissionRequestDTO {
  projectId: string;
  drawNumber: number;
  lines: DrawLineSubmissionInputDTO[];
  actorRole?: UserRole;
}

export interface CreateDrawSubmissionResponseDTO {
  draw: Draw;
  drawLines: DrawLine[];
}

export interface LenderReviewLineItemDTO {
  id: string;
  approved_amount: number;
  status: 'approved' | 'rejected' | 'partially_approved';
  rejection_reason_code?: RejectionReasonCode;
  rejection_notes?: string;
}

export interface RecordLenderReviewRequestDTO {
  drawId: string;
  response: {
    lines: LenderReviewLineItemDTO[];
    lender_notes?: string;
  };
  actorRole?: UserRole;
}

export interface DrawRevisionLineInputDTO {
  category: string;
  requested_amount: number;
  corrective_document_id?: string;
  notes?: string;
}

export interface CreateDrawRevisionRequestDTO {
  drawId: string;
  correctiveLines: DrawRevisionLineInputDTO[];
  actorRole?: UserRole;
}

export interface CreateDrawRevisionResponseDTO {
  revisionDraw: Draw;
  revisionLines: DrawLine[];
}

export interface RecordWireDisbursementRequestDTO {
  drawId: string;
  disbursedAmount: number;
  actorRole?: UserRole;
}

export interface RecordWireDisbursementResponseDTO {
  draw: Draw;
  disbursedAmount: number;
}

export interface ProjectDrawsResponseDTO {
  draws: Draw[];
  drawLines: DrawLine[];
}
