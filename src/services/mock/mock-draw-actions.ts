import {
  Draw,
  DrawLine,
  UserRole,
  LenderReviewLineItemDTO,
  DrawRevisionLineInputDTO,
  CreateDrawRevisionResponseDTO,
  RecordWireDisbursementResponseDTO,
} from '../../types';
import { mockStore } from './MockDataStore';

export function executeMockLenderReview(
  drawId: string,
  response: {
    lines: LenderReviewLineItemDTO[];
    lender_notes?: string;
  },
  actorRole: UserRole = 'LENDER'
): Draw {
  const draw = mockStore.draws.find((d) => d.id === drawId);
  if (!draw) throw new Error(`Draw ${drawId} not found.`);

  let approvedTotal = 0;

  for (const l of response.lines) {
    approvedTotal += l.approved_amount;

    const lineIndex = mockStore.drawLines.findIndex((dl) => dl.id === l.id);
    if (lineIndex !== -1) {
      mockStore.drawLines[lineIndex] = {
        ...mockStore.drawLines[lineIndex],
        approved_amount: l.approved_amount,
        status: l.status,
        rejection_reason_code: l.rejection_reason_code,
        rejection_notes: l.rejection_notes,
      };
    }
  }

  const finalStatus = approvedTotal === draw.requested_total
    ? 'approved_full'
    : approvedTotal > 0
    ? 'approved_partial'
    : 'rejected';

  draw.approved_total = approvedTotal;
  draw.status = finalStatus;
  draw.response_date = new Date().toISOString().split('T')[0];
  draw.lender_notes = response.lender_notes;

  mockStore.recordAuditEvent(
    actorRole,
    'Bank Officer',
    'Draw',
    drawId,
    'status',
    'submitted',
    finalStatus,
    'Lender Review'
  );

  return { ...draw };
}

export function executeMockDrawRevision(
  drawId: string,
  correctiveLines: DrawRevisionLineInputDTO[],
  actorRole: UserRole = 'CFO'
): CreateDrawRevisionResponseDTO {
  const prevDraw = mockStore.draws.find((d) => d.id === drawId);
  if (!prevDraw) throw new Error(`Draw ${drawId} not found.`);

  const newRevisionNumber = prevDraw.revision_number + 1;
  const newDrawId = `draw-${prevDraw.project_id}-${prevDraw.draw_number}-rev${newRevisionNumber}`;
  const requestedTotal = correctiveLines.reduce((sum, l) => sum + l.requested_amount, 0);

  const revisionDraw: Draw = {
    id: newDrawId,
    project_id: prevDraw.project_id,
    draw_number: prevDraw.draw_number,
    revision_number: newRevisionNumber,
    original_draw_id: prevDraw.id,
    requested_total: requestedTotal,
    approved_total: 0,
    disbursed_total: 0,
    status: 'submitted',
    submitted_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  };

  mockStore.draws.push(revisionDraw);

  const createdLines: DrawLine[] = [];
  for (let i = 0; i < correctiveLines.length; i++) {
    const l = correctiveLines[i];
    const dl: DrawLine = {
      id: `dl-${newDrawId}-${i + 1}`,
      draw_id: newDrawId,
      project_id: prevDraw.project_id,
      category: l.category,
      requested_amount: l.requested_amount,
      approved_amount: 0,
      funded_amount: 0,
      status: 'requested',
      corrective_document_id: l.corrective_document_id,
      source_ref: l.notes || 'Corrective Revision Line',
    };
    mockStore.drawLines.push(dl);
    createdLines.push(dl);
  }

  mockStore.recordAuditEvent(
    actorRole,
    'User',
    'Draw',
    newDrawId,
    'revision',
    `rev${prevDraw.revision_number}`,
    `rev${newRevisionNumber}`,
    'Corrective Draw Revision'
  );

  return { revisionDraw, revisionLines: createdLines };
}

export function executeMockWireDisbursement(
  drawId: string,
  disbursedAmount: number,
  actorRole: UserRole = 'LENDER'
): RecordWireDisbursementResponseDTO {
  const draw = mockStore.draws.find((d) => d.id === drawId);
  if (!draw) throw new Error(`Draw ${drawId} not found.`);

  draw.disbursed_total = (draw.disbursed_total || 0) + disbursedAmount;
  draw.disbursed_date = new Date().toISOString().split('T')[0];

  const lines = mockStore.drawLines.filter((dl) => dl.draw_id === drawId && dl.status === 'approved');
  for (const line of lines) {
    line.funded_amount = line.approved_amount;
    line.status = 'disbursed';
  }

  const loan = mockStore.loans.find((l) => l.project_id === draw.project_id);
  if (loan) {
    loan.current_balance = (loan.current_balance || 0) + disbursedAmount;
  }

  mockStore.recordAuditEvent(
    actorRole,
    'Lender Wire Desk',
    'Draw',
    drawId,
    'disbursed_total',
    '0',
    `$${disbursedAmount}`,
    'Wire Disbursement Funded'
  );

  return { draw: { ...draw }, disbursedAmount };
}
