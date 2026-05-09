import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Calendar,
  TrendingUp,
  LayoutDashboard,
  Activity,
  Globe,
  ExternalLink,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { PortalStatCard } from "@/components/portal/PortalStatCard";
import { PortalCard } from "@/components/portal/PortalCard";
import { PortalGrid } from "@/components/portal/PortalGrid";

const AdminDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/stats");
      return data;
    },
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const { data } = await api.get("/admin/analytics");
      return data;
    },
  });

  const { data: payoutDetails } = useQuery({
    queryKey: ["admin-payout-details"],
    queryFn: async () => {
      const { data } = await api.get("/manager/payout-details");
      return data;
    },
  });

  const avgDailyRevenue = analytics?.revenueHistory?.length 
    ? analytics.revenueHistory.reduce((acc: number, curr: any) => acc + curr.amount, 0) / analytics.revenueHistory.length
    : 0;

  const statCards = [
    {
      label: "Total Revenue",
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      iconClass: "icon-revenue",
      subtext: "Confirmed bookings",
    },
    {
      label: "Total Events",
      value: stats?.totalEvents || 0,
      icon: Calendar,
      iconClass: "icon-events",
      subtext: "All time",
    },
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      iconClass: "icon-users",
      subtext: "Registered",
    },
    {
      label: "Total Bookings",
      value: stats?.totalBookings || 0,
      icon: Activity,
      iconClass: "icon-tickets",
      subtext: "All statuses",
    },
  ];

  return (
    <div className="space-y-4 pb-12 bg-background min-h-screen p-3 md:p-4">
      <PortalPageHeader
        title="Platform Overview"
        icon={LayoutDashboard}
        subtitle="All systems operational."
        badge={
          <Badge variant="outline" className="h-6 px-2 border-emerald-500/20 text-emerald-500 bg-emerald-500/5 font-black uppercase tracking-widest text-[8px]">
            Live
          </Badge>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Chart Area */}
        <PortalCard
          title="Revenue Overview"
          subtitle="7-Day Revenue Trend"
          icon={Activity}
          className="lg:col-span-2"
          actions={
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-[9px] font-black uppercase text-foreground">Revenue</span>
            </div>
          }
        >
          <div className="h-[280px] w-full mt-2">
            {analyticsLoading ? (
              <div className="h-full w-full flex items-center justify-center bg-muted/20 rounded-xl border border-dashed border-border">
                <p className="text-[10px] font-black uppercase tracking-widest animate-pulse opacity-50">Loading chart...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.revenueHistory || []}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "0.75rem",
                      fontWeight: 900,
                      fontSize: "9px",
                      textTransform: "uppercase",
                    }}
                    cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 2, strokeDasharray: "4 4" }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Revenue"]}
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
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase text-muted-foreground">Avg Daily</p>
              <p className="text-lg font-black italic">
                {analyticsLoading ? "—" : `₹${Math.round(avgDailyRevenue).toLocaleString()}`}
              </p>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-[9px] font-black uppercase text-muted-foreground">Fee</p>
              <p className="text-lg font-black text-primary italic">
                {payoutDetails?.commissionType === "percentage" 
                  ? `${payoutDetails.commissionValue}%` 
                  : `₹${payoutDetails?.commissionValue || 0}`}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[9px] font-black uppercase text-muted-foreground">Total</p>
              <p className="text-lg font-black text-primary italic">
                {statsLoading ? "—" : `₹${(stats?.totalRevenue || 0).toLocaleString()}`}
              </p>
            </div>
          </div>
        </PortalCard>

        {/* Top Managers Sidebar */}
        <PortalCard
          title="Top Managers"
          subtitle="By revenue generated"
          icon={Users}
          actions={
            <Link to="/portal/admin/managers" className="block">
              <Button variant="outline" className="h-7 px-3 rounded-lg text-[8px] font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5 italic">
                View All
              </Button>
            </Link>
          }
        >
          <div className="space-y-2 flex-1">
            {(!stats?.topManagers || stats.topManagers.length === 0) && (
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest py-3 text-center">No data yet</p>
            )}
            {stats?.topManagers?.map((m: any, idx: number) => (
              <div key={m._id} className="p-2 bg-muted/20 border border-border/50 rounded-lg flex items-center justify-between group hover:border-primary/40 transition-all hover:bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 bg-primary/10 text-primary border border-primary/20 rounded-md flex items-center justify-center font-black text-[10px] group-hover:bg-primary group-hover:text-primary-foreground transition-all italic">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-tight text-foreground">{m.name}</p>
                    <p className="text-[8px] font-bold text-muted-foreground italic flex items-center gap-1">
                      <TrendingUp className="h-2 w-2 text-emerald-500" />
                      ₹{(m.totalRevenue || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Link to={`/portal/admin/managers/${m._id}`}>
                  <Button size="icon" variant="ghost" className="h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </PortalCard>
      </div>

      {/* Recent Events & New Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PortalCard
          title="Recent Events"
          subtitle="Latest submissions"
          icon={Calendar}
          contentClassName="p-0 pt-0"
        >
          <PortalGrid
            data={stats?.recentEvents || []}
            columns={1}
            gap="gap-0"
            className="divide-y divide-border/50"
            renderItem={(e: any) => (
              <div key={e._id} className="flex items-center justify-between p-4 group hover:bg-primary/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-primary/20 rounded-full group-hover:bg-primary transition-colors" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors italic leading-none mb-1">{e.title}</p>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">By {e.creator?.name}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-muted text-[8px] font-black uppercase rounded-[4px] text-muted-foreground border border-border/50 px-1.5 h-4">
                  {new Date(e.createdAt).toLocaleDateString()}
                </Badge>
              </div>
            )}
            emptyMessage="No events yet"
          />
        </PortalCard>

        <PortalCard
          title="New Users"
          subtitle="Recently registered"
          icon={Globe}
          contentClassName="p-0 pt-0"
        >
          <PortalGrid
            data={stats?.recentUsers || []}
            columns={1}
            gap="gap-0"
            className="divide-y divide-border/50"
            renderItem={(u: any) => (
              <div key={u._id} className="flex items-center justify-between p-4 group hover:bg-primary/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors flex items-center justify-center overflow-hidden border border-border/50">
                    <span className="text-[10px] font-black group-hover:text-primary transition-colors">{u.name?.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-tight text-foreground leading-none mb-1.5">{u.name}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[7px] font-black uppercase text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10 tracking-widest">
                        {u.role?.replace("_", " ")}
                      </span>
                      <span className="text-[8px] font-bold text-muted-foreground truncate max-w-[100px] uppercase">{u.email}</span>
                    </div>
                  </div>
                </div>
                <p className="text-[8px] font-black text-muted-foreground uppercase opacity-60 tracking-wider text-right">{new Date(u.createdAt).toLocaleDateString()}</p>
              </div>
            )}
            emptyMessage="No users yet"
          />
        </PortalCard>
      </div>
    </div>
  );
};

export default AdminDashboard;
