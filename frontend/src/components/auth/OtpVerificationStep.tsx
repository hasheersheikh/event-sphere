import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface OtpVerificationStepProps {
  email: string;
  title?: string;
  subtitle?: string;
  onVerify: (otp: string) => Promise<{ success: boolean; message?: string }>;
  onResend: () => Promise<{ success: boolean; message?: string }>;
  onBack: () => void;
  onVerified: () => void;
}

const RESEND_COOLDOWN_SECONDS = 30;

const OtpVerificationStep = ({
  email,
  title = "Verify Your Email",
  subtitle,
  onVerify,
  onResend,
  onBack,
  onVerified,
}: OtpVerificationStepProps) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code sent to your email.");
      return;
    }
    setIsVerifying(true);
    try {
      const result = await onVerify(otp);
      if (result.success) {
        onVerified();
      } else {
        toast.error(result.message || "Invalid or expired OTP.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setIsResending(true);
    try {
      const result = await onResend();
      if (result.success) {
        toast.success("A new code has been sent to your email.");
        setCooldown(RESEND_COOLDOWN_SECONDS);
      } else {
        toast.error(result.message || "Failed to resend code.");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border/60 bg-muted/30 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-5 rounded-lg">
          <ShieldCheck className="h-3.5 w-3.5" />
          Email Verification
        </div>
        <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase mb-2 text-foreground">
          {title}
        </h2>
        <p className="text-[12px] text-muted-foreground font-medium">
          {subtitle || (
            <>
              Enter the 6-digit code sent to <span className="text-foreground font-bold">{email}</span>
            </>
          )}
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-5">
        <Input
          required
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="••••••"
          className="h-14 text-center tracking-[0.6em] font-black text-xl bg-muted/20 border-border/60 focus:border-primary/50 rounded-xl"
          autoFocus
        />

        <Button
          type="submit"
          disabled={isVerifying}
          className="w-full h-13 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-black uppercase tracking-[0.25em] text-[11px] border-none"
          style={{ height: "52px" }}
        >
          {isVerifying ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Verify & Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:hover:text-muted-foreground"
        >
          {isResending
            ? "Sending..."
            : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend Code"}
        </button>
      </div>
    </motion.div>
  );
};

export default OtpVerificationStep;
