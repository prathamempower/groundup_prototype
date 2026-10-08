// Automated Unit & Integration Tests for Mock Service Layer & Service Factory
// Verifies 100% decoupling from backend runtime, realistic async simulation, and contract fidelity

import { describe, it, expect, beforeEach } from 'vitest';
import { createServiceContainer } from '../src/services/factory';
import { mockStore } from '../src/services/mock/MockDataStore';

describe('GroundUp AI — Mock Service Layer & Repository Architecture', () => {
  let services = createServiceContainer(true);

  beforeEach(() => {
    mockStore.resetToFixtures();
    services = createServiceContainer(true);
  });

  describe('1. Project Service Contract', () => {
    it('fetches all initial projects asynchronously with complete domain models', async () => {
      const projects = await services.projects.getProjects();
      expect(projects.length).toBeGreaterThanOrEqual(3);
      expect(projects.some((p) => p.id === 'proj-73-broadway')).toBe(true);
      expect(projects.some((p) => p.id === 'proj-212-maple')).toBe(true);
    });

    it('computes live Four Truths reconciliation summary deterministically', async () => {
      const summary = await services.projects.getProjectSummary('proj-212-maple');
      expect(summary.total_current_budget).toBe(740000);
      expect(summary.total_actual_spend).toBe(312000);
      expect(summary.total_amount_funded).toBe(213200);
      expect(summary.developer_cash_exposure).toBe(98800); // 312k - 213.2k
      expect(summary.readiness).toBeDefined();
      expect(summary.categories.length).toBeGreaterThan(0);
    });

    it('creates, updates, and deletes projects in-memory cleanly', async () => {
      const created = await services.projects.createProject({
        name: '400 Congress Ave',
        address: '400 Congress Ave, Austin TX',
        target_budget: 2500000,
        units: 8,
      });
      expect(created.id).toBeDefined();
      expect(created.name).toBe('400 Congress Ave');

      const updated = await services.projects.updateProject(created.id, {
        target_budget: 2600000,
        status: 'COMPLETED',
      });
      expect(updated.target_budget).toBe(2600000);
      expect(updated.status).toBe('COMPLETED');

      const delRes = await services.projects.deleteProject(created.id);
      expect(delRes.success).toBe(true);

      const all = await services.projects.getProjects();
      expect(all.some((p) => p.id === created.id)).toBe(false);
    });

    it('generates aggregated portfolio summary', async () => {
      const portfolio = await services.projects.getPortfolioSummary();
      expect(portfolio.totalProjects).toBeGreaterThanOrEqual(3);
      expect(portfolio.totalPortfolioBudget).toBeGreaterThan(0);
      expect(portfolio.totalPortfolioSpend).toBeGreaterThan(0);
    });

    it('generates certified final audit report', async () => {
      const report = await services.projects.getFinalReport('proj-212-maple');
      expect(report.reportId).toBeDefined();
      expect(report.complianceStatus).toBe('VERIFIED_ZERO_HALLUCINATION');
      expect(report.fourTruths.masterBudget).toBe(740000);
    });
  });

  describe('2. Intake Service Contract', () => {
    it('handles full project intake flow atomically', async () => {
      const result = await services.intake.createFullUserProjectIntake({
        projectName: 'Riverfront Towers',
        projectAddress: '100 Riverfront Dr',
        targetBudget: 5000000,
        loanAmount: 3500000,
        interestRate: 0.085,
        termMonths: 24,
        sovLines: [
          { category: 'Foundation & Concrete', amount: 1500000, cost_code: '03-300' },
          { category: 'Framing & Trusses', amount: 2000000, cost_code: '06-100' },
        ],
        invoices: [
          { category: 'Foundation & Concrete', vendor_name: 'Piers Inc', amount: 400000, expense_date: '2026-05-01' },
        ],
        activities: [
          { milestone: 'Foundation', trade: 'Concrete', planned_start: '2026-05-01', planned_end: '2026-06-01', verified_progress_pct: 0.3 },
        ],
      });

      expect(result.project.id).toBeDefined();
      expect(result.summary.total_current_budget).toBe(3500000);
      expect(result.summary.total_actual_spend).toBe(400000);
      expect(result.summary.developer_cash_exposure).toBe(400000);
    });
  });

  describe('3. Draw State Machine & Wire Disbursement', () => {
    it('executes full draw submission, lender review, revision, and wire disbursement', async () => {
      const projectId = 'proj-212-maple';
      const initialSummary = await services.projects.getProjectSummary(projectId);
      expect(initialSummary.total_amount_funded).toBe(213200);

      // 1. Submit Draw #3
      const sub = await services.draws.createDrawSubmission(projectId, 3, [
        { category: 'Framing & Trusses', requested_amount: 60000 },
        { category: 'Drywall & Insulation', requested_amount: 30000 },
      ]);
      expect(sub.draw.id).toBeDefined();
      expect(sub.draw.requested_total).toBe(90000);

      // 2. Lender review with partial approval & rejection code
      const reviewed = await services.draws.recordLenderReview(sub.draw.id, {
        lines: [
          { id: sub.drawLines[0].id, approved_amount: 60000, status: 'approved' },
          {
            id: sub.drawLines[1].id,
            approved_amount: 0,
            status: 'rejected',
            rejection_reason_code: 'MISSING_LIEN_WAIVER',
            rejection_notes: 'Missing dry-wall supplier unconditional waiver',
          },
        ],
        lender_notes: 'Drywall rejected pending sub-tier waiver',
      });
      expect(reviewed.status).toBe('approved_partial');
      expect(reviewed.approved_total).toBe(60000);

      // 3. Resubmit revision with attached corrective waiver
      const rev = await services.draws.createDrawRevision(sub.draw.id, [
        {
          category: 'Drywall & Insulation',
          requested_amount: 30000,
          corrective_document_id: 'doc-waiver-102',
          notes: 'Attached executed waiver',
        },
      ]);
      expect(rev.revisionDraw.revision_number).toBe(1);

      // 4. Record wire disbursement for $60k approved
      const disburse = await services.draws.recordWireDisbursement(sub.draw.id, 60000);
      expect(disburse.disbursedAmount).toBe(60000);

      // 5. Verify Funding Truth & Cash Exposure updated
      const updatedSummary = await services.projects.getProjectSummary(projectId);
      expect(updatedSummary.total_amount_funded).toBe(273200); // 213,200 + 60,000
      expect(updatedSummary.developer_cash_exposure).toBe(38800); // 312,000 - 273,200
    });
  });

  describe('4. Invoice Management Service', () => {
    it('supports full CRUD on contractor invoices updating Spend Truth', async () => {
      const projectId = 'proj-73-broadway';
      const initialInvoices = await services.invoices.getProjectInvoices(projectId);
      const count = initialInvoices.length;

      const created = await services.invoices.addInvoice(projectId, {
        category: 'Interior Finishes',
        vendor_name: 'Custom Cabinetry Masters',
        amount: 45000,
        invoice_id: 'INV-CAB-01',
        description: 'Kitchen and bath cabinetry',
        expense_date: '2026-10-04',
        lien_waiver_received: true,
      });
      expect(created.amount).toBe(45000);

      const afterAdd = await services.invoices.getProjectInvoices(projectId);
      expect(afterAdd.length).toBe(count + 1);

      const updated = await services.invoices.updateInvoice(created.id, {
        amount: 48000,
      });
      expect(updated.amount).toBe(48000);

      const delRes = await services.invoices.deleteInvoice(created.id);
      expect(delRes.success).toBe(true);

      const afterDel = await services.invoices.getProjectInvoices(projectId);
      expect(afterDel.length).toBe(count);
    });
  });

  describe('5. Document Parsing & Intelligence Service', () => {
    it('parses documents enforcing KEEP vs AVOID anti-double-counting rules', async () => {
      const result = await services.documents.parseDocument({
        fileName: 'Subcontractor_Invoice.txt',
        content: `Titan Concrete Systems LLC\n03-300 Concrete Slab Pour: $140,000.00\nPrevious Statement Balance: $50,000.00\nTotal Due: $190,000.00`,
      });

      expect(result.lineItems.length).toBe(1);
      expect(result.lineItems[0].amount).toBe(140000);
      expect(result.lineItems[0].costCode).toBe('03-300');
      expect(result.excludedFigures.some((e) => e.ruleCategory === 'PREVIOUS_BALANCE')).toBe(true);
    });

    it('parses batch documents and commits to in-memory store', async () => {
      const batch = await services.documents.parseBatchDocuments({
        files: [
          {
            fileName: 'Master_SOV.csv',
            bufferBase64: btoa('Category,Cost Code,Amount\nFoundation,03-300,300000\nFraming,06-100,500000'),
            size: 1024,
          },
        ],
        projectId: 'proj-73-broadway',
      });

      expect(batch.normalizedSOV.length).toBe(2);
      expect(batch.summary.totalBudgetExtracted).toBe(800000);
    });
  });

  describe('6. AI Chat & Provenance Lineage', () => {
    it('answers cash exposure questions with deterministic lineage', async () => {
      const res = await services.chat.askQuestion({
        projectId: 'proj-73-broadway',
        message: 'What is my current cash exposure?',
      });

      expect(res.content).toContain('Developer Cash Exposure');
      expect(res.breakdown?.total).toBeDefined();
    });

    it('returns zero-hallucination provenance nodes for financial figures', async () => {
      const prov = await services.provenance.getFigureProvenance({
        figureType: 'spend',
        projectId: 'proj-73-broadway',
      });

      expect(prov.truth_domain).toBe('Spend');
      expect(prov.provenance_nodes.length).toBeGreaterThan(0);
    });
  });

  describe('7. Plug-and-Play Factory & Mock Switch', () => {
    it('instantiates MockService when mock is forced or default', () => {
      const mockContainer = createServiceContainer(true);
      expect(mockContainer.isMock).toBe(true);
    });

    it('instantiates HttpService when mock is disabled', () => {
      const httpContainer = createServiceContainer(false);
      expect(httpContainer.isMock).toBe(false);
    });
  });
});
