"use client";

import React from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepItem {
  id: string | number;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav aria-label="Progress Stepper" className={cn("w-full py-4", className)}>
      <ol className="flex items-center justify-between gap-2 md:gap-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <li key={step.id} className="flex-1 flex items-center">
              <div className="flex items-center gap-3 w-full">
                <div
                  className={cn(
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-caption font-bold transition-colors",
                    isCompleted
                      ? "bg-primary text-white"
                      : isCurrent
                      ? "border-2 border-primary bg-primary-subtle text-primary"
                      : "border border-border bg-subtle text-text-muted"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
                </div>

                <div className="hidden sm:block min-w-0 flex-1">
                  <div
                    className={cn(
                      "text-caption font-semibold leading-tight truncate",
                      isCurrent
                        ? "text-primary"
                        : isCompleted
                        ? "text-text-primary"
                        : "text-text-muted"
                    )}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-[11px] text-text-muted truncate mt-0.5">
                      {step.description}
                    </div>
                  )}
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden sm:block h-0.5 flex-1 bg-border/80 mx-2" />
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
