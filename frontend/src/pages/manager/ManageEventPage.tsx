import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Ticket,
  IndianRupee,
  Users,
  Clock,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Info,
  Zap,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/api";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ManageEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const toggleSoldOutMutation = useMutation({
    mutationFn: async (ticketIndex: number) => {
      const { data } = await api.patch(`/events/${id}/ticket-types/${ticketIndex}/toggle-sold-out`);
      return data;
    },
    onSuccess: () => {
      toast.success("Inventory status synchronized");
      fetchDetails();
      queryClient.invalidateQueries({ queryKey: ["event", id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Trigger failed.");
    },
  });

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      // Reusing the analytics endpoint as it contains most required data
      const response = await api.get(`/manager/events/${id}/analytics`);
      setData(response.data);
    } catch (error) {
      toast.error("Failed to recover event details.");
      navigate("/portal/events");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">
          Syncing Event Data...
        </p>
      </div>
    );
  }

  if (!data) return null;

  const { event, stats, ticketStats } = data;

  return (
    <div className="space-y-4 pb-8 p-3 md:p-4 bg-background min-h-screen">
      {/* Header */}
      <header className="flex flex-col gap-3 border-b border-border pb-4">
        <Link
          to="/portal/events"
          className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors italic"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Roster
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full text-[7px] font-black uppercase tracking-widest px-2.5 py-0.5 italic">
                {event.category}
              </Badge>
              <div
                className={`h-1.5 w-1.5 rounded-full ${event.isApproved ? "bg-emerald-500 shadow-[0_0_10px_#10B981]" : "bg-orange-500 animate-pulse"}`}
              />
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                {event.isApproved ? "Verified Event" : "Authorization Pending"}
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-black tracking-tight uppercase italic leading-none text-foreground drop-shadow-sm">
              {event.title}
            </h1>
          </div>
          <div className="flex gap-3">
            <Link to={`/portal/manager/events/${event._id}/edit`}>
              <Button
                className="h-9 px-5 rounded-lg bg-primary text-black hover:bg-primary/90 text-[10px] font-black uppercase tracking-widest transition-all gap-2 shadow-lg border-none"
              >
                Edit Event
              </Button>
            </Link>
            <Link to={`/events/${event._id}`} target="_blank">
              <Button
                variant="outline"
                className="h-9 px-5 border-border rounded-lg bg-card hover:bg-muted text-[10px] font-black uppercase tracking-widest transition-all gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Public View
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <Tabs defaultValue="dashboard" className="w-full space-y-4">
        <TabsList className="bg-muted/50 border border-border p-1 rounded-lg w-fit h-auto">
          <TabsTrigger
            value="dashboard"
            className="rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground text-[9px] font-black uppercase tracking-widest px-4 h-8 transition-all italic"
          >
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="inventory"
            className="rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground text-[9px] font-black uppercase tracking-widest px-4 h-8 transition-all italic"
          >
            Inventory
          </TabsTrigger>
          <TabsTrigger
            value="attendees"
            className="rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground text-[9px] font-black uppercase tracking-widest px-4 h-8 transition-all italic"
          >
            Attendees
          </TabsTrigger>
          <TabsTrigger
            value="personnel"
            className="rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground text-[9px] font-black uppercase tracking-widest px-4 h-8 transition-all italic"
          >
            Personnel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-8 outline-none">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Main Details */}
            <div className="lg:col-span-8 space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-card border border-border rounded-xl shadow-sm group hover:border-emerald-500/30 transition-all">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2 flex items-center gap-2">
                    <IndianRupee className="h-3.5 w-3.5 text-emerald-500" /> Net Revenue
                  </p>
                  <div className="text-2xl font-black text-emerald-500 italic uppercase tabular-nums">
                    ₹{(stats.netRevenue || 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-4 bg-card border border-border rounded-xl shadow-sm group hover:border-primary/30 transition-all">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2 flex items-center gap-2">
                    <Ticket className="h-3.5 w-3.5 text-primary" /> Tickets Sold
                  </p>
                  <div className="text-2xl font-black text-foreground italic uppercase tabular-nums">
                    {stats.totalTicketsSold} <span className="text-xs text-muted-foreground font-black">/ {stats.capacity}</span>
                  </div>
                </div>
                <div className="p-4 bg-card border border-border rounded-xl shadow-sm group hover:border-blue-500/30 transition-all">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2 flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-500" /> Occupancy
                  </p>
                  <div className="text-2xl font-black text-blue-500 italic uppercase tabular-nums">
                    {((stats.totalTicketsSold / stats.capacity) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Revenue History Chart */}
              <section className="p-4 bg-card border border-border rounded-lg shadow-sm space-y-4 shadow-black/5">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2.5 text-muted-foreground">
                     <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                     <h2 className="text-[9px] font-black uppercase tracking-[0.3em] italic">Revenue Flux</h2>
                   </div>
                   <Badge variant="outline" className="rounded-md border-emerald-500/20 text-emerald-500 bg-emerald-500/5 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 italic">
                      Last 7 Units
                   </Badge>
                </div>
                <div className="h-[160px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.salesHistory || []}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 9, fontWeight: 900, fill: "hsl(var(--muted-foreground))" }} 
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          borderColor: "hsl(var(--border))",
                          borderRadius: "0.75rem",
                          fontSize: "9px",
                          fontWeight: 900,
                          textTransform: "uppercase"
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* About Event */}
              <section className="p-4 bg-card border border-border rounded-lg shadow-sm space-y-3.5 shadow-black/5">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Info className="h-3.5 w-3.5" />
                  <h2 className="text-[9px] font-black uppercase tracking-[0.3em] italic">Event Overview</h2>
                </div>
                <p className="text-foreground leading-relaxed font-bold italic text-xs opacity-80">
                  {event.description}
                </p>
                <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-border">
                   <div className="space-y-1.5">
                    <p className="text-[7px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Schedule</p>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase italic">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase italic">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      {event.time}
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <p className="text-[7px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Location Node</p>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-black brand-font uppercase text-foreground italic tracking-tight">
                          {event.location?.venueName || "Venue Unspecified"}
                        </h4>
                        <p className="text-muted-foreground font-medium italic mt-1 text-[11px] opacity-70">
                          {typeof event.location === "string" ? event.location : event.location?.address}
                        </p>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          (event.location?.venueName || "") + " " + (typeof event.location === "string" ? event.location : event.location?.address || "")
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-black transition-all shadow-sm"
                        title="Open in Google Maps"
                      >
                        <MapPin className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar Actions */}
            <div className="lg:col-span-4 space-y-4">
               <section className="p-4 bg-muted/30 border border-border rounded-lg space-y-3 shadow-black/5">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground text-center mb-4 italic opacity-60">Protocol Hub</h3>
                  <Link to={`/portal/manager/events/${event._id}/edit`} className="block">
                    <Button className="w-full h-10 rounded-lg bg-primary text-black hover:bg-primary/90 text-[9px] font-black uppercase tracking-widest shadow-lg border-none italic">
                      Edit Event
                    </Button>
                  </Link>
                  <Link to={`/portal/manager/events/${event._id}/analytics`} className="block">
                    <Button className="w-full h-10 rounded-lg bg-card border border-border hover:bg-muted text-foreground text-[9px] font-black uppercase tracking-widest shadow-sm italic">
                      Full Analytics
                    </Button>
                  </Link>
                  <Link to={`/portal/manager/events/${id}/volunteers`} className="block">
                    <Button className="w-full h-10 rounded-lg bg-card border border-border hover:bg-muted text-foreground text-[9px] font-black uppercase tracking-widest shadow-sm italic">
                      Manage Units
                    </Button>
                  </Link>
              </section>

              <section className="p-6 bg-primary/5 border border-primary/10 rounded-[1.5rem] space-y-4">
                 <div className="flex items-center gap-2 text-primary">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Platform Integrity</span>
                 </div>
                 <p className="text-[10px] font-medium italic text-muted-foreground leading-relaxed">
                   This event is fully synchronized with the City Pulse asset relay.
                 </p>
              </section>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="outline-none">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ticketStats.map((tt: any, i: number) => (
              <div key={i} className="p-4 bg-card border border-border rounded-lg shadow-sm hover:border-primary/30 transition-all flex flex-col justify-between shadow-black/5">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-black uppercase text-xs tracking-widest text-foreground italic">{tt.name}</h4>
                      <p className="text-[10px] font-bold text-muted-foreground italic mt-1">₹{tt.price.toLocaleString()} Unit Cost</p>
                    </div>
                    <Badge variant="outline" className="rounded-md border-border/50 bg-muted/20 text-[8px] font-black uppercase tracking-tighter">
                      Tier {i + 1}
                    </Badge>
                  </div>
                  <div className="flex items-end justify-between mb-1.5">
                     <span className="text-[9px] font-black text-muted-foreground uppercase opacity-50">Utilisation</span>
                     <span className="text-[11px] font-black italic">{tt.isSoldOut ? tt.capacity : tt.sold} / {tt.capacity}</span>
                  </div>
                  <Progress value={tt.isSoldOut ? 100 : (tt.sold / tt.capacity) * 100} className="h-1.5 bg-muted rounded-full overflow-hidden">
                     <div className={`h-full ${tt.isSoldOut ? 'bg-rose-500' : 'bg-primary'}`} style={{ width: `${tt.isSoldOut ? 100 : (tt.sold / tt.capacity) * 100}%` }} />
                  </Progress>
                </div>
                <div className="mt-6 pt-4 border-t border-border/30 flex justify-between items-center">
                   <button
                    onClick={() => toggleSoldOutMutation.mutate(i)}
                    disabled={toggleSoldOutMutation.isPending}
                    className={`text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 transition-all px-2.5 py-1.5 rounded-lg border italic ${tt.isSoldOut ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "text-rose-500 border-rose-500/20 bg-rose-500/5"}`}
                  >
                    <Zap className={`h-3 w-3 ${tt.isSoldOut ? "animate-pulse" : ""}`} />
                    {tt.isSoldOut ? "Locked" : "Sold Out"}
                  </button>
                   <p className="text-lg font-black italic text-foreground tabular-nums tracking-tight">₹{tt.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="attendees" className="outline-none">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl">
             <div className="p-5 border-b border-border bg-muted/20 flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 text-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  Recent Registry Transmissions
                </h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-muted/10 text-muted-foreground text-[8px] font-black uppercase tracking-[0.2em] border-b border-border italic">
                     <th className="px-4 py-3">Asset Holder</th>
                     <th className="px-4 py-3">Classification</th>
                     <th className="px-4 py-3">Volume</th>
                     <th className="px-4 py-3 text-right">Yield</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border/30">
                   {(data.recentBookings || []).length > 0 ? (
                     data.recentBookings.map((booking: any) => (
                       <tr key={booking._id} className="hover:bg-muted/10 transition-colors group">
                         <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                               <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center text-primary font-black text-[10px]">
                                  {booking.userName.charAt(0)}
                               </div>
                               <div>
                                  <p className="font-black text-[11px] uppercase tracking-tight text-foreground italic">{booking.userName}</p>
                                  <p className="text-[8px] text-muted-foreground font-black italic opacity-60">{booking.userEmail}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-4 py-3 font-black text-[9px] text-muted-foreground italic">
                            {booking.tickets.map((t: any) => `${t.quantity}X ${t.type}`).join(', ')}
                         </td>
                         <td className="px-4 py-3 font-black text-[11px] italic">
                            {booking.tickets.reduce((sum: number, t: any) => sum + t.quantity, 0)} UNITS
                         </td>
                         <td className="px-4 py-3 text-right font-black text-emerald-500 tabular-nums italic text-xs">
                            ₹{booking.totalAmount?.toLocaleString()}
                         </td>
                       </tr>
                     ))
                   ) : (
                     <tr>
                        <td colSpan={4} className="px-6 py-16 text-center text-[10px] font-black uppercase text-muted-foreground italic">
                           No registry entries detected.
                        </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        </TabsContent>

        <TabsContent value="personnel" className="outline-none">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl">
             <div className="p-5 border-b border-border bg-muted/20 flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 text-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Ground Personnel & Deployment
                </h3>
                <Link to={`/portal/manager/events/${id}/volunteers`}>
                   <Button size="sm" className="bg-foreground text-background hover:bg-emerald-500 hover:text-white text-[8px] font-black uppercase h-8 px-4 rounded-lg border-none shadow-sm transition-all">
                      Manage Units
                   </Button>
                </Link>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-muted/10 text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em] border-b border-border">
                     <th className="px-6 py-4">Personnel Identity</th>
                     <th className="px-6 py-4">Logistical Node</th>
                     <th className="px-6 py-4">Relay Status</th>
                     <th className="px-6 py-4 text-right">Deployment Date</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border/30">
                   {(data.volunteers || []).length > 0 ? (
                     data.volunteers.map((v: any) => (
                       <tr key={v._id} className="hover:bg-muted/10 transition-colors">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                               <div className="h-8 w-8 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded-lg font-black text-xs">
                                  {v.name.charAt(0)}
                               </div>
                               <div>
                                  <p className="font-black text-xs uppercase tracking-tight text-foreground">{v.name}</p>
                                  <p className="text-[9px] text-muted-foreground font-black italic">{v.email}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-orange-500" />
                              <span className="text-[10px] font-black uppercase tracking-widest">{v.gate || "GRID DEFAULT"}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-emerald-500">
                               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10B981]" />
                               Active Relay
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right font-black text-[10px] text-muted-foreground tabular-nums uppercase">
                            {new Date(v.createdAt).toLocaleDateString()}
                         </td>
                       </tr>
                     ))
                   ) : (
                     <tr>
                        <td colSpan={4} className="px-6 py-16 text-center text-[10px] font-black uppercase text-muted-foreground italic">
                           No personnel deployed to this sector.
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

export default ManageEventPage;
