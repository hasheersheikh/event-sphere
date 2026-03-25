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
    <div className="space-y-10 pb-20 p-6 md:p-8 bg-background min-h-screen">
      {/* Header */}
      <header className="flex flex-col gap-6 border-b border-border pb-10">
        <Link
          to="/portal/events"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Roster
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full text-[8px] font-black uppercase tracking-widest px-3 py-1">
                {event.category}
              </Badge>
              <div
                className={`h-1.5 w-1.5 rounded-full ${event.isApproved ? "bg-emerald-500 shadow-[0_0_10px_#10B981]" : "bg-orange-500 animate-pulse"}`}
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {event.isApproved ? "Verified Event" : "Authorization Pending"}
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic leading-none text-foreground">
              {event.title}
            </h1>
          </div>
          <div className="flex gap-3">
            <Link to={`/portal/manager/events/${event._id}/edit`}>
              <Button
                className="h-11 px-6 rounded-xl bg-primary text-black hover:bg-primary/90 text-[10px] font-black uppercase tracking-widest transition-all gap-2 shadow-lg border-none"
              >
                Edit Event
              </Button>
            </Link>
            <Link to={`/events/${event._id}`} target="_blank">
              <Button
                variant="outline"
                className="h-11 px-6 border-border rounded-xl bg-card hover:bg-muted text-[10px] font-black uppercase tracking-widest transition-all gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Public View
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <Tabs defaultValue="dashboard" className="w-full space-y-8">
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
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-12">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-card border border-border rounded-[1.5rem] shadow-sm group hover:border-emerald-500/30 transition-all">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-4 flex items-center gap-2">
                    <IndianRupee className="h-3.5 w-3.5 text-emerald-500" /> Net Revenue
                  </p>
                  <div className="text-3xl font-black text-emerald-500 italic uppercase tabular-nums">
                    ₹{(stats.netRevenue || 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-6 bg-card border border-border rounded-[1.5rem] shadow-sm group hover:border-primary/30 transition-all">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-4 flex items-center gap-2">
                    <Ticket className="h-3.5 w-3.5 text-primary" /> Tickets Sold
                  </p>
                  <div className="text-3xl font-black text-foreground italic uppercase tabular-nums">
                    {stats.totalTicketsSold} <span className="text-xs text-muted-foreground">/ {stats.capacity}</span>
                  </div>
                </div>
                <div className="p-6 bg-card border border-border rounded-[1.5rem] shadow-sm group hover:border-blue-500/30 transition-all">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-500" /> Occupancy
                  </p>
                  <div className="text-3xl font-black text-blue-500 italic uppercase tabular-nums">
                    {((stats.totalTicketsSold / stats.capacity) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Revenue History Chart */}
              <section className="p-8 bg-card border border-border rounded-[1.5rem] shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3 text-muted-foreground">
                     <TrendingUp className="h-4 w-4 text-emerald-500" />
                     <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Revenue Flux</h2>
                   </div>
                   <Badge variant="outline" className="rounded-lg border-emerald-500/20 text-emerald-500 bg-emerald-500/5 text-[9px] font-black uppercase tracking-widest px-3">
                      Last 7 Units
                   </Badge>
                </div>
                <div className="h-[250px] w-full">
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
              <section className="p-8 bg-card border border-border rounded-[1.5rem] shadow-sm space-y-6">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Event Overview</h2>
                </div>
                <p className="text-foreground leading-relaxed font-medium italic text-sm">
                  {event.description}
                </p>
                <div className="grid md:grid-cols-3 gap-8 pt-8 border-t border-border">
                   <div className="space-y-2">
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Schedule</p>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase">
                      <Calendar className="h-4 w-4 text-primary" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase">
                      <Clock className="h-4 w-4 text-primary" />
                      {event.time}
                    </div>
                  </div>
                  <div className="space-y-4 md:col-span-2">
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Location Node</p>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xl font-black brand-font uppercase text-foreground">
                          {event.location?.venueName || "Venue Unspecified"}
                        </h4>
                        <p className="text-muted-foreground font-medium italic mt-2">
                          {typeof event.location === "string" ? event.location : event.location?.address}
                        </p>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          (event.location?.venueName || "") + " " + (typeof event.location === "string" ? event.location : event.location?.address || "")
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-black transition-all"
                        title="Open in Google Maps"
                      >
                        <MapPin className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar Actions */}
            <div className="space-y-6">
               <section className="p-6 bg-muted/30 border border-border rounded-[1.5rem] space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center mb-6">Protocol Hub</h3>
                  <Link to={`/portal/manager/events/${event._id}/edit`} className="block">
                    <Button className="w-full h-11 rounded-xl bg-primary text-black hover:bg-primary/90 text-[10px] font-black uppercase tracking-widest shadow-lg border-none">
                      Edit Event
                    </Button>
                  </Link>
                  <Link to={`/portal/manager/events/${event._id}/analytics`} className="block">
                    <Button className="w-full h-11 rounded-xl bg-card border border-border hover:bg-muted text-foreground text-[10px] font-black uppercase tracking-widest shadow-sm">
                      Full Analytics
                    </Button>
                  </Link>
                  <Link to={`/portal/manager/events/${id}/volunteers`} className="block">
                    <Button className="w-full h-11 rounded-xl bg-card border border-border hover:bg-muted text-foreground text-[10px] font-black uppercase tracking-widest shadow-sm">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ticketStats.map((tt: any, i: number) => (
              <div key={i} className="p-8 bg-card border border-border rounded-[1.5rem] shadow-sm hover:border-primary/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="font-black uppercase text-sm tracking-widest text-foreground">{tt.name}</h4>
                      <p className="text-[11px] font-bold text-muted-foreground italic mt-1.5">₹{tt.price.toLocaleString()} Unit Cost</p>
                    </div>
                    <Badge variant="outline" className="rounded-lg border-border/50 bg-muted/20 text-[9px] font-black uppercase tracking-tighter">
                      Tier {i + 1}
                    </Badge>
                  </div>
                  <div className="flex items-end justify-between mb-2">
                     <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Utilisation</span>
                     <span className="text-xs font-black italic">{tt.isSoldOut ? tt.capacity : tt.sold} / {tt.capacity}</span>
                  </div>
                  <Progress value={tt.isSoldOut ? 100 : (tt.sold / tt.capacity) * 100} className="h-2 bg-muted rounded-full overflow-hidden">
                     <div className={`h-full ${tt.isSoldOut ? 'bg-rose-500' : 'bg-primary'}`} style={{ width: `${tt.isSoldOut ? 100 : (tt.sold / tt.capacity) * 100}%` }} />
                  </Progress>
                </div>
                <div className="mt-8 pt-6 border-t border-border/30 flex justify-between items-center">
                   <button
                    onClick={() => toggleSoldOutMutation.mutate(i)}
                    disabled={toggleSoldOutMutation.isPending}
                    className={`text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all px-3 py-1.5 rounded-lg border ${tt.isSoldOut ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "text-rose-500 border-rose-500/20 bg-rose-500/5"}`}
                  >
                    <Zap className={`h-3 w-3 ${tt.isSoldOut ? "animate-pulse" : ""}`} />
                    {tt.isSoldOut ? "Locked" : "Sold Out"}
                  </button>
                   <p className="text-xl font-black italic text-foreground tabular-nums">₹{tt.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="attendees" className="outline-none">
          <div className="bg-card border border-border rounded-[1.5rem] overflow-hidden shadow-xl">
             <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 text-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  Recent Registry Transmissions
                </h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-muted/10 text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em] border-b border-border">
                     <th className="px-8 py-6">Asset Holder</th>
                     <th className="px-8 py-6">Classification</th>
                     <th className="px-8 py-6">Volume</th>
                     <th className="px-8 py-6 text-right">Yield</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border/30">
                   {(data.recentBookings || []).length > 0 ? (
                     data.recentBookings.map((booking: any) => (
                       <tr key={booking._id} className="hover:bg-muted/10 transition-colors group">
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                                  {booking.userName.charAt(0)}
                               </div>
                               <div>
                                  <p className="font-black text-sm uppercase tracking-tight text-foreground">{booking.userName}</p>
                                  <p className="text-[10px] text-muted-foreground font-bold italic">{booking.userEmail}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6 font-bold text-[11px] text-muted-foreground">
                            {booking.tickets.map((t: any) => `${t.quantity}x ${t.type}`).join(', ')}
                         </td>
                         <td className="px-8 py-6 font-black text-sm italic">
                            {booking.tickets.reduce((sum: number, t: any) => sum + t.quantity, 0)} Units
                         </td>
                         <td className="px-8 py-6 text-right font-black text-emerald-500 tabular-nums italic">
                            ₹{booking.totalAmount?.toLocaleString()}
                         </td>
                       </tr>
                     ))
                   ) : (
                     <tr>
                        <td colSpan={4} className="px-8 py-20 text-center text-[10px] font-black uppercase text-muted-foreground italic">
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
          <div className="bg-card border border-border rounded-[1.5rem] overflow-hidden shadow-xl">
             <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
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
                     <th className="px-8 py-6">Personnel Identity</th>
                     <th className="px-8 py-6">Logistical Node</th>
                     <th className="px-8 py-6">Relay Status</th>
                     <th className="px-8 py-6 text-right">Deployment Date</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border/30">
                   {(data.volunteers || []).length > 0 ? (
                     data.volunteers.map((v: any) => (
                       <tr key={v._id} className="hover:bg-muted/10 transition-colors">
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="h-9 w-9 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded-xl font-black text-xs">
                                  {v.name.charAt(0)}
                               </div>
                               <div>
                                  <p className="font-black text-sm uppercase tracking-tight text-foreground">{v.name}</p>
                                  <p className="text-[10px] text-muted-foreground font-bold italic">{v.email}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6 flex items-center gap-2 mt-4 ml-4">
                            <MapPin className="h-3 w-3 text-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{v.gate || "GRID DEFAULT"}</span>
                         </td>
                         <td className="px-8 py-6">
                            <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-emerald-500">
                               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10B981]" />
                               Active Relay
                            </span>
                         </td>
                         <td className="px-8 py-6 text-right font-black text-[10px] text-muted-foreground tabular-nums uppercase">
                            {new Date(v.createdAt).toLocaleDateString()}
                         </td>
                       </tr>
                     ))
                   ) : (
                     <tr>
                        <td colSpan={4} className="px-8 py-20 text-center text-[10px] font-black uppercase text-muted-foreground italic">
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
