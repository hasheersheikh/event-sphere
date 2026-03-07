import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import EventCard from "@/components/events/EventCard";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Event } from "@/types/event";

const Index = () => {
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

      <main className="flex-1">
        {/* Hero Section - Immersive Event Hub */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/images/hero_concert_energy_1772894546288.png"
              alt="Concert Crowd"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/90" />
            <div className="absolute inset-0 bg-black/10 dark:bg-transparent" />{" "}
            {/* Subtle darkening for light theme text */}
          </div>

          <div className="container relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass-panel text-[10px] font-black uppercase tracking-[0.4em] mb-12 text-emerald-400">
                <Sparkles className="h-3 w-3" />
                Now Streaming Experiences
              </div>
              <h1 className="text-6xl md:text-[8.5rem] font-medium tracking-tighter leading-[0.85] mb-10 drop-shadow-2xl">
                Find Your <br />
                <span className="text-gradient italic font-light">
                  Next Memory.
                </span>
              </h1>
              <p className="text-lg md:text-2xl text-foreground/80 dark:text-muted-foreground max-w-2xl mx-auto mb-14 leading-relaxed font-light">
                The world's most immersive platform for concerts, festivals, and
                cultural gatherings. Synced to your pulse.
              </p>
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

        {/* Categories Section - Improved with Backgrounds */}
        <section className="py-32 container border-t border-white/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer border border-border shadow-md"
              >
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <span className="text-sm font-bold uppercase tracking-widest text-white bg-black/60 backdrop-blur-sm px-4 py-2 inline-block w-fit rounded-lg">
                    {cat.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Dynamic Highlights Section */}
        <section className="py-32 md:py-60 container">
          <div className="grid lg:grid-cols-2 gap-32 items-center">
            <div>
              <div className="h-1 w-20 bg-emerald-500 mb-10 shadow-[0_0_20px_#10B981]" />
              <h2 className="text-5xl md:text-8xl font-medium tracking-tighter leading-none mb-10">
                Built for <br />
                <span className="italic font-light text-gradient">
                  Creators.
                </span>
              </h2>
              <p className="text-2xl text-foreground/70 dark:text-muted-foreground font-light leading-relaxed mb-16">
                Pulse provides organizers with liquid analytics and precision
                tools to build unforgettable experiences. From underground shows
                to global arenas.
              </p>
              <div className="grid sm:grid-cols-2 gap-10">
                {[
                  {
                    icon: Globe,
                    label: "Global Reach",
                    color: "text-emerald-400",
                  },
                  {
                    icon: Zap,
                    label: "Live Ticketing",
                    color: "text-indigo-400",
                  },
                  {
                    icon: ShieldCheck,
                    label: "Secure Access",
                    color: "text-violet-400",
                  },
                  {
                    icon: TrendingUp,
                    label: "Fan Insights",
                    color: "text-rose-400",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-5 group">
                    <div
                      className={`h-12 w-12 rounded-2xl bg-muted border border-border flex items-center justify-center transition-all group-hover:bg-foreground group-hover:text-background`}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-violet-500/20 blur-[100px] rounded-full" />
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative z-10 glass-card p-4 aspect-square flex items-center justify-center overflow-hidden border-2 border-border"
              >
                <img
                  src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&q=80&w=2070"
                  alt="Stadium Concert"
                  className="w-full h-full object-cover rounded-[2rem] opacity-80"
                />
                <div className="absolute inset-x-8 bottom-8 p-10 glass-panel rounded-[2rem] border border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 block mb-3">
                    Precision Analytics
                  </span>
                  <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">
                    Measure the Hype
                  </h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest italic font-light">
                    Real-time Audience Feedback Flow
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Immersive Moments Section */}
        <section className="py-32 overflow-hidden border-y border-white/5 bg-white/[0.02]">
          <div className="container mb-16 flex justify-between items-end">
            <div>
              <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-2">
                Moments that <span className="text-pulse-emerald">Pulse.</span>
              </h2>
              <p className="text-muted-foreground font-light tracking-widest uppercase text-xs">
                A glimpse into the extraordinary
              </p>
            </div>
            <div className="hidden md:flex gap-4">
              <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center text-muted-foreground/20">
                <ArrowRight className="h-5 w-5 rotate-180" />
              </div>
              <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center text-pulse-emerald">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="flex animate-marquee-fast">
            {[...moments, ...moments].map((img, i) => (
              <div key={i} className="px-4 flex-shrink-0 w-80 md:w-[30rem]">
                <div className="aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative group">
                  <img
                    src={img}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Pulse Stream */}
        <section className="py-32 bg-white/[0.01]">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-24">
              <div className="max-w-xl">
                <h2 className="text-4xl md:text-6xl font-medium tracking-tighter uppercase mb-6">
                  Trending{" "}
                  <span className="text-pulse-emerald italic">Pulses.</span>
                </h2>
                <p className="text-muted-foreground font-light text-lg">
                  Curated selections from the world's most vibrant event
                  communities.
                </p>
              </div>
              <Link
                to="/events"
                className="group flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] text-pulse-emerald hover:text-foreground transition-colors"
              >
                View Entire Season
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-3" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {isTrendingLoading ? (
                Array(4)
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
                <div className="col-span-2 py-20 text-center border border-dashed border-border bg-muted flex flex-col items-center gap-4 rounded-[2rem]">
                  <Sparkles className="h-10 w-10 text-pulse-emerald/30" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    The pulse is silent. Production incoming.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Call to Connect - Unified Landscape */}
        <section className="py-40 container text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative py-32 md:py-64 px-10 rounded-3xl overflow-hidden group"
          >
            <div className="absolute inset-0 z-0">
              <img
                src="/assets/images/cta_production_hq_1772894634095.png"
                className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-pulse-emerald/20 to-pulse-indigo/20 backdrop-blur-[100px] border border-border/50" />
              <div className="absolute inset-0 bg-black/5 dark:bg-transparent" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-medium tracking-tighter leading-none mb-12">
                Start Your <br />
                <span className="text-gradient italic">Production.</span>
              </h2>
              <p className="text-foreground/80 dark:text-muted-foreground text-xl md:text-2xl mb-16 font-light max-w-2xl mx-auto leading-relaxed">
                Join thousands of organizers who use Pulse to bridge the
                connection between their vision and the fans.
              </p>
              <Link to="/auth">
                <Button className="h-16 px-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold uppercase tracking-widest text-sm shadow-xl transition-all">
                  Register Profile
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />

      <style>{`
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
