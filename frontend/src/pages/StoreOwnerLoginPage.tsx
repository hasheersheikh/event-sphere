import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PulseLogo from "@/components/layout/PulseLogo";
import { toast } from "sonner";
import api from "@/lib/api";

const StoreOwnerLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post("/store-owner/login", { email, password });
      // Store separately from main app auth
      localStorage.setItem("store-owner", JSON.stringify(data));
      toast.success(`Welcome back, ${data.name}!`);
      navigate("/store-owner/portal");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-background text-foreground selection:bg-amber-500/30 overflow-hidden">
      {/* Left Side - Store Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2070"
            alt="Retail Portal"
            className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-16 w-full max-w-xl mx-auto text-white">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center rounded-xl group-hover:border-amber-500/50 transition-colors">
              <PulseLogo size={24} />
            </div>
            <span className="text-2xl font-black brand-font tracking-tighter uppercase italic">
              City Pulse
            </span>
          </Link>

          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="h-1 w-16 bg-amber-500 mb-8 shadow-[0_0_20px_#F59E0B]" />
              <h1 className="text-4xl font-black tracking-tighter leading-none mb-4 uppercase italic">
                Store <br />
                <span className="text-amber-500">Portal.</span>
              </h1>
              <p className="text-base text-zinc-400 font-light leading-relaxed max-w-xs">
                Manage your shop, track exclusive event orders, and grow your local business hub.
              </p>
            </motion.div>
          </div>

          <div className="flex items-center gap-10 text-[9px] uppercase tracking-[0.4em] text-zinc-500 font-bold">
            <span>Vendor Access</span>
            <span>Verified Node</span>
            <span>v3.0.4</span>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 relative bg-background">
        <Link
          to="/"
          className="absolute top-10 left-10 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-amber-500 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Exit Portal
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm relative z-10"
        >
          <div className="mb-14 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-amber-500/30 bg-muted/50 text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-6 rounded-xl shadow-sm">
              <Zap className="h-3.5 w-3.5" />
              Store Entry Point
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-3 italic text-foreground">
              Welcome Back.
            </h2>
            <p className="text-[12px] text-muted-foreground font-bold italic">
              Access your personalized store management center.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Business Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-amber-500 transition-colors" />
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="store@pulse.com"
                  className="h-14 pl-14 bg-muted/20 border-border focus:border-amber-500/50 rounded-xl font-black text-xs uppercase italic tracking-widest shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Password
                </label>
                <button 
                  type="button"
                  className="text-[10px] font-black uppercase tracking-widest text-amber-500 hover:text-foreground transition-colors opacity-50 cursor-not-allowed"
                  title="Contact admin to reset password"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-amber-500 transition-colors" />
                <Input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-14 pl-14 bg-muted/20 border-border focus:border-amber-500/50 rounded-xl font-black text-xs uppercase italic tracking-widest shadow-inner"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-16 mt-8 bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-black uppercase tracking-[0.25em] text-[10px] shadow-2xl group transition-all hover:scale-[1.02] active:scale-95 border-none"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Authorize Store Session
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-14 text-center text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Problems logging in?
            <span className="ml-2 text-amber-500 italic">Contact Admin</span>
          </p>
        </motion.div>

        <div className="absolute bottom-10 left-10 md:left-24 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] opacity-50 italic text-muted-foreground/30">
          <ShieldCheck className="h-3 w-3 text-amber-500" />
          Store Node Session • High Security Pulse Encryption
        </div>
      </div>
    </div>
  );
};

export default StoreOwnerLoginPage;
