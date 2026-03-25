import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  Activity,
  Zap,
  Globe,
  Lock,
  ExternalLink,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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

  const statCards = [
    {
      label: "Total Revenue",
      value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      trend: "+12.5%",
    },
    {
      label: "Active Deployments",
      value: stats?.totalEvents || 0,
      icon: Zap,
      color: "text-primary",
      bg: "bg-primary/10",
      trend: "+4 units",
    },
    {
      label: "Platform Registry",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      trend: "+24 new",
    },
    {
       label: "Yield Magnitude",
       value: stats?.totalBookings || 0,
       icon: Activity,
       color: "text-purple-500",
       bg: "bg-purple-500/10",
       trend: "Steady",
    }
  ];

  return (
    <div className="space-y-10 pb-20 bg-background min-h-screen p-6 md:p-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-border/50 pb-10">
        <div className="flex items-center gap-6">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-lg shadow-primary/5">
            <ShieldCheck className="h-6 w-6 text-primary shadow-sm" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter brand-font uppercase italic text-foreground leading-none">
              Command <span className="text-primary underline decoration-primary/20 underline-offset-4">Center.</span>
            </h1>
            <p className="text-muted-foreground font-bold italic mt-3 flex items-center gap-2.5 text-[12px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Platform Synchronization: Standard protocols active.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Badge variant="outline" className="h-8 px-3 border-emerald-500/20 text-emerald-500 bg-emerald-500/5 font-black uppercase tracking-widest text-[9px]">
              Security: Level 5
           </Badge>
           <Badge variant="outline" className="h-8 px-3 border-primary/20 text-primary bg-primary/5 font-black uppercase tracking-widest text-[9px]">
              v2.4.0 Stable
           </Badge>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-[1.5rem] p-8 flex flex-col gap-6 group hover:border-primary/30 transition-all shadow-xl"
          >
            <div className="flex justify-between items-start">
               <div className={`h-11 w-11 rounded-xl ${stat.bg} flex items-center justify-center shrink-0 border border-current opacity-20`}>
                 <stat.icon className={`h-6 w-6 ${stat.color}`} />
               </div>
               <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/10">
                  {stat.trend}
               </span>
            </div>
            <div>
              <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-2 opacity-60">
                {stat.label}
              </p>
              <p className="text-3xl font-black tracking-tight text-foreground tabular-nums group-hover:text-primary transition-colors">
                 {stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <section className="lg:col-span-2 bg-card border border-border rounded-[2rem] p-8 shadow-2xl overflow-hidden relative">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h3 className="text-2xl font-black uppercase brand-font tracking-tighter italic">
                    Revenue <span className="text-primary">Yield.</span>
                 </h3>
                 <p className="text-[11px] font-black uppercase text-muted-foreground tracking-widest mt-1">7-Day Financial Trajectory</p>
              </div>
              <div className="flex items-center gap-2">
                 <div className="h-3 w-3 rounded-full bg-primary" />
                 <span className="text-[10px] font-black uppercase text-foreground">Liquidity Flow</span>
              </div>
           </div>

           <div className="h-[400px] w-full mt-4">
              {analyticsLoading ? (
                 <div className="h-full w-full flex items-center justify-center bg-muted/20 rounded-3xl border border-dashed border-border">
                    <p className="text-[11px] font-black uppercase tracking-widest animate-pulse opacity-50">Mapping Grid...</p>
                 </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.revenueHistory || []}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                       dataKey="date" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 10, fontWeight: 900, fill: "hsl(var(--muted-foreground))" }} 
                       dy={10}
                    />
                    <YAxis 
                       hide 
                    />
                    <Tooltip 
                       contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          borderColor: "hsl(var(--border))",
                          borderRadius: "1rem",
                          fontWeight: 900,
                          fontSize: "10px",
                          textTransform: "uppercase"
                       }}
                       cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 2, strokeDasharray: "4 4" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--primary))"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
           </div>

           <div className="mt-10 pt-10 border-t border-border/50 grid grid-cols-3 gap-8">
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50">Avg Daily Yield</p>
                 <p className="text-xl font-black">₹42.8K</p>
              </div>
              <div className="space-y-2 text-center">
                 <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50">Platform Entitlement</p>
                 <p className="text-xl font-black text-primary">12%</p>
              </div>
              <div className="space-y-2 text-right">
                 <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50">Projection</p>
                 <p className="text-xl font-black text-emerald-500">+18%</p>
              </div>
           </div>
        </section>

        {/* Top Performers Sidebar */}
        <section className="bg-card border border-border rounded-[1.5rem] p-8 shadow-2xl flex flex-col gap-8 h-full">
           <div className="border-b border-border/50 pb-6">
              <h3 className="text-xl font-black uppercase brand-font tracking-tighter italic">
                 Top <span className="text-primary">Registry.</span>
              </h3>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">Leading Operational Units</p>
           </div>

           <div className="space-y-4 flex-1">
              {stats?.topManagers?.map((m: any, idx: number) => (
                 <div key={m._id} className="p-5 bg-muted/20 border border-border/50 rounded-2xl flex items-center justify-between group hover:border-primary/40 transition-all hover:bg-primary/5">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center font-black text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                          {idx + 1}
                       </div>
                       <div>
                          <p className="text-xs font-black uppercase tracking-tight text-foreground">{m.name}</p>
                          <p className="text-[9px] font-bold text-muted-foreground italic flex items-center gap-1">
                             <TrendingUp className="h-2 w-2 text-emerald-500" />
                             ₹{m.totalRevenue?.toLocaleString()}
                          </p>
                       </div>
                    </div>
                    <Link to={`/portal/admin/managers/${m._id}`}>
                       <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="h-3.5 w-3.5" />
                       </Button>
                    </Link>
                 </div>
              ))}
           </div>

           <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-3 text-primary">
                 <Lock className="h-4 w-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Administrative Hub</span>
              </div>
              <Link to="/portal/admin/managers" className="block">
                 <Button className="w-full bg-primary text-primary-foreground rounded-xl h-12 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 border-none">
                    View Complete Directory
                 </Button>
              </Link>
           </div>
        </section>
      </div>

      {/* Deployment Log & Entry Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <section className="bg-card border border-border rounded-[1.5rem] p-8 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-border/50">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-500">
                     <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase brand-font tracking-tighter italic">
                       Deployment <span className="text-blue-500">Log.</span>
                    </h3>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Recent Event Initializations</p>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               {stats?.recentEvents?.map((e: any) => (
                  <div key={e._id} className="flex items-center justify-between group">
                     <div className="flex items-center gap-6">
                        <div className="w-1.5 h-10 bg-blue-500/20 rounded-full group-hover:bg-blue-500 transition-colors" />
                        <div>
                           <p className="text-sm font-black uppercase tracking-tight text-foreground group-hover:text-blue-500 transition-colors">{e.title}</p>
                           <p className="text-[10px] font-bold text-muted-foreground italic">INITIALIZED BY: {e.creator?.name}</p>
                        </div>
                     </div>
                     <Badge variant="secondary" className="bg-muted text-[8px] font-black uppercase rounded text-muted-foreground border border-border/50">
                        {new Date(e.createdAt).toLocaleDateString()}
                     </Badge>
                  </div>
               ))}
            </div>
         </section>

         <section className="bg-card border border-border rounded-[1.5rem] p-8 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-border/50">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-500">
                     <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase brand-font tracking-tighter italic">
                       Registry <span className="text-purple-500">Feed.</span>
                    </h3>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">New Identity Records</p>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               {stats?.recentUsers?.map((u: any) => (
                  <div key={u._id} className="flex items-center justify-between group">
                     <div className="flex items-center gap-6">
                        <div className="h-10 w-10 rounded-xl bg-muted group-hover:bg-purple-500/10 transition-colors flex items-center justify-center overflow-hidden">
                           <span className="text-xs font-black group-hover:text-purple-500 transition-colors">{u.name.charAt(0)}</span>
                        </div>
                        <div>
                           <p className="text-sm font-black uppercase tracking-tight text-foreground">{u.name}</p>
                           <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black uppercase text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                                 {u.role.replace("_", " ")}
                              </span>
                              <span className="text-[10px] font-bold text-muted-foreground italic truncate max-w-[120px]">{u.email}</span>
                           </div>
                        </div>
                     </div>
                     <p className="text-[10px] font-black text-muted-foreground opacity-50 uppercase">{new Date(u.createdAt).toLocaleDateString()}</p>
                  </div>
               ))}
            </div>
         </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
