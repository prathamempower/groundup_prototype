import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { getIssueInfo, getSourceFileName } from "@/components/reconciliation/reconciliation-helpers";

describe("Reconciliation Table Craft Governance", () => {
  const pagePath = path.resolve(__dirname, "../../app/projects/[projectId]/reconciliation/page.tsx");
  const pageContent = fs.readFileSync(pagePath, "utf-8");

  it("does not render Category or generic Description header columns", () => {
    expect(pageContent).not.toMatch(/<th[^>]*>Category<\/th>/i);
    expect(pageContent).not.toMatch(/<th[^>]*>Description<\/th>/i);
  });

  it("renders Date column with bank name underneath", () => {
    expect(pageContent).toContain(">Date</th>");
    expect(pageContent).not.toContain("Date &amp; Account");
    expect(pageContent).toContain("{row.date}");
    expect(pageContent).toContain("{row.account}");
  });

  it("renders realistic bank names for Columbia Bank and Bank of America", () => {
    expect(pageContent).toContain("Columbia Bank · 4821");
    expect(pageContent).toContain("Bank of America · 1108");
  });

  it("renders the 5-Column Exception Grid (Date, Transaction, Issue, Amount, Actions)", () => {
    expect(pageContent).toContain("Transaction");
    expect(pageContent).toContain(">Issue</th>");
    expect(pageContent).toContain(">Amount</th>");
    expect(pageContent).toContain("colSpan={6}");
  });

  it("removes redundant Newest first sort dropdown from the filter bar", () => {
    expect(pageContent).not.toContain("Newest first");
  });

  it("maps issue filter dropdown options with all issues in the table", () => {
    expect(pageContent).toContain("Missing documents");
    expect(pageContent).toContain("Amount mismatch");
    expect(pageContent).toContain("Unlinked deposits");
    expect(pageContent).toContain("Card payments");
    expect(pageContent).toContain("Possible duplicates");
  });

  it("does not render category subtitle under counterparty name in Transaction column", () => {
    expect(pageContent).not.toMatch(/<td className="px-3\.5 py-3">\s*<div[^>]*>\{row\.description\}<\/div>\s*<div[^>]*>\{row\.proposedLink\}<\/div>/);
  });

  it("supports the 4 real-world reconciliation scenarios (Missing Invoice, Amount Mismatch, Possible Duplicate, Card Payment)", () => {
    expect(pageContent).toContain("Missing Invoice");
    expect(pageContent).toContain("Amount Mismatch");
    expect(pageContent).toContain("Possible Duplicate");
    expect(pageContent).toContain("Card Payment");
  });

  it("removes redundant Money out and $0.00 diff slop from the table", () => {
    expect(pageContent).not.toContain("Money out · Outflow");
    expect(pageContent).not.toContain("$0.00 diff");
  });

  it("does not render Monthly statements or Missing documents & alerts tabs", () => {
    expect(pageContent).not.toContain("<span>Monthly statements</span>");
    expect(pageContent).not.toContain("<span>Missing documents &amp; alerts</span>");
  });

  it("keeps Transaction column clean without secondary sublines or redundant document labels", () => {
    expect(pageContent).not.toContain("{sourceFile}");
  });
});

describe("getIssueInfo Reason & Amount Derivation", () => {
  // Direct logic validation
  it("derives Missing Invoice info correctly when item has no receipt or invoice", () => {
    const item = {
      id: "rq-2",
      date: "Oct 28, 2026",
      account: "Columbia Bank · 4821",
      description: "Nilson Mocalos",
      type: "Bank transaction",
      direction: "out",
      amount: "-$1,280.00",
      matchedDocument: "",
      matchedAmount: "$0.00",
      variance: "-$1,280.00",
      evidence: "Missing",
      status: "Pending review",
    };
    const info = getIssueInfo(item);
    expect(info.type).toBe("missing");
    expect(info.label).toContain("Missing");
    expect(info.detail).toContain("document on file");
    expect(info.amountLabel).toBe("-$1,280.00");
  });

  it("derives Amount Mismatch info when amount differs from document", () => {
    const item = {
      id: "rq-3",
      date: "Oct 27, 2026",
      account: "Columbia Bank · 4821",
      description: "Jersey City Permit Office",
      type: "Bank transaction",
      direction: "out",
      amount: "-$640.00",
      matchedDocument: "Permit Receipt #JC-4410",
      matchedAmount: "$600.00",
      variance: "$40.00",
      evidence: "Partial",
      status: "Pending review",
    };
    const info = getIssueInfo(item);
    expect(info.type).toBe("variance");
    expect(info.label).toBe("Amount Mismatch");
    expect(info.amountLabel).toBe("-$640.00");
  });

  it("derives Possible Duplicate info when duplicate charges are detected", () => {
    const item = {
      id: "rq-7",
      date: "Oct 21, 2026",
      account: "Columbia Bank · 4821",
      description: "Jersey City Lumber Co.",
      type: "Bank transaction",
      direction: "out",
      amount: "-$5,000.00",
      evidence: "Partial",
      status: "Pending review",
    };
    const info = getIssueInfo(item);
    expect(info.type).toBe("duplicate");
    expect(info.label).toBe("Possible Duplicate");
    expect(info.amountLabel).toBe("-$5,000.00");
  });

  it("derives Card Payment info when credit card or internal account is paid", () => {
    const item = {
      id: "rq-6",
      date: "Oct 23, 2026",
      account: "Bank of America · 1108",
      description: "Credit card payment",
      type: "Bank transaction",
      direction: "out",
      amount: "-$1,850.00",
      evidence: "Partial",
      status: "Pending review",
    };
    const info = getIssueInfo(item);
    expect(info.type).toBe("transfer");
    expect(info.label).toBe("Card Payment");
    expect(info.amountLabel).toBe("-$1,850.00");
  });
});

describe("getSourceFileName Source Document Derivation", () => {
  it("returns explicit sourceFileName if defined on item", () => {
    const item = {
      id: "custom-1",
      date: "Oct 28, 2026",
      account: "Operating · 4821",
      description: "Custom Vendor",
      sourceFileName: "custom_wire_receipt.pdf",
      amount: "-$500.00",
      status: "Pending review",
    };
    expect(getSourceFileName(item)).toBe("custom_wire_receipt.pdf");
  });

  it("derives business_card_stmt_oct2026.pdf for card transactions", () => {
    const item = {
      id: "rq-6",
      date: "Oct 23, 2026",
      account: "Bank of America · 1108",
      description: "Credit card payment",
      amount: "-$1,850.00",
      status: "Pending review",
    };
    expect(getSourceFileName(item)).toBe("business_card_stmt_oct2026.pdf");
  });

  it("derives wire_transfer_equity_w05.pdf for rq-5 equity wire", () => {
    const item = {
      id: "rq-5",
      date: "Oct 24, 2026",
      account: "Operating · 4821",
      description: "Investor funding deposit",
      amount: "+$25,000.00",
      status: "Pending review",
    };
    expect(getSourceFileName(item)).toBe("wire_transfer_equity_w05.pdf");
  });

  it("derives lender_draw_03_notice.pdf for rq-8 loan draw", () => {
    const item = {
      id: "rq-8",
      date: "Oct 20, 2026",
      account: "Operating · 4821",
      description: "Construction loan draw",
      amount: "+$40,000.00",
      status: "Pending review",
    };
    expect(getSourceFileName(item)).toBe("lender_draw_03_notice.pdf");
  });

  it("defaults to operating_statement_oct2026.pdf for general operating transactions", () => {
    const item = {
      id: "rq-1",
      date: "Oct 28, 2026",
      account: "Operating · 4821",
      description: "Nilson Mocalos",
      amount: "-$155.00",
      status: "Pending review",
    };
    expect(getSourceFileName(item)).toBe("operating_statement_oct2026.pdf");
  });
});

describe("Resolve Transaction Modal Craft Governance", () => {
  const modalPath = path.resolve(__dirname, "../../components/reconciliation/owner-resolution-modal.tsx");
  const modalContent = fs.readFileSync(modalPath, "utf-8");

  it("removes unnecessary action grid buttons and tag chips", () => {
    expect(modalContent).not.toContain("Request Invoice");
    expect(modalContent).not.toContain("Assign to budget");
    expect(modalContent).not.toContain("Draw deposit");
    expect(modalContent).not.toContain("Credit card payment");
    expect(modalContent).not.toContain("Exclude expense");
    expect(modalContent).not.toContain("ACTION_OPTIONS");
    expect(modalContent).not.toContain("+ Trade contractor");
    expect(modalContent).not.toContain("+ Change order");
    expect(modalContent).not.toContain("+ Materials");
  });

  it("provides 1 simple upload option with multiple file proof attachment", () => {
    expect(modalContent).toContain('type="file"');
    expect(modalContent).toContain("multiple");
    expect(modalContent).toContain("Proof &amp; Supporting Documents");
    expect(modalContent).toContain("Choose Files");
    expect(modalContent).toContain("handleFilesAdded");
    expect(modalContent).toContain("handleRemoveFile");
  });

  it("includes clean Note (optional) field and resolve buttons", () => {
    expect(modalContent).toContain("Note");
    expect(modalContent).not.toContain("Resolution Note");
    expect(modalContent).toContain("Resolve Transaction");
    expect(modalContent).toContain("Cancel");
  });

  it("displays document source origin and compared document context with view action", () => {
    expect(modalContent).toContain("getSourceFileName(item)");
    expect(modalContent).toContain("Source statement:");
    expect(modalContent).toContain("Document on file:");
    expect(modalContent).toContain("None on file");
    expect(modalContent).toContain("ExternalLink");
  });
});

