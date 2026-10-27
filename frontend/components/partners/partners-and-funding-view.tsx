"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Project } from "@/lib/types";
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Download,
  Share2,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  Landmark,
  Clock,
  Building2,
  Search,
  MoreHorizontal,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight,
  Wallet,
  Coins,
  FileText,
  BadgeCheck,
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { RecordPartnerContributionModal } from "@/components/partners/record-partner-contribution-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PartnerItem {
  id: string;
  name: string;
  initials: string;
  role: string;
  ownershipPct: number;
  committed: number;
  funded: number;
  returned: number;
  colorBg: string;
  colorText: string;
  phone?: string;
  email?: string;
}

interface ContributionItem {
  id: string;
  date: string;
  partnerName: string;
  amount: number;
  source: string;
  status: "Cleared" | "Pending";
  type: "Partner Equity" | "Partner Loans" | "Unclassified";
  reference?: string;
}

interface FundingSourceItem {
  id: string;
  name: string;
  type: string;
  amount: number;
  status: "Classified" | "Needs review" | "None";
  colorDot: string;
}

const INITIAL_PARTNERS: PartnerItem[] = [
  {
    id: "p-1",
    name: "Marcus Vance",
    initials: "M",
    role: "Managing Sponsor",
    ownershipPct: 25,
    committed: 118750,
    funded: 110000,
    returned: 0,
    colorBg: "bg-blue-100",
    colorText: "text-blue-700",
    email: "m.vance@vancedev.com",
  },
  {
    id: "p-2",
    name: "Elena Rostova",
    initials: "E",
    role: "Co-Sponsor",
    ownershipPct: 25,
    committed: 118750,
    funded: 105000,
    returned: 0,
    colorBg: "bg-rose-100",
    colorText: "text-rose-700",
    email: "elena.rostova@example.com",
  },
  {
    id: "p-3",
    name: "Apex Equity Partners",
    initials: "A",
    role: "Institutional LP",
    ownershipPct: 20,
    committed: 95000,
    funded: 90000,
    returned: 0,
    colorBg: "bg-emerald-100",
    colorText: "text-emerald-700",
    email: "investor.desk@apexequity.com",
  },
  {
    id: "p-4",
    name: "Horizon Investments LLC",
    initials: "H",
    role: "Partner",
    ownershipPct: 20,
    committed: 95000,
    funded: 80000,
    returned: 0,
    colorBg: "bg-purple-100",
    colorText: "text-purple-700",
    email: "portfolio@horizoninv.com",
  },
  {
    id: "p-5",
    name: "Summit Capital Group",
    initials: "S",
    role: "Partner",
    ownershipPct: 10,
    committed: 47500,
    funded: 40000,
    returned: 0,
    colorBg: "bg-amber-100",
    colorText: "text-amber-800",
    email: "allocations@summitcapital.com",
  },
];

const INITIAL_CONTRIBUTIONS: ContributionItem[] = [
  {
    id: "c-1",
    date: "Oct 1, 2026",
    partnerName: "Marcus Vance",
    amount: 50000,
    source: "Bank transfer",
    status: "Cleared",
    type: "Partner Equity",
    reference: "WIRE-4821",
  },
  {
    id: "c-2",
    date: "Sep 15, 2026",
    partnerName: "Elena Rostova",
    amount: 50000,
    source: "Bank transfer",
    status: "Cleared",
    type: "Partner Equity",
    reference: "WIRE-4780",
  },
  {
    id: "c-3",
    date: "Sep 1, 2026",
    partnerName: "Apex Equity Partners",
    amount: 40000,
    source: "Wire transfer",
    status: "Cleared",
    type: "Partner Equity",
    reference: "WIRE-4722",
  },
  {
    id: "c-4",
    date: "Aug 20, 2026",
    partnerName: "Horizon Investments LLC",
    amount: 40000,
    source: "Capital Call Sweep (unclassified)",
    status: "Pending",
    type: "Unclassified",
    reference: "TXN-9021",
  },
  {
    id: "c-5",
    date: "Aug 10, 2026",
    partnerName: "Summit Capital Group",
    amount: 40000,
    source: "Escrow Reserve (unclassified)",
    status: "Pending",
    type: "Unclassified",
    reference: "TXN-8812",
  },
];

interface PartnersAndFundingViewProps {
  projectId?: string;
}

export function PartnersAndFundingView({ projectId }: PartnersAndFundingViewProps) {
  const [partners, setPartners] = useState<PartnerItem[]>(INITIAL_PARTNERS);
  const [contributions, setContributions] = useState<ContributionItem[]>(INITIAL_CONTRIBUTIONS);
  const [partnerFilter, setPartnerFilter] = useState("ALL");
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedPartnerDetail, setSelectedPartnerDetail] = useState<PartnerItem | null>(null);

  // Fetch active project data
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const projects = projectsData?.data?.projects || [];
  const currentProjectId = projectId || projectsData?.data?.current_project_id || "";
  const currentProject = projects.find((p) => p.id === currentProjectId) || projects[0] || {
    id: "proj-161",
    name: "161 Woodlawn Ave",
    lifecycle_stage: "PRE_CONSTRUCTION",
    address: "161 Woodlawn Ave, Jersey City, NJ 07305",
  };

  // Portfolio & Partner Aggregates
  const totalCommitted = useMemo(() => {
    return partners.reduce((sum, p) => sum + p.committed, 0);
  }, [partners]);

  const totalFunded = useMemo(() => {
    return partners.reduce((sum, p) => sum + p.funded, 0);
  }, [partners]);

  const remainingToFund = Math.max(0, totalCommitted - totalFunded);
  const fundedPct = Math.round((totalFunded / totalCommitted) * 100);
  const totalReturned = useMemo(() => {
    return partners.reduce((sum, p) => sum + p.returned, 0);
  }, [partners]);
  const capitalOutstanding = totalFunded - totalReturned;

  // Funding Sources Breakdown
  const fundingSources = useMemo<FundingSourceItem[]>(() => {
    const classifiedEquity = contributions
      .filter((c) => c.type === "Partner Equity" && c.status === "Cleared")
      .reduce((sum, c) => sum + c.amount, 0);

    const partnerLoans = contributions
      .filter((c) => c.type === "Partner Loans")
      .reduce((sum, c) => sum + c.amount, 0);

    return [
      {
        id: "fs-1",
        name: "Partner Equity",
        type: "Partner equity",
        amount: 325000,
        status: "Classified",
        colorDot: "bg-emerald-500",
      },
      {
        id: "fs-2",
        name: "Partner Loans",
        type: "Partner loan",
        amount: partnerLoans,
        status: "None",
        colorDot: "bg-blue-500",
      },
      {
        id: "fs-3",
        name: "Oak Tree",
        type: "Unclassified",
        amount: 50000,
        status: "Needs review",
        colorDot: "bg-amber-500",
      },
      {
        id: "fs-4",
        name: "JSQ",
        type: "Unclassified",
        amount: 50000,
        status: "Needs review",
        colorDot: "bg-amber-500",
      },
      {
        id: "fs-5",
        name: "Other / Unknown",
        type: "Other",
        amount: 0,
        status: "None",
        colorDot: "bg-slate-400",
      },
    ];
  }, [contributions]);

  // Filtered partners
  const filteredPartners = useMemo(() => {
    if (partnerFilter === "ALL") return partners;
    if (partnerFilter === "NEEDS_TOPUP") {
      return partners.filter((p) => p.funded < p.committed);
    }
    if (partnerFilter === "ON_TRACK") {
      return partners.filter((p) => Math.round((p.funded / p.committed) * 100) >= 90);
    }
    return partners;
  }, [partners, partnerFilter]);

  // Equity distribution chart data
  const partnerPieData = useMemo(() => {
    const palette = ["#2563EB", "#059669", "#7C3AED", "#D97706", "#E11D48"];
    return partners.map((p, idx) => ({
      name: p.name,
      value: p.ownershipPct,
      committed: p.committed,
      funded: p.funded,
      color: palette[idx % palette.length],
    }));
  }, [partners]);



  const handleRecordNewContribution = (newEntry: {
    partnerName: string;
    amount: number;
    source: string;
    sourceType: "Partner Equity" | "Partner Loans" | "Unclassified";
    date: string;
    reference: string;
    notes?: string;
  }) => {
    const newContrib: ContributionItem = {
      id: `c-${Date.now()}`,
      date: newEntry.date,
      partnerName: newEntry.partnerName,
      amount: newEntry.amount,
      source: newEntry.source,
      status: "Cleared",
      type: newEntry.sourceType,
      reference: newEntry.reference,
    };

    setContributions([newContrib, ...contributions]);

    // Update partner funded amounts if Partner Equity
    if (newEntry.sourceType === "Partner Equity") {
      setPartners((prev) =>
        prev.map((p) =>
          p.name === newEntry.partnerName
            ? { ...p, funded: p.funded + newEntry.amount }
            : p
        )
      );
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 space-y-6">
      {/* Breadcrumb Navigation & Top Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Link
              href={projectId ? `/projects/${projectId}/control-center` : "/projects"}
              className="hover:text-slate-900 transition-colors"
            >
              {currentProject?.name || "161 Woodlawn Ave"}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium text-slate-800">Partners and Funding</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Partners and funding
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 shadow-2xs">
              <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
              Verified
            </span>
            <span className="text-xs text-slate-400">As of Oct 13, 2026</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Manage project partners, ownership, contributions, partner loans, and distributions.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Record contribution</span>
          </button>
        </div>
      </div>

      {/* 5 Top Summary Metric Cards */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        {/* Card 1: Total Committed */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Total committed</div>
              <div className="text-lg font-bold text-slate-900 tracking-tight">
                {formatCurrency(totalCommitted)}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
            <span className="text-slate-500">Target equity</span>
            <span className="font-semibold text-blue-600 hover:underline cursor-pointer">
              5 partners
            </span>
          </div>
        </div>

        {/* Card 2: Total Funded (Cleared) */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Total funded (cleared)</div>
              <div className="text-lg font-bold text-slate-900 tracking-tight">
                {formatCurrency(totalFunded)}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
            <span className="text-slate-500">{fundedPct}% of target</span>
            <span className="font-semibold text-blue-600">
              Sources (8)
            </span>
          </div>
        </div>

        {/* Card 3: Remaining to Fund */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Remaining to fund</div>
              <div className="text-lg font-bold text-slate-900 tracking-tight">
                {formatCurrency(remainingToFund)}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
            <span className="text-slate-500">{100 - fundedPct}% of target</span>
            <span className="font-semibold text-blue-600 hover:underline cursor-pointer">
              Sources (2)
            </span>
          </div>
        </div>

        {/* Card 4: Distributed to Date */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Distributed to date</div>
              <div className="text-lg font-bold text-slate-900 tracking-tight">
                {formatCurrency(totalReturned)}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
            <span className="flex items-center gap-1 text-slate-500">
              <AlertTriangle className="h-3 w-3 text-slate-400" />
              No distributions yet
            </span>
            <span className="font-semibold text-blue-600 hover:underline cursor-pointer">
              Sources (0)
            </span>
          </div>
        </div>

        {/* Card 5: Capital Outstanding */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Capital outstanding</div>
              <div className="text-lg font-bold text-slate-900 tracking-tight">
                {formatCurrency(capitalOutstanding)}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
            <span className="text-slate-500">Equity + Partner loans</span>
            <span className="font-semibold text-blue-600 hover:underline cursor-pointer">
              Sources (8)
            </span>
          </div>
        </div>
      </div>

      {/* Visual Analytics: Ownership Shares Pie Chart */}
      <div>
        {/* Pie Chart: Partner Ownership Split */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Partner Equity Distribution</h3>
              <p className="text-[11px] text-slate-500">
                Operating agreement ownership percentages across {partners.length} equity partners
              </p>
            </div>
            <span className="inline-flex items-center rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
              100% Allocated
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-52 w-full sm:w-1/2 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={partnerPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {partnerPieData.map((entry, idx) => (
                      <Cell key={`partner-cell-${idx}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(val: number) => [`${val}%`, "Ownership Share"]}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total</span>
                <span className="text-sm font-extrabold text-slate-900">100%</span>
              </div>
            </div>

            <div className="w-full sm:w-1/2 space-y-2 text-xs">
              {partnerPieData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-slate-800 truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-500 tabular-nums">{formatCurrency(item.committed)}</span>
                    <span className="font-bold text-slate-900 tabular-nums bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                      {item.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
          {/* Section Header with Filter and Export */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Project partners ({partners.length})
              </h2>
              <p className="text-xs text-slate-500">
                Ownership, committed capital, funding status, and returns.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Select value={partnerFilter} onValueChange={(val) => setPartnerFilter(val)}>
                <SelectTrigger className="h-8 w-[140px] rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs">
                  <SelectValue placeholder="All partners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All partners</SelectItem>
                  <SelectItem value="ON_TRACK">On Track</SelectItem>
                  <SelectItem value="NEEDS_TOPUP">Needs Top-up</SelectItem>
                </SelectContent>
              </Select>

              <button
                onClick={() => {
                  const rows = [
                    ["Partner", "Role", "Ownership %", "Funded (Cleared)", "Funded %", "Returned"],
                    ...partners.map((p) => [
                      p.name,
                      p.role,
                      `${p.ownershipPct}%`,
                      p.funded,
                      `${Math.round((p.funded / p.committed) * 100)}%`,
                      p.returned,
                    ]),
                  ];
                  const csv = rows.map((r) => r.join(",")).join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `project-partners-${currentProject.name.toLowerCase().replace(/\s+/g, "-")}.csv`;
                  a.click();
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Project Partners Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-500 font-medium">
                    <th className="py-3 pl-4 pr-3">Partner</th>
                    <th className="px-3 py-3">Role</th>
                    <th className="px-3 py-3 text-right">Ownership %</th>
                    <th className="px-3 py-3 text-right">Funded (Cleared)</th>
                    <th className="px-4 py-3 min-w-[140px]">Funded %</th>
                    <th className="py-3 pl-3 pr-4 text-right">Returned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredPartners.map((partner) => {
                    const fundedRatio = Math.round((partner.funded / partner.committed) * 100);
                    const isFullyFunded = fundedRatio >= 90;

                    return (
                      <tr
                        key={partner.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        {/* Partner Name + Avatar */}
                        <td className="py-3.5 pl-4 pr-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`flex h-7 w-7 items-center justify-center rounded-full font-bold text-xs ${partner.colorBg} ${partner.colorText}`}
                            >
                              {partner.initials}
                            </div>
                            <div className="font-semibold text-slate-900">{partner.name}</div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-3 py-3.5 text-slate-500">{partner.role}</td>

                        {/* Ownership % */}
                        <td className="px-3 py-3.5 text-right font-medium text-slate-900 tabular-nums">
                          {partner.ownershipPct}%
                        </td>

                        {/* Funded */}
                        <td className="px-3 py-3.5 text-right font-bold text-slate-900 tabular-nums">
                          {formatCurrency(partner.funded)}
                        </td>

                        {/* Funded Progress Bar */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="w-8 text-[11px] font-medium text-slate-700 tabular-nums">
                              {fundedRatio}%
                            </span>
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full ${
                                  isFullyFunded ? "bg-emerald-500" : "bg-amber-500"
                                }`}
                                style={{ width: `${Math.min(100, fundedRatio)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Returned */}
                        <td className="py-3.5 pl-3 pr-4 text-right text-slate-500 tabular-nums">
                          {formatCurrency(partner.returned)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Total Row */}
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50/50 font-bold text-slate-900">
                    <td className="py-3 pl-4 pr-3">Total</td>
                    <td className="px-3 py-3 text-slate-400">-</td>
                    <td className="px-3 py-3 text-right tabular-nums">100%</td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {formatCurrency(totalFunded)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 text-[11px] font-bold text-slate-900 tabular-nums">
                          {fundedPct}%
                        </span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-emerald-600"
                            style={{ width: `${fundedPct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right tabular-nums">
                      {formatCurrency(totalReturned)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Bottom Two Split Cards: Recent Contributions & Funding Sources */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Left Card: Recent Contributions */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Recent contributions</h3>
                <span className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">
                  View all
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-medium">
                      <th className="pb-2.5 pr-3">Date</th>
                      <th className="pb-2.5 px-3">Partner</th>
                      <th className="pb-2.5 px-3 text-right">Amount</th>
                      <th className="pb-2.5 px-3">Source</th>
                      <th className="pb-2.5 pl-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {contributions.slice(0, 5).map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 pr-3 text-slate-600">{item.date}</td>
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {item.partnerName}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="py-3 px-3 text-slate-600 truncate max-w-[130px]">
                          {item.source}
                        </td>
                        <td className="py-3 pl-3 text-right">
                          {item.status === "Cleared" ? (
                            <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              Cleared
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Card: Funding Sources Breakdown */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Funding sources</h3>
                <span className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">
                  View all
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-medium">
                      <th className="pb-2.5 pr-3">Source</th>
                      <th className="pb-2.5 px-3">Type</th>
                      <th className="pb-2.5 px-3 text-right">Amount</th>
                      <th className="pb-2.5 pl-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fundingSources.map((source) => (
                      <tr key={source.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 pr-3 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${source.colorDot}`} />
                            <span>{source.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{source.type}</td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">
                          {formatCurrency(source.amount)}
                        </td>
                        <td className="py-3 pl-3 text-right">
                          {source.status === "Classified" ? (
                            <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              Classified
                            </span>
                          ) : source.status === "Needs review" ? (
                            <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                              Needs review
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                              None
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
        </div>
      </div>

      {/* Record Contribution Modal */}
      <RecordPartnerContributionModal
        open={isRecordModalOpen}
        onOpenChange={setIsRecordModalOpen}
        partners={partners}
        onRecord={handleRecordNewContribution}
      />
    </div>
  );
}
