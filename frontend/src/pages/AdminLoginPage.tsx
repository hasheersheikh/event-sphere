import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  Lock,
  Mail,
  ChevronRight,
  ArrowLeft,
  Key,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";

const AdminLoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", {
        ...formData,
        role: "admin", // Default to admin for this page, but server will verify
      });

      const { user, token } = response.data;
      if (user.role !== "admin" && user.role !== "event_manager") {
        toast.error("Unauthorized individual. Access denied.");
        setIsLoading(false);
        return;
      }

      login(user, token);
      toast.success(`Access Granted: Welcome back, ${user.name}`);
      navigate("/portal");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--mnkhan-charcoal)] font-sans selection:bg-orange-500/30">
      {/* Left Side - Security Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden border-r-4 border-white/10">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 grayscale"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--mnkhan-charcoal)] via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-20 w-full max-w-2xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-4 group">
            <div className="h-12 w-12 bg-white flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-[var(--mnkhan-charcoal)]" />
            </div>
            <span className="text-2xl font-black tracking-tighter brand-font text-white uppercase italic">
              City Pulse Internal
            </span>
          </Link>

          <div>
            <div className="h-1 w-20 bg-[var(--mnkhan-orange)] mb-10" />
            <h1 className="text-6xl font-black text-white italic tracking-tighter leading-none uppercase mb-8">
              Administrative <br />
              <span className="text-[var(--mnkhan-orange)]">
                Command Center.
              </span>
            </h1>
            <p className="text-xl text-white/50 font-medium leading-relaxed max-w-md italic">
              Secure access gateway for verified creators and system
              administrators. Unauthorized access is strictly prohibited and
              monitored.
            </p>
          </div>

          <div className="flex items-center gap-10 text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">
            <span>Encrypted Layer v4.2</span>
            <span>Secure SSL</span>
            <span>ID: PULSE-ADMIN-01</span>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-20 relative bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="mb-12">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[var(--mnkhan-gray-bg)] border-2 border-[var(--mnkhan-charcoal)] text-[10px] font-black uppercase tracking-[0.3em] text-[var(--mnkhan-charcoal)] mb-8">
              <ShieldAlert className="h-4 w-4 text-[var(--mnkhan-orange)]" />
              Restricted Access
            </div>
            <h2 className="text-4xl font-black brand-font tracking-tighter uppercase leading-none mb-4">
              Initialize Session
            </h2>
            <p className="text-[var(--mnkhan-text-muted)] font-bold italic">
              Enter your administrative credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--mnkhan-text-muted)] ml-1">
                Secure Email ID
              </label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mnkhan-text-muted)] group-focus-within:text-[var(--mnkhan-orange)] transition-colors" />
                <Input
                  type="email"
                  placeholder="IDENTIFIER..."
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="h-20 pl-16 bg-[var(--mnkhan-gray-bg)] border-2 border-transparent focus:border-[var(--mnkhan-charcoal)] rounded-none font-black text-xs uppercase tracking-widest placeholder:text-muted-foreground/30 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--mnkhan-text-muted)] ml-1">
                Access Keyword
              </label>
              <div className="relative group">
                <Key className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mnkhan-text-muted)] group-focus-within:text-[var(--mnkhan-orange)] transition-colors" />
                <Input
                  type="password"
                  placeholder="ENCRYPTED PASSWORD..."
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="h-20 pl-16 bg-[var(--mnkhan-gray-bg)] border-2 border-transparent focus:border-[var(--mnkhan-charcoal)] rounded-none font-black text-xs uppercase tracking-widest placeholder:text-muted-foreground/30 transition-all"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-20 bg-[var(--mnkhan-charcoal)] hover:bg-black text-white rounded-none font-black uppercase tracking-[0.4em] text-xs group transition-all"
            >
              {isLoading ? "AUTHORIZING..." : "VERIFY IDENTITY"}
              <ChevronRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </Button>
          </form>

          <Link
            to="/"
            className="mt-12 inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[var(--mnkhan-text-muted)] hover:text-[var(--mnkhan-charcoal)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-[var(--mnkhan-orange)]" />
            Abort & Exit to Public Site
          </Link>
        </motion.div>

        <div className="absolute bottom-10 text-[9px] font-bold text-[var(--mnkhan-text-muted)] uppercase tracking-[0.2em] opacity-30">
          System Monitoring Active • Unauthorized access will be recorded
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
