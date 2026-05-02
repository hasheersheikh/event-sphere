import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  AlertTriangle,
  Users,
  Search,
  Edit3,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useState } from "react";
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { PortalStatCard } from "@/components/portal/PortalStatCard";
import { PortalDataTable } from "@/components/portal/PortalDataTable";

const MyEventsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [isForceDelete, setIsForceDelete] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ["my-events", page],
    queryFn: async () => {
      const { data } = await api.get(`/events/my?page=${page}&limit=10`);
      return data;
    },
  });

  const events = response?.data || [];
  const pagination = response?.pagination;

  const deleteMutation = useMutation({
    mutationFn: async ({ id, force }: { id: string; force?: boolean }) => {
      const { data } = await api.delete(
        `/events/${id}${force ? "?force=true" : ""}`,
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Event removed from roster");
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
      setDeleteEventId(null);
      setWarningMessage(null);
      setIsForceDelete(false);
    },
    onError: (error: any) => {
      if (error.response?.data?.hasBookings) {
        setWarningMessage(error.response.data.message);
        setIsForceDelete(false); // Disable force delete if we want them to cancel instead
      } else {
        toast.error(
          error.response?.data?.message || "Failed to delete event",
        );
        setDeleteEventId(null);
      }
    },
  });

  const handleDelete = () => {
    if (deleteEventId) {
      deleteMutation.mutate({ id: deleteEventId, force: isForceDelete });
    }
  };

  const columns = [
    {
      header: "Event Identity",
      accessor: (p: any) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-primary/10 text-primary flex items-center justify-center rounded-xl font-black text-[10px] border border-primary/20 italic shadow-sm">
            {p.title.charAt(0)}
          </div>
          <div>
            <Link to={`/portal/manager/events/${p._id}/details`} className="font-black text-xs uppercase tracking-tight text-foreground hover:text-primary transition-colors block italic leading-tight">
              {p.title}
            </Link>
            <Badge className="bg-muted text-muted-foreground/60 border border-border/50 rounded-md text-[7px] font-black uppercase tracking-widest px-1.5 py-0 mt-0.5 italic">
              {p.category}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      header: "Chronology",
      accessor: (p: any) => (
        <div className="text-[10px] font-black uppercase tracking-widest text-foreground/80 flex items-center gap-2 italic">
          <Clock className="h-3.5 w-3.5 text-primary opacity-50" />
          {new Date(p.date).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: "Yield Metrics",
      headerClassName: "text-right",
      accessor: (p: any) => (
        <div className="text-right">
          <div className="text-xs font-black text-emerald-500 italic uppercase leading-none tabular-nums">₹{(p.totalRevenue || 0).toLocaleString()}</div>
          <div className="text-[7px] font-black uppercase text-muted-foreground/40 tracking-widest mt-1 italic">{p.totalSold || 0} DEPLOYED</div>
          <div className="text-[7px] font-black uppercase text-muted-foreground/40 tracking-widest mt-0.5 italic">{p.viewCount || 0} VIEWS</div>
        </div>
      ),
    },
    {
      header: "Registry Status",
      headerClassName: "text-center",
      accessor: (p: any) => (
        <div className="flex justify-center">
          <Badge 
            variant="outline"
            className={`rounded-lg bg-muted text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 italic ${
              p.status === 'under_review' ? 'text-orange-500 border-orange-500/20' : 
              p.status === 'blocked' ? 'text-rose-500 border-rose-500/20' : 
              'text-emerald-500 border-emerald-500/20'
            }`}
          >
            {p.status?.replace('_', ' ') || "ACTIVE"}
          </Badge>
        </div>
      ),
    },
    {
      header: "Systems",
      headerClassName: "text-right",
      accessor: (p: any) => (
        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
          <Link to={`/portal/manager/events/${p._id}/details`}>
            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg border border-border hover:bg-primary/10 hover:text-primary">
              <Search className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Link to={`/portal/manager/events/${p._id}/edit`}>
            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg border border-border hover:bg-primary/10 hover:text-primary">
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7 rounded-lg border border-border hover:bg-rose-500 hover:text-white"
            onClick={() => setDeleteEventId(p._id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const totalRevenue = events?.reduce((acc: number, curr: any) => acc + (curr.totalRevenue || 0), 0) || 0;
  const totalSold = events?.reduce((acc: number, curr: any) => acc + (curr.totalSold || 0), 0) || 0;

  return (
    <div className="p-3 md:p-4 space-y-4 bg-background min-h-screen">
      <PortalPageHeader
        title="Event Roster"
        icon={Calendar}
        subtitle="Operational stream for stage schedules and ticketing performance."
        badge={
          <Badge className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md italic">
            {pagination?.total ?? 0} OPERATIONS
          </Badge>
        }
        actions={
          <Link to="/events/create">
            <Button className="h-10 px-6 rounded-xl bg-[#C4F000] text-black font-black uppercase tracking-widest text-[9px] shadow-lg hover:bg-[#A3C800] hover:scale-105 transition-all border-none italic">
              <Plus className="h-4 w-4" />
              New Operation
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <PortalStatCard
          label="Cumulative Yield"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={Calendar}
          subtext="Net gross revenue"
          index={0}
          iconClass="icon-revenue"
        />
        <PortalStatCard
          label="Deployed Access"
          value={totalSold}
          icon={Users}
          subtext="Verified ticket units"
          index={1}
        />
      </div>

      <PortalDataTable
        columns={columns}
        data={events}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        searchPlaceholder="FILTER ROSTER..."
        rowKey="_id"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteEventId}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setDeleteEventId(null);
            setWarningMessage(null);
            setIsForceDelete(false);
          }
        }}
      >
        <AlertDialogContent className="bg-background border border-border rounded-2xl text-foreground max-w-sm p-6 shadow-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black brand-font uppercase tracking-tighter italic flex items-center gap-2">
              {warningMessage ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-rose-500" />
                  CRITICAL WARNING
                </>
              ) : (
                "PURGE OPERATION?"
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-black italic pt-4 leading-relaxed text-[10px] uppercase tracking-widest">
              {warningMessage ? (
                <div className="space-y-4">
                  <p className="text-rose-500 border-l-2 border-rose-500 pl-3">
                    {warningMessage}
                  </p>
                  <p className="opacity-60">
                    Deletion will invalidate all existing reservations. Irreversible.
                  </p>
                </div>
              ) : (
                "Remove this event from the active roster permanently?"
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 gap-2">
            <AlertDialogCancel className="rounded-lg border-border bg-muted/20 hover:bg-muted text-foreground font-black uppercase text-[10px] tracking-widest h-10 px-6 transition-all border shadow-sm">
              ABORT
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending || (!!warningMessage && !isForceDelete)}
              className={`rounded-lg font-black uppercase text-[10px] tracking-widest h-10 px-6 shadow-xl transition-all border-none ${
                warningMessage
                  ? (isForceDelete ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-muted text-muted-foreground cursor-not-allowed")
                  : "bg-primary hover:bg-primary/90 text-black"
              }`}
            >
              {deleteMutation.isPending
                ? "SYNCING..."
                : warningMessage
                  ? (isForceDelete ? "CONFIRM PURGE" : "LOCKED")
                  : "CONFIRM PURGE"}
            </AlertDialogAction>
            {warningMessage && !isForceDelete && (
              <Button 
                onClick={() => navigate(`/portal/manager/events/${deleteEventId}/details`)}
                className="rounded-lg bg-[#C4F000] text-black hover:bg-[#A3C800] font-black uppercase text-[10px] tracking-widest h-10 px-6 shadow-xl border-none italic"
              >
                GO TO CANCEL FLOW
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyEventsPage;
