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

const MyProductions = () => {
  const queryClient = useQueryClient();
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [isForceDelete, setIsForceDelete] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const { data: productions, isLoading } = useQuery({
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
      toast.success("Production removed from roster");
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
          error.response?.data?.message || "Failed to delete production",
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
          Syncing Lineup...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4 text-emerald-400 uppercase tracking-[0.3em] font-black text-[10px]">
            <Layers className="h-4 w-4" />
            Lineup Overview
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none text-white italic">
            Your <span className="text-emerald-400">Productions.</span>
          </h1>
          <p className="text-white/40 font-bold italic mt-3">
            Manage your stage schedules and ticketing performance.
          </p>
        </div>
        <div className="flex gap-4">
          <Link to="/events/create">
            <Button className="bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black uppercase tracking-[0.2em] px-10 py-7 rounded-none shadow-[0_0_20px_rgba(16,185,129,0.2)] gap-3 border-none transition-all">
              <Plus className="h-4 w-4" />
              New Production
            </Button>
          </Link>
        </div>
      </header>

      {/* Stats Summary - Redesigned for City Pulse */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl group hover:border-emerald-500/30 transition-all">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">
            Total Revenue
          </p>
          <div className="flex items-end gap-2 text-white">
            <span className="text-3xl font-black leading-none uppercase italic">
              ₹
              {(
                productions?.reduce(
                  (acc: any, curr: any) => acc + (curr.totalRevenue || 0),
                  0,
                ) || 0
              ).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl group hover:border-blue-500/30 transition-all">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">
            Active Tickets
          </p>
          <div className="flex items-end gap-2 text-white">
            <span className="text-3xl font-black leading-none uppercase italic">
              {productions?.reduce(
                (acc: any, curr: any) => acc + (curr.totalSold || 0),
                0,
              ) || 0}
            </span>
            <span className="text-[10px] font-black text-white/20 italic">
              total scanned
            </span>
          </div>
        </div>
        <div className="p-8 bg-zinc-900 border border-white/10 rounded-3xl group hover:bg-black transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
              Platform Heat
            </p>
            <BarChart3 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="h-1 w-full bg-white/5 mt-2 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[70%] animate-pulse" />
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-white/10 mt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black uppercase tracking-tight text-white italic">
            Production Roster
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-white">
          {productions?.map((p: any, index: number) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden group hover:border-emerald-500/30 transition-all duration-500"
            >
              <div className="aspect-[4/3] relative overflow-hidden border-b border-white/10">
                <img
                  src={
                    p.image ||
                    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2070"
                  }
                  alt={p.title}
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                />
                <div className="absolute top-0 right-0 p-4">
                  <Badge className="rounded-full border-none text-[8px] font-black uppercase tracking-widest px-4 py-2 backdrop-blur-md bg-black/60 text-emerald-400">
                    {p.status || "ACTIVE"}
                  </Badge>
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 mb-4 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                  <Clock className="h-3 w-3" />
                  {new Date(p.date).toLocaleDateString()}
                </div>
                <h3 className="text-xl font-black uppercase tracking-tighter mb-8 leading-tight group-hover:text-emerald-400 transition-colors italic line-clamp-1">
                  {p.title}
                </h3>

                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6 items-center">
                  <Link to={`/portal/analytics`} className="flex-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-0 h-auto text-[9px] font-black uppercase tracking-widest gap-2 hover:bg-transparent hover:text-emerald-400 group-hover:translate-x-1 transition-transform"
                    >
                      Metrics <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setDeleteEventId(p._id)}
                      className="text-white/20 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
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
        <AlertDialogContent className="bg-zinc-950 border border-white/10 rounded-[2rem] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
              {warningMessage ? (
                <>
                  <AlertTriangle className="h-6 w-6 text-rose-500" />
                  Critical Warning
                </>
              ) : (
                "Decommission Production?"
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60 font-medium italic pt-4">
              {warningMessage ? (
                <div className="space-y-4">
                  <p className="text-rose-400 font-black">{warningMessage}</p>
                  <p>
                    Deleting this production will invalidate all existing
                    reservations. This action cannot be reversed within the
                    current protocol.
                  </p>
                </div>
              ) : (
                "This will remove the production from the active roster. This action is irreversible."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-8">
            <AlertDialogCancel className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest h-12">
              Abort Signal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className={`rounded-xl font-black uppercase text-[10px] tracking-widest h-12 px-8 ${
                warningMessage
                  ? "bg-rose-500 hover:bg-rose-600 text-white"
                  : "bg-emerald-500 hover:bg-emerald-600 text-black"
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

export default MyProductions;
