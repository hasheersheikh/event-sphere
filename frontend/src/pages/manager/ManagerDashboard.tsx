import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Calendar,
  TrendingUp,
  Ticket,
  LayoutDashboard,
  ExternalLink,
  Plus,
  Trash2,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const ManagerDashboard = () => {
  const { user } = useAuth();

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
      label: "Hosting",
      value: stats?.totalEvents || 0,
      icon: Calendar,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Reservations",
      value: stats?.totalBookings || 0,
      icon: Ticket,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Earnings",
      value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  if (user && !user.isApproved && user.role === "event_manager") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="max-w-md w-full text-center glass-card p-12 rounded-[2.5rem] border shadow-2xl">
          <div className="h-24 w-24 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-8 border border-orange-500/20">
            <Clock className="h-12 w-12 text-orange-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black mb-4 tracking-tight">
            Review in Progress
          </h1>
          <p className="text-muted-foreground font-medium mb-10 leading-relaxed">
            Your manager account is currently being audited by our trust team.
            Once authorized, you'll be able to publish events and track sales
            here.
          </p>
          <Link to="/">
            <Button
              variant="outline"
              className="rounded-full px-10 py-6 font-bold uppercase tracking-widest text-[10px]"
            >
              Portal Status: Pending
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <LayoutDashboard className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Manager Center
            </h1>
            <p className="text-muted-foreground font-medium">
              Manage your productions and analyze ticketing performance.
            </p>
          </div>
        </div>
        <Link to="/events/create">
          <Button className="rounded-2xl px-8 py-7 font-black shadow-button gap-3 uppercase tracking-tighter">
            <Plus className="h-6 w-6" />
            New Production
          </Button>
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-3xl p-8 flex items-center gap-6"
          >
            <div
              className={`h-16 w-16 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0`}
            >
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-black tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Managed Events Section */}
      <section className="glass-card rounded-[2.5rem] border overflow-hidden">
        <div className="p-10 border-b bg-muted/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-black">Active Productions</h2>
          </div>
          <Badge
            variant="outline"
            className="rounded-full px-4 py-1.5 font-black text-[10px] uppercase tracking-widest"
          >
            {myEvents?.length || 0} Events
          </Badge>
        </div>

        <div className="p-8 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventsLoading ? (
            <div className="col-span-full py-20 text-center">
              <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <span className="text-sm font-bold text-muted-foreground">
                Fetching your lineup...
              </span>
            </div>
          ) : myEvents?.length > 0 ? (
            myEvents.map((event: any) => (
              <div
                key={event._id}
                className="bg-muted/30 rounded-3xl border border-border/50 overflow-hidden group hover:shadow-xl transition-all duration-500"
              >
                <div className="aspect-[16/10] relative overflow-hidden">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full gradient-hero opacity-60" />
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge className="rounded-full uppercase text-[9px] font-black px-4 py-1.5 backdrop-blur-md bg-black/40 text-white border-white/20">
                      {event.status}
                    </Badge>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-extrabold text-lg mb-6 line-clamp-1 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex gap-3">
                    <Link to={`/events/${event._id}`} className="flex-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full rounded-xl font-black text-[10px] uppercase tracking-widest h-11 gap-2 border bg-background"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Manager Portal
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl h-11 w-11 p-0 text-destructive hover:text-white hover:bg-destructive shadow-sm border border-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-24 text-center bg-muted/10 rounded-[2rem] border-2 border-dashed border-border/50">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-black mb-2 tracking-tight">
                Stage is Empty
              </h3>
              <p className="text-muted-foreground font-medium mb-10 max-w-xs mx-auto">
                Ready to host something unforgettable? Start by creating your
                first lineup.
              </p>
              <Link to="/events/create">
                <Button className="rounded-2xl font-black px-10 py-7 shadow-button h-auto flex flex-col items-center">
                  <Plus className="h-6 w-6 mb-1" />
                  Launch Event
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ManagerDashboard;
