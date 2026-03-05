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
      toast.error("Failed to recover production metrics.");
      navigate("/portal/productions");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500">
          Syncing Metrics...
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { event, stats, ticketStats, salesHistory, recentBookings } = data;
  const sellThroughRate = (stats.totalTicketsSold / stats.capacity) * 100;

  return (
    <div className="space-y-12 pb-20 bg-zinc-950 p-6 md:p-10 text-white min-h-screen">
      {/* Header */}
      <header className="flex flex-col gap-6 border-b border-white/5 pb-10">
        <Link
          to="/portal/productions"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Roster
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
                Production Analytics
              </span>
              <div
                className={`h-1.5 w-1.5 rounded-full ${event.isApproved ? "bg-emerald-500 shadow-[0_0_10px_#10B981]" : "bg-orange-500 shadow-[0_0_10px_#F97316] animate-pulse"}`}
              />
            </div>
            <h1 className="text-4xl md:text-7xl font-black brand-font tracking-tighter uppercase leading-[0.8]">
              {event.title}
            </h1>
          </div>
          <div className="flex gap-4">
            <Link to={`/events/${event._id}`} target="_blank">
              <Button
                variant="ghost"
                className="h-12 px-6 rounded-none bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
              >
                Public Listing <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-white/5 p-8 relative overflow-hidden group">
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center justify-between">
            Gross Revenue
            <IndianRupee className="h-4 w-4 opacity-20" />
          </div>
          <div className="text-4xl font-black brand-font italic tracking-tighter">
            ₹{stats.grossRevenue.toLocaleString()}
          </div>
        </div>

        <div className="bg-zinc-900 border border-white/5 p-8 relative overflow-hidden group">
          <div className="text-[10px] font-black uppercase tracking-widest text-rose-500/60 mb-6 flex items-center justify-between">
            Platform Fee
            <ShieldAlert className="h-4 w-4 opacity-20" />
          </div>
          <div className="text-4xl font-black brand-font italic tracking-tighter text-rose-500/80">
            -₹{stats.platformCommission.toLocaleString()}
          </div>
          <div className="text-[8px] font-black uppercase mt-4 text-zinc-600 tracking-widest">
            Model: {stats.commissionInfo.value}
            {stats.commissionInfo.type === "percentage" ? "%" : " FLAT"} Deal
          </div>
        </div>

        <div className="bg-zinc-900 border-2 border-emerald-500/20 p-8 relative overflow-hidden group shadow-[0_0_30px_rgba(16,185,129,0.05)]">
          <div className="absolute top-0 right-0 p-4">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-6 flex items-center justify-between">
            Net Revenue
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-5xl font-black brand-font italic tracking-tighter text-emerald-400">
            ₹{stats.netRevenue.toLocaleString()}
          </div>
        </div>

        <div className="bg-zinc-900 border border-white/5 p-8 relative overflow-hidden group">
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center justify-between">
            Tickets Sold
            <Ticket className="h-4 w-4 opacity-20" />
          </div>
          <div className="text-4xl font-black brand-font italic tracking-tighter">
            {stats.totalTicketsSold}{" "}
            <span className="text-sm font-light text-zinc-700">
              / {stats.capacity}
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Sales Chart Simulation & Ticket Types */}
        <div className="lg:col-span-8 space-y-12">
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-zinc-600 flex items-center gap-3">
              <BarChart3 className="h-3 w-3" />
              Revenue Flow (Last 7 Days)
            </h2>
            <div className="bg-zinc-900 border border-white/5 p-10 flex items-end justify-between h-48 gap-2">
              {salesHistory.map((s, i) => {
                const max = Math.max(...salesHistory.map((d) => d.amount)) || 1;
                const height = (s.amount / max) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-4 group"
                  >
                    <div className="w-full bg-white/5 h-32 relative flex items-end overflow-hidden group-hover:bg-white/10 transition-colors">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        className="w-full bg-emerald-500/40 group-hover:bg-emerald-500 transition-colors"
                      />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-tighter text-zinc-700">
                      {s.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-zinc-600 flex items-center gap-3">
              <Ticket className="h-3 w-3" />
              Ticket Distribution
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {ticketStats.map((tt, i) => (
                <div
                  key={i}
                  className="bg-zinc-900 border border-white/5 p-8 group hover:border-emerald-500/20 transition-all"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="font-black uppercase text-sm tracking-widest">
                        {tt.name}
                      </h4>
                      <p className="text-[10px] font-bold text-zinc-500 italic mt-1">
                        ₹{tt.price.toLocaleString()} Unit Price
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black">{tt.sold}</div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-700">
                        Admitted
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={(tt.sold / tt.capacity) * 100}
                    className="h-1.5 bg-black rounded-none overflow-hidden border border-white/5"
                  />
                  <div className="mt-6 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">
                      Revenue Impact
                    </span>
                    <span className="text-xs font-black italic text-emerald-500">
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
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-zinc-600 flex items-center gap-3">
              <Clock className="h-3 w-3" />
              Recent Transactions
            </h2>
            <div className="bg-zinc-900 border border-white/5 divide-y divide-white/5">
              {recentBookings.length > 0 ? (
                recentBookings.map((b, i) => (
                  <div
                    key={i}
                    className="p-6 hover:bg-white/[0.02] transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-black uppercase text-[11px] tracking-tight truncate max-w-[150px]">
                        {b.userName}
                      </div>
                      <div className="font-black text-[11px] text-emerald-500">
                        ₹{b.totalAmount.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold text-zinc-600 italic">
                      <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                      <span className="uppercase tracking-tighter">
                        {b.tickets.reduce((sum, t) => sum + t.quantity, 0)}{" "}
                        Tickets
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center italic text-zinc-700 text-[10px] font-black uppercase tracking-[0.2em]">
                  No transactions logged.
                </div>
              )}
            </div>
            <p className="mt-4 text-[8px] font-black uppercase tracking-widest text-zinc-800 text-center italic">
              Displaying last 5 syncs from database
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ManagerEventAnalyticsPage;
