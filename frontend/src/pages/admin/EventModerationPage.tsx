import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Trash2,
  Search,
  ExternalLink,
  ShieldCheck,
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

const EventModerationPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [declineEventId, setDeclineEventId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    try {
      const response = await api.get("/admin/events/all");
      setEvents(response.data);
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
      fetchAllEvents();
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
      fetchAllEvents();
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
      fetchAllEvents();
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

  return (
    <div className="space-y-10 min-h-screen bg-background p-6 md:p-10 text-foreground">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-10">
        <div>
          <div className="flex items-center gap-3 mb-5 text-primary uppercase tracking-[0.4em] font-black text-[10px]">
            <ShieldAlert className="h-4 w-4" />
            Critical Oversight Protocol
          </div>
          <h1 className="text-3xl md:text-5xl font-black brand-font tracking-tighter uppercase leading-none text-foreground">
            Event <span className="text-primary">Moderation.</span>
          </h1>
          <p className="text-muted-foreground font-bold italic mt-5 max-w-2xl text-[13px] leading-relaxed">
            Administrative queue for event authorization and verification.
            Ensure all entries meet platform integrity requirements.
          </p>
        </div>
      </header>

      <section className="bg-card border border-border overflow-hidden rounded-[1.5rem] shadow-xl">
        <div className="p-6 border-b border-border bg-muted/20 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="text-[10px] font-black uppercase tracking-widest px-5 py-2.5 bg-primary text-primary-foreground rounded-lg shadow-lg shadow-primary/20">
            {filteredEvents.filter(e => !e.isApproved).length} PENDING AUTHORIZATIONS
          </div>
          <div className="relative w-full md:w-[350px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <input
              type="text"
              placeholder="SEARCH BY EVENT OR COMMANDER..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border-2 border-border py-3 pl-12 pr-6 text-[11px] font-black uppercase tracking-widest placeholder:opacity-40 focus:outline-none focus:border-primary/50 rounded-xl transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/10 text-foreground text-[9px] font-black uppercase tracking-[0.2em] border-b border-border">
                <th className="px-8 py-6">Event Identity</th>
                <th className="px-8 py-6">Unit Commander</th>
                <th className="px-8 py-6">Chronology</th>
                <th className="px-8 py-6">Validation</th>
                <th className="px-8 py-6 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-8 py-20 text-center font-black uppercase text-[10px] tracking-widest animate-pulse"
                  >
                    Scanning Grid...
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-8 py-20 text-center font-black uppercase text-[10px] tracking-widest text-muted-foreground"
                  >
                    No events detected in the current sector.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event, index) => (
                  <motion.tr
                    key={event._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-white/5 border-b border-white/5 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="h-11 w-11 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center font-black text-base shadow-sm">
                          {event.title.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase tracking-tight group-hover:text-primary transition-colors text-foreground">
                            {event.title}
                          </p>
                          <Badge className="bg-muted text-muted-foreground border border-border rounded-lg text-[8px] font-black uppercase tracking-widest px-2 py-0.5 mt-1.5">
                            {event.category}
                          </Badge>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 bg-muted/50 text-muted-foreground border border-border rounded-lg flex items-center justify-center font-bold text-xs">
                          {event.creator?.name?.charAt(0) || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-[12px] uppercase truncate text-foreground/90 leading-none mb-1">
                            {event.creator?.name || "Unknown Unit"}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-bold italic opacity-60 truncate">
                            {event.creator?.email || "No Email Signal"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-foreground/80">
                          <Calendar className="h-3 w-3 text-orange-500" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-muted-foreground italic">
                          <Clock className="h-3 w-3" />
                          {event.time || "TBD"}
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`h-2 w-2 rounded-full shadow-sm ${event.isApproved ? "bg-emerald-500 shadow-emerald-500/50" : "bg-orange-500 shadow-orange-500/50"}`}
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">
                          {event.isApproved ? "Verified" : "Pending"}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <Link to={`/events/${event._id}`} target="_blank" rel="noopener noreferrer">
                          <Button
                            size="icon"
                            variant="outline"
                            title="Preview event"
                            className="h-9 w-9 rounded-lg border-2 border-border hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-all shadow-sm"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/portal/admin/events/${event._id}`}>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-9 w-9 rounded-lg border-2 border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                        {!event.isApproved && (
                          <>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => setDeclineEventId(event._id)}
                              className="h-9 w-9 rounded-lg border-2 border-border hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-sm"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleApprove(event._id)}
                              className="h-9 w-9 rounded-lg border-2 border-border hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteEventId(event._id)}
                          className="h-9 w-9 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AlertDialog
        open={!!declineEventId}
        onOpenChange={(open) => !open && setDeclineEventId(null)}
      >
        <AlertDialogContent className="bg-background border border-border rounded-[2rem] text-foreground max-w-md p-10 shadow-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black brand-font uppercase tracking-tighter italic">
              DECLINE <span className="text-rose-500">PROTOCOL.</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-bold italic pt-6 leading-relaxed">
              Specify the frequency deviation or policy violation. This signal
              will be dispatched to the unit commander.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-6">
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="ENTER REASON FOR DECLINE..."
              className="w-full bg-muted/20 border-2 border-border rounded-xl p-4 text-[11px] font-black uppercase tracking-widest text-foreground focus:outline-none focus:border-primary/50 h-32 resize-none transition-all shadow-inner"
            />
          </div>
          <AlertDialogFooter className="pt-4 gap-4">
            <AlertDialogCancel className="bg-muted border-border text-foreground rounded-xl hover:bg-muted/80 text-[11px] font-black uppercase tracking-widest px-8 h-12">
              ABORT
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDecline}
              disabled={isProcessing}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest px-8 h-12 shadow-xl transition-all border-none"
            >
              {isProcessing ? "TRANSMITTING..." : "CONFIRM DECLINE"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deleteEventId}
        onOpenChange={(open) => !open && setDeleteEventId(null)}
      >
        <AlertDialogContent className="bg-background border border-border rounded-[2rem] text-foreground max-w-md p-10 shadow-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black brand-font uppercase tracking-tighter italic">
              PURGE <span className="text-rose-500">REQUEST.</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-bold italic pt-6 leading-relaxed">
              <div className="bg-rose-500/10 border-l-4 border-rose-500 p-4 mb-6">
                <p className="text-rose-500 text-[11px] font-black uppercase tracking-widest leading-relaxed">
                  CRITICAL: This will permanently delete this event and all
                  associated ticket registries. Irreversible.
                </p>
              </div>
              Execute total data purge for this event?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 gap-4">
            <AlertDialogCancel className="bg-muted border-border text-foreground rounded-xl hover:bg-muted/80 text-[11px] font-black uppercase tracking-widest px-8 h-12">
              ABORT
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isProcessing}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest px-8 h-12 shadow-xl transition-all border-none"
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
