import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Globe,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, setAuthUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "user" | "event_manager",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await login(
          formData.email,
          formData.password,
          formData.role,
        );
        if (result.success) {
          toast.success("Welcome back to City Pulse");
          navigate("/");
        } else {
          toast.error(result.message || "Invalid credentials provided");
        }
      } else {
        const { data } = await api.post("/auth/register", formData);
        const userData = { ...data.user, token: data.token };
        setAuthUser(userData);
        toast.success("Welcome to the community!");
        navigate("/");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Authentication failed. Please check your network.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      title: "Exclusive Access",
      desc: "Get early access to high-demand events.",
      icon: Sparkles,
    },
    {
      title: "Global Events",
      desc: "Connect with the most vibrant local scenes.",
      icon: Globe,
    },
    {
      title: "Secure Booking",
      desc: "Verified tickets with encrypted transactions.",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-orange-500/30">
      {/* Left Side - High Impact Brand Visual */}
      <div className="hidden lg:flex flex-1 relative bg-[var(--mnkhan-charcoal)] overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-105"
          style={{
            backgroundImage: `url('/Users/hashir/.gemini/antigravity/brain/979b63cb-17ca-4737-99ca-d4f3319698e3/auth_background_premium_1772661777123.png')`,
          }}
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 flex flex-col justify-between p-16 w-full max-w-2xl mx-auto">
          {/* Brand Name (No Logo as requested) */}
          <Link to="/" className="self-start group">
            <span className="text-2xl font-black tracking-tighter brand-font text-white uppercase italic">
              City Pulse
            </span>
          </Link>

          {/* Value Prop */}
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "circOut" }}
            >
              <h1 className="text-6xl font-black text-white italic tracking-tighter leading-[0.9] uppercase mb-8">
                The New Era of <br />
                <span className="text-[var(--mnkhan-orange)]">
                  Live Experiences
                </span>
              </h1>
              <p className="text-xl text-white/60 font-medium leading-relaxed max-w-md">
                Pulse represents the intersection of technology and art. Join us
                in redefining how events are discovered and celebrated.
              </p>
            </motion.div>

            <div className="space-y-8">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-5 group"
                >
                  <div className="h-12 w-12 rounded-none bg-white/5 border border-white/10 flex items-center justify-center text-[var(--mnkhan-orange)] group-hover:bg-[var(--mnkhan-orange)] group-hover:text-white transition-all duration-500">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-sm uppercase tracking-widest">
                      {f.title}
                    </h3>
                    <p className="text-white/40 text-sm mt-1 font-medium">
                      {f.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer Social/Info */}
          <div className="flex items-center gap-8 text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">
            <span className="hover:text-white transition-colors cursor-pointer">
              Instagram
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              X.COM
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Support Hub
            </span>
          </div>
        </div>
      </div>

      {/* Right Side - Refined Auth Form */}
      <div className="flex-[0.8] xl:flex-[0.7] flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 relative overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          {/* Header Section */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--mnkhan-gray-bg)] border border-[var(--mnkhan-gray-border)] text-[9px] font-black uppercase tracking-[0.3em] text-[var(--mnkhan-text-muted)] mb-6">
              <CheckCircle2 className="h-3 w-3 text-orange-500" />
              Authorized Access
            </div>
            <h2 className="text-5xl font-black brand-font tracking-tighter uppercase leading-none mb-4">
              {isLogin ? "Member Login" : "Sign up"}
            </h2>
            <p className="text-muted-foreground font-medium text-lg italic">
              {isLogin
                ? "Access your dashboard and reserved tickets."
                : "Join the most exclusive event community."}
            </p>
          </div>

          {/* Role Tabs */}
          <div className="flex bg-[var(--mnkhan-gray-bg)] p-1.5 rounded-none border-2 border-[var(--mnkhan-charcoal)] mb-10 relative">
            <motion.div
              layoutId="role-bg"
              className="absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] bg-[var(--mnkhan-charcoal)] hidden sm:block"
              animate={{ x: formData.role === "event_manager" ? "100%" : "0%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            />
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: "user" })}
              className={`relative flex-1 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 ${
                formData.role === "user"
                  ? "text-white sm:text-white"
                  : "text-[var(--mnkhan-text-muted)] hover:text-[var(--mnkhan-charcoal)]"
              }`}
            >
              <User className="h-4 w-4" />
              Attendee
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, role: "event_manager" })
              }
              className={`relative flex-1 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 ${
                formData.role === "event_manager"
                  ? "text-white sm:text-white"
                  : "text-[var(--mnkhan-text-muted)] hover:text-[var(--mnkhan-charcoal)]"
              }`}
            >
              <Calendar className="h-4 w-4" />
              Event Manager
            </button>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Identity Display Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[var(--mnkhan-orange)] transition-colors" />
                    <Input
                      type="text"
                      placeholder="FULL NAME..."
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="h-16 pl-14 bg-[var(--mnkhan-gray-bg)] border-2 border-transparent focus:border-[var(--mnkhan-charcoal)] rounded-none font-black text-xs uppercase tracking-widest placeholder:text-muted-foreground/50 transition-all"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Authentication Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[var(--mnkhan-orange)] transition-colors" />
                <Input
                  type="email"
                  placeholder="EMAIL ADDRESS..."
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="h-16 pl-14 bg-[var(--mnkhan-gray-bg)] border-2 border-transparent focus:border-[var(--mnkhan-charcoal)] rounded-none font-black text-xs uppercase tracking-widest placeholder:text-muted-foreground/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Access Keyword
                </label>
                {isLogin && (
                  <button
                    type="button"
                    className="text-[9px] font-black uppercase tracking-widest text-[var(--mnkhan-orange)] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[var(--mnkhan-orange)] transition-colors" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="PASSWORD..."
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="h-16 pl-14 pr-14 bg-[var(--mnkhan-gray-bg)] border-2 border-transparent focus:border-[var(--mnkhan-charcoal)] rounded-none font-black text-xs uppercase tracking-widest placeholder:text-muted-foreground/50 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[var(--mnkhan-orange)] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-16 bg-[var(--mnkhan-charcoal)] hover:bg-black text-white rounded-none font-black uppercase tracking-[0.3em] text-[11px] group transition-all"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? "Authenticate" : "Sign up"}
                  <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>

          {/* Switch Link */}
          <div className="mt-12 text-center">
            <p className="text-sm font-medium text-muted-foreground italic">
              {isLogin ? "New to the pulse?" : "Exisiting member?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[var(--mnkhan-charcoal)] font-black uppercase tracking-widest text-[10px] border-b-2 border-[var(--mnkhan-orange)] ml-2 hover:text-[var(--mnkhan-orange)] transition-colors"
              >
                {isLogin ? "Sign up" : "Secure Login"}
              </button>
            </p>
          </div>
        </motion.div>

        {/* Support Link */}
        <div className="mt-auto pt-16 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity cursor-pointer flex gap-4">
          <span>Terms</span>
          <span>Privacy</span>
          <span>v2.4.0</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
