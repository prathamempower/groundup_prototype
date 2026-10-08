// GroundUp AI — AIChatDrawer (Redesigned)
// Slide-in chat panel for asking the AI analyst questions

import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, User, Bot, ChevronRight } from 'lucide-react';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  userContext: { name: string; company: string; role: string };
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'init-1',
    role: 'assistant',
    content: 'Hi! I\'m the GroundUp AI Analyst. I can answer questions about your project\'s budget, draws, schedule delays, and cash exposure. Every number I give you is traced to confirmed ledger data — never estimated.',
    timestamp: 'Now',
  },
];

const QUICK_QUESTIONS = [
  'What is my current cash exposure?',
  'Which budget lines are over budget?',
  'How much delay cost have I accumulated?',
  'What is my projected net profit?',
  'When is Draw #3 expected to be approved?',
];

const MOCK_RESPONSES: Record<string, string> = {
  'cash': 'Your current **Developer Cash Exposure is $318,400**. This is calculated from Total Spend ($1,412,400) minus Lender Disbursed ($1,094,000). This represents out-of-pocket equity awaiting your next draw disbursement.',
  'budget': 'You have **2 budget lines with issues**: (1) Site Work is $4,000 over budget ($82,000 spent vs $78,000 approved) with no approved change order. (2) Rough Plumbing has a reconciliation flag — 82% of budget spent but only 55% progress verified.',
  'delay': 'Cumulative schedule delay is **82 days** across all milestones. At your daily carrying cost of $324/day, this translates to an estimated **$26,568 in additional interest cost**.',
  'profit': 'Based on your pro forma: Expected sale price ~$3,300,000 minus total estimated cost of $1,820,000 (budget) plus acquisition — projected net profit is approximately **$387,000 (17.2% ROI)**. This assumes current budget holds and sale closes within 90 days of CO.',
  'draw': 'Draw #3 was submitted Oct 1, 2026 for $185,000. Based on typical BCB Bank review timelines (12-15 business days), you should expect a response by **October 19-22, 2026**. No rejection flags detected yet.',
};

function getMockResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('cash') || lower.includes('exposure')) return MOCK_RESPONSES.cash;
  if (lower.includes('budget') || lower.includes('over')) return MOCK_RESPONSES.budget;
  if (lower.includes('delay') || lower.includes('schedule')) return MOCK_RESPONSES.delay;
  if (lower.includes('profit') || lower.includes('roi')) return MOCK_RESPONSES.profit;
  if (lower.includes('draw') || lower.includes('approval')) return MOCK_RESPONSES.draw;
  return 'I can answer questions about your budget variances, draw status, cash exposure, schedule delays, and projected ROI. Try asking one of the suggested questions above, or phrase your question around these topics.';
}

export function AIChatDrawer({ isOpen, onClose, projectId, projectName, userContext }: AIChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg || isThinking) return;
    setInput('');

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: msg,
      timestamp: 'Now',
    };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    setTimeout(() => {
      const reply: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: getMockResponse(msg),
        timestamp: 'Now',
      };
      setMessages(prev => [...prev, reply]);
      setIsThinking(false);
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[600px] max-h-[calc(100vh-120px)] bg-white shadow-2xl flex flex-col rounded-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-200">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-900">AI Financial Analyst</div>
              <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{projectName}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick questions */}
        <div className="px-5 py-3 bg-slate-50/50">
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.slice(0, 3).map(q => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="text-[11px] font-medium bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer shadow-sm"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5 bg-white">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 items-end ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-[13px] shadow-sm ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'}`}>
                <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex gap-3 items-end">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
          <div className="relative flex items-center">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Message AI Analyst..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full pl-4 pr-12 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-inner"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isThinking}
              className="absolute right-1.5 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 transition disabled:opacity-40 cursor-pointer shadow-md"
            >
              <Send className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 text-center font-medium">Traced to confirmed ledger data only</div>
      </div>
    </div>
  );
}
