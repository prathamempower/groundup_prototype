"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Inbox,
  Search,
  Paperclip,
  Send,
  Sparkles,
  CheckCheck,
  FileText,
  X,
  Download,
  Phone,
  Mail,
  Building2,
  ShieldCheck,
  ArrowLeft,
  Info,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
} from "@/components/ui/drawer";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/modal";

export interface InboxAttachment {
  name: string;
  size: string;
  type: string;
  status?: string;
  url?: string;
}

export interface InboxMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  roleBadgeStyle?: string;
  timestamp: string;
  content: string;
  isOutgoing?: boolean;
  status?: "Sent" | "Delivered" | "Read ✓";
  attachment?: InboxAttachment;
}

export interface InboxContact {
  id: string;
  name: string;
  role: string;
  roleBadge: string;
  roleTitle: string;
  subtitle: string;
  avatar: string;
  avatarBg: string;
  badgeBg: string;
  timestamp: string;
  snippet: string;
  online: boolean;
  email: string;
  phone: string;
  company: string;
  license?: string;
  messages: InboxMessage[];
}

interface InboxViewProps {
  projectId?: string;
  projectName?: string;
}

export function InboxView({
  projectId = "p-161-woodlawn",
  projectName = "161 Woodlawn Ave",
}: InboxViewProps) {
  const [contacts, setContacts] = useState<InboxContact[]>([
    {
      id: "dk",
      name: "Dave Kowalski",
      role: "GC",
      roleBadge: "GC",
      roleTitle: "General Contractor",
      subtitle: "General Contractor • 161 Woodlawn Ave Site Manager",
      avatar: "DK",
      avatarBg: "bg-amber-100 text-amber-800 border-amber-200",
      badgeBg: "bg-amber-50 text-amber-700 border border-amber-200/60",
      timestamp: "10:42 AM",
      snippet: "Plumbing inspection report ready...",
      online: true,
      email: "d.kowalski@apexconstruction.com",
      phone: "+1 (551) 842-9901",
      company: "Apex Construction Services LLC",
      license: "NJ-GC #8839104",
      messages: [
        {
          id: "m-1",
          senderId: "dk",
          senderName: "Dave Kowalski",
          senderRole: "GC",
          roleBadgeStyle: "bg-amber-50 text-amber-700 border border-amber-200/60",
          timestamp: "10:30 AM",
          content:
            "Good morning Marcus. Plumbing rough-in for 161 Woodlawn passed inspection with the city. Ready to release Draw #4 for framing workforce.",
          attachment: {
            name: "161_Woodlawn_Draw_04_Inspection.pdf",
            size: "4.2 MB",
            type: "Attached Document",
            status: "Passed - Ready for Sign-Off",
          },
        },
        {
          id: "m-2",
          senderId: "marcus",
          senderName: "You (Marcus)",
          senderRole: "Owner",
          roleBadgeStyle: "bg-indigo-900/40 text-indigo-100",
          timestamp: "10:38 AM",
          content:
            "Excellent news Dave! Is Sarah in agreement with the $85,000 line item allocation?",
          isOutgoing: true,
          status: "Read ✓",
        },
        {
          id: "m-3",
          senderId: "dk",
          senderName: "Dave Kowalski",
          senderRole: "GC",
          roleBadgeStyle: "bg-amber-50 text-amber-700 border border-amber-200/60",
          timestamp: "10:42 AM",
          content:
            "Yes, Sarah already verified the budget against our contingency line. Plumbing inspection report ready for sign-off.",
        },
      ],
    },
    {
      id: "ar",
      name: "Alex Rivera",
      role: "PM",
      roleBadge: "PM",
      roleTitle: "Project Manager",
      subtitle: "Project Manager • Site Operations & Quality Oversight",
      avatar: "AR",
      avatarBg: "bg-sky-100 text-sky-800 border-sky-200",
      badgeBg: "bg-sky-50 text-sky-700 border border-sky-200/60",
      timestamp: "10:35 AM",
      snippet: "Verified plumbing photos on site",
      online: true,
      email: "a.rivera@vancedev.com",
      phone: "+1 (201) 640-1294",
      company: "Vance Development Management",
      license: "PMP #440912",
      messages: [
        {
          id: "m-ar-1",
          senderId: "ar",
          senderName: "Alex Rivera",
          senderRole: "PM",
          roleBadgeStyle: "bg-sky-50 text-sky-700 border border-sky-200/60",
          timestamp: "10:15 AM",
          content:
            "Marcus, I conducted the on-site walk-through of the rough plumbing lines on the 2nd and 3rd floors.",
        },
        {
          id: "m-ar-2",
          senderId: "marcus",
          senderName: "You (Marcus)",
          senderRole: "Owner",
          roleBadgeStyle: "bg-indigo-900/40 text-indigo-100",
          timestamp: "10:25 AM",
          content:
            "Did the pressure test pressure hold at 60 PSI without any drop?",
          isOutgoing: true,
          status: "Read ✓",
        },
        {
          id: "m-ar-3",
          senderId: "ar",
          senderName: "Alex Rivera",
          senderRole: "PM",
          roleBadgeStyle: "bg-sky-50 text-sky-700 border border-sky-200/60",
          timestamp: "10:35 AM",
          content:
            "Verified plumbing photos on site. Pressure test held solid for 4 hours. Field photo logs are synchronized to project documents vault.",
          attachment: {
            name: "Woodlawn_Plumbing_Site_Photos_Oct13.zip",
            size: "18.4 MB",
            type: "Photo Verification Package",
            status: "Field Verified",
          },
        },
      ],
    },
    {
      id: "sj",
      name: "Sarah Jenkins",
      role: "CFO",
      roleBadge: "CFO",
      roleTitle: "Chief Financial Officer",
      subtitle: "Chief Financial Officer • Capital & Treasury Control",
      avatar: "SJ",
      avatarBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
      badgeBg: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
      timestamp: "10:20 AM",
      snippet: "Draw #4 wire queue authorized",
      online: true,
      email: "s.jenkins@vancedev.com",
      phone: "+1 (212) 890-4412",
      company: "Vance Development Financial Control",
      license: "CPA #99104",
      messages: [
        {
          id: "m-sj-1",
          senderId: "sj",
          senderName: "Sarah Jenkins",
          senderRole: "CFO",
          roleBadgeStyle: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
          timestamp: "10:05 AM",
          content:
            "Reviewing Draw #4 wire schedule. We received the city inspection green tag sign-off from Dave.",
        },
        {
          id: "m-sj-2",
          senderId: "marcus",
          senderName: "You (Marcus)",
          senderRole: "Owner",
          roleBadgeStyle: "bg-indigo-900/40 text-indigo-100",
          timestamp: "10:12 AM",
          content:
            "Has the Title Company confirmed the mechanic's lien waiver updates?",
          isOutgoing: true,
          status: "Read ✓",
        },
        {
          id: "m-sj-3",
          senderId: "sj",
          senderName: "Sarah Jenkins",
          senderRole: "CFO",
          roleBadgeStyle: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
          timestamp: "10:20 AM",
          content:
            "Draw #4 wire queue authorized. Interim lien waivers received from framing subcontractor. $85k contingency line item leaves $92,000 intact.",
          attachment: {
            name: "Draw_04_Treasury_Wire_Authorization.pdf",
            size: "1.8 MB",
            type: "Wire Authorization Record",
            status: "Treasury Signed",
          },
        },
      ],
    },
    {
      id: "ac",
      name: "Apex Capital",
      role: "Investor",
      roleBadge: "Investor",
      roleTitle: "Equity Partner",
      subtitle: "Institutional Equity Partner • Senior LP Representative",
      avatar: "AC",
      avatarBg: "bg-purple-100 text-purple-800 border-purple-200",
      badgeBg: "bg-purple-50 text-purple-700 border border-purple-200/60",
      timestamp: "Yesterday",
      snippet: "Confirmed receipt of Q3 distribution",
      online: true,
      email: "capital-markets@apexcap.com",
      phone: "+1 (212) 555-0199",
      company: "Apex Capital Partners LP",
      license: "SEC Reg. LP Rep",
      messages: [
        {
          id: "m-ac-1",
          senderId: "ac",
          senderName: "Apex Capital",
          senderRole: "Investor",
          roleBadgeStyle: "bg-purple-50 text-purple-700 border border-purple-200/60",
          timestamp: "Yesterday 3:15 PM",
          content:
            "Hello Marcus. Our investment board reviewed the Q3 project executive deck. The projected equity multiple of 1.94x remains on track.",
        },
        {
          id: "m-ac-2",
          senderId: "marcus",
          senderName: "You (Marcus)",
          senderRole: "Owner",
          roleBadgeStyle: "bg-indigo-900/40 text-indigo-100",
          timestamp: "Yesterday 4:02 PM",
          content:
            "Glad to hear. Did your accounting team receive the quarterly distribution wire without issue?",
          isOutgoing: true,
          status: "Read ✓",
        },
        {
          id: "m-ac-3",
          senderId: "ac",
          senderName: "Apex Capital",
          senderRole: "Investor",
          roleBadgeStyle: "bg-purple-50 text-purple-700 border border-purple-200/60",
          timestamp: "Yesterday 4:45 PM",
          content:
            "Confirmed receipt of Q3 distribution. Looking forward to the upcoming milestone site walk for the superstructure framing.",
          attachment: {
            name: "Q3_2026_LP_Distribution_Confirmation.pdf",
            size: "2.1 MB",
            type: "Distribution Receipt",
            status: "Acknowledged",
          },
        },
      ],
    },
  ]);

  const [activeContactId, setActiveContactId] = useState<string>("dk");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [messageInput, setMessageInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Modals & Drawers
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isAttachOpen, setIsAttachOpen] = useState<boolean>(false);
  const [isGeminiOpen, setIsGeminiOpen] = useState<boolean>(false);
  const [previewDoc, setPreviewDoc] = useState<InboxAttachment | null>(null);

  // Mobile navigation state
  const [showMobileChat, setShowMobileChat] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeContact =
    contacts.find((c) => c.id === activeContactId) || contacts[0];

  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      c.roleTitle.toLowerCase().includes(q) ||
      c.snippet.toLowerCase().includes(q)
    );
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeContactId, activeContact.messages.length, isTyping]);

  const handleSendMessage = (textToSend?: string, attachedDoc?: InboxAttachment) => {
    const content = (textToSend ?? messageInput).trim();
    if (!content && !attachedDoc) return;

    const newMsg: InboxMessage = {
      id: `m-out-${Date.now()}`,
      senderId: "marcus",
      senderName: "You (Marcus)",
      senderRole: "Owner",
      roleBadgeStyle: "bg-indigo-900/40 text-indigo-100",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      content: content || "Attached document for project verification.",
      isOutgoing: true,
      status: "Read ✓",
      attachment: attachedDoc,
    };

    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === activeContactId) {
          return {
            ...c,
            snippet: content || attachedDoc?.name || "Shared an attachment",
            timestamp: "Just now",
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setMessageInput("");

    // Realistic automated reply from stakeholder
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let replyText = `Thanks Marcus. I will incorporate this directly into our 161 Woodlawn workflow.`;
      if (activeContact.role === "GC") {
        replyText = `Understood Marcus. Site crew is notified and ready to proceed once Draw #4 funds clear.`;
      } else if (activeContact.role === "PM") {
        replyText = `Copy that. I have updated the site checklist and logged this in the daily field report.`;
      } else if (activeContact.role === "CFO") {
        replyText = `Noted Marcus. Treasury ledger has been updated to reflect this transaction.`;
      } else if (activeContact.role === "Investor") {
        replyText = `Acknowledged Marcus. Thank you for keeping the capital committee updated.`;
      }

      const autoReply: InboxMessage = {
        id: `m-in-${Date.now()}`,
        senderId: activeContact.id,
        senderName: activeContact.name,
        senderRole: activeContact.role,
        roleBadgeStyle: activeContact.badgeBg,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        content: replyText,
      };

      setContacts((prev) =>
        prev.map((c) => {
          if (c.id === activeContactId) {
            return {
              ...c,
              snippet: replyText,
              timestamp: "Just now",
              messages: [...c.messages, autoReply],
            };
          }
          return c;
        })
      );
    }, 1200);
  };

  const availableProjectDocs: InboxAttachment[] = [
    {
      name: "161_Woodlawn_Draw_04_Inspection.pdf",
      size: "4.2 MB",
      type: "Municipal Inspection Certificate",
      status: "Passed - Ready for Sign-Off",
    },
    {
      name: "161 Woodlawn Ave.xlsx",
      size: "1.4 MB",
      type: "Budget & SOV Master Workbook",
      status: "Active Baseline v3",
    },
    {
      name: "Framing_Subcontractor_Lien_Waiver.pdf",
      size: "820 KB",
      type: "Interim Mechanic's Lien Waiver",
      status: "Notarized & Executed",
    },
    {
      name: "Valley_National_Bank_Draw_Summary.pdf",
      size: "3.1 MB",
      type: "Lender Draw Request Form",
      status: "Pending Disbursement",
    },
  ];

  return (
    <div className="flex h-full w-full bg-white overflow-hidden select-text">
      {/* ─────────────────────────────────────────────────────────────
          LEFT PANEL: CLEAN MINIMAL INBOX CONTACT LIST
      ───────────────────────────────────────────────────────────── */}
      <aside
        className={`w-full md:w-80 lg:w-88 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col h-full ${
          showMobileChat ? "hidden md:flex" : "flex"
        }`}
        aria-label="Stakeholder Directs Contacts"
      >
        {/* Clean Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-slate-900 tracking-tight">
              Inbox
            </h1>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {contacts.length}
            </span>
          </div>
        </div>

        {/* Clean Search Input */}
        <div className="px-3 py-2.5 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team member name or role..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-7 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {filteredContacts.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No conversations found
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const isActive = contact.id === activeContactId;

              return (
                <div
                  key={contact.id}
                  onClick={() => {
                    setActiveContactId(contact.id);
                    setShowMobileChat(true);
                  }}
                  className={`group relative flex items-start gap-3 rounded-lg p-2.5 cursor-pointer transition-colors ${
                    isActive
                      ? "bg-slate-100/90 text-slate-900 font-medium"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  {/* Clean Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full font-semibold text-xs ${contact.avatarBg}`}
                    >
                      {contact.avatar}
                    </div>
                    {contact.online && (
                      <span
                        className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
                        title="Online"
                      />
                    )}
                  </div>

                  {/* Summary */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {contact.name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0 ml-1">
                        <span className="text-[11px] text-slate-400 font-normal">
                          {contact.timestamp}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase tracking-wider ${contact.badgeBg}`}
                        >
                          {contact.roleBadge}
                        </span>
                      </div>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 truncate leading-normal">
                      {contact.snippet}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT PANEL: CLEAN MINIMAL CONVERSATION THREAD
      ───────────────────────────────────────────────────────────── */}
      <main
        className={`flex-1 flex flex-col h-full bg-white overflow-hidden ${
          showMobileChat ? "flex" : "hidden md:flex"
        }`}
        aria-label="Direct 1-on-1 Message Thread"
      >
        {/* Clean Header Bar */}
        <header className="h-14 px-4 md:px-6 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Back Button */}
            <button
              onClick={() => setShowMobileChat(false)}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="Back to contacts"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            {/* Avatar */}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold text-xs ${activeContact.avatarBg}`}
            >
              {activeContact.avatar}
            </div>

            {/* Contact Details */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs md:text-sm font-semibold text-slate-900 truncate">
                  {activeContact.name}
                </h2>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase tracking-wider ${activeContact.badgeBg}`}
                >
                  {activeContact.roleBadge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {activeContact.subtitle}
              </p>
            </div>
          </div>

        </header>

        {/* Conversation Thread */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4 bg-slate-50/40">
          {/* Subtle Date Divider */}
          <div className="flex justify-center my-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Today, Oct 13
            </span>
          </div>

          {/* Messages */}
          {activeContact.messages.map((msg) => {
            if (msg.isOutgoing) {
              // Outgoing Message (You / Marcus)
              return (
                <div
                  key={msg.id}
                  className="flex items-start justify-end gap-2.5 ml-auto max-w-lg group"
                >
                  <div className="flex flex-col items-end">
                    <div className="rounded-2xl rounded-tr-xs bg-indigo-600 text-white px-4 py-3 shadow-xs">
                      {/* Header */}
                      <div className="flex items-center justify-between gap-3 mb-1 text-xs">
                        <span className="font-medium text-white/95">
                          {msg.senderName}
                        </span>
                        <span className="text-indigo-200 text-[10px]">
                          {msg.timestamp}
                        </span>
                      </div>

                      {/* Content */}
                      <p className="text-xs md:text-sm text-white leading-relaxed font-normal whitespace-pre-wrap">
                        {msg.content}
                      </p>

                      {/* Attachment */}
                      {msg.attachment && (
                        <div className="mt-2.5 flex items-center justify-between rounded-lg bg-indigo-700/60 p-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-4 w-4 text-indigo-200 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-white truncate">
                                {msg.attachment.name}
                              </div>
                              <div className="text-[10px] text-indigo-200">
                                {msg.attachment.size} • {msg.attachment.type}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(msg.attachment!)}
                            className="shrink-0 text-xs font-semibold text-white hover:underline ml-2"
                          >
                            View
                          </button>
                        </div>
                      )}

                      {/* Read status */}
                      <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-indigo-200">
                        <span>{msg.status || "Read ✓"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Marcus Vance Avatar */}
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white font-semibold text-[10px]"
                    title="Marcus Vance (Owner)"
                  >
                    MV
                  </div>
                </div>
              );
            }

            // Incoming Message (Stakeholder)
            return (
              <div
                key={msg.id}
                className="flex items-start gap-2.5 max-w-lg md:max-w-xl group"
              >
                {/* Stakeholder Avatar */}
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-semibold text-[10px] ${activeContact.avatarBg}`}
                >
                  {activeContact.avatar}
                </div>

                <div className="flex flex-col w-full">
                  <div className="rounded-2xl rounded-tl-xs border border-slate-200 bg-white px-4 py-3 shadow-2xs">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-900">
                          {msg.senderName}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            msg.roleBadgeStyle || activeContact.badgeBg
                          }`}
                        >
                          {msg.senderRole}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-xs md:text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                      {msg.content}
                    </p>

                    {/* Attachment Card */}
                    {msg.attachment && (
                      <div className="mt-2.5 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2.5 hover:bg-slate-100/70 transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-red-100 text-red-600">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-slate-900 truncate">
                              {msg.attachment.name}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {msg.attachment.size} • {msg.attachment.type}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(msg.attachment!)}
                          className="shrink-0 rounded border border-slate-300 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors ml-2 cursor-pointer"
                        >
                          View
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-10">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse delay-100" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse delay-200" />
              <span>{activeContact.name} is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ─────────────────────────────────────────────────────────────
            CLEAN, MINIMAL MESSAGE COMPOSER
        ───────────────────────────────────────────────────────────── */}
        <footer className="bg-white border-t border-slate-200 px-4 py-3 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Paperclip button */}
            <button
              type="button"
              onClick={() => setIsAttachOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Attach Document"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            {/* Input */}
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={`Message ${activeContact.name}...`}
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50/70 py-2 px-3.5 text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30 disabled:hover:bg-indigo-600 transition-colors cursor-pointer"
              aria-label="Send Message"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </button>
          </form>
        </footer>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          DRAWER: STAKEHOLDER PROFILE & COMPLIANCE
      ───────────────────────────────────────────────────────────── */}
      <Drawer open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DrawerContent className="max-w-md">
          <DrawerHeader>
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold text-sm ${activeContact.avatarBg}`}
              >
                {activeContact.avatar}
              </div>
              <div>
                <DrawerTitle className="text-sm font-semibold text-slate-900">
                  {activeContact.name}
                </DrawerTitle>
                <DrawerDescription className="text-xs text-slate-500">
                  {activeContact.roleTitle} • {activeContact.company}
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          <DrawerBody className="space-y-4 p-4 text-xs">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 space-y-2">
              <div className="font-semibold text-slate-900">Contact Details</div>
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="h-4 w-4 text-slate-400" />
                <a href={`mailto:${activeContact.email}`} className="text-indigo-600 hover:underline">
                  {activeContact.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>{activeContact.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Building2 className="h-4 w-4 text-slate-400" />
                <span>{activeContact.company}</span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-1.5">
              <div className="font-semibold text-slate-900">Project Role</div>
              <p className="text-slate-600 leading-relaxed">
                Assigned site lead for <strong>{projectName}</strong>. Responsible for trade coordination,
                inspection milestones, progress reporting, and draw substantiation packets.
              </p>
              {activeContact.license && (
                <div className="inline-flex items-center gap-1.5 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200 mt-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {activeContact.license}
                </div>
              )}
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: ATTACH DOCUMENT
      ───────────────────────────────────────────────────────────── */}
      <Modal open={isAttachOpen} onOpenChange={setIsAttachOpen}>
        <ModalContent maxWidth="md">
          <ModalHeader>
            <ModalTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-slate-600" />
              Attach Project Document
            </ModalTitle>
            <ModalDescription className="text-xs text-slate-500">
              Select verified evidence from {projectName} vault to attach directly to this thread.
            </ModalDescription>
          </ModalHeader>

          <div className="space-y-2 py-2">
            {availableProjectDocs.map((doc, idx) => (
              <div
                key={idx}
                onClick={() => {
                  handleSendMessage("", doc);
                  setIsAttachOpen(false);
                }}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-red-50 text-red-600 border border-red-100">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-900 group-hover:text-indigo-600">
                      {doc.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {doc.size} • {doc.type}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Attach &rarr;
                </span>
              </div>
            ))}
          </div>
        </ModalContent>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: PREVIEW DOCUMENT (VIEW BUTTON)
      ───────────────────────────────────────────────────────────── */}
      <Modal open={Boolean(previewDoc)} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <ModalContent maxWidth="lg">
          <ModalHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-red-600" />
              <ModalTitle className="text-sm font-semibold text-slate-900">
                {previewDoc?.name}
              </ModalTitle>
            </div>
            <ModalDescription className="text-xs text-slate-500">
              {previewDoc?.size} • {previewDoc?.type}
            </ModalDescription>
          </ModalHeader>

          <div className="py-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div>
                  <span className="text-[11px] text-slate-500">Status</span>
                  <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                    <CheckCheck className="h-3.5 w-3.5" />
                    {previewDoc?.status || "Verified & Approved"}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Authority</span>
                  <div className="text-xs font-medium text-slate-800 mt-0.5">
                    Jersey City Dept of Housing & Construction
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Date</span>
                  <div className="text-xs font-medium text-slate-800 mt-0.5">
                    October 13, 2026
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-700 space-y-1">
                <p className="font-medium text-slate-900">Inspector Verification Note:</p>
                <p className="bg-white p-2.5 rounded border border-slate-200 text-slate-600 font-mono text-[11px] leading-relaxed">
                  &ldquo;On-site rough-in plumbing inspection completed for units 101 through 304 at 161 Woodlawn Ave.
                  All DWV pressure and supply lines hold specified hydrostatic rating. Approved for wall close-in and
                  framing certification release.&rdquo;
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => alert(`Downloading verified copy of ${previewDoc?.name}`)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition shadow-xs cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </ModalContent>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: "ASK GEMINI" SMART AI ASSISTANT
      ───────────────────────────────────────────────────────────── */}
      <Modal open={isGeminiOpen} onOpenChange={setIsGeminiOpen}>
        <ModalContent maxWidth="md">
          <ModalHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <ModalTitle className="text-sm font-semibold text-slate-900">
                  Gemini Assistant
                </ModalTitle>
                <ModalDescription className="text-xs text-slate-500">
                  Quick suggestions for thread with {activeContact.name} ({activeContact.role})
                </ModalDescription>
              </div>
            </div>
          </ModalHeader>

          <div className="space-y-2 py-2">
            {[
              {
                title: "Confirm Draw #4 Framing Release",
                prompt: `Dave, confirming that Draw #4 framing funds are authorized based on the passed city plumbing inspection. Sarah has released the $85,000 line item.`,
              },
              {
                title: "Request Updated Lien Waivers",
                prompt: `Please confirm that the framing subcontractor has submitted unconditional lien waivers through Draw #3 prior to this mobilization.`,
              },
              {
                title: "Inquire about City Sign-Off Stamp",
                prompt: `Could you send over the physical permit placard photo with the inspector's stamp for our lender package?`,
              },
            ].map((item, i) => (
              <div
                key={i}
                onClick={() => {
                  setMessageInput(item.prompt);
                  setIsGeminiOpen(false);
                }}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/40 cursor-pointer transition-colors"
              >
                <div className="font-medium text-xs text-slate-900 flex items-center justify-between">
                  <span>{item.title}</span>
                  <span className="text-[11px] text-indigo-600">Use &rarr;</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  &ldquo;{item.prompt}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
