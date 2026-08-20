import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface PaginationControlsProps {
  pagination: PaginationData;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  /** Plural entity label shown next to the count, e.g. ENTITIES / ATTENDEES */
  label?: string;
  /** Render the count row even when everything fits on one page */
  showWhenSinglePage?: boolean;
  /** Extra content in the right slot (replaces the page indicator), e.g. a footnote */
  rightSlot?: React.ReactNode;
  /** Surface styling for the wrapper row — border/background differ per page */
  className?: string;
}

export function PaginationControls({
  pagination,
  onPageChange,
  isLoading,
  label = "ENTITIES",
  showWhenSinglePage,
  rightSlot,
  className,
}: PaginationControlsProps) {
  const { total, page, limit, pages } = pagination;
  if (total === 0) return null;
  if (pages <= 1 && !showWhenSinglePage) return null;

  const from = (page - 1) * limit + 1;
  const to = limit === 0 ? total : Math.min(page * limit, total);

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row items-center justify-between gap-4",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
          Showing
        </span>
        <span className="text-[10px] font-black text-foreground tabular-nums">
          {from}–{to} of {total}
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
          {label}
        </span>
      </div>

      {pages > 1 && (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange?.(page - 1)}
            className="h-8 px-3 rounded-lg bg-background border-border hover:bg-primary/10 hover:text-primary disabled:opacity-30 text-[9px] font-black uppercase tracking-tighter italic"
          >
            PREV
          </Button>

          <div className="flex items-center gap-1 mx-2">
            {[...Array(pages)].map((_, i) => {
              const pageNum = i + 1;
              // Show only a window of page numbers when there are many
              if (
                pages > 7 &&
                pageNum !== 1 &&
                pageNum !== pages &&
                Math.abs(pageNum - page) > 2
              ) {
                if (Math.abs(pageNum - page) === 3) {
                  return (
                    <span key={pageNum} className="text-muted-foreground/30 px-1 font-black">
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange?.(pageNum)}
                  className={cn(
                    "h-8 w-8 rounded-lg text-[10px] font-black transition-all border",
                    page === pageNum
                      ? "bg-primary text-primary-foreground border-transparent shadow-[0_0_15px_rgba(var(--primary),0.3)] scale-110"
                      : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= pages || isLoading}
            onClick={() => onPageChange?.(page + 1)}
            className="h-8 px-3 rounded-lg bg-background border-border hover:bg-primary/10 hover:text-primary disabled:opacity-30 text-[9px] font-black uppercase tracking-tighter italic"
          >
            NEXT
          </Button>
        </div>
      )}

      <div className="hidden md:block">
        {rightSlot ?? (
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic opacity-40">
            Page {page} / {pages}
          </span>
        )}
      </div>
    </div>
  );
}
