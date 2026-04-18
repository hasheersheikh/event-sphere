import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  Users,
  Ticket,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const ManagerSalesAnalyticsPage = () => {
  const { user } = useAuth();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ["manager-analytics", user?._id],
    queryFn: async () => {
      const { data } = await api.get("/manager/analytics");
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-primary font-black uppercase tracking-widest text-xs">
          Synchronizing Manager Metrics...
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Gross Revenue",
      value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      trend: "+12.5%",
      trendUp: true,
      color: "emerald",
    },
    {
      label: "Tickets Sold",
      value: stats?.totalTickets?.toLocaleString() || 0,
      icon: Ticket,
      trend: "+8.2%",
      trendUp: true,
      color: "blue",
    },
    {
      label: "Unique Attendees",
      value: stats?.activeUsers?.toLocaleString() || 0,
      icon: Users,
      trend: "+3 new",
      trendUp: true,
      color: "purple",
    },
    {
      label: "Performance Score",
      value: "A+",
      icon: TrendingUp,
      trend: "Peak",
      trendUp: true,
      color: "orange",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background Decor */}
      <div className="fixed inset-0 mesh-bg opacity-20 z-0" />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 p-4 md:p-6 space-y-6">
        <header className="space-y-2">
          <div className="flex items-center gap-2.5">
             <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <BarChart3 className="h-4 w-4 text-primary" />
             </div>
             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary italic">Manager Intelligence</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black italic tracking-tight uppercase leading-none mb-1 drop-shadow-sm">
            Sales <span className="text-primary">Analytics.</span>
          </h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest max-w-xl leading-relaxed opacity-70">
            Personalized performance tracking for your hosted events. Monitoring revenue velocity and audience engagement across your roster.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="p-5 bg-card/30 backdrop-blur-xl border border-border/50 rounded-2xl hover:border-primary/30 transition-all duration-500 group shadow-lg shadow-black/5"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-primary/5 border border-primary/10`}>
                  <card.icon className={`h-4 w-4 text-primary`} />
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-background/50 border border-border/50 text-[8px] font-black uppercase tracking-widest transition-colors",
                    card.trendUp ? "text-emerald-400 border-emerald-500/20" : "text-rose-400 border-rose-500/20"
                  )}
                >
                  {card.trend}
                  {card.trendUp ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-[9px] font-black uppercase tracking-widest mb-1 italic opacity-50">
                  {card.label}
                </p>
                <h3 className="text-xl font-black tabular-nums tracking-tight italic text-foreground">{card.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 pb-8">
          <div className="p-6 bg-card/20 backdrop-blur-xl border border-border/50 rounded-2xl space-y-6 shadow-2xl shadow-black/5">
            <div className="flex justify-between items-center border-b border-border/50 pb-4">
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] italic text-muted-foreground">
                My Revenue Velocity
              </h3>
            </div>
            <div className="h-60 w-full translate-x-[-5px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.revenueHistory || []}>
                  <defs>
                    <linearGradient id="colorRevM" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border) / 0.3)"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground) / 0.5)", fontSize: 9, fontWeight: 900 }}
                    dy={12}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground) / 0.5)", fontSize: 9, fontWeight: 900 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "16px",
                      fontSize: "10px",
                      fontWeight: "900",
                      textTransform: "uppercase",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#10B981"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorRevM)"
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 bg-card/20 backdrop-blur-xl border border-border/50 rounded-2xl space-y-6 shadow-2xl shadow-black/5">
            <div className="flex justify-between items-center border-b border-border/50 pb-4">
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] italic text-muted-foreground">
                Ticket Genre Distribution
              </h3>
            </div>
            <div className="h-60 w-full translate-x-[-5px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.ticketDistribution || []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border) / 0.3)"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground) / 0.5)", fontSize: 9, fontWeight: 900 }}
                    dy={12}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground) / 0.5)", fontSize: 9, fontWeight: 900 }}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted) / 0.2)" }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "16px",
                      fontSize: "10px",
                      fontWeight: "900",
                      textTransform: "uppercase",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#10B981"
                    radius={[12, 12, 0, 0]}
                    barSize={40}
                    animationDuration={2000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerSalesAnalyticsPage;
