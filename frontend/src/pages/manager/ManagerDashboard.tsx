import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Calendar,
  TrendingUp,
  Ticket,
  LayoutDashboard,
  ArrowUpRight,
  Plus,
  Trash2,
  Clock,
  Activity,
  Users,
  ChevronRight,
  PieChart,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const ManagerDashboard = () => {
  const { user } = useAuth();
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good Morning" : currentHour < 18 ? "Good Afternoon" : "Good Evening";

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["manager-stats"],
    queryFn: async () => {
      const { data } = await api.get("/manager/stats");
      return data;
    },
  });

  const { data: myEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["my-events"],
    queryFn: async () => {
      const { data } = await api.get("/events/my");
      return data;
    },
  });

  const statCards = [
    {
      label: "Revenue Protocol",
      value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      trend: "+12.5%",
    },
    {
      label: "Inventory Sold",
      value: stats?.totalBookings || 0,
      icon: Ticket,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      trend: "+8.2%",
    },
    {
      label: "Active Nodes",
      value: stats?.totalEvents || 0,
      icon: Calendar,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      trend: "Stable",
    },
    {
      label: "Personnel Assets",
      value: "42", // Mocked for now
      icon: Users,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      trend: "+3 new",
    },
  ];

  if (user && !user.isApproved && user.role === "event_manager") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="max-w-md w-full text-center glass-card p-12 rounded-[2.5rem] border shadow-2xl">
          <div className="h-24 w-24 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-8 border border-orange-500/20">
            <Clock className="h-12 w-12 text-orange-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black mb-4 tracking-tight uppercase italic underline decoration-primary underline-offset-8">
            Review in Progress
          </h1>
          <p className="text-muted-foreground font-medium mb-10 leading-relaxed italic">
            Your manager account is currently being audited by our trust team.
            Once authorized, you'll be able to publish events and track sales
            here.
          </p>
          <Link to="/">
            <Button
              variant="outline"
              className="rounded-full px-10 py-6 font-black uppercase tracking-widest text-[10px] bg-primary/5 border-primary/20 text-primary"
            >
              Protocol Status: Pending
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 p-6 md:p-0">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Manager Command Center</span>
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none text-foreground">
              {greeting}, <br />
              <span className="text-primary">{user?.name}.</span>
            </h1>
            <p className="text-muted-foreground text-sm font-medium italic mt-4 max-w-lg">
              Synchronizing operational metrics and participant flow for the 
              {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} cycle.
            </p>
          </div>
        </div>
        <Link to="/events/create">
          <Button className="h-14 px-8 rounded-2xl bg-primary text-black font-black uppercase tracking-widest text-xs shadow-lg hover:scale-105 transition-all gap-3 border-none">
            <Plus className="h-5 w-5" />
            Launch Event
          </Button>
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border p-6 rounded-3xl group hover:border-primary/20 transition-all flex flex-col justify-between h-40"
          >
            <div className="flex justify-between items-start">
               <div className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
               </div>
               <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                 {stat.trend}
               </span>
            </div>
            <div>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-50">
                {stat.label}
              </p>
              <p className="text-2xl font-black tracking-tighter brand-font italic">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Managed Events Section */}
        <section className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Activity className="h-5 w-5 text-primary" />
               <h2 className="text-xl font-black uppercase tracking-tighter italic">Active Node Registry</h2>
            </div>
            <Link to="/portal/events" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {eventsLoading ? (
               Array(2).fill(0).map((_, i) => (
                 <div key={i} className="h-80 bg-muted/20 animate-pulse rounded-[2.5rem] border border-border" />
               ))
            ) : myEvents?.length > 0 ? (
              myEvents.slice(0, 4).map((event: any) => (
                <Link
                  key={event._id}
                  to={`/portal/manager/events/${event._id}/details`}
                  className="bg-card border border-border rounded-[2.5rem] overflow-hidden group hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 block relative"
                >
                  <div className="aspect-[16/10] relative overflow-hidden">
                    {event.image ? (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full gradient-hero opacity-60" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                    <div className="absolute top-6 right-6">
                      <Badge className="rounded-full uppercase text-[9px] font-black px-4 py-1.5 backdrop-blur-md bg-background/20 text-white border border-white/20 uppercase tracking-widest">
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-black text-lg tracking-tighter uppercase italic leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-24 text-center bg-muted/5 rounded-[3rem] border-2 border-dashed border-border/50">
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-8">
                  <Calendar className="h-12 w-12 text-muted-foreground/20" />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight uppercase italic">
                  Operational Void
                </h3>
                <p className="text-muted-foreground font-medium mb-12 max-w-xs mx-auto italic leading-relaxed">
                  The registry is empty. Initialize your first event node to start synchronizing with the pulse.
                </p>
                <Link to="/events/create">
                  <Button className="h-16 px-10 rounded-2xl bg-primary text-black font-black uppercase tracking-widest shadow-xl">
                    Deploy Prototype
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Sidebar Insights */}
         <aside className="lg:col-span-4 space-y-10">
            <section className="bg-card border border-border p-6 rounded-3xl space-y-6">
              <div className="flex items-center gap-3 text-muted-foreground mb-2">
                 <PieChart className="h-4 w-4" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Performance Pulse</h3>
              </div>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                       <span>Market Penetration</span>
                       <span className="text-primary">78%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden border border-border">
                       <motion.div 
                          className="h-full bg-primary" 
                          initial={{ width: 0 }}
                          animate={{ width: "78%" }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                       />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                       <span>Audience Sync</span>
                       <span className="text-blue-500">92%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden border border-border">
                       <motion.div 
                          className="h-full bg-blue-500" 
                          initial={{ width: 0 }}
                          animate={{ width: "92%" }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                       />
                    </div>
                 </div>
              </div>
           </section>

           <section className="space-y-8">
             <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Recent Signals</h3>
             </div>
             <div className="space-y-4">
                {[
                  { user: "Sarah Jenkins", action: "Booked 2 Tickets", event: "Pulse Music Festival", time: "2m ago" },
                  { user: "Mike Ross", action: "Volunteer Application", event: "Tech Summit 2024", time: "15m ago" },
                  { user: "David Chen", action: "Checked In", event: "Mainstage Expo", time: "1h ago" },
                ].map((signal, i) => (
                  <div key={i} className="p-5 bg-card border border-border hover:border-primary/20 transition-all rounded-2xl flex gap-4 items-center group">
                     <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-black text-[10px] border border-border group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {signal.user.charAt(0)}
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black uppercase tracking-tight truncate">{signal.user}</p>
                        <p className="text-[9px] font-medium text-muted-foreground italic truncate">{signal.action} · {signal.event}</p>
                     </div>
                     <span className="text-[8px] font-black uppercase text-muted-foreground/40">{signal.time}</span>
                  </div>
                ))}
             </div>
             <Button variant="ghost" className="w-full text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary h-12 rounded-xl">
                Scan Audit Log
             </Button>
           </section>

            <section className="bg-primary/5 border border-primary/20 p-6 rounded-3xl space-y-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <ShieldCheck className="h-12 w-12 text-primary" />
              </div>
              <div className="flex items-center gap-3 text-primary mb-2">
                 <ShieldCheck className="h-4 w-4" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Governance & Fees</h3>
              </div>
              <div className="space-y-4 relative z-10">
                 <div className="flex justify-between items-center border-b border-primary/10 pb-4">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Platform Access</span>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Verified</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-primary/10 pb-4">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Service Charge</span>
                    <span className="text-lg font-black text-primary italic tracking-tighter">10% <span className="text-[10px] not-italic opacity-60">per payout</span></span>
                 </div>
                 <p className="text-[9px] font-medium text-muted-foreground/60 leading-relaxed italic">
                    Administrative fee calculated on gross ticket revenue. 
                    Payouts processed every 48 hours post-event completion.
                 </p>
              </div>
           </section>
        </aside>
      </div>
    </div>
  );
};

export default ManagerDashboard;
