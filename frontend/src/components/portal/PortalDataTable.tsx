import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  headerClassName?: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface PortalDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  pagination?: PaginationData;
  onPageChange?: (page: number) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  rowKey: keyof T | ((item: T) => string);
  onRowClick?: (item: T) => void;
  actions?: React.ReactNode;
}

export function PortalDataTable<T>({
  columns,
  data,
  isLoading,
  pagination,
  onPageChange,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "SEARCH...",
  emptyMessage = "No results detected.",
  rowKey,
  onRowClick,
  actions,
}: PortalDataTableProps<T>) {
  const getRowKey = (item: T) => {
    if (typeof rowKey === "function") return rowKey(item);
    return String(item[rowKey]);
  };

  return (
    <div className="space-y-4">
      {(onSearchChange || actions) && (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/20 p-3 rounded-xl border border-border">
          {onSearchChange && (
            <div className="relative w-full md:w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-background border border-border py-2 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest placeholder:opacity-40 focus:outline-none focus:border-primary/50 rounded-lg transition-all shadow-sm italic"
              />
            </div>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={pagination?.page || "static"}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.8 }}
            transition={{ duration: 0.15 }}
            className="overflow-x-auto"
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/10 text-foreground text-[9px] font-black uppercase tracking-[0.2em] border-b border-border italic">
                  {columns.map((col, i) => (
                    <th
                      key={i}
                      className={cn("px-4 py-3 first:pl-6 last:pr-6", col.headerClassName)}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                <AnimatePresence>
                  {isLoading ? (
                    // Detailed Row Skeletons
                    [...Array(pagination?.limit || 5)].map((_, rowIndex) => (
                      <tr key={`skeleton-${rowIndex}`} className="border-b border-border/10">
                        {columns.map((_, colIndex) => (
                          <td key={`skeleton-cell-${colIndex}`} className="px-4 py-4 first:pl-6 last:pr-6">
                            <div className="h-2 w-full bg-muted/40 rounded-full animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-8 py-20 text-center font-black uppercase text-[10px] tracking-widest text-muted-foreground italic opacity-60"
                      >
                        {emptyMessage}
                      </td>
                    </tr>
                  ) : (
                    data.map((item, index) => (
                      <motion.tr
                        key={getRowKey(item)}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ 
                          duration: 0.2,
                          delay: Math.min(index * 0.02, 0.1) // Capped delay for performance
                        }}
                        onClick={() => onRowClick?.(item)}
                        className={cn(
                          "hover:bg-primary/[0.02] border-b border-border/10 transition-colors group",
                          onRowClick && "cursor-pointer"
                        )}
                      >
                        {columns.map((col, i) => (
                          <td
                            key={i}
                            className={cn(
                              "px-4 py-3 first:pl-6 last:pr-6 align-middle",
                              col.className
                            )}
                          >
                            {typeof col.accessor === "function"
                              ? col.accessor(item)
                              : (item[col.accessor] as React.ReactNode)}
                          </td>
                        ))}
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>
        </AnimatePresence>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/10 p-4 rounded-xl border border-border mt-2">
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
                // Simple logic to show only a few page numbers
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
