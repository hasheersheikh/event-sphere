import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Tailwind text color class for the icon, e.g. "text-violet-500" */
  color?: string;
  /** Rounded-corner scale: "md" for tighter cards, "lg" for larger feature cards */
  size?: "md" | "lg";
  className?: string;
}

/**
 * Reusable feature card. On mobile the icon sits on the left with the title
 * above the description; on desktop it switches to a centered vertical layout.
 */
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  color = "text-primary",
  size = "md",
  className,
}: FeatureCardProps) => {
  const isLg = size === "lg";

  return (
    <div
      className={cn(
        "group flex flex-row md:flex-col gap-4 md:gap-4 p-5 md:p-8 rounded-2xl md:rounded-[2rem] bg-card/50 border border-border/50 backdrop-blur-xl hover:border-[hsl(71,100%,47%)]/30 transition-all duration-500 text-left md:text-center",
        isLg && "bg-card/30 backdrop-blur-sm md:rounded-[2.5rem]",
        className
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 md:mx-auto",
          isLg ? "h-12 w-12 md:h-14 md:w-14" : "h-11 w-11 md:h-12 md:w-12",
          color
        )}
      >
        <Icon className={cn("h-5 w-5 md:h-6 md:w-6", isLg && "md:h-7 md:w-7")} />
      </div>

      <div className="flex-1 min-w-0 space-y-1.5 md:space-y-2">
        <h3 className="text-base md:text-lg font-black tracking-tighter uppercase italic leading-tight">
          {title}
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;
