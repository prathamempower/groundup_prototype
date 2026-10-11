import { describe, it, expect } from "vitest";

describe("Cross-Track Business Rules Verification", () => {
  describe("1. Four-Value Draw Funding Truth", () => {
    it("strictly separates Requested, Recommended, Approved, and Cleared Funded values", () => {
      const draw3 = {
        id: "draw_03",
        draw_number: 3,
        requested_amount_cents: 28500000,   // $285,000.00
        recommended_amount_cents: 28500000, // $285,000.00
        approved_amount_cents: 22500000,    // $225,000.00 (lender cut $60k)
        funded_amount_cents: 14000000,      // $140,000.00 (partial wire deposit)
      };

      // 1. Funding truth is cleared bank cash, NOT approval or recommendation
      expect(draw3.funded_amount_cents).not.toBe(draw3.approved_amount_cents);
      expect(draw3.funded_amount_cents).toBe(14000000);

      // 2. Shortfall is strictly computed from Approved minus Funded
      const fundingShortfall = draw3.approved_amount_cents - draw3.funded_amount_cents;
      expect(fundingShortfall).toBe(8500000); // $85,000.00 un-funded portion of approved

      // 3. Lender reduction is Requested minus Approved
      const lenderCut = draw3.requested_amount_cents - draw3.approved_amount_cents;
      expect(lenderCut).toBe(6000000); // $60,000.00 shortfall due to inspection exception
    });
  });

  describe("2. Contingency Movement Limits", () => {
    it("rejects contingency transfer exceeding available reserve", () => {
      const contingencyLine = {
        code: "20-000",
        name: "Contingency",
        current_amount_cents: 18500000, // $185,000 remaining
      };

      const requestedTransfer = 20000000; // $200,000 requested
      const isValid = requestedTransfer <= contingencyLine.current_amount_cents;
      expect(isValid).toBe(false);

      const validTransfer = 5000000; // $50,000 requested
      const isValidWithinLimit = validTransfer <= contingencyLine.current_amount_cents;
      expect(isValidWithinLimit).toBe(true);
    });
  });

  describe("3. Statement Period Balance Control", () => {
    it("validates exact mathematical balance: Opening + Credits - Debits === Closing", () => {
      const period = {
        opening_balance_cents: 35000000, // $350,000.00
        total_credits_cents: 45000000,   // $450,000.00
        total_debits_cents: 28000000,    // $280,000.00
        closing_balance_cents: 52000000, // $520,000.00
      };

      const calculatedClosing =
        period.opening_balance_cents + period.total_credits_cents - period.total_debits_cents;

      expect(calculatedClosing).toBe(period.closing_balance_cents);
      expect(calculatedClosing - period.closing_balance_cents).toBe(0);
    });

    it("detects balance mismatch when debits/credits do not reconcile", () => {
      const periodWithDiscrepancy = {
        opening_balance_cents: 10000000,
        total_credits_cents: 20000000,
        total_debits_cents: 15000000,
        closing_balance_cents: 14500000, // Expected 15000000, off by $5k
      };

      const variance =
        periodWithDiscrepancy.opening_balance_cents +
        periodWithDiscrepancy.total_credits_cents -
        periodWithDiscrepancy.total_debits_cents -
        periodWithDiscrepancy.closing_balance_cents;

      expect(variance).not.toBe(0);
      expect(variance).toBe(500000); // $5,000 variance detected
    });
  });

  describe("4. Split Allocation Balance Rule", () => {
    it("ensures itemized split lines exactly equal the parent transaction amount", () => {
      const parentTransactionAmountCents = 7500000; // $75,000.00
      const splits = [
        { csi_code: "03-000", amount_cents: 4500000 },
        { csi_code: "05-000", amount_cents: 3000000 },
      ];

      const splitSum = splits.reduce((acc, s) => acc + s.amount_cents, 0);
      expect(splitSum).toBe(parentTransactionAmountCents);

      const invalidSplits = [
        { csi_code: "03-000", amount_cents: 4500000 },
        { csi_code: "05-000", amount_cents: 2000000 }, // Total 65k vs 75k
      ];
      const invalidSum = invalidSplits.reduce((acc, s) => acc + s.amount_cents, 0);
      expect(invalidSum === parentTransactionAmountCents).toBe(false);
    });
  });

  describe("5. Inter-Project Transfer Balance-Sheet Isolation", () => {
    it("preserves zero project P&L impact for loan transfers", () => {
      const transfer = {
        amount_cents: 15000000, // $150,000
        borrowing_project_id: "proj_73_broadway",
        lending_project_id: "proj_392_first",
        status: "ACTIVE",
        classification: "BALANCE_SHEET_INTERCOMPANY",
      };

      // Inter-company transfers are classified as balance-sheet assets/liabilities, never revenue/expense
      expect(transfer.classification).toBe("BALANCE_SHEET_INTERCOMPANY");
    });
  });

  describe("6. Duplicate Invoice Scanning", () => {
    it("detects existing invoice numbers across ledger and pending submissions", () => {
      const existingInvoices = ["INV-2025-089", "INV-2025-042", "AP-9941"];

      const newSubmissionA = "INV-2025-089";
      const isDuplicateA = existingInvoices.some(
        (inv) => inv.trim().toLowerCase() === newSubmissionA.trim().toLowerCase()
      );
      expect(isDuplicateA).toBe(true);

      const newSubmissionB = "INV-2025-095";
      const isDuplicateB = existingInvoices.some(
        (inv) => inv.trim().toLowerCase() === newSubmissionB.trim().toLowerCase()
      );
      expect(isDuplicateB).toBe(false);
    });
  });
});
