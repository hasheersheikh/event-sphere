import React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { PaginationControls, PaginationData } from "@/components/portal/PaginationControls";

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

      {pagination && (
        <PaginationControls
          pagination={pagination}
          onPageChange={onPageChange}
          isLoading={isLoading}
          className="bg-muted/5 p-4 rounded-xl border border-border mt-6"
        />
      )}
    </div>
  );
}
