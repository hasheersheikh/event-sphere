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
  const { setAuthUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", {
        ...formData,
        role: "admin", // Default to admin for this page, but server will verify
      });

      const data = response.data;
      if (data.role !== "admin" && data.role !== "event_manager") {
        toast.error("Unauthorized access denied.");
        setIsLoading(false);
        return;
      }

      setAuthUser(data);
      toast.success(`Access Granted: Welcome back, ${data.name}`);
      navigate("/portal");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-background font-sans selection:bg-orange-500/30 overflow-hidden text-foreground">
      {/* Left Side - Security Visual (Stays Dark) */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden border-r-4 border-white/10 bg-zinc-950">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 grayscale"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--mnkhan-charcoal)] via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-16 w-full max-w-2xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-4 group">
            <div className="h-10 w-10 bg-white flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-[var(--mnkhan-charcoal)]" />
            </div>
            <span className="text-xl font-black tracking-tighter brand-font text-white uppercase italic">
              City Pulse Internal
            </span>
          </Link>

          <div>
            <div className="h-1 w-20 bg-[var(--mnkhan-orange)] mb-10" />
            <h1 className="text-4xl font-black text-white italic tracking-tighter leading-none uppercase mb-6">
              Executive <br />
              <span className="text-[var(--mnkhan-orange)]">
                Control Center.
              </span>
            </h1>
            <p className="text-base text-muted-foreground/60 font-medium leading-relaxed max-w-sm italic">
              Secure access for verified organizers and administrators.
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
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 relative bg-background">
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
          className="w-full max-w-md"
        >
          <div className="mb-14">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-muted/50 border border-border text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-8 rounded-full shadow-sm">
              <ShieldAlert className="h-4 w-4" />
              Secure Admin Login
            </div>
            <h2 className="text-4xl font-black tracking-tighter uppercase leading-none mb-4 text-foreground italic">
              Admin <span className="text-emerald-500">Login.</span>
            </h2>
            <p className="text-[12px] text-muted-foreground font-bold italic">
              Enter admin credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Admin Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  type="email"
                  placeholder="USER@SYSTEM..."
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="h-16 pl-14 bg-muted/20 border-border focus:border-emerald-500/50 rounded-xl font-black text-xs uppercase tracking-widest text-foreground placeholder:text-muted-foreground/30 transition-all shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Admin Password
              </label>
              <div className="relative group">
                <Key className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="h-16 pl-14 bg-muted/20 border-border focus:border-emerald-500/50 rounded-xl font-black text-xs uppercase tracking-widest text-foreground placeholder:text-muted-foreground/30 transition-all shadow-inner"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-black uppercase tracking-[0.4em] text-xs group transition-all shadow-xl hover:scale-[1.01] active:scale-95"
            >
              {isLoading ? "Checking..." : "Confirm Access"}
              <ChevronRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <Link
            to="/"
            className="mt-12 inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-all group"
          >
            <ArrowLeft className="h-4 w-4 text-emerald-500 group-hover:-translate-x-2 transition-transform" />
            Back to Public Site
          </Link>
        </motion.div>

        <div className="absolute bottom-10 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] italic">
          System Monitoring Active • Unauthorized access will be flagged
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
