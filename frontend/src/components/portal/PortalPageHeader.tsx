import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortalPageHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const PortalPageHeader: React.FC<PortalPageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  actions,
  badge,
  className,
}) => {
  return (
    <header
      className={cn(
        "flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/50 pb-6 mb-6",
        className
      )}
    >
      <div className="flex items-center gap-5">
        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-lg shadow-primary/5">
          <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter brand-font uppercase italic text-foreground leading-none">
              {title.split(" ").map((word, i, arr) => (
                <span key={i}>
                  {i === arr.length - 1 ? (
                    <span className="text-primary underline decoration-primary/20 underline-offset-4">
                      {word}.
                    </span>
                  ) : (
                    word + " "
                  )}
                </span>
              ))}
            </h1>
            {badge && <div className="hidden md:block">{badge}</div>}
          </div>
          {subtitle && (
            <p className="text-muted-foreground font-bold italic mt-2 flex items-center gap-2 text-[11px]">
               {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
};
