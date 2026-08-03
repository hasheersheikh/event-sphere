import { useState } from "react";
import { cn } from "@/lib/utils";

interface ReadMoreProps {
  text: string;
  /** Number of lines shown when collapsed */
  collapsedLines?: number;
  className?: string;
}

/**
 * Truncates long text with a "More" toggle at the end. The text area keeps a
 * fixed line count when collapsed so the layout never jumps.
 */
const ReadMore = ({ text, collapsedLines = 3, className }: ReadMoreProps) => {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  const needsToggle = text.length > 120;

  return (
    <div>
      <p
        className={cn(
          "text-sm md:text-[15px] text-muted-foreground leading-relaxed font-medium",
          !expanded &&
            needsToggle &&
            "line-clamp-3 overflow-hidden",
          className
        )}
      >
        {text}
      </p>
      {needsToggle && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-neon-lime hover:text-neon-lime/80 transition-colors"
        >
          {expanded ? "Show Less" : "More"}
        </button>
      )}
    </div>
  );
};

export default ReadMore;
