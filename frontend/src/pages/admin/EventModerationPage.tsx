import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Trash2,
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

  return (
    <div className="space-y-10 min-h-screen bg-zinc-950 p-6 md:p-10 text-white">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-4 text-orange-500 uppercase tracking-[0.3em] font-black text-[10px]">
            <ShieldAlert className="h-4 w-4" />
            Moderation Queue
          </div>
          <h1 className="text-5xl font-black brand-font tracking-tighter uppercase leading-none">
            Event <span className="text-orange-500">Moderation.</span>
          </h1>
          <p className="text-zinc-500 font-medium mt-4 max-w-xl">
            Review and authorize production listings before platform
            publication.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="py-20 text-center animate-pulse text-[10px] font-black uppercase tracking-widest text-orange-500">
            Scanning Queue...
          </div>
        ) : events.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/10 bg-white/5 flex flex-col items-center gap-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-500/30" />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
              Queue clear. All productions synchronized.
            </p>
          </div>
        ) : (
          events.map((event, index) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-zinc-900 border border-white/5 p-8 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-orange-500/20 transition-all"
            >
              <div className="flex items-center gap-8 w-full">
                <div className="h-24 w-24 bg-black border border-white/10 overflow-hidden hidden md:block shrink-0">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt=""
                      className={`h-full w-full object-cover transition-all ${event.isApproved ? "" : "grayscale"}`}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-zinc-800">
                      <Calendar className="h-8 w-8 text-zinc-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-white/5 text-zinc-400 border border-white/10 rounded-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">
                      {event.category}
                    </Badge>
                    {event.isApproved ? (
                      <span className="flex items-center gap-1.5 text-[8px] font-black uppercase text-emerald-500">
                        <CheckCircle2 className="h-3 w-3" />
                        Listed & Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[8px] font-black uppercase text-orange-500">
                        <Clock className="h-3 w-3" />
                        Pending Approval
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black brand-font uppercase text-white group-hover:text-orange-400 transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-tight">
                      By {event.creator?.name} •{" "}
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                      <span className="text-zinc-400">
                        Tickets:{" "}
                        <span className="text-white ml-1">
                          {event.ticketsSold || 0}
                        </span>
                      </span>
                      <span className="text-zinc-400">
                        Revenue:{" "}
                        <span className="text-white ml-1">
                          ₹{(event.revenue || 0).toLocaleString()}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 w-full md:w-auto">
                {!event.isApproved ? (
                  <>
                    <Button
                      onClick={() => setDeclineEventId(event._id)}
                      variant="ghost"
                      className="flex-1 md:flex-none h-12 px-6 rounded-none bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Decline
                    </Button>
                    <Button
                      onClick={() => handleApprove(event._id)}
                      disabled={isProcessing}
                      className="flex-1 md:flex-none h-12 px-8 rounded-none bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Authorize
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() =>
                        navigate(`/portal/admin/events/${event._id}`)
                      }
                      variant="ghost"
                      className="flex-1 md:flex-none h-12 px-6 rounded-none bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                    <Button
                      onClick={() => setDeleteEventId(event._id)}
                      variant="ghost"
                      className="flex-1 md:flex-none h-12 px-6 rounded-none bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AlertDialog
        open={!!declineEventId}
        onOpenChange={(open) => !open && setDeclineEventId(null)}
      >
        <AlertDialogContent className="bg-zinc-950 border border-white/10 rounded-none text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black brand-font uppercase tracking-tighter italic">
              Decline <span className="text-rose-500">Production</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 font-medium italic pt-4">
              Please specify the frequency deviation or policy violation for
              this production. An automated alert will be dispatched to the
              manager.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-6">
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="ENTER REASON FOR DECLINE..."
              className="w-full bg-black border border-white/10 p-4 text-[10px] font-black uppercase tracking-widest text-rose-500 focus:outline-none focus:border-rose-500 h-32 resize-none"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white rounded-none hover:bg-white/10 text-[10px] font-black uppercase tracking-widest px-8">
              ABORT
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDecline}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-none text-[10px] font-black uppercase tracking-widest px-8 shadow-lg transition-all"
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
        <AlertDialogContent className="bg-zinc-950 border border-white/10 rounded-none text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black brand-font uppercase tracking-tighter italic">
              Purge <span className="text-rose-500">Production</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 font-medium italic pt-4">
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 mb-4">
                <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                  CRITICAL WARNING: This action will permanently delete this
                  event and all associated ticket sales, bookings, and revenue
                  records. This operation is irreversible.
                </p>
              </div>
              Are you absolutely certain you wish to proceed with the total
              deletion of this production?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white rounded-none hover:bg-white/10 text-[10px] font-black uppercase tracking-widest px-8">
              ABORT
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-none text-[10px] font-black uppercase tracking-widest px-8 shadow-lg transition-all"
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
