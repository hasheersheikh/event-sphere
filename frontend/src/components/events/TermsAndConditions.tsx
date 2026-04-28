import React from "react";
import { Shield, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const TermsAndConditions = ({ className }: { className?: string }) => {
  const terms = [
    { text: "All tickets booked in one transaction to be redemmed on the same day. Cannot cancel or carry forward any ticket from the transaction.", icon: AlertTriangle },
    { text: "Ticket once booked is non-refundable", icon: AlertTriangle },
  ];

  return (
    <div className={cn("space-y-8", className)}>
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Shield className="h-6 w-6 text-primary" />
          <h3 className="text-2xl font-black uppercase tracking-tight">Terms & Conditions</h3>
        </div>

        <div className="grid gap-4">
          {terms.map((term, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="flex gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors group"
            >
              <div className="shrink-0 mt-1">
                <term.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm font-medium leading-relaxed text-foreground/80 group-hover:text-foreground transition-colors">
                {term.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>


    </div>
  );
};

export default TermsAndConditions;
