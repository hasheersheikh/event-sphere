import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  /** Rendered in the left panel on desktop / top block on mobile */
  media: ReactNode;
  /** Rendered in the right panel (scrollable, fixed-height) */
  children: ReactNode;
  /** Tailwind class for the media panel width on desktop, e.g. "sm:w-72" */
  mediaClassName?: string;
}

/**
 * Shared detail modal used by Trending Venues, Trending Nagpurkars, etc.
 * The pop-up always has a fixed height: the media panel fixes the height and
 * the content column scrolls internally, so a long description never grows
 * or reshapes the whole pop-up.
 * Mobile: bottom sheet sliding up, rounded top corners. Desktop: centered
 * two-panel modal with the media on the left and scrollable content on the right.
 */
const DetailModal = ({
  open,
  onClose,
  media,
  children,
  mediaClassName = "sm:w-72",
}: DetailModalProps) => {
  // Lock body scroll while open (prevent background scrolling behind the sheet)
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%", opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="relative bg-card border border-border/60 rounded-t-3xl sm:rounded-2xl overflow-hidden w-full sm:max-w-4xl shadow-2xl flex flex-col sm:flex-row max-h-[92vh] sm:max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Media panel — proper 4:5 portrait that sets the modal height */}
            <div className={`flex-shrink-0 relative ${mediaClassName}`}>
              {media}
            </div>

            {/* Content — scrolls internally; modal height is fixed by the 4:5 media */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 relative min-w-0 min-h-0">{children}</div>

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-background/90 border border-border/50 flex items-center justify-center hover:bg-muted transition-colors z-10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DetailModal;
