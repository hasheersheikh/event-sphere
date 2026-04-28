import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Trash2, Edit3, BookOpen, Eye, EyeOff, Globe, Lock,
  Clock, Tag,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { PortalStatCard } from "@/components/portal/PortalStatCard";
import { PortalGrid } from "@/components/portal/PortalGrid";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  status: "draft" | "published";
  isPublic: boolean;
  author: string;
  tags: string[];
  views: number;
  createdAt: string;
}

const BlogManagementPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin-blogs", page],
    queryFn: async () => {
      const { data } = await api.get(`/blogs/admin/all?page=${page}&limit=10`);
      return data;
    },
  });

  const posts = (response?.data as BlogPost[]) || [];
  const pagination = response?.pagination;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/blogs/${id}`),
    onSuccess: () => {
      toast.success("Post deleted.");
      qc.invalidateQueries({ queryKey: ["admin-blogs"] });
    },
    onError: () => toast.error("Failed to delete post"),
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, status, isPublic }: { id: string; status: string; isPublic: boolean }) =>
      api.put(`/blogs/${id}`, { status, isPublic }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-blogs"] }),
    onError: () => toast.error("Failed to update post"),
  });

  const stats = {
    total: pagination?.total || 0,
    published: posts?.filter((p) => p.status === "published").length || 0,
  };

  return (
    <div className="p-3 md:p-4 space-y-4 bg-background min-h-screen">
      <PortalPageHeader
        title="Content Management"
        icon={BookOpen}
        subtitle="Operational interface for editorial and broadcast archives."
        badge={
          <Badge className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md italic">
            {pagination?.total ?? 0} ARTICLES
          </Badge>
        }
        actions={
          <Button
            onClick={() => navigate("/portal/admin/blog/new")}
            className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[9px] bg-[#C4F000] text-black shadow-lg hover:bg-[#A3C800] hover:scale-105 transition-all border-none italic"
          >
            <Plus className="h-4 w-4" /> New Transmission
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <PortalStatCard
          label="Total Articles"
          value={stats.total}
          icon={BookOpen}
          subtext="Registry count"
          index={0}
        />
        <PortalStatCard
          label="Active Broadcasts"
          value={stats.published}
          icon={Globe}
          subtext="Status: Published"
          index={1}
          iconClass="icon-revenue"
        />
      </div>

      <PortalGrid
        data={posts}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        columns={1}
        renderItem={(post: BlogPost) => (
          <div
            key={post._id}
            className="bg-card/40 border border-border/50 rounded-xl overflow-hidden hover:border-primary/20 transition-all group"
          >
            <div className="flex items-center gap-4 p-4">
              <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border/50">
                {post.coverImage ? (
                  <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-black text-sm uppercase tracking-tight italic group-hover:text-primary transition-colors text-foreground">
                    {post.title}
                  </p>
                  <Badge className={cn(
                    "text-[8px] font-black uppercase tracking-widest px-2 py-0 border italic",
                    post.status === "published"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  )}>
                    {post.status}
                  </Badge>
                  <Badge className={cn(
                    "text-[8px] font-black uppercase tracking-widest px-2 py-0 border flex items-center gap-1 italic",
                    post.isPublic
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-muted text-muted-foreground border-border"
                  )}>
                    {post.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    {post.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground font-black italic truncate opacity-60 uppercase tracking-widest">{post.excerpt}</p>
                <div className="flex items-center gap-4 mt-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-3 w-3" /> {post.views} Views
                  </span>
                  {post.tags.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Tag className="h-3 w-3" /> {post.tags.slice(0, 2).join(", ")}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => togglePublish.mutate({ id: post._id, status: post.status, isPublic: !post.isPublic })}
                  className={cn(
                    "h-8 w-8 rounded-lg border border-border transition-all",
                    post.isPublic ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {post.isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => togglePublish.mutate({
                    id: post._id,
                    status: post.status === "published" ? "draft" : "published",
                    isPublic: post.isPublic,
                  })}
                  className={cn(
                    "h-8 w-8 rounded-lg border border-border transition-all",
                    post.status === "published" ? "text-emerald-500 hover:bg-emerald-500/10" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {post.status === "published" ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => navigate(`/portal/admin/blog/${post._id}/edit`)}
                  className="h-8 w-8 rounded-lg border border-border hover:bg-primary/10 hover:text-primary"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => { if (confirm("Exec data purge?")) deleteMutation.mutate(post._id); }}
                  className="h-8 w-8 rounded-lg border border-border hover:bg-rose-500 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
        emptyMessage="No editorial archives detected."
      />
    </div>
  );
};

export default BlogManagementPage;
