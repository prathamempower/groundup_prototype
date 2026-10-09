import React from 'react';
import { ArrowRight } from 'lucide-react';
import { DemoPersona } from '../types';
import { DIRECT_LOGIN_PERSONAS } from '../personas';

interface DirectLoginGridProps {
  isLoading: boolean;
  loadingPersonaId: string | null;
  onDirectLogin: (persona: DemoPersona) => void;
}

export function DirectLoginGrid({
  isLoading,
  loadingPersonaId,
  onDirectLogin,
}: DirectLoginGridProps) {
  return (
    <div className="mt-8 pt-6 border-t border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
            Direct Role Login
          </span>
          <span className="text-[11px] text-slate-500">
            1-click access into dedicated role workspaces
          </span>
        </div>
        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {DIRECT_LOGIN_PERSONAS.length} Personas
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {DIRECT_LOGIN_PERSONAS.map((persona) => {
          const isBeingLoaded = loadingPersonaId === persona.id;
          return (
            <button
              key={persona.id}
              type="button"
              data-testid={`direct-login-${persona.role.toLowerCase()}`}
              disabled={isLoading}
              onClick={() => onDirectLogin(persona)}
              className="text-left p-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50 transition-all flex flex-col justify-between cursor-pointer group disabled:opacity-60 shadow-2xs"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-bold text-xs text-slate-900 group-hover:text-black truncate pr-1">
                  {persona.name}
                </span>
              </div>
              <div className="flex items-center justify-between w-full text-[11px] text-slate-500">
                <span className="truncate pr-1">{persona.roleTitle}</span>
                {isBeingLoaded ? (
                  <div className="w-3 h-3 border-2 border-slate-900 border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-slate-900 transition-colors shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
