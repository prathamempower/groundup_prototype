"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ContractModel, LifecycleStage } from "@/lib/types";
import {
  Building2,
  FolderPlus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Layers,
  AlertCircle,
  Landmark,
  Users,
  FileCheck,
  CopyCheck,
  Check,
  CheckCircle2,
  MapPin,
  UploadCloud,
  FileText,
  X,
  Loader2,
  Briefcase,
  HardHat,
  FileUp,
  Shield,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/brand-logo";
import { GroundUpMark } from "@/components/brand/GroundUpBrand";

// High-frequency US real estate market postal lookup dictionary
const KNOWN_ZIPS: Record<string, { city: string; state: string; county?: string }> = {
  // New Jersey
  "07302": { city: "Jersey City", state: "NJ", county: "Hudson County" },
  "07304": { city: "Jersey City", state: "NJ", county: "Hudson County" },
  "07305": { city: "Jersey City", state: "NJ", county: "Hudson County" },
  "07306": { city: "Jersey City", state: "NJ", county: "Hudson County" },
  "07307": { city: "Jersey City", state: "NJ", county: "Hudson County" },
  "07030": { city: "Hoboken", state: "NJ", county: "Hudson County" },
  "07102": { city: "Newark", state: "NJ", county: "Essex County" },
  "08701": { city: "Lakewood", state: "NJ", county: "Ocean County" },
  // New York
  "10001": { city: "New York", state: "NY", county: "New York County" },
  "10011": { city: "New York", state: "NY", county: "New York County" },
  "11201": { city: "Brooklyn", state: "NY", county: "Kings County" },
  "11211": { city: "Brooklyn", state: "NY", county: "Kings County" },
  "11101": { city: "Long Island City", state: "NY", county: "Queens County" },
  // Florida
  "33101": { city: "Miami", state: "FL", county: "Miami-Dade County" },
  "33139": { city: "Miami Beach", state: "FL", county: "Miami-Dade County" },
  // California
  "90001": { city: "Los Angeles", state: "CA", county: "Los Angeles County" },
  "90210": { city: "Beverly Hills", state: "CA", county: "Los Angeles County" },
  "94102": { city: "San Francisco", state: "CA", county: "San Francisco County" },
  // Texas
  "75201": { city: "Dallas", state: "TX", county: "Dallas County" },
  "77002": { city: "Houston", state: "TX", county: "Harris County" },
  "78701": { city: "Austin", state: "TX", county: "Travis County" },
};

const US_STATES = [
  { code: "NJ", name: "New Jersey" },
  { code: "NY", name: "New York" },
  { code: "CA", name: "California" },
  { code: "FL", name: "Florida" },
  { code: "TX", name: "Texas" },
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NM", name: "New Mexico" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" },
];

export default function CreateProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isFirstRun =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("firstRun") === "1"
      : false;

  // Stages 0 to 6
  const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);
  const [stage1Step, setStage1Step] = useState<1 | 2 | 3>(1);
  const [errorMessage, setErrorMessage] = useState("");

  // Duplicate Check Modal State
  const [duplicateMatches, setDuplicateMatches] = useState<
    Array<{ id: string; name: string; address: string; project_entity: string; similarity_reason: string }>
  >([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // Form State: Stage 1 (Identity & Granular Location)
  const [name, setName] = useState("");
  const [projectEntity, setProjectEntity] = useState("");
  const [address, setAddress] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [unitSuite, setUnitSuite] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState("NJ");
  const [country, setCountry] = useState("United States");
  const [zipStatus, setZipStatus] = useState<"idle" | "loading" | "valid" | "unrecognized">("idle");
  const [zipMessage, setZipMessage] = useState("");

  const [lifecycleStage, setLifecycleStage] = useState<LifecycleStage>("PRE_CONSTRUCTION");
  const [projectType, setProjectType] = useState("MULTIFAMILY");
  const [startedAt, setStartedAt] = useState("");
  const [targetCompletionAt, setTargetCompletionAt] = useState("");

  // Stage 2 (Acquisition & Debt)
  const [isAcquired, setIsAcquired] = useState<"true" | "false">("true");
  const [acquisitionFunding, setAcquisitionFunding] = useState("ACQUISITION_LOAN");
  const [hasConstructionLoan, setHasConstructionLoan] = useState<"true" | "false">("true");
  const [lenderName, setLenderName] = useState("");

  // Stage 3 (Contract & Operating)
  const [contractModel, setContractModel] = useState<ContractModel>("FIXED");
  const [hybridCustomDetails, setHybridCustomDetails] = useState("");
  const [operatingAccountModel, setOperatingAccountModel] = useState<"DEDICATED" | "SHARED">("DEDICATED");

  // Stage 4 (Delegation Invites)
  const [cfoEmail, setCfoEmail] = useState("");
  const [pmEmail, setPmEmail] = useState("");
  const [gcEmail, setGcEmail] = useState("");

  // Stage 5 (Source Documents Attachments)
  const [uploadedFiles, setUploadedFiles] = useState<{
    deed?: File;
    gcContract?: File;
    loanAgreement?: File;
    permitSet?: File;
  }>({});

  // Helper to sync granular address inputs into unified address string
  const updateAddressString = (
    st: string,
    unit: string,
    c: string,
    s: string,
    z: string,
    cName: string
  ) => {
    const parts: string[] = [];
    const line1 = [st.trim(), unit.trim()].filter(Boolean).join(", ");
    if (line1) parts.push(line1);
    if (c.trim()) parts.push(c.trim());
    if (s.trim() || z.trim()) {
      parts.push([s.trim(), z.trim()].filter(Boolean).join(" "));
    }
    if (cName.trim() && cName !== "United States") {
      parts.push(cName.trim());
    }
    const full = parts.join(", ");
    setAddress(full);
    return full;
  };

  // Smart ZIP code postal resolution
  const handleZipCodeChange = async (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 5);
    setZipCode(cleaned);

    if (cleaned.length < 5) {
      setZipStatus("idle");
      setZipMessage("");
      updateAddressString(streetAddress, unitSuite, city, stateCode, cleaned, country);
      return;
    }

    // 1. Instant check against high-frequency real estate markets
    if (KNOWN_ZIPS[cleaned]) {
      const match = KNOWN_ZIPS[cleaned];
      setCity(match.city);
      setStateCode(match.state);
      setCountry("United States");
      setZipStatus("valid");
      setZipMessage(`${match.city}, ${match.state}${match.county ? ` (${match.county})` : ""}`);
      updateAddressString(streetAddress, unitSuite, match.city, match.state, cleaned, "United States");
      return;
    }

    // 2. Fallback to postal API
    setZipStatus("loading");
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 2000);
      const res = await fetch(`https://api.zippopotam.us/us/${cleaned}`, { signal: ctrl.signal });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        const place = data.places?.[0];
        if (place) {
          const detectedCity = place["place name"];
          const detectedState = place["state abbreviation"];
          setCity(detectedCity);
          setStateCode(detectedState);
          setCountry("United States");
          setZipStatus("valid");
          setZipMessage(`${detectedCity}, ${detectedState}`);
          updateAddressString(streetAddress, unitSuite, detectedCity, detectedState, cleaned, "United States");
          return;
        }
      }
      setZipStatus("unrecognized");
      setZipMessage("Unrecognized ZIP code. Please enter city and state manually.");
      updateAddressString(streetAddress, unitSuite, city, stateCode, cleaned, country);
    } catch {
      setZipStatus("unrecognized");
      setZipMessage("Unrecognized ZIP code. Please enter city and state manually.");
      updateAddressString(streetAddress, unitSuite, city, stateCode, cleaned, country);
    }
  };

  useEffect(() => {
    if (isFirstRun && typeof window !== "undefined") {
      window.sessionStorage.removeItem("groundup_signup_completed");
    }
  }, [isFirstRun]);

  const duplicateCheckMutation = useMutation({
    mutationFn: () =>
      api.projects.checkDuplicates({
        name,
        address,
        project_entity: projectEntity,
      }),
    onSuccess: (res) => {
      if (res.data && res.data.has_matches && res.data.matches.length > 0) {
        setDuplicateMatches(res.data.matches);
        setShowDuplicateModal(true);
      } else {
        setStage(2);
      }
    },
    onError: () => {
      setStage(2);
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.projects.create({
        name,
        project_entity: projectEntity || `${name} LLC`,
        address,
        lifecycle_stage: lifecycleStage,
        contract_model: contractModel,
        status: "SETUP_INCOMPLETE",
        currency: "USD",
        is_user_created: true,
        ...(startedAt ? { started_at: new Date(startedAt).toISOString() } : {}),
        ...(targetCompletionAt
          ? { target_completion_at: new Date(targetCompletionAt).toISOString() }
          : {}),
      }),
    onSuccess: (res) => {
      localStorage.setItem("groundup_active_project_id", res.data.id);
      queryClient.invalidateQueries();
      router.push(`/projects/${res.data.id}/control-center`);
    },
    onError: (err: Error) => {
      setErrorMessage(err.message || "Failed to create project.");
    },
  });

  const stagesList = [
    { num: 0, title: "Welcome & Choice" },
    { num: 1, title: "Identity & Structure" },
    { num: 2, title: "Acquisition & Debt" },
    { num: 3, title: "Contract & Operating" },
    { num: 4, title: "Team & Delegation" },
    { num: 5, title: "Source Documents" },
    { num: 6, title: "Review & Launch" },
  ];

  return (
    <div className="min-h-screen bg-[#F2F4F7] flex flex-col font-sans">
      {/* Full-time Sticky Top Header Above Onboarding Page */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <BrandLogo href="/projects" size="lg" className="hover:opacity-95 transition-opacity" />
          <button
            type="button"
            onClick={() => router.push("/projects")}
            className="inline-flex items-center text-xs font-semibold text-slate-700 hover:text-slate-950 py-1.5 sm:py-2 px-3 sm:px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Exit Setup
          </button>
        </div>
      </header>

      {/* Main Centered Onboarding Stage */}
      <div className="flex-1 flex flex-col justify-center items-center py-4 sm:py-8 px-3 sm:px-6">
        {/* Light Untitled-UI Style Raised Modal Container */}
        <div className="w-full max-w-5xl rounded-2xl sm:rounded-[32px] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)] border border-slate-200/80 overflow-hidden flex flex-col">
          {/* Mobile Step Progress Line (< lg screens) */}
          <div className="lg:hidden bg-slate-50/80 border-b border-slate-200/80 px-4 py-3 sm:px-6">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-900">
                  Step {stage + 1} of {stagesList.length}: {stagesList[stage].title}
                </span>
                <span className="font-medium text-slate-500">
                  {Math.round(((stage + 1) / stagesList.length) * 100)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200/70 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900 transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${((stage + 1) / stagesList.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px] lg:min-h-[620px]">
            {/* Left Sidebar / Rail (Desktop only) */}
            <aside className="hidden lg:flex lg:col-span-4 bg-[#F8FAFC] border-r border-slate-200/80 p-5 sm:p-8 flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  Project Setup
                </span>
                <nav className="space-y-1.5">
                  {stagesList.map((s) => {
                    const isActive = stage === s.num;
                    const isCompleted = stage > s.num;

                    return (
                      <button
                        key={s.num}
                        type="button"
                        onClick={() => s.num <= stage && setStage(s.num as any)}
                        disabled={s.num > stage}
                        className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${isActive
                          ? "bg-white text-slate-900 font-bold shadow-xs border border-slate-200"
                          : isCompleted
                            ? "text-slate-800 hover:bg-slate-200/60 font-semibold cursor-pointer"
                            : "text-slate-600 hover:text-slate-900 cursor-not-allowed font-medium"
                          }`}
                      >
                        <div
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${isActive
                            ? "bg-slate-900 text-white shadow-xs"
                            : isCompleted
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-700"
                            }`}
                        >
                          {isCompleted ? <Check className="h-3 w-3 stroke-[3]" /> : s.num + 1}
                        </div>
                        <span className={`truncate text-xs ${isActive ? "text-slate-900 font-bold" : isCompleted ? "text-slate-800 font-semibold" : "text-slate-600"}`}>
                          {s.title}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Right Main Content Area */}
            <main className="lg:col-span-8 p-5 sm:p-8 lg:p-12 flex flex-col justify-between bg-white">
              <div>

                {errorMessage && (
                  <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700 flex items-center gap-2.5 shadow-2xs">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Stage 0: Welcome & Choices */}
                {stage === 0 && (
                  <div className="space-y-6">
                    <div>
                      <h2
                        onClick={() => setStage(1)}
                        className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 cursor-pointer"
                      >
                        Create a New Project
                      </h2>
                      <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
                        Choose how you want to provision this project workspace.
                      </p>
                    </div>

                    <div className="max-w-md pt-1">
                      {/* Primary Option: Create New */}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setStage(1)}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setStage(1)}
                        className="cursor-pointer rounded-2xl border-2 border-slate-900 bg-slate-50/70 p-5 sm:p-6 transition-all shadow-xs hover:shadow-md hover:border-blue-600 group flex flex-col justify-between min-h-[190px] ring-1 ring-slate-900/5 active:scale-[0.99]"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs group-hover:scale-105 group-hover:bg-blue-600 transition-all">
                              <FolderPlus className="h-5 w-5" />
                            </div>
                          </div>
                          <h3 className="font-bold text-slate-900 text-base sm:text-sm">Guided Setup</h3>
                          <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                            Step-by-step setup for entity, capital structure, and governance.
                          </p>
                          <div className="mt-3.5 flex flex-wrap gap-1.5">
                            <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600">Entity & Structure</span>
                            <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600">Acquisition & Debt</span>
                            <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600">Compliance</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Row directly below choices */}
                    <div className="pt-6 border-t border-slate-200 mt-6 sm:mt-8 flex items-center justify-end">
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => setStage(1)}
                        className="w-full sm:w-auto rounded-full px-7 py-2.5 text-xs font-semibold shadow-sm"
                      >
                        Begin Setup <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Stage 1: Identity & Structure */}
                {stage === 1 && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-snug">
                          {stage1Step === 1 && "Project Identity & Legal Entity"}
                          {stage1Step === 2 && "Property Location"}
                          {stage1Step === 3 && "Asset Classification & Schedule"}
                        </h2>
                        <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                          Step {stage1Step} of 3
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {stage1Step === 1 && "Name the project and specify its designated legal entity."}
                        {stage1Step === 2 && "Enter the municipal site address for zoning and tax tracking."}
                        {stage1Step === 3 && "Define property type, project phase, and construction timeline."}
                      </p>
                    </div>

                    <div className="space-y-4 pt-1">
                      {/* Sub-step 1: Project Name & Legal Entity */}
                      {stage1Step === 1 && (
                        <>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              Project Display Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              autoFocus
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="e.g. 161 Woodlawn Avenue"
                              required
                              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                              The human-friendly name displayed across draw packages and reports.
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              Legal Ownership Entity (LLC / LP) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={projectEntity}
                              onChange={(e) => setProjectEntity(e.target.value)}
                              placeholder="e.g. 161 Woodlawn Partners LLC"
                              required
                              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                              Dedicated corporate entity holding the property deed and bank account.
                            </p>
                          </div>
                        </>
                      )}

                      {/* Sub-step 2: Granular Property Location & Smart ZIP Code Auto-Detection */}
                      {stage1Step === 2 && (
                        <div className="space-y-4">
                          {/* Street Address & Unit */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Street Address <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <MapPin className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                                <input
                                  type="text"
                                  autoFocus
                                  value={streetAddress}
                                  onChange={(e) => {
                                    setStreetAddress(e.target.value);
                                    updateAddressString(e.target.value, unitSuite, city, stateCode, zipCode, country);
                                  }}
                                  placeholder="e.g. 161 Woodlawn Ave"
                                  required
                                  className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Unit / Suite / Bldg <span className="text-slate-400 font-normal">(Optional)</span>
                              </label>
                              <input
                                type="text"
                                value={unitSuite}
                                onChange={(e) => {
                                  setUnitSuite(e.target.value);
                                  updateAddressString(streetAddress, e.target.value, city, stateCode, zipCode, country);
                                }}
                                placeholder="e.g. Suite 200"
                                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                              />
                            </div>
                          </div>

                          {/* ZIP Code & City */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-semibold text-slate-700">
                                  ZIP / Postal Code <span className="text-red-500">*</span>
                                </label>
                                {zipStatus === "loading" && (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-medium">
                                    <Loader2 className="h-3 w-3 animate-spin" /> Detecting...
                                  </span>
                                )}
                                {zipStatus === "valid" && (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Auto-detected
                                  </span>
                                )}
                              </div>
                              <input
                                type="text"
                                maxLength={5}
                                value={zipCode}
                                onChange={(e) => handleZipCodeChange(e.target.value)}
                                placeholder="e.g. 07305"
                                required
                                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 font-mono tracking-wide"
                              />
                              {zipMessage && (
                                <p
                                  className={`text-[11px] mt-1.5 flex items-center gap-1 ${zipStatus === "valid"
                                    ? "text-emerald-700 font-medium"
                                    : "text-amber-700"
                                    }`}
                                >
                                  {zipMessage}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                City / Municipality <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={city}
                                onChange={(e) => {
                                  setCity(e.target.value);
                                  updateAddressString(streetAddress, unitSuite, e.target.value, stateCode, zipCode, country);
                                }}
                                placeholder="e.g. Jersey City"
                                required
                                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                              />
                            </div>
                          </div>

                          {/* State & Country */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                State / Territory <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={stateCode}
                                onChange={(e) => {
                                  setStateCode(e.target.value);
                                  updateAddressString(streetAddress, unitSuite, city, e.target.value, zipCode, country);
                                }}
                                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-2xs transition-colors hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 cursor-pointer"
                              >
                                {US_STATES.map((st) => (
                                  <option key={st.code} value={st.code}>
                                    {st.name} ({st.code})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Country
                              </label>
                              <input
                                type="text"
                                value={country}
                                onChange={(e) => {
                                  setCountry(e.target.value);
                                  updateAddressString(streetAddress, unitSuite, city, stateCode, zipCode, e.target.value);
                                }}
                                className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 text-sm text-slate-700 shadow-2xs focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Live Unified Address Preview */}
                          {address && (
                            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 flex items-start gap-2.5">
                              <MapPin className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                                  Unified Site Location
                                </span>
                                <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                                  {address}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Sub-step 3: Asset Type, Lifecycle & Dates */}
                      {stage1Step === 3 && (
                        <div className="space-y-5">
                          {/* Project Asset Type */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-2">
                              Project Asset Type
                            </label>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                              {[
                                {
                                  value: "MULTIFAMILY",
                                  label: "Multifamily",
                                },
                                {
                                  value: "SINGLE_FAMILY",
                                  label: "Single Family",
                                },
                                {
                                  value: "MIXED_USE",
                                  label: "Mixed-Use",
                                },
                                {
                                  value: "COMMERCIAL",
                                  label: "Commercial",
                                },
                              ].map((type) => {
                                const isSelected = projectType === type.value;
                                return (
                                  <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setProjectType(type.value)}
                                    className={`rounded-xl border p-3 text-center sm:text-left transition-all cursor-pointer ${isSelected
                                      ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                                      : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50/70"
                                      }`}
                                  >
                                    <span className="block text-xs font-semibold leading-tight">{type.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Lifecycle Stage */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-2">
                              Lifecycle Stage
                            </label>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                              {[
                                {
                                  value: "PRE_CONSTRUCTION",
                                  label: "Pre-Construction",
                                },
                                {
                                  value: "CONSTRUCTION",
                                  label: "Under Construction",
                                },
                                {
                                  value: "ACQUISITION",
                                  label: "Acquisition",
                                },
                                {
                                  value: "COMPLETION",
                                  label: "Closeout",
                                },
                              ].map((stageItem) => {
                                const isSelected = lifecycleStage === stageItem.value;
                                return (
                                  <button
                                    key={stageItem.value}
                                    type="button"
                                    onClick={() => setLifecycleStage(stageItem.value as LifecycleStage)}
                                    className={`rounded-xl border p-3 text-center sm:text-left transition-all cursor-pointer ${isSelected
                                      ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                                      : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50/70"
                                      }`}
                                  >
                                    <span className="block text-xs font-semibold leading-tight">{stageItem.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Target Construction Start
                              </label>
                              <input
                                type="date"
                                value={startedAt}
                                onChange={(e) => setStartedAt(e.target.value)}
                                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-2xs transition-colors hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                              />
                              <p className="text-[11px] text-slate-400 mt-1">Groundbreaking or permit issuance date</p>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Target Completion Date
                              </label>
                              <input
                                type="date"
                                value={targetCompletionAt}
                                onChange={(e) => setTargetCompletionAt(e.target.value)}
                                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-2xs transition-colors hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                              />
                              <p className="text-[11px] text-slate-400 mt-1">Expected Certificate of Occupancy (CO)</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-6 flex justify-between items-center border-t border-slate-200 mt-6 sm:mt-8">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          if (stage1Step > 1) {
                            setStage1Step((s) => (s - 1) as any);
                          } else {
                            setStage(0);
                          }
                        }}
                        className="rounded-full px-5 py-2.5 text-xs font-semibold"
                      >
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
                      </Button>

                      {stage1Step < 3 ? (
                        <Button
                          type="button"
                          variant="primary"
                          onClick={() => {
                            if (stage1Step === 1 && !name.trim()) {
                              setErrorMessage("Please enter a project display name to continue.");
                              return;
                            }
                            if (stage1Step === 2) {
                              if (!streetAddress.trim() || !city.trim() || !zipCode.trim()) {
                                setErrorMessage("Please enter street address, city, and ZIP code.");
                                return;
                              }
                              updateAddressString(streetAddress, unitSuite, city, stateCode, zipCode, country);
                            }
                            setErrorMessage("");
                            setStage1Step((s) => (s + 1) as any);
                          }}
                          className="rounded-full px-6 py-2.5 text-xs font-semibold shadow-sm"
                        >
                          Next Step <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="primary"
                          loading={duplicateCheckMutation.isPending}
                          onClick={() => {
                            if (!name.trim()) {
                              setErrorMessage("Please complete the required project name.");
                              return;
                            }
                            if (!address.trim()) {
                              const generated = updateAddressString(streetAddress, unitSuite, city, stateCode, zipCode, country);
                              if (!generated.trim()) {
                                setErrorMessage("Please complete the property location.");
                                return;
                              }
                            }
                            setErrorMessage("");
                            duplicateCheckMutation.mutate();
                          }}
                          className="rounded-full px-6 py-2.5 text-xs font-semibold shadow-sm"
                        >
                          Next: Capital & Debt <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Stage 2: Acquisition & Debt Structure */}
                {stage === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Landmark className="h-5 w-5 text-blue-600" />
                        Acquisition & Debt Structure
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Specify property acquisition status, equity source, and construction financing.
                      </p>
                    </div>

                    <div className="space-y-5 pt-1">
                      {/* Acquisition Status */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-2">
                          Property Acquisition Status
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            {
                              val: "true",
                              label: "Yes, Deed Closed & Recorded",
                            },
                            {
                              val: "false",
                              label: "No, Under Purchase Contract",
                            },
                          ].map((opt) => {
                            const isSelected = isAcquired === opt.val;
                            return (
                              <button
                                key={opt.val}
                                type="button"
                                onClick={() => setIsAcquired(opt.val as any)}
                                className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${isSelected
                                    ? "border-blue-600 bg-blue-50/50 text-slate-900 ring-2 ring-blue-600/20 shadow-xs"
                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                                  }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="block text-sm font-semibold text-slate-900">{opt.label}</span>
                                  {isSelected && <Check className="h-4 w-4 text-blue-600 stroke-[2.5]" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Acquisition Funding Source */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-2">
                          Acquisition Funding Source
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {[
                            { value: "CASH_EQUITY", label: "Cash Equity" },
                            { value: "ACQUISITION_LOAN", label: "Bridge Loan" },
                            { value: "SELLER_FINANCING", label: "Seller Note" },
                            { value: "OTHER", label: "Other" },
                          ].map((item) => {
                            const isSelected = acquisitionFunding === item.value;
                            return (
                              <button
                                key={item.value}
                                type="button"
                                onClick={() => setAcquisitionFunding(item.value)}
                                className={`rounded-xl border p-3 text-center sm:text-left transition-all cursor-pointer ${isSelected
                                    ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                                    : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50/70"
                                  }`}
                              >
                                <span className="block text-xs font-semibold leading-tight">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>

                        {acquisitionFunding === "OTHER" && (
                          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Specify Custom Funding Source
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Mezzanine debt, PACE financing, or land equity contribution"
                              value={lenderName}
                              onChange={(e) => setLenderName(e.target.value)}
                              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 shadow-2xs focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                            />
                          </div>
                        )}
                      </div>

                      {/* Construction Loan Status */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-2">
                          Active or Planned Construction Loan
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            {
                              val: "true",
                              label: "Construction Loan in Place",
                            },
                            {
                              val: "false",
                              label: "100% Sponsor Self-Funded",
                            },
                          ].map((opt) => {
                            const isSelected = hasConstructionLoan === opt.val;
                            return (
                              <button
                                key={opt.val}
                                type="button"
                                onClick={() => setHasConstructionLoan(opt.val as any)}
                                className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${isSelected
                                    ? "border-blue-600 bg-blue-50/50 text-slate-900 ring-2 ring-blue-600/20 shadow-xs"
                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                                  }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="block text-sm font-semibold text-slate-900">{opt.label}</span>
                                  {isSelected && <Check className="h-4 w-4 text-blue-600 stroke-[2.5]" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {hasConstructionLoan === "true" && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Primary Construction Lender Name <span className="text-slate-400 font-normal">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            value={lenderName}
                            onChange={(e) => setLenderName(e.target.value)}
                            placeholder="e.g. Columbia Bank"
                            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                          />
                        </div>
                      )}
                    </div>

                    <div className="pt-6 flex justify-between items-center border-t border-slate-200 mt-6 sm:mt-8">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setStage(1)}
                        className="rounded-full px-5 py-2.5 text-xs font-semibold"
                      >
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => setStage(3)}
                        className="rounded-full px-6 py-2.5 text-xs font-semibold shadow-sm"
                      >
                        Next: Contract & Operating <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Stage 3: Construction & Operating Model */}
                {stage === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Layers className="h-5 w-5 text-blue-600" />
                        Contract & Operating Model
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Select how the General Contractor will bill and how project disbursements are banked.
                      </p>
                    </div>

                    {/* Contract Model */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        General Contractor Contract Model
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          {
                            value: "FIXED",
                            title: "Fixed Price (GMP / Lump Sum)",
                            desc: "Locked contract value with standard 10% AIA A201 retainage withheld per draw inspection.",
                          },
                          {
                            value: "DAILY",
                            title: "Day Rate (Cost-Plus)",
                            desc: "Billed on verified daily labor, actual subcontractor hours, and material invoices.",
                          },
                        ].map((m) => {
                          const isSelected =
                            contractModel === m.value || (m.value === "FIXED" && contractModel !== "DAILY");
                          return (
                            <div
                              key={m.value}
                              onClick={() => setContractModel(m.value as ContractModel)}
                              className={`group cursor-pointer rounded-xl border p-4 transition-all ${isSelected
                                ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 shadow-xs"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                                }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-sm text-slate-900">{m.title}</span>
                              </div>
                              <p className="mt-1.5 text-xs text-slate-500 leading-normal">{m.desc}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Operating Account Model */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Operating Bank Account Model
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          {
                            val: "DEDICATED",
                            title: "Dedicated Project Account",
                            desc: "Separate single-entity LLC bank account with 1:1 transaction matching and automated wire reconciliation.",
                          },
                          {
                            val: "SHARED",
                            title: "Central Operating Account",
                            desc: "Master operating account requiring strict inter-project transfer rules and cost code tagging.",
                          },
                        ].map((opt) => {
                          const isSelected = operatingAccountModel === opt.val;
                          return (
                            <div
                              key={opt.val}
                              onClick={() => setOperatingAccountModel(opt.val as any)}
                              className={`group cursor-pointer rounded-xl border p-4 transition-all ${isSelected
                                ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 shadow-xs"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                                }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-sm text-slate-900">{opt.title}</span>
                              </div>
                              <p className="mt-1.5 text-xs text-slate-500 leading-normal">{opt.desc}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-6 flex justify-between items-center border-t border-slate-200 mt-6 sm:mt-8">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setStage(2)}
                        className="rounded-full px-5 py-2.5 text-xs font-semibold"
                      >
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => setStage(4)}
                        className="rounded-full px-6 py-2.5 text-xs font-semibold shadow-sm"
                      >
                        Next: Team & Delegation <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Stage 4: Team & Role Delegation */}
                {stage === 4 && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-600" />
                          Team & Role Delegation
                        </h2>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Assign project roles now, or skip and invite collaborators anytime from Project Settings.
                      </p>
                    </div>

                    <div className="space-y-3.5 pt-1">
                      {/* Finance Controller / Co-Owner */}
                      <div className="rounded-xl border border-slate-200 p-4 bg-white shadow-2xs hover:border-slate-300 transition-colors">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-bold text-slate-900">
                              Finance Controller / Co-Owner
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-2">
                          Oversees pay applications, bank wire reconciliation, and project P&L.
                        </p>
                        <input
                          type="email"
                          value={cfoEmail}
                          onChange={(e) => setCfoEmail(e.target.value)}
                          placeholder="controller@yourdevelopmentgroup.com"
                          className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                        />
                      </div>

                      {/* Project Manager / Field Superintendent */}
                      <div className="rounded-xl border border-slate-200 p-4 bg-white shadow-2xs hover:border-slate-300 transition-colors">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <HardHat className="h-4 w-4 text-amber-600" />
                            <span className="text-xs font-bold text-slate-900">
                              Project Manager / Field Superintendent
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-2">
                          Uploads site milestones, daily field logs, and municipal inspection cards.
                        </p>
                        <input
                          type="email"
                          value={pmEmail}
                          onChange={(e) => setPmEmail(e.target.value)}
                          placeholder="super@fieldoperations.com"
                          className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                        />
                      </div>

                      {/* General Contractor Principal */}
                      <div className="rounded-xl border border-slate-200 p-4 bg-white shadow-2xs hover:border-slate-300 transition-colors">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-emerald-600" />
                            <span className="text-xs font-bold text-slate-900">
                              General Contractor Principal
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-2">
                          Submits trade invoices, monthly AIA G702 drafts, and statutory lien waivers.
                        </p>
                        <input
                          type="email"
                          value={gcEmail}
                          onChange={(e) => setGcEmail(e.target.value)}
                          placeholder="principal@generalcontractor.com"
                          className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                        />
                      </div>
                    </div>

                    <div className="pt-6 flex justify-between items-center border-t border-slate-200 mt-6 sm:mt-8">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setStage(3)}
                        className="rounded-full px-5 py-2.5 text-xs font-semibold"
                      >
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
                      </Button>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setStage(5)}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors px-3 py-2 cursor-pointer"
                        >
                          Skip for now
                        </button>
                        <Button
                          type="button"
                          variant="primary"
                          onClick={() => setStage(5)}
                          className="rounded-full px-6 py-2.5 text-xs font-semibold shadow-sm"
                        >
                          Next: Source Documents <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stage 5: Source Documents */}
                {stage === 5 && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                          <FileCheck className="h-5 w-5 text-blue-600" />
                          Source Documents Checklist
                        </h2>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Attach initial documents to start automated file matching, or skip and upload later in your workspace.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      {[
                        {
                          key: "deed" as const,
                          title: "Acquisition Deed or HUD-1",
                          sub: "Validates purchase price and title recording.",
                        },
                        {
                          key: "gcContract" as const,
                          title: "GC Agreement & SOV",
                          sub: "Establishes Schedule of Values & CSI cost codes.",
                        },
                        {
                          key: "loanAgreement" as const,
                          title: "Construction Loan Agreement",
                          sub:
                            hasConstructionLoan === "true"
                              ? "Sets draw disbursement rules & interest carry formula."
                              : "Optional for self-funded projects.",
                        },
                        {
                          key: "permitSet" as const,
                          title: "Building Permit & Plans",
                          sub: "Enables municipal milestone gates to Certificate of Occupancy.",
                        },
                      ].map((item) => {
                        const file = uploadedFiles[item.key];
                        return (
                          <div
                            key={item.key}
                            className={`rounded-xl border p-4 transition-all ${file
                              ? "border-emerald-300 bg-emerald-50/30"
                              : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div>
                                <span className="font-semibold text-xs text-slate-900 block">{item.title}</span>
                                <span className="text-[11px] text-slate-500 mt-0.5 block">{item.sub}</span>
                              </div>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-slate-100">
                              {file ? (
                                <div className="flex items-center justify-between text-xs bg-white rounded-lg p-2 border border-emerald-200">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <FileCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                                    <span className="font-medium text-slate-800 truncate text-[11px]">
                                      {file.name}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setUploadedFiles((prev) => {
                                        const next = { ...prev };
                                        delete next[item.key];
                                        return next;
                                      })
                                    }
                                    className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                                    title="Remove attached file"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <label className="flex items-center justify-center gap-2 w-full py-2 px-3 border border-dashed border-slate-300 hover:border-blue-500 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-blue-600 bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer">
                                  <FileUp className="h-3.5 w-3.5" />
                                  <span>Choose PDF or Document</span>
                                  <input
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                                    className="hidden"
                                    onChange={(e) => {
                                      const picked = e.target.files?.[0];
                                      if (picked) {
                                        setUploadedFiles((prev) => ({
                                          ...prev,
                                          [item.key]: picked,
                                        }));
                                      }
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Files are processed with a permanent digital audit trail. Invoices and lien waivers can be dragged directly into the workspace at any time.
                      </p>
                    </div>

                    <div className="pt-6 flex justify-between items-center border-t border-slate-200 mt-6 sm:mt-8">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setStage(4)}
                        className="rounded-full px-5 py-2.5 text-xs font-semibold"
                      >
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
                      </Button>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setStage(6)}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors px-3 py-2 cursor-pointer"
                        >
                          Skip and upload later
                        </button>
                        <Button
                          type="button"
                          variant="primary"
                          onClick={() => setStage(6)}
                          className="rounded-full px-6 py-2.5 text-xs font-semibold shadow-sm"
                        >
                          Next: Review & Launch <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stage 6: Review & Confirmation */}
                {stage === 6 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-emerald-600" />
                        Review & Confirm Setup
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Verify project parameters before generating your construction workspace.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Project Identity */}
                        <div className="bg-white rounded-xl p-3 border border-slate-200/70">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                            Project Identity
                          </span>
                          <span className="font-bold text-slate-900 text-sm mt-1 block truncate">
                            {name || "Untitled Project"}
                          </span>
                          <span className="text-slate-600 text-xs mt-0.5 block truncate">
                            {projectEntity || "Entity Pending"}
                          </span>
                          <span className="text-slate-400 text-[11px] mt-1 block truncate">
                            {address || "Site address unassigned"}
                          </span>
                        </div>

                        {/* Capital & Debt */}
                        <div className="bg-white rounded-xl p-3 border border-slate-200/70">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                            Financing Structure
                          </span>
                          <span className="font-bold text-slate-900 text-sm mt-1 block">
                            {hasConstructionLoan === "true"
                              ? lenderName
                                ? `Loan: ${lenderName}`
                                : "Senior Construction Loan"
                              : "100% Sponsor Self-Funded"}
                          </span>
                          <span className="text-slate-600 text-xs mt-0.5 block">
                            Funding: {acquisitionFunding.replace("_", " ")}
                          </span>
                          <span className="text-slate-400 text-[11px] mt-1 block">
                            Deed: {isAcquired === "true" ? "Recorded & Closed" : "Under Contract"}
                          </span>
                        </div>

                        {/* Contract & Governance */}
                        <div className="bg-white rounded-xl p-3 border border-slate-200/70">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                            Contract & Accounts
                          </span>
                          <span className="font-bold text-slate-900 text-sm mt-1 block">
                            {contractModel === "FIXED" ? "Fixed Price (GMP)" : "Day Rate"}
                          </span>
                          <span className="text-slate-600 text-xs mt-0.5 block">
                            10% AIA Retainage Enforced
                          </span>
                          <span className="text-slate-400 text-[11px] mt-1 block">
                            {operatingAccountModel === "DEDICATED" ? "Dedicated Account" : "Central Account"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/70">
                          <span className="text-slate-500 font-medium">Invited Collaborators:</span>
                          <span className="font-semibold text-slate-800">
                            {[cfoEmail, pmEmail, gcEmail].filter(Boolean).length > 0
                              ? `${[cfoEmail, pmEmail, gcEmail].filter(Boolean).length} team seats assigned`
                              : "Owner only (Invite anytime)"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/70">
                          <span className="text-slate-500 font-medium">Initial Source Documents:</span>
                          <span className="font-semibold text-slate-800">
                            {Object.values(uploadedFiles).filter(Boolean).length > 0
                              ? `${Object.values(uploadedFiles).filter(Boolean).length} document(s) attached`
                              : "Upload in workspace"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4.5 text-xs text-slate-600 space-y-2.5 shadow-2xs">
                      <p className="font-bold text-slate-900">Workspace Activation Deliverables:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-slate-600 text-[11px]">
                        <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>CSI MasterFormat trade budget accounts initialized</span>
                        </div>
                        <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>Draw packages pre-formatted for bank-ready AIA G702 / G703</span>
                        </div>
                        <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>Standard 10% retainage withholdings and statutory lien releases</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 flex justify-between items-center border-t border-slate-200 mt-6 sm:mt-8">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setStage(5)}
                        className="rounded-full px-5 py-2.5 text-xs font-semibold"
                      >
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => createMutation.mutate()}
                        loading={createMutation.isPending}
                        className="rounded-full bg-slate-900 hover:bg-slate-800 text-white px-7 py-2.5 text-xs font-semibold shadow-md shadow-slate-950/20"
                      >
                        <FolderPlus className="mr-1.5 h-4 w-4" /> Launch Project Workspace
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Duplicate Check Warning Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="max-w-lg w-full rounded-xl border border-slate-200 bg-white p-6 shadow-overlay">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                <CopyCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Potential Duplicate Project Found
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  One or more existing projects match this legal entity or address.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 max-h-48 overflow-y-auto">
              {duplicateMatches.map((m) => (
                <div key={m.id} className="rounded-xl border border-slate-200 p-3 text-xs bg-slate-50">
                  <div className="font-semibold text-slate-900">{m.name}</div>
                  <div className="text-slate-500">{m.address}</div>
                  <div className="text-amber-700 mt-1 font-medium">{m.similarity_reason}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <Button
                variant="tertiary"
                onClick={() => {
                  setShowDuplicateModal(false);
                }}
                className="rounded-full px-5 py-2 text-xs font-semibold"
              >
                Edit Information
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowDuplicateModal(false);
                  setStage(2);
                }}
                className="rounded-full px-6 py-2 text-xs font-semibold"
              >
                Proceed Anyway
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
