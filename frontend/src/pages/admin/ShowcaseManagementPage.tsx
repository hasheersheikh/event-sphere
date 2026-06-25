import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, Instagram, Youtube, ExternalLink, Loader2, ToggleLeft, ToggleRight, Video } from "lucide-react";
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShowcaseVideo {
  _id: string;
  platform: "instagram" | "youtube";
  videoId: string;
  label?: string;
  isActive: boolean;
  order: number;
}

// Parse a URL or raw ID and return { platform, videoId }
function parseVideoInput(input: string): { platform: "instagram" | "youtube"; videoId: string } | null {
  const val = input.trim();
  if (!val) return null;

  // Instagram reel URL: instagram.com/reel/ID/
  const igMatch = val.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
  if (igMatch) return { platform: "instagram", videoId: igMatch[1] };

  // YouTube Shorts URL: youtube.com/shorts/ID
  const ytShortsMatch = val.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]+)/);
  if (ytShortsMatch) return { platform: "youtube", videoId: ytShortsMatch[1] };

  // YouTube watch URL: youtube.com/watch?v=ID or youtu.be/ID
  const ytWatchMatch = val.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
  if (ytWatchMatch) return { platform: "youtube", videoId: ytWatchMatch[1] };

  return null;
}

const BLANK = { urlOrId: "", platform: "instagram" as "instagram" | "youtube", label: "", order: 0 };

const ShowcaseManagementPage = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(BLANK);
  const [adding, setAdding] = useState(false);

  const { data: videos = [], isLoading } = useQuery<ShowcaseVideo[]>({
    queryKey: ["showcase-videos-admin"],
    queryFn: async () => {
      const { data } = await api.get("/showcase-videos/all");
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: { platform: string; videoId: string; label: string; order: number }) =>
      api.post("/showcase-videos", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["showcase-videos-admin"] });
      queryClient.invalidateQueries({ queryKey: ["showcase-videos"] });
      setForm(BLANK);
      setAdding(false);
      toast.success("Video added to showcase");
    },
    onError: () => toast.error("Failed to add video"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.put(`/showcase-videos/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["showcase-videos-admin"] });
      queryClient.invalidateQueries({ queryKey: ["showcase-videos"] });
    },
    onError: () => toast.error("Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/showcase-videos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["showcase-videos-admin"] });
      queryClient.invalidateQueries({ queryKey: ["showcase-videos"] });
      toast.success("Video removed");
    },
    onError: () => toast.error("Failed to delete"),
  });

  const handleAdd = () => {
    const parsed = parseVideoInput(form.urlOrId);
    if (!parsed) {
      // Try treating input as raw ID with selected platform
      if (!form.urlOrId.trim()) { toast.error("Enter a URL or video ID"); return; }
      createMutation.mutate({
        platform: form.platform,
        videoId: form.urlOrId.trim(),
        label: form.label,
        order: form.order,
      });
      return;
    }
    createMutation.mutate({
      platform: parsed.platform,
      videoId: parsed.videoId,
      label: form.label,
      order: form.order,
    });
  };

  const embedUrl = (v: ShowcaseVideo) =>
    v.platform === "instagram"
      ? `https://www.instagram.com/reel/${v.videoId}/embed/`
      : `https://www.youtube.com/embed/${v.videoId}`;

  const externalUrl = (v: ShowcaseVideo) =>
    v.platform === "instagram"
      ? `https://www.instagram.com/reel/${v.videoId}/`
      : `https://www.youtube.com/shorts/${v.videoId}`;

  return (
    <div className="space-y-8">
      <PortalPageHeader
        icon={Video}
        title="Showcase Videos"
        subtitle="Manage Instagram Reels and YouTube Shorts shown on the marketing page"
      />

      {/* Add Form */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest">Add Video</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAdding((v) => !v)}
            className="text-xs font-bold"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            {adding ? "Cancel" : "New"}
          </Button>
        </div>

        {adding && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">
                Instagram Reel or YouTube Shorts URL
              </label>
              <Input
                placeholder="https://www.instagram.com/reel/… or https://www.youtube.com/shorts/…"
                value={form.urlOrId}
                onChange={(e) => setForm((f) => ({ ...f, urlOrId: e.target.value }))}
                className="h-10 text-sm"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Paste the full URL. Platform is detected automatically. Or enter a raw video ID and select the platform below.
              </p>
            </div>

            {/* Platform fallback selector (shown when URL can't be auto-detected) */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Platform:</span>
              {(["instagram", "youtube"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setForm((f) => ({ ...f, platform: p }))}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all",
                    form.platform === p
                      ? "bg-foreground text-background border-foreground"
                      : "border-border/50 text-muted-foreground hover:border-border"
                  )}
                >
                  {p === "instagram" ? <Instagram className="h-3 w-3" /> : <Youtube className="h-3 w-3" />}
                  {p}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">Label (optional)</label>
                <Input
                  placeholder="e.g. Sunburn 2024 Recap"
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  className="h-10 text-sm"
                />
              </div>
              <div className="w-24">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">Order</label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                  className="h-10 text-sm"
                />
              </div>
            </div>

            <Button
              onClick={handleAdd}
              disabled={createMutation.isPending}
              className="h-10 px-6 bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-widest text-[10px] rounded-xl"
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add to Showcase"}
            </Button>
          </motion.div>
        )}
      </div>

      {/* Video list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : videos.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border/50 rounded-2xl">
          <p className="text-sm text-muted-foreground font-medium">No showcase videos yet. Add one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {videos.map((v, idx) => (
            <motion.div
              key={v._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={cn(
                "rounded-2xl border overflow-hidden bg-card transition-all",
                v.isActive ? "border-border/60" : "border-border/30 opacity-60"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
                <div className="flex items-center gap-2.5">
                  {v.platform === "instagram" ? (
                    <div className="h-7 w-7 rounded-lg flex items-center justify-center bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                      <Instagram className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="h-7 w-7 rounded-lg flex items-center justify-center bg-red-600">
                      <Youtube className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground">
                      {v.label || (v.platform === "instagram" ? "Instagram Reel" : "YouTube Short")}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-mono">{v.videoId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <a href={externalUrl(v)} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                  <button
                    onClick={() => toggleMutation.mutate({ id: v._id, isActive: !v.isActive })}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    title={v.isActive ? "Deactivate" : "Activate"}
                  >
                    {v.isActive
                      ? <ToggleRight className="h-4 w-4 text-foreground" />
                      : <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                    }
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(v._id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Embed preview */}
              <iframe
                src={embedUrl(v)}
                className="w-full border-0"
                style={{ height: 480 }}
                allowFullScreen
                loading="lazy"
                title={v.label || v.videoId}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowcaseManagementPage;
