import React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface PortalGridProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  isLoading?: boolean;
  pagination?: PaginationData;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  columns?: number;
  gap?: string;
  className?: string;
  header?: React.ReactNode;
}

export function PortalGrid<T>({
  data,
  renderItem,
  isLoading,
  pagination,
  onPageChange,
  emptyMessage = "No items detected in this sector.",
  columns = 3,
  gap = "gap-4",
  className,
  header,
}: PortalGridProps<T>) {
  const gridColsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[columns] || "grid-cols-1 md:grid-cols-3";

  return (
    <div className="space-y-6">
      {header && <div className="mb-2">{header}</div>}
      <AnimatePresence mode="wait">
        <motion.div
          key={pagination?.page || "static"}
          initial={{ opacity: 0.95, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0.95, y: -4 }}
          transition={{ duration: 0.2 }}
          className={cn("grid", gridColsClass, gap, className)}
        >
          <AnimatePresence>
            {isLoading ? (
              // Enhanced Loading Skeletons
              [...Array(columns * 2)].map((_, i) => (
                <div 
                  key={`skeleton-${i}`}
                  className="h-32 rounded-2xl bg-muted/10 border border-border/40 animate-pulse flex flex-col p-4 gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-muted/20" />
                    <div className="space-y-2 flex-1">
                      <div className="h-2 w-20 bg-muted/20 rounded-full" />
                      <div className="h-1.5 w-32 bg-muted/20 rounded-full" />
                    </div>
                  </div>
                  <div className="mt-auto h-8 w-full bg-muted/10 rounded-xl" />
                </div>
              ))
            ) : data.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-card border border-border rounded-xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic opacity-60">
                  {emptyMessage}
                </p>
              </div>
            ) : (
              data.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ 
                    duration: 0.2,
                    delay: Math.min(index * 0.02, 0.1) 
                  }}
                >
                  {renderItem(item, index)}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {pagination && pagination.pages > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/5 p-4 rounded-xl border border-border mt-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
              Record Count:
            </span>
            <span className="text-[10px] font-black text-foreground">
              {pagination.total} ENTITIES
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || isLoading}
              onClick={() => onPageChange?.(pagination.page - 1)}
              className="h-8 px-3 rounded-lg bg-background border-border hover:bg-primary/10 hover:text-primary disabled:opacity-30 text-[9px] font-black uppercase tracking-tighter italic"
            >
              PREV
            </Button>
            
            <div className="flex items-center gap-1 mx-2">
              {[...Array(pagination.pages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  pagination.pages > 7 &&
                  pageNum !== 1 &&
                  pageNum !== pagination.pages &&
                  Math.abs(pageNum - pagination.page) > 2
                ) {
                  if (Math.abs(pageNum - pagination.page) === 3) {
                    return <span key={pageNum} className="text-muted-foreground/30 px-1 font-black">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange?.(pageNum)}
                    className={cn(
                      "h-8 w-8 rounded-lg text-[10px] font-black transition-all border",
                      pagination.page === pageNum
                        ? "bg-primary text-black border-transparent shadow-[0_0_15px_rgba(var(--primary),0.3)] scale-110"
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
              disabled={pagination.page >= pagination.pages || isLoading}
              onClick={() => onPageChange?.(pagination.page + 1)}
              className="h-8 px-3 rounded-lg bg-background border-border hover:bg-primary/10 hover:text-primary disabled:opacity-30 text-[9px] font-black uppercase tracking-tighter italic"
            >
              NEXT
            </Button>
          </div>

          <div className="hidden md:block">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic opacity-40">
              Sector {pagination.page} / {pagination.pages}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
