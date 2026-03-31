import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Calendar,
  TrendingUp,
  Ticket,
  Activity,
  Users,
  ChevronRight,
  PieChart,
  IndianRupee,
  Plus,
  Clock,
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
      label: "Gross Revenue",
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      iconClass: "icon-revenue",
      sub: "From confirmed bookings",
    },
    {
      label: "Tickets Sold",
      value: stats?.totalBookings || 0,
      icon: Ticket,
      iconClass: "icon-tickets",
      sub: `${stats?.sellThroughRate || 0}% sell-through`,
    },
    {
      label: "Total Events",
      value: stats?.totalEvents || 0,
      icon: Calendar,
      iconClass: "icon-events",
      sub: "All time",
    },
    {
      label: "Unique Attendees",
      value: stats?.totalAttendees || 0,
      icon: Users,
      iconClass: "icon-users",
      sub: "Distinct users",
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
            Under Review
          </h1>
          <p className="text-muted-foreground font-medium mb-10 leading-relaxed italic">
            Your manager account is being reviewed by our team. Once approved, you can create events and track sales here.
          </p>
          <Link to="/">
            <Button
              variant="outline"
              className="rounded-full px-10 py-6 font-black uppercase tracking-widest text-[10px] bg-primary/5 border-primary/20 text-primary"
            >
              Approval Pending
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 p-6 md:p-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Manager Hub</span>
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none text-foreground">
              {greeting}, <br />
              <span className="text-primary">{user?.name}.</span>
            </h1>
            <p className="text-muted-foreground text-sm font-medium italic mt-4 max-w-lg">
              Here's a summary of your events and performance for today,{" "}
              {new Date().toLocaleDateString(undefined, { month: "long", day: "numeric" })}.
            </p>
          </div>
        </div>
        <Link to="/events/create">
          <Button className="h-14 px-8 rounded-2xl bg-primary text-black font-black uppercase tracking-widest text-xs shadow-lg hover:scale-105 transition-all gap-3 border-none">
            <Plus className="h-5 w-5" />
            Create Event
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
            className="bg-card border border-border p-6 rounded-3xl group hover:border-primary/20 transition-all flex flex-col justify-between min-h-[10rem]"
          >
            <div className="flex justify-between items-start">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center border ${stat.iconClass}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded-md border border-border">
                {stat.sub}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-black tracking-tighter brand-font">
                {statsLoading ? <span className="animate-pulse text-muted-foreground">—</span> : stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* My Events */}
        <section className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-black uppercase tracking-tighter italic">My Events</h2>
            </div>
            <Link
              to="/portal/events"
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
            >
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
                  <div className="aspect-[16/10] relative overflow-hidden bg-muted">
                    {event.image ? (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <Calendar className="h-12 w-12 text-primary/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                    <div className="absolute top-6 right-6">
                      <Badge className="rounded-full uppercase text-[9px] font-black px-4 py-1.5 backdrop-blur-md bg-background/20 text-white border border-white/20 tracking-widest">
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
                <h3 className="text-2xl font-black mb-4 tracking-tight uppercase italic">No Events Yet</h3>
                <p className="text-muted-foreground font-medium mb-12 max-w-xs mx-auto leading-relaxed">
                  Create your first event to start tracking sales and attendance.
                </p>
                <Link to="/events/create">
                  <Button className="h-14 px-10 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-xl">
                    Create Your First Event
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-10">
          {/* Performance */}
          <section className="bg-card border border-border p-6 rounded-3xl space-y-6">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <PieChart className="h-4 w-4" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Performance</h3>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                  <span>Sell-Through Rate</span>
                  <span className="text-primary">{stats?.sellThroughRate || 0}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden border border-border">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${stats?.sellThroughRate || 0}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                  <span>Check-In Rate</span>
                  <span className="text-primary">{stats?.attendanceRate || 0}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden border border-border">
                  <motion.div
                    className="h-full bg-primary/60"
                    initial={{ width: 0 }}
                    animate={{ width: `${stats?.attendanceRate || 0}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.15 }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Recent Bookings</h3>
            </div>
            <div className="space-y-4">
              {stats?.recentActivity?.length > 0 ? (
                stats.recentActivity.map((item: any, i: number) => (
                  <div key={i} className="p-5 bg-card border border-border hover:border-primary/20 transition-all rounded-2xl flex gap-4 items-center group">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-black text-[10px] border border-border group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {item.user?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-tight truncate">{item.user}</p>
                      <p className="text-[9px] font-medium text-muted-foreground italic truncate">
                        {item.action} · {item.event}
                      </p>
                    </div>
                    <span className="text-[8px] font-black uppercase text-muted-foreground/40 text-right shrink-0">
                      {formatDistanceToNow(new Date(item.time))} ago
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-5 bg-card border border-border rounded-2xl text-center text-[#888] text-[10px] font-black uppercase tracking-widest py-10">
                  No recent activity
                </div>
              )}
            </div>
          </section>

          {/* Payout Summary */}
          <section className="bg-primary/5 border border-primary/20 p-6 rounded-3xl space-y-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <IndianRupee className="h-12 w-12 text-primary" />
            </div>
            <div className="flex items-center gap-3 text-primary mb-2">
              <IndianRupee className="h-4 w-4" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Payout Summary</h3>
            </div>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center border-b border-primary/10 pb-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Net Earnings</span>
                <span className="text-lg font-black text-primary italic tracking-tighter">
                  {statsLoading ? "—" : `₹${(stats?.netDue || 0).toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-primary/10 pb-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Already Paid</span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  {statsLoading ? "—" : `₹${(stats?.totalSettled || 0).toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-primary/10 pb-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Pending Payout</span>
                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">
                  {statsLoading ? "—" : `₹${(stats?.pendingPayout || 0).toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Platform Fee</span>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">10%</span>
              </div>
              <p className="text-[9px] font-medium text-muted-foreground/60 leading-relaxed">
                10% platform fee on gross revenue. Payouts processed within 48 hours after event completion.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default ManagerDashboard;
