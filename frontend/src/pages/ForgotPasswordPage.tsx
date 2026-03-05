import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import PulseLogo from "@/components/layout/PulseLogo";
import api from "@/lib/api";
import { toast } from "sonner";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      if (data.success) {
        setIsSent(true);
        toast.success("Reset link sent to your email.");
      } else {
        toast.error(data.message || "Failed to send reset link.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#050505] text-white selection:bg-emerald-500/30 overflow-hidden items-center justify-center p-8">
      <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-12 text-center">
          <Link to="/" className="inline-flex items-center gap-4 mb-12 group">
            <div className="h-12 w-12 bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center rounded-2xl group-hover:border-emerald-500/50 transition-colors">
              <PulseLogo size={28} />
            </div>
            <span className="text-3xl font-black brand-font tracking-tighter uppercase italic">
              City Pulse
            </span>
          </Link>

          <h2 className="text-5xl font-medium tracking-tighter uppercase mb-4 italic">
            {isSent ? "Check Email." : "Forgot Password?"}
          </h2>
          <p className="text-white/40 font-light italic">
            {isSent
              ? "We've sent a recovery link to your registered identity."
              : "Enter your email to receive a password recovery link."}
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                Identity Identifier
              </label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL ADDRESS..."
                  className="h-20 pl-16 bg-white/5 border-2 border-transparent focus:border-emerald-500/30 rounded-[1.5rem] font-medium text-sm tracking-wide transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-20 bg-emerald-500 hover:bg-emerald-400 text-black rounded-[1.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-[0_20px_40px_rgba(16,185,129,0.2)] group transition-all duration-500 hover:scale-[1.02] active:scale-95"
            >
              {isLoading ? "Processing..." : "Send Reset Link"}
              {!isLoading && (
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
              )}
            </Button>

            <Link
              to="/auth"
              className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors mt-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Auth Hub
            </Link>
          </form>
        ) : (
          <div className="text-center">
            <Button
              asChild
              className="w-full h-20 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-[1.5rem] font-black uppercase tracking-[0.4em] text-xs transition-all duration-500"
            >
              <Link to="/auth">Back to Login</Link>
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
