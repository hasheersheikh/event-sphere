import { motion } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";

interface PublicPageHeaderProps {
  pillText: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  themeColor?: "primary" | "amber" | "default";
  size?: "md" | "lg";
  className?: string;
  children?: React.ReactNode;
}

export const PublicPageHeader = ({
  pillText,
  title,
  subtitle,
  themeColor = "primary",
  size = "md",
  className,
  children,
}: PublicPageHeaderProps) => {
  // Determine color classes
  let pillColor = "text-primary";
  let lineBg = "bg-primary/30";

  if (themeColor === "amber") {
    pillColor = "text-amber-500";
    lineBg = "bg-amber-500/30";
  } else if (themeColor === "default") {
    pillColor = "text-foreground";
    lineBg = "bg-border/50";
  }

  // Determine size classes
  const titleSize =
    size === "lg"
      ? "text-5xl md:text-7xl leading-[0.85]"
      : "text-4xl md:text-5xl leading-none";

  const subtitleSize =
    size === "lg"
      ? "text-lg md:text-xl max-w-2xl"
      : "text-sm md:text-base max-w-xl";

  return (
    <header className={cn("max-w-4xl mx-auto text-center mb-10 space-y-4", className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center gap-3 mb-2"
      >
        <div className={cn("h-px w-10 rounded-full", lineBg)} />
        <span
          className={cn(
            "text-[9px] font-black uppercase tracking-[0.4em]",
            pillColor
          )}
        >
          {pillText}
        </span>
        <div className={cn("h-px w-10 rounded-full", lineBg)} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("font-black tracking-tighter", titleSize)}
      >
        {title}
      </motion.h1>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "text-muted-foreground font-medium mx-auto italic leading-relaxed",
            subtitleSize
          )}
        >
          {subtitle}
        </motion.p>
      )}

      {children}
    </header>
  );
};

export default PublicPageHeader;
