import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PulseLogo from "@/components/layout/PulseLogo";
import api from "@/lib/api";
import { toast } from "sonner";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await api.post("/auth/reset-password", {
        token,
        password,
      });
      if (data.success) {
        toast.success("Security credentials updated.");
        navigate("/auth");
      } else {
        toast.error(data.message || "Reset failed.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Token invalid or expired.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex bg-[#050505] text-white items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-3xl font-black mb-4">Invalid Access Link</h2>
          <p className="text-white/40 mb-8">
            This reset link is missing or corrupted.
          </p>
          <Button
            asChild
            className="bg-emerald-500 text-black rounded-full px-8"
          >
            <Link to="/auth">Auth Hub</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#050505] text-white selection:bg-emerald-500/30 overflow-hidden items-center justify-center p-8">
      <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-4 mb-12">
            <div className="h-12 w-12 bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center rounded-2xl">
              <PulseLogo size={28} />
            </div>
            <span className="text-3xl font-black brand-font tracking-tighter uppercase italic">
              City Pulse
            </span>
          </div>

          <h2 className="text-5xl font-medium tracking-tighter uppercase mb-4 italic">
            New Credentials.
          </h2>
          <p className="text-white/40 font-light italic">
            Update your access keyword for the pulse.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
              New Access Keyword
            </label>
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
              <Input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="YOUR NEW PASSWORD..."
                className="h-20 pl-16 bg-white/5 border-2 border-transparent focus:border-emerald-500/30 rounded-[1.5rem] font-medium text-sm tracking-wide transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
              Verify Keyword
            </label>
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
              <Input
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="CONFIRM PASSWORD..."
                className="h-20 pl-16 bg-white/5 border-2 border-transparent focus:border-emerald-500/30 rounded-[1.5rem] font-medium text-sm tracking-wide transition-all"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-20 bg-emerald-500 hover:bg-emerald-400 text-black rounded-[1.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-[0_20px_40px_rgba(16,185,129,0.2)] group transition-all duration-500 hover:scale-[1.02] active:scale-95"
          >
            {isLoading ? "Updating..." : "Authorize Update"}
            {!isLoading && (
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
            )}
          </Button>
        </form>

        <div className="mt-12 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] opacity-30">
          <ShieldCheck className="h-3 w-3" />
          End-to-End Encrypted Session
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
