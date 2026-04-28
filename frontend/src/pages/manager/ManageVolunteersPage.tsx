import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Users,
  UserPlus,
  Trash2,
  Shield,
  ArrowLeft,
  Lock,
  Mail,
  User,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { PortalGrid } from "@/components/portal/PortalGrid";
import { motion } from "framer-motion";

const ManageVolunteersPage = () => {
  const { eventId } = useParams();
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [event, setEvent] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  useEffect(() => {
    fetchVolunteers(page);
  }, [eventId, page]);

  const fetchEventDetails = async () => {
    try {
      const response = await api.get(`/events/${eventId}`);
      setEvent(response.data);
    } catch (error) {
      toast.error("Failed to fetch event context.");
    }
  };

  const fetchVolunteers = async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/manager/events/${eventId}/volunteers?page=${pageNum}&limit=12`);
      setVolunteers(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error("Failed to synchronize volunteer registry.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/manager/volunteers", {
        ...formData,
        eventId,
      });
      toast.success("Volunteer identity successfully encoded.");
      setIsAddModalOpen(false);
      setFormData({ name: "", email: "", password: "", gate: "" });
      fetchVolunteers(page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add volunteer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVolunteer = async (id: string) => {
    if (!confirm("Are you sure you want to deauthorize this volunteer?"))
      return;
    try {
      await api.delete(`/manager/volunteers/${id}`);
      toast.success("Volunteer deauthorized from system.");
      fetchVolunteers(page);
    } catch (error) {
      toast.error("Deauthorization sequence failed.");
    }
  };

  return (
    <div className="p-3 md:p-4 space-y-4 bg-background min-h-screen">
      <Link
        to="/portal/events"
        className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <ArrowLeft className="h-3 w-3" />
        Return to Sector
      </Link>

      <PortalPageHeader
        title="Personnel Registry"
        icon={Shield}
        subtitle={`Operational station and guard access protocols for ${event?.title || "selected operation"}.`}
        badge={
          <Badge className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md italic">
            {pagination?.total ?? 0} ACTIVE ROLES
          </Badge>
        }
        actions={
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="h-10 px-6 bg-[#C4F000] text-black text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg border-none hover:bg-[#A3C800] hover:scale-105 transition-all italic"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Initialize Role
          </Button>
        }
      />

      <PortalGrid
        data={volunteers}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        columns={3}
        renderItem={(v: any) => (
          <div
            key={v._id}
            className="bg-card/40 border border-border/50 p-4 relative group overflow-hidden rounded-xl shadow-sm hover:border-primary/20 transition-all"
          >
            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all">
              <button
                onClick={() => handleDeleteVolunteer(v._id)}
                className="h-8 w-8 bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:border-rose-500/30 transition-all rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 italic">
                {v.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-xs uppercase tracking-tight text-foreground italic truncate">
                  {v.name}
                </h3>
                <p className="text-[9px] font-black text-muted-foreground/40 truncate opacity-60 uppercase tracking-widest">
                  {v.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/10 p-2.5 border border-border/50 rounded-xl">
                <p className="text-[7px] font-black text-muted-foreground/40 uppercase mb-1 leading-none tracking-widest">
                  STATION
                </p>
                <p className="text-[10px] font-black text-primary flex items-center gap-1.5 uppercase italic leading-none">
                  <MapPin className="h-3 w-3 opacity-50" />
                  {v.gate || "ALPHA"}
                </p>
              </div>
              <div className="bg-muted/10 p-2.5 border border-border/50 rounded-xl text-right">
                <p className="text-[7px] font-black text-muted-foreground/40 uppercase mb-1 leading-none tracking-widest">
                  STATUS
                </p>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[7px] font-black uppercase rounded-sm px-1.5 h-4 italic">
                  OPERATIONAL
                </Badge>
              </div>
            </div>
          </div>
        )}
        emptyMessage="No personnel records found in this sector."
      />

      {/* Add Volunteer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-background border border-border p-6 space-y-5 rounded-2xl shadow-3xl"
          >
            <div>
              <h3 className="text-xl font-black brand-font uppercase text-foreground tracking-tight italic">
                Enroll <span className="text-primary">Personnel.</span>
              </h3>
              <p className="text-muted-foreground text-[8px] font-black uppercase tracking-widest mt-2 border-l-2 border-primary pl-3 opacity-60">
                Authorized gate scanner protocol initialization.
              </p>
            </div>

            <form onSubmit={handleAddVolunteer} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">
                  Identity
                </label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="NAME..."
                  className="h-10 bg-muted/20 border-border font-black focus:border-primary/50 rounded-xl text-xs uppercase tracking-widest italic"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">
                  Frequency (Email)
                </label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="EMAIL..."
                  className="h-10 bg-muted/20 border-border font-black focus:border-primary/50 rounded-xl text-xs tracking-widest italic"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">
                    Access Key
                  </label>
                  <Input
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••"
                    className="h-10 bg-muted/20 border-border font-black focus:border-primary/50 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest ml-1">
                    Station
                  </label>
                  <Input
                    value={formData.gate}
                    onChange={(e) =>
                      setFormData({ ...formData, gate: e.target.value })
                    }
                    placeholder="GATE"
                    className="h-10 bg-muted/20 border-border font-black focus:border-primary/50 rounded-xl text-xs uppercase tracking-widest italic"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-muted border-none text-foreground text-[10px] font-black uppercase h-10 rounded-xl hover:bg-muted/80 transition-all italic"
                >
                  Abort
                </Button>
                <Button
                  disabled={isSubmitting}
                  className="flex-1 bg-[#C4F000] text-black text-[10px] font-black uppercase h-10 rounded-xl hover:bg-[#A3C800] shadow-xl border-none italic"
                >
                  {isSubmitting ? "PROCESSING..." : "FINALIZED ENROLL"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ManageVolunteersPage;
