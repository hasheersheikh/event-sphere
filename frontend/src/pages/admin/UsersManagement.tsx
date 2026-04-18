import { useQuery } from "@tanstack/react-query";
import {
  Users,
  UserCheck,
  UserMinus,
  Mail,
  ShieldAlert,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { toast } from "sonner";
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { PortalDataTable } from "@/components/portal/PortalDataTable";
import { PortalCard } from "@/components/portal/PortalCard";
import { useState } from "react";

const UsersManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin-users", page],
    queryFn: async () => {
      const { data } = await api.get(`/admin/users?page=${page}&limit=20`);
      return data;
    },
  });

  const users = response?.data || [];
  const pagination = response?.pagination;

  // Filter is now client side on the current page's data 
  // (Alternatively, we could move search to server-side too, but let's stick to this for now)
  const filteredUsers = users.filter((u: any) => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      header: "User",
      accessor: (u: any) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-primary/10 text-primary border border-primary/20 rounded-lg flex items-center justify-center font-black text-[10px] shadow-sm italic">
            {u.name?.charAt(0)}
          </div>
          <div>
            <p className="font-black text-xs uppercase tracking-tight group-hover:text-primary transition-colors italic">
              {u.name}
            </p>
            <p className="text-[9px] text-muted-foreground font-black italic opacity-60">
              {u.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: (u: any) => (
        <Badge className="bg-muted text-foreground border border-border rounded-md text-[8px] font-black uppercase tracking-widest px-2 py-0.5 italic">
          {u.role?.replace("_", " ")}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessor: (u: any) => (
        <div className="flex items-center gap-2">
          <div
            className={`h-1.5 w-1.5 rounded-full ${
              u.status === "active" || u.isApproved
                ? "bg-emerald-500 shadow-[0_0_8px_#10B981]" 
                : "bg-orange-500 animate-pulse"
            }`}
          />
          <span className="text-[9px] font-black uppercase tracking-widest italic opacity-80">
            {u.isApproved ? "Verified" : "Pending"}
          </span>
        </div>
      ),
    },
    {
      header: "Joined",
      accessor: (u: any) => (
        <span className="text-[9px] font-black text-muted-foreground tabular-nums italic">
          {new Date(u.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Operations",
      headerClassName: "text-right",
      accessor: (u: any) => (
        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-lg border border-border hover:bg-primary/10 hover:text-primary"
          >
            <Mail className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-lg border border-border hover:bg-emerald-500 hover:text-white"
          >
            <UserCheck className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-lg border border-border hover:bg-rose-500 hover:text-white"
          >
            <UserMinus className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-3 md:p-4 space-y-4">
      <PortalPageHeader 
        title="Account Control"
        icon={Users}
        subtitle="Monitor and manage all platform participants."
        actions={
          <Button className="bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest px-6 h-10 rounded-xl shadow-xl hover:scale-105 transition-all border-none">
            Export Records
          </Button>
        }
      />

      <PortalDataTable
        columns={columns}
        data={filteredUsers}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name or email..."
        rowKey="_id"
      />

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <PortalCard className="bg-orange-500/5 group hover:border-orange-500/40 border-orange-500/20 shadow-none">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-xl flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground brand-font uppercase tracking-tight italic">
                Pending Approvals
              </h3>
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-wider mt-0.5 italic">
                {users.filter((u: any) => !u.isApproved).length} managers awaiting approval
              </p>
            </div>
          </div>
        </PortalCard>
        
        <PortalCard className="bg-primary/5 group hover:border-primary/40 border-primary/20 shadow-none">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground brand-font uppercase tracking-tight italic">
                  System Health
                </h3>
                <p className="text-muted-foreground text-[9px] font-black uppercase tracking-widest mt-0.5 italic">
                  Status: All systems running
                </p>
              </div>
            </div>
            <Button variant="outline" className="h-8 px-4 border-primary/20 text-primary hover:bg-primary/10 text-[9px] font-black uppercase tracking-widest rounded-lg">
              Refresh
            </Button>
          </div>
        </PortalCard>
      </div>
    </div>
  );
};

export default UsersManagement;
