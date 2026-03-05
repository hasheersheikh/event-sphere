import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  Users,
  Ticket,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import api from "@/lib/api";

const AnalyticsPage = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const { data } = await api.get("/admin/analytics");
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-emerald-400 font-black uppercase tracking-widest text-xs">
          Calculating Pulse Metrics...
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Revenue",
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
      label: "Active Users",
      value: stats?.activeUsers?.toLocaleString() || 0,
      icon: Users,
      trend: "-2.1%",
      trendUp: false,
      color: "purple",
    },
    {
      label: "Growth Rate",
      value: "24.5%",
      icon: TrendingUp,
      trend: "+4.3%",
      trendUp: true,
      color: "orange",
    },
  ];

  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">
          Sales <span className="text-emerald-400">Analytics</span>
        </h1>
        <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em]">
          Real-time performance metrics of the City Pulse ecosystem
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-white/20 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-${card.color}-500/10`}>
                <card.icon className={`h-6 w-6 text-${card.color}-400`} />
              </div>
              <div
                className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${card.trendUp ? "text-emerald-400" : "text-rose-400"}`}
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
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">
                {card.label}
              </p>
              <h3 className="text-2xl font-black tabular-nums">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] italic">
              Revenue Velocity
            </h3>
            <select className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-white/40 outline-none">
              <option>Last 30 Days</option>
              <option>Last 12 Months</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.revenueHistory || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#ffffff10"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#ffffff40", fontSize: 10, fontWeight: 900 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#ffffff40", fontSize: 10, fontWeight: 900 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#050505",
                    border: "1px solid #ffffff10",
                    borderRadius: "12px",
                    fontSize: "10px",
                    fontWeight: "900",
                    textTransform: "uppercase",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-8">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] italic">
            Ticket Distribution
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.ticketDistribution || []}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#ffffff10"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#ffffff40", fontSize: 10, fontWeight: 900 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#ffffff40", fontSize: 10, fontWeight: 900 }}
                />
                <Tooltip
                  cursor={{ fill: "#ffffff05" }}
                  contentStyle={{
                    backgroundColor: "#050505",
                    border: "1px solid #ffffff10",
                    borderRadius: "12px",
                    fontSize: "10px",
                    fontWeight: "900",
                    textTransform: "uppercase",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#4f46e5"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
