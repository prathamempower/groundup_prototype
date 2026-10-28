import { ReviewItemData } from "./owner-resolution-modal";

export interface AuditIssueInfo {
  type: "missing" | "variance" | "duplicate" | "transfer" | "unallocated";
  label: string;
  detail: string;
  badgeClass: string;
  amountLabel: string;
}

export function getIssueInfo(row: ReviewItemData): AuditIssueInfo {
  if (row.auditIssue) {
    const issueLower = row.auditIssue.toLowerCase();
    if (issueLower.includes("missing")) {
      return {
        type: "missing",
        label: row.auditIssue,
        detail: row.auditDetail || "No document on file",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
        amountLabel: row.amount,
      };
    }
    if (issueLower.includes("variance") || issueLower.includes("mismatch")) {
      return {
        type: "variance",
        label: row.auditIssue,
        detail: row.auditDetail || "Amount differs from document",
        badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
        amountLabel: row.amount,
      };
    }
    if (issueLower.includes("duplicate")) {
      return {
        type: "duplicate",
        label: row.auditIssue,
        detail: row.auditDetail || "Same amount already recorded",
        badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
        amountLabel: row.amount,
      };
    }
    if (issueLower.includes("transfer") || issueLower.includes("card payment") || issueLower.includes("payment")) {
      return {
        type: "transfer",
        label: row.auditIssue,
        detail: row.auditDetail || "Card payoff (avoid double count)",
        badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
        amountLabel: row.amount,
      };
    }
    if (issueLower.includes("unallocated") || issueLower.includes("unlinked")) {
      return {
        type: "unallocated",
        label: row.auditIssue,
        detail: row.auditDetail || "Deposit needs loan draw link",
        badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
        amountLabel: row.amount,
      };
    }
  }

  // Fallback derivation based on transaction data
  if (row.evidence === "Missing" || row.id === "rq-2") {
    return {
      type: "missing",
      label: "Missing Invoice",
      detail: "No document on file",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      amountLabel: row.amount,
    };
  }

  if (row.id === "rq-7" || row.description.toLowerCase().includes("lumber")) {
    return {
      type: "duplicate",
      label: "Possible Duplicate",
      detail: "Same $5,000.00 charge found",
      badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
      amountLabel: row.amount,
    };
  }

  if (
    row.id === "rq-6" ||
    row.description.toLowerCase().includes("credit card") ||
    row.account?.toLowerCase().includes("card") ||
    row.account?.toLowerCase().includes("america")
  ) {
    return {
      type: "transfer",
      label: "Card Payment",
      detail: "Card payoff (avoid double count)",
      badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
      amountLabel: row.amount,
    };
  }

  if (row.direction === "in" || row.amount.startsWith("+") || row.id === "rq-5" || row.id === "rq-8") {
    return {
      type: "unallocated",
      label: "Unlinked Deposit",
      detail: row.id === "rq-8" ? "Loan wire needs budget draw link" : "Deposit needs loan draw link",
      badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
      amountLabel: row.amount,
    };
  }

  if (row.evidence === "Partial" || row.id === "rq-3" || row.id === "rq-4") {
    return {
      type: "variance",
      label: "Amount Mismatch",
      detail: row.id === "rq-3" ? "Receipt has $40 difference" : "Invoice has $450 difference",
      badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
      amountLabel: row.amount,
    };
  }

  return {
    type: "missing",
    label: "Missing Receipt",
    detail: "Card slip needed",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    amountLabel: row.amount,
  };
}

export function getSourceFileName(row: Partial<ReviewItemData>): string {
  if (row.sourceFileName) return row.sourceFileName;
  if (
    row.account?.toLowerCase().includes("card") ||
    row.account?.toLowerCase().includes("america") ||
    row.id === "rq-6"
  ) {
    return "business_card_stmt_oct2026.pdf";
  }
  if (row.id === "rq-5") {
    return "wire_transfer_equity_w05.pdf";
  }
  if (row.id === "rq-8") {
    return "lender_draw_03_notice.pdf";
  }
  return "operating_statement_oct2026.pdf";
}
