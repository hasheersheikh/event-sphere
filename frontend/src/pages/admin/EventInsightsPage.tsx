import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Ticket,
  IndianRupee,
  Users,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Mail,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/api";
import { toast } from "sonner";

interface EventInsights {
  event: any;
  stats: {
    totalRevenue: number;
    totalTicketsSold: number;
    capacity: number;
  };
  ticketStats: Array<{
    name: string;
    price: number;
    capacity: number;
    sold: number;
    revenue: number;
  }>;
  attendees: Array<{
    _id: string;
    name: string;
    email: string;
    tickets: Array<{ type: string; quantity: number }>;
    bookedAt: string;
    totalAmount: number;
  }>;
}

const EventInsightsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<EventInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, [id]);

  const fetchInsights = async () => {
    try {
      const response = await api.get(`/admin/events/${id}/insights`);
      setData(response.data);
    } catch (error) {
      toast.error("Failed to recover insights protocol.");
      navigate("/portal/events");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse text-[10px] font-black uppercase tracking-[0.5em] text-orange-500">
          Syncing Insights...
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { event, stats, ticketStats, attendees } = data;
  const sellThroughRate = (stats.totalTicketsSold / stats.capacity) * 100;

  return (
    <div className="space-y-12 pb-20 bg-zinc-950 p-6 md:p-10 text-white min-h-screen">
      {/* Navigation & Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-6">
          <Link
            to="/portal/events"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Queue
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 rounded-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">
                {event.category}
              </Badge>
              {event.isApproved ? (
                <span className="flex items-center gap-1.5 text-[8px] font-black uppercase text-emerald-500">
                  <ShieldCheck className="h-3 w-3" />
                  Production Verified
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[8px] font-black uppercase text-orange-500">
                  <Clock className="h-3 w-3" />
                  Awaiting Authorization
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-black brand-font tracking-tighter uppercase leading-[0.9]">
              {event.title}
            </h1>
          </div>
        </div>

        <div className="flex gap-4">
          <Link to={`/events/${event._id}`} target="_blank">
            <Button
              variant="outline"
              className="h-14 px-8 border-white/10 rounded-none bg-white/5 hover:bg-white hover:text-black text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Public View
            </Button>
          </Link>
        </div>
      </header>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Gross Revenue",
            value: `₹${stats.totalRevenue.toLocaleString()}`,
            icon: IndianRupee,
            color: "text-emerald-500",
          },
          {
            label: "Tickets Sold",
            value: stats.totalTicketsSold,
            icon: Ticket,
            color: "text-orange-500",
          },
          {
            label: "Sell-Through",
            value: `${sellThroughRate.toFixed(1)}%`,
            icon: TrendingUp,
            color: "text-indigo-500",
          },
          {
            label: "Pulse Rank",
            value: "TOP 5%",
            icon: BarChart3,
            color: "text-rose-500",
          },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-900/50 border border-white/5 p-8 relative overflow-hidden group hover:border-white/10 transition-all"
          >
            <kpi.icon
              className={`absolute -right-4 -bottom-4 h-24 w-24 ${kpi.color} opacity-[0.03] group-hover:scale-110 transition-transform duration-700`}
            />
            <div
              className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${kpi.color}`}
            >
              {kpi.label}
            </div>
            <div className="text-4xl font-black brand-font uppercase">
              {kpi.value}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Left Column: Management & Ticket Split */}
        <div className="lg:col-span-1 space-y-12">
          {/* Manager Info */}
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-zinc-500 flex items-center gap-3">
              <User className="h-3 w-3" />
              Production Manager
            </h2>
            <div className="bg-zinc-900 border border-white/5 p-8 hover:border-orange-500/20 transition-all group">
              <div className="flex items-center gap-5 mb-6">
                <div className="h-12 w-12 bg-white/5 border border-white/10 flex items-center justify-center rounded-full group-hover:bg-white group-hover:text-black transition-all">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-tight text-lg leading-none">
                    {event.creator?.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase mt-2 italic">
                    <Mail className="h-3 w-3" />
                    {event.creator?.email}
                  </div>
                </div>
              </div>
              <Link to={`/portal/admin/managers/${event.creator?._id}`}>
                <Button className="w-full h-12 rounded-none bg-white text-black hover:bg-orange-500 hover:text-black text-[10px] font-black uppercase tracking-widest transition-all">
                  Manager Portfolio
                </Button>
              </Link>
            </div>
          </section>

          {/* Ticket Inventory */}
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-zinc-500 flex items-center gap-3">
              <Ticket className="h-3 w-3" />
              Ticket Inventory
            </h2>
            <div className="space-y-4">
              {ticketStats.map((tt, i) => (
                <div
                  key={i}
                  className="bg-zinc-900 border border-white/5 p-6 hover:border-white/10 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-black uppercase text-xs tracking-widest mb-1">
                        {tt.name}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-bold italic">
                        ₹{tt.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black">
                        {tt.sold} / {tt.capacity}
                      </div>
                      <p className="text-[8px] text-zinc-600 font-black uppercase tracking-tighter">
                        Capacity Filled
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={(tt.sold / tt.capacity) * 100}
                    className="h-1.5 bg-black rounded-none overflow-hidden border border-white/5"
                  />
                  <div className="mt-4 text-[10px] font-black uppercase text-emerald-500/80">
                    Contribution: ₹{tt.revenue.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Attendees */}
        <div className="lg:col-span-2">
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-zinc-500 flex items-center gap-3">
              <Users className="h-3 w-3" />
              Attendee Manifest
            </h2>
            <div className="bg-zinc-900 border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-black/40">
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">
                        Attendee
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">
                        Tickets
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">
                        Volume
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500 italic text-right">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {attendees.length > 0 ? (
                      attendees.map((at, i) => (
                        <tr
                          key={i}
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          <td className="px-6 py-5">
                            <div className="font-black uppercase tracking-tight text-xs group-hover:text-orange-500 transition-colors">
                              {at.name}
                            </div>
                            <div className="text-[9px] text-zinc-600 font-bold italic mt-1">
                              {at.email}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-[10px] font-black uppercase text-zinc-400">
                            {at.tickets
                              .map((t) => `${t.quantity}x ${t.type}`)
                              .join(", ")}
                          </td>
                          <td className="px-6 py-5">
                            <span className="font-black text-xs">
                              {at.tickets.reduce(
                                (sum, t) => sum + t.quantity,
                                0,
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right font-black text-xs text-emerald-500">
                            ₹{at.totalAmount.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-20 text-center italic text-zinc-600 text-[10px] font-black uppercase tracking-widest"
                        >
                          No confirmed bookings detected in system.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EventInsightsPage;
