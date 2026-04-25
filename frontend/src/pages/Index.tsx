import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Search,
  MapPin,
  CalendarDays,
  Users,
  Globe,
  Music,
  Camera,
  Cpu,
  Sparkles,
  Zap,
  TrendingUp,
  Play,
} from "lucide-react";
import EventCard from "@/components/events/EventCard";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Event } from "@/types/event";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import GoLocalSection from "@/components/home/GoLocalSection";
import { useCity } from "@/contexts/CityContext";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
});

const CATEGORIES = [
  { label: "Music", icon: Music, href: "/events?category=Music" },
  { label: "Arts", icon: Camera, href: "/events?category=Arts" },
  { label: "Technology", icon: Cpu, href: "/events?category=Technology" },
  { label: "Meetups", icon: Sparkles, href: "/events?category=Meetups" },
  { label: "Sports", icon: Zap, href: "/events?category=Sports" },
  { label: "Business", icon: TrendingUp, href: "/events?category=Business" },
];

/* ── Extract YouTube ID from a URL ── */
const getYouTubeId = (url: string) => {
  if (!url) return null;
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([a-zA-Z0-9_-]{11}).*/;
  const match = url.match(regExp);
  return match ? match[2] : null;
};

/*
 * Placeholder reel — replace PLACEHOLDER_VIDEO_ID with your own YouTube video ID.
 * Any event with a videoUrl set in the admin will automatically override this.
 */
const PLACEHOLDER_VIDEO_ID = "PLACEHOLDER_VIDEO_ID";

/* ── Right-panel background video (YouTube iframe cover technique) ── */
const HeroVideoPanel = ({ videoId }: { videoId: string | null }) => {
  const id = videoId || PLACEHOLDER_VIDEO_ID;
  const isPlaceholder = !videoId;

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {isPlaceholder ? (
        /* ── Placeholder UI (shown until a real video is configured) ── */
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[#0a0a0a]">
          {/* animated ambient ring */}
          <motion.div
            className="absolute w-64 h-64 rounded-full border border-white/8"
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-40 h-40 rounded-full border border-white/12"
            animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          />
          {/* play button */}
          <div className="relative z-10 h-16 w-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
            <Play className="h-6 w-6 text-white fill-white ml-1" />
          </div>
          <div className="relative z-10 text-center px-8">
            <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.4em]">
              Event Reel
            </p>
            <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest mt-1">
              Set a video URL on any event to display here
            </p>
          </div>
          {/* subtle scan-line texture */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, white 2px, white 3px)",
              backgroundSize: "100% 3px",
            }}
          />
        </div>
      ) : (
        /* ── YouTube embed (cover-fills the container) ── */
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1`}
          allow="autoplay; encrypted-media"
          title="Event reel"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            /* cover 16:9 video in any container shape */
            width: "max(100%, calc(100vh * 16/9))",
            height: "max(100%, calc(100vw * 9/16))",
            border: 0,
            pointerEvents: "none",
          }}
        />
      )}

      {/* overlay gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
      {/* desktop: left-edge fade to blend into text panel */}
      <div className="hidden lg:block absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const { selectedCity } = useCity();
  const shouldReduce = useReducedMotion();

  const { data: upcomingEvents, isLoading } = useQuery({
    queryKey: ["upcomingEvents", selectedCity],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "12", sort: "-isSponsored,-createdAt" });
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
    navigate(`/events${params.toString() ? `?${params.toString()}` : ""}`);
  };

  /* Use the first event that has a video URL */
  const heroVideoId = upcomingEvents
    ?.map((e: Event) => getYouTubeId(e.videoUrl || ""))
    .find(Boolean) || null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      <Navbar />

      <main className="flex-1">

        {/* ═══════════════════════════════════════════════════════
            HERO  —  split: left text + right video
            • Capped at 100dvh (never overflows viewport)
            • Mobile: video on top, text below
            • Desktop: text left, video right (50/50)
        ═══════════════════════════════════════════════════════ */}
        <section
          className="flex flex-col lg:grid lg:grid-cols-2 mt-14 md:mt-16 h-[calc(100dvh-3.5rem)] md:h-[calc(100dvh-4rem)]"
        >

          {/* ── VIDEO PANEL (top on mobile, right on desktop) ── */}
          <div className="relative order-1 lg:order-2 h-[45vh] lg:h-full overflow-hidden">
            <HeroVideoPanel videoId={heroVideoId} />
          </div>

          {/* ── TEXT PANEL (bottom on mobile, left on desktop) ── */}
          <div className="order-2 lg:order-1 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-8 lg:py-0 overflow-y-auto">

            <motion.p
              className="text-[10px] font-black uppercase tracking-[0.55em] text-muted-foreground mb-5"
              {...fadeUp(0)}
            >
              EventSphere
            </motion.p>

            {/* Tagline — Foggy display font */}
            <motion.h1
              className="font-display font-black leading-[0.88] tracking-tighter text-[clamp(2.8rem,7vw,6.5rem)] mb-5"
              {...fadeUp(0.04)}
            >
              Catch<br />
              Your<br />
              Pulse.
            </motion.h1>

            <motion.p
              className="text-muted-foreground text-sm md:text-base leading-relaxed mb-7 max-w-sm"
              {...fadeUp(0.1)}
            >
              Live shows, local gems, and everything worth showing up for — curated for your city.
            </motion.p>

            {/* Search bar */}
            <motion.form onSubmit={handleSearch} {...fadeUp(0.14)} className="mb-7">
              <div className="flex flex-col sm:flex-row items-stretch gap-2 p-2 bg-card border border-border/50 rounded-2xl shadow-lg max-w-lg">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    type="text"
                    placeholder="Search events…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 pl-10 bg-transparent border-none focus-visible:ring-0 text-sm"
                  />
                </div>
                <div className="hidden sm:block w-px self-stretch my-2 bg-border/40" />
                <div className="relative sm:w-40">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    type="text"
                    placeholder="Location…"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="h-11 pl-10 bg-transparent border-none focus-visible:ring-0 text-sm"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-11 px-5 rounded-xl font-black uppercase tracking-widest text-[10px] bg-foreground text-background hover:bg-foreground/90 shrink-0"
                >
                  Search
                </Button>
              </div>
            </motion.form>

            {/* CTAs */}
            <motion.div className="flex items-center gap-4 mb-8" {...fadeUp(0.18)}>
              <Link to="/events">
                <Button className="h-11 px-6 rounded-xl bg-foreground text-background font-black uppercase tracking-widest text-[10px] hover:bg-foreground/90">
                  Browse Events <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
              <Link
                to="/local-stores"
                className="text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                Local Stores →
              </Link>
            </motion.div>

            {/* Stats — hidden on very small screens so text panel doesn't overflow */}
            <motion.div
              {...fadeUp(0.22)}
              className="hidden sm:flex items-center gap-6 pt-6 border-t border-border/20"
            >
              {[
                { icon: CalendarDays, value: "10K+", label: "Events" },
                { icon: Users, value: "500K+", label: "Attendees" },
                { icon: Globe, value: "200+", label: "Cities" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <s.icon className="h-3.5 w-3.5 text-muted-foreground/40" />
                  <span className="text-sm font-black">{s.value}</span>
                  <span className="text-[11px] text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══ CATEGORY PILLS ═══ */}
        <section className="border-t border-border/20 py-5">
          <div className="container">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              {CATEGORIES.map((cat, i) => (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.35 }}
                  className="shrink-0"
                >
                  <Link
                    to={cat.href}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border/50 bg-card hover:border-foreground/40 hover:bg-foreground/5 hover:text-foreground transition-all duration-200 text-[11px] font-bold uppercase tracking-widest text-foreground/50 whitespace-nowrap"
                  >
                    <cat.icon className="h-3.5 w-3.5" />
                    {cat.label}
                  </Link>
                </motion.div>
              ))}
              <div className="shrink-0 ml-1">
                <Link
                  to="/events"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-foreground/25 bg-foreground/5 text-foreground text-[11px] font-bold uppercase tracking-widest whitespace-nowrap hover:bg-foreground/10 transition-all"
                >
                  All Events <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ UPCOMING EVENTS STRIP ═══ */}
        <section className="border-t border-border/20 py-8">
          <div className="container mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em]">Upcoming</h2>
            </div>
            <Link
              to="/events"
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors group"
            >
              View All <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide px-4 md:px-8 pb-2">
              <div className="flex gap-4" style={{ width: "max-content" }}>
                {isLoading
                  ? Array(6).fill(0).map((_, i) => (
                      <div key={i} className="w-48 shrink-0">
                        <div className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
                        <div className="mt-3 space-y-2">
                          <div className="h-2 w-20 rounded bg-muted animate-pulse" />
                          <div className="h-3.5 w-36 rounded bg-muted animate-pulse" />
                          <div className="h-2 w-28 rounded bg-muted animate-pulse" />
                        </div>
                      </div>
                    ))
                  : upcomingEvents?.length > 0
                  ? upcomingEvents.map((event: Event, i: number) => (
                      <motion.div
                        key={event._id}
                        className="w-48 shrink-0"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + i * 0.04, duration: 0.4 }}
                      >
                        <EventCard event={event} index={i} imageRatio="3/4" />
                      </motion.div>
                    ))
                  : (
                    <div className="flex items-center justify-center min-w-[480px] py-16">
                      <div className="text-center space-y-3 border border-dashed border-border rounded-xl px-12 py-8">
                        <CalendarDays className="h-8 w-8 text-muted-foreground/25 mx-auto" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                          No events yet
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </div>
            <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-background to-transparent pointer-events-none" />
          </div>
        </section>

        {/* ═══ FEATURED EVENTS GRID ═══ */}
        {upcomingEvents?.length > 4 && (
          <section className="border-t border-border/20 py-12">
            <div className="container">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-2">
                    Don't miss
                  </p>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tighter">
                    Featured Events
                  </h2>
                </div>
                <Link
                  to="/events"
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors group"
                >
                  See All <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {upcomingEvents.slice(0, 8).map((event: Event, i: number) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                  >
                    <EventCard event={event} index={i} />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══ GO LOCAL ═══ */}
        <GoLocalSection />

        {/* ═══ ORGANIZER CTA ═══ */}
        <section className="py-12 border-t border-border/20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-2xl border border-border/40 bg-card p-10 md:p-16 text-center"
            >
              {!shouldReduce && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-foreground/5 blur-[80px] pointer-events-none rounded-full" />
              )}
              <div className="relative z-10 max-w-xl mx-auto">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground mb-4">
                  For Organizers
                </p>
                <h2 className="font-display text-4xl md:text-6xl font-black tracking-tighter leading-[0.88] mb-4">
                  Host your<br />next event.
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                  Sell tickets, manage attendees, and grow your audience on EventSphere.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/auth">
                    <Button className="h-12 px-8 rounded-xl bg-foreground text-background font-black uppercase tracking-widest text-[10px] hover:bg-foreground/90 w-full sm:w-auto">
                      Create Account <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                  <Link to="/events">
                    <Button variant="outline" className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] w-full sm:w-auto">
                      Browse Events
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Index;
