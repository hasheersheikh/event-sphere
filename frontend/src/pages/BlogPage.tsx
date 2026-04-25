import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Clock, Tag, ArrowRight, BookOpen } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import PublicPageHeader from "@/components/layout/PublicPageHeader";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  author: string;
  tags: string[];
  views: number;
  createdAt: string;
}

const BlogPage = () => {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");

  const { data: posts, isLoading } = useQuery({
    queryKey: ["blogs", search, activeTag],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (activeTag) params.set("tag", activeTag);
      const { data } = await api.get(`/blogs?${params}`);
      return data as BlogPost[];
    },
  });

  const allTags = [...new Set(posts?.flatMap((p) => p.tags) || [])];

  // Featured post is the first one if we're not searching
  const featuredPost =
    !search && !activeTag && posts && posts.length > 0 ? posts[0] : null;
  const regularPosts = featuredPost ? posts?.slice(1) : posts;

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/30 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 mesh-bg opacity-30 z-0" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <Navbar />
      <main className="flex-1 relative z-10">
        <section className="container pt-16 pb-8 md:pt-20 md:pb-12">
          <PublicPageHeader
            pillText="Perspectives & Insights"
            title={
              <>
                Pulse <span className="text-primary italic">Stories.</span>
              </>
            }
            subtitle="Deep dives into the culture, technology, and moments that define the City Pulse Collective."
            themeColor="primary"
            size="md"
            className="mb-16"
          />

          {/* Featured Post */}
          {featuredPost && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <Link to={`/blog/${featuredPost.slug}`} className="group block">
                <div className="relative h-[500px] md:h-[600px] rounded-[2.5rem] overflow-hidden bg-muted shadow-2xl transition-all duration-500 group-hover:shadow-primary/10">
                  <img
                    src={
                      featuredPost.coverImage ||
                      "https://images.unsplash.com/photo-1514525253361-bee8718a300a?w=1200&q=80"
                    }
                    alt={featuredPost.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {featuredPost.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-4 group-hover:text-primary transition-colors duration-300">
                        {featuredPost.title}
                      </h2>
                      <p className="text-white/70 text-base md:text-lg mb-6 line-clamp-2 max-w-2xl font-medium italic">
                        "{featuredPost.excerpt}"
                      </p>
                      <div className="flex items-center gap-6 text-[11px] text-white/50 font-black uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(featuredPost.createdAt).toLocaleDateString(
                            "en-IN",
                            { month: "long", day: "numeric" },
                          )}
                        </span>
                        <span className="flex items-center gap-1 group-hover:gap-2 transition-all text-primary">
                          Featured Story <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Controls: Search & Tags */}
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-12">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search perspectives..."
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-card border border-border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTag("")}
                className={cn(
                  "px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
                  !activeTag
                    ? "bg-foreground text-background border-foreground shadow-lg shadow-black/10 scale-105"
                    : "bg-background border-border text-muted-foreground hover:border-primary hover:text-primary",
                )}
              >
                Refine All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? "" : tag)}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
                    activeTag === tag
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                      : "bg-background border-border text-muted-foreground hover:border-primary hover:text-primary",
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-64 w-full rounded-[2rem]" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
            </div>
          ) : !regularPosts?.length ? (
            <div className="py-32 text-center rounded-[3rem] border-2 border-dashed border-border/50 bg-muted/30">
              <div className="relative inline-block mb-6">
                <BookOpen className="h-16 w-16 text-muted-foreground/20" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary/40 blur-sm"
                />
              </div>
              <h3 className="text-xl font-black mb-2">No stories found</h3>
              <p className="text-muted-foreground max-w-xs mx-auto text-sm font-medium">
                Maybe try a different keyword or category? We're adding new
                perspectives every week.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {regularPosts.map((post, i) => (
                <motion.article
                  key={post._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group block h-full"
                  >
                    <div className="glass-card hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 flex flex-col h-full overflow-hidden group">
                      {/* Image Container */}
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={
                            post.coverImage ||
                            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80"
                          }
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Date Float */}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-black shadow-xl">
                          {new Date(post.createdAt).toLocaleDateString(
                            "en-IN",
                            { month: "short", day: "numeric" },
                          )}
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-7 flex-1 flex flex-col">
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] font-black uppercase tracking-[0.15em] text-primary/70"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-xl font-black leading-[1.2] mb-4 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-6 font-medium leading-relaxed italic opacity-80">
                          {post.excerpt}
                        </p>
                        <div className="mt-auto pt-5 border-t border-border/50 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              {post.author[0]}
                            </span>
                            {post.author}
                          </span>
                          <span className="flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-widest group-hover:gap-3 transition-all">
                            Read Story <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
