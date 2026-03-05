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

const Index = () => {
  // Mock events for the new fluid UI
  const featuredEvents = [
    {
      _id: "1",
      title: "Solstice Music Festival 2024",
      date: "2024-06-21",
      location: { address: "Central Park, New York" },
      ticketTypes: [
        { price: 8500, name: "General Admission", capacity: 1000, sold: 200 },
      ],
      image:
        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=2070",
      category: "Music",
      creator: { name: "Pulse Events" },
    },
    {
      _id: "2",
      title: "Visionary Art Expo",
      date: "2024-07-15",
      location: { address: "Grand Gallery, London" },
      ticketTypes: [
        { price: 2500, name: "Student Pass", capacity: 500, sold: 100 },
      ],
      image:
        "https://images.unsplash.com/photo-1540575861501-7ad05823c91b?auto=format&fit=crop&q=80&w=2070",
      category: "Art",
      creator: { name: "Art Pulse" },
    },
  ];

  const categories = [
    {
      label: "Concerts",
      icon: Music,
      color: "text-emerald-400",
      image:
        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800",
    },
    {
      label: "Art Shows",
      icon: Camera,
      color: "text-indigo-400",
      image:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800",
    },
    {
      label: "Tech Talks",
      icon: Cpu,
      color: "text-violet-400",
      image:
        "https://images.unsplash.com/photo-1505373633560-fa26f63fbc1e?auto=format&fit=crop&q=80&w=800",
    },
    {
      label: "Meetups",
      icon: Sparkles,
      color: "text-rose-400",
      image:
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800",
    },
  ];

  const moments = [
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1514525253361-bee8718a7439?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section - Immersive Event Hub */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&q=80&w=2070"
              alt="Concert Crowd"
              className="w-full h-full object-cover opacity-60 scale-110 blur-[2px] animate-pulse-slow"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#050505]" />
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
              <p className="text-lg md:text-2xl text-white/50 max-w-2xl mx-auto mb-14 leading-relaxed font-light">
                The world's most immersive platform for concerts, festivals, and
                cultural gatherings. Synced to your pulse.
              </p>
              <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                <Link to="/events">
                  <Button className="h-20 px-16 bg-white text-black hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all duration-500 rounded-full font-black uppercase tracking-[0.3em] text-xs shadow-[0_20px_50px_rgba(255,255,255,0.2)]">
                    Discover Events
                    <ArrowRight className="h-5 w-5 ml-3" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button
                    variant="outline"
                    className="h-20 px-16 border-2 border-white/10 text-white hover:bg-white/5 rounded-full font-black uppercase tracking-[0.3em] text-xs backdrop-blur-3xl"
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
                whileHover={{ y: -10 }}
                className="relative h-64 md:h-80 rounded-[2.5rem] overflow-hidden group cursor-pointer border border-white/5 shadow-2xl"
              >
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div
                    className={`h-12 w-12 rounded-2xl glass-panel flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:bg-white group-hover:text-black`}
                  >
                    <cat.icon
                      className={`h-6 w-6 ${cat.color} group-hover:text-current transition-colors`}
                    />
                  </div>
                  <span className="text-sm font-black uppercase tracking-[0.2em] text-white">
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
              <p className="text-2xl text-white/40 font-light leading-relaxed mb-16">
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
                      className={`h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover:bg-white group-hover:text-black`}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">
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
                className="relative z-10 glass-card p-4 aspect-square flex items-center justify-center overflow-hidden border-2 border-white/5"
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
                  <p className="text-xs text-white/40 uppercase tracking-widest italic font-light">
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
                Moments that <span className="text-emerald-400">Pulse.</span>
              </h2>
              <p className="text-white/40 font-light tracking-widest uppercase text-xs">
                A glimpse into the extraordinary
              </p>
            </div>
            <div className="hidden md:flex gap-4">
              <div className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center text-white/20">
                <ArrowRight className="h-5 w-5 rotate-180" />
              </div>
              <div className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center text-emerald-400">
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
                  <span className="text-emerald-400 italic">Pulses.</span>
                </h2>
                <p className="text-white/40 font-light text-lg">
                  Curated selections from the world's most vibrant event
                  communities.
                </p>
              </div>
              <Link
                to="/events"
                className="group flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] text-emerald-400 hover:text-white transition-colors"
              >
                View Entire Season
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-3" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {featuredEvents.map((event) => (
                <div
                  key={event._id}
                  className="hover:scale-[1.02] transition-transform duration-500"
                >
                  <EventCard event={event as any} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Connect - Unified Landscape */}
        <section className="py-40 container text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative py-32 md:py-64 px-10 rounded-[6rem] overflow-hidden group"
          >
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2070"
                className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-[20s]"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-violet-500/20 backdrop-blur-[100px] border border-white/5" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
              <h2 className="text-6xl md:text-9xl font-medium tracking-tighter leading-none mb-12">
                Start Your <br />
                <span className="text-gradient italic">Production.</span>
              </h2>
              <p className="text-white/50 text-xl md:text-2xl mb-16 font-light max-w-2xl mx-auto leading-relaxed">
                Join thousands of organizers who use Pulse to bridge the
                connection between their vision and the fans.
              </p>
              <Link to="/auth">
                <Button className="h-24 px-24 bg-white text-black hover:bg-emerald-500 hover:text-black rounded-full font-black uppercase tracking-[0.4em] text-sm shadow-[0_30px_60px_rgba(255,255,255,0.1)] transition-all duration-500 hover:scale-110 active:scale-95">
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
