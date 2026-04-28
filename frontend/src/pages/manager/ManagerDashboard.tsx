import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { PortalStatCard } from "@/components/portal/PortalStatCard";
import { PortalCard } from "@/components/portal/PortalCard";
import { PortalGrid } from "@/components/portal/PortalGrid";
import { motion } from "framer-motion";

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

  const [page, setPage] = useState(1);

  const { data: response, isLoading: eventsLoading } = useQuery({
    queryKey: ["my-events", page],
    queryFn: async () => {
      const { data } = await api.get(`/events/my?page=${page}&limit=4`);
      return data;
    },
  });

  const myEvents = response?.data || [];
  const pagination = response?.pagination;

  const statCards = [
    {
      label: "Gross Revenue",
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      iconClass: "icon-revenue",
      subtext: "From confirmed bookings",
    },
    {
      label: "Tickets Sold",
      value: stats?.totalBookings || 0,
      icon: Ticket,
      iconClass: "icon-tickets",
      subtext: `${stats?.sellThroughRate || 0}% sell-through`,
    },
    {
      label: "Total Events",
      value: stats?.totalEvents || 0,
      icon: Calendar,
      iconClass: "icon-events",
      subtext: "All time",
    },
    {
      label: "Unique Attendees",
      value: stats?.totalAttendees || 0,
      icon: Users,
      iconClass: "icon-users",
      subtext: "Distinct users",
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
    <div className="space-y-4 pb-12 p-3 md:p-4 bg-background min-h-screen">
      <PortalPageHeader
        title={`${greeting}, ${user?.name}`}
        icon={Activity}
        subtitle={`Performance summary for today, ${new Date().toLocaleDateString(undefined, { month: "long", day: "numeric" })}.`}
        actions={
          <Link to="/events/create">
            <Button className="h-10 px-6 rounded-xl bg-[#C4F000] text-black font-black uppercase tracking-widest text-[9px] shadow-lg hover:bg-[#A3C800] hover:scale-105 transition-all gap-1.5 border-none">
              <Plus className="h-4 w-4" />
              Initialize Event
            </Button>
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <PortalStatCard
            key={stat.label}
            label={stat.label}
            value={statsLoading ? "—" : stat.value}
            icon={stat.icon}
            subtext={stat.subtext}
            iconClass={stat.iconClass}
            index={index}
          />
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* My Events */}
        <section className="lg:col-span-8 space-y-6">
          <PortalCard
            title="My Events"
            icon={Calendar}
            actions={
              <Link
                to="/portal/manager/events"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                View Full Grid <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <PortalGrid
              data={myEvents}
              isLoading={eventsLoading}
              pagination={pagination}
              onPageChange={setPage}
              columns={2}
              renderItem={(event: any) => (
                <Link
                  key={event._id}
                  to={`/portal/manager/events/${event._id}/details`}
                  className="bg-muted/10 border border-border/50 rounded-xl overflow-hidden group hover:shadow-xl transition-all duration-700 hover:-translate-y-1 block relative"
                >
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    {event.image ? (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <Calendar className="h-10 w-10 text-primary/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                    <div className="absolute top-4 right-4">
                      <Badge className="rounded-full uppercase text-[8px] font-black px-3 py-1 backdrop-blur-md bg-background/20 text-white border border-white/10 tracking-widest">
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-black text-xs tracking-tight uppercase italic leading-tight line-clamp-1 group-hover:text-primary transition-colors text-foreground">
                      {event.title}
                    </h3>
                  </div>
                </Link>
              )}
              emptyMessage="No Events Detected in this sector."
            />
          </PortalCard>
        </section>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Performance */}
          <PortalCard title="Performance Metrics" icon={PieChart}>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-2">
                  <span>Sell-Through Intensity</span>
                  <span className="text-primary">{stats?.sellThroughRate || 0}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden border border-border">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${stats?.sellThroughRate || 0}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-2">
                  <span>Attendance Rate</span>
                  <span className="text-primary">{stats?.attendanceRate || 0}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden border border-border">
                  <motion.div
                    className="h-full bg-primary/60"
                    initial={{ width: 0 }}
                    animate={{ width: `${stats?.attendanceRate || 0}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.15 }}
                  />
                </div>
              </div>
            </div>
          </PortalCard>

          {/* Recent Activity */}
          <PortalCard title="Recent Bookings" icon={Activity}>
            <div className="space-y-2">
              {stats?.recentActivity?.length > 0 ? (
                stats.recentActivity.map((item: any, i: number) => (
                  <div key={i} className="p-2.5 bg-muted/20 border border-border/50 hover:border-primary/20 transition-all rounded-lg flex gap-3 items-center group">
                    <div className="h-7 w-7 rounded-lg bg-background border border-border flex items-center justify-center font-black text-[9px] group-hover:bg-primary/10 group-hover:text-primary transition-colors italic">
                      {item.user?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-tight truncate italic text-foreground">{item.user}</p>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest truncate">
                        {item.event}
                      </p>
                    </div>
                    <span className="text-[7px] font-black uppercase text-muted-foreground/40 text-right shrink-0">
                      {formatDistanceToNow(new Date(item.time))}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-muted-foreground text-[9px] font-black uppercase tracking-widest opacity-40">
                  No transmissions detected
                </p>
              )}
            </div>
          </PortalCard>

          {/* Payout Summary */}
          <PortalCard
            title="Settlement Summary"
            icon={IndianRupee}
            className="bg-primary/[0.03] border-primary/20"
          >
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Net Earnings</span>
                <span className="text-lg font-black text-primary italic tracking-tighter">
                  {statsLoading ? "—" : `₹${(stats?.netDue || 0).toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Verified Payouts</span>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                  {statsLoading ? "—" : `₹${(stats?.totalSettled || 0).toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">In Pipeline</span>
                <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">
                  {statsLoading ? "—" : `₹${(stats?.pendingPayout || 0).toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Protocol Fee</span>
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">10%</span>
              </div>
              <p className="text-[8px] font-bold text-muted-foreground/50 leading-relaxed uppercase tracking-tight pt-2 italic">
                10% platform protocol on gross revenue. Payouts prioritized post-event verification.
              </p>
            </div>
          </PortalCard>
        </aside>
      </div>
    </div>
  );
};

export default ManagerDashboard;
