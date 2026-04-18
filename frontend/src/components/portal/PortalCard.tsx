import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PortalCardProps {
  title?: string;
  icon?: LucideIcon;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export const PortalCard: React.FC<PortalCardProps> = ({
  title,
  icon: Icon,
  subtitle,
  actions,
  children,
  className,
  contentClassName,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-card border border-border rounded-2xl shadow-xl overflow-hidden relative",
        className
      )}
    >
      {(title || Icon || actions) && (
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border/50">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-muted flex items-center justify-center border border-border/50">
                <Icon className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg md:text-xl font-black uppercase brand-font tracking-tighter italic">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn("p-4 md:p-6", contentClassName)}>{children}</div>
    </motion.section>
  );
};
