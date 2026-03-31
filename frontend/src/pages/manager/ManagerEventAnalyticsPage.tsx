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

      <div className="relative z-10 space-y-10 pb-20 p-6 md:p-10">
        {/* Header */}
        <header className="flex flex-col gap-8 border-b border-border/50 pb-10">
          <Link
            to="/portal/events"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Roster
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-10 bg-primary/20 rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
                  Intelligence Portal
                </span>
                <div
                  className={`h-2 w-2 rounded-full ${event.isApproved ? "bg-emerald-500 shadow-[0_0_15px_#10B981]" : "bg-orange-500 shadow-[0_0_15px_#F97316] animate-pulse"}`}
                />
              </div>
              <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.8]">
                {event.title}
              </h1>
            </div>
            <div className="flex gap-4">
              <Link to={`/events/${event._id}`} target="_blank">
                <Button
                  className="h-14 px-10 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-[9px] hover:bg-primary transition-all active:scale-95 shadow-xl flex items-center gap-3"
                >
                  Public Listing <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card/30 backdrop-blur-xl border border-border/50 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-xl hover:border-primary/30 transition-all duration-500">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6 flex items-center justify-between italic">
              Gross Revenue
              <IndianRupee className="h-4 w-4 opacity-30" />
            </div>
            <div className="text-3xl font-black italic tracking-tighter tabular-nums">
              ₹{stats.grossRevenue.toLocaleString()}
            </div>
            <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
          </div>

          <div className="bg-card/30 backdrop-blur-xl border border-border/50 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-xl hover:border-rose-500/30 transition-all duration-500">
            <div className="text-[10px] font-black uppercase tracking-widest text-rose-500/60 mb-6 flex items-center justify-between italic">
              Platform Fee
              <ShieldAlert className="h-4 w-4 opacity-30" />
            </div>
            <div className="text-3xl font-black italic tracking-tighter text-rose-500/80 tabular-nums">
              -₹{stats.platformCommission.toLocaleString()}
            </div>
            <div className="text-[9px] font-black uppercase mt-4 text-muted-foreground/40 tracking-[0.2em] italic">
              {stats.commissionInfo.value}
              {stats.commissionInfo.type === "percentage" ? "%" : " FLAT"} Deal
            </div>
          </div>

          <div className="bg-primary/5 backdrop-blur-xl border-2 border-primary/20 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-[0_0_50px_rgba(var(--primary),0.05)] hover:border-primary/40 transition-all duration-500">
            <div className="absolute top-6 right-6">
              <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-6 flex items-center justify-between italic">
              Net Revenue
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-4xl font-black italic tracking-tighter text-emerald-400 tabular-nums">
              ₹{stats.netRevenue.toLocaleString()}
            </div>
          </div>

          <div className="bg-card/30 backdrop-blur-xl border border-border/50 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-xl hover:border-primary/30 transition-all duration-500">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6 flex items-center justify-between italic">
              Tickets Sold
              <Ticket className="h-4 w-4 opacity-30" />
            </div>
            <div className="text-3xl font-black italic tracking-tighter tabular-nums">
              {stats.totalTicketsSold}
              <span className="text-sm font-light text-muted-foreground/20 ml-2">
                / {stats.capacity}
              </span>
            </div>
            <div className="mt-4">
                <Progress value={sellThroughRate} className="h-1 bg-muted rounded-full" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 pt-10">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-16">
            <section>
              <div className="flex items-center justify-between border-b border-border/50 pb-6 mb-10">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-3 italic">
                  <BarChart3 className="h-3 w-3" />
                  Revenue Velocity
                </h2>
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Sync: Active</span>
              </div>
              <div className="bg-card/20 backdrop-blur-xl border border-border/50 p-10 rounded-[3rem] flex items-end justify-between h-56 gap-4 shadow-2xl overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />
                {salesHistory.map((s, i) => {
                  const max = Math.max(...salesHistory.map((d) => d.amount)) || 1;
                  const height = (s.amount / max) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-6 group relative z-10"
                    >
                      <div className="w-full h-40 relative flex items-end">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                          className="w-full bg-primary/20 group-hover:bg-primary/50 transition-all duration-500 rounded-xl relative"
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                <span className="text-[10px] font-black italic bg-card px-2 py-1 rounded-lg border border-border shadow-2xl">₹{s.amount}</span>
                            </div>
                        </motion.div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/60 transition-colors group-hover:text-primary">
                        {s.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between border-b border-border/50 pb-6 mb-10">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-3 italic">
                  <Ticket className="h-3 w-3" />
                  Artifact Distribution
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {ticketStats.map((tt, i) => (
                  <div
                    key={i}
                    className="bg-card/20 backdrop-blur-xl border border-border/50 p-10 rounded-[3rem] group hover:border-primary/30 transition-all duration-500 shadow-xl"
                  >
                    <div className="flex justify-between items-start mb-10">
                      <div className="space-y-2">
                        <h4 className="font-black italic uppercase text-xl leading-none tracking-tighter text-foreground">
                          {tt.name}
                        </h4>
                        <div className="inline-block px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-[9px] font-black uppercase tracking-widest text-muted-foreground italic">
                          ₹{tt.price.toLocaleString()} Unit
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black italic tracking-tighter text-foreground tabular-nums leading-none mb-2">{tt.sold}</div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">
                          Admitted
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">
                            <span>Capacity Usage</span>
                            <span>{Math.round((tt.sold / tt.capacity) * 100)}%</span>
                        </div>
                        <Progress
                            value={(tt.sold / tt.capacity) * 100}
                            className="h-2 bg-muted/40 rounded-full overflow-hidden"
                        />
                    </div>
                    <div className="mt-10 pt-8 border-t border-border/40 flex justify-between items-center group-hover:border-primary/20 transition-colors">
                      <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest italic">
                        Revenue Impact
                      </span>
                      <span className="text-lg font-black italic text-primary tabular-nums">
                        ₹{tt.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Recent Transactions Column */}
          <div className="lg:col-span-4 space-y-16">
            <section>
              <div className="flex items-center justify-between border-b border-border/50 pb-6 mb-10">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-3 italic">
                  <Clock className="h-3 w-3" />
                  Live Sync
                </h2>
              </div>
              <div className="space-y-4">
                {recentBookings.length > 0 ? (
                  recentBookings.map((b, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-8 rounded-[2.5rem] bg-card/20 backdrop-blur-xl border border-border/50 hover:border-primary/30 transition-all duration-500 shadow-lg group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="space-y-1">
                            <div className="font-black italic uppercase text-sm tracking-tight truncate max-w-[180px] text-foreground">
                            {b.userName}
                            </div>
                            <div className="text-[9px] font-medium text-muted-foreground italic truncate max-w-[180px]">{b.userEmail}</div>
                        </div>
                        <div className="font-black italic text-lg text-primary tabular-nums shrink-0">
                          ₹{b.totalAmount.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic relative z-10">
                        <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                        <span className="bg-muted/50 px-2 py-0.5 rounded-lg border border-border/50 text-foreground">
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
