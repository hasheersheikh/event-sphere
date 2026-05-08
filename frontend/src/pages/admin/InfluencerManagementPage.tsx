import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Edit2,
  Users,
  Instagram,
  Star,
  Loader2,
  Upload,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { motion } from "framer-motion";

interface Influencer {
  _id: string;
  name: string;
  handle: string;
  niche: string;
  reach: string;
  image: string;
  instagramUrl?: string;
  isActive: boolean;
}

const BLANK_FORM = {
  name: "",
  handle: "",
  niche: "",
  reach: "",
  image: "",
  instagramUrl: "",
  isActive: true,
};

const InfluencerManagementPage = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK_FORM);

  const { data: influencers = [], isLoading } = useQuery<Influencer[]>({
    queryKey: ["influencers", "admin"],
    queryFn: async () => {
      const { data } = await api.get("/influencers/admin");
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: typeof BLANK_FORM) => {
      const { data } = await api.post("/influencers", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["influencers"] });
      closeDialog();
      toast.success("Influencer added successfully");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<typeof BLANK_FORM> }) => {
      const { data } = await api.patch(`/influencers/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["influencers"] });
      closeDialog();
      toast.success("Influencer updated successfully");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/influencers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["influencers"] });
      toast.success("Influencer removed");
    },
  });

  const openDialog = (inf?: Influencer) => {
    if (inf) {
      setEditId(inf._id);
      setForm({
        name: inf.name,
        handle: inf.handle,
        niche: inf.niche,
        reach: inf.reach,
        image: inf.image,
        instagramUrl: inf.instagramUrl || "",
        isActive: inf.isActive,
      });
    } else {
      setEditId(null);
      setForm(BLANK_FORM);
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditId(null);
    setForm(BLANK_FORM);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-8 bg-background min-h-screen pb-20">
      <PortalPageHeader
        title="Influencer Network"
        icon={Users}
        subtitle="Manage the creators and influencers featured in the marketing portal."
        actions={
          <Button 
            onClick={() => openDialog()}
            className="bg-primary text-primary-foreground h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] italic flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Influencer
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Fetching network...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {influencers.map((inf) => (
            <motion.div
              layout
              key={inf._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-[2rem] p-6 relative group overflow-hidden"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <img 
                    src={inf.image} 
                    alt={inf.name} 
                    className="h-24 w-24 rounded-full object-cover border-2 border-border group-hover:border-primary transition-all duration-500"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-primary text-black h-8 w-8 rounded-full flex items-center justify-center shadow-lg border-4 border-card">
                    <Star className="h-3.5 w-3.5 fill-black" />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black uppercase italic tracking-tight">{inf.name}</h3>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{inf.handle}</p>
                    {inf.instagramUrl && (
                      <a 
                        href={inf.instagramUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Instagram className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">{inf.niche}</p>
                  <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-border/50">
                    {inf.reach} REACH
                  </Badge>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => openDialog(inf)}
                    className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => {
                      if (window.confirm("Remove this creator from the network?")) {
                        deleteMutation.mutate(inf._id);
                      }
                    }}
                    className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {!inf.isActive && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                  <Badge className="bg-muted text-muted-foreground border-border uppercase text-[10px] font-black italic">Inactive</Badge>
                </div>
              )}
            </motion.div>
          ))}

          {influencers.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-[3rem]">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">No creators registered in the engine yet.</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border rounded-[2.5rem] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic tracking-tighter brand-font">
              {editingId ? "Update Creator" : "Add New Creator"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                <Input 
                  value={form.name} 
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="bg-muted/50 border-border rounded-xl h-12 text-[11px] font-black uppercase tracking-widest italic focus-visible:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 text-right block">IG Handle</label>
                <Input 
                  value={form.handle} 
                  onChange={(e) => setForm({...form, handle: e.target.value.startsWith('@') ? e.target.value : '@' + e.target.value})}
                  className="bg-muted/50 border-border rounded-xl h-12 text-[11px] font-black uppercase tracking-widest italic focus-visible:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Niche/Genre</label>
                <Input 
                  value={form.niche} 
                  onChange={(e) => setForm({...form, niche: e.target.value})}
                  placeholder="e.g. Nightlife"
                  className="bg-muted/50 border-border rounded-xl h-12 text-[11px] font-black uppercase tracking-widest italic focus-visible:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 text-right block">Total Reach</label>
                <Input 
                  value={form.reach} 
                  onChange={(e) => setForm({...form, reach: e.target.value})}
                  placeholder="e.g. 500K+"
                  className="bg-muted/50 border-border rounded-xl h-12 text-[11px] font-black uppercase tracking-widest italic focus-visible:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Profile Image URL</label>
              <Input 
                value={form.image} 
                onChange={(e) => setForm({...form, image: e.target.value})}
                placeholder="Unsplash or Direct Link"
                className="bg-muted/50 border-border rounded-xl h-12 text-[11px] font-black uppercase tracking-widest italic focus-visible:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Instagram Profile URL</label>
              <Input 
                value={form.instagramUrl} 
                onChange={(e) => setForm({...form, instagramUrl: e.target.value})}
                placeholder="https://instagram.com/handle"
                className="bg-muted/50 border-border rounded-xl h-12 text-[11px] font-black uppercase tracking-widest italic focus-visible:ring-primary"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setForm({...form, isActive: !form.isActive})}
                className={cn(
                  "h-6 w-11 rounded-full transition-colors relative",
                  form.isActive ? "bg-primary" : "bg-muted"
                )}
              >
                <div className={cn(
                  "h-4 w-4 rounded-full bg-white absolute top-1 transition-all",
                  form.isActive ? "left-6" : "left-1"
                )} />
              </button>
              <span className="text-[10px] font-black uppercase italic tracking-widest text-muted-foreground">Active in engine</span>
            </div>

            <Button 
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="w-full bg-primary text-primary-foreground h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] italic shadow-2xl transition-all"
            >
              {(createMutation.isPending || updateMutation.isPending) ? "Processing..." : (editingId ? "Update Creator" : "Confirm Addition")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InfluencerManagementPage;
