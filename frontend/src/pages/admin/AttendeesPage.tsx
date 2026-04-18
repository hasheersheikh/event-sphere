import { useState, useEffect } from "react";
import { Users, Mail, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { toast } from "sonner";
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { PortalDataTable } from "@/components/portal/PortalDataTable";

const AttendeesPage = () => {
  const [attendees, setAttendees] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAttendees(page);
  }, [page]);

  const fetchAttendees = async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/attendees?page=${pageNum}&limit=20`);
      // Standardizing on the { data, pagination } structure from backend
      setAttendees(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error("Failed to load attendees directory.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAttendees = attendees.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const columns = [
    {
      header: "Identity",
      accessor: (u: any) => (
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center font-black text-xs italic">
            {u.name.charAt(0)}
          </div>
          <div>
            <p className="font-black text-[11px] uppercase tracking-tight group-hover:text-primary transition-colors text-foreground italic">
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
      header: "Registry Status",
      accessor: (u: any) => (
        <Badge className="bg-muted text-foreground border border-border rounded-lg text-[8px] font-black uppercase tracking-widest px-2 py-0.5 italic">
          Verified Attendee
        </Badge>
      ),
    },
    {
      header: "Sync Date",
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
            className="h-7 w-7 rounded-lg border border-border hover:bg-rose-500 hover:text-white"
          >
            <UserMinus className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-3 md:p-4 space-y-4 bg-background min-h-screen">
      <PortalPageHeader
        title="Attendee Registry"
        icon={Users}
        subtitle="Operational monitoring of platform participants."
        badge={
          <Badge className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md italic">
            {pagination?.total ?? 0} IDENTITIES
          </Badge>
        }
      />

      <PortalDataTable
        columns={columns}
        data={filteredAttendees}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="SEARCH BY IDENTITY..."
        rowKey="_id"
      />
    </div>
  );
};

export default AttendeesPage;
