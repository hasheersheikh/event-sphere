import { motion } from "framer-motion";
import {
  Calendar,
  ExternalLink,
  Plus,
  Trash2,
  Filter,
  Layers,
  BarChart3,
  Clock,
  AlertTriangle,
  Users,
  Search,
  Edit3,
} from "lucide-react";
import { Link } from "react-router-dom";
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

const MyEventsPage = () => {
  const queryClient = useQueryClient();
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [isForceDelete, setIsForceDelete] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ["my-events"],
    queryFn: async () => {
      const { data } = await api.get("/events/my");
      return data;
    },
  });

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
        setIsForceDelete(true);
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

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40 font-black uppercase tracking-widest text-[10px]">
          Syncing Roster...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 min-h-screen bg-background text-foreground">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4 text-primary uppercase tracking-[0.3em] font-black text-[10px]">
            <Layers className="h-4 w-4" />
            Event Roster
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase leading-none text-foreground italic">
            Your <span className="text-primary">Events.</span>
          </h1>
          <p className="text-muted-foreground text-sm font-bold italic mt-3">
            Manage your stage schedules and ticketing performance.
          </p>
        </div>
        <div className="flex gap-4">
          <Link to="/events/create">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] px-8 py-5 h-12 rounded-xl shadow-lg hover:shadow-primary/20 gap-2 border-none transition-all">
              <Plus className="h-4 w-4" />
              New Event
            </Button>
          </Link>
        </div>
      </header>

      {/* Stats Summary - Redesigned for City Pulse */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 bg-card border border-border rounded-2xl group hover:border-primary/30 transition-all shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Total Revenue
          </p>
          <div className="flex items-end gap-2 text-foreground">
            <span className="text-2xl font-black leading-none uppercase italic">
              ₹
              {(
                events?.reduce(
                  (acc: any, curr: any) => acc + (curr.totalRevenue || 0),
                  0,
                ) || 0
              ).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="p-6 bg-card border border-border rounded-2xl group hover:border-primary/30 transition-all shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Active Tickets
          </p>
          <div className="flex items-end gap-2 text-foreground">
            <span className="text-2xl font-black leading-none uppercase italic">
              {events?.reduce(
                (acc: any, curr: any) => acc + (curr.totalSold || 0),
                0,
              ) || 0}
            </span>
            <span className="text-[10px] font-black text-muted-foreground italic">
              total scanned
            </span>
          </div>
        </div>
        <div className="p-6 bg-muted/30 border border-border rounded-2xl group transition-all shadow-inner">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              Platform Heat
            </p>
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <div className="h-1.5 w-full bg-muted mt-2 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[70%] animate-pulse" />
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-border mt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground italic">
            Event Roster
          </h2>
        </div>

      <div className="bg-card border border-border rounded-[1.5rem] overflow-hidden shadow-xl mt-12 transition-all duration-500">
        <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground flex items-center gap-3">
              <Layers className="h-4 w-4 text-primary" />
              Event Roster Management
            </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/10 text-muted-foreground text-[9px] font-black uppercase tracking-[.2em] border-b border-border">
                <th className="px-8 py-5">Event Identity</th>
                <th className="px-8 py-5">Chronology</th>
                <th className="px-8 py-5 text-right">Yield Metrics</th>
                <th className="px-8 py-5 text-center">Authorization Status</th>
                <th className="px-8 py-5 text-right">Systems</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {events?.length === 0 ? (
                 <tr>
                    <td colSpan={5} className="py-20 text-center text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] italic">
                       No active events found in grid.
                    </td>
                 </tr>
              ) : (
                events?.map((p: any, index: number) => (
                  <motion.tr
                    key={p._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-muted/10 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                         <div className="h-9 w-9 bg-primary/10 text-primary flex items-center justify-center rounded-xl font-black text-xs border border-primary/20">
                            {p.title.charAt(0)}
                         </div>
                         <div>
                            <Link to={`/portal/manager/events/${p._id}/details`} className="font-black text-sm uppercase tracking-tight text-foreground hover:text-primary transition-colors block italic">
                               {p.title}
                            </Link>
                            <Badge className="bg-muted/50 text-muted-foreground border border-border/50 rounded-md text-[7px] font-black uppercase tracking-[.1em] px-2 py-0.5 mt-1">
                               {p.category}
                            </Badge>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="text-[10px] font-black uppercase tracking-widest text-foreground/80 flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-orange-500" />
                          {new Date(p.date).toLocaleDateString()}
                       </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <div className="text-sm font-black text-emerald-500 italic uppercase">₹{(p.totalRevenue || 0).toLocaleString()}</div>
                       <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mt-1">{p.totalSold || 0} ASSETS DEPLOYED</div>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <Badge 
                        variant="outline"
                        className={`rounded-xl border-border bg-muted/20 text-[8px] font-black uppercase tracking-widest px-3 py-1.5 ${
                          p.status === 'under_review' ? 'text-orange-500 border-orange-500/20' : 
                          p.status === 'blocked' ? 'text-rose-500 border-rose-500/20' : 
                          'text-emerald-500 border-emerald-500/20'
                        }`}
                      >
                        {p.status?.replace('_', ' ') || "ACTIVE"}
                      </Badge>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          <Link to={`/portal/manager/events/${p._id}/details`}>
                             <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
                                <Search className="h-3.5 w-3.5" />
                             </Button>
                          </Link>
                          <Link to={`/portal/manager/events/${p._id}/edit`}>
                             <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
                                <Edit3 className="h-3.5 w-3.5" />
                             </Button>
                          </Link>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 rounded-lg hover:bg-rose-500/10 hover:text-rose-500"
                            onClick={() => setDeleteEventId(p._id)}
                          >
                             <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                       </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteEventId}
        onOpenChange={() => {
          if (!deleteMutation.isPending) {
            setDeleteEventId(null);
            setWarningMessage(null);
            setIsForceDelete(false);
          }
        }}
      >
        <AlertDialogContent className="bg-card border border-border rounded-[2.5rem] text-foreground shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
              {warningMessage ? (
                <>
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                  Critical Warning
                </>
              ) : (
                "Decommission Event?"
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium italic pt-4">
              {warningMessage ? (
                <div className="space-y-4">
                  <p className="text-destructive font-black">
                    {warningMessage}
                  </p>
                  <p>
                    Deleting this event will invalidate all existing
                    reservations. This action cannot be reversed within the
                    current protocol.
                  </p>
                </div>
              ) : (
                "This will remove the event from the active roster. This action is irreversible."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-8 gap-3">
            <AlertDialogCancel className="rounded-2xl border-border bg-muted/50 hover:bg-muted text-muted-foreground font-black uppercase text-[10px] tracking-widest h-14 px-8 transition-all">
              Abort Signal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className={`rounded-2xl font-black uppercase text-[10px] tracking-widest h-14 px-10 shadow-lg transition-all ${
                warningMessage
                  ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-destructive/20"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
              }`}
            >
              {deleteMutation.isPending
                ? "Processing..."
                : warningMessage
                  ? "Force Deletion"
                  : "Confirm Decommission"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyEventsPage;
