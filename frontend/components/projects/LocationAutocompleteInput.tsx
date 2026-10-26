"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, X } from "lucide-react";

interface LocationResult {
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface LocationAutocompleteInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSelectLocation?: (location: LocationResult) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function LocationAutocompleteInput({
  id = "input-project-address",
  value,
  onChange,
  onSelectLocation,
  placeholder = "e.g. 73 Broadway, Jersey City, NJ 07306",
  className = "",
  autoFocus = false,
}: LocationAutocompleteInputProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize internal query with external value if changed externally
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (!isOpen || query.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/locations/autocomplete?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data?.results) ? data.results : [];
          setSuggestions(items);
          setSelectedIndex(-1);
        } else {
          setSuggestions([]);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    if (val.trim().length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setSuggestions([]);
    }
  };

  const handleSelect = (item: LocationResult) => {
    setQuery(item.label);
    onChange(item.label);
    if (onSelectLocation) {
      onSelectLocation(item);
    }
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "ArrowDown" && query.trim().length >= 2) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    onChange("");
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          autoFocus={autoFocus}
          autoComplete="off"
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim().length >= 2 && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={
            className ||
            "w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition"
          }
        />

        {/* Right side loader or clear button */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />}
          {!isLoading && query && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full transition cursor-pointer"
              title="Clear address"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Apple-Grade Technical Blueprint Autocomplete Dropdown */}
      {isOpen && !isLoading && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white/98 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08),0_12px_36px_-4px_rgba(15,23,42,0.12)] overflow-hidden animate-in fade-in zoom-in-95 duration-150 ease-out p-1.5">
          <ul className="max-h-56 overflow-y-auto space-y-0.5 p-0.5">
            {suggestions.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <li
                  key={`${item.label}-${idx}`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => handleSelect(item)}
                  className={`px-2.5 py-2 cursor-pointer flex items-center gap-2.5 rounded-lg transition-colors text-left ${
                    isSelected
                      ? "bg-blue-50/80 text-blue-900 font-semibold border border-blue-200/60"
                      : "hover:bg-slate-100/80 text-slate-700"
                  }`}
                >
                  <MapPin
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? "text-blue-600" : "text-slate-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-slate-900 truncate block">
                      {item.street || item.label}
                    </span>
                    {(item.city || item.state) && (
                      <span className={`text-[11px] truncate block ${isSelected ? "text-blue-700/80 font-mono" : "text-slate-500"}`}>
                        {[item.city, item.state, item.zip].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
