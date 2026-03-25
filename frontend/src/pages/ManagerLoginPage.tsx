import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Zap,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PulseLogo from "@/components/layout/PulseLogo";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import api from "@/lib/api";

const ManagerLoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
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
        const result = await login(email, password, "event_manager");
        if (result.success) {
          toast.success("Manager Access Granted.");
          navigate("/portal");
        } else {
          toast.error(result.message || "Login failed.");
        }
      } else {
        const result = await register(name, email, password, "event_manager");
        if (result.success) {
          toast.success("Manager profile created.");
          navigate("/portal");
        } else {
          toast.error(result.message || "Registration failed.");
        }
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const [forgotEmail, setForgotEmail] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", {
        email: forgotEmail,
      });
      if (data.success) {
        toast.success("Reset link sent to your email.");
        setIsForgotOpen(false);
      } else {
        toast.error(data.message || "Failed to send reset link.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-background text-foreground selection:bg-emerald-500/30 overflow-hidden">
      {/* Left Side - Manager Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&q=80&w=2070"
            alt="Manager Atmosphere"
            className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-16 w-full max-w-xl mx-auto text-white">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center rounded-xl group-hover:border-primary/50 transition-colors">
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
              <div className="h-1 w-16 bg-primary mb-8 shadow-[0_0_20px_#10B981]" />
              <h1 className="text-4xl font-black tracking-tighter leading-none mb-4 uppercase italic">
                Manager <br />
                <span className="text-primary">Dashboard.</span>
              </h1>
              <p className="text-base text-zinc-400 font-light leading-relaxed max-w-xs">
                Precision tools for world-class organizers. Host your vision with Event Sphere.
              </p>
            </motion.div>
          </div>

          <div className="flex items-center gap-10 text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
            <span>Organizer Access</span>
            <span>Verified Identity</span>
            <span>v3.0.4</span>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 relative bg-background">
        <Link
          to="/staff/login"
          className="absolute top-10 left-10 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Staff Hub
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm relative z-10"
        >
          <div className="mb-14 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/30 bg-muted/50 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6 rounded-xl shadow-sm">
              <Zap className="h-3.5 w-3.5" />
              Manager Entry Point
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-3 italic text-foreground">
              {isLogin ? "Welcome Back." : "Start Hosting."}
            </h2>
            <p className="text-[12px] text-muted-foreground font-bold italic">
              {isLogin
                ? "Access your event manager center."
                : "Create your professional manager profile."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-1.5"
                >
                  <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                    Organization Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                    <Input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ACME EVENTS..."
                      className="h-14 pl-14 bg-muted/20 border-border focus:border-primary/50 rounded-xl font-black text-xs uppercase italic tracking-widest shadow-inner"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Business Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@pulse.com"
                  className="h-14 pl-14 bg-muted/20 border-border focus:border-primary/50 rounded-xl font-black text-xs uppercase italic tracking-widest shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Password
                </label>
                {isLogin && (
                  <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
                    <DialogTrigger asChild>
                      <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-foreground transition-colors">
                        Forgot?
                      </button>
                    </DialogTrigger>
                    <DialogContent className="bg-background border-border rounded-2xl sm:max-w-md p-8">
                      <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-black uppercase brand-font tracking-tighter italic">
                          Recover <span className="text-primary">Access.</span>
                        </DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={handleForgotPassword}
                        className="space-y-6"
                      >
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Registered Email
                          </label>
                          <Input
                            required
                            type="email"
                            placeholder="your@email.com"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            className="h-12 bg-muted/10 border-border focus:border-primary/50 rounded-xl text-xs uppercase font-black"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={isForgotLoading}
                          className="w-full h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px]"
                        >
                          {isForgotLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              Send Link
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                <Input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-14 pl-14 bg-muted/20 border-border focus:border-primary/50 rounded-xl font-black text-xs uppercase italic tracking-widest shadow-inner"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-16 mt-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-black uppercase tracking-[0.25em] text-[10px] shadow-2xl group transition-all hover:scale-[1.02] active:scale-95 border-none"
            >
              {isLoading
                ? "Connecting..."
                : isLogin
                  ? "Authorize Manager Session"
                  : "Establish Manager Entity"}
              {!isLoading && (
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              )}
            </Button>
          </form>

          <p className="mt-14 text-center text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            {isLogin ? "Want to host events?" : "Already a manager?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-primary hover:text-foreground transition-colors underline underline-offset-8"
            >
              {isLogin ? "Join the Network" : "Authenticate Access"}
            </button>
          </p>
        </motion.div>

        <div className="absolute bottom-10 left-10 md:left-24 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] opacity-50 italic text-muted-foreground/30">
          <ShieldCheck className="h-3 w-3 text-primary" />
          Manager Node Session • High Security Pulse Encryption
        </div>
      </div>
    </div>
  );
};

export default ManagerLoginPage;
