"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Table, Search, Download, AlertCircle, FileSpreadsheet, Loader2, Sparkles } from "lucide-react";

interface SpreadsheetViewerProps {
  url: string;
  filename: string;
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
}

export function SpreadsheetViewer({
  url,
  filename,
  highlightText,
  selectedFieldCitation,
}: SpreadsheetViewerProps) {
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>("");
  const [sheetData, setSheetData] = useState<any[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState<string>("");

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
          // If direct endpoint failed, check if it's one of the pre-existing sample documents
          const sampleUrl = `/sample-docs/${encodeURIComponent(filename)}`;
          const fallbackRes = await fetch(sampleUrl);
          if (!fallbackRes.ok) throw fetchErr;
          arrayBuffer = await fallbackRes.arrayBuffer();
        }

        const workbook = XLSX.read(arrayBuffer, { type: "array" });

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
            const found = workbook.SheetNames.find((s: string) => s.toLowerCase() === targetSheetName.toLowerCase());
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
  }, [url]);

  // Handle switching tabs
  const handleSheetChange = async (sheetName: string) => {
    setActiveSheet(sheetName);
    try {
      setLoading(true);
      const response = await fetch(url, { credentials: "include" });
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][];
      setSheetData(jsonData);
    } catch (err: any) {
      setError(err.message || "Failed to switch sheet.");
    } finally {
      setLoading(false);
    }
  };

  // Filter rows based on search and exclude completely blank rows
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] bg-slate-900 text-slate-300">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
        <p className="text-xs font-medium">Parsing Excel sheets and financial matrix...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6 text-center bg-slate-900 text-slate-300">
        <AlertCircle className="h-8 w-8 text-rose-500 mb-2" />
        <h4 className="text-sm font-bold text-white">Workbook could not be parsed</h4>
        <p className="text-xs text-slate-400 max-w-sm mt-1">{error}</p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
        >
          <Download className="h-3.5 w-3.5" />
          Download original document
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 overflow-hidden rounded-lg">
      {/* Top Sheet Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-3 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold text-white truncate max-w-[200px]" title={filename}>
            {filename}
          </span>
          <span className="rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono px-1.5 py-0.5 font-bold">
            Interactive Sheet
          </span>
        </div>

        {/* Quick Search in Sheet */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search in sheet..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="h-7.5 w-44 rounded-md border border-slate-700 bg-slate-900 pl-8 pr-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </a>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 overflow-auto bg-slate-900 p-2">
        <div className="inline-block min-w-full align-middle">
          {filteredData.length > 0 ? (
            <table className="min-w-full border-collapse text-left text-xs">
              <tbody>
                {filteredData.slice(0, 150).map((row, rowIdx) => {
                  const isHeaderRow = rowIdx === 0;
                  return (
                    <tr
                      key={rowIdx}
                      className={`border-b border-slate-800/80 hover:bg-slate-800/50 transition-colors ${
                        isHeaderRow ? "bg-slate-950 font-bold text-slate-300" : "text-slate-200"
                      }`}
                    >
                      {/* Row index indicator */}
                      <td className="w-10 px-2 py-1.5 text-center font-mono text-[10px] text-slate-500 border-r border-slate-800 select-none bg-slate-950/60">
                        {rowIdx + 1}
                      </td>

                      {/* Columns */}
                      {row.map((cell: any, colIdx: number) => {
                        const strCell = String(cell ?? "").trim();
                        const isHighlighted =
                          highlightText &&
                          strCell &&
                          highlightText.toLowerCase().includes(strCell.toLowerCase()) &&
                          strCell.length > 2;

                        return (
                          <td
                            key={colIdx}
                            className={`px-3 py-1.5 border-r border-slate-800/60 whitespace-nowrap font-mono text-[11px] ${
                              isHighlighted
                                ? "bg-amber-500/20 text-amber-300 font-bold border-amber-500/40"
                                : ""
                            }`}
                          >
                            {strCell || <span className="text-slate-700">-</span>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : filterQuery ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No matching cells found for &quot;{filterQuery}&quot;
            </div>
          ) : (
            <table className="min-w-full border-collapse text-left text-xs">
              <tbody>
                {sheetData.slice(0, 100).map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="border-b border-slate-800/80 hover:bg-slate-800/50 text-slate-200 text-xs"
                  >
                    <td className="w-10 px-2 py-1.5 text-center font-mono text-[10px] text-slate-500 border-r border-slate-800 select-none bg-slate-950/60">
                      {rowIdx + 1}
                    </td>
                    {row.map((cell: any, colIdx: number) => (
                      <td key={colIdx} className="px-3 py-1.5 border-r border-slate-800/60 whitespace-nowrap font-mono text-[11px]">
                        {String(cell ?? "").trim() || <span className="text-slate-700">-</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Bottom Sheet Tab Bar */}
      {sheetNames.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-800 bg-slate-950 px-3 py-1.5 shrink-0">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-2 shrink-0">
            Sheets ({sheetNames.length}):
          </span>
          {sheetNames.map((name) => {
            const isActive = name === activeSheet;
            return (
              <button
                key={name}
                type="button"
                onClick={() => handleSheetChange(name)}
                className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
