import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users,
  ShieldCheck,
  Plus,
  Trash2,
  Calendar,
  Lock,
  Mail,
  User as UserIcon,
  Search,
  ArrowRight,
} from "lucide-react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AdminVolunteersPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    eventId: "",
    managerId: "",
    gate: "ALPHA",
  });

  const { data: volunteers, isLoading: volunteersLoading } = useQuery({
    queryKey: ["admin-volunteers"],
    queryFn: async () => {
      const { data } = await api.get("/admin/volunteers");
      return data;
    },
  });

  const { data: events } = useQuery({
    queryKey: ["admin-events-list"],
    queryFn: async () => {
      const { data } = await api.get("/admin/events/all");
      return data;
    },
  });

  const { data: managers } = useQuery({
    queryKey: ["admin-managers-list"],
    queryFn: async () => {
      const { data } = await api.get("/admin/managers");
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newData: any) => {
      const { data } = await api.post("/admin/volunteers", newData);
      return data;
    },
    onSuccess: () => {
      toast.success("Personnel initialized on the grid.");
      queryClient.invalidateQueries({ queryKey: ["admin-volunteers"] });
      setIsAdding(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        eventId: "",
        managerId: "",
        gate: "ALPHA",
      });
    },
    onError: () => {
      toast.error("Failed to initialize personnel.");
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/volunteers/${id}`);
    },
    onSuccess: () => {
      toast.success("Personnel removed from session.");
      queryClient.invalidateQueries({ queryKey: ["admin-volunteers"] });
    },
  });

  const filteredVolunteers = volunteers?.filter(
    (v: any) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.event?.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-border pb-12">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 rounded-[1.5rem] bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
            <ShieldCheck className="h-10 w-10 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className="text-[8px] font-black uppercase tracking-widest text-amber-500 border-amber-500/20"
              >
                System Admin
              </Badge>
              <h1 className="text-4xl font-black brand-font tracking-tight uppercase">
                Personnel Control.
              </h1>
            </div>
            <p className="text-muted-foreground font-medium">
              Global management of all event volunteers and station access.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="SEARCH PERSONNEL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 w-full md:w-80 rounded-2xl bg-muted/30 border-border focus:ring-amber-500/30 text-[10px] font-black uppercase tracking-widest"
            />
          </div>

          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-14 px-8 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-tighter gap-3 shadow-[0_10px_30px_rgba(245,158,11,0.2)]">
                <Plus className="h-5 w-5" />
                Enroll Personnel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-card border-border rounded-[2.5rem] p-10">
              <DialogHeader className="mb-8">
                <DialogTitle className="text-3xl font-black brand-font uppercase">
                  Initialize Personnel
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addMutation.mutate(formData);
                }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Full Identity Name
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="ENTER FULL NAME..."
                    className="h-14 rounded-xl bg-muted/30 border-border font-bold text-sm tracking-wide"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Email Protocol
                    </label>
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="EMAIL ADDR..."
                      className="h-14 rounded-xl bg-muted/30 border-border font-bold text-sm tracking-wide"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Access Key
                    </label>
                    <Input
                      required
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="KEYWORD..."
                      className="h-14 rounded-xl bg-muted/30 border-border font-bold text-sm tracking-wide"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Assign to Event
                  </label>
                  <select
                    required
                    value={formData.eventId}
                    onChange={(e) => {
                      const ev = events?.find(
                        (ev: any) => ev._id === e.target.value,
                      );
                      setFormData({
                        ...formData,
                        eventId: e.target.value,
                        managerId: ev?.creator?._id || "",
                      });
                    }}
                    className="w-full h-14 rounded-xl bg-muted/30 border border-border px-4 font-bold text-sm outline-none focus:ring-1 focus:ring-amber-500/30"
                  >
                    <option value="">SELECT EVENT...</option>
                    {events?.map((ev: any) => (
                      <option key={ev._id} value={ev._id}>
                        {ev.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Gate Designation
                  </label>
                  <Input
                    required
                    value={formData.gate}
                    onChange={(e) =>
                      setFormData({ ...formData, gate: e.target.value })
                    }
                    placeholder="ALPHA / BETA / GATE-01..."
                    className="h-14 rounded-xl bg-muted/30 border-border font-bold text-sm tracking-wide"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="w-full h-16 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-xs mt-4"
                >
                  {addMutation.isPending
                    ? "INITIALIZING..."
                    : "INITIALIZE ON GRID"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {volunteersLoading ? (
          <div className="col-span-full py-32 text-center animate-pulse text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">
            Synchronizing Personnel Ledger...
          </div>
        ) : filteredVolunteers?.length > 0 ? (
          filteredVolunteers.map((volunteer: any, index: number) => (
            <motion.div
              key={volunteer._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-[2.5rem] p-8 border border-border/50 relative overflow-hidden group hover:border-amber-500/30 transition-all shadow-xl"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <ShieldCheck className="h-24 w-24 text-amber-500" />
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <UserIcon className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black brand-font uppercase tracking-tight leading-none mb-1">
                    {volunteer.name}
                  </h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {volunteer.email}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <Calendar className="h-4 w-4 text-amber-500" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      Assigned Event.
                    </span>
                    <span className="text-xs font-bold line-clamp-1">
                      {volunteer.event?.title || "PURGED EVENT"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <Users className="h-4 w-4 text-amber-500" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      Responsible Manager
                    </span>
                    <span className="text-xs font-bold">
                      {volunteer.manager?.name || "ADMIN OVERRIDE"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border/30">
                <Badge
                  variant="outline"
                  className="rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border-amber-500/20"
                >
                  GATE: {volunteer.gate}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMutation.mutate(volunteer._id)}
                  className="rounded-xl h-10 w-10 text-destructive hover:bg-destructive hover:text-white transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-40 text-center glass-card rounded-[3rem] border border-dashed border-border/30">
            <div className="h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-8">
              <Users className="h-12 w-12 text-muted-foreground/20" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">
              Personnel Clear
            </h3>
            <p className="text-muted-foreground font-medium max-w-sm mx-auto">
              No volunteers are currently initialized on the platform grid.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVolunteersPage;
