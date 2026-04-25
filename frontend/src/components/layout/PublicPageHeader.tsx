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
  const pillColor =
    themeColor === "amber" ? "text-yellow-500" :
    themeColor === "default" ? "text-muted-foreground" :
    "text-primary";

  const titleSize =
    size === "lg"
      ? "text-5xl md:text-7xl leading-[0.85]"
      : "text-4xl md:text-5xl leading-none";

  const subtitleSize =
    size === "lg" ? "text-lg md:text-xl max-w-2xl" : "text-sm md:text-base max-w-xl";

  return (
    <header className={cn("max-w-4xl mx-auto text-center mb-10 space-y-4", className)}>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn("text-[10px] font-black uppercase tracking-[0.45em]", pillColor)}
      >
        {pillText}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={cn("font-black tracking-tighter", titleSize)}
      >
        {title}
      </motion.h1>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45 }}
          className={cn("text-muted-foreground font-medium mx-auto leading-relaxed", subtitleSize)}
        >
          {subtitle}
        </motion.p>
      )}

      {children}
    </header>
  );
};

export default PublicPageHeader;
