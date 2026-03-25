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
    <div className="space-y-10 pb-20 bg-background p-6 md:p-10 text-foreground min-h-screen">
      {/* Header */}
      <header className="flex flex-col gap-6 border-b border-border pb-8">
        <Link
          to="/portal/events"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Roster
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                Event Analytics
              </span>
              <div
                className={`h-1.5 w-1.5 rounded-full ${event.isApproved ? "bg-emerald-500 shadow-[0_0_10px_#10B981]" : "bg-orange-500 shadow-[0_0_10px_#F97316] animate-pulse"}`}
              />
            </div>
            <h1 className="text-3xl md:text-5xl font-black brand-font tracking-tighter uppercase leading-[0.8]">
              {event.title}
            </h1>
          </div>
          <div className="flex gap-4">
            <Link to={`/events/${event._id}`} target="_blank">
              <Button
                variant="ghost"
                className="h-12 px-6 rounded-none bg-muted text-[10px] font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-all"
              >
                Public Listing <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border p-6 relative overflow-hidden group">
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center justify-between">
            Gross Revenue
            <IndianRupee className="h-4 w-4 opacity-20" />
          </div>
          <div className="text-2xl font-black brand-font italic tracking-tighter">
            ₹{stats.grossRevenue.toLocaleString()}
          </div>
        </div>

        <div className="bg-card border border-border p-6 relative overflow-hidden group">
          <div className="text-[10px] font-black uppercase tracking-widest text-rose-500/60 mb-4 flex items-center justify-between">
            Platform Fee
            <ShieldAlert className="h-4 w-4 opacity-20" />
          </div>
          <div className="text-2xl font-black brand-font italic tracking-tighter text-rose-500/80">
            -₹{stats.platformCommission.toLocaleString()}
          </div>
          <div className="text-[8px] font-black uppercase mt-3 text-muted-foreground tracking-widest">
            Model: {stats.commissionInfo.value}
            {stats.commissionInfo.type === "percentage" ? "%" : " FLAT"} Deal
          </div>
        </div>

        <div className="bg-card border-2 border-primary/20 p-6 relative overflow-hidden group shadow-[0_0_30px_rgba(16,185,129,0.05)]">
          <div className="absolute top-0 right-0 p-4">
            <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center justify-between">
            Net Revenue
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-3xl font-black brand-font italic tracking-tighter text-emerald-400">
            ₹{stats.netRevenue.toLocaleString()}
          </div>
        </div>

        <div className="bg-card border border-border p-6 relative overflow-hidden group">
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center justify-between">
            Tickets Sold
            <Ticket className="h-4 w-4 opacity-20" />
          </div>
          <div className="text-2xl font-black brand-font italic tracking-tighter">
            {stats.totalTicketsSold}{" "}
            <span className="text-sm font-light text-muted-foreground/30">
              / {stats.capacity}
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Sales Chart Simulation & Ticket Types */}
        <div className="lg:col-span-8 space-y-12">
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-muted-foreground flex items-center gap-3">
              <BarChart3 className="h-3 w-3" />
              Revenue Flow (Last 7 Days)
            </h2>
            <div className="bg-card border border-border p-6 flex items-end justify-between h-40 gap-2">
              {salesHistory.map((s, i) => {
                const max = Math.max(...salesHistory.map((d) => d.amount)) || 1;
                const height = (s.amount / max) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-4 group"
                  >
                    <div className="w-full bg-muted h-32 relative flex items-end overflow-hidden group-hover:bg-muted/50 transition-colors">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        className="w-full bg-primary/40 group-hover:bg-primary transition-colors"
                      />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground/40">
                      {s.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-muted-foreground flex items-center gap-3">
              <Ticket className="h-3 w-3" />
              Ticket Distribution
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {ticketStats.map((tt, i) => (
                <div
                  key={i}
                  className="bg-card border border-border p-6 group hover:border-primary/20 transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-black uppercase text-sm tracking-widest text-foreground">
                        {tt.name}
                      </h4>
                      <p className="text-[10px] font-bold text-muted-foreground italic mt-1">
                        ₹{tt.price.toLocaleString()} Unit Price
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-foreground">{tt.sold}</div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
                        Admitted
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={(tt.sold / tt.capacity) * 100}
                    className="h-1.5 bg-muted rounded-none overflow-hidden border border-border"
                  />
                  <div className="mt-6 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Revenue Impact
                    </span>
                    <span className="text-xs font-black italic text-primary">
                      ₹{tt.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-4 space-y-12">
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-muted-foreground flex items-center gap-3">
              <Clock className="h-3 w-3" />
              Recent Transactions
            </h2>
            <div className="bg-card border border-border divide-y divide-border shadow-sm">
              {recentBookings.length > 0 ? (
                recentBookings.map((b, i) => (
                  <div
                    key={i}
                    className="p-6 hover:bg-muted/50 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-black uppercase text-[11px] tracking-tight truncate max-w-[150px] text-foreground">
                        {b.userName}
                      </div>
                      <div className="font-black text-[11px] text-primary">
                        ₹{b.totalAmount.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold text-muted-foreground italic">
                      <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                      <span className="uppercase tracking-tighter">
                        {b.tickets.reduce((sum, t) => sum + t.quantity, 0)}{" "}
                        Tickets
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center italic text-muted-foreground/30 text-[10px] font-black uppercase tracking-[0.2em]">
                  No transactions logged.
                </div>
              )}
            </div>
            <p className="mt-4 text-[8px] font-black uppercase tracking-widest text-muted-foreground/20 text-center italic">
              Displaying last 5 syncs from database
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ManagerEventAnalyticsPage;
