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
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { PortalGrid } from "@/components/portal/PortalGrid";

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

  const [page, setPage] = useState(1);

  const { data: response, isLoading: volunteersLoading } = useQuery({
    queryKey: ["admin-volunteers", page],
    queryFn: async () => {
      const { data } = await api.get(`/admin/volunteers?page=${page}&limit=20`);
      return data;
    },
  });

  const volunteers = response?.data || [];
  const pagination = response?.pagination;

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
      toast.success("Volunteer added.");
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
      toast.error("Failed to add volunteer.");
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/volunteers/${id}`);
    },
    onSuccess: () => {
      toast.success("Volunteer removed.");
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
    <div className="p-3 md:p-4 space-y-4 bg-background min-h-screen">
      <PortalPageHeader 
        title="Volunteers"
        icon={ShieldCheck}
        subtitle="Manage event volunteers and gate staff."
        badge={
          <Badge className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md italic">
            {pagination?.total ?? 0} VOLUNTEERS
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search volunteers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 w-full md:w-48 rounded-xl bg-muted/30 border-border font-black text-[9px] uppercase tracking-widest"
              />
            </div>

            <Dialog open={isAdding} onOpenChange={setIsAdding}>
              <DialogTrigger asChild>
                <Button className="rounded-xl h-10 px-6 bg-[#C4F000] text-black font-black uppercase tracking-widest text-[9px] shadow-lg hover:bg-[#A3C800] hover:scale-105 transition-all border-none italic">
                  <Plus className="h-4 w-4" />
                  Add Volunteer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-background border-border rounded-2xl p-6 shadow-2xl">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-xl font-black brand-font uppercase italic tracking-tight">
                    Add Volunteer
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addMutation.mutate(formData);
                  }}
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Full Name
                    </label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="NAME..."
                      className="h-9 rounded-lg bg-muted/30 border-border font-bold text-xs tracking-wide"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Email
                      </label>
                      <Input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="EMAIL..."
                        className="h-9 rounded-lg bg-muted/30 border-border font-bold text-xs tracking-wide"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Password
                      </label>
                      <Input
                        required
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="KEY..."
                        className="h-9 rounded-lg bg-muted/30 border-border font-bold text-xs tracking-wide"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Assigned Event
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
                      className="w-full h-9 rounded-lg bg-muted/30 border border-border px-3 font-bold text-xs outline-none focus:ring-1 focus:ring-amber-500/30 text-foreground"
                    >
                      <option value="">SELECT EVENT...</option>
                      {events?.map((ev: any) => (
                        <option key={ev._id} value={ev._id}>
                          {ev.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Gate / Station
                    </label>
                    <Input
                      required
                      value={formData.gate}
                      onChange={(e) =>
                        setFormData({ ...formData, gate: e.target.value })
                      }
                      placeholder="ALPHA / BETA..."
                      className="h-9 rounded-lg bg-muted/30 border-border font-bold text-xs tracking-wide"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={addMutation.isPending}
                    className="w-full h-10 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-[9px] mt-2 shadow-lg shadow-amber-500/10 italic"
                  >
                    {addMutation.isPending
                      ? "ADDING..."
                      : "Add Volunteer"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <PortalGrid
        data={filteredVolunteers || []}
        isLoading={volunteersLoading}
        pagination={pagination}
        onPageChange={setPage}
        columns={3}
        renderItem={(volunteer: any) => (
          <div
            key={volunteer._id}
            className="glass-card rounded-2xl p-4 border border-border/50 relative overflow-hidden group hover:border-primary/30 transition-all shadow-xl bg-card/40"
          >
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <ShieldCheck className="h-20 w-20 text-primary" />
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                <UserIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-black brand-font uppercase tracking-tight leading-none mb-1 text-foreground italic">
                  {volunteer.name}
                </h3>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest truncate opacity-60">
                  {volunteer.email}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 mb-5">
              <div className="flex items-center gap-3 p-2.5 bg-muted/20 rounded-xl border border-border/50">
                <Calendar className="h-4 w-4 text-primary opacity-60" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground opacity-50 leading-none mb-1">
                    EVENT
                  </span>
                  <span className="text-[10px] font-black line-clamp-1 italic uppercase tracking-tighter text-foreground">
                    {volunteer.event?.title || "No Event"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2.5 bg-muted/20 rounded-xl border border-border/50">
                <Users className="h-4 w-4 text-primary opacity-60" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground opacity-50 leading-none mb-1">
                    MANAGER
                  </span>
                  <span className="text-[10px] font-black line-clamp-1 italic uppercase tracking-tighter text-foreground">
                    {volunteer.manager?.name || "PULSE COUNCIL"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/30">
              <Badge
                variant="outline"
                className="rounded-lg px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary border-primary/20 italic"
              >
                GATE {volunteer.gate}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeMutation.mutate(volunteer._id)}
                className="rounded-xl h-8 w-8 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 transition-all border border-transparent hover:border-rose-500/20"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        emptyMessage="No volunteers yet."
      />
    </div>
  );
};

export default AdminVolunteersPage;
