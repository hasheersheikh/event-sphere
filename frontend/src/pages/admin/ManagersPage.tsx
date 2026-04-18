import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  Mail,
  UserCheck,
  UserMinus,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { PortalDataTable } from "@/components/portal/PortalDataTable";

const ManagersPage = () => {
  const [managers, setManagers] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteManagerId, setDeleteManagerId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchManagers(page);
  }, [page]);

  const fetchManagers = async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/managers?page=${pageNum}&limit=20`);
      setManagers(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error("Failed to load manager directory.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/admin/users/${id}/approve`);
      toast.success("Manager status verified.");
      fetchManagers();
    } catch (error) {
      toast.error("Failed to verify manager.");
    }
  };

  const handleDelete = async (id: string, force = false) => {
    setIsDeleting(true);
    try {
      await api.delete(`/admin/managers/${id}${force ? "?force=true" : ""}`);
      toast.success("Manager and associated data purged.");
      setDeleteManagerId(null);
      setWarningMessage(null);
      fetchManagers();
    } catch (error: any) {
      if (error.response?.data?.hasBookings) {
        setWarningMessage(error.response.data.message);
      } else {
        toast.error(error.response?.data?.message || "Purge protocol failed.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredManagers = managers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const columns = [
    {
      header: "Manager Identity",
      accessor: (m: any) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-primary/10 text-primary border border-primary/20 rounded-lg flex items-center justify-center font-black text-xs shadow-sm italic transition-all group-hover:scale-110">
            {m.name.charAt(0)}
          </div>
          <div>
            <p className="font-black text-[11px] uppercase tracking-tight group-hover:text-primary transition-colors text-foreground italic leading-none mb-1">
              {m.name}
            </p>
            <p className="text-[8px] text-muted-foreground font-black italic opacity-60">
              {m.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Access Level",
      accessor: (m: any) => (
        <Badge className="bg-muted text-foreground border border-border rounded-md text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 italic">
          Event Mgr
        </Badge>
      ),
    },
    {
      header: "Validation",
      accessor: (m: any) => (
        <div className="flex items-center gap-1.5">
          <div
            className={`h-1.5 w-1.5 rounded-full ${m.isApproved ? "bg-emerald-500 shadow-[0_0_10px_#10B981]" : "bg-orange-500 animate-pulse"}`}
          />
          <span className="text-[8px] font-black uppercase tracking-widest text-foreground/80 italic">
            {m.isApproved ? "Verified" : "Pending"}
          </span>
        </div>
      ),
    },
    {
      header: "Operations",
      headerClassName: "text-right",
      accessor: (m: any) => (
        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
          <Link to={`/portal/admin/managers/${m._id}`}>
            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg border border-border hover:bg-muted">
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
          {!m.isApproved && (
            <Button
              onClick={() => handleApprove(m._id)}
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-lg border border-border hover:bg-emerald-500 hover:text-white"
            >
              <UserCheck className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            onClick={() => setDeleteManagerId(m._id)}
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-lg border border-border text-muted-foreground hover:text-rose-500"
          >
            <UserMinus className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-3 md:p-4 space-y-4 min-h-screen bg-background">
      <PortalPageHeader
        title="Manager Registry"
        icon={ShieldCheck}
        subtitle="Financial oversight and operational control for specialists."
        badge={
          <Badge className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md italic">
            {managers.length} UNITS
          </Badge>
        }
      />

      <PortalDataTable
        columns={columns}
        data={filteredManagers}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="SEARCH IDENTITY..."
        rowKey="_id"
      />

      <AlertDialog
        open={!!deleteManagerId}
        onOpenChange={(open) => !open && setDeleteManagerId(null)}
      >
        <AlertDialogContent className="bg-background border border-border rounded-xl text-foreground max-w-md p-5 shadow-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black brand-font uppercase tracking-tighter italic">
              {warningMessage ? "CRITICAL OVERRIDE" : "PURGE PROTOCOL"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-bold italic pt-4 leading-relaxed text-[11px]">
              {warningMessage ? (
                <span className="text-rose-500 block mb-4 px-3 py-2 bg-rose-500/10 border-l-4 border-rose-500">
                  {warningMessage}
                </span>
              ) : (
                "This action will permanently remove the manager and all associated events from the platform grid. This operation is non-reversible."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 gap-2">
            <AlertDialogCancel className="bg-muted border-border text-foreground rounded-lg hover:bg-muted/80 text-[10px] font-black uppercase tracking-widest px-4 h-9 transition-all">
              ABORT
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteManagerId!, !!warningMessage)}
              disabled={isDeleting}
              className={`${warningMessage ? "bg-rose-600 hover:bg-rose-700" : "bg-primary hover:bg-primary/90 text-primary-foreground"} rounded-lg text-[10px] font-black uppercase tracking-widest px-4 h-9 shadow-2xl transition-all border-none`}
            >
              {isDeleting
                ? "PURGING..."
                : warningMessage
                  ? "FORCE PURGE"
                  : "CONFIRM PURGE"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManagersPage;
