// Automated Unit & Integration Tests for Document Extraction & Multi-Doc Normalization
// Tests Excel, CSV, text parsing, KEEP vs AVOID filtering, and cross-document reconciliation

import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import {
  extractDollarAmount,
  extractCostCode,
  normalizeCategoryAndCostCode,
  normalizeVendorName,
  checkAvoidRules,
  parseDocumentContent,
  parseMultipleDocuments,
  parseExcelBuffer,
  parseCsvContent,
  extractTextFromPdfBuffer,
} from '../src/server/services/documentParsingService';

describe('Document Extraction & Multi-Doc Normalization Engine', () => {
  describe('1. Primitive Value Parsing & Rule Checks', () => {
    it('correctly extracts dollar amounts from various formatted strings', () => {
      expect(extractDollarAmount('$145,000.50')).toBe(145000.5);
      expect(extractDollarAmount('Total due: $98,800.00')).toBe(98800);
      expect(extractDollarAmount('Foundation slab 133,200.00 USD')).toBe(133200);
      expect(extractDollarAmount('No numbers here')).toBeNull();
      expect(extractDollarAmount('$5.00')).toBeNull(); // Less than $10 threshold
    });

    it('extracts standard CSI cost codes', () => {
      expect(extractCostCode('03-300 Cast-in-place concrete')).toBe('03-300');
      expect(extractCostCode('Framing work 06100')).toBe('06-100');
      expect(extractCostCode('General invoice', 2)).toBe('03-100'); // default fallback
    });

    it('normalizes vendor names by stripping legal entity noise', () => {
      expect(normalizeVendorName('Vendor: Titan Concrete LLC')).toBe('Titan Concrete');
      expect(normalizeVendorName('From: BMC Lumber & Framing Inc.')).toBe('Bmc Lumber & Framing');
      expect(normalizeVendorName('Apex Commercial Plumbing Corp')).toBe('Apex Commercial Plumbing');
    });

    it('normalizes categories and cost codes to standard CSI MasterFormat divisions', () => {
      const concrete = normalizeCategoryAndCostCode('Cast-in-place concrete foundation slab');
      expect(concrete.csiDivision).toBe('03-000');
      expect(concrete.category).toBe('Foundation & Concrete');

      const framing = normalizeCategoryAndCostCode('Lumber package and roof trusses');
      expect(framing.csiDivision).toBe('06-000');
      expect(framing.category).toBe('Framing, Lumber & Structural Carpentry');

      const plumbing = normalizeCategoryAndCostCode('Rough-in copper plumbing pipes');
      expect(plumbing.csiDivision).toBe('22-000');
      expect(plumbing.category).toBe('Plumbing Systems');
    });
  });

  describe('2. Strict KEEP vs AVOID Anti-Double-Counting Rules', () => {
    it('filters previous statement balances from being double counted', () => {
      const check = checkAvoidRules('Previous Statement Balance: $45,000.00', 45000);
      expect(check.isAvoid).toBe(true);
      expect(check.reason).toContain('Previous Balance');
    });

    it('filters Excel grand totals and subtotals', () => {
      const subtotal = checkAvoidRules('Subtotal: $133,200.00', 133200);
      expect(subtotal.isAvoid).toBe(true);
      expect(subtotal.reason).toContain('Subtotal');

      const grandTotal = checkAvoidRules('Grand Total Due: $178,200.00', 178200);
      expect(grandTotal.isAvoid).toBe(true);
      expect(grandTotal.reason).toContain('Grand Total');
    });

    it('filters non-construction property tax prorations and escrow estimates', () => {
      const tax = checkAvoidRules('County Tax Proration Reserve: $3,420.00', 3420);
      expect(tax.isAvoid).toBe(true);
      expect(tax.reason).toContain('Tax Proration');
    });

    it('allows valid line items to pass KEEP rules', () => {
      const line = checkAvoidRules('03-300 Foundation Concrete Pour $48,000.00', 48000);
      expect(line.isAvoid).toBe(false);
    });
  });

  describe('3. Excel (.xlsx) & CSV Parsing', () => {
    it('parses real in-memory Excel workbook buffer with SheetJS', () => {
      const wb = XLSX.utils.book_new();
      const wsData = [
        ['Master Budget Schedule of Values', '', '', ''],
        ['Cost Code', 'Trade Category', 'Allocated Budget', 'Notes'],
        ['01-100', 'Pre-construction & Permits', 45000, 'Permit fees'],
        ['03-300', 'Foundation & Concrete Slab', 140000, 'Grade beam & slab'],
        ['06-100', 'Framing & Structural Lumber', 190000, 'Framing lumber'],
        ['Subtotal', 'Subtotal Construction', 375000, 'Subtotal row to exclude'],
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'SOV_Master');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const parsed = parseExcelBuffer(buf, 'Maple_Ave_Budget_SOV.xlsx');

      expect(parsed.lineItems.length).toBe(3); // 3 items kept
      expect(parsed.excludedFigures.length).toBe(1); // Subtotal excluded
      expect(parsed.excludedFigures[0].amount).toBe(375000);
      expect(parsed.lineItems[0].category).toBe('Pre-construction, Permits & General Requirements');
      expect(parsed.lineItems[1].amount).toBe(140000);
      expect(parsed.lineItems[2].amount).toBe(190000);
    });

    it('parses structured CSV content via PapaParse', () => {
      const csv = `Category,Cost Code,Amount
Foundation & Concrete,03-300,135000
Framing & Lumber,06-100,180000
MEP Rough-in,22-000,110000
Previous Statement Balance,,45000`;

      const parsed = parseCsvContent(csv, 'expenses.csv');
      expect(parsed.lineItems.length).toBe(3);
      expect(parsed.excludedFigures.length).toBe(1);
      expect(parsed.excludedFigures[0].amount).toBe(45000);
    });
  });

  describe('4. PDF Buffer Stream Extraction & Loan Terms', () => {
    it('extracts real text, loan facility terms, and line items from a PDF buffer', async () => {
      const samplePdfStream = Buffer.from(
        '%PDF-1.4\n' +
        'stream\n' +
        '(Lender: Western Alliance Bank) Tj\n' +
        '(Loan Commitment Amount: $3,500,000.00) Tj\n' +
        '(Interest Rate: 7.25%) Tj\n' +
        '(Initial Advance at Closing: $525,000.00) Tj\n' +
        '(Term: 18 months) Tj\n' +
        '(03-300 Concrete Foundation Slab $450,000.00) Tj\n' +
        '(06-100 Framing Lumber Package $980,000.00) Tj\n' +
        '(22-000 Commercial Plumbing $310,000.00) Tj\n' +
        '(Loan Origination Points 1.0%: $35,000.00) Tj\n' +
        'endstream\n' +
        '%%EOF'
      );

      const base64 = samplePdfStream.toString('base64');
      const doc = await parseDocumentContent('73 Construction Loan.pdf', '', 'test-proj', base64);

      expect(doc.documentType).toBe('LOAN_AGREEMENT');
      expect(doc.loanFacility).toBeDefined();
      expect(doc.loanFacility?.lenderName).toBe('Western Alliance Bank');
      expect(doc.loanFacility?.loanAmount).toBe(3500000);
      expect(doc.loanFacility?.interestRate).toBe(7.25);
      expect(doc.loanFacility?.disbursedFunded).toBe(525000);
      expect(doc.loanFacility?.loanTermMonths).toBe(18);

      // Verify line items extracted from real PDF text
      expect(doc.lineItems.length).toBeGreaterThanOrEqual(3);
      const concreteLine = doc.lineItems.find((l) => l.costCode === '03-300');
      expect(concreteLine).toBeDefined();
      expect(concreteLine?.amount).toBe(450000);

      const framingLine = doc.lineItems.find((l) => l.costCode === '06-100');
      expect(framingLine).toBeDefined();
      expect(framingLine?.amount).toBe(980000);

      // Verify loan origination points excluded from direct construction SOV
      expect(doc.excludedFigures.some((e) => e.reason.includes('Loan Origination') || e.amount === 35000)).toBe(true);
    });
  });

  describe('5. Multi-Document Batch Extraction & Cross-Document Reconciliation', () => {
    it('processes multiple files together, normalizes categories, and cross-reconciles budget vs spend', async () => {
      // Create 1 budget SOV and 2 invoices
      const files = [
        {
          fileName: 'Master_Budget_SOV.csv',
          content: `Category,Cost Code,Amount
Foundation & Concrete,03-300,150000
Framing & Lumber,06-100,200000
Subtotal Construction,,350000`,
        },
        {
          fileName: 'Invoice_Titan_Concrete.txt',
          content: `Titan Concrete LLC
Invoice #INV-901
03-300 Cast-in-Place Concrete Slab: $135,000.00
Previous Statement Balance: $30,000.00
Total Due: $165,000.00`,
        },
        {
          fileName: 'Invoice_BMC_Framing.txt',
          content: `BMC Lumber & Framing
Invoice #INV-902
06-100 Framing & Trusses Materials: $85,000.00
Net Amount Due: $85,000.00`,
        },
      ];

      const batch = await parseMultipleDocuments(files, 'test-project-1');

      expect(batch.documents.length).toBe(3);
      expect(batch.summary.documentCount).toBe(3);

      // Verify SOV lines normalized
      expect(batch.normalizedSOV.length).toBeGreaterThanOrEqual(2);
      expect(batch.summary.totalBudgetExtracted).toBe(350000);

      // Verify Invoices extracted
      expect(batch.normalizedInvoices.length).toBe(2);
      const totalInvoiceSpend = batch.normalizedInvoices.reduce((a, b) => a + b.amount, 0);
      expect(totalInvoiceSpend).toBe(220000); // 135000 + 85000

      // Verify Anti-Double-Counting exclusions
      expect(batch.summary.totalExcludedAmount).toBeGreaterThan(0);
      // Subtotal (350000) + Previous balance (30000) + Total Due (165000) + Net Amount Due footer (85000) = excluded!
      expect(batch.summary.totalExcludedAmount).toBe(350000 + 30000 + 165000 + 85000);

      // Verify Cross-Document Reconciliation
      expect(batch.crossDocumentReconciliation.length).toBeGreaterThanOrEqual(2);
      const concreteRec = batch.crossDocumentReconciliation.find(
        (r) => r.category === 'Foundation & Concrete'
      );
      expect(concreteRec).toBeDefined();
      expect(concreteRec?.budgetedAmount).toBe(150000);
      expect(concreteRec?.incurredSpend).toBe(135000);
      expect(concreteRec?.variance).toBe(15000); // $15k remaining budget
      expect(concreteRec?.status).toBe('APPROACHING_LIMIT');
    });

    it('detects duplicate invoice numbers across files', async () => {
      const files = [
        {
          fileName: 'Inv1.txt',
          content: `Titan Concrete\nInvoice #INV-DUPLICATE\nConcrete Slab: $50,000.00`,
        },
        {
          fileName: 'Inv2.txt',
          content: `Titan Concrete\nInvoice #INV-DUPLICATE\nConcrete Slab: $50,000.00`,
        },
      ];

      const batch = await parseMultipleDocuments(files, 'test-project-dup');
      expect(batch.summary.duplicateWarnings.length).toBeGreaterThan(0);
      expect(batch.summary.duplicateWarnings[0]).toContain('INV-DUPLICATE');
    });

    it('classifies Construction Loan documents and extracts loan facility and approved budget exhibit', async () => {
      const loanDoc = await parseDocumentContent('73 Construction Loan.pdf', '', 'test-project-loan');
      expect(loanDoc.documentType).toBe('LOAN_AGREEMENT');
      expect(loanDoc.loanFacility).toBeDefined();
      expect(loanDoc.loanFacility?.lenderName).toBe('Horizon Commercial Bank');
      expect(loanDoc.loanFacility?.loanAmount).toBe(2450000);
      expect(loanDoc.loanFacility?.interestRate).toBe(7.5);
      expect(loanDoc.lineItems.length).toBeGreaterThanOrEqual(4);
      expect(loanDoc.excludedFigures.some((e) => e.reason.includes('Loan Origination'))).toBe(true);

      const batch = await parseMultipleDocuments([
        { fileName: '73 Construction Loan.pdf' },
        { fileName: 'Plumbing_Bill.csv', content: '22-000,Plumbing,Rough in,45000' }
      ], 'test-project-loan');

      expect(batch.extractedLoan).toBeDefined();
      expect(batch.extractedLoan?.loanAmount).toBe(2450000);
      expect(batch.normalizedSOV.length).toBeGreaterThan(0);
      expect(batch.normalizedInvoices.length).toBe(1);
      expect(batch.summary.totalLoanFacilityExtracted).toBe(2450000);
    });

    it('accurately parses HUD-1 Settlement Statement / Land Acquisition Cash Deal with zero hallucinated trades', async () => {
      const sampleHudContent = `
U.S. Department of Housing and Urban Development
HUD-1 Settlement Statement
Borrower: Cedar Heights Development LLC
Seller: 73 Broadway LLC
Settlement Agent: Law Office of Michael C. Sc...
Place of Settlement: Jersey City, NJ 07306
Block No. 9205 Lot No. 5

101. Contract sales price: $700,000.00
106. City/town taxes 4/1/25 to 6/30/25: $162.82
107. Sewer 4/1/25 to 6/30/25: $407.00
120. Gross Amount Due from Borrower: $705,399.82
201. Deposit or earnest money: $70,000.00
303. Cash From Borrower: $635,399.82

1101. Settlement or closing fee: $525.00
1106. Title insurance: $2,775.00
1203. Transfer taxes: $6,245.00
1302. Bulk Sale Escrow: $12,000.00
1303. Real Estate Taxes second quarter: $548.76
1306. Legal fee to Mavinkurve & Patel: $1,500.00
1307. Legal fee to Law Office of Michael: $1,375.00
`;

      const hudDoc = await parseDocumentContent('73 Land Aquisition Cash Deal.pdf', sampleHudContent, 'test-hud-proj');

      expect(hudDoc.documentType).toBe('HUD_SETTLEMENT');
      expect(hudDoc.vendorName.toLowerCase()).toContain('law office of michael');

      // Land Basis: $700,000 in Pre-construction & Land Basis (01-100)
      const landLine = hudDoc.lineItems.find((l) => l.amount === 700000);
      expect(landLine).toBeDefined();
      expect(landLine?.costCode).toBe('01-100');

      // Soft Closing Costs: Title insurance ($2,775), Settlement ($525), Transfer taxes ($6,245), Bulk escrow ($12,000), Legal fees ($1,500, $1,375)
      const softLines = hudDoc.lineItems.filter((l) => l.costCode === '00-500');
      expect(softLines.length).toBeGreaterThanOrEqual(5);

      // CRITICAL: Zero hallucination check - No elevators (14-000), no appliances (11-000), no furnishings (12-000), no signage (10-000)
      expect(hudDoc.lineItems.some((l) => l.costCode.startsWith('14'))).toBe(false);
      expect(hudDoc.lineItems.some((l) => l.costCode.startsWith('11'))).toBe(false);
      expect(hudDoc.lineItems.some((l) => l.costCode.startsWith('12'))).toBe(false);
      expect(hudDoc.lineItems.some((l) => l.costCode.startsWith('10'))).toBe(false);

      // Verify Anti-Double-Counting exclusions
      // Subtotals (705,399.82), Cash to close (635,399.82), Deposit (70,000), and Taxes (162.82, 407.00, 548.76) MUST be in excludedFigures
      expect(hudDoc.excludedFigures.some((e) => e.amount === 705399.82)).toBe(true);
      expect(hudDoc.excludedFigures.some((e) => e.amount === 635399.82)).toBe(true);
      expect(hudDoc.excludedFigures.some((e) => e.amount === 70000)).toBe(true);
      expect(hudDoc.excludedFigures.some((e) => e.amount === 162.82)).toBe(true);
      expect(hudDoc.excludedFigures.some((e) => e.amount === 407.00)).toBe(true);
      expect(hudDoc.excludedFigures.some((e) => e.amount === 548.76)).toBe(true);
    });
  });
});
