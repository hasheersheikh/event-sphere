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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Video as VideoIcon,
  ExternalLink,
  Loader2,
  Upload,
  Check,
  Edit2,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface HeroAsset {
  _id: string;
  type: "image" | "video";
  url: string;
  targetUrl?: string;
  duration: number;
  order: number;
  targetDevice: "mobile" | "desktop" | "all";
  isActive: boolean;
}

interface UploadedFile {
  url: string;
  type: "image" | "video";
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BLANK_FORM = {
  type: "image" as "image" | "video",
  url: "",
  targetUrl: "",
  duration: 5000,
  order: 0,
  targetDevice: "all" as "mobile" | "desktop" | "all",
  isActive: true,
};

// ─── Main Component ───────────────────────────────────────────────────────────

const HeroManagementPage = () => {
  const queryClient = useQueryClient();

  // Cloudinary widget — one instance per dialog session, destroyed on close
  const widgetRef = useRef<any>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCloudinaryOpen, setIsCloudinaryOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState(false);

  // ── Fetch all assets (admin) ──────────────────────────────────────────────

  const { data: assets = [], isLoading } = useQuery<HeroAsset[]>({
    queryKey: ["heroAssets", "admin"],
    queryFn: async () => {
      const { data } = await api.get("/hero-assets/all");
      return data;
    },
    staleTime: 0,
  });

  // Check if current order value is a duplicate (after assets is loaded)
  const isDuplicateOrder = editingId
    ? assets.some((a) => a.order === form.order && a._id !== editingId)
    : assets.some((a) => a.order === form.order);

  // ── Create ────────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: async (payload: typeof BLANK_FORM & { id?: string }) => {
      if (payload.id) {
        // Update mode
        const { id, ...updateData } = payload;
        const { data } = await api.put(`/hero-assets/${id}`, updateData);
        return data as HeroAsset;
      } else {
        // Create mode
        const { data } = await api.post("/hero-assets", payload);
        return data as HeroAsset;
      }
    },
    onSuccess: (updated, variables) => {
      if (variables.id) {
        // Update existing in list
        queryClient.setQueryData<HeroAsset[]>(
          ["heroAssets", "admin"],
          (old = []) => old.map((a) => (a._id === updated._id ? updated : a))
        );
        toast({ title: "Asset updated" });
      } else {
        // Append new to list
        queryClient.setQueryData<HeroAsset[]>(
          ["heroAssets", "admin"],
          (old = []) => [...old, updated]
        );
        toast({ title: "Asset added to hero gallery" });
      }
      // Also re-sync public hero feed on home page
      queryClient.invalidateQueries({ queryKey: ["heroAssets"] });
      closeDialog();
    },
    onError: (err: any, variables: any) => {
      toast({
        title: variables?.id ? "Failed to update asset" : "Failed to add asset",
        description: err.response?.data?.message ?? "Please try again.",
        variant: "destructive",
      });
    },
  });

  // ── Normalize Orders (reassign sequential 0, 1, 2, 3...) ────────────────────────

  const normalizeOrders = (assetList: HeroAsset[]): HeroAsset[] => {
    return assetList.map((asset, index) => ({ ...asset, order: index }));
  };

  // ── Quick Reorder (swap positions with adjacent asset) ───────────────────────

  const quickReorderMutation = useMutation({
    mutationFn: async ({ asset1, asset2 }: { asset1: { id: string; order: number }, asset2: { id: string; order: number } }) => {
      // Swap the order values between the two assets
      await Promise.all([
        api.put(`/hero-assets/${asset1.id}`, { order: asset2.order }),
        api.put(`/hero-assets/${asset2.id}`, { order: asset1.order }),
      ]);
      return { asset1, asset2 };
    },
    onSuccess: ({ asset1, asset2 }) => {
      queryClient.setQueryData<HeroAsset[]>(
        ["heroAssets", "admin"],
        (old = []) => {
          const updated = old.map((a) => {
            if (a._id === asset1.id) return { ...a, order: asset2.order };
            if (a._id === asset2.id) return { ...a, order: asset1.order };
            return a;
          });
          return updated.sort((a, b) => a.order - b.order);
        }
      );
      queryClient.invalidateQueries({ queryKey: ["heroAssets"] });
    },
    onError: () => {
      toast({ title: "Failed to reorder", variant: "destructive" });
    },
  });

  const moveUp = (asset: HeroAsset) => {
    // Find the index of the current asset
    const currentIndex = assets.findIndex((a) => a._id === asset._id);
    if (currentIndex <= 0) return; // Already at top

    // Get the asset above
    const assetAbove = assets[currentIndex - 1];
    quickReorderMutation.mutate({
      asset1: { id: asset._id, order: asset.order },
      asset2: { id: assetAbove._id, order: assetAbove.order },
    });
  };

  const moveDown = (asset: HeroAsset) => {
    // Find the index of the current asset
    const currentIndex = assets.findIndex((a) => a._id === asset._id);
    if (currentIndex >= assets.length - 1) return; // Already at bottom

    // Get the asset below
    const assetBelow = assets[currentIndex + 1];
    quickReorderMutation.mutate({
      asset1: { id: asset._id, order: asset.order },
      asset2: { id: assetBelow._id, order: assetBelow.order },
    });
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/hero-assets/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["heroAssets"] });
      toast({ title: "Asset deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete asset", variant: "destructive" });
    },
  });

  // ── Dialog helpers ────────────────────────────────────────────────────────

  const openDialog = () => {
    setEditingId(null);
    // Calculate next order number (end of sequence)
    const maxOrder = assets.length > 0
      ? Math.max(...assets.map(asset => asset.order))
      : 0;
    const nextOrder = maxOrder + 1;

    setForm({
      ...BLANK_FORM,
      order: nextOrder
    });
    setUploadedFile(null);
    setUploading(false);
    setDialogOpen(true);
  };

  const editAsset = (asset: HeroAsset) => {
    setEditingId(asset._id);
    setForm({
      type: asset.type,
      url: asset.url,
      targetUrl: asset.targetUrl ?? "",
      duration: asset.duration,
      order: asset.order,
      targetDevice: asset.targetDevice,
      isActive: asset.isActive,
    });
    setUploadedFile({
      url: asset.url,
      type: asset.type,
    });
    setUploading(false);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    // Destroy widget so next open gets a fresh instance with no residual state
    if (widgetRef.current) {
      widgetRef.current.destroy();
      widgetRef.current = null;
    }
    setEditingId(null);
    setForm(BLANK_FORM);
    setUploadedFile(null);
    setUploading(false);
    setDialogOpen(false);
  };

  // ── Cloudinary upload widget ──────────────────────────────────────────────

  const openUploadWidget = () => {
    // @ts-ignore
    if (!window.cloudinary) {
      toast({
        title: "Upload widget unavailable",
        description: "Disable ad blockers or check your connection, then refresh.",
        variant: "destructive",
      });
      return;
    }

    // Create once per dialog session — reuse if already created
    if (!widgetRef.current) {
      // @ts-ignore
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
          uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
          sources: ["local", "url", "camera"],
          multiple: false,
          resourceType: "auto",
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "gif", "mp4", "mov", "webm"],
          maxFileSize: 50_000_000,
          singleUploadAutoClose: true,
          showCompletedButton: false,
          styles: {
            zIndex: 99999,
          },
        },
        (error: any, result: any) => {
          if (error) {
            console.error("Cloudinary widget error:", error);
            setUploading(false);
            toast({
              title: "Upload failed",
              description: error.statusText ?? "An error occurred during upload.",
              variant: "destructive",
            });
            return;
          }

          switch (result.event) {
            case "upload-added":
              setUploading(true);
              break;

            case "success": {
              const info = result.info;
              const isVideo = info.resource_type === "video";
              const file: UploadedFile = {
                url: info.secure_url,
                type: isVideo ? "video" : "image",
              };
              setUploadedFile(file);
              setForm((prev) => ({
                ...prev,
                url: info.secure_url,
                type: isVideo ? "video" : "image",
              }));
              setUploading(false);
              break;
            }

            case "display-changed":
              if (result.info === "shown") setIsCloudinaryOpen(true);
              if (result.info === "hidden") setIsCloudinaryOpen(false);
              break;

            case "close":
              setUploading(false);
              setIsCloudinaryOpen(false);
              break;
          }
        }
      );
    }

    widgetRef.current.open();
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = () => {
    if (!form.url || createMutation.isPending) return;

    // For new assets, find the next available order (max + 1)
    let finalOrder = form.order;
    if (!editingId) {
      const maxOrder = Math.max(0, ...assets.map((a) => a.order));
      finalOrder = maxOrder + 1;
    } else {
      // For editing, check if this order is already taken by another asset
      const existingWithSameOrder = assets.find(
        (a) => a.order === form.order && a._id !== editingId
      );
      if (existingWithSameOrder) {
        toast({
          title: "Order already in use",
          description: `Asset #${form.order} already exists. Use the arrow buttons to reorder.`,
          variant: "destructive",
        });
        return;
      }
    }

    const payload = editingId
      ? { ...form, id: editingId, order: finalOrder }
      : { ...form, order: finalOrder };
    createMutation.mutate(payload);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Hero Gallery</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage homepage hero images and videos.
          </p>
        </div>
        <Button onClick={openDialog} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </div>

      {/* Asset grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-video rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-36 border-2 border-dashed border-border rounded-3xl gap-4 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground/20" />
          <div>
            <p className="font-semibold text-muted-foreground">Gallery is empty</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Click &ldquo;Add Asset&rdquo; to upload your first hero image or video.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset, index) => (
            <AssetCard
              key={asset._id}
              asset={asset}
              onEdit={editAsset}
              onMoveUp={moveUp}
              onMoveDown={moveDown}
              canMoveUp={index > 0}
              canMoveDown={index < assets.length - 1}
              onDelete={(id) => {
                if (confirm("Delete this asset? This cannot be undone.")) {
                  deleteMutation.mutate(id);
                }
              }}
              isDeleting={
                deleteMutation.isPending && (deleteMutation.variables as string) === asset._id
              }
            />
          ))}
        </div>
      )}

      {/* Add asset dialog */}
      <Dialog
        modal={!isCloudinaryOpen}
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Hero Asset" : "Add Hero Asset"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Upload zone */}
            <button
              type="button"
              onClick={openUploadWidget}
              disabled={uploading}
              className={cn(
                "relative w-full cursor-pointer rounded-xl border-2 border-dashed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                uploadedFile
                  ? "border-primary/40 bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/40"
              )}
            >
              {uploadedFile ? (
                <div className="aspect-video overflow-hidden rounded-xl">
                  {uploadedFile.type === "image" ? (
                    <img
                      src={uploadedFile.url}
                      alt="Uploaded preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={uploadedFile.url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                    <span className="text-white text-xs font-semibold bg-black/70 px-3 py-1.5 rounded-full">
                      Click to replace
                    </span>
                  </div>
                </div>
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center gap-3 text-muted-foreground px-6">
                  {uploading ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="text-sm font-medium">Uploading…</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8" />
                      <span className="text-sm font-medium">Click to upload image or video</span>
                      <span className="text-xs opacity-60">
                        JPG, PNG, WebP, GIF, MP4, MOV (max 50 MB)
                      </span>
                    </>
                  )}
                </div>
              )}
            </button>

            {/* Upload success indicator */}
            {uploadedFile && (
              <div className="flex items-center gap-2 text-xs text-primary font-medium">
                <Check className="h-3.5 w-3.5" />
                {uploadedFile.type === "video" ? "Video" : "Image"} ready. Configure settings below and save
              </div>
            )}

            {/* Settings */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Display Order / Sequence
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) || 0 }))}
                  className={cn(
                    "w-full h-10 px-3 rounded-lg border bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors",
                    isDuplicateOrder
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-input focus-visible:ring-ring"
                  )}
                />
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground">
                    {editingId
                      ? "Change position, or use arrow buttons on cards to reorder."
                      : "New assets are automatically placed at the end."}
                  </p>
                  {isDuplicateOrder && (
                    <span className="text-[10px] text-destructive font-medium">
                      Order #{form.order} already exists
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Target URL (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={form.targetUrl}
                  onChange={(e) => setForm((f) => ({ ...f, targetUrl: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <p className="text-[10px] text-muted-foreground">
                  If provided, clicking the hero image will open this URL in a new tab
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Target Device
                  </label>
                  <Select
                    value={form.targetDevice}
                    onValueChange={(v: "all" | "desktop" | "mobile") =>
                      setForm((f) => ({ ...f, targetDevice: v }))
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Devices</SelectItem>
                      <SelectItem value="desktop">Desktop Only</SelectItem>
                      <SelectItem value="mobile">Mobile Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Duration (images)
                  </label>
                  <Select
                    value={String(form.duration / 1000)}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, duration: Number(v) * 1000 }))
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 5, 7, 10, 15].map((s) => (
                        <SelectItem key={s} value={String(s)}>
                          {s}s
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                onClick={closeDialog}
                className="flex-1"
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1"
                disabled={!form.url || createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  editingId ? "Update Asset" : "Save Asset"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Asset Card ───────────────────────────────────────────────────────────────

interface AssetCardProps {
  asset: HeroAsset;
  onDelete: (id: string) => void;
  onEdit?: (asset: HeroAsset) => void;
  onMoveUp?: (asset: HeroAsset) => void;
  onMoveDown?: (asset: HeroAsset) => void;
  isDeleting: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const AssetCard = ({ asset, onDelete, onEdit, onMoveUp, onMoveDown, isDeleting, canMoveUp, canMoveDown }: AssetCardProps) => (
  <div className="group relative rounded-2xl border border-border overflow-hidden bg-card shadow-sm hover:shadow-lg transition-shadow duration-300">
    {/* Preview */}
    <div className="aspect-video relative bg-muted overflow-hidden">
      {asset.type === "image" ? (
        <img
          src={asset.url}
          alt="Hero asset preview"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <video src={asset.url} className="w-full h-full object-cover" muted />
      )}

      {/* Hover actions overlay */}
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit?.(asset)}
          className="h-9 w-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform"
          title="Edit asset"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <a
          href={asset.url}
          target="_blank"
          rel="noopener noreferrer"
          className="h-9 w-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform"
          title="Open original"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
        <button
          onClick={() => onDelete(asset._id)}
          disabled={isDeleting}
          className="h-9 w-9 rounded-full bg-destructive text-white flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
          title="Delete asset"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Type badge */}
      <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full flex items-center gap-1.5">
        {asset.type === "image" ? (
          <ImageIcon className="h-3 w-3" />
        ) : (
          <VideoIcon className="h-3 w-3" />
        )}
        {asset.type}
      </div>
    </div>

    {/* Meta row */}
    <div className="px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              asset.isActive ? "bg-green-500" : "bg-muted-foreground/40"
            )}
          />
          {asset.isActive ? "Active" : "Paused"}
        </div>
        <div className="flex items-center gap-1">
          <GripVertical className="h-3 w-3 opacity-50" />
          <span className="font-medium text-foreground">#{asset.order}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Quick reorder buttons */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp?.(asset);
            }}
            disabled={!canMoveUp}
            className="p-1.5 rounded hover:bg-accent hover:text-accent-foreground disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="Move up in sequence"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown?.(asset);
            }}
            disabled={!canMoveDown}
            className="p-1.5 rounded hover:bg-accent hover:text-accent-foreground disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="Move down in sequence"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        <span className="font-mono">
          {asset.duration / 1000}s ·{" "}
          {asset.targetDevice === "all" ? "All" : asset.targetDevice}
        </span>
      </div>
    </div>
  </div>
);

export default HeroManagementPage;
