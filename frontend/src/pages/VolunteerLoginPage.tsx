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
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import PulseLogo from "@/components/layout/PulseLogo";
import api from "@/lib/api";

const VolunteerLoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { setAuthUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", {
        ...formData,
        role: "volunteer",
      });

      const data = response.data;

      if (data.role !== "volunteer") {
        throw new Error("Invalid credential level for access control.");
      }

      setAuthUser(data);
      toast.success("Logged in successfully. Scanner ready.");
      navigate("/scanner/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-background flex font-sans overflow-hidden text-foreground">
      {/* Visual Side (Dark Theme Stay) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-20 overflow-hidden border-r border-border bg-zinc-950">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-black to-black" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px]" />

          <Link to="/" className="relative z-10 flex items-center gap-3 group">
            <div className="h-10 w-10 bg-muted border border-border flex items-center justify-center rounded-xl group-hover:border-primary/50 transition-colors">
              <PulseLogo size={24} />
            </div>
            <span className="text-2xl font-black italic tracking-tighter uppercase text-white">
              City Pulse
            </span>
          </Link>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-emerald-500 mb-6 font-black uppercase tracking-[0.4em] text-[10px]">
            <QrCode className="h-4 w-4" />
            Scanner Node Login
          </div>
          <h1 className="text-4xl font-black brand-font tracking-tighter uppercase text-white leading-[0.9]">
            Scanner <br />
            <span className="text-emerald-500">Login.</span>
          </h1>
          <p className="text-base text-muted-foreground/60 font-light mt-6 max-w-sm leading-relaxed italic">
            Secure entry point for event personnel. Verify tickets and track
            attendance in real-time.
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
              event credentials.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20 bg-background border-l border-border relative">
        <Link
          to="/staff/login"
          className="absolute top-10 left-10 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Staff Hub
        </Link>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-12"
        >
          <div className="space-y-6">
            <h2 className="text-4xl font-black uppercase brand-font tracking-tighter italic text-foreground">
              Scanner <span className="text-emerald-500">Gate.</span>
            </h2>
            <div className="flex items-center gap-4 p-5 bg-muted/40 border border-border rounded-2xl shadow-sm">
              <Info className="h-6 w-6 text-emerald-500 shrink-0" />
              <p className="text-sm text-muted-foreground font-medium italic leading-relaxed">
                Use the credentials provided by your event manager to
                access the scanner portal.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase text-muted-foreground ml-1 tracking-widest">
                Volunteer Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="volunteer@system.puls"
                  className="h-16 bg-muted/20 border-border focus:border-emerald-500/20 pl-16 rounded-xl font-black text-xs uppercase tracking-widest text-foreground placeholder:text-muted-foreground/30 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-black uppercase text-muted-foreground tracking-widest">
                  Scanner Password
                </label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="h-16 bg-muted/20 border-border focus:border-emerald-500/20 pl-16 rounded-xl font-black text-xs uppercase tracking-widest text-foreground placeholder:text-muted-foreground/30 transition-all shadow-inner"
                />
              </div>
            </div>

            <Button
              disabled={isLoading}
              className="w-full h-16 bg-foreground text-background hover:bg-emerald-500 hover:text-white rounded-xl text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-300 shadow-xl relative overflow-hidden group border-none hover:scale-[1.01] active:scale-95"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {isLoading ? (
                  "Synchronizing..."
                ) : (
                  <>
                    Initiate Scanner Control{" "}
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </span>
            </Button>
          </form>

          <div className="text-center">
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest italic">
              Event Control Node • Sync Status:{" "}
              <span className="text-emerald-500">Online</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VolunteerLoginPage;
