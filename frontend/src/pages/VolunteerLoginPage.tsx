import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Info,
  QrCode,
  MapPin,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import PulseLogo from "@/components/layout/PulseLogo";

const VolunteerLoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Re-use auth API - it should handle volunteer role now
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Auth failure");

      if (data.user.role !== "volunteer") {
        throw new Error("Invalid credential level for access control.");
      }

      login(data.token, data.user);
      toast.success("Identity verified. Scanner access granted.");
      navigate("/scanner");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex font-sans overflow-hidden">
      {/* Visual Side */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-20 overflow-hidden border-r border-border">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-background to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px]" />

        <Link to="/" className="relative z-10 flex items-center gap-4 group">
          <div className="h-12 w-12 bg-muted border border-border flex items-center justify-center rounded-xl group-hover:border-primary/50 transition-colors">
            <PulseLogo size={28} />
          </div>
          <span className="text-3xl font-black italic tracking-tighter uppercase text-white">
            City <span className="text-emerald-500">Pulse</span>
          </span>
        </Link>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-emerald-500 mb-6 font-black uppercase tracking-[0.4em] text-[10px]">
            <QrCode className="h-4 w-4" />
            Scanner Node Login
          </div>
          <h1 className="text-7xl font-black brand-font tracking-tighter uppercase text-white leading-[0.9]">
            Access <br />
            <span className="text-emerald-500">Control.</span>
          </h1>
          <p className="text-muted-foreground/60 text-xl font-light mt-8 max-w-lg leading-relaxed italic">
            Secure scanner gateway for production personnel. Verify entrance
            protocols and synchronize attendance.
          </p>
        </div>

        <div className="relative z-10 flex gap-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest">
              <MapPin className="h-4 w-4 text-emerald-500" /> Multi-Gate Sync
            </div>
            <p className="text-muted-foreground/60 text-[10px] font-medium leading-relaxed italic">
              Synchronize scanner data <br />
              across multiple entry points.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest">
              <Calendar className="h-4 w-4 text-emerald-500" /> Event Specific
            </div>
            <p className="text-muted-foreground/60 text-[10px] font-medium leading-relaxed italic">
              Locked to individual <br />
              production credentials.
            </p>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20 bg-zinc-950 border-l border-white/5 relative">
        <div className="absolute top-0 right-0 p-10 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <PulseLogo size={20} />
            <span className="font-black italic uppercase text-white tracking-tighter">
              Pulse
            </span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-12"
        >
          <div className="space-y-4">
            <h2 className="text-4xl font-black uppercase brand-font tracking-tighter italic text-white">
              Verify Personnel{" "}
              <span className="text-emerald-500">Identity.</span>
            </h2>
            <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
              <Info className="h-5 w-5 text-emerald-500 shrink-0" />
              <p className="text-xs text-zinc-400 font-medium italic">
                Use the credentials provided by your production manager to
                access the scanner portal.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">
                Identity Coordinate
              </label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="volunteer@system.puls"
                  className="h-20 bg-muted/5 border-border/10 focus:border-emerald-500/20 pl-16 rounded-xl border-border focus:border-emerald-500/20 pl-16 font-medium italic text-sm tracking-tight transition-all placeholder:text-zinc-700 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">
                  Access Protocol
                </label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="h-20 bg-muted/5 border-border/10 focus:border-emerald-500/20 pl-16 rounded-xl border-border focus:border-emerald-500/20 pl-16 font-medium italic text-sm tracking-tight transition-all placeholder:text-zinc-700 shadow-sm"
                />
              </div>
            </div>

            <Button
              disabled={isLoading}
              className="w-full h-16 bg-white text-black hover:bg-emerald-500 hover:text-black rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-xl relative overflow-hidden group border-none"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  "Synchronizing..."
                ) : (
                  <>
                    Authorize Portal{" "}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </span>
            </Button>
          </form>

          <div className="text-center">
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest italic">
              Production Control Node • Sync Status:{" "}
              <span className="text-emerald-500">Online</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VolunteerLoginPage;
