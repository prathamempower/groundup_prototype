"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Checkbox } from "./checkbox";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  searchPlaceholder?: string;
  searchFilterKey?: keyof T;
  compact?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  bulkActions?: React.ReactNode;
  pinnedTotals?: {
    label: string;
    basis: string;
    values: Record<string, React.ReactNode>;
  };
  onRowClick?: (item: T) => void;
  activeRowId?: string;
  emptyState?: React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  searchPlaceholder = "Search records...",
  searchFilterKey,
  compact = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  bulkActions,
  pinnedTotals,
  onRowClick,
  activeRowId,
  emptyState,
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortColumnId, setSortColumnId] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(25);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  // Search filter
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data;
    const q = searchQuery.toLowerCase();
    return data.filter((item) => {
      if (searchFilterKey) {
        const val = item[searchFilterKey];
        return String(val || "").toLowerCase().includes(q);
      }
      return Object.values(item as Record<string, unknown>).some((val) =>
        String(val || "").toLowerCase().includes(q)
      );
    });
  }, [data, searchQuery, searchFilterKey]);

  // Sorting
  const sortedData = React.useMemo(() => {
    if (!sortColumnId) return filteredData;
    const col = columns.find((c) => c.id === sortColumnId);
    if (!col || !col.accessorKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[col.accessorKey!];
      const bVal = b[col.accessorKey!];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === "asc"
        ? String(aVal || "").localeCompare(String(bVal || ""))
        : String(bVal || "").localeCompare(String(aVal || ""));
    });
  }, [filteredData, sortColumnId, sortDirection, columns]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const handleSort = (colId: string) => {
    if (sortColumnId === colId) {
      if (sortDirection === "asc") setSortDirection("desc");
      else {
        setSortColumnId(null);
        setSortDirection("asc");
      }
    } else {
      setSortColumnId(colId);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange(paginatedData.map(keyExtractor));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((item) => item !== id));
    }
  };

  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedIds.includes(keyExtractor(item)));

  return (
    <div className={cn("space-y-3", className)}>
      {/* Table Toolbar / Search / Filters / Bulk Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full rounded-md border border-border bg-surface pl-9 pr-8 py-1.5 text-body text-text-primary placeholder:text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-text-muted hover:text-text-primary"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Bulk Actions Indicator */}
        {selectable && selectedIds.length > 0 && (
          <div className="flex items-center gap-2 rounded-md bg-primary-subtle px-3 py-1 text-caption font-medium text-primary">
            <span>{selectedIds.length} selected</span>
            {bulkActions}
          </div>
        )}
      </div>

      {/* Main Table Container */}
      <div className="rounded-lg border border-border bg-surface shadow-xs overflow-x-auto">
        <table className="w-full text-left text-body border-collapse">
          <thead className="sticky top-0 z-10 border-b border-border bg-subtle/80 backdrop-blur-xs text-caption font-semibold text-text-secondary">
            <tr>
              {selectable && (
                <th className="w-10 px-3.5 py-3">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={(c) => handleSelectAll(!!c)}
                    aria-label="Select all rows on page"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.id}
                  style={{ width: col.width }}
                  className={cn(
                    "px-3.5 py-3 select-none text-[12px] font-semibold text-text-secondary uppercase tracking-wider",
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                      ? "text-center"
                      : "text-left",
                    col.sortable && "cursor-pointer hover:text-text-primary transition-colors"
                  )}
                  onClick={() => col.sortable && handleSort(col.id)}
                >
                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5",
                      col.align === "right" && "justify-end"
                    )}
                  >
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-text-muted">
                        {sortColumnId === col.id ? (
                          sortDirection === "asc" ? (
                            <ChevronUp className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-primary" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-60" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border/70">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-12 text-center text-body text-text-secondary"
                >
                  {emptyState || "No matching records found."}
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => {
                const rowId = keyExtractor(item);
                const isSelected = selectedIds.includes(rowId);
                const isActive = activeRowId === rowId;

                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={cn(
                      "transition-all duration-150",
                      compact ? "h-9" : "h-11",
                      onRowClick && "cursor-pointer",
                      isActive
                        ? "bg-primary-subtle text-text-primary font-medium"
                        : isSelected
                        ? "bg-primary-subtle/40"
                        : "hover:bg-subtle/60"
                    )}
                  >
                    {selectable && (
                      <td
                        className="px-3.5 py-2.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(c) => handleSelectRow(rowId, !!c)}
                          aria-label={`Select row ${rowId}`}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.id}
                        className={cn(
                          "px-3.5 py-2.5 text-body",
                          col.align === "right"
                            ? "text-right tabular-nums font-mono text-[13px]"
                            : col.align === "center"
                            ? "text-center"
                            : "text-left"
                        )}
                      >
                        {col.cell
                          ? col.cell(item)
                          : col.accessorKey
                          ? String(item[col.accessorKey] ?? "")
                          : null}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Pinned Totals Row */}
          {pinnedTotals && paginatedData.length > 0 && (
            <tfoot className="border-t-2 border-border-strong bg-subtle/80 font-semibold text-text-primary">
              <tr>
                {selectable && <td className="px-3 py-2.5" />}
                {columns.map((col, idx) => {
                  const totalVal = pinnedTotals.values[col.id];
                  return (
                    <td
                      key={col.id}
                      className={cn(
                        "px-3 py-2.5 text-body",
                        col.align === "right" ? "text-right tabular-nums" : "text-left"
                      )}
                    >
                      {idx === 0 ? (
                        <div>
                          <span>{pinnedTotals.label}</span>
                          <span className="block text-[11px] font-normal text-text-muted">
                            Basis: {pinnedTotals.basis}
                          </span>
                        </div>
                      ) : (
                        totalVal || null
                      )}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination Bar */}
      {sortedData.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-caption text-text-secondary px-1">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded border border-border bg-surface px-2 py-1 text-caption text-text-primary focus-visible:outline-primary"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-text-muted">
              Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
              {Math.min(currentPage * rowsPerPage, sortedData.length)} of{" "}
              {sortedData.length} records
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded border border-border bg-surface text-text-primary hover:bg-subtle disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-medium text-text-primary">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded border border-border bg-surface text-text-primary hover:bg-subtle disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
