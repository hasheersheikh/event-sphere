import React from "react";
import { Shield, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
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
  const terms = customTerms && customTerms.length > 0 ? customTerms : DEFAULT_TERMS;

  return (
    <div className={cn("space-y-8", className)}>
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Shield className="h-6 w-6 text-neon-lime" />
          <h3 className="text-2xl font-black uppercase tracking-tight">Terms & Conditions</h3>
        </div>

        <div className="grid gap-3">
          {terms.map((term, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.03 }}
              className="flex gap-3 p-3 rounded-lg bg-muted/20 border border-border/40 hover:bg-muted/30 hover:border-neon-lime/30 transition-all duration-200 group"
            >
              <div className="shrink-0 mt-0.5">
                <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground group-hover:text-neon-lime transition-colors" />
              </div>
              <p className="text-xs font-medium leading-relaxed text-foreground/70 group-hover:text-foreground transition-colors">
                {term}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
