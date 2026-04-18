import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Ticket,
  IndianRupee,
  Users,
  ShieldAlert,
  TrendingUp,
  BarChart3,
  Calendar,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/api";
import { toast } from "sonner";

interface ManagerAnalytics {
  event: any;
  stats: {
    grossRevenue: number;
    platformCommission: number;
    netRevenue: number;
    totalTicketsSold: number;
    capacity: number;
    commissionInfo: {
      type: "flat" | "percentage";
      value: number;
    };
  };
  ticketStats: Array<{
    name: string;
    price: number;
    capacity: number;
    sold: number;
    revenue: number;
  }>;
  salesHistory: Array<{ date: string; amount: number }>;
  recentBookings: Array<{
    _id: string;
    userName: string;
    userEmail: string;
    totalAmount: number;
    tickets: Array<{ type: string; quantity: number }>;
    createdAt: string;
  }>;
}

const ManagerEventAnalyticsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<ManagerAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/manager/events/${id}/analytics`);
      setData(response.data);
    } catch (error) {
      toast.error("Failed to recover event metrics.");
      navigate("/portal/events");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-[10px] font-black uppercase tracking-[0.5em] text-primary">
          Syncing Metrics...
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { event, stats, ticketStats, salesHistory, recentBookings } = data;
  const sellThroughRate = (stats.totalTicketsSold / stats.capacity) * 100;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background Decor */}
      <div className="fixed inset-0 mesh-bg opacity-20 z-0" />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 space-y-6 pb-12 p-4 md:p-6">
        {/* Header */}
        <header className="flex flex-col gap-4 border-b border-border/50 pb-5">
          <Link
            to="/portal/events"
            className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors italic"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Roster
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="h-1.5 w-8 bg-primary/20 rounded-full" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary italic">
                  Intelligence Portal
                </span>
                <div
                  className={`h-1.5 w-1.5 rounded-full ${event.isApproved ? "bg-emerald-500 shadow-[0_0_10px_#10B981]" : "bg-orange-500 shadow-[0_0_10px_#F97316] animate-pulse"}`}
                />
              </div>
              <h1 className="text-2xl md:text-3xl font-black italic tracking-tight uppercase leading-none text-foreground drop-shadow-sm">
                {event.title}
              </h1>
            </div>
            <div className="flex gap-3">
              <Link to={`/events/${event._id}`} target="_blank">
                <Button
                  className="h-10 px-6 rounded-xl bg-foreground text-background font-black uppercase tracking-widest text-[8px] hover:bg-primary transition-all active:scale-95 shadow-lg flex items-center gap-2.5 italic"
                >
                  Public Listing <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card/30 backdrop-blur-xl border border-border/50 p-5 rounded-2xl relative overflow-hidden group shadow-lg shadow-black/5 hover:border-primary/30 transition-all duration-500">
            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 mb-4 flex items-center justify-between italic">
              Gross Revenue
              <IndianRupee className="h-3.5 w-3.5 opacity-20" />
            </div>
            <div className="text-xl font-black italic tracking-tight tabular-nums text-foreground">
              ₹{stats.grossRevenue.toLocaleString()}
            </div>
            <div className="absolute -bottom-4 -right-4 h-16 w-16 bg-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-1000" />
          </div>

          <div className="bg-card/30 backdrop-blur-xl border border-border/50 p-5 rounded-2xl relative overflow-hidden group shadow-lg shadow-black/5 hover:border-rose-500/30 transition-all duration-500">
            <div className="text-[9px] font-black uppercase tracking-widest text-rose-500/50 mb-4 flex items-center justify-between italic">
              Platform Fee
              <ShieldAlert className="h-3.5 w-3.5 opacity-20" />
            </div>
            <div className="text-xl font-black italic tracking-tight text-rose-500/80 tabular-nums">
              -₹{stats.platformCommission.toLocaleString()}
            </div>
            <div className="text-[8px] font-black uppercase mt-3 text-muted-foreground/30 tracking-widest italic">
              {stats.commissionInfo.value}
              {stats.commissionInfo.type === "percentage" ? "%" : " FLAT"} Deal
            </div>
          </div>

          <div className="bg-primary/5 backdrop-blur-xl border border-primary/20 p-5 rounded-2xl relative overflow-hidden group shadow-[0_0_30px_rgba(var(--primary),0.05)] hover:border-primary/40 transition-all duration-500">
            <div className="absolute top-4 right-4">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-primary mb-4 flex items-center justify-between italic opacity-70">
              Net Revenue
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <div className="text-2xl font-black italic tracking-tight text-emerald-400 tabular-nums">
              ₹{stats.netRevenue.toLocaleString()}
            </div>
          </div>

          <div className="bg-card/30 backdrop-blur-xl border border-border/50 p-5 rounded-2xl relative overflow-hidden group shadow-lg shadow-black/5 hover:border-primary/30 transition-all duration-500">
            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 mb-4 flex items-center justify-between italic">
              Tickets Sold
              <Ticket className="h-3.5 w-3.5 opacity-20" />
            </div>
            <div className="text-xl font-black italic tracking-tight tabular-nums text-foreground">
              {stats.totalTicketsSold}
              <span className="text-[10px] font-light text-muted-foreground/30 ml-2">
                / {stats.capacity}
              </span>
            </div>
            <div className="mt-3">
                <Progress value={sellThroughRate} className="h-1 bg-muted/30 rounded-full" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 pt-6">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-10">
            <section>
              <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
                <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2.5 italic">
                  <BarChart3 className="h-3 w-3" />
                  Revenue Velocity
                </h2>
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30 italic">Sync: Active</span>
              </div>
              <div className="bg-card/20 backdrop-blur-xl border border-border/50 p-6 rounded-2xl flex items-end justify-between h-40 gap-3 shadow-2xl overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />
                {salesHistory.map((s, i) => {
                  const max = Math.max(...salesHistory.map((d) => d.amount)) || 1;
                  const height = (s.amount / max) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-4 group relative z-10"
                    >
                      <div className="w-full h-24 relative flex items-end">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                          className="w-full bg-primary/20 group-hover:bg-primary/50 transition-all duration-500 rounded-md relative"
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                <span className="text-[8px] font-black italic bg-card px-1.5 py-0.5 rounded-md border border-border shadow-2xl">₹{s.amount}</span>
                            </div>
                        </motion.div>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground/50 transition-colors group-hover:text-primary">
                        {s.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
                <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2.5 italic">
                  <Ticket className="h-3 w-3" />
                  Artifact Distribution
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {ticketStats.map((tt, i) => (
                  <div
                    key={i}
                    className="bg-card/20 backdrop-blur-xl border border-border/50 p-6 rounded-2xl group hover:border-primary/30 transition-all duration-500 shadow-xl shadow-black/5"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1.5">
                        <h4 className="font-black italic uppercase text-lg leading-none tracking-tight text-foreground">
                          {tt.name}
                        </h4>
                        <div className="inline-block px-2.5 py-0.5 rounded-lg bg-muted/30 border border-border/50 text-[8px] font-black uppercase tracking-widest text-muted-foreground/50 italic">
                          ₹{tt.price.toLocaleString()} Unit
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black italic tracking-tight text-foreground tabular-nums leading-none mb-1">{tt.sold}</div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30 italic">
                          Admitted
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-[7px] font-black uppercase tracking-widest text-muted-foreground/30 italic">
                            <span>Capacity Usage</span>
                            <span>{Math.round((tt.sold / tt.capacity) * 100)}%</span>
                        </div>
                        <Progress
                            value={(tt.sold / tt.capacity) * 100}
                            className="h-1 bg-muted/20 rounded-full overflow-hidden"
                        />
                    </div>
                    <div className="mt-6 pt-4 border-t border-border/40 flex justify-between items-center group-hover:border-primary/20 transition-colors">
                      <span className="text-[9px] font-black uppercase text-muted-foreground/40 tracking-widest italic leading-none">
                        Revenue Impact
                      </span>
                      <span className="text-lg font-black italic text-primary tabular-nums leading-none tracking-tight">
                        ₹{tt.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Recent Transactions Column */}
          <div className="lg:col-span-4 space-y-10">
            <section>
              <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
                <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2.5 italic">
                  <Clock className="h-3 w-3" />
                  Live Sync
                </h2>
              </div>
              <div className="space-y-3">
                {recentBookings.length > 0 ? (
                  recentBookings.map((b, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-5 rounded-2xl bg-card/20 backdrop-blur-xl border border-border/50 hover:border-primary/30 transition-all duration-500 shadow-lg group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 h-16 w-16 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                      <div className="flex justify-between items-start mb-3 relative z-10">
                        <div className="space-y-0.5">
                            <div className="font-black italic uppercase text-[11px] tracking-tight truncate max-w-[140px] text-foreground">
                            {b.userName}
                            </div>
                            <div className="text-[8px] font-medium text-muted-foreground/50 italic truncate max-w-[140px]">{b.userEmail}</div>
                        </div>
                        <div className="font-black italic text-base text-primary tabular-nums shrink-0">
                          ₹{b.totalAmount.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-muted-foreground/30 italic relative z-10">
                        <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                        <span className="bg-muted/30 px-1.5 py-0.5 rounded-md border border-border/50 text-foreground/70">
                          {b.tickets.reduce((sum, t) => sum + t.quantity, 0)}{" "}
                          PULSE
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-24 text-center italic text-muted-foreground/30 text-[10px] font-black uppercase tracking-[0.2em] bg-card/10 rounded-[3rem] border border-dashed border-border/50 leading-relaxed">
                    Void detected. <br /> No transactions logged.
                  </div>
                )}
              </div>
              <p className="mt-8 text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 text-center italic">
                Telemetry source: Primary Cache
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerEventAnalyticsPage;
