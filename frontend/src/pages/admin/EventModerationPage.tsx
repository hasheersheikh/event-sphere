import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldAlert,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Trash2,
  ChevronRight,
} from "lucide-react";
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
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { PortalDataTable } from "@/components/portal/PortalDataTable";

const EventModerationPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [declineEventId, setDeclineEventId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchAllEvents(page);
  }, [page]);

  const fetchAllEvents = async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/events/all?page=${pageNum}&limit=20`);
      setEvents(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error("Failed to fetch moderation queue.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      await api.patch(`/admin/events/${id}/approve`);
      toast.success("Event approved and broadcasted.");
      fetchAllEvents(page);
    } catch (error) {
      toast.error("Approval protocol failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      toast.error("Please provide a reason for decline.");
      return;
    }
    setIsProcessing(true);
    try {
      await api.patch(`/admin/events/${declineEventId}/decline`, {
        reason: declineReason,
      });
      toast.success("Event declined and manager notified.");
      setDeclineEventId(null);
      setDeclineReason("");
      fetchAllEvents(page);
    } catch (error) {
      toast.error("Decline action failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteEventId) return;
    setIsProcessing(true);
    try {
      await api.delete(`/admin/events/${deleteEventId}`);
      toast.success("Event and all associated data purged.");
      setDeleteEventId(null);
      fetchAllEvents(page);
    } catch (error) {
      toast.error("Purge protocol failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.creator?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      header: "Event Identity",
      accessor: (event: any) => (
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 bg-primary/10 text-primary border border-primary/20 rounded-lg flex items-center justify-center font-black text-sm italic shadow-sm">
            {event.title.charAt(0)}
          </div>
          <div>
            <p className="font-black text-[12px] uppercase tracking-tight group-hover:text-primary transition-colors text-foreground italic">
              {event.title}
            </p>
            <Badge className="bg-muted text-muted-foreground/60 border border-border/50 rounded-md text-[7px] font-black uppercase tracking-widest px-1.5 py-0 h-4 mt-1 italic">
              {event.category}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      header: "Unit Commander",
      accessor: (event: any) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-muted/30 text-muted-foreground/50 border border-border/50 rounded-lg flex items-center justify-center font-bold text-[10px] italic">
            {event.creator?.name?.charAt(0) || "?"}
          </div>
          <div className="min-w-0">
            <p className="font-black text-[10px] uppercase truncate text-foreground/80 leading-none mb-0.5 italic">
              {event.creator?.name || "Unknown Unit"}
            </p>
            <p className="text-[8px] text-muted-foreground/40 font-bold italic truncate">
              {event.creator?.email || "No Signal"}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Chronology",
      accessor: (event: any) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-foreground/70 italic">
            <Calendar className="h-2.5 w-2.5 text-primary opacity-50" />
            {new Date(event.date).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 italic">
            <Clock className="h-2.5 w-2.5" />
            {event.time || "TBD"}
          </div>
        </div>
      ),
    },
    {
      header: "Validation",
      accessor: (event: any) => (
        <div className="flex items-center gap-1.5">
          <div
            className={`h-1.5 w-1.5 rounded-full ${event.isApproved ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"}`}
          />
          <span className="text-[8px] font-black uppercase tracking-widest text-foreground/60 italic leading-none">
            {event.isApproved ? "Verified" : "Pending"}
          </span>
        </div>
      ),
    },
    {
      header: "Operations",
      headerClassName: "text-right",
      accessor: (event: any) => (
        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
          <Link to={`/events/${event._id}`} target="_blank" rel="noopener noreferrer">
            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg border border-border hover:bg-sky-500 hover:text-white">
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Link to={`/portal/admin/events/${event._id}`}>
            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg border border-border hover:bg-muted">
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
          {!event.isApproved && (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setDeclineEventId(event._id)}
                className="h-7 w-7 rounded-lg border border-border hover:bg-rose-500 hover:text-white"
              >
                <XCircle className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleApprove(event._id)}
                className="h-7 w-7 rounded-lg border border-border hover:bg-emerald-500 hover:text-white"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setDeleteEventId(event._id)}
            className="h-7 w-7 rounded-lg text-muted-foreground/30 hover:text-rose-500 hover:bg-rose-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-3 md:p-4 space-y-4 bg-background min-h-screen">
      <PortalPageHeader
        title="Event Moderation"
        icon={ShieldAlert}
        subtitle="Critical administrative queue for event authorization and verification."
        badge={
          <Badge className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md italic">
            {pagination?.total ?? 0} TOTAL UNITS
          </Badge>
        }
      />

      <PortalDataTable
        columns={columns}
        data={filteredEvents}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="SEARCH BY EVENT OR COMMANDER..."
        rowKey="_id"
      />

      {/* AlertDialogs for Decline and Purge */}
      <AlertDialog
        open={!!declineEventId}
        onOpenChange={(open) => !open && setDeclineEventId(null)}
      >
        <AlertDialogContent className="bg-background border border-border rounded-2xl text-foreground max-w-sm p-5 shadow-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black brand-font uppercase tracking-tighter italic">
              DECLINE <span className="text-rose-500">PROTOCOL.</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-bold italic pt-4 leading-relaxed text-[11px]">
              Specify the frequency deviation or policy violation to notify the unit commander.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="ENTER REASON..."
              className="w-full bg-muted/20 border border-border rounded-xl p-3 text-[10px] font-black uppercase tracking-widest text-foreground focus:outline-none focus:border-primary/50 h-24 resize-none transition-all italic shadow-inner"
            />
          </div>
          <AlertDialogFooter className="pt-2 gap-2">
            <AlertDialogCancel className="bg-muted border-border text-foreground rounded-lg hover:bg-muted/80 text-[10px] font-black uppercase tracking-widest px-4 h-9 transition-all">
              ABORT
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDecline}
              disabled={isProcessing}
              className="bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest px-4 h-9 shadow-xl transition-all border-none"
            >
              {isProcessing ? "PROCESSING..." : "CONFIRM DECLINE"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deleteEventId}
        onOpenChange={(open) => !open && setDeleteEventId(null)}
      >
        <AlertDialogContent className="bg-background border border-border rounded-2xl text-foreground max-w-sm p-5 shadow-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black brand-font uppercase tracking-tighter italic">
              PURGE <span className="text-rose-500">REQUEST.</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-bold italic pt-4 leading-relaxed">
              <div className="bg-rose-500/10 border-l-4 border-rose-500 p-3 mb-4">
                <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                  CRITICAL: Permanent wipe of this event and all associated registries.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2 gap-2">
            <AlertDialogCancel className="bg-muted border-border text-foreground rounded-lg hover:bg-muted/80 text-[10px] font-black uppercase tracking-widest px-4 h-9 transition-all">
              ABORT
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isProcessing}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest px-4 h-9 shadow-xl transition-all border-none"
            >
              {isProcessing ? "PURGING..." : "CONFIRM PURGE"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventModerationPage;
