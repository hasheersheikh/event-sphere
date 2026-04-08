import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, useScroll, useSpring } from "framer-motion";
import { Clock, Eye, Tag, ArrowLeft, BookOpen, Share2, Twitter, Linkedin, Link as LinkIcon, ChevronRight, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [copied, setCopied] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data } = await api.get(`/blogs/${slug}`);
      return data;
    },
    enabled: Boolean(slug),
  });

  // Fetch related posts based on tags
  const { data: relatedPosts } = useQuery({
    queryKey: ["related-blogs", post?.tags],
    queryFn: async () => {
      const { data } = await api.get(`/blogs?tag=${post.tags[0]}`);
      return (data as any[]).filter(p => p._id !== post._id).slice(0, 3);
    },
    enabled: !!post?.tags?.length,
  });

  // Update document title for SEO
  useEffect(() => {
    if (post) {
      document.title = post.metaTitle || post.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", post.metaDescription || post.excerpt);
    }
    return () => { document.title = "City Pulse"; };
  }, [post]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="h-1 bg-muted w-full" />
      <main className="flex-1 container max-w-4xl py-24 space-y-8">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-16 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
        <div className="space-y-4">
          {Array(10).fill(0).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
      </main>
      <Footer />
    </div>
  );

  if (isError || !post) return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container max-w-3xl py-32 text-center">
        <div className="relative inline-block mb-8">
          <BookOpen className="h-20 w-20 text-muted-foreground/10 mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl">404</span>
          </div>
        </div>
        <h1 className="text-3xl font-black mb-4 tracking-tighter">Perspective Lost</h1>
        <p className="text-muted-foreground mb-10 max-w-xs mx-auto font-medium">
          We couldn't find the story you're looking for. It might have been archived or moved.
        </p>
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-white font-black text-sm hover:shadow-xl hover:shadow-primary/20 transition-all hover:-translate-y-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Discovery Hub
        </Link>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/30">
      <Navbar />
      
      {/* Reading Progress Indicator */}
      <motion.div
        className="fixed top-[64px] left-0 right-0 h-1 bg-primary z-50 origin-[0%]"
        style={{ scaleX }}
      />

      <main className="flex-1">
        {/* Cinematic Hero */}
        <section className="relative h-[60vh] md:h-[75vh] min-h-[500px] w-full overflow-hidden bg-black">
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img 
              src={post.coverImage || "https://images.unsplash.com/photo-1514525253361-bee8718a300a?w=1600&q=80"} 
              alt={post.title} 
              className="w-full h-full object-cover" 
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute inset-0 flex flex-col justify-end">
            <div className="container pb-16 md:pb-24">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="max-w-4xl"
              >
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags?.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest">
                      {tag}
                    </span>
                  ))}
                </div>
                <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-8 drop-shadow-sm">
                  {post.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-white/70">
                  <div className="flex items-center gap-3 text-white">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                      {post.author[0]}
                    </div>
                    <div>
                      <p className="font-bold">{post.author}</p>
                      <p className="text-[9px] opacity-60">Architect of Story</p>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-white/20 hidden md:block" />
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      {new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-2 opacity-60">
                      <Eye className="h-3.5 w-3.5" />
                      {post.views} views
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="container py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-16 items-start">
            {/* Article Content */}
            <article className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="prose prose-neutral dark:prose-invert max-w-none
                  prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-foreground
                  prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
                  prose-p:text-lg prose-p:leading-relaxed prose-p:text-muted-foreground/90 prose-p:mb-8 font-medium
                  prose-a:text-primary prose-a:font-black prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground prose-strong:font-extrabold
                  prose-blockquote:border-l-4 prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-xl
                  prose-code:text-primary prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded-lg prose-code:text-sm prose-code:before:content-[''] prose-code:after:content-['']
                  prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-[2rem] prose-pre:p-8
                  prose-img:rounded-[2.5rem] prose-img:shadow-2xl prose-img:my-16
                  prose-li:text-muted-foreground prose-li:font-medium
                  prose-hr:border-border/50 prose-hr:my-16"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {post.content}
                </ReactMarkdown>
              </motion.div>

              {/* Author Bio/Footer */}
              <div className="mt-24 p-10 rounded-[3rem] bg-muted/40 border border-border/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-32 w-32" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent p-1 shadow-xl">
                    <div className="h-full w-full rounded-full bg-background flex items-center justify-center text-2xl font-black">
                      {post.author[0]}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-black mb-2">Written by {post.author}</h4>
                    <p className="text-muted-foreground font-medium mb-4 italic">
                      "Passionate about the intersection of technology, community, and the stories that bind them together."
                    </p>
                    <div className="flex justify-center md:justify-start gap-4">
                      <Link to="/blog" className="text-[10px] font-black uppercase tracking-widest text-primary hover:gap-2 transition-all flex items-center gap-1.5">
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to blog
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Sticky Sidebar */}
            <aside className="sticky top-32 hidden lg:flex flex-col gap-10">
              {/* Share */}
              <div>
                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6">Share Story</h5>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${post.title}&url=${window.location.href}`)}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-all">
                      <Twitter className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Twitter</span>
                  </button>
                  <button 
                     onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`)}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Linkedin className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">LinkedIn</span>
                  </button>
                  <button 
                    onClick={copyLink}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl bg-card border border-border transition-all group",
                      copied ? "border-primary bg-primary/5" : "hover:border-primary/30"
                    )}
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
                      copied ? "bg-primary text-white" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                    )}>
                      {copied ? <Clock className="h-4 w-4 animate-pulse" /> : <LinkIcon className="h-4 w-4" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {copied ? "Copied!" : "Copy Link"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Metics */}
              <div className="p-6 rounded-3xl bg-muted/30 border border-border/50">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground/60">Views</span>
                    <span className="text-foreground">{post.views.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground/60">Min. Read</span>
                    <span className="text-foreground">{Math.ceil(post.content.split(' ').length / 200)} min</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <section className="bg-muted/30 border-t border-border/50 py-24">
            <div className="container">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-3xl font-black tracking-tighter">More to <span className="text-gradient">Explore</span></h3>
                <Link to="/blog" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group">
                  View All <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {relatedPosts.map((rp, i) => (
                  <motion.div
                    key={rp._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link to={`/blog/${rp.slug}`} className="group block h-full">
                      <div className="glass-card flex flex-col h-full overflow-hidden hover:border-primary transition-all">
                        <div className="h-48 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                          <img src={rp.coverImage} alt={rp.title} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                        </div>
                        <div className="p-6">
                          <h4 className="font-black text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">{rp.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 font-medium italic opacity-70">{rp.excerpt}</p>
                          <span className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                            Read story <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BlogPostPage;
