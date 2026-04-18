import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  motion,
  useReducedMotion,
  useInView,
  type TargetAndTransition,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Music,
  Camera,
  Cpu,
  Search,
  MapPin,
  Stars,
  CalendarDays,
  Users,
  Globe,
  Zap,
  TrendingUp,
} from "lucide-react";
import EventCard from "@/components/events/EventCard";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Event } from "@/types/event";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import GoLocalSection from "@/components/home/GoLocalSection";
import PublicPageHeader from "@/components/layout/PublicPageHeader";
import { useCity } from "@/contexts/CityContext";

/* ─── animation variants ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.65, ease: [0.16, 1, 0.3, 1] },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { delay, duration: 0.5 },
});

/* ─── word-split animation ─── */
const WordReveal = ({
  text,
  className,
  baseDelay = 0,
  blur = true,
}: {
  text: string;
  className?: string;
  baseDelay?: number;
  blur?: boolean;
}) => {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.25em]"
          initial={{ opacity: 0, y: 24, filter: blur ? "blur(6px)" : "none" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            delay: baseDelay + i * 0.1,
            duration: 0.65,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

/* ─── animated gradient blob ─── */
const Blob = ({
  className,
  animate: anim,
  delay = 0,
  duration = 12,
}: {
  className: string;
  animate: TargetAndTransition;
  delay?: number;
  duration?: number;
}) => {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      animate={shouldReduce ? undefined : anim}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
};

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const featuredRef = useRef<HTMLDivElement>(null);
  const isFeaturedInView = useInView(featuredRef, {
    once: true,
    margin: "-80px",
  });
  const { selectedCity } = useCity();

  const { data: upcomingEvents, isLoading } = useQuery({
    queryKey: ["upcomingEvents", selectedCity],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "8", sort: "-isSponsored,-createdAt" });
      if (selectedCity) params.set("city", selectedCity);
      const { data } = await api.get(`/events?${params.toString()}`);
      return data;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append("q", searchQuery);
    if (locationQuery.trim()) params.append("location", locationQuery);
    if (params.toString()) navigate(`/events?${params.toString()}`);
  };

  const stats = [
    { icon: CalendarDays, label: "Events", value: "10K+" },
    { icon: Users, label: "Attendees", value: "500K+" },
    { icon: Globe, label: "Cities", value: "200+" },
  ];

  const categories = [
    {
      label: "Music",
      icon: Music,
      gradient: "from-blue-500/15 to-indigo-500/15",
      border: "border-blue-500/20",
      text: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Arts",
      icon: Camera,
      gradient: "from-orange-500/15 to-rose-500/15",
      border: "border-orange-500/20",
      text: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Technology",
      icon: Cpu,
      gradient: "from-violet-500/15 to-purple-500/15",
      border: "border-violet-500/20",
      text: "text-violet-600 dark:text-violet-400",
    },
    {
      label: "Meetups",
      icon: Sparkles,
      gradient: "from-emerald-500/15 to-teal-500/15",
      border: "border-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Sports",
      icon: Zap,
      gradient: "from-red-500/15 to-orange-500/15",
      border: "border-red-500/20",
      text: "text-red-600 dark:text-red-400",
    },
    {
      label: "Business",
      icon: TrendingUp,
      gradient: "from-pink-500/15 to-rose-500/15",
      border: "border-pink-500/20",
      text: "text-pink-600 dark:text-pink-400",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        {/* ════════════════════════════════════════════
            TOP HALF — hero search (no background photo)
        ════════════════════════════════════════════ */}
        <section
          className="relative flex items-center justify-center overflow-hidden"
          style={{ height: "52vh", minHeight: 380 }}
        >
          {/* ── gradient blob background ── */}
          <div className="absolute inset-0 bg-background" />

          {/* blob 1 — emerald top-left */}
          <Blob
            className="w-[520px] h-[520px] -top-40 -left-32 bg-emerald-400/20 dark:bg-emerald-500/12 blur-[130px]"
            animate={{ x: [0, 40, 0], y: [0, 28, 0], scale: [1, 1.08, 1] }}
            duration={14}
          />
          {/* blob 2 — violet bottom-right */}
          <Blob
            className="w-[440px] h-[440px] -bottom-32 -right-24 bg-violet-400/20 dark:bg-violet-500/12 blur-[120px]"
            animate={{ x: [0, -32, 0], y: [0, -22, 0], scale: [1, 1.12, 1] }}
            duration={18}
            delay={3}
          />
          {/* blob 3 — amber center */}
          <Blob
            className="w-[300px] h-[300px] top-1/3 left-1/2 -translate-x-1/2 bg-amber-400/12 dark:bg-amber-500/8 blur-[100px]"
            animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
            duration={10}
            delay={1.5}
          />

          {/* subtle dot-grid texture */}
          <div
            className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle, currentColor 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* ── hero content ── */}
          <div className="relative z-10 w-full max-w-2xl mx-auto px-6 text-center">
            <PublicPageHeader
              pillText="EventSphere"
              title={
                <>
                  <WordReveal text="Find Your" baseDelay={0.1} />
                  <br />
                  <motion.span
                    className="text-gradient italic font-light inline-block whitespace-nowrap"
                    initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{
                      delay: 0.32,
                      duration: 0.7,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    Next Event.
                  </motion.span>
                </>
              }
            >
              {/* search */}
              <motion.form onSubmit={handleSearch} {...fadeUp(0.2)}>
                <div className="flex flex-col sm:flex-row items-stretch gap-1.5 p-1.5 bg-background/80 dark:bg-background/60 backdrop-blur-xl border border-border/50 dark:border-border/30 rounded-xl shadow-lg shadow-black/5 hover:border-primary/30 focus-within:border-primary/50 focus-within:shadow-primary/8 transition-all duration-400">
                  <div className="relative flex-1 group/s">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within/s:text-primary transition-colors" />
                    <Input
                      type="text"
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-11 pl-10 bg-transparent border-none focus-visible:ring-0 text-sm"
                    />
                  </div>
                  <div className="hidden sm:block w-px self-stretch my-2 bg-border/20" />
                  <div className="relative flex-1 group/l">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within/l:text-primary transition-colors" />
                    <Input
                      type="text"
                      placeholder="Location..."
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      className="h-11 pl-10 bg-transparent border-none focus-visible:ring-0 text-sm"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="h-11 px-7 rounded-lg font-bold uppercase tracking-widest text-xs bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                  >
                    Search
                  </Button>
                </div>
              </motion.form>
            </PublicPageHeader>

            {/* stats row */}
            <motion.div
              {...fadeUp(0.6)}
              className="flex items-center justify-center gap-6 mt-5"
            >
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-muted-foreground"
                >
                  <s.icon className="h-3.5 w-3.5 text-primary/60" />
                  <span className="text-xs font-bold text-foreground">
                    {s.value}
                  </span>
                  <span className="text-[11px]">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* bottom fade */}
          <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
        </section>

        {/* ════════════════════════════════════════════
            BOTTOM HALF — events strip
        ════════════════════════════════════════════ */}
        <motion.section
          className="border-t border-border/10 bg-background overflow-hidden flex flex-col"
          style={{ height: "48vh", minHeight: 300 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          {/* strip header */}
          <div className="px-6 md:px-10 py-3 border-b border-border/10 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur-sm">
            <motion.h2
              className="text-xs font-black uppercase tracking-[0.35em] flex items-center gap-2"
              {...fadeIn(0.8)}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Upcoming Events
            </motion.h2>
            <motion.div {...fadeIn(0.85)}>
              <Link
                to="/events"
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/70 flex items-center gap-1 transition-colors group"
              >
                View All
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </div>

          {/* horizontal scroll rail */}
          <div className="relative flex-1 overflow-hidden">
            <div className="h-full overflow-x-auto overflow-y-hidden px-6 md:px-10 py-4 scrollbar-hide">
              <div
                className="flex gap-3.5 h-full"
                style={{ width: "max-content" }}
              >
                {isLoading ? (
                  Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <motion.div
                        key={i}
                        className="h-full w-64 rounded-xl shrink-0 overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.12,
                        }}
                      >
                        <div className="w-full h-full bg-muted/60 dark:bg-muted/40" />
                      </motion.div>
                    ))
                ) : upcomingEvents?.length > 0 ? (
                  upcomingEvents.map((event: Event, i: number) => (
                    <motion.div
                      key={event._id}
                      className="w-64 shrink-0 h-full"
                      initial={{ opacity: 0, x: 32 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.85 + i * 0.07,
                        duration: 0.5,
                        ease: [0.23, 1, 0.32, 1],
                      }}
                    >
                      <EventCard event={event} index={i} imageRatio="4/3" />
                    </motion.div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full w-full min-w-[600px]">
                    <div className="flex flex-col items-center gap-3 border border-dashed border-border rounded-xl px-16 py-8">
                      <CalendarDays className="h-8 w-8 text-muted-foreground/25" />
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground">
                        No events yet. Check back soon.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* fade masks */}
            <div className="absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-background to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-background to-transparent pointer-events-none" />
          </div>
        </motion.section>

        {/* ════════════════════════════════════════════
            CATEGORIES
        ════════════════════════════════════════════ */}
        <section className="py-12 border-t border-border/10">
          <div className="container">
            <div className="flex items-end justify-between mb-8">
              <div>
                <motion.p
                  className="text-[10px] font-black uppercase tracking-[0.45em] text-primary mb-1.5"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  Browse by type
                </motion.p>
                <motion.h2
                  className="text-2xl md:text-3xl font-black tracking-tight"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  What are you looking for?
                </motion.h2>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Link
                  to="/events"
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors group"
                >
                  All categories
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {categories.map((cat, i) => (
                <Link
                  key={i}
                  to={`/events?category=${encodeURIComponent(cat.label)}`}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    transition={{
                      delay: i * 0.06,
                      duration: 0.45,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`group flex flex-col items-center gap-2.5 py-5 px-4 rounded-xl bg-gradient-to-br ${cat.gradient} border ${cat.border} cursor-pointer transition-all duration-300 hover:shadow-md`}
                  >
                    <div
                      className={`p-2.5 rounded-lg bg-white/60 dark:bg-white/8 ${cat.text}`}
                    >
                      <cat.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-foreground/80 group-hover:text-foreground transition-colors">
                      {cat.label}
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            FEATURED EVENTS — magazine grid
        ════════════════════════════════════════════ */}
        <section
          className="pb-8 pt-8 border-t border-border/10 relative overflow-hidden"
          ref={featuredRef}
        >
          {/* ambient glow */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[400px] bg-primary/4 blur-[120px] pointer-events-none rounded-full" />

          <div className="container relative z-10">
            <div className="flex items-end justify-between mb-10">
              <div>
                <motion.p
                  className="text-[10px] font-black uppercase tracking-[0.45em] text-primary mb-1.5"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  Don't miss out
                </motion.p>
                <motion.h2
                  className="text-2xl md:text-3xl font-black tracking-tight"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  Featured Events
                </motion.h2>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Link
                  to="/events"
                  className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                >
                  View All
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="h-80 rounded-xl bg-muted animate-pulse"
                    />
                  ))}
              </div>
            ) : upcomingEvents?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {upcomingEvents.slice(0, 3).map((event: Event, i: number) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isFeaturedInView ? { opacity: 1, y: 0 } : {}}
                    transition={{
                      delay: 0.1 + i * 0.1,
                      duration: 0.6,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <EventCard event={event} index={i} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center border border-dashed border-border rounded-xl bg-muted/10 flex flex-col items-center gap-4">
                <Sparkles className="h-8 w-8 text-primary/25 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground">
                  No featured events yet.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Go Local Section */}
        <GoLocalSection />

        {/* ════════════════════════════════════════════
            CTA BANNER
        ════════════════════════════════════════════ */}
        <section className="py-8 container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-[3rem] border border-border/20 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-10 md:p-20 shadow-2xl flex flex-col items-center text-center"
          >
            {/* background blobs */}
            <Blob
              className="w-96 h-96 -top-32 -left-32 bg-primary/20 dark:bg-primary/10 blur-[100px]"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              duration={10}
            />
            <Blob
              className="w-80 h-80 -bottom-32 -right-32 bg-accent/20 dark:bg-accent/10 blur-[90px]"
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
              duration={12}
              delay={2}
            />

            <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="flex items-center justify-center gap-3 mb-6"
              >
                <div className="h-px w-8 bg-primary/40 rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary flex items-center gap-2">
                  <Stars className="h-3.5 w-3.5" />
                  For Organizers
                </span>
                <div className="h-px w-8 bg-primary/40 rounded-full" />
              </motion.div>

              <motion.h2
                className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-6"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.2,
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                Ready to host your <br />
                <span className="text-primary italic">next event?</span>
              </motion.h2>

              <motion.p
                className="text-muted-foreground text-sm md:text-base leading-relaxed mb-10 max-w-lg font-medium italic"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Join thousands of organizers on EventSphere — sell tickets,
                manage attendees, and scale your audience efficiently.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Link to="/auth">
                  <button className="h-12 px-8 rounded-xl bg-foreground text-background font-black uppercase tracking-widest text-[10px] hover:bg-primary transition-all active:scale-95 flex items-center justify-center gap-2 group/btn shadow-button w-full sm:w-auto">
                    Create Account
                    <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link to="/events">
                  <button className="h-12 px-8 rounded-xl bg-transparent border-2 border-border/50 text-foreground font-black uppercase tracking-widest text-[10px] hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-95 w-full sm:w-auto">
                    Browse Events
                  </button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Index;
