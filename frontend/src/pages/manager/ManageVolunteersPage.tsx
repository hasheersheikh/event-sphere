import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Search,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const ManageVolunteersPage = () => {
  const { eventId } = useParams();
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    fetchVolunteers();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await api.get(`/events/${eventId}`);
      setEvent(response.data);
    } catch (error) {
      toast.error("Failed to fetch event context.");
    }
  };

  const fetchVolunteers = async () => {
    try {
      const response = await api.get(`/manager/events/${eventId}/volunteers`);
      setVolunteers(response.data);
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
      fetchVolunteers();
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
      fetchVolunteers();
    } catch (error) {
      toast.error("Deauthorization sequence failed.");
    }
  };

  if (isLoading) {
    return (
      <div className="h-full min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.5em] animate-pulse">
          Synchronizing Personnel Data...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 min-h-screen bg-zinc-950 p-6 md:p-10">
      <header className="flex flex-col gap-6">
        <Link
          to="/portal/productions"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Productions
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4 text-emerald-400 uppercase tracking-[0.3em] font-black text-[10px]">
              <Shield className="h-4 w-4" />
              Security & Access Control
            </div>
            <h1 className="text-5xl md:text-6xl font-black brand-font tracking-tighter uppercase leading-none text-white">
              Volunteer <span className="text-emerald-500">Registry.</span>
            </h1>
            <p className="text-zinc-500 font-medium mt-4 italic">
              Production: {event?.title} • ID:{" "}
              {eventId?.slice(-8).toUpperCase()}
            </p>
          </div>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="h-16 px-8 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-none shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:bg-emerald-400"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Enroll Volunteer
          </Button>
        </div>
      </header>

      {/* Volunteers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {volunteers.length === 0 ? (
            <div className="col-span-full py-20 border border-white/5 bg-white/5 text-center">
              <Users className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                No active personnel recorded for this production.
              </p>
            </div>
          ) : (
            volunteers.map((v, index) => (
              <motion.div
                key={v._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="bg-zinc-900/50 border border-white/5 p-8 relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDeleteVolunteer(v._id)}
                    className="h-8 w-8 bg-black border border-white/10 flex items-center justify-center text-zinc-500 hover:text-rose-500 hover:border-rose-500/30 transition-all rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-8">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg uppercase tracking-tight text-white">
                      {v.name}
                    </h3>
                    <p className="text-[10px] font-medium text-zinc-500 italic">
                      {v.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 p-3 border border-white/5 rounded-xl">
                    <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">
                      Assigned Gate
                    </p>
                    <p className="text-xs font-black text-emerald-500 flex items-center gap-1 uppercase">
                      <MapPin className="h-3 w-3" />
                      {v.gate || "GATE ALPHA"}
                    </p>
                  </div>
                  <div className="bg-black/40 p-3 border border-white/5 rounded-xl text-right">
                    <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">
                      Status
                    </p>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase rounded-sm">
                      Active
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Volunteer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-zinc-900 border border-white/10 p-10 space-y-8"
          >
            <div>
              <h3 className="text-2xl font-black brand-font uppercase text-white tracking-tight">
                Enroll <span className="text-emerald-500">Personnel.</span>
              </h3>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-2 border-l border-emerald-500 pl-3">
                Assign a volunteer to scan tickets at specific gates.
              </p>
            </div>

            <form onSubmit={handleAddVolunteer} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">
                  Full Identity
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter full name"
                    className="h-14 bg-black border-white/10 pl-12 font-bold focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">
                  Email Coordinates
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="volunteer@example.com"
                    className="h-14 bg-black border-white/10 pl-12 font-bold focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">
                    Access Key
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      required
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="••••••••"
                      className="h-14 bg-black border-white/10 pl-12 font-bold focus:border-emerald-500/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">
                    Gate Designation
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      value={formData.gate}
                      onChange={(e) =>
                        setFormData({ ...formData, gate: e.target.value })
                      }
                      placeholder="GATE 01"
                      className="h-14 bg-black border-white/10 pl-12 font-bold focus:border-emerald-500/50 uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-white/5 text-white text-[10px] font-black uppercase p-6 rounded-none hover:bg-white/10 border-none"
                >
                  Abort
                </Button>
                <Button
                  disabled={isSubmitting}
                  className="flex-1 bg-emerald-500 text-black text-[10px] font-black uppercase p-6 rounded-none hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)] border-none"
                >
                  {isSubmitting ? "Enrolling..." : "Enroll Personnel"}
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
