import React from 'react';
import { QuestionField } from '../types';

interface OnboardingTextInputProps {
  value: string;
  placeholder?: string;
  onChange: (val: string) => void;
  onEnter: () => void;
}

export const OnboardingTextInput: React.FC<OnboardingTextInputProps> = ({
  value,
  placeholder,
  onChange,
  onEnter,
}) => (
  <div className="space-y-2">
    <input
      type="text"
      autoFocus
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') onEnter(); }}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl text-base font-normal focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors shadow-2xs"
    />
  </div>
);

interface OnboardingMultiFieldProps {
  fields: QuestionField[];
  values: Record<string, any>;
  onSubFieldChange: (fieldId: string, value: any) => void;
}

export const OnboardingMultiField: React.FC<OnboardingMultiFieldProps> = ({
  fields,
  values,
  onSubFieldChange,
}) => {
  const formatCurrency = (val: string | number) => {
    if (!val) return '';
    const num = Number(val.toString().replace(/[^0-9]/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString('en-US');
  };

  return (
    <div className="space-y-4">
      {fields.map(field => {
        const currentValue = values?.[field.id] || '';

        return (
          <div key={field.id} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.helper && (
                <span className="text-[11px] text-slate-400">{field.helper}</span>
              )}
            </div>

            {field.type === 'select' ? (
              <select
                value={currentValue}
                onChange={(e) => onSubFieldChange(field.id, e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors cursor-pointer"
              >
                <option value="">Select an option...</option>
                {field.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : field.type === 'currency' ? (
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                  $
                </span>
                <input
                  type="text"
                  value={currentValue ? formatCurrency(currentValue) : ''}
                  onChange={(e) => {
                    const rawNum = e.target.value.replace(/[^0-9]/g, '');
                    onSubFieldChange(field.id, rawNum ? Number(rawNum) : '');
                  }}
                  placeholder={field.placeholder}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors"
                />
              </div>
            ) : (
              <input
                type={field.type || 'text'}
                value={currentValue}
                onChange={(e) => onSubFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3.5 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
