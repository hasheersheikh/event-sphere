import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepDefinition {
  title: string;
  icon: LucideIcon;
}

interface StepperProps {
  steps: StepDefinition[];
  /** 1-based, matches the page's currentStep state. */
  currentStep: number;
  /** 0-based — return true to show a red error-dot on that step's icon. */
  hasError?: (stepIndex: number) => boolean;
}

export const Stepper = ({ steps, currentStep, hasError }: StepperProps) => (
  <div className="mt-12 flex items-center justify-center max-w-2xl mx-auto">
    {steps.map((s, i) => {
      const StepIcon = s.icon;
      const isActive = currentStep === i + 1;
      const isCompleted = currentStep > i + 1;
      return (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-3">
            <div className={cn(
              "relative h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
              isActive ? "bg-primary border-primary scale-110" : isCompleted ? "bg-primary/20 border-primary/40 text-primary" : "bg-card border-border text-muted-foreground"
            )}>
              <StepIcon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "")} />
              {hasError?.(i) && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive ring-2 ring-background" />
              )}
            </div>
            <span className={cn("text-[10px] font-black uppercase tracking-widest", isActive ? "text-primary" : "text-muted-foreground")}>{s.title}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn("w-20 md:w-32 h-[2px] mx-2 md:mx-4 transition-all duration-700", isCompleted ? "bg-primary" : "bg-border")} />
          )}
        </div>
      );
    })}
  </div>
);
