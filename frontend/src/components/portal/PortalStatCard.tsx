import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PortalStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  iconClass?: string;
  color?: string;
  bg?: string;
  index?: number;
}

export const PortalStatCard: React.FC<PortalStatCardProps> = ({
  label,
  value,
  icon: Icon,
  subtext,
  trend,
  className,
  iconClass,
  color,
  bg,
  index = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "bg-card border border-border rounded-2xl p-4 md:p-6 flex flex-col gap-4 group hover:border-primary/30 transition-all shadow-xl",
        bg,
        className
      )}
    >
      <div className="flex justify-between items-start">
        <div
          className={cn(
            "h-10 w-10 md:h-11 md:w-11 rounded-xl flex items-center justify-center shrink-0 border",
            iconClass ? iconClass : "bg-primary/10 border-primary/20 text-primary",
            color
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        {subtext && (
          <span className="text-[10px] font-black uppercase text-muted-foreground bg-muted px-2 py-1 rounded-md border border-border">
            {subtext}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] md:text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-1">
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl md:text-3xl font-black tracking-tight text-foreground tabular-nums group-hover:text-primary transition-colors">
            {value}
          </p>
          {trend && (
            <span
              className={cn(
                "text-[10px] font-black",
                trend.isPositive ? "text-emerald-500" : "text-rose-500"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
