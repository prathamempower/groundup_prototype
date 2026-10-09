import React from 'react';
import { Sparkles, Search, Command, LogOut, Building2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserRole } from '../../shared/types';
import { RoleSwitcherDropdown } from './header/RoleSwitcherDropdown';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface TopHeaderProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  onOpenAIChat: () => void;
  onSignOut?: () => void;
  breadcrumbs?: BreadcrumbItem[];
}

export function TopHeader({
  currentRole,
  onChangeRole,
  onOpenAIChat,
  onSignOut,
  breadcrumbs,
}: TopHeaderProps) {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
      <div className="px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand / Breadcrumbs */}
        <div className="flex items-center gap-2.5 min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate" aria-label="Breadcrumb">
              <Link
                to="/projects"
                className="hover:text-slate-900 transition flex items-center gap-1.5 px-1.5 py-1 rounded-md hover:bg-slate-100 text-slate-600"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold">Projects</span>
              </Link>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                  {crumb.href ? (
                    <Link
                      to={crumb.href}
                      className="hover:text-slate-900 transition px-1.5 py-1 rounded-md hover:bg-slate-100 truncate max-w-[200px]"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-bold text-slate-900 truncate max-w-[220px]">
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                <Building2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900 tracking-tight">GroundUp AI</span>
                <span className="text-slate-400 text-xs">/</span>
                <span className="text-xs font-medium text-slate-500 hidden sm:inline">Enterprise Workspace</span>
              </div>
            </div>
          )}
        </div>

        {/* Center: Command Palette Trigger */}
        <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
          <div className="w-full flex items-center gap-2 px-3 py-1.5 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs text-slate-400 transition cursor-pointer shadow-2xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="flex-1 truncate">Search projects, documents, budgets...</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-500 shadow-2xs">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </div>
        </div>

        {/* Right: Actions, Persona Simulator, AI & Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Ask AI Copilot */}
          <button
            onClick={onOpenAIChat}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
            title="Ask AI Construction Analyst"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Ask AI</span>
          </button>

          {/* Role / Persona Simulator Switcher */}
          <RoleSwitcherDropdown
            currentRole={currentRole}
            onChangeRole={onChangeRole}
          />

          {/* Sign Out */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
