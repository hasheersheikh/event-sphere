import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Search,
  Mail,
  UserCheck,
  UserMinus,
  ExternalLink,
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

const ManagersPage = () => {
  const [managers, setManagers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteManagerId, setDeleteManagerId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await api.get("/admin/managers");
      setManagers(response.data);
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

  return (
    <div className="space-y-10 min-h-screen bg-zinc-950 p-6 md:p-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-4 text-orange-400 uppercase tracking-[0.3em] font-black text-[10px]">
            <ShieldCheck className="h-4 w-4" />
            Verified Creators
          </div>
          <h1 className="text-5xl font-black brand-font tracking-tighter uppercase leading-none text-white">
            Production <span className="text-orange-500">Hub.</span>
          </h1>
          <p className="text-zinc-400 font-medium mt-4 max-w-xl">
            Financial oversight and operational control for event production
            specialists.
          </p>
        </div>
      </header>

      <section className="bg-zinc-900/50 border border-white/5 overflow-hidden backdrop-blur-xl">
        <div className="p-6 border-b border-white/5 bg-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-orange-500 text-black">
            {filteredManagers.length} Operational Units
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="FILTER BY IDENTITY..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-black py-3 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest placeholder:opacity-30 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--mnkhan-charcoal)] text-white text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Manager Identity</th>
                <th className="px-8 py-6">Access Level</th>
                <th className="px-8 py-6">Validation</th>
                <th className="px-8 py-6 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-20 text-center font-black uppercase text-[10px] tracking-widest animate-pulse"
                  >
                    Scanning Grid...
                  </td>
                </tr>
              ) : filteredManagers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-20 text-center font-black uppercase text-[10px] tracking-widest text-muted-foreground"
                  >
                    No verified managers detected.
                  </td>
                </tr>
              ) : (
                filteredManagers.map((m, index) => (
                  <motion.tr
                    key={m._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-white/5 border-b border-white/5 transition-colors group"
                  >
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-black text-white flex items-center justify-center font-black text-xs">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase tracking-tight group-hover:text-emerald-500 transition-colors">
                            {m.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-bold italic">
                            {m.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <Badge className="bg-black text-white rounded-none text-[9px] font-black uppercase tracking-widest px-3 py-1">
                        Production Mgr
                      </Badge>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 ${m.isApproved ? "bg-emerald-500" : "bg-orange-500"}`}
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {m.isApproved ? "Verified" : "Pending Approval"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/portal/admin/managers/${m._id}`}>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-9 w-9 rounded-none border-2 border-black hover:bg-black hover:text-white"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                        {!m.isApproved && (
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleApprove(m._id)}
                            className="h-9 w-9 rounded-none border-2 border-black hover:bg-emerald-500 hover:text-white"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteManagerId(m._id)}
                          className="h-9 w-9 rounded-none text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        >
                          <UserMinus className="h-3.5 w-3.5" />
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
        open={!!deleteManagerId}
        onOpenChange={(open) => !open && setDeleteManagerId(null)}
      >
        <AlertDialogContent className="bg-zinc-950 border border-white/10 rounded-none text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black brand-font uppercase tracking-tighter italic">
              {warningMessage ? "CRITICAL OVERRIDE" : "PURGE PROTOCOL"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 font-medium italic pt-4">
              {warningMessage ? (
                <span className="text-rose-500 block mb-4">
                  {warningMessage}
                </span>
              ) : (
                "This action will permanently remove the manager and all associated productions from the platform grid. This cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-8">
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white rounded-none hover:bg-white/10 text-[10px] font-black uppercase tracking-widest px-8">
              ABORT
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteManagerId!, !!warningMessage)}
              disabled={isDeleting}
              className={`${warningMessage ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-500 hover:bg-emerald-600 text-black"} rounded-none text-[10px] font-black uppercase tracking-widest px-8 shadow-lg transition-all`}
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
