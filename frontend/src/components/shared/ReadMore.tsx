import { useState } from "react";
import { cn } from "@/lib/utils";

interface ReadMoreProps {
  text: string;
  /** Number of lines shown when collapsed */
  collapsedLines?: number;
  className?: string;
}

/**
 * Truncates long text with a "More" toggle at the end. The wrapper keeps the
 * exact same height whether collapsed or expanded — expanding never grows the
 * box, it just makes the same-size box scrollable — so a parent layout (like
 * a modal) never reflows when the user toggles it.
 */
const ReadMore = ({ text, collapsedLines = 3, className }: ReadMoreProps) => {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  const needsToggle = text.length > 120;
  const fixedHeight = `${collapsedLines * 1.6}em`;

  return (
    <div>
      <div
        style={needsToggle ? { maxHeight: fixedHeight } : undefined}
        className={cn(needsToggle && (expanded ? "overflow-y-auto pr-1" : "overflow-hidden"))}
      >
        <p
          className={cn(
            "text-sm md:text-[15px] text-muted-foreground leading-relaxed font-medium",
            className
          )}
          style={
            !expanded && needsToggle
              ? {
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: collapsedLines,
                  overflow: "hidden",
                }
              : undefined
          }
        >
          {text}
        </p>
      </div>
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
