import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EditorStep } from "@/lib/watch-editor-types";

const STEPS: { step: EditorStep; label: string }[] = [
  { step: 1, label: "Details" },
  { step: 2, label: "Gallery" },
  { step: 3, label: "Hands" },
  { step: 4, label: "Dial" },
  { step: 5, label: "Save" },
];

interface Props {
  currentStep: EditorStep;
  completedSteps: number[];
  onStepClick: (step: EditorStep) => void;
}

export function StepIndicator({ currentStep, completedSteps, onStepClick }: Props) {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-2xl mx-auto mb-10">
      {STEPS.map(({ step, label }, i) => {
        const isCompleted = completedSteps.includes(step);
        const isCurrent = currentStep === step;
        const canClick = isCompleted || step < currentStep;

        return (
          <div key={step} className="flex items-center">
            {/* Step circle + label */}
            <button
              onClick={() => canClick && onStepClick(step)}
              disabled={!canClick}
              className={cn(
                "flex flex-col items-center gap-1.5 group",
                canClick ? "cursor-pointer" : "cursor-default"
              )}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  isCompleted
                    ? "bg-gold text-background"
                    : isCurrent
                      ? "ring-2 ring-gold bg-transparent text-gold"
                      : "bg-surface-elevated text-muted-foreground/40 border border-gold/10"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step}
              </div>
              <span
                className={cn(
                  "text-[10px] tracking-[0.15em] uppercase transition-colors",
                  isCurrent
                    ? "text-gold"
                    : isCompleted
                      ? "text-gold/70"
                      : "text-muted-foreground/40"
                )}
              >
                {label}
              </span>
            </button>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "w-12 sm:w-16 h-px mx-2 transition-colors",
                  completedSteps.includes(step) ? "bg-gold/50" : "bg-gold/10"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
