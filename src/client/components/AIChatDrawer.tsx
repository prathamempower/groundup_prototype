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
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-slate-900" />
            </div>
            <div>
              <div className="font-semibold text-sm">AI Financial Analyst</div>
              <div className="text-xs text-slate-400">{projectName}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick questions */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <div className="text-xs text-slate-500 font-medium mb-2">Quick questions:</div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_QUESTIONS.slice(0, 3).map(q => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="text-xs bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full hover:bg-slate-900 hover:text-white hover:border-slate-900 transition cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>
                <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-slate-100 rounded-xl px-3.5 py-2.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-slate-200">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask about budget, draws, timeline..."
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isThinking}
              className="bg-slate-900 text-white w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-800 transition disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-slate-400 mt-2 text-center">AI answers are traced to confirmed ledger data only</div>
        </div>
      </div>
    </div>
  );
}
