import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plus, Trash2, Edit3, BookOpen, Eye, EyeOff, Globe, Lock,
  Clock, Tag,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-blogs"],
    queryFn: async () => {
      const { data } = await api.get("/blogs/admin/all");
      return data as BlogPost[];
    },
  });

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
    total: posts?.length || 0,
    published: posts?.filter((p) => p.status === "published").length || 0,
    public: posts?.filter((p) => p.isPublic).length || 0,
    draft: posts?.filter((p) => p.status === "draft").length || 0,
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-6 bg-primary rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Admin Panel</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter">
            <span className="text-primary">Blog</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage articles and blog posts.</p>
        </div>
        <Button
          onClick={() => navigate("/portal/admin/blog/new")}
          className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-primary gap-2"
        >
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Posts", value: stats.total, color: "text-foreground" },
          { label: "Published", value: stats.published, color: "text-emerald-500" },
          { label: "Public", value: stats.public, color: "text-primary" },
          { label: "Drafts", value: stats.draft, color: "text-amber-500" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : !posts?.length ? (
        <div className="py-24 text-center border border-dashed border-border rounded-3xl">
          <BookOpen className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No posts yet</p>
          <p className="text-xs text-muted-foreground/60 mt-2">Click "New Post" to write your first article.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-primary/20 transition-colors"
            >
              <div className="flex items-center gap-4 p-5">
                {/* Cover thumbnail */}
                <div className="h-16 w-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  {post.coverImage ? (
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-sm truncate">{post.title}</p>
                    {/* Status badges */}
                    <span className={cn(
                      "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border",
                      post.status === "published"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                      {post.status}
                    </span>
                    <span className={cn(
                      "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border flex items-center gap-1",
                      post.isPublic
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-muted text-muted-foreground border-border"
                    )}>
                      {post.isPublic ? <Globe className="h-2.5 w-2.5" /> : <Lock className="h-2.5 w-2.5" />}
                      {post.isPublic ? "Public" : "Private"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{post.excerpt}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {post.views} views
                    </span>
                    {post.tags.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" /> {post.tags.slice(0, 2).join(", ")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Toggle public/private */}
                  <button
                    type="button"
                    onClick={() => togglePublish.mutate({ id: post._id, status: post.status, isPublic: !post.isPublic })}
                    className={cn(
                      "h-8 w-8 rounded-xl flex items-center justify-center transition-colors",
                      post.isPublic
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                    title={post.isPublic ? "Make Private" : "Make Public"}
                  >
                    {post.isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  </button>

                  {/* Toggle draft/published */}
                  <button
                    type="button"
                    onClick={() => togglePublish.mutate({
                      id: post._id,
                      status: post.status === "published" ? "draft" : "published",
                      isPublic: post.isPublic,
                    })}
                    className={cn(
                      "h-8 w-8 rounded-xl flex items-center justify-center transition-colors",
                      post.status === "published"
                        ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                    title={post.status === "published" ? "Unpublish" : "Publish"}
                  >
                    {post.status === "published" ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>

                  {post.status === "published" && post.isPublic && (
                    <Link
                      to={`/blog/${post.slug}`}
                      target="_blank"
                      className="h-8 w-8 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                      title="View public post"
                    >
                      <Globe className="h-4 w-4" />
                    </Link>
                  )}

                  <Link
                    to={`/portal/admin/blog/${post._id}/edit`}
                    className="h-8 w-8 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => { if (confirm("Delete this post?")) deleteMutation.mutate(post._id); }}
                    className="h-8 w-8 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogManagementPage;
