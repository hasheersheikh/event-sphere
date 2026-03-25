import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Globe,
  Zap,
  ShieldCheck,
  TrendingUp,
  Music,
  Camera,
  Cpu,
  Search,
  MapPin,
  Stars,
} from "lucide-react";
import EventCard from "@/components/events/EventCard";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Event } from "@/types/event";
import { useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import SafeImage from "@/components/ui/SafeImage";
import GoLocalSection from "@/components/home/GoLocalSection";

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect theme on mount and when it changes
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yText = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const yBg = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const { data: trendingEvents, isLoading: isTrendingLoading } = useQuery({
    queryKey: ["trendingEvents"],
    queryFn: async () => {
      const { data } = await api.get("/events?limit=4&sort=-createdAt");
      return data;
    },
  });

  const categories = [
    {
      label: "Concerts",
      icon: Music,
      color: "text-blue-600",
      image: "/assets/images/category_concert_stage_1772894563661.png",
    },
    {
      label: "Art Shows",
      icon: Camera,
      color: "text-orange-600",
      image: "/assets/images/category_art_modern_1772894580509.png",
    },
    {
      label: "Tech Talks",
      icon: Cpu,
      color: "text-purple-600",
      image: "/assets/images/category_tech_visionary_1772894596927.png",
    },
    {
      label: "Meetups",
      icon: Sparkles,
      color: "text-red-600",
      image: "/assets/images/category_meetup_networking_1772894613805.png",
    },
  ];

  const moments = [
    "/assets/images/category_concert_stage_1772894563661.png",
    "/assets/images/category_art_modern_1772894580509.png",
    "/assets/images/category_tech_visionary_1772894596927.png",
    "/assets/images/category_meetup_networking_1772894613805.png",
    "/assets/images/hero_concert_energy_1772894546288.png",
    "/assets/images/cta_production_hq_1772894634095.png",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden relative">
      <div className="fixed inset-0 mesh-bg z-[-1]" />
      <Navbar />

      <main className="flex-1" ref={containerRef}>
        {/* Hero Section - Immersive Event Hub */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <motion.div className="absolute inset-0 z-0" style={{ y: yBg }}>
            <AnimatePresence mode="wait">
              <motion.img
                key={theme}
                src={
                  theme === "dark"
                    ? "/assets/images/hero_dark_premium.png"
                    : "/assets/images/hero_light_premium.jpg"
                }
                initial={{ opacity: 0 }}
                animate={{ opacity: theme === "dark" ? 0.7 : 0.9 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                onError={(e) => {
                  e.currentTarget.src = "/images/categories/other.jpg";
                }}
                alt="Event Hub"
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            <div
              className={`absolute inset-0 bg-gradient-to-b ${
                theme === "dark"
                  ? "from-background/60 via-background/20 to-background/95"
                  : "from-background/10 via-transparent to-background/80"
              }`}
            />
            <div
              className={`absolute inset-0 ${
                theme === "dark" ? "bg-black/40" : "bg-transparent"
              }`}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.3)_100%)]" />
          </motion.div>

          <div className="container relative z-10 text-center">
            <motion.div
              style={{ y: yText, opacity: opacityText }}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className={`inline-flex items-center gap-3 px-6 py-2 rounded-full glass-panel text-[10px] font-black uppercase tracking-[0.5em] mb-8 ${
                  theme === "dark" ? "text-emerald-400" : "text-emerald-600"
                }`}
              >
                <Sparkles className="h-3 w-3 animate-pulse" />
                Live Experiences
              </div>
              <motion.h1
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className={`text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-10 ${
                  theme === "dark"
                    ? "[text-shadow:_0_10px_30px_rgb(0_0_0_/_40%)]"
                    : "text-foreground"
                }`}
              >
                Find Your <br />
                <span className="text-gradient italic font-light">
                  Next Memory.
                </span>
              </motion.h1>
              <p
                className={`text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed ${
                  theme === "dark"
                    ? "text-white/80 font-medium"
                    : "text-foreground/80 font-semibold"
                }`}
              >
                The world's most immersive platform for concerts, festivals, and
                cultural gatherings.
              </p>

              <div className="max-w-3xl mx-auto mb-12 px-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim() || locationQuery.trim()) {
                      const params = new URLSearchParams();
                      if (searchQuery.trim()) params.append("q", searchQuery);
                      if (locationQuery.trim())
                        params.append("location", locationQuery);
                      navigate(`/events?${params.toString()}`);
                    }
                  }}
                  className="relative flex flex-col md:flex-row items-center gap-2 p-1.5 bg-background/40 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all duration-700 group"
                >
                  <div className="relative flex-1 w-full group/input">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                    <Input
                      type="text"
                      placeholder="What?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-12 md:h-14 pl-14 pr-4 bg-transparent border-none focus-visible:ring-0 text-base font-medium"
                    />
                  </div>
                  <div className="hidden md:block w-px h-6 bg-border/30" />
                  <div className="relative flex-1 w-full group/location">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/location:text-primary transition-colors" />
                    <Input
                      type="text"
                      placeholder="Where?"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      className="h-12 md:h-14 pl-14 pr-4 bg-transparent border-none focus-visible:ring-0 text-base font-medium"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full md:w-auto h-12 md:h-14 px-8 rounded-xl font-black uppercase tracking-widest text-[9px] bg-primary text-primary-foreground hover:scale-[1.02] active:scale-95 transition-all duration-500 shadow-lg"
                  >
                    Explore
                  </Button>
                </form>
              </div>

              <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                <Link to="/events">
                  <Button className="h-14 px-10 bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg">
                    Discover Events
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button
                    variant="outline"
                    className="h-14 px-10 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-xl font-bold uppercase tracking-wider text-xs"
                  >
                    Join the Audience
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories Section - Simplified */}
        <section className="py-24 container border-t border-white/5">
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5, scale: 1.05 }}
                className="relative px-8 py-4 rounded-2xl overflow-hidden group cursor-pointer border border-border/50 glass-panel bg-muted/20 flex items-center gap-3 transition-all duration-300"
              >
                <cat.icon className={`h-5 w-5 ${cat.color}`} />
                <span className="text-xs font-black uppercase tracking-widest text-foreground">
                  {cat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </section>


        {/* Featured Pulse Stream - Improved */}
        <section className="py-24 bg-white/[0.01] relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[150px] pointer-events-none rounded-full" />
          
          <div className="container relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-20 text-center md:text-left">
              <div className="max-w-xl">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-6 leading-none">
                  Trending <br />
                  <span className="text-pulse-emerald italic">Pulses.</span>
                </h2>
                <p className="text-muted-foreground font-light text-lg tracking-wide">
                  The most vibrant gatherings currently echoing through the City Pulse network.
                </p>
              </div>
              <Link
                to="/events"
                className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-pulse-emerald hover:text-foreground transition-all duration-500 bg-pulse-emerald/5 px-8 py-5 rounded-2xl border border-pulse-emerald/20 hover:border-primary/50"
              >
                Explore Full Season
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              {isTrendingLoading ? (
                Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="h-[30rem] w-full rounded-[2.5rem] bg-muted animate-pulse border border-border"
                    />
                  ))
              ) : trendingEvents?.length > 0 ? (
                trendingEvents.map((event: Event) => (
                  <div
                    key={event?._id}
                    className="hover:scale-[1.02] transition-transform duration-500"
                  >
                    <EventCard event={event} />
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-24 text-center border border-dashed border-border bg-muted/20 flex flex-col items-center gap-6 rounded-[3rem]">
                  <Sparkles className="h-12 w-12 text-pulse-emerald/30 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground">
                    The pulse is silent. Event incoming.
                  </p>
                </div>
              )}
            </div>
</div>
        </section>

        {/* Go Local Section */}
        <GoLocalSection />

        {/* Call to Connect - Unified Landscape */}
        <section className="py-40 container relative overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className={`relative py-20 md:py-32 px-10 rounded-[3rem] overflow-hidden border group backdrop-blur-3xl shadow-2xl ${
              theme === "dark"
                ? "border-white/10 bg-zinc-950/40"
                : "border-black/5 bg-white/60"
            }`}
          >
            {/* Background Image / Mesh */}
            <div className="absolute inset-0 z-0">
               <div className={`absolute inset-0 bg-gradient-to-br transition-colors duration-1000 ${
                 theme === "dark" 
                   ? "from-pulse-emerald/10 via-transparent to-pulse-indigo/10" 
                   : "from-pulse-emerald/10 via-transparent to-pulse-indigo/10"
               }`} />
               <div className={`absolute inset-0 mesh-bg transition-opacity duration-1000 ${
                 theme === "dark" ? "opacity-20" : "opacity-40"
               }`} />
            </div>

            {/* Floating Stars (SVG) */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-10 right-10 opacity-20 pointer-events-none"
            >
              <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
                <path d="M50 0 L58 35 L100 42 L65 58 L72 100 L50 75 L28 100 L35 58 L0 42 L42 35 Z" fill="hsl(var(--primary))" />
              </svg>
            </motion.div>

            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className={`inline-flex items-center gap-2 px-6 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.5em] mb-12 shadow-sm ${
                  theme === "dark"
                    ? "bg-primary/10 border-primary/20 text-primary"
                    : "bg-primary/5 border-primary/30 text-primary"
                }`}
              >
                <Stars className="h-3 w-3 animate-pulse" />
                Next Generation Protocol
              </motion.div>

              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[0.8] mb-8">
                Start Your <br />
                <span className={`text-gradient italic font-light ${
                  theme === "dark" 
                    ? "drop-shadow-[0_0_30px_hsla(var(--primary),0.3)]" 
                    : "drop-shadow-[0_0_20px_hsla(var(--primary),0.1)]"
                }`}>Event.</span>
              </h2>
              
              <p className={`text-base md:text-lg mb-10 font-light max-w-xl mx-auto leading-relaxed italic ${
                theme === "dark" ? "text-white/60" : "text-black/50"
              }`}>
                Join thousands of organizers who use Pulse to bridge the
                connection between their vision and the fans.
              </p>
              
              <Link to="/auth">
                <Button className="h-14 px-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-black uppercase tracking-[0.3em] text-[9px] shadow-lg hover:scale-105 transition-all group overflow-hidden relative">
                  <span className="relative z-10">Register Profile</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  <ArrowRight className="h-4 w-4 ml-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; transform: scale(1.1); }
          50% { opacity: 0.8; transform: scale(1.15); }
        }
        @keyframes marquee-fast {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 15s ease-in-out infinite;
        }
        .animate-marquee-fast {
          animation: marquee-fast 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Index;
