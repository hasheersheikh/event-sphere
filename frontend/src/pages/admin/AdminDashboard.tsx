import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AdminDashboard = () => {
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/stats");
      return data;
    },
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await api.get("/admin/users");
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/admin/users/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Manager approved successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to approve manager");
    },
  });

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Total Events",
      value: stats?.totalEvents || 0,
      icon: Calendar,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Total Revenue",
      value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <header className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Admin Overview</h1>
          <p className="text-muted-foreground font-medium">
            Monitor platform activity and manage professional accounts.
          </p>
        </div>
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

      {/* User Management Section */}
      <section className="glass-card rounded-[2.5rem] overflow-hidden border">
        <div className="p-8 border-b bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Users className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-black">Account Management</h2>
          </div>
          <div className="flex bg-muted p-1 rounded-xl">
            <button className="px-5 py-2 text-xs font-bold bg-background rounded-lg shadow-sm">
              All
            </button>
            <button className="px-5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground">
              Pending Approval
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                <th className="px-8 py-6">Identity</th>
                <th className="px-8 py-6">Role</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {usersLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-bold text-muted-foreground">
                        Synchronizing records...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : users?.length > 0 ? (
                users.map((u: any) => (
                  <tr
                    key={u._id}
                    className="hover:bg-muted/20 transition-all group"
                  >
                    <td className="px-8 py-7">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-sm group-hover:text-primary transition-colors">
                          {u.name}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {u.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <Badge
                        variant="secondary"
                        className="rounded-full px-4 py-1.5 font-black text-[9px] uppercase tracking-widest bg-primary/5 text-primary border-primary/10"
                      >
                        {u.role.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-8 py-7">
                      {u.isApproved ? (
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                          <CheckCircle className="h-4 w-4" />
                          Authorized
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500">
                          <XCircle className="h-4 w-4" />
                          Waitlist
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-7 text-right">
                      {u.role === "event_manager" && !u.isApproved && (
                        <Button
                          size="sm"
                          className="rounded-full shadow-button font-black text-[10px] uppercase tracking-widest px-6"
                          onClick={() => approveMutation.mutate(u._id)}
                          disabled={approveMutation.isPending}
                        >
                          Approve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <p className="text-muted-foreground font-bold italic">
                      No accounts currently requires action.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
