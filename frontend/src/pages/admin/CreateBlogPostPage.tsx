import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ChevronLeft, Save, Eye, Globe, Lock, Tag, X, Upload,
  Bold, Italic, Heading1, Heading2, List, Link2, Image as ImageIcon,
  Code, Quote, BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const CreateBlogPostPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    coverImage: "",
    status: "draft" as "draft" | "published",
    isPublic: false,
    tags: [] as string[],
    metaTitle: "",
    metaDescription: "",
  });

  // Load existing post if editing
  useQuery({
    queryKey: ["admin-blog-edit", id],
    queryFn: async () => {
      const { data } = await api.get(`/blogs/admin/${id}`);
      return data;
    },
    enabled: isEdit,
    onSuccess: (data: any) => {
      setForm({
        title: data.title || "",
        slug: data.slug || "",
        content: data.content || "",
        excerpt: data.excerpt || "",
        coverImage: data.coverImage || "",
        status: data.status || "draft",
        isPublic: data.isPublic || false,
        tags: data.tags || [],
        metaTitle: data.metaTitle || "",
        metaDescription: data.metaDescription || "",
      });
    },
  } as any);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEdit && form.title && !form.slug) {
      setForm((f) => ({
        ...f,
        slug: form.title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim(),
      }));
    }
  }, [form.title]);

  const mutation = useMutation({
    mutationFn: async (values: typeof form) => {
      if (isEdit) {
        const { data } = await api.put(`/blogs/${id}`, values);
        return data;
      }
      const { data } = await api.post("/blogs", values);
      return data;
    },
    onSuccess: (data) => {
      toast.success(isEdit ? "Post updated!" : "Post created!");
      navigate("/portal/admin/blog");
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed to save post"),
  });

  // Toolbar formatting helpers
  const insertFormat = (before: string, after: string = "", placeholder: string = "") => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = form.content.slice(start, end) || placeholder;
    const newContent =
      form.content.slice(0, start) + before + selected + after + form.content.slice(end);
    setForm((f) => ({ ...f, content: newContent }));
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput("");
  };

  const handleCoverUpload = () => {
    // @ts-ignore
    window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        sources: ["local", "url", "camera"],
        multiple: false,
        cropping: true,
        croppingAspectRatio: 16 / 9,
      },
      (error: any, result: any) => {
        if (!error && result?.event === "success") {
          setForm((f) => ({ ...f, coverImage: result.info.secure_url }));
        }
      },
    ).open();
  };

  const TOOLBAR = [
    { icon: Bold, label: "Bold", action: () => insertFormat("**", "**", "bold text") },
    { icon: Italic, label: "Italic", action: () => insertFormat("*", "*", "italic text") },
    { icon: Heading1, label: "H1", action: () => insertFormat("\n# ", "", "Heading 1") },
    { icon: Heading2, label: "H2", action: () => insertFormat("\n## ", "", "Heading 2") },
    { icon: List, label: "List", action: () => insertFormat("\n- ", "", "List item") },
    { icon: Quote, label: "Quote", action: () => insertFormat("\n> ", "", "Blockquote") },
    { icon: Code, label: "Code", action: () => insertFormat("`", "`", "code") },
    { icon: Link2, label: "Link", action: () => insertFormat("[", "](https://)", "link text") },
    { icon: ImageIcon, label: "Image", action: () => insertFormat("![", "](https://image-url)", "alt text") },
  ];

  const wordCount = form.content.trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-card sticky top-0 z-30">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/portal/admin/blog")}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Blog
            </button>
            <span className="text-muted-foreground/30">·</span>
            <h1 className="font-black text-sm uppercase tracking-tight">
              {isEdit ? "Edit Post" : "New Post"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Public / Private toggle */}
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isPublic: !f.isPublic }))}
              className={cn(
                "flex items-center gap-2 h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors",
                form.isPublic
                  ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                  : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
              )}
            >
              {form.isPublic ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              {form.isPublic ? "Public" : "Private"}
            </button>

            {/* Draft / Published toggle */}
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, status: f.status === "published" ? "draft" : "published" }))}
              className={cn(
                "flex items-center gap-2 h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors",
                form.status === "published"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                  : "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
              )}
            >
              {form.status === "published" ? "Published" : "Draft"}
            </button>

            {/* Preview toggle */}
            <button
              type="button"
              onClick={() => setPreviewMode((p) => !p)}
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-muted border border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              <Eye className="h-3.5 w-3.5" /> {previewMode ? "Edit" : "Preview"}
            </button>

            <Button
              type="button"
              onClick={() => mutation.mutate(form)}
              disabled={mutation.isPending || !form.title || !form.content}
              className="h-9 px-5 rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary gap-2"
            >
              <Save className="h-3.5 w-3.5" />
              {mutation.isPending ? "Saving..." : isEdit ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* ── Main editor ── */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-8 space-y-6">
          {/* Title */}
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Post title..."
            className="w-full text-4xl font-black tracking-tighter bg-transparent border-none outline-none placeholder:text-muted-foreground/30 resize-none"
          />

          {/* Slug */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-bold">Slug:</span>
            <span className="font-mono">/blog/</span>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="font-mono bg-muted/30 border border-border rounded-lg px-2 py-0.5 text-xs focus:outline-none focus:border-primary"
              placeholder="post-slug"
            />
          </div>

          {/* Cover image */}
          {form.coverImage ? (
            <div className="relative rounded-2xl overflow-hidden h-48 group">
              <img src={form.coverImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button type="button" onClick={handleCoverUpload}
                  className="h-9 px-4 rounded-xl bg-white text-black font-black text-[10px] uppercase tracking-widest">
                  Change
                </button>
                <button type="button" onClick={() => setForm((f) => ({ ...f, coverImage: "" }))}
                  className="h-9 w-9 rounded-xl bg-destructive/90 text-white flex items-center justify-center">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={handleCoverUpload}
              className="w-full h-32 rounded-2xl border-2 border-dashed border-border bg-muted/10 hover:bg-muted/20 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-colors">
              <Upload className="h-4 w-4" /> Upload Cover Image
            </button>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tags</p>
            <div className="flex flex-wrap gap-2 items-center">
              {form.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black">
                  <Tag className="h-3 w-3" /> {tag}
                  <button type="button" onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))}
                    className="ml-0.5 hover:text-destructive transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
                  placeholder="Add tag..."
                  className="h-7 px-3 rounded-full bg-muted/30 border border-border text-xs font-bold focus:outline-none focus:border-primary w-28"
                />
                <button type="button" onClick={addTag}
                  className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                  <Tag className="h-3 w-3 text-primary-foreground" />
                </button>
              </div>
            </div>
          </div>

          {/* Excerpt */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Excerpt (for listing page &amp; SEO)</p>
            <Textarea
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              placeholder="Short description of this post..."
              className="rounded-xl bg-muted/20 border-border resize-none min-h-[80px] text-sm"
              maxLength={200}
            />
            <p className="text-[10px] text-muted-foreground text-right">{form.excerpt.length}/200</p>
          </div>

          {/* Toolbar + Editor / Preview */}
          <div className="space-y-2 flex-1">
            {!previewMode && (
              <div className="flex items-center gap-1 p-2 bg-muted/30 rounded-xl border border-border flex-wrap">
                {TOOLBAR.map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={btn.action}
                    title={btn.label}
                    className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <btn.icon className="h-3.5 w-3.5" />
                  </button>
                ))}
                <div className="ml-auto text-[10px] text-muted-foreground font-bold">
                  {wordCount} words · ~{readTime} min read
                </div>
              </div>
            )}

            {previewMode ? (
              <div className="min-h-[400px] p-6 rounded-2xl border border-border bg-card">
                <div className="prose prose-neutral dark:prose-invert max-w-none
                  prose-headings:font-black prose-headings:tracking-tight
                  prose-p:text-muted-foreground prose-p:leading-relaxed
                  prose-a:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:rounded
                  prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-2xl
                  prose-blockquote:border-l-primary prose-img:rounded-2xl prose-hr:border-border">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {form.content || "*Start writing to see a preview...*"}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Write your article in Markdown...

# Heading 1
## Heading 2

**Bold text** and *italic text*

- Bullet list item
- Another item

> Blockquote

`inline code`

```
code block
```

[Link text](https://url)"
                className="w-full min-h-[500px] p-4 rounded-2xl border border-border bg-muted/10 text-sm font-mono leading-relaxed resize-none focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30"
              />
            )}
          </div>
        </div>

        {/* ── Right sidebar: SEO settings ── */}
        <aside className="hidden xl:flex flex-col w-72 border-l border-border bg-card/50 p-6 space-y-6 sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">SEO Settings</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Meta Title</label>
                <Input
                  value={form.metaTitle}
                  onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
                  placeholder={form.title || "SEO title..."}
                  className="h-10 rounded-xl bg-muted/30 border-border text-sm"
                />
                <p className="text-[10px] text-muted-foreground">{form.metaTitle.length}/60 chars</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Meta Description</label>
                <Textarea
                  value={form.metaDescription}
                  onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                  placeholder={form.excerpt || "SEO description..."}
                  className="rounded-xl bg-muted/30 border-border resize-none min-h-[80px] text-sm"
                />
                <p className="text-[10px] text-muted-foreground">{form.metaDescription.length}/160 chars</p>
              </div>
            </div>
          </div>

          {/* SEO Preview */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Google Preview</p>
            <div className="p-3 rounded-xl border border-border bg-background space-y-1">
              <p className="text-xs text-muted-foreground/50 font-mono">citypulse.com/blog/{form.slug || "post-slug"}</p>
              <p className="text-sm text-blue-500 font-bold line-clamp-1">{form.metaTitle || form.title || "Post Title"}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{form.metaDescription || form.excerpt || "Post description will appear here..."}</p>
            </div>
          </div>

          {/* Visibility summary */}
          <div className="rounded-xl bg-muted/20 border border-border p-4 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Visibility</p>
            <div className="flex items-center gap-2 text-sm">
              {form.isPublic ? <Globe className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
              <span className="font-bold">{form.isPublic ? "Public" : "Private"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className={cn("h-2 w-2 rounded-full", form.status === "published" ? "bg-emerald-500" : "bg-amber-500")} />
              <span className="font-bold capitalize">{form.status}</span>
            </div>
            {form.isPublic && form.status === "published" ? (
              <p className="text-[10px] text-emerald-500 font-bold">Visible to all visitors</p>
            ) : (
              <p className="text-[10px] text-muted-foreground">Only visible to admins</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CreateBlogPostPage;
