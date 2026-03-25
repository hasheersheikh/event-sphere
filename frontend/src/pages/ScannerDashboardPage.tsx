import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  QrCode,
  ArrowRight,
  LogOut,
  Info,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const ScannerDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: event, isLoading } = useQuery({
    queryKey: ["scanner-event", user?.eventId],
    queryFn: async () => {
      if (!user?.eventId) return null;
      const { data } = await api.get(`/events/${user.eventId}`);
      return data;
    },
    enabled: !!user?.eventId,
  });

  const handleLogout = () => {
    logout();
    navigate("/volunteer-login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-6 text-center">
          <div className="h-16 w-16 border-t-4 border-emerald-500 rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500">
            Synchronizing Node...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-emerald-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="max-w-md mx-auto px-6 py-12 relative z-10 space-y-12">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              Authorized Personnel
            </h2>
            <h1 className="text-2xl font-black italic tracking-tighter uppercase brand-font">
              {user?.name}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="h-10 w-10 rounded-xl bg-muted/50 border border-border flex items-center justify-center hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-500 transition-all"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        {/* Status Card */}
        <section className="space-y-6">
          <div className="bg-muted/30 border border-border rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck className="h-24 w-24 text-emerald-500" />
            </div>

            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                Connection Status: Active
              </span>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  Assigned Control Node
                </h3>
                <div className="space-y-2">
                  <h4 className="text-3xl font-black italic tracking-tighter uppercase leading-tight line-clamp-2">
                    {event?.title || "Operational Node"}
                  </h4>
                  <div className="flex items-center gap-2 text-muted-foreground/60 italic text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    {event?.date ? new Date(event.date).toLocaleDateString() : "--/--/--"}
                  </div>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-left">
                    Assigned Gate
                  </p>
                  <p className="text-xl font-black uppercase italic tracking-tighter text-emerald-600">
                    {user?.gate || "Primary Alpha"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-left">
                    Location Node
                  </p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    <p className="text-xs font-black uppercase tracking-widest truncate">
                      {event?.location || "Main Hub"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
            <Info className="h-5 w-5 text-emerald-500 shrink-0" />
            <p className="text-[11px] text-emerald-500/80 font-black tracking-wide uppercase italic leading-relaxed">
              Verify credentials and gate clearance for all participants at this node.
            </p>
          </div>
        </section>

        {/* Action Button */}
        <Button
          onClick={() => navigate("/scanner")}
          className="w-full h-20 bg-foreground text-background hover:bg-emerald-500 hover:text-black rounded-3xl text-sm font-black uppercase tracking-[0.3em] transition-all duration-300 shadow-2xl group border-none hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4"
        >
          <QrCode className="h-6 w-6 group-hover:rotate-12 transition-transform" />
          Initialize Scanner Protocol
          <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
        </Button>

        {/* Footer */}
        <div className="text-center pt-8">
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest italic opacity-40">
            Node Sync ID: {user?._id?.slice(-8).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScannerDashboardPage;
