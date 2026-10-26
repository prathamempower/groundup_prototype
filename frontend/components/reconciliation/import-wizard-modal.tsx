"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/banner";
import { api } from "@/lib/api";
import { UploadCloud } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ImportWizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess: () => void;
}

function identifyColumns(headerLine: string): Record<string, string> {
  const headers: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < headerLine.length; index += 1) {
    const character = headerLine[index];
    if (character === '"' && headerLine[index + 1] === '"' && quoted) {
      current += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      headers.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }
  headers.push(current.trim());
  const normalizedHeaders = headers.map((header) => header.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const find = (matches: (header: string) => boolean) =>
    headers[normalizedHeaders.findIndex(matches)];
  const date = find((header) => header === "date" || header.includes("transactiondate"));
  const amount = find((header) => header === "amount" || header.includes("transactionamount"));
  const description = find((header) =>
    ["description", "payee", "counterparty", "vendor"].some((word) => header.includes(word))
  );

  if (!date || !amount || !description) {
    throw new Error("The CSV must include Date, Amount, and Description (or Payee) columns.");
  }

  const mapping: Record<string, string> = {
    Date: date,
    Amount: amount,
    Description: description,
  };
  const externalId = find((header) => header.includes("externalid") || header.includes("transactionid") || header === "reference");
  const direction = find((header) => header === "direction" || header === "type");
  if (externalId) mapping.ExternalId = externalId;
  if (direction) mapping.Direction = direction;
  return mapping;
}

export function ImportWizardModal({
  open,
  onOpenChange,
  projectId,
  onSuccess,
}: ImportWizardModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [accountId, setAccountId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const accounts = useQuery({
    queryKey: ["financial-accounts"],
    queryFn: () => api.spend.getFinancialAccounts(),
    enabled: open,
  });

  const handleImport = async () => {
    if (!file) {
      setErrorMessage("Choose a CSV file before continuing.");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErrorMessage("Upload a CSV export. Other file formats are not supported here.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const rawContent = await file.text();
      const firstLine = rawContent.split(/\r?\n/, 1)[0] ?? "";
      const columnMapping = identifyColumns(firstLine);
      await api.spend.createImportBatch(projectId, {
        adapter: "CSV",
        version: "v1",
        raw_content: rawContent,
        column_mapping: columnMapping,
        ...(accountId ? { financial_account_id: accountId } : {}),
      });
      onSuccess();
      onOpenChange(false);
      setFile(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "We could not import this CSV. Check the file and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent maxWidth="xl">
        <ModalHeader>
          <ModalTitle>Import Bank Transactions</ModalTitle>
          <ModalDescription>
            Upload a bank statement CSV to add transactions to your review queue.
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-5 py-3">
          {errorMessage && <Banner variant="danger" title="Import not completed" message={errorMessage} />}
          <div>
            <label htmlFor="statement-csv" className="mb-2 block text-sm font-medium text-text-primary">
              Statement file
            </label>
            <input
              id="statement-csv"
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setErrorMessage("");
              }}
              className="block w-full rounded-md border border-border bg-surface p-2 text-sm text-text-primary file:mr-3 file:rounded file:border-0 file:bg-subtle file:px-3 file:py-1.5 file:text-sm file:font-medium"
            />
            <p className="mt-1.5 text-xs text-text-secondary">
              Required columns: Date, Amount, and Description or Payee. Amounts are read as currency values.
            </p>
          </div>

          <div>
            <label htmlFor="statement-account" className="mb-2 block text-sm font-medium text-text-primary">
              Financial account
            </label>
            <Select
              value={accountId || "NONE"}
              onValueChange={(val) => setAccountId(val === "NONE" ? "" : val)}
              disabled={accounts.isLoading}
            >
              <SelectTrigger id="statement-account" className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary">
                <SelectValue placeholder="Leave unlinked for review" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Leave unlinked for review</SelectItem>
                {(accounts.data?.data ?? []).filter((account) => account.status === "ACTIVE").map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.institution} {account.masked_identifier}: {account.account_purpose}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {accounts.error && (
              <p role="alert" className="mt-1.5 text-xs text-danger">
                Financial accounts could not be loaded. You may still import without linking one.
              </p>
            )}
          </div>

          {file && (
            <div className="flex items-center gap-2 rounded-md border border-border bg-subtle/50 p-3 text-sm text-text-secondary">
              <UploadCloud className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="truncate">{file.name}</span>
              <span className="ml-auto shrink-0">{Math.ceil(file.size / 1024)} KB</span>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleImport} loading={isSubmitting} disabled={accounts.isLoading}>
              Import Transactions
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
