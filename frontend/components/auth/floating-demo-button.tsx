"use client";

import { useState, useRef, useEffect } from "react";
import {
  GripVertical,
  ChevronDown,
  X,
  Loader2,
  Building2,
  HardHat,
  BarChart3,
  Briefcase,
  TrendingUp,
} from "lucide-react";

export interface DemoAccount {
  id: string;
  role: string;
  name: string;
  email: string;
  icon: typeof Building2;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "owner",
    role: "Owner",
    name: "Marcus Vance",
    email: "m.vance@vancedev.com",
    icon: Building2,
  },
  {
    id: "cfo",
    role: "CFO",
    name: "Sarah Lin",
    email: "s.lin@vancedev.com",
    icon: BarChart3,
  },
  {
    id: "pm",
    role: "PM",
    name: "David Ross",
    email: "d.ross@vancedev.com",
    icon: Briefcase,
  },
  {
    id: "gc",
    role: "GC",
    name: "Frank Miller",
    email: "frank@apexconstruction.com",
    icon: HardHat,
  },
  {
    id: "investor",
    role: "Investor",
    name: "Elena Rostova",
    email: "e.rostova@meridiancap.com",
    icon: TrendingUp,
  },
];

interface FloatingDemoButtonProps {
  onSelectDemo: (demo: DemoAccount) => void;
  isPending?: boolean;
  activeDemoId?: string | null;
  currentEmail?: string;
}

export function FloatingDemoButton({
  onSelectDemo,
  isPending = false,
  activeDemoId = null,
  currentEmail = "",
}: FloatingDemoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, mouseX: 0, mouseY: 0 });
  const hasMovedRef = useRef(false);

  // Set default initial position on mount (bottom-right)
  useEffect(() => {
    const defaultWidth = 160;
    const defaultHeight = 40;
    const initialX = Math.max(16, window.innerWidth - defaultWidth - 24);
    const initialY = Math.max(16, window.innerHeight - defaultHeight - 24);
    setPosition({ x: initialX, y: initialY });
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Keep within bounds on resize
  useEffect(() => {
    const handleResize = () => {
      if (!position) return;
      const elWidth = containerRef.current?.offsetWidth || 220;
      const elHeight = containerRef.current?.offsetHeight || 220;
      const maxX = Math.max(16, window.innerWidth - elWidth - 16);
      const maxY = Math.max(16, window.innerHeight - elHeight - 16);

      setPosition((prev) => {
        if (!prev) return null;
        return {
          x: Math.min(Math.max(16, prev.x), maxX),
          y: Math.min(Math.max(16, prev.y), maxY),
        };
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [position]);

  // Adjust position if expanding pushes it off-screen
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const elWidth = containerRef.current.offsetWidth || 220;
    const elHeight = containerRef.current.offsetHeight || 220;
    const maxX = Math.max(16, window.innerWidth - elWidth - 16);
    const maxY = Math.max(16, window.innerHeight - elHeight - 16);

    setPosition((prev) => {
      if (!prev) return prev;
      let adjustedX = prev.x;
      let adjustedY = prev.y;

      if (adjustedY > maxY) adjustedY = Math.max(16, maxY);
      if (adjustedX > maxX) adjustedX = Math.max(16, maxX);

      if (adjustedX !== prev.x || adjustedY !== prev.y) {
        return { x: adjustedX, y: adjustedY };
      }
      return prev;
    });
  }, [isOpen]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button")) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = {
      x: position?.x ?? 0,
      y: position?.y ?? 0,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.mouseX;
    const deltaY = e.clientY - dragStartRef.current.mouseY;

    if (Math.hypot(deltaX, deltaY) > 4) {
      hasMovedRef.current = true;
    }

    if (hasMovedRef.current) {
      const elWidth = containerRef.current?.offsetWidth || 160;
      const elHeight = containerRef.current?.offsetHeight || 40;
      const maxX = Math.max(16, window.innerWidth - elWidth - 16);
      const maxY = Math.max(16, window.innerHeight - elHeight - 16);

      const newX = Math.min(Math.max(16, dragStartRef.current.x + deltaX), maxX);
      const newY = Math.min(Math.max(16, dragStartRef.current.y + deltaY), maxY);

      setPosition({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);

    if (!hasMovedRef.current && !isOpen) {
      setIsOpen(true);
    }
  };

  const stylePosition: React.CSSProperties = position
    ? { left: `${position.x}px`, top: `${position.y}px` }
    : { right: "24px", bottom: "24px" };

  return (
    <div
      ref={containerRef}
      style={stylePosition}
      className="fixed z-50 select-none touch-none text-slate-800"
    >
      {!isOpen ? (
        /* Simple Collapsed Button */
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={() => {
            if (!hasMovedRef.current) {
              setIsOpen(true);
            }
          }}
          className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 cursor-grab active:cursor-grabbing cursor-pointer"
          title="Drag to move • Click to choose demo user"
        >
          <GripVertical className="h-3.5 w-3.5 text-slate-400" />
          <span>Demo sign-in</span>
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </div>
      ) : (
        /* Simple Clean Popover */
        <div className="w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-1.5 pb-1.5 mb-1 border-b border-slate-100">
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex-1 cursor-grab active:cursor-grabbing py-0.5 select-none"
              title="Drag to move"
            >
              <GripVertical className="h-3.5 w-3.5 text-slate-400" />
              <span>Demo accounts</span>
            </div>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              title="Close"
              aria-label="Close demo accounts"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Account Rows */}
          <div className="space-y-0.5">
            {DEMO_ACCOUNTS.map((demo) => {
              const isSelected = currentEmail === demo.email;
              const isPendingThis = isPending && activeDemoId === demo.id;

              return (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => onSelectDemo(demo)}
                  disabled={isPending}
                  className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-slate-100 text-slate-900 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{demo.role}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-normal">
                      {demo.name}
                    </span>
                    {isPendingThis && (
                      <Loader2 className="h-3 w-3 animate-spin text-slate-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
