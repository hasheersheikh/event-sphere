import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Search,
  CalendarDays,
  Users,
  Globe,
  Store,
  MapPin,
  Ticket,
  Camera,
  Megaphone,
  Sparkles,
} from "lucide-react";
import EventCard from "@/components/events/EventCard";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Event } from "@/types/event";
import { useEffect, useState, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import GoLocalSection from "@/components/home/GoLocalSection";
import { useCity } from "@/contexts/CityContext";
import MarqueeCarousel from "@/components/events/MarqueeCarousel";
import MobileEventCarousel from "@/components/events/MobileEventCarousel";
import HeroGallery from "@/components/home/HeroGallery";
import { cn } from "@/lib/utils";
import TrendingVenues from "@/components/home/TrendingVenues";


const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
});

const DATE_FILTERS = [
  { id: "all", label: "All Events" },
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
] as const;

type DateFilterId = (typeof DATE_FILTERS)[number]["id"];

function filterByDate(events: Event[], filter: DateFilterId): Event[] {
  if (filter === "all") return events;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return events.filter((e) => {
    const eventDate = new Date(e.date);
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    if (filter === "today") return eventDay.getTime() === today.getTime();
    if (filter === "week") {
      const end = new Date(today); end.setDate(today.getDate() + 7);
      return eventDay >= today && eventDay <= end;
    }
    if (filter === "month") {
      const end = new Date(today); end.setDate(today.getDate() + 30);
      return eventDay >= today && eventDay <= end;
    }
    return true;
  });
}


const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilterId>("all");
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

  const filteredEvents = useMemo(() => {
    if (!upcomingEvents) return [];
    return filterByDate(upcomingEvents, dateFilter);
  }, [upcomingEvents, dateFilter]);



  const { data: heroAssets } = useQuery({
    queryKey: ["heroAssets"],
    queryFn: async () => {
      const { data } = await api.get("/hero-assets");
      return data;
    }
  });

  const FALLBACK_HERO_ASSETS = [
    {
      _id: "fb-1",
      type: "video" as const,
      url: "/hero/capped-1080p.mp4",
      isActive: true,
      targetDevice: "all" as const
    },
    {
      _id: "fb-2",
      type: "image" as const,
      url: "/hero/From KlickPin CF Bright kindness reminders with charm and useful ideas for creative people that feel calm and clear 🌿 - Pin-1065453224404265030.jpg",
      isActive: true,
      targetDevice: "all" as const
    },
    {
      _id: "fb-3",
      type: "image" as const,
      url: "/hero/From KlickPin CF Discover Stunning minimalist bedroom decor that make your next project look polished and expensive for ideas worth saving right now - Pin-921338036281486033.jpg",
      isActive: true,
      targetDevice: "all" as const
    },
    {
      _id: "fb-4",
      type: "image" as const,
      url: "/hero/From KlickPin CF Steal these elegant rainy day activity ideas you’ll want to recreate this weekend with aesthetic touches that photograph beautifully — save these - Pin-985936543440402367.jpg",
      isActive: true,
      targetDevice: "all" as const
    }
  ];

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const filteredHeroAssets = (heroAssets && heroAssets.length > 0)
    ? heroAssets.filter((a: any) => {
      if (!a.isActive) return false;
      if (a.targetDevice === 'all') return true;
      return isMobile ? a.targetDevice === 'mobile' : a.targetDevice === 'desktop';
    })
    : FALLBACK_HERO_ASSETS;

  const hasHeroAssets = filteredHeroAssets.length > 0;

  useEffect(() => {
    if (heroAssets) {
      console.log('Hero Assets received:', heroAssets);
      console.log('Final Hero Assets displayed (isMobile:', isMobile, '):', filteredHeroAssets);
    }
  }, [heroAssets, filteredHeroAssets, isMobile]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append("q", searchQuery);
    navigate(`/events${params.toString() ? `?${params.toString()}` : ""}`);
  };


  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      <main className="flex-1">

        {/* ═══════════════════════════════════════════════════════
            HERO SECTION
        ═══════════════════════════════════════════════════════ */}

        {/* ── MOBILE PROMOTIONAL BANNER ── */}
        <div className="lg:hidden mt-14 px-4 py-3 border-b border-border/20 bg-background">
          <div className="flex items-center gap-3">
            {/* Logo icon */}
            <div className="h-9 w-9 rounded-lg bg-neon-lime flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-black" />
            </div>

            {/* Search bar with tagline */}
            <button
              onClick={() => navigate("/events")}
              className="flex-1 flex items-center justify-between gap-3 px-4 py-2.5 bg-card rounded-full shadow-[inset_0_3px_6px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_3px_6px_rgba(255,255,255,0.15),inset_0_2px_4px_rgba(255,255,255,0.1),inset_0_1px_2px_rgba(255,255,255,0.08)]"
            >
              <span className="text-sm font-bold text-foreground">Catch the City Pulse</span>
              <div className="h-8 w-8 rounded-full bg-neon-lime flex items-center justify-center shrink-0 active:scale-95 transition-transform duration-100">
                <Search className="h-4 w-4 text-black" />
              </div>
            </button>
          </div>
        </div>

        {/* ── MOBILE HERO ── */}
        {hasHeroAssets && (
          <section className="lg:hidden relative bg-background px-4">
            <HeroGallery assets={filteredHeroAssets} />
          </section>
        )}

        {/* ── DESKTOP HERO ── */}
        <section className={cn(
          "flex flex-col lg:grid lg:grid-cols-12 md:mt-16 lg:min-h-[calc(100dvh-4rem)]",
          !hasHeroAssets && "lg:block pt-20"
        )}>
          {/* ── VIDEO BOX ── */}
          {hasHeroAssets && (
            <div className="hidden lg:flex lg:order-2 lg:col-span-5 items-center justify-center lg:pt-8 lg:pr-8 lg:pb-8">
              <div className="w-[97%] h-full">
                <HeroGallery assets={filteredHeroAssets} />
              </div>
            </div>
          )}

          {/* ── TEXT PANEL ── */}
          <div className={cn(
            "flex flex-col justify-center px-6 sm:px-12 lg:pl-24 lg:pr-0 py-12 lg:py-20 relative z-20",
            hasHeroAssets ? "lg:col-span-7 lg:order-1 hidden lg:flex" : "lg:col-span-12 items-center text-center lg:pl-0"
          )}>
            {/* Subtle background mesh purely for text legibility and aesthetic */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-muted/50 via-transparent to-transparent pointer-events-none" />

            <div className={cn("relative z-30 lg:mr-0", !hasHeroAssets && "max-w-3xl")}>
              <motion.p
                className="text-[9px] font-black uppercase tracking-[0.6em] text-muted-foreground/60 mb-4"
                {...fadeUp(0)}
              >
                City Pulse
              </motion.p>

              {/* Tagline */}
              <motion.h1
                className="font-display font-black leading-[0.85] tracking-tighter text-[clamp(2.8rem,8vw,5.5rem)] mb-6"
                {...fadeUp(0.05)}
              >
                Catch the<br /> <span>City Pulse</span>.
              </motion.h1>

              <motion.p
                className={cn(
                  "text-muted-foreground text-base md:text-lg leading-relaxed mb-8 max-w-md md:max-w-lg",
                  !hasHeroAssets && "mx-auto"
                )}
                {...fadeUp(0.1)}
              >
                Incredible Shows, Trending Venues & People, Unique Stores, Sports & Adventure
                <br /><br />
                Discover what's happening around you with City Pulse.
              </motion.p>

              {/* Search bar */}
              <motion.form onSubmit={handleSearch} {...fadeUp(0.14)} className="mb-8">
                <div className={cn(
                  "flex flex-col sm:flex-row items-stretch gap-1.5 p-1.5 bg-card border border-border/50 rounded-2xl max-w-md",
                  !hasHeroAssets && "mx-auto"
                )}>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                    <Input
                      type="text"
                      placeholder="Best events in the city, instantly"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 pl-9 bg-transparent border-none focus-visible:ring-0 text-sm"
                    />
                  </div>
                  <Button
                    variant="default"
                    type="submit"
                    className="h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[9px] shrink-0"
                  >
                    Search
                  </Button>
                </div>
              </motion.form>

              {/* CTAs */}
              <motion.div className={cn("flex items-center gap-4 mb-7", !hasHeroAssets && "justify-center")} {...fadeUp(0.18)}>
                <Link to="/events">
                  <Button variant="default" className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px]">
                    Browse Events <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </Link>
                <Link to="/local-stores">
                  <Button variant="default" className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] bg-neon-lime text-black hover:bg-[#D4FF00] hover:shadow-[0_8px_24px_rgba(180,255,0,0.4)] transition-all gap-2">
                    <Store className="h-4 w-4" />
                    Unique Stores
                  </Button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                {...fadeUp(0.22)}
                className={cn(
                  "hidden sm:flex items-center gap-5 pt-5 border-t border-border/20",
                  !hasHeroAssets && "justify-center"
                )}
              >
                {[
                  { icon: CalendarDays, value: "10K+", label: "Events" },
                  { icon: Users, value: "500K+", label: "Attendees" },
                  { icon: Globe, value: "200+", label: "Cities" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <s.icon className="h-3 w-3 text-muted-foreground/35" />
                    <span className="text-sm font-black">{s.value}</span>
                    <span className="text-[11px] text-muted-foreground">{s.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
        {/* ═══ UPCOMING EVENTS STRIP ═══ */}
        <section className="border-t border-border/20 py-8">
          <div className="container mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-neon-pink animate-pulse" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em]">Upcoming</h2>
            </div>

            <div className="hidden md:flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              {DATE_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setDateFilter(f.id)}
                  className={cn(
                    "whitespace-nowrap px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-150 shrink-0",
                    dateFilter === f.id
                      ? "bg-neon-lime text-black"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <Link
              to="/events"
              className="hidden md:flex text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground items-center gap-1 transition-colors group shrink-0"
            >
              View All <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <div className="container">
              <div className="flex gap-3 overflow-hidden">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-80">
                    <div className="aspect-[4/5] rounded-xl bg-muted animate-pulse" />
                    <div className="mt-3 space-y-2">
                      <div className="h-2 w-20 rounded bg-muted animate-pulse" />
                      <div className="h-3.5 w-36 rounded bg-muted animate-pulse" />
                      <div className="h-2 w-28 rounded bg-muted animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredEvents?.length > 0 ? (
            <>
              {/* Mobile snap carousel */}
              <div className="md:hidden">
                <MobileEventCarousel events={filteredEvents} />
              </div>
              {/* Desktop marquee */}
              <div className="hidden md:block container overflow-hidden">
                <MarqueeCarousel
                  events={filteredEvents}
                />
              </div>
            </>
          ) : (
            <div className="container flex items-center justify-center py-16">
              <div className="text-center space-y-3 border border-dashed border-border rounded-xl px-12 py-8">
                <CalendarDays className="h-8 w-8 text-muted-foreground/25 mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                  No events for this period
                </p>
              </div>
            </div>
          )}
        </section>



        {/* ═══ TRENDING VENUES ═══ */}
        <TrendingVenues />

        {/* ═══ GO LOCAL ═══ */}
        <GoLocalSection />

        {/* ═══ ORGANIZER CTA ═══ */}
        <section className="py-12 border-t border-border/20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-border/40 overflow-hidden"
            >
              {/* Customer Steps */}
              <div className="bg-background py-16 md:py-24 text-center px-6">
                <div className="max-w-2xl mx-auto mb-12">
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground mb-3 leading-tight">
                    We Help you to{" "}
                    <span className="text-neon-lime">catch the City Pulse</span>
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Discover events, book your spot, create memories
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
                  {[
                    { icon: Search, title: "Discover Events", accent: "you like", desc: "Find the absolute best concerts, secret parties, and local workshops happening right around you." },
                    { icon: Ticket, title: "Book Your", accent: "Spot", desc: "Purchase tickets instantly with secure one-tap checkout. No booking fees, no complications." },
                    { icon: Camera, title: "Get Memories", accent: "& Friends", desc: "Attend events, share vibes with awesome folks, and bring home epic memories that last forever." },
                  ].map(({ icon: Icon, title, accent, desc }, i) => (
                    <motion.div
                      key={title}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.12 }}
                      className="flex flex-col items-center"
                    >
                      <div className="h-14 w-14 rounded-full border-2 border-neon-lime flex items-center justify-center text-neon-lime mb-5 shrink-0">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-foreground mb-2">
                        {title} <span className="text-neon-lime">{accent}</span>
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">{desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* For Creators & Organizers */}
              <div className="bg-muted/30 border-t border-border/20 py-16 text-center px-6">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground mb-3">
                  For Creators & Organizers
                </p>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-6 leading-tight">
                  The City{" "}
                  <span className="text-neon-lime">Experience</span>
                </h2>

                <div className="max-w-3xl mx-auto space-y-4 mb-8">
                  <h3 className="text-lg md:text-xl font-black text-foreground leading-tight">
                    List Your Events, Venues, Stores / Artists, Adventure Camps, and Sports Activities
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base italic">
                    Less than 2 minutes to go live and maximize your impact
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link to="/list-your-event">
                    <Button className="h-12 px-10 bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-widest text-[11px] rounded-xl">
                      <Megaphone className="h-4 w-4 mr-2" />
                      List Your Event
                    </Button>
                  </Link>
                  <Link to="/list-your-event">
                    <Button variant="outline" className="h-12 px-10 font-black uppercase tracking-widest text-[11px] rounded-xl border-border/60">
                      Learn More
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
