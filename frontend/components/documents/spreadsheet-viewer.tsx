"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Search,
  Download,
  AlertCircle,
  FileSpreadsheet,
  Loader2,
  ExternalLink,
  X,
} from "lucide-react";
import { ExtractionField } from "@/lib/types";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface SpreadsheetViewerProps {
  url: string;
  filename: string;
  documentType?: string;
  extractions?: ExtractionField[];
  documentId?: string;
  highlightText?: string | null;
  selectedFieldCitation?:
    | string
    | {
        sheet_name?: string;
        row_number?: number;
        page_number?: number;
        bounding_box?: number[];
      }
    | null;
  viewUrl?: string;
  downloadUrl?: string;
  actions?: React.ReactNode;
  trailingAction?: React.ReactNode;
}

interface CellMatch {
  field: ExtractionField;
  score: number;
  level: "high" | "medium" | "low";
  isLabel: boolean;
  isValue: boolean;
}

function cleanStr(val: any): string {
  if (val === null || val === undefined) return "";
  return String(val)
    .toLowerCase()
    .replace(/[\$,%\s\-_()]/g, "")
    .replace(/\.00$/, "")
    .trim();
}

function parseSheetCitation(citation: any): { sheetName?: string; rowNumber?: number } {
  if (!citation) return {};
  if (typeof citation === "object") {
    return {
      sheetName: citation.sheet_name?.trim(),
      rowNumber: citation.row_number,
    };
  }
  if (typeof citation === "string") {
    let sheetName: string | undefined;
    let rowNumber: number | undefined;
    const sheetMatch = citation.match(/Sheet:\s*([^,]+)/i);
    if (sheetMatch && sheetMatch[1]) sheetName = sheetMatch[1].trim();
    const rowMatch = citation.match(/Row\s*(\d+)/i);
    if (rowMatch && rowMatch[1]) rowNumber = parseInt(rowMatch[1], 10);
    return { sheetName, rowNumber };
  }
  return {};
}

function getConfidenceLevel(confidence: number): "high" | "medium" | "low" {
  const score = confidence > 1 ? confidence : confidence * 100;
  if (score >= 85) return "high";
  if (score >= 70) return "medium";
  return "low";
}

function getColumnLetter(colIdx: number): string {
  let letter = "";
  let temp = colIdx;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

export function SpreadsheetViewer({
  url,
  filename,
  documentType,
  extractions = [],
  documentId,
  highlightText,
  selectedFieldCitation,
  viewUrl,
  downloadUrl,
  actions,
  trailingAction,
}: SpreadsheetViewerProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const containerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>("");
  const [sheetData, setSheetData] = useState<any[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState<string>("");

  // Selected cell state
  const [selectedCell, setSelectedCell] = useState<{
    rowIdx: number;
    colIdx: number;
    value: string;
    match: CellMatch | null;
  } | null>(null);

  // In-cell editing state (triggered via double click)
  const [editingCell, setEditingCell] = useState<{
    rowIdx: number;
    colIdx: number;
    currentValue: string;
    originalValue: string;
    match: CellMatch | null;
  } | null>(null);

  // Cached workbook ref for offline sheet switching
  const workbookRef = useRef<any>(null);

  // Hover details popover state
  const [hoveredCell, setHoveredCell] = useState<{
    rowIdx: number;
    colIdx: number;
    match: CellMatch;
    value: string;
    pos: { top: number; left: number; placeAbove: boolean };
  } | null>(null);

  // Mutation for updating extraction value when edited
  const decideMutation = useMutation({
    mutationFn: ({
      fieldId,
      decision,
      normalizedValue,
      rationale,
    }: {
      fieldId: string;
      decision: "ACCEPT" | "EDIT" | "REJECT";
      normalizedValue?: string;
      rationale?: string;
    }) => api.documents.decideExtractionField(fieldId, decision, normalizedValue, rationale),
    onSuccess: (_, vars) => {
      if (documentId) {
        queryClient.invalidateQueries({ queryKey: ["document-extractions", documentId] });
        queryClient.invalidateQueries({ queryKey: ["document", documentId] });
        queryClient.invalidateQueries({ queryKey: ["documents"] });
      }
      toast({
        title: vars.decision === "ACCEPT" ? "Field Verified" : vars.decision === "EDIT" ? "Field Value Saved" : "Field Rejected",
        description: `Saved "${vars.normalizedValue || ""}" to project record.`,
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to persist field decision to server.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    let isCancelled = false;

    async function loadWorkbook() {
      try {
        setLoading(true);
        setError(null);

        let arrayBuffer: ArrayBuffer;
        try {
          const response = await fetch(url, { credentials: "include" });
          if (!response.ok) {
            throw new Error(`Failed to load file: ${response.statusText}`);
          }
          arrayBuffer = await response.arrayBuffer();
        } catch (fetchErr) {
          const sampleUrl = `/sample-docs/${encodeURIComponent(filename)}`;
          const fallbackRes = await fetch(sampleUrl);
          if (!fallbackRes.ok) throw fetchErr;
          arrayBuffer = await fallbackRes.arrayBuffer();
        }

        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        workbookRef.current = workbook;

        if (isCancelled) return;

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error("No worksheets found in this workbook.");
        }

        setSheetNames(workbook.SheetNames);

        // Auto-select sheet matching citation or first sheet with data
        let initialSheet = workbook.SheetNames[0];
        if (selectedFieldCitation) {
          let targetSheetName = "";
          if (typeof selectedFieldCitation === "string") {
            const match = selectedFieldCitation.match(/Sheet:\s*([^,]+)/i);
            if (match && match[1]) targetSheetName = match[1].trim();
          } else if (selectedFieldCitation.sheet_name) {
            targetSheetName = selectedFieldCitation.sheet_name.trim();
          }

          if (targetSheetName) {
            const found = workbook.SheetNames.find(
              (s: string) => s.toLowerCase() === targetSheetName.toLowerCase()
            );
            if (found) initialSheet = found;
          }
        }

        // If the first sheet has 0 non-empty rows, find first sheet with data
        const firstWs = workbook.Sheets[initialSheet];
        let initialJson = XLSX.utils.sheet_to_json(firstWs, { header: 1, defval: "" }) as any[][];
        if (initialJson.length <= 1) {
          for (const sName of workbook.SheetNames) {
            const ws = workbook.Sheets[sName];
            const candidateJson = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as any[][];
            if (candidateJson.some((r) => r.some((c) => String(c).trim() !== ""))) {
              initialSheet = sName;
              initialJson = candidateJson;
              break;
            }
          }
        }

        setActiveSheet(initialSheet);
        setSheetData(initialJson);
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.message || "Failed to parse spreadsheet file.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    if (url) {
      loadWorkbook();
    }

    return () => {
      isCancelled = true;
    };
  }, [url, filename, selectedFieldCitation]);

  // Handle switching tabs
  const handleSheetChange = async (sheetName: string) => {
    setActiveSheet(sheetName);
    setSelectedCell(null);
    setEditingCell(null);
    setHoveredCell(null);
    try {
      setLoading(true);
      let workbook = workbookRef.current;
      if (!workbook) {
        let arrayBuffer: ArrayBuffer;
        try {
          const response = await fetch(url, { credentials: "include" });
          arrayBuffer = await response.arrayBuffer();
        } catch {
          const sampleUrl = `/sample-docs/${encodeURIComponent(filename)}`;
          const fallbackRes = await fetch(sampleUrl);
          arrayBuffer = await fallbackRes.arrayBuffer();
        }
        workbook = XLSX.read(arrayBuffer, { type: "array" });
        workbookRef.current = workbook;
      }
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][];
      setSheetData(jsonData);
    } catch (err: any) {
      setError(err.message || "Failed to switch sheet.");
    } finally {
      setLoading(false);
    }
  };

  // Smart Matching Engine
  const cellMatchMap = useMemo(() => {
    const map = new Map<string, CellMatch>();
    if (!sheetData || sheetData.length === 0 || extractions.length === 0) return map;

    sheetData.forEach((row, rIdx) => {
      if (!row) return;
      row.forEach((cell, cIdx) => {
        if (cell === null || cell === undefined) return;
        const strVal = String(cell).trim();
        if (!strVal || strVal === "-") return;

        const cleaned = cleanStr(strVal);
        const rowNumber = rIdx + 1;

        // 1. Citation check on current sheet
        for (const field of extractions) {
          const cit = parseSheetCitation(field.citation);
          const sheetMatches =
            !cit.sheetName ||
            activeSheet.toLowerCase().includes(cit.sheetName.toLowerCase()) ||
            cit.sheetName.toLowerCase().includes(activeSheet.toLowerCase());

          if (sheetMatches && cit.rowNumber === rowNumber) {
            const rawCleaned = cleanStr(field.raw_value);
            const normCleaned = cleanStr(field.normalized_value);
            const nameCleaned = cleanStr(field.field_name);
            const score = field.confidence > 1 ? field.confidence : field.confidence * 100;
            const level = getConfidenceLevel(score);

            if (
              cleaned === rawCleaned ||
              cleaned === normCleaned ||
              rawCleaned.includes(cleaned) ||
              (cleaned.length >= 3 && rawCleaned.includes(cleaned))
            ) {
              map.set(`${rIdx}_${cIdx}`, { field, score, level, isLabel: false, isValue: true });
              return;
            }

            if (
              cleaned === nameCleaned ||
              field.field_name.toLowerCase().includes(strVal.toLowerCase()) ||
              strVal.toLowerCase().includes(field.field_name.toLowerCase())
            ) {
              map.set(`${rIdx}_${cIdx}`, { field, score, level, isLabel: true, isValue: false });
              return;
            }

            // Numeric content in cited row
            if (cleaned.length >= 2 && !isNaN(Number(cleaned))) {
              map.set(`${rIdx}_${cIdx}`, { field, score, level, isLabel: false, isValue: true });
              return;
            }
          }
        }

        // 2. Global numeric/value match
        if (cleaned.length >= 3 && !isNaN(Number(cleaned))) {
          for (const field of extractions) {
            const rawCleaned = cleanStr(field.raw_value);
            const normCleaned = cleanStr(field.normalized_value);
            if (
              (rawCleaned && cleaned === rawCleaned) ||
              (normCleaned && cleaned === normCleaned) ||
              (rawCleaned.length >= 4 && rawCleaned.includes(cleaned))
            ) {
              const score = field.confidence > 1 ? field.confidence : field.confidence * 100;
              map.set(`${rIdx}_${cIdx}`, {
                field,
                score,
                level: getConfidenceLevel(score),
                isLabel: false,
                isValue: true,
              });
              return;
            }
          }
        }

        // 3. Global label match
        if (strVal.length >= 4) {
          for (const field of extractions) {
            if (
              field.field_name.toLowerCase().includes(strVal.toLowerCase()) ||
              strVal.toLowerCase().includes(field.field_name.toLowerCase())
            ) {
              const score = field.confidence > 1 ? field.confidence : field.confidence * 100;
              map.set(`${rIdx}_${cIdx}`, {
                field,
                score,
                level: getConfidenceLevel(score),
                isLabel: true,
                isValue: false,
              });
              return;
            }
          }
        }
      });
    });

    return map;
  }, [sheetData, extractions, activeSheet]);

  // Confidence distribution on current sheet
  const currentSheetStats = useMemo(() => {
    let high = 0;
    let med = 0;
    let low = 0;
    const countedFields = new Set<string>();

    cellMatchMap.forEach((match) => {
      if (countedFields.has(match.field.id)) return;
      countedFields.add(match.field.id);
      if (match.level === "high") high++;
      else if (match.level === "medium") med++;
      else low++;
    });

    return { total: countedFields.size, high, med, low };
  }, [cellMatchMap]);

  // Handle cell click selection
  const handleSelectCell = (rowIdx: number, colIdx: number, cellVal: any) => {
    const match = cellMatchMap.get(`${rowIdx}_${colIdx}`) || null;
    const strVal = String(cellVal ?? "").trim();
    setSelectedCell({ rowIdx, colIdx, value: strVal, match });
  };

  // Start double-click inline edit
  const handleStartInlineEdit = (rowIdx: number, colIdx: number, cellVal: any) => {
    const match = cellMatchMap.get(`${rowIdx}_${colIdx}`) || null;
    const strVal = String(cellVal ?? "").trim();
    setEditingCell({
      rowIdx,
      colIdx,
      currentValue: strVal,
      originalValue: strVal,
      match,
    });
    setHoveredCell(null);
    setTimeout(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }, 20);
  };

  // Commit Cell Edit
  const handleCommitEdit = (newValue: string) => {
    if (!editingCell) return;

    const trimmed = newValue.trim();
    const prevValue = editingCell.originalValue;
    const target = editingCell;

    setEditingCell(null);

    if (trimmed === prevValue) return;

    // 1. Update the local spreadsheet matrix
    const updated = [...sheetData];
    if (updated[target.rowIdx]) {
      updated[target.rowIdx] = [...updated[target.rowIdx]];
      updated[target.rowIdx][target.colIdx] = trimmed;
      setSheetData(updated);
    }

    // 2. If this cell is tied to an ExtractionField, persist the edit to backend
    if (target.match) {
      decideMutation.mutate({
        fieldId: target.match.field.id,
        decision: "EDIT",
        normalizedValue: trimmed,
        rationale: "Edited directly via spreadsheet cell",
      });
    } else {
      toast({
        title: "Cell Updated",
        description: `Row ${target.rowIdx + 1}, Col ${target.colIdx + 1} updated to "${trimmed}"`,
        variant: "default",
      });
    }

    setSelectedCell({
      rowIdx: target.rowIdx,
      colIdx: target.colIdx,
      value: trimmed,
      match: target.match,
    });
  };

  // Handle cell hover to show details tooltip
  const handleCellMouseEnter = (
    e: React.MouseEvent<HTMLTableCellElement>,
    rowIdx: number,
    colIdx: number,
    cellValue: any,
    match: CellMatch | null
  ) => {
    if (!match || editingCell || !containerRef.current) {
      setHoveredCell(null);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const cellRect = e.currentTarget.getBoundingClientRect();

    // Position relative to container
    const relativeLeft = cellRect.left - containerRect.left + cellRect.width / 2;
    const relativeTop = cellRect.top - containerRect.top;

    // Popover width is ~260px. Clamp left position
    const clampedLeft = Math.max(140, Math.min(relativeLeft, containerRect.width - 140));

    // Show above if enough room, else below
    const placeAbove = relativeTop > 130;
    const topPos = placeAbove
      ? relativeTop - 8
      : relativeTop + cellRect.height + 8;

    setHoveredCell({
      rowIdx,
      colIdx,
      match,
      value: String(cellValue ?? "").trim(),
      pos: {
        top: topPos,
        left: clampedLeft,
        placeAbove,
      },
    });
  };

  const handleCellMouseLeave = () => {
    setHoveredCell(null);
  };

  // Filter rows based on search
  const filteredData = sheetData
    .filter((row) => row && row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== ""))
    .filter((row) => {
      if (!filterQuery) return true;
      return row.some((cell) =>
        String(cell || "")
          .toLowerCase()
          .includes(filterQuery.toLowerCase())
      );
    });

  // Calculate max column count for column header bar
  const maxColumns = useMemo(() => {
    if (!filteredData.length) return 0;
    return Math.max(...filteredData.slice(0, 150).map((r) => r.length), 0);
  }, [filteredData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[460px] bg-white text-slate-600">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-600 mb-3" />
        <p className="text-xs font-medium text-slate-700">Loading spreadsheet workbook...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6 text-center bg-white text-slate-600">
        <AlertCircle className="h-8 w-8 text-rose-500 mb-2" />
        <h4 className="text-sm font-bold text-slate-900">Workbook could not be parsed</h4>
        <p className="text-xs text-slate-500 max-w-sm mt-1">{error}</p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-xs"
        >
          <Download className="h-3.5 w-3.5" />
          Download original document
        </a>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative flex flex-col h-full w-full bg-white text-slate-900 overflow-hidden select-none">
      {/* Unified Single Spreadsheet Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 shrink-0 gap-3">
        {/* Left: Document info */}
        <div className="flex min-w-0 items-center gap-2.5 text-xs">
          <FileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-600" />
          <span className="truncate font-semibold text-slate-900" title={filename}>
            {filename}
          </span>
          {documentType && (
            <span className="rounded bg-slate-100 border border-slate-200/80 text-slate-600 text-[10px] font-mono px-2 py-0.5 font-medium shrink-0">
              {documentType.replace(/_/g, " ")}
            </span>
          )}
        </div>

        {/* Middle: Clean Confidence Summary */}
        {currentSheetStats.total > 0 && (
          <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-500 font-sans">
            <div className="flex items-center gap-1.5" title="High confidence extractions (≥85%)">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-slate-700">{currentSheetStats.high} Verified</span>
            </div>
            {currentSheetStats.med > 0 && (
              <div className="flex items-center gap-1.5" title="Medium confidence extractions (70-84%)">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="font-medium text-slate-700">{currentSheetStats.med} Review</span>
              </div>
            )}
            {currentSheetStats.low > 0 && (
              <div className="flex items-center gap-1.5" title="Low confidence (<70%)">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="font-medium text-rose-700">{currentSheetStats.low} Attention</span>
              </div>
            )}
          </div>
        )}

        {/* Right: Search & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search in sheet..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="h-7.5 w-36 sm:w-44 rounded-md border border-slate-200 bg-slate-50/50 pl-8 pr-7 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors"
            />
            {filterQuery && (
              <button
                type="button"
                onClick={() => setFilterQuery("")}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {actions}

          {(viewUrl || url) && (
            <a
              href={viewUrl || url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5 h-8 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              title="Open in new browser tab"
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Open in tab</span>
            </a>
          )}

          {(downloadUrl || url) && (
            <a
              href={downloadUrl || url}
              download={filename}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200/90 bg-slate-50 px-2.5 py-1.5 h-8 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              title="Download backup copy"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Save</span>
            </a>
          )}

          {trailingAction}
        </div>
      </header>

      {/* Main Grid View */}
      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="inline-block min-w-full align-middle bg-white">
          {filteredData.length > 0 ? (
            <table className="min-w-full border-collapse text-left text-xs">
              {/* Column Letters Header */}
              <thead>
                <tr className="bg-slate-100/90 text-slate-500 text-[10px] font-mono border-b border-slate-200 sticky top-0 z-20">
                  <th className="w-10 px-2 py-1 text-center border-r border-slate-200 font-semibold bg-slate-100">
                    #
                  </th>
                  {Array.from({ length: Math.min(maxColumns, 50) }).map((_, cIdx) => (
                    <th
                      key={cIdx}
                      className="px-3 py-1 font-semibold border-r border-slate-200 text-slate-500 text-center min-w-[90px] bg-slate-100"
                    >
                      {getColumnLetter(cIdx)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 150).map((row, rowIdx) => {
                  return (
                    <tr
                      key={rowIdx}
                      className="border-b border-slate-200/90 hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Row index indicator */}
                      <td className="w-10 px-2 py-1.5 text-center font-mono text-[10px] text-slate-400 border-r border-slate-200 select-none bg-slate-50/80 font-medium sticky left-0 z-10">
                        {rowIdx + 1}
                      </td>

                      {/* Columns */}
                      {row.map((cell: any, colIdx: number) => {
                        const strCell = String(cell ?? "").trim();
                        const match = cellMatchMap.get(`${rowIdx}_${colIdx}`) || null;
                        const isSelected = selectedCell?.rowIdx === rowIdx && selectedCell?.colIdx === colIdx;
                        const isEditingThis = editingCell?.rowIdx === rowIdx && editingCell?.colIdx === colIdx;

                        const isHighlighted =
                          highlightText &&
                          strCell &&
                          highlightText.toLowerCase().includes(strCell.toLowerCase()) &&
                          strCell.length > 2;

                        // Clean confidence background tints
                        let cellStyle = "bg-white text-slate-700";
                        let cornerColor = "";

                        if (match) {
                          if (match.level === "high") {
                            cellStyle = "bg-emerald-50/70 text-emerald-950 font-semibold hover:bg-emerald-100/60";
                            cornerColor = "bg-emerald-500";
                          } else if (match.level === "medium") {
                            cellStyle = "bg-amber-50/70 text-amber-950 font-semibold hover:bg-amber-100/60";
                            cornerColor = "bg-amber-500";
                          } else if (match.level === "low") {
                            cellStyle = "bg-rose-50/80 text-rose-950 font-semibold hover:bg-rose-100/60";
                            cornerColor = "bg-rose-500";
                          }
                        }

                        return (
                          <td
                            key={colIdx}
                            onClick={() => handleSelectCell(rowIdx, colIdx, cell)}
                            onDoubleClick={() => handleStartInlineEdit(rowIdx, colIdx, cell)}
                            onMouseEnter={(e) => handleCellMouseEnter(e, rowIdx, colIdx, cell, match)}
                            onMouseLeave={handleCellMouseLeave}
                            className={cn(
                              "px-3 py-1.5 border-r border-slate-200/80 whitespace-nowrap font-mono text-[11px] cursor-pointer relative select-text transition-colors",
                              cellStyle,
                              isHighlighted && "bg-amber-200 text-amber-950 font-bold border-amber-400",
                              isSelected && "ring-2 ring-emerald-600 ring-inset z-10 bg-emerald-50/30",
                              isEditingThis && "p-0.5 bg-white z-20"
                            )}
                          >
                            {/* Discreet Excel-style corner indicator for cells with extraction metadata */}
                            {cornerColor && !isEditingThis && (
                              <span
                                className={cn("absolute top-0 right-0 w-1.5 h-1.5 rounded-bl", cornerColor)}
                                aria-hidden="true"
                              />
                            )}

                            {isEditingThis ? (
                              <input
                                ref={editInputRef}
                                type="text"
                                value={editingCell.currentValue}
                                onChange={(e) =>
                                  setEditingCell({
                                    ...editingCell,
                                    currentValue: e.target.value,
                                  })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleCommitEdit(editingCell.currentValue);
                                  if (e.key === "Escape") setEditingCell(null);
                                }}
                                onBlur={() => handleCommitEdit(editingCell.currentValue)}
                                className="w-full h-full min-h-[26px] px-1.5 py-0.5 text-[11px] font-mono font-semibold text-slate-900 border-2 border-emerald-500 bg-white focus:outline-none rounded shadow-sm"
                              />
                            ) : (
                              <span className="truncate block">
                                {strCell || <span className="text-slate-300">-</span>}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : filterQuery ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              No matching cells found for &quot;{filterQuery}&quot;
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">
              Empty sheet
            </div>
          )}
        </div>
      </div>

      {/* Floating Hover Details Popover */}
      {hoveredCell && !editingCell && (
        <div
          className={cn(
            "absolute z-50 pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95",
            hoveredCell.pos.placeAbove ? "-translate-y-full -translate-x-1/2" : "-translate-x-1/2"
          )}
          style={{
            top: `${hoveredCell.pos.top}px`,
            left: `${hoveredCell.pos.left}px`,
            width: "270px",
          }}
        >
          <div className="bg-white/95 backdrop-blur-md text-slate-800 rounded-lg shadow-xl p-3 border border-slate-200/90 text-xs space-y-2">
            {/* Header: Field name & confidence pill */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-900 truncate text-[11px] capitalize">
                {hoveredCell.match.field.field_name.replace(/_/g, " ")}
              </span>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 border",
                  hoveredCell.match.level === "high"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : hoveredCell.match.level === "medium"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                )}
              >
                {hoveredCell.match.score}% Confidence
              </span>
            </div>

            {/* Extracted Value Display */}
            <div className="bg-slate-50 rounded px-2.5 py-1.5 font-mono text-[11px] text-slate-900 border border-slate-200 flex items-baseline justify-between gap-2">
              <span className="text-[10px] text-slate-500 font-sans">Value:</span>
              <span className="font-bold text-slate-900 truncate">
                {hoveredCell.value || "(empty)"}
              </span>
            </div>

            {/* Footer: Coordinate Citation & Quick Prompt */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
              <span className="truncate max-w-[140px]" title={`${activeSheet} (R${hoveredCell.rowIdx + 1}:C${hoveredCell.colIdx + 1})`}>
                R{hoveredCell.rowIdx + 1}:C{hoveredCell.colIdx + 1} • {activeSheet}
              </span>
              <span className="text-slate-600 font-medium flex items-center gap-1 shrink-0">
                Double-click to edit
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sheet Tab Bar */}
      {sheetNames.length > 0 && (
        <footer className="flex items-center gap-1 overflow-x-auto border-t border-slate-200 bg-slate-100 px-3 py-1.5 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2 shrink-0">
            Sheets ({sheetNames.length}):
          </span>
          {sheetNames.map((name) => {
            const isActive = name === activeSheet;
            return (
              <button
                key={name}
                type="button"
                onClick={() => handleSheetChange(name)}
                className={cn(
                  "px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer",
                  isActive
                    ? "bg-white text-emerald-800 shadow-2xs border border-slate-300 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                )}
              >
                {name}
              </button>
            );
          })}
        </footer>
      )}
    </div>
  );
}
