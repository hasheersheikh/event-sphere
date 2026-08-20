import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Loader2,
  ArrowLeft,
  Store,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PulseLogo from "@/components/layout/PulseLogo";
import { toast } from "sonner";
import api from "@/lib/api";

// Session timeout: 30 minutes in milliseconds
const SESSION_TIMEOUT = 30 * 60 * 1000;
// Activity events to track for idle detection
const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart", "click"];

const StoreOwnerLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Refs for timeout management
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Function to clear session timeout
  const clearSessionTimeout = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
  }, []);

  // Function to set session timeout
  const setSessionTimeout = useCallback(() => {
    clearSessionTimeout();
    sessionTimeoutRef.current = setTimeout(() => {
      logout();
    }, SESSION_TIMEOUT);
  }, [clearSessionTimeout]);

  // Function to reset timer on user activity
  const resetActivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setSessionTimeout();
  }, [setSessionTimeout]);

  // Logout function
  const logout = useCallback(() => {
    clearSessionTimeout();
    localStorage.removeItem("store-owner");
    localStorage.removeItem("lastActivity");
    // Remove all activity event listeners
    ACTIVITY_EVENTS.forEach((event) => {
      window.removeEventListener(event, resetActivityTimer);
    });
  }, [clearSessionTimeout, resetActivityTimer]);

  // Check session expiry on mount
  useEffect(() => {
    const savedOwner = localStorage.getItem("store-owner");
    const lastActivity = localStorage.getItem("lastActivity");

    if (savedOwner && lastActivity) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        localStorage.removeItem("store-owner");
        localStorage.removeItem("lastActivity");
      } else {
        // Session is valid, set up activity listeners and start timeout
        setSessionTimeout();
        ACTIVITY_EVENTS.forEach((event) => {
          window.addEventListener(event, resetActivityTimer);
        });
      }
    }

    // Cleanup function
    return () => {
      clearSessionTimeout();
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, resetActivityTimer);
      });
    };
  }, [resetActivityTimer, setSessionTimeout, clearSessionTimeout]);

  // Update last activity timestamp on user activity
  useEffect(() => {
    const updateActivity = () => {
      localStorage.setItem("lastActivity", Date.now().toString());
    };

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, updateActivity);
    });

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post("/store-owner/login", { email, password });
      // Store separately from main app auth
      localStorage.setItem("store-owner", JSON.stringify(data));
      localStorage.setItem("lastActivity", Date.now().toString());

      // Start session timeout
      setSessionTimeout();

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
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
              <Store className="h-5 w-5 text-amber-500" />
            </div>
            <h2 className="text-2xl font-black tracking-tight mb-2">Owner Login</h2>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your store dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-12 rounded-xl bg-background/50 border-border/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <PasswordInput
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 h-12 rounded-xl bg-background/50 border-border/50"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-amber-500 text-white hover:bg-amber-600 font-black uppercase tracking-widest text-[10px] gap-2 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/30">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] text-muted-foreground font-medium">Secure Login</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] text-muted-foreground font-medium">30-min Session</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-center text-muted-foreground/60 mt-6">
            Sessions expire after 30 minutes of inactivity for security
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default StoreOwnerLoginPage;
