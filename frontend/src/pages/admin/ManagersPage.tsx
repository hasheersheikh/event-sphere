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
    <div className="space-y-10 min-h-screen bg-background p-6 md:p-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-10">
        <div>
          <div className="flex items-center gap-3 mb-5 text-primary uppercase tracking-[0.4em] font-black text-[10px]">
            <ShieldCheck className="h-4 w-4" />
            Verified Creators Registry
          </div>
          <h1 className="text-3xl md:text-5xl font-black brand-font tracking-tighter uppercase leading-none text-foreground">
            Manager <span className="text-primary">Directory.</span>
          </h1>
          <p className="text-muted-foreground font-bold italic mt-5 max-w-2xl text-[13px] leading-relaxed">
            Financial oversight and operational control for event management
            specialists across the platform.
          </p>
        </div>
      </header>

      <section className="bg-card border border-border overflow-hidden rounded-[1.5rem] shadow-xl">
        <div className="p-6 border-b border-border bg-muted/20 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="text-[10px] font-black uppercase tracking-widest px-5 py-2.5 bg-primary text-primary-foreground rounded-lg shadow-lg shadow-primary/20">
            {filteredManagers.length} ACTIVE OPERATIONAL UNITS
          </div>
          <div className="relative w-full md:w-[350px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <input
              type="text"
              placeholder="SEARCH BY IDENTITY OR EMAIL..."
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
                <th className="px-8 py-6">Manager Identity</th>
                <th className="px-8 py-6">Access Level</th>
                <th className="px-8 py-6">Validation</th>
                <th className="px-8 py-6 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
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
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="h-11 w-11 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center font-black text-base shadow-sm">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase tracking-tight group-hover:text-primary transition-colors text-foreground">
                            {m.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-bold italic opacity-70">
                            {m.email}
                          </p>
                        </div>
                      </div>
                    </td>
                                    <td className="px-8 py-6">
                      <Badge className="bg-muted text-foreground border border-border rounded-lg text-[9px] font-black uppercase tracking-widest px-3 py-1.5">
                        Event Mgr
                      </Badge>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`h-2 w-2 rounded-full shadow-sm ${m.isApproved ? "bg-emerald-500 shadow-emerald-500/50" : "bg-orange-500 shadow-orange-500/50"}`}
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">
                          {m.isApproved ? "Verified" : "Pending"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <Link to={`/portal/admin/managers/${m._id}`}>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-9 w-9 rounded-lg border-2 border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                        {!m.isApproved && (
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleApprove(m._id)}
                            className="h-9 w-9 rounded-lg border-2 border-border hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm"
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteManagerId(m._id)}
                          className="h-9 w-9 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        >
                          <UserMinus className="h-4 w-4" />
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
        <AlertDialogContent className="bg-background border border-border rounded-[2rem] text-foreground max-w-md p-10 shadow-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl font-black brand-font uppercase tracking-tighter italic">
              {warningMessage ? "CRITICAL OVERRIDE" : "PURGE PROTOCOL"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-bold italic pt-6 leading-relaxed">
              {warningMessage ? (
                <span className="text-rose-500 block mb-6 px-4 py-3 bg-rose-500/10 border-l-4 border-rose-500">
                  {warningMessage}
                </span>
              ) : (
                "This action will permanently remove the manager and all associated events from the platform grid. This operation is non-reversible."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-10 gap-4">
            <AlertDialogCancel className="bg-muted border-border text-foreground rounded-xl hover:bg-muted/80 text-[11px] font-black uppercase tracking-widest px-10 h-14 transition-all">
              ABORT
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteManagerId!, !!warningMessage)}
              disabled={isDeleting}
              className={`${warningMessage ? "bg-rose-600 hover:bg-rose-700" : "bg-primary hover:bg-primary/90 text-primary-foreground"} rounded-xl text-[11px] font-black uppercase tracking-widest px-10 h-14 shadow-2xl transition-all border-none`}
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
