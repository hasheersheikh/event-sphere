import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  Building2,
  ExternalLink,
  Loader2,
  Upload,
  Check,
  MapPin,
  Edit,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { CLOUDINARY_ENABLED, uploadImageToBackend } from "@/lib/localUpload";
import { UPLOAD_SPECS, validateUploadFile } from "@/lib/uploadSpecs";
import { requestImageCrop } from "@/lib/imageCropController";
import { VENUE_CATEGORIES } from "@/constants/venueCategories";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TrendingVenue {
  _id: string;
  name: string;
  location: string;
  category?: string;
  description?: string;
  image?: string;
  images?: string[];
  order: number;
  isActive: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BLANK_FORM = {
  name: "",
  location: "",
  category: "",
  description: "",
  image: "",
  images: [] as string[],
  order: 0,
  isActive: true,
};

// ─── Main Component ───────────────────────────────────────────────────────────

const TrendingVenueManagementPage = () => {
  const queryClient = useQueryClient();

  const primaryFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // ── Fetch all venues (admin) ──────────────────────────────────────────────

  const { data: venues = [], isLoading } = useQuery<TrendingVenue[]>({
    queryKey: ["trendingVenues", "admin"],
    queryFn: async () => {
      const { data } = await api.get("/trending-venues/all");
      return data;
    },
    staleTime: 0,
  });

  // ── Create/Update ─────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: async (payload: typeof BLANK_FORM) => {
      if (editingId) {
        const { data } = await api.put(`/trending-venues/${editingId}`, payload);
        return data as TrendingVenue;
      } else {
        const { data } = await api.post("/trending-venues", payload);
        return data as TrendingVenue;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trendingVenues"] });
      closeDialog();
      toast({ title: editingId ? "Venue updated" : "Venue added" });
    },
    onError: (err: any) => {
      toast({
        title: "Failed to save venue",
        description: err.response?.data?.message ?? "Please try again.",
        variant: "destructive",
      });
    },
  });

  // ── Delete ────────────────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/trending-venues/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<TrendingVenue[]>(
        ["trendingVenues", "admin"],
        (old = []) => old.filter((v) => v._id !== id)
      );
      queryClient.invalidateQueries({ queryKey: ["trendingVenues"] });
      toast({ title: "Venue deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete venue", variant: "destructive" });
    },
  });

  // ── Dialog helpers ────────────────────────────────────────────────────────

  const openAddDialog = () => {
    setForm(BLANK_FORM);
    setEditingId(null);
    setUploading(false);
    setDialogOpen(true);
  };

  const openEditDialog = (venue: TrendingVenue) => {
    setForm({
      name: venue.name,
      location: venue.location,
      category: venue.category || "",
      description: venue.description || "",
      image: venue.image || "",
      images: venue.images || [],
      order: venue.order,
      isActive: venue.isActive,
    });
    setEditingId(venue._id);
    setUploading(false);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setForm(BLANK_FORM);
    setEditingId(null);
    setUploading(false);
    setDialogOpen(false);
  };

  const handlePrimaryUploadClick = () => {
    primaryFileInputRef.current?.click();
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (CLOUDINARY_ENABLED && cloudName && uploadPreset) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", uploadPreset);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!data.secure_url) throw new Error("Cloudinary upload failed");
      return data.secure_url as string;
    }
    return uploadImageToBackend(file);
  };

  const handleLocalPrimaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateUploadFile(file, UPLOAD_SPECS.venueImage);
    if (validationError) {
      toast({ title: "Upload rejected", description: validationError, variant: "destructive" });
      e.target.value = "";
      return;
    }
    const cropped = await requestImageCrop(file, UPLOAD_SPECS.venueImage.aspect!);
    if (!cropped) { e.target.value = ""; return; }
    try {
      setUploading(true);
      const url = await uploadToCloudinary(cropped);
      setForm((prev) => ({ ...prev, image: url }));
      toast({ title: "Cover image uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleGalleryUploadClick = () => {
    galleryFileInputRef.current?.click();
  };

  const handleLocalGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    for (const file of files) {
      const validationError = validateUploadFile(file, UPLOAD_SPECS.venueImage);
      if (validationError) {
        toast({ title: "Upload rejected", description: `${file.name}: ${validationError}`, variant: "destructive" });
        e.target.value = "";
        return;
      }
    }
    try {
      setUploading(true);
      const urls: string[] = [];
      for (const file of files) {
        const cropped = await requestImageCrop(file, UPLOAD_SPECS.venueImage.aspect!);
        if (!cropped) continue;
        const url = await uploadToCloudinary(cropped);
        urls.push(url);
      }
      setForm((prev) => ({ ...prev, images: [...(prev.images || []), ...urls] }));
      toast({ title: `${urls.length} photo${urls.length > 1 ? "s" : ""} uploaded` });
    } catch {
      toast({ title: "Gallery upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = () => {
    if (!form.name || !form.location || saveMutation.isPending) return;
    saveMutation.mutate(form);
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight italic uppercase">Trending Venues</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1 italic">
            Manage featured venues on the homepage.
          </p>
        </div>
        <Button onClick={openAddDialog} className="gap-2 shrink-0 rounded-xl font-black uppercase tracking-widest text-[10px] italic">
          <Plus className="h-4 w-4" />
          Add Venue
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/5] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : venues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-36 border-2 border-dashed border-border rounded-3xl gap-4 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/20" />
          <div>
            <p className="font-black uppercase tracking-widest text-muted-foreground italic">No venues found</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1 italic">
              Click &ldquo;Add Venue&rdquo; to create your first trending venue.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <div key={venue._id} className="group relative rounded-2xl border border-border overflow-hidden bg-card shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="aspect-[4/5] relative bg-muted overflow-hidden">
                {venue.image ? (
                  <img src={venue.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5">
                    <Building2 className="h-12 w-12 text-primary/20" />
                  </div>
                )}
                {/* Photo count badge */}
                {(() => {
                  const total = Array.from(new Set([venue.image, ...(venue.images || [])].filter(Boolean))).length;
                  return total > 1 ? (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                      <ImageIcon className="h-2.5 w-2.5" />
                      {total} photos
                    </div>
                  ) : null;
                })()}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="h-9 w-9 rounded-full" onClick={() => openEditDialog(venue)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-9 w-9 rounded-full"
                    onClick={() => {
                      if (confirm("Delete this venue?")) deleteMutation.mutate(venue._id);
                    }}
                    disabled={deleteMutation.isPending && deleteMutation.variables === venue._id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4 space-y-1.5">
                <h3 className="text-base font-black uppercase italic tracking-tighter truncate">{venue.name}</h3>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest truncate">{venue.location}</span>
                </div>
                {venue.description && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 pt-0.5">
                    {venue.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* modal={false}: this dialog hosts uploads that open a second, nested
          Radix Dialog (ImageCropDialog). A modal Dialog traps focus/pointer
          events for itself, which blocks all interaction with a dialog nested
          inside it — the crop step would silently hang forever. The crop
          dialog itself stays modal, so it still behaves like a normal modal.
          onPointerDownOutside is also disabled: with modal={false}, Radix
          treats any click inside the (separately-portalled) crop dialog as a
          click "outside" this one and immediately dismisses it — which resets
          the whole form via closeDialog(), discarding the just-uploaded image. */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()} modal={false}>
        <DialogContent
          className="sm:max-w-md flex flex-col max-h-[90vh]"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="shrink-0">
            <DialogTitle className="font-black uppercase italic">
              {editingId ? "Edit Venue" : "Add Trending Venue"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 pt-2 pr-1">
            <input
              ref={primaryFileInputRef}
              type="file"
              accept={UPLOAD_SPECS.venueImage.accept}
              className="hidden"
              onChange={handleLocalPrimaryUpload}
            />
            <input
              ref={galleryFileInputRef}
              type="file"
              accept={UPLOAD_SPECS.venueImage.accept}
              multiple
              className="hidden"
              onChange={handleLocalGalleryUpload}
            />

            <button
              type="button"
              onClick={handlePrimaryUploadClick}
              disabled={uploading}
              className={cn(
                "relative w-full aspect-[4/5] rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2",
                form.image ? "border-primary/40 bg-primary/5 overflow-hidden" : "border-border hover:border-primary/50 hover:bg-muted/40"
              )}
            >
              {form.image ? (
                <>
                  <img src={form.image} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest bg-black/60 px-4 py-2 rounded-full">Change Image</span>
                  </div>
                </>
              ) : uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Upload Cover Photo</span>
                </>
              )}
            </button>
            <p className="text-[9px] font-bold text-muted-foreground/70 text-center -mt-1">
              {UPLOAD_SPECS.venueImage.hint}
            </p>

            {/* Gallery Images Section */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2 ml-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                  Venue Gallery (Multiple Photos)
                </label>
                <span className="text-[9px] font-bold text-muted-foreground/60">· 4:5 ratio recommended</span>
              </div>
              
              {form.images && form.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 border border-border/40 rounded-xl p-2 bg-muted/10">
                  {form.images.map((imgUrl, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-border/60">
                      <img src={imgUrl} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, idx) => idx !== i),
                          }));
                        }}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-destructive-foreground bg-destructive/80 p-1 rounded-full" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleGalleryUploadClick}
                disabled={uploading}
                className="w-full h-9 rounded-xl border border-dashed border-border bg-muted/20 hover:bg-muted/40 text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-1.5 transition-colors italic"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload Gallery Images
              </button>
              <p className="text-[9px] text-muted-foreground/70 ml-1">{UPLOAD_SPECS.venueImage.hint}</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Venue Name</label>
                <Input
                  placeholder="E.G. MADISON SQUARE GARDEN"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-xl font-bold uppercase italic"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Location</label>
                <Input
                  placeholder="E.G. NEW YORK, NY"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="rounded-xl font-bold uppercase italic"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-transparent px-3 text-sm font-bold uppercase italic focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">Select a category</option>
                  {VENUE_CATEGORIES.filter((c) => c !== "All").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description (Optional)</label>
                <Textarea
                  placeholder="BRIEF OVERVIEW OF THE VENUE..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="rounded-xl font-bold uppercase italic min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Display Order</label>
                  <Input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                    className="rounded-xl font-bold"
                  />
                </div>
                <div className="flex items-end pb-1 gap-2">
                   <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-border"
                    id="isActive"
                  />
                  <label htmlFor="isActive" className="text-[10px] font-black uppercase tracking-widest cursor-pointer mb-0.5">Active</label>
                </div>
              </div>
            </div>

          </div>

          {/* Footer pinned outside scroll area */}
          <div className="flex gap-3 pt-4 shrink-0 border-t border-border/30">
            <Button variant="outline" onClick={closeDialog} className="flex-1 rounded-xl font-black uppercase tracking-widest text-[10px] italic">Cancel</Button>
            <Button onClick={handleSave} className="flex-1 rounded-xl font-black uppercase tracking-widest text-[10px] italic" disabled={!form.name || !form.location || saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrendingVenueManagementPage;
