import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Ticket,
  IndianRupee,
  Users,
  ShieldCheck,
  Clock,
  ExternalLink,
  TrendingUp,
  BarChart3,
  Mail,
  User,
  LayoutDashboard,
  ShieldAlert,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  volunteers: Array<{
    _id: string;
    name: string;
    email: string;
    gate: string;
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
      navigate("/portal/admin/events");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-[10px] font-black uppercase tracking-[0.5em] text-orange-500">
          Syncing Insights...
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { event, stats, ticketStats, attendees, volunteers } = data;
  const sellThroughRate = (stats.totalTicketsSold / stats.capacity) * 100;

  return (
    <div className="space-y-10 pb-20 p-6 md:p-8 bg-background text-foreground min-h-screen">
      {/* Navigation & Header */}
      <header className="flex flex-col gap-6 border-b border-border pb-10">
        <Link
          to="/portal/admin/events"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Queue
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge className="bg-orange-500/10 text-orange-500 border-none rounded-full text-[8px] font-black uppercase tracking-widest px-3 py-1">
                {event.category}
              </Badge>
              {event.isApproved ? (
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-500">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Event
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-orange-500">
                  <Clock className="h-3.5 w-3.5" />
                  Authorization Pending
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-4xl font-black brand-font tracking-tighter uppercase leading-none italic">
              {event.title}
            </h1>
          </div>

          <div className="flex gap-3">
            <Link to={`/events/${event._id}`} target="_blank">
              <Button
                variant="outline"
                className="h-11 px-6 border-border rounded-xl bg-card hover:bg-muted text-[10px] font-black uppercase tracking-widest transition-all gap-2 shadow-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Public View
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <Tabs defaultValue="dashboard" className="space-y-8">
        <TabsList className="bg-muted/50 border border-border p-1 rounded-xl w-fit">
          <TabsTrigger
            value="dashboard"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground text-[10px] font-black uppercase tracking-widest px-6 h-9 transition-all"
          >
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="inventory"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground text-[10px] font-black uppercase tracking-widest px-6 h-9 transition-all"
          >
            Inventory
          </TabsTrigger>
          <TabsTrigger
            value="attendees"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground text-[10px] font-black uppercase tracking-widest px-6 h-9 transition-all"
          >
            Attendees
          </TabsTrigger>
          <TabsTrigger
            value="personnel"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground text-[10px] font-black uppercase tracking-widest px-6 h-9 transition-all"
          >
            Personnel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-12 outline-none">
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
                label: "Utilisation",
                value: `${sellThroughRate.toFixed(1)}%`,
                icon: TrendingUp,
                color: "text-blue-500",
              },
              {
                label: "Personnel Units",
                value: volunteers.length,
                icon: Users,
                color: "text-rose-500",
              },
            ].map((kpi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border p-8 rounded-[1.5rem] relative overflow-hidden group hover:border-orange-500/30 transition-all shadow-sm"
              >
                <kpi.icon
                  className={`absolute -right-4 -bottom-4 h-24 w-24 ${kpi.color} opacity-[0.03] group-hover:scale-110 transition-transform duration-700`}
                />
                <div
                  className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${kpi.color}`}
                >
                  {kpi.label}
                </div>
                <div className="text-3xl font-black italic uppercase tabular-nums">
                  {kpi.value}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <section className="p-8 bg-card border border-border rounded-[1.5rem] shadow-sm space-y-6">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <LayoutDashboard className="h-4 w-4" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Event Details</h2>
                </div>
                <p className="text-foreground leading-relaxed font-bold italic text-sm">
                  {event.description}
                </p>
                <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-border">
                  <div className="space-y-2">
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Timeline</p>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase">
                      <Clock className="h-4 w-4 text-orange-500" />
                      {event.time}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Geography</p>
                    <div className="flex items-start gap-2">
                       <MapPin className="h-4 w-4 text-orange-500 shrink-0 mt-1" />
                       <div>
                          <p className="text-sm font-black uppercase italic">{event.location?.venueName}</p>
                          <p className="text-[10px] text-muted-foreground font-bold italic truncate max-w-[200px]">{event.location?.address}</p>
                       </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-1 space-y-8">
              <section className="p-8 bg-card border border-border rounded-[1.5rem] shadow-sm space-y-6">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Unit Commander</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-muted border border-border flex items-center justify-center rounded-xl text-foreground font-black">
                    {event.creator?.name?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black uppercase text-sm truncate">{event.creator?.name}</h4>
                    <p className="text-[9px] text-muted-foreground font-bold italic truncate">{event.creator?.email}</p>
                  </div>
                </div>
                <Link to={`/portal/admin/managers/${event.creator?._id}`} className="block">
                  <Button className="w-full h-11 rounded-xl bg-foreground text-background hover:bg-orange-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">
                    Commander Profile
                  </Button>
                </Link>
              </section>

              <div className="p-6 bg-orange-500/5 border border-orange-500/10 rounded-[1.5rem] space-y-4">
                 <div className="flex items-center gap-2 text-orange-500">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Protocol Secured</span>
                 </div>
                 <p className="text-[10px] font-medium italic text-muted-foreground leading-relaxed">
                   Event assets are currently under administrative review for platform compliance.
                 </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="outline-none">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ticketStats.map((tt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="p-8 bg-card border border-border rounded-[1.5rem] shadow-sm hover:border-orange-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="font-black uppercase text-sm tracking-[0.1em] text-foreground">{tt.name}</h4>
                      <p className="text-[11px] font-bold text-muted-foreground italic mt-1">₹{tt.price.toLocaleString()} Capacity</p>
                    </div>
                    <Badge variant="outline" className="rounded-lg border-border bg-muted/30 text-[9px] font-black uppercase tracking-tighter">
                       Tier {i+1}
                    </Badge>
                  </div>
                  <div className="flex items-end justify-between mb-2">
                     <span className="text-[10px] font-black text-muted-foreground uppercase">Utilisation</span>
                     <span className="text-xs font-black italic">{tt.sold} / {tt.capacity}</span>
                  </div>
                  <Progress value={(tt.sold / tt.capacity) * 100} className="h-2 bg-muted rounded-full overflow-hidden">
                     <div className="h-full bg-orange-500" style={{ width: `${(tt.sold / tt.capacity) * 100}%` }} />
                  </Progress>
                </div>
                <div className="mt-8 pt-6 border-t border-border/50 flex justify-between items-end">
                   <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Yield Contribution</p>
                   <p className="text-xl font-black italic text-emerald-500">₹{tt.revenue.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="attendees" className="outline-none">
          <div className="bg-card border border-border rounded-[1.5rem] overflow-hidden shadow-sm">
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-muted/50 border-b border-border">
                     <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Registry Node</th>
                     <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Classification</th>
                     <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Asset Volume</th>
                     <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-right">Yield</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border">
                   {attendees.length > 0 ? (
                     attendees.map((at, i) => (
                       <tr key={i} className="hover:bg-muted/30 transition-colors group">
                         <td className="px-8 py-5">
                            <div className="font-black uppercase tracking-tight text-sm group-hover:text-orange-500 transition-colors">{at.name}</div>
                            <div className="text-[10px] text-muted-foreground font-bold italic mt-1">{at.email}</div>
                         </td>
                         <td className="px-8 py-5">
                            <div className="flex flex-wrap gap-1">
                               {at.tickets.map((t, idx) => (
                                 <Badge key={idx} variant="outline" className="text-[8px] font-black hover:bg-orange-500/10 transition-colors">
                                    {t.quantity}x {t.type}
                                 </Badge>
                               ))}
                            </div>
                         </td>
                         <td className="px-8 py-5">
                            <span className="font-black text-sm italic">{at.tickets.reduce((sum, t) => sum + t.quantity, 0)} Units</span>
                         </td>
                         <td className="px-8 py-5 text-right font-black text-sm text-emerald-500 italic tabular-nums">
                            ₹{at.totalAmount.toLocaleString()}
                          </td>
                       </tr>
                     ))
                   ) : (
                     <tr>
                       <td colSpan={4} className="px-8 py-20 text-center italic text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">
                          No Registry Transfers Detected
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        </TabsContent>

        <TabsContent value="personnel" className="outline-none">
          <div className="bg-card border border-border rounded-[1.5rem] overflow-hidden shadow-xl">
             <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 text-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Deployed Personnel Roster
                </h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-muted/10 text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em] border-b border-border">
                     <th className="px-8 py-6">Field Unit Identity</th>
                     <th className="px-8 py-6">Operational Node</th>
                     <th className="px-8 py-6">Relay Connectivity</th>
                     <th className="px-8 py-6 text-right">Commission Date</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border/30">
                   {volunteers.length > 0 ? (
                     volunteers.map((v) => (
                       <tr key={v._id} className="hover:bg-muted/10 transition-colors">
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="h-9 w-9 bg-orange-500/10 text-orange-500 flex items-center justify-center rounded-xl font-black text-xs">
                                  {v.name.charAt(0)}
                               </div>
                               <div>
                                  <p className="font-black text-sm uppercase tracking-tight text-foreground">{v.name}</p>
                                  <p className="text-[10px] text-muted-foreground font-bold italic">{v.email}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                               <MapPin className="h-3 w-3 text-orange-500" />
                               <span className="text-[10px] font-black uppercase tracking-widest">{v.gate || "GRID DEFAULT"}</span>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-emerald-500">
                               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10B981]" />
                               Active Frequency
                            </span>
                         </td>
                         <td className="px-8 py-6 text-right font-black text-[10px] text-muted-foreground tabular-nums uppercase">
                            {new Date((v as any).createdAt).toLocaleDateString()}
                         </td>
                       </tr>
                     ))
                   ) : (
                     <tr>
                        <td colSpan={4} className="px-8 py-20 text-center text-[10px] font-black uppercase text-muted-foreground italic">
                           No units assigned to this event grid.
                        </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default EventInsightsPage;
