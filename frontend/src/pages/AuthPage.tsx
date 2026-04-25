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
import { useGoogleLogin } from "@react-oauth/google";
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

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const role = "user";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      try {
        const result = await googleLogin(tokenResponse.access_token);
        if (result.success) {
          toast.success("Signed in with Google.");
          navigate("/events");
        } else {
          toast.error(result.message || "Google sign-in failed.");
        }
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => toast.error("Google sign-in failed."),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await login(email, password, role);
        if (result.success) {
          toast.success("Logged in successfully.");
          navigate("/events");
        } else {
          toast.error(result.message || "Login failed.");
        }
      } else {
        const result = await register(name, email, password, role);
        if (result.success) {
          toast.success("Account created successfully.");
          navigate("/events");
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
    <div className="min-h-screen flex bg-background text-foreground overflow-x-hidden">

      {/* Left Side — Atmospheric Image Panel */}
      <div className="hidden lg:flex w-[45%] shrink-0 relative overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=2070"
            alt="City Pulse Atmosphere"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-14 w-full text-white">
          <Link to="/" className="flex items-center gap-2.5 group w-fit">
            <div className="h-9 w-9 bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center rounded-xl">
              <PulseLogo size={20} />
            </div>
            <span className="font-display text-xl font-black tracking-tighter uppercase">
              City Pulse
            </span>
          </Link>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="h-px w-12 bg-white/40 mb-8" />
              <h1 className="font-display text-5xl font-black tracking-tighter leading-[0.88] mb-4 uppercase">
                Catch Your<br />
                <span className="text-white/60">Pulse.</span>
              </h1>
              <p className="text-sm text-white/50 font-medium leading-relaxed max-w-xs">
                Live shows, local gems, and everything worth showing up for — curated for your city.
              </p>
            </motion.div>
          </div>

          <div className="flex items-center gap-8 text-[9px] uppercase tracking-[0.4em] text-white/30">
            <span>Secure Access</span>
            <span>Verified Identity</span>
          </div>
        </div>
      </div>

      {/* Right Side — Auth Form */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">

        {/* Mobile logo bar */}
        <div className="lg:hidden flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
          <Link to="/" className="flex items-center gap-2.5">
            <PulseLogo size={18} />
            <span className="font-display text-lg font-black tracking-tighter uppercase">
              City <span className="text-primary">Pulse</span>
            </span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
        </div>

        {/* Desktop back link */}
        <Link
          to="/"
          className="hidden lg:flex absolute top-8 right-8 items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm"
          >
            {/* Header */}
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border/60 bg-muted/30 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-5 rounded-lg">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure Login
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-2 text-foreground">
                {isLogin ? "Welcome Back." : "Join Us."}
              </h2>
              <p className="text-[12px] text-muted-foreground font-medium">
                {isLogin
                  ? "Enter your credentials to continue."
                  : "Create your account to get started."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-2"
                  >
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                      <Input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="h-12 pl-11 bg-muted/20 border-border/60 focus:border-primary/50 rounded-xl text-sm"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                  <Input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="h-12 pl-11 bg-muted/20 border-border/60 focus:border-primary/50 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Password
                  </label>
                  {isLogin && (
                    <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
                      <DialogTrigger asChild>
                        <button className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                          Forgot?
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-background border-border/60 rounded-2xl sm:max-w-md p-8">
                        <DialogHeader className="mb-6">
                          <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                            Reset Password
                          </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleForgotPassword} className="space-y-5">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                              Email Address
                            </label>
                            <Input
                              required
                              type="email"
                              placeholder="your@email.com"
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              className="h-12 bg-muted/20 border-border/60 focus:border-primary/50 rounded-xl text-sm"
                            />
                          </div>
                          <Button
                            type="submit"
                            disabled={isForgotLoading}
                            className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest text-[10px]"
                          >
                            {isForgotLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>Send Reset Link <ArrowRight className="h-4 w-4 ml-2" /></>
                            )}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                  <Input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 pl-11 bg-muted/20 border-border/60 focus:border-primary/50 rounded-xl text-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-13 mt-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-black uppercase tracking-[0.25em] text-[11px] border-none"
                style={{ height: "52px" }}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Google Login */}
            <div className="mt-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">or</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>
              <button
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={isGoogleLoading}
                className="w-full h-12 flex items-center justify-center gap-3 bg-muted/20 hover:bg-muted/40 border border-border/60 hover:border-border rounded-xl transition-all duration-200 disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">
                  {isLogin ? "Sign in with Google" : "Sign up with Google"}
                </span>
              </button>
            </div>

            {/* Toggle login/signup */}
            <p className="mt-7 text-center text-[11px] font-bold text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-black text-foreground hover:text-primary transition-colors underline underline-offset-4"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>

            {/* Staff portal link */}
            <div className="mt-10 pt-8 border-t border-border/30 text-center">
              <Link
                to="/staff/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-muted/20 border border-border/40 hover:border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground rounded-xl transition-all"
              >
                <Zap className="h-3.5 w-3.5" />
                Staff Portal
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom badge */}
        <div className="hidden md:flex items-center justify-center gap-2 pb-6 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
          <ShieldCheck className="h-3 w-3" />
          End-to-End Encrypted
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
