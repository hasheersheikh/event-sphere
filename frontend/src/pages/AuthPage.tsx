import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PulseLogo from "@/components/layout/PulseLogo";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner"; // Assuming sonner is used for toasts, or I'll use a simple alert if not sure.

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"user" | "event_manager">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await login(email, password, role);
        if (result.success) {
          toast.success("Identity synced successfully.");
          navigate(role === "event_manager" ? "/portal" : "/events");
        } else {
          toast.error(result.message || "Authentication failed.");
        }
      } else {
        const result = await register(name, email, password, role);
        if (result.success) {
          toast.success("Presence initialized.");
          navigate(role === "event_manager" ? "/portal" : "/events");
        } else {
          toast.error(result.message || "Initialization failed.");
        }
      }
    } catch (error) {
      toast.error("Frequency interference detected. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#050505] text-white selection:bg-emerald-500/30 overflow-hidden">
      {/* Left Side - Fluid Abstract Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden border-r border-white/10">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=2070"
            alt="Fluid Pulse"
            className="w-full h-full object-cover opacity-60 scale-125 blur-[1px] animate-pulse-slow"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-24 w-full max-w-2xl mx-auto">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="h-12 w-12 bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center rounded-2xl group-hover:border-emerald-500/50 transition-colors">
              <PulseLogo size={28} />
            </div>
            <span className="text-3xl font-black brand-font tracking-tighter uppercase italic">
              City Pulse
            </span>
          </Link>

          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="h-1 w-20 bg-emerald-500 mb-10 shadow-[0_0_20px_#10B981]" />
              <h1 className="text-7xl font-medium tracking-tighter leading-none mb-8">
                Unfold Your <br />
                <span className="text-gradient italic font-light">
                  Experience.
                </span>
              </h1>
              <p className="text-xl text-white/40 font-light leading-relaxed max-w-md">
                Enter the flow of curated events and global connections. Your
                journey into the pulse starts here.
              </p>
            </motion.div>
          </div>

          <div className="flex items-center gap-10 text-[9px] font-black uppercase tracking-[0.4em] opacity-30">
            <span>Encrypted Protocol</span>
            <span>Identity Verified</span>
            <span>PULSE-AUTH-03</span>
          </div>
        </div>
      </div>

      {/* Right Side - Immersive Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-24 relative">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="mb-12 text-center md:text-left">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 glass-panel text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-8 rounded-full">
              <Sparkles className="h-3 w-3" />
              Auth Verification Hub
            </div>
            <h2 className="text-5xl font-medium tracking-tighter uppercase mb-4 italic">
              {isLogin ? "Welcome back." : "Initialize."}
            </h2>
            <p className="text-white/40 font-light italic">
              {isLogin
                ? "Authenticate your presence to continue."
                : "Create your unique presence in the pulse."}
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex p-1 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl mb-10">
            <button
              onClick={() => setRole("user")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${role === "user" ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white"}`}
            >
              <User className="h-4 w-4" />
              Attendee
            </button>
            <button
              onClick={() => setRole("event_manager")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${role === "event_manager" ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white"}`}
            >
              <Zap className="h-4 w-4" />
              Manager
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                    Display Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
                    <Input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="YOUR NAME..."
                      className="h-20 pl-16 bg-white/5 border-2 border-transparent focus:border-emerald-500/30 rounded-[1.5rem] font-medium text-sm tracking-wide transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Access Keyword
                </label>
                {isLogin && (
                  <Link
                    to="/forgot-password"
                    className="text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:text-white transition-colors"
                  >
                    Reset
                  </Link>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
                <Input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ENCRYPTED PASSWORD..."
                  className="h-20 pl-16 bg-white/5 border-2 border-transparent focus:border-emerald-500/30 rounded-[1.5rem] font-medium text-sm tracking-wide transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-20 bg-emerald-500 hover:bg-emerald-400 text-black rounded-[1.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-[0_20px_40px_rgba(16,185,129,0.2)] group transition-all duration-500 hover:scale-[1.02] active:scale-95"
            >
              {isLoading
                ? "Syncing..."
                : isLogin
                  ? "Authenticate Pulse"
                  : "Initialize Presence"}
              {!isLoading && (
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
              )}
            </Button>
          </form>

          <p className="mt-12 text-center text-xs font-medium text-white/40">
            {isLogin ? "New to the frequency?" : "Already synced?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-emerald-400 font-bold hover:text-white transition-colors underline underline-offset-4"
            >
              {isLogin ? "Create Identity" : "Auth Presence"}
            </button>
          </p>
        </motion.div>

        <div className="absolute bottom-10 left-10 md:left-24 inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] opacity-30">
          <ShieldCheck className="h-3 w-3" />
          End-to-End Encrypted Session
        </div>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; transform: scale(1.25); }
          50% { opacity: 0.8; transform: scale(1.3); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 15s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
