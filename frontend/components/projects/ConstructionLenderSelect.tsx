"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { Landmark, Search, Check, ChevronDown, X, PlusCircle, Loader2 } from "lucide-react";

export interface ConstructionLenderSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

interface BankItem {
  id: string;
  name: string;
  city?: string;
  state?: string;
}

// Fallback curated list of major US construction and commercial banks
const DEFAULT_TOP_BANKS: BankItem[] = [
  { id: "jpmorgan", name: "JPMorgan Chase Bank", city: "Columbus", state: "OH" },
  { id: "bofa", name: "Bank of America", city: "Charlotte", state: "NC" },
  { id: "wells", name: "Wells Fargo Bank", city: "Sioux Falls", state: "SD" },
  { id: "usbank", name: "U.S. Bank National Association", city: "Cincinnati", state: "OH" },
  { id: "pnc", name: "PNC Bank", city: "Wilmington", state: "DE" },
  { id: "truist", name: "Truist Bank", city: "Charlotte", state: "NC" },
  { id: "columbia", name: "Columbia Bank", city: "Fair Lawn", state: "NJ" },
  { id: "fifththird", name: "Fifth Third Bank", city: "Cincinnati", state: "OH" },
  { id: "huntington", name: "The Huntington National Bank", city: "Columbus", state: "OH" },
  { id: "keybank", name: "KeyBank", city: "Cleveland", state: "OH" },
  { id: "citizens", name: "Citizens Bank", city: "Providence", state: "RI" },
  { id: "regions", name: "Regions Bank", city: "Birmingham", state: "AL" },
  { id: "mtb", name: "M&T Bank", city: "Buffalo", state: "NY" },
  { id: "westernalliance", name: "Western Alliance Bank", city: "Phoenix", state: "AZ" },
  { id: "firstcitizens", name: "First Citizens Bank & Trust", city: "Raleigh", state: "NC" },
  { id: "comerica", name: "Comerica Bank", city: "Dallas", state: "TX" },
  { id: "zions", name: "Zions Bancorporation", city: "Salt Lake City", state: "UT" },
  { id: "flagstar", name: "Flagstar Bank", city: "Hicksville", state: "NY" },
  { id: "frost", name: "Frost Bank", city: "San Antonio", state: "TX" },
  { id: "bmo", name: "BMO Bank National Association", city: "Chicago", state: "IL" },
];

export function ConstructionLenderSelect({
  value,
  onChange,
  placeholder = "Search or select US bank / construction lender...",
  className = "",
  id = "input-lender-name",
}: ConstructionLenderSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [banks, setBanks] = useState<BankItem[]>(DEFAULT_TOP_BANKS);
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customLenderName, setCustomLenderName] = useState("");
  const [, startTransition] = useTransition();

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync if value is already a custom name not in list
  useEffect(() => {
    if (value && !DEFAULT_TOP_BANKS.some((b) => b.name.toLowerCase() === value.toLowerCase())) {
      setCustomLenderName(value);
    }
  }, [value]);

  // Query FDIC BankFind API with 250ms debounce
  useEffect(() => {
    if (!isOpen) return;

    const trimmed = query.trim();
    if (!trimmed) {
      setBanks(DEFAULT_TOP_BANKS);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        // Official FDIC BankFind Public API
        const safeQuery = encodeURIComponent(trimmed.replace(/[^\w\s]/g, ""));
        const url = `https://api.fdic.gov/banks/institutions?filters=ACTIVE:1%20AND%20NAME:%2A${safeQuery}%2A&fields=NAME,CITY,STNAME,ASSET&sort_by=ASSET&sort_order=DESC&limit=25`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error("FDIC fetch failed");
        const json = await res.json();

        if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: BankItem[] = json.data.map((item: any, idx: number) => ({
            id: item.data?.ID || `fdic-${idx}`,
            name: item.data?.NAME || "Unknown Bank",
            city: item.data?.CITY,
            state: item.data?.STNAME,
          }));
          startTransition(() => {
            setBanks(mapped);
          });
        } else {
          // If no FDIC exact results, filter fallback list or show empty
          const fallbackMatches = DEFAULT_TOP_BANKS.filter((b) =>
            b.name.toLowerCase().includes(trimmed.toLowerCase())
          );
          startTransition(() => {
            setBanks(fallbackMatches);
          });
        }
      } catch {
        // Fallback to local filter
        const fallbackMatches = DEFAULT_TOP_BANKS.filter((b) =>
          b.name.toLowerCase().includes(trimmed.toLowerCase())
        );
        startTransition(() => {
          setBanks(fallbackMatches);
        });
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSelectBank = (bankName: string) => {
    onChange(bankName);
    setIsCustomMode(false);
    setIsOpen(false);
    setQuery("");
  };

  const handleEnableCustomMode = (initialName: string = "") => {
    setIsCustomMode(true);
    setCustomLenderName(initialName || query || "");
    if (initialName || query) {
      onChange(initialName || query);
    }
    setIsOpen(false);
    setTimeout(() => {
      customInputRef.current?.focus();
    }, 50);
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomLenderName(val);
    onChange(val);
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setCustomLenderName("");
    setIsCustomMode(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* If in custom input mode */}
      {isCustomMode ? (
        <div className="space-y-1.5 animate-in fade-in duration-150">
          <div className="relative">
            <Landmark className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={customInputRef}
              id={id}
              type="text"
              value={customLenderName}
              onChange={handleCustomInputChange}
              placeholder="Enter custom bank or lender name..."
              className="w-full pl-9 pr-24 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition font-medium"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {customLenderName && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomLenderName("");
                    onChange("");
                    customInputRef.current?.focus();
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded transition"
                  title="Clear"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsCustomMode(false);
                  setIsOpen(true);
                }}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Browse list
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Custom or unlisted construction lender</span>
            <button
              type="button"
              onClick={() => {
                setIsCustomMode(false);
                setIsOpen(true);
              }}
              className="text-slate-700 underline font-medium hover:text-slate-900 cursor-pointer"
            >
              Choose from US Bank directory
            </button>
          </p>
        </div>
      ) : (
        /* Standard Selector Button with Search Dropdown */
        <div>
          <button
            type="button"
            id={id}
            onClick={() => {
              setIsOpen((prev) => !prev);
              setTimeout(() => {
                searchInputRef.current?.focus();
              }, 50);
            }}
            className={`w-full flex items-center justify-between pl-9 pr-3.5 py-2.5 bg-white border rounded-xl text-xs transition cursor-pointer text-left relative ${
              isOpen
                ? "border-slate-900 ring-2 ring-slate-900/10"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <span className={`truncate ${value ? "text-slate-900 font-semibold" : "text-slate-400"}`}>
              {value || placeholder}
            </span>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {value && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClearSelection}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
                  title="Clear selection"
                >
                  <X className="w-3 h-3" />
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </div>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white/98 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08),0_12px_36px_-4px_rgba(15,23,42,0.12)] overflow-hidden animate-in fade-in zoom-in-95 duration-150 ease-out p-1.5">
              {/* Search Header */}
              <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 mb-1">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search all FDIC insured American banks..."
                    className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition"
                  />
                  {isLoading && (
                    <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
                  )}
                  {query && !isLoading && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Bank List */}
              <div className="max-h-56 overflow-y-auto space-y-0.5 p-0.5">
                {banks.length > 0 ? (
                  banks.map((b) => {
                    const isSelected = value?.toLowerCase() === b.name.toLowerCase();
                    return (
                      <button
                        key={`${b.id}-${b.name}`}
                        type="button"
                        onClick={() => handleSelectBank(b.name)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 text-left rounded-lg transition-colors cursor-pointer text-xs ${
                          isSelected
                            ? "bg-blue-50/80 text-blue-900 font-semibold border border-blue-200/60"
                            : "hover:bg-slate-100/80 text-slate-800"
                        }`}
                      >
                        <div className="truncate pr-2">
                          <span className="block truncate font-medium">{b.name}</span>
                          {(b.city || b.state) && (
                            <span
                              className={`text-[10px] block truncate font-mono ${
                                isSelected ? "text-blue-700/80" : "text-slate-400"
                              }`}
                            >
                              {[b.city, b.state].filter(Boolean).join(", ")}
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-blue-600 stroke-[2.5]" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="p-3 text-center text-xs text-slate-500 font-medium">
                    No matching banks found in FDIC directory.
                  </div>
                )}

                {/* If user typed a query that is not in the list, offer quick-add */}
                {query.trim().length > 1 && !banks.some((b) => b.name.toLowerCase() === query.trim().toLowerCase()) && (
                  <button
                    type="button"
                    onClick={() => handleSelectBank(query.trim())}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer bg-slate-50/50"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span className="truncate">
                      Use <strong className="font-semibold">&quot;{query.trim()}&quot;</strong> as lender
                    </span>
                  </button>
                )}
              </div>

              {/* Dedicated "Other / Unlisted Bank" section */}
              <div className="p-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleEnableCustomMode(query)}
                  className="w-full py-2 px-3 flex items-center justify-center gap-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100/80 text-xs font-semibold text-slate-800 transition cursor-pointer shadow-2xs"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-slate-600" />
                  <span>Other / Unlisted Bank (Enter manually)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
