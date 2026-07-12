import React, { useState } from "react";
import { Shield, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const DEFAULT_TERMS = [
  "Tickets are non-cancelable, non-refundable and non-transferable.",
  "Guestlist may shut earlier than the mentioned time once it is full.",
  "21+ Government Issued Identification is needed for entry- Digilocker ID or physical ID (subject to clubs acceptance) of driver's license or Aadhar Card",
  "Entry must be no later than the time on your ticket.",
  "Follow the dress code if any.",
  "Management reserves the right to refuse entry in accordance with licensing law.",
  "Consumption of illegal substances is strictly prohibited.",
  "Internet handling fee per ticket maybe levied. Please check the total amount.",
  "No refund/replacement on a purchased ticket. Tickets you purchase are for personal use. You must not transfer (or seek to transfer) the tickets in breach of the applicable terms. A breach of this condition will entitle us to cancel the tickets without prior notification, refund, compensation or liability.",
  "The management reserves the exclusive right without refund or other recourse, to refuse admission to anyone who is found to be in breach of these terms and conditions including, if necessary, ejecting the holder/s of the ticket from the venue after they have entered the premises.",
  "These terms and conditions are subject to change from time to time at the discretion of the organizer.",
];

const TermsAndConditions = ({ className, customTerms }: { className?: string; customTerms?: string[] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const terms = customTerms && customTerms.length > 0 ? customTerms : DEFAULT_TERMS;
  const visibleTerms = isExpanded ? terms : terms.slice(0, 1);
  const hiddenCount = terms.length - 1;

  return (
    <div className={cn("space-y-8", className)}>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-neon-lime" />
            <h3 className="text-2xl font-black uppercase tracking-tight">Terms & Conditions</h3>
          </div>
          {terms.length > 1 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[10px] font-black uppercase tracking-widest text-neon-lime hover:text-neon-lime/80 transition-colors flex items-center gap-1 bg-neon-lime/10 px-3 py-1 rounded-full border border-neon-lime/20"
            >
              {isExpanded ? (
                <>
                  <span>Show Less</span>
                  <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  <span>+{hiddenCount} More</span>
                  <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          )}
        </div>

        <div className="grid gap-3">
          <AnimatePresence initial={false}>
            {visibleTerms.map((term, idx) => (
              <motion.div
                key={idx}
                initial={isExpanded ? { opacity: 0, height: 0, y: -10 } : { opacity: 1, height: "auto", y: 0 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex gap-3 p-3 rounded-lg bg-muted/20 border border-border/40 hover:bg-muted/30 hover:border-neon-lime/30 transition-all duration-200 group overflow-hidden"
              >
                <div className="shrink-0 mt-0.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground group-hover:text-neon-lime transition-colors" />
                </div>
                <p className="text-xs font-medium leading-relaxed text-foreground/70 group-hover:text-foreground transition-colors">
                  {term}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default TermsAndConditions;
