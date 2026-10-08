import React from 'react';
import {
  Building2,
  Settings,
  HardHat,
  Hammer,
  DollarSign,
  Calculator,
  TrendingUp,
  Eye,
  Check,
} from 'lucide-react';
import { QuestionOption } from '../types';

const ICON_MAP: Record<string, React.ElementType> = {
  Building2,
  Settings,
  HardHat,
  Hammer,
  DollarSign,
  Calculator,
  TrendingUp,
  Eye,
};

interface OnboardingSingleSelectProps {
  questionId: string;
  options: QuestionOption[];
  selectedValue?: any;
  onSelect: (value: any) => void;
}

export const OnboardingSingleSelect: React.FC<OnboardingSingleSelectProps> = ({
  options,
  selectedValue,
  onSelect,
}) => {
  return (
    <div className="space-y-3">
      {options.map(opt => {
        const isSelected = selectedValue === opt.value;
        const IconComponent = opt.iconName ? ICON_MAP[opt.iconName] : null;

        return (
          <div
            key={opt.value}
            data-testid={`option-${opt.value}`}
            onClick={() => onSelect(opt.value)}
            className={`relative flex items-start gap-4 p-4 sm:p-5 rounded-xl border cursor-pointer transition-all ${
              isSelected
                ? 'border-slate-900 bg-slate-50/70 ring-1 ring-slate-900'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/30'
            }`}
          >
            {IconComponent && (
              <div className={`p-2.5 rounded-lg shrink-0 mt-0.5 ${
                isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <IconComponent className="w-5 h-5" />
              </div>
            )}

            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-semibold text-sm sm:text-base text-slate-900">
                  {opt.label}
                </span>
                {opt.badge && (
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded">
                    {opt.badge}
                  </span>
                )}
              </div>
              {opt.description && (
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                  {opt.description}
                </p>
              )}
            </div>

            <div className="absolute top-5 right-5">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                isSelected ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white'
              }`}>
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
